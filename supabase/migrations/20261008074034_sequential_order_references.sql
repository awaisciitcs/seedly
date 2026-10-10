begin;
set local lock_timeout = '5s';

-- Server-only reservation state. No customer data or raw checkout keys are stored.
create schema if not exists seedly_checkout;
revoke all on schema seedly_checkout from public, anon, authenticated;
grant usage on schema seedly_checkout to service_role;

create sequence if not exists seedly_checkout.order_reference_seq
  as bigint start with 100200 increment by 1 minvalue 100200
  maxvalue 999999999999 no cycle cache 1;
revoke all on sequence seedly_checkout.order_reference_seq from public, anon, authenticated;
grant usage, select on sequence seedly_checkout.order_reference_seq to service_role;

create table if not exists seedly_checkout.order_references (
  checkout_reference text primary key check (checkout_reference ~ '^SED-[0-9A-F]{24}$'),
  request_fingerprint text not null check (request_fingerprint ~ '^[0-9a-f]{64}$'),
  order_number text not null unique
    default ('SED-' || nextval('seedly_checkout.order_reference_seq'::regclass)::text)
    check (order_number ~ '^SED-[0-9]{6,12}$'),
  created_at timestamptz not null default now()
);
alter table seedly_checkout.order_references enable row level security;
revoke all on table seedly_checkout.order_references from public, anon, authenticated;
grant select, insert on table seedly_checkout.order_references to service_role;

-- Installation/reruns never lower the counter or alter an existing order.
lock table public.orders in share row exclusive mode;
lock table seedly_checkout.order_references in share row exclusive mode;
do $$
declare
  highest_existing bigint;
  last_reserved bigint;
  counter_called boolean;
  counter_target bigint;
begin
  select max(number) into highest_existing from (
    select substring(order_number from 5)::bigint as number
      from public.orders where order_number ~ '^SED-[0-9]{6,12}$'
    union all
    select substring(order_number from 5)::bigint
      from seedly_checkout.order_references
  ) existing_numbers;
  select last_value, is_called into last_reserved, counter_called
    from seedly_checkout.order_reference_seq;
  counter_target := greatest(100200, coalesce(highest_existing, 0), last_reserved);
  perform setval('seedly_checkout.order_reference_seq'::regclass, counter_target,
    counter_called or coalesce(highest_existing >= counter_target, false));
end $$;

create or replace function public.find_checkout_order_reference(
  p_checkout_reference text, p_request_fingerprint text
) returns text
language plpgsql security invoker set search_path = ''
as $$
declare
  reservation seedly_checkout.order_references%rowtype;
begin
  if p_checkout_reference is null or p_checkout_reference !~ '^SED-[0-9A-F]{24}$'
    or p_request_fingerprint is null or p_request_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid checkout identity' using errcode = '22023';
  end if;
  select * into reservation from seedly_checkout.order_references
    where checkout_reference = p_checkout_reference;
  if not found then return null; end if;
  if reservation.request_fingerprint <> p_request_fingerprint then
    raise exception 'Checkout request changed' using errcode = 'P0001';
  end if;
  return reservation.order_number;
end $$;

create or replace function public.allocate_checkout_order_reference(
  p_checkout_reference text, p_request_fingerprint text
) returns text
language plpgsql security invoker set search_path = ''
as $$
declare
  assigned_number text;
begin
  if p_checkout_reference is null or p_checkout_reference !~ '^SED-[0-9A-F]{24}$'
    or p_request_fingerprint is null or p_request_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid checkout identity' using errcode = '22023';
  end if;
  -- Serialize only requests for the same private checkout identity.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_checkout_reference, 0));
  assigned_number := public.find_checkout_order_reference(p_checkout_reference, p_request_fingerprint);
  if assigned_number is not null then return assigned_number; end if;
  insert into seedly_checkout.order_references(checkout_reference, request_fingerprint)
    values (p_checkout_reference, p_request_fingerprint)
    returning order_number into assigned_number;
  return assigned_number;
end $$;

revoke all on function public.find_checkout_order_reference(text,text) from public, anon, authenticated;
revoke all on function public.allocate_checkout_order_reference(text,text) from public, anon, authenticated;
grant execute on function public.find_checkout_order_reference(text,text) to service_role;
grant execute on function public.allocate_checkout_order_reference(text,text) to service_role;
-- Creation remains server-only. Capability-protected tracking is maintained by
-- the preceding commerce hardening migration; do not break existing private links.
-- Discover exact installed signatures rather than guessing their argument types.
do $$
declare protected_function regprocedure;
begin
  for protected_function in
    select p.oid::regprocedure from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname in ('create_order_transactional','create_order_secure_transactional')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', protected_function);
    execute format('grant execute on function %s to service_role', protected_function);
  end loop;
end $$;

notify pgrst, 'reload schema';
commit;
