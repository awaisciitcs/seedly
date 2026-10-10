begin;
set local lock_timeout = '5s';
create or replace function public.save_admin_catalog(p_kind text,p_document jsonb,p_children jsonb default null,p_create boolean default false)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 v_table text; v_id text; v_existing jsonb; v_doc jsonb; v_allowed text[];
 v_columns text; v_assignments text; v_child jsonb; v_child_id text;
 v_variant public.product_variants; v_component public.product_variants; v_ids text[] := '{}';
 v_weight integer; v_price integer; v_stock integer; v_status text; v_sku text;
begin
 if coalesce(auth.role(),'') <> 'service_role' and not public.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if p_kind not in ('product','kit') or jsonb_typeof(p_document) <> 'object' or p_document->>'id' !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$' then raise exception 'Invalid catalog document' using errcode='22023'; end if;
 v_table := case p_kind when 'product' then 'products' else 'kits' end;
 v_id := p_document->>'id';
 v_allowed := array['id','name','slug','category_id','short_description','description','price_minor','compare_price_minor','currency','image_url','badge','status','ingredients','usage_instructions','storage_instructions','is_featured'];
 if p_kind='product' then v_allowed:=v_allowed || array['sku','product_type','weight_grams','flavor_profile','caffeine_level','steep_time','water_temp'];
 else v_allowed:=v_allowed || array['package_size','subtitle','compliance_status']; end if;
 if exists(select 1 from jsonb_object_keys(p_document) k where k <> 'expected_updated_at' and not k=any(v_allowed)) then raise exception 'Unsupported catalog field' using errcode='22023'; end if;
 if not p_create then
  execute format('select to_jsonb(t) from public.%I t where id=$1 for update',v_table) into v_existing using v_id;
  if v_existing is null then raise exception 'Catalog item not found' using errcode='P0002'; end if;
  if p_document ? 'expected_updated_at' and (p_document->>'expected_updated_at')::timestamptz <> (v_existing->>'updated_at')::timestamptz then raise exception 'Catalog changed' using errcode='40001'; end if;
 end if;
 v_doc:=coalesce(v_existing,'{}'::jsonb) || (p_document - 'expected_updated_at');
 if coalesce(char_length(btrim(v_doc->>'name')),0) not between 1 and 500 or coalesce(v_doc->>'slug','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or coalesce(v_doc->>'price_minor','') !~ '^[0-9]+$' or (v_doc->>'price_minor')::bigint not between 1 and 2000000000 then raise exception 'Invalid catalog values' using errcode='22023'; end if;
 if coalesce(v_doc->>'status','ACTIVE') not in ('ACTIVE','DRAFT','ARCHIVED') then raise exception 'Invalid status' using errcode='22023'; end if;
 if v_doc->>'compare_price_minor' is not null and (v_doc->>'compare_price_minor')::bigint < (v_doc->>'price_minor')::bigint then raise exception 'Invalid compare price' using errcode='22023'; end if;
 if char_length(coalesce(v_doc->>'description','')) > 12000 or char_length(coalesce(v_doc->>'short_description','')) > 2000 then raise exception 'Catalog text too long' using errcode='22023'; end if;
 if p_children is not null and (jsonb_typeof(p_children)<>'array' or jsonb_array_length(p_children) not between 1 and 40) then raise exception 'Invalid children' using errcode='22023'; end if;
 if p_create and p_children is null then raise exception 'Catalog contents required' using errcode='22023'; end if;
 -- Only explicitly supplied fields are written; database defaults remain valid.
 select string_agg(format('%I',k),','),string_agg(format('%I=s.%I',k,k),',') into v_columns,v_assignments from jsonb_object_keys(p_document - 'expected_updated_at') k where k <> 'id';
 if p_create then
  execute format('insert into public.%I(id,%s) select id,%s from jsonb_populate_record(null::public.%I,$1)',v_table,v_columns,v_columns,v_table) using p_document;
 else
  execute format('update public.%I t set %supdated_at=now() from jsonb_populate_record(null::public.%I,$1) s where t.id=$2',v_table,coalesce(v_assignments||',',''),v_table) using p_document,v_id;
 end if;
 if p_children is not null and p_kind='product' then
  if (select count(distinct c->>'id') from jsonb_array_elements(p_children)c) <> jsonb_array_length(p_children) or (select count(distinct c->>'weight_grams') from jsonb_array_elements(p_children)c) <> jsonb_array_length(p_children) then raise exception 'Duplicate pack sizes or IDs' using errcode='22023'; end if;
  for v_child in select value from jsonb_array_elements(p_children) loop
   v_child_id:=v_child->>'id';
   if coalesce(v_child_id,'') !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$' or coalesce(v_child->>'weight_grams','') !~ '^[0-9]+$' or coalesce(v_child->>'price_minor','') !~ '^[0-9]+$' or coalesce(v_child->>'inventory_quantity','') !~ '^[0-9]+$' then raise exception 'Invalid pack values' using errcode='22023'; end if;
   v_weight:=(v_child->>'weight_grams')::int;v_price:=(v_child->>'price_minor')::int;v_stock:=(v_child->>'inventory_quantity')::int;v_status:=coalesce(v_child->>'status','ACTIVE');
   if v_weight not between 1 and 100000 or v_price not between 1 and 2000000000 or v_stock not between 0 and 1000000 or v_status not in ('ACTIVE','ARCHIVED','DRAFT') then raise exception 'Invalid pack values' using errcode='22023'; end if;
   select * into v_variant from public.product_variants where id=v_child_id for update;
   if found then
    if v_variant.product_id <> v_id then raise exception 'Pack belongs to another product' using errcode='22023'; end if;
    if v_child->>'expected_updated_at' is null or (v_child->>'expected_updated_at')::timestamptz <> v_variant.updated_at then raise exception 'Pack changed while editing' using errcode='40001'; end if;
    v_sku:=v_variant.sku;
   else v_sku:=v_child->>'sku'; end if;
   if coalesce(v_sku,'')='' then raise exception 'Pack SKU required' using errcode='22023'; end if;
   if v_child->>'compare_price_minor' is not null and (v_child->>'compare_price_minor')::int < v_price then raise exception 'Invalid compare price' using errcode='22023'; end if;
   insert into public.product_variants(id,product_id,sku,option_name,option_value,weight_grams,price_minor,compare_price_minor,inventory_quantity,status,sort_order)
   values(v_child_id,v_id,v_sku,'Pack Size',v_child->>'option_value',v_weight,v_price,(v_child->>'compare_price_minor')::int,v_stock,v_status,coalesce((v_child->>'sort_order')::int,0))
   on conflict(id) do update set option_value=excluded.option_value,weight_grams=excluded.weight_grams,price_minor=excluded.price_minor,compare_price_minor=excluded.compare_price_minor,inventory_quantity=excluded.inventory_quantity,status=excluded.status,sort_order=excluded.sort_order,updated_at=now();
   v_ids:=array_append(v_ids,v_child_id);
  end loop;
  update public.product_variants set status='ARCHIVED',updated_at=now() where product_id=v_id and not id=any(v_ids) and status <> 'ARCHIVED';
 elsif p_children is not null and p_kind='kit' then
  -- Validate everything first. Any error rolls back both the kit and its contents.
  for v_child in select value from jsonb_array_elements(p_children) loop
   if coalesce(v_child->>'product_id','')='' or coalesce(v_child->>'quantity','') !~ '^[0-9]+$' or (v_child->>'quantity')::int not between 1 and 100 then raise exception 'Invalid component' using errcode='22023'; end if;
   select pv.* into v_component from public.product_variants pv join public.products p on p.id=pv.product_id where pv.product_id=v_child->>'product_id' and pv.status='ACTIVE' and p.status='ACTIVE' and (v_child->>'variant_id' is null or pv.id=v_child->>'variant_id') order by pv.sort_order,pv.weight_grams,pv.id limit 1;
   if not found or v_component.id=any(v_ids) then raise exception 'Invalid or duplicate component' using errcode='22023'; end if;
   v_ids:=array_append(v_ids,v_component.id);
  end loop;
  delete from public.kit_items where kit_id=v_id;
  for v_child in select value from jsonb_array_elements(p_children) loop
   select pv.* into v_component from public.product_variants pv where pv.product_id=v_child->>'product_id' and pv.id=any(v_ids) and (v_child->>'variant_id' is null or pv.id=v_child->>'variant_id') order by pv.sort_order,pv.weight_grams,pv.id limit 1;
   insert into public.kit_items(id,kit_id,product_id,variant_id,product_variant_id,quantity,sort_order) values('ki-'||gen_random_uuid(),v_id,v_component.product_id,v_component.id,v_component.id,(v_child->>'quantity')::int,coalesce((v_child->>'sort_order')::int,0));
  end loop;
 end if;
 return jsonb_build_object('id',v_id,'slug',v_doc->>'slug');
end;
$$;
revoke execute on function public.save_admin_catalog(text,jsonb,jsonb,boolean) from public,anon;
grant execute on function public.save_admin_catalog(text,jsonb,jsonb,boolean) to authenticated,service_role;
notify pgrst,'reload schema';
commit;
