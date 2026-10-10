begin;
-- Only new committed order events are queued. No historical-email backfill.
create schema if not exists seedly_notifications;
revoke all on schema seedly_notifications from public, anon, authenticated;
grant usage on schema seedly_notifications to service_role;

create table seedly_notifications.email_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null check (event_type in ('ORDER_CREATED','PAYMENT_CONFIRMED','PAYMENT_REJECTED','ORDER_SHIPPED','ORDER_DELIVERED')),
  order_id text not null references public.orders(id),
  payload jsonb not null,
  message jsonb,
  status text not null default 'PENDING' check (status in ('PENDING','PROCESSING','RETRY','ACCEPTED','FAILED','UNKNOWN')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  claim_token uuid,
  lease_until timestamptz,
  first_attempt_at timestamptz,
  provider_id text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table seedly_notifications.email_outbox enable row level security;
revoke all on seedly_notifications.email_outbox from public, anon, authenticated;
grant select, insert, update on seedly_notifications.email_outbox to service_role;
create index email_outbox_due_idx on seedly_notifications.email_outbox(available_at,created_at) where status in ('PENDING','RETRY');
create index email_outbox_lease_idx on seedly_notifications.email_outbox(lease_until) where status = 'PROCESSING';
create index email_outbox_order_idx on seedly_notifications.email_outbox(order_id);

create function seedly_notifications.queue_order_email() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  event_name text;
  snapshot jsonb;
begin
  snapshot := to_jsonb(new) - array['customer_phone','shipping_notes','notes','admin_note','receipt_path','idempotency_key','request_fingerprint','tracking_token_hash','user_id'];
  if tg_op = 'INSERT' then
    event_name := 'ORDER_CREATED';
    insert into seedly_notifications.email_outbox(event_key,event_type,order_id,payload)
      values (event_name || '/' || new.id,event_name,new.id,snapshot) on conflict(event_key) do nothing;
    return new;
  end if;
  if new.payment_method <> 'COD' and new.payment_status is distinct from old.payment_status then
    event_name := case when new.payment_status in ('VERIFIED','PAID') then 'PAYMENT_CONFIRMED' when new.payment_status = 'REJECTED' then 'PAYMENT_REJECTED' end;
    if event_name is not null then
      insert into seedly_notifications.email_outbox(event_key,event_type,order_id,payload)
        values (event_name || '/' || new.id,event_name,new.id,snapshot) on conflict(event_key) do nothing;
    end if;
  end if;
  if new.order_status is distinct from old.order_status then
    event_name := case when new.order_status = 'SHIPPED' then 'ORDER_SHIPPED' when new.order_status = 'DELIVERED' then 'ORDER_DELIVERED' end;
    if event_name is not null then
      insert into seedly_notifications.email_outbox(event_key,event_type,order_id,payload)
        values (event_name || '/' || new.id,event_name,new.id,snapshot) on conflict(event_key) do nothing;
    end if;
  end if;
  return new;
end $$;
revoke all on function seedly_notifications.queue_order_email() from public, anon, authenticated;
grant execute on function seedly_notifications.queue_order_email() to service_role;
create trigger seedly_queue_order_email after insert or update of payment_status,order_status on public.orders
  for each row execute function seedly_notifications.queue_order_email();

create function public.claim_order_emails(p_limit integer default 3) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  if p_limit is null or p_limit < 1 or p_limit > 5 then raise exception 'Invalid batch size' using errcode = '22023'; end if;
  -- Resend remembers keys for 24 hours. Never automatically resend an uncertain
  -- attempt beyond the conservative 23-hour window.
  update seedly_notifications.email_outbox set status='UNKNOWN',error_code='IDEMPOTENCY_WINDOW_EXPIRED',claim_token=null,lease_until=null,updated_at=now()
    where first_attempt_at < now()-interval '23 hours'
      and (status in ('PENDING','RETRY') or (status='PROCESSING' and lease_until < now()));
  with due as (
    select id from seedly_notifications.email_outbox
    where ((status in ('PENDING','RETRY') and available_at<=now()) or (status='PROCESSING' and lease_until<now()))
    order by created_at,id for update skip locked limit p_limit
  ), claimed as (
    update seedly_notifications.email_outbox j set status='PROCESSING',claim_token=gen_random_uuid(),lease_until=now()+interval '5 minutes',attempts=attempts+1,updated_at=now()
    from due where j.id=due.id returning j.*
  ) select coalesce(jsonb_agg(to_jsonb(claimed)),'[]'::jsonb) into result from claimed;
  return result;
end $$;

create function public.prepare_order_email(p_id uuid,p_claim_token uuid,p_message jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare job seedly_notifications.email_outbox%rowtype;
begin
  select * into job from seedly_notifications.email_outbox where id=p_id and claim_token=p_claim_token and status='PROCESSING' for update;
  if not found then return null; end if;
  if job.message is null then
    if jsonb_typeof(p_message)<>'object' or p_message is null
      or length(coalesce(p_message->>'to','')) not between 3 and 300
      or length(coalesce(p_message->>'from','')) not between 3 and 300
      or length(coalesce(p_message->>'replyTo','')) not between 3 and 300
      or length(coalesce(p_message->>'subject','')) not between 1 and 300
      or length(coalesce(p_message->>'html','')) not between 1 and 300000
      or length(coalesce(p_message->>'text','')) not between 1 and 100000 then
      raise exception 'Invalid email message' using errcode='22023';
    end if;
    update seedly_notifications.email_outbox set message=p_message,first_attempt_at=now(),updated_at=now() where id=p_id returning * into job;
  end if;
  return to_jsonb(job);
end $$;

create function public.finish_order_email(p_id uuid,p_claim_token uuid,p_status text,p_provider_id text default null,p_error_code text default null) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare job seedly_notifications.email_outbox%rowtype; next_status text;
begin
  if p_status is null or p_status not in ('ACCEPTED','RETRY','FAILED','UNKNOWN') then raise exception 'Invalid delivery state' using errcode='22023'; end if;
  if p_status='ACCEPTED' and (p_provider_id is null or length(p_provider_id) not between 1 and 200) then raise exception 'Provider ID required' using errcode='22023'; end if;
  if p_error_code is not null and p_error_code !~ '^[A-Z0-9_]{1,100}$' then raise exception 'Invalid error code' using errcode='22023'; end if;
  select * into job from seedly_notifications.email_outbox where id=p_id and claim_token=p_claim_token and status='PROCESSING' for update;
  if not found then return false; end if;
  next_status := case when p_status='RETRY' and (job.attempts>=20 or job.first_attempt_at<now()-interval '23 hours') then 'UNKNOWN' else p_status end;
  update seedly_notifications.email_outbox set status=next_status,provider_id=p_provider_id,error_code=p_error_code,claim_token=null,lease_until=null,updated_at=now(),
    available_at=case when next_status='RETRY' then now()+make_interval(secs => least(3600,60*power(2,least(job.attempts-1,6)))::integer) else available_at end where id=p_id;
  return true;
end $$;

revoke all on function public.claim_order_emails(integer) from public, anon, authenticated;
revoke all on function public.prepare_order_email(uuid,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.finish_order_email(uuid,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.claim_order_emails(integer) to service_role;
grant execute on function public.prepare_order_email(uuid,uuid,jsonb) to service_role;
grant execute on function public.finish_order_email(uuid,uuid,text,text,text) to service_role;

notify pgrst,'reload schema';
commit;
