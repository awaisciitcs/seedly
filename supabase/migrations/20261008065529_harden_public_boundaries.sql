begin;
set local lock_timeout = '5s';
-- Catalog reads stay public; mutations require an active explicitly linked admin.
alter policy "Allow insert product images" on storage.objects to authenticated with check (bucket_id = 'product-images' and (select public.is_admin()));
alter policy "Allow update product images" on storage.objects to authenticated using (bucket_id = 'product-images' and (select public.is_admin())) with check (bucket_id = 'product-images' and (select public.is_admin()));
alter policy "Allow delete product images" on storage.objects to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
-- Receipts are uploaded through the server after quote/ownership validation.
drop policy if exists "Public can upload receipts" on storage.objects;
update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'] where id = 'product-images';
alter policy "Public can submit pending reviews" on public.reviews with check (
  status = 'PENDING' and is_demo = false and verified_purchase = false
  and rating between 1 and 5 and char_length(btrim(customer_name)) between 2 and 100
  and char_length(btrim(title)) between 1 and 160 and char_length(btrim(body)) between 10 and 4000
  and ((product_id is not null and kit_id is null and exists(select 1 from public.products p where p.id = product_id and p.status = 'ACTIVE'))
    or (kit_id is not null and product_id is null and exists(select 1 from public.kits k where k.id = kit_id and k.status = 'ACTIVE')))
);
alter function public.update_updated_at_column() set search_path = '';
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
-- Restrict administrative policies to signed-in callers, then remove anonymous helper access.
do $$
declare r record;
begin
 for r in select schemaname,tablename,policyname from pg_policies where schemaname in ('public','storage') and ((coalesce(qual,'') || coalesce(with_check,'')) ~ 'is_admin\(|is_owner\(') and roles = array['public']::name[] loop
   execute format('alter policy %I on %I.%I to authenticated',r.policyname,r.schemaname,r.tablename);
 end loop;
end;
$$;
alter policy "Admins can view their own profile" on public.admin_users to authenticated using (auth_user_id = (select auth.uid()));
revoke execute on function public.is_admin(), public.is_owner() from public, anon;
grant execute on function public.is_admin(), public.is_owner() to authenticated, service_role;
create index if not exists idx_kit_items_product on public.kit_items(product_id);
create index if not exists idx_kit_items_variant on public.kit_items(variant_id);
create index if not exists idx_kits_category on public.kits(category_id);
create index if not exists idx_order_items_kit on public.order_items(kit_id);
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_order_items_variant on public.order_items(variant_id);
create index if not exists idx_stock_deliveries_subscription on public.stock_alert_deliveries(subscription_id);
create index if not exists idx_stock_subscriptions_kit on public.stock_alert_subscriptions(kit_id);
create index if not exists idx_stock_subscriptions_variant on public.stock_alert_subscriptions(product_variant_id);
create index if not exists idx_stock_subscriptions_fk_variant on public.stock_alert_subscriptions(variant_id);
notify pgrst, 'reload schema';
commit;
