begin;
set local lock_timeout = '5s';

-- Sensitive commerce tables are read-only to browser sessions. All state changes
-- run through the tightly guarded transactional functions below.
revoke insert, update, delete, truncate, references, trigger on
  public.orders, public.order_items, public.order_events, public.order_stock_reservations
  from public, anon, authenticated;

do $$
declare pol record;
begin
  for pol in select tablename,policyname from pg_policies where schemaname='public'
    and tablename in ('orders','order_items','order_events','order_stock_reservations')
  loop execute format('drop policy %I on public.%I',pol.policyname,pol.tablename); end loop;
  for pol in select name from unnest(array['orders','order_items','order_events','order_stock_reservations']) name
  loop execute format('create policy "Active admins can read commerce" on public.%I for select to authenticated using ((select public.is_admin()))',pol.name); end loop;
end $$;

-- Definer is necessary once direct table writes are revoked. Both functions
-- already recheck active auth.uid() membership, status/payment rules, actor,
-- tracking and exact reservations inside each transaction, with an empty path.
do $$
declare f regprocedure;
begin
  for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('update_order_fulfillment_transactional','update_order_payment_transactional')
  loop
    execute format('alter function %s security definer',f);
    execute format('revoke all on function %s from public, anon',f);
    execute format('grant execute on function %s to authenticated, service_role',f);
  end loop;
end $$;

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Owners can manage site settings" on public.site_settings for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

notify pgrst, 'reload schema';
commit;
