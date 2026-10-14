-- Additive only: existing orders, products, settings and content are not rewritten.
create table public.coupons (
 id uuid primary key default gen_random_uuid(),
 code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'),
 description text not null default '' check (length(description)<=300),
 discount_type text not null check (discount_type in ('percentage','fixed')),
 discount_value integer not null check (discount_value>0 and discount_value<=2000000000),
 minimum_subtotal_minor integer not null default 0 check (minimum_subtotal_minor>=0),
 maximum_discount_minor integer check (maximum_discount_minor>0),
 starts_at timestamptz,
 expires_at timestamptz,
 usage_limit integer check (usage_limit>0),
 per_customer_limit integer check (per_customer_limit>0),
 is_active boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (discount_type<>'percentage' or discount_value<=100),
 check (starts_at is null or expires_at is null or starts_at<expires_at)
);
create table public.coupon_redemptions (
 id uuid primary key default gen_random_uuid(),
 coupon_id uuid not null references public.coupons(id) on delete restrict,
 order_id text not null unique references public.orders(id) on delete restrict,
 customer_email text not null check (customer_email=lower(btrim(customer_email))),
 discount_minor integer not null check (discount_minor>0),
 created_at timestamptz not null default now()
);
create index coupon_redemptions_coupon_email_idx on public.coupon_redemptions(coupon_id,customer_email);
alter table public.orders add column coupon_code text;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
revoke all on public.coupons,public.coupon_redemptions from public,anon,authenticated;
grant select,insert,update on public.coupons to authenticated;
grant select on public.coupon_redemptions to authenticated;
grant select,insert,update on public.coupons,public.coupon_redemptions to service_role;
create policy coupons_admin_read on public.coupons for select to authenticated using ((select public.is_admin()));
create policy coupons_owner_insert on public.coupons for insert to authenticated with check ((select public.is_owner()));
create policy coupons_owner_update on public.coupons for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy coupon_redemptions_admin_read on public.coupon_redemptions for select to authenticated using ((select public.is_admin()));

create function public.coupon_updated_at() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.code is distinct from old.code then raise exception 'Coupon codes cannot be renamed; pause this code and create another' using errcode='22023'; end if;
 new.updated_at:=clock_timestamp(); return new;
end;
$$;
revoke all on function public.coupon_updated_at() from public,anon,authenticated;
create trigger coupon_updated_at before update on public.coupons for each row execute function public.coupon_updated_at();
create view public.admin_coupons with (security_invoker=true) as
 select c.*, (select count(*)::integer from public.coupon_redemptions r where r.coupon_id=c.id) as used_count from public.coupons c;
revoke all on public.admin_coupons from public,anon;
grant select on public.admin_coupons to authenticated,service_role;

-- Run under the private server role, retaining the existing stock reservation and idempotency transaction.
create function public.create_order_with_coupon_transactional(
 p_order_id text,p_order_number text,p_customer_name text,p_customer_email text,p_customer_phone text,
 p_shipping_address text,p_shipping_city text,p_shipping_province text,p_shipping_postal_code text,p_shipping_notes text,
 p_payment_method text,p_receipt_path text,p_idempotency_key text,p_request_fingerprint text,p_tracking_token_hash text,
 p_items jsonb,p_expected_quote jsonb,p_coupon_code text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 v_result jsonb; v_base_quote jsonb; v_coupon public.coupons%rowtype; v_discount bigint; v_used integer; v_order_id text;
begin
 if coalesce(p_coupon_code,'') !~ '^[A-Z0-9][A-Z0-9_-]{2,31}$' or coalesce((p_expected_quote->>'discount_minor')::bigint,0)<=0 then
  raise exception 'Invalid coupon quote' using errcode='22023';
 end if;
 v_base_quote:=p_expected_quote || jsonb_build_object('total_minor',(p_expected_quote->>'total_minor')::bigint+(p_expected_quote->>'discount_minor')::bigint);
 v_result:=public.create_order_secure_transactional(p_order_id,p_order_number,p_customer_name,p_customer_email,p_customer_phone,p_shipping_address,p_shipping_city,p_shipping_province,p_shipping_postal_code,p_shipping_notes,p_payment_method,p_receipt_path,p_idempotency_key,p_request_fingerprint,p_tracking_token_hash,p_items,v_base_quote);
 if coalesce((v_result->>'is_idempotent_replay')::boolean,false) then
  return v_result || (select jsonb_build_object('total_minor',o.total_minor,'discount_minor',o.discount_minor,'coupon_code',o.coupon_code) from public.orders o where o.id=v_result->>'order_id');
 end if;
 -- Every redemption locks the same coupon row before checking counts, preventing oversubscribed limits.
 select * into v_coupon from public.coupons where code=p_coupon_code for update;
 if not found or not v_coupon.is_active or v_coupon.starts_at>clock_timestamp() or v_coupon.expires_at<=clock_timestamp() then
  raise exception 'Coupon is unavailable or expired' using errcode='P0010';
 end if;
 if v_coupon.updated_at is distinct from (p_expected_quote->>'coupon_version')::timestamptz or v_coupon.id::text is distinct from p_expected_quote->>'coupon_id' then
  raise exception 'Coupon changed; review a fresh quote' using errcode='P0010';
 end if;
 if (v_result->>'subtotal_minor')::bigint<v_coupon.minimum_subtotal_minor then raise exception 'Coupon minimum spend is not met' using errcode='P0010'; end if;
 select count(*) into v_used from public.coupon_redemptions where coupon_id=v_coupon.id;
 if v_coupon.usage_limit is not null and v_used>=v_coupon.usage_limit then raise exception 'Coupon limit reached' using errcode='P0010'; end if;
 if v_coupon.per_customer_limit is not null and (select count(*) from public.coupon_redemptions where coupon_id=v_coupon.id and customer_email=lower(btrim(p_customer_email)))>=v_coupon.per_customer_limit then
  raise exception 'Coupon already used by this email' using errcode='P0010';
 end if;
 v_discount:=case when v_coupon.discount_type='percentage' then floor((v_result->>'subtotal_minor')::numeric*v_coupon.discount_value/100)::bigint else v_coupon.discount_value::bigint end;
 v_discount:=least(v_discount,(v_result->>'subtotal_minor')::bigint,coalesce(v_coupon.maximum_discount_minor::bigint,v_discount));
 if v_discount<=0 or v_discount is distinct from (p_expected_quote->>'discount_minor')::bigint then raise exception 'Coupon discount changed' using errcode='P0010'; end if;
 v_order_id:=v_result->>'order_id';
 update public.orders set discount_minor=v_discount,total_minor=total_minor-v_discount,coupon_code=v_coupon.code where id=v_order_id;
 -- The insertion trigger queued the original order; freeze the final discounted totals in the same transaction.
 update seedly_notifications.email_outbox set payload=payload || jsonb_build_object('discount_minor',v_discount,'total_minor',(v_result->>'total_minor')::bigint-v_discount,'coupon_code',v_coupon.code)
 where order_id=v_order_id and event_type='ORDER_CREATED' and status='PENDING';
 insert into public.coupon_redemptions(coupon_id,order_id,customer_email,discount_minor) values(v_coupon.id,v_order_id,lower(btrim(p_customer_email)),v_discount);
 return v_result || jsonb_build_object('total_minor',(v_result->>'total_minor')::bigint-v_discount,'discount_minor',v_discount,'coupon_code',v_coupon.code);
end;
$$;
revoke all on function public.create_order_with_coupon_transactional(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.create_order_with_coupon_transactional(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,jsonb,text) to service_role;
