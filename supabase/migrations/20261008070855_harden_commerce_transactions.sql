begin;
set local lock_timeout = '5s';
create table if not exists public.order_stock_reservations (order_id text not null references public.orders(id) on delete cascade,variant_id text not null references public.product_variants(id),quantity integer not null check(quantity>0),released_at timestamptz,primary key(order_id,variant_id));
alter table public.order_stock_reservations enable row level security;
revoke all on public.order_stock_reservations from public,anon;
grant select,insert,update on public.order_stock_reservations to authenticated,service_role;
create policy "Active admins manage reservation ledger" on public.order_stock_reservations to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create index if not exists idx_order_reservations_variant on public.order_stock_reservations(variant_id);
-- Direct-pack historical reservations can be reconstructed exactly. Kit history
-- cannot be inferred from today's formulation and requires explicit reconciliation.
insert into public.order_stock_reservations(order_id,variant_id,quantity) select i.order_id,i.variant_id,sum(i.quantity)::int from public.order_items i join public.orders o on o.id=i.order_id where o.order_status not in ('CANCELLED','REFUNDED') and i.variant_id is not null and not exists(select 1 from public.order_items old where old.order_id=i.order_id and (old.kit_id is not null or old.variant_id is null)) group by i.order_id,i.variant_id on conflict do nothing;
CREATE OR REPLACE FUNCTION public.create_order_transactional(p_order_id text, p_order_number text, p_customer_name text, p_customer_email text, p_customer_phone text, p_shipping_address text, p_shipping_city text, p_shipping_province text, p_shipping_postal_code text, p_shipping_notes text, p_payment_method text, p_receipt_path text, p_idempotency_key text, p_request_fingerprint text, p_tracking_token_hash text, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_existing_order record;
  v_payment_status text;
  v_order_status text;
  v_free_thresh integer;
  v_delivery_fee integer;
  v_subtotal integer := 0;
  v_shipping integer := 0;
  v_total integer := 0;
  v_item record;
  r_var record;
  v_item_id text;
  v_line_total integer;
BEGIN
  if coalesce(p_idempotency_key,'') !~ '^[A-Za-z0-9_-]{20,100}$' or coalesce(p_request_fingerprint,'') !~ '^[a-f0-9]{64}$' or coalesce(p_tracking_token_hash,'') !~ '^[a-f0-9]{64}$' or coalesce(p_order_number,'') !~ '^SED-([0-9]{6,12}|[A-F0-9]{24})$' then raise exception 'Invalid checkout identity' using errcode='22023'; end if;
  if p_payment_method not in ('COD','bank_transfer','wallet_aggregator') or char_length(coalesce(p_customer_name,'')) not between 2 and 500 or char_length(coalesce(p_customer_email,'')) not between 3 and 254 or char_length(coalesce(p_shipping_address,'')) not between 8 and 500 then raise exception 'Invalid checkout details' using errcode='22023'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Invalid items' using errcode='22023'; end if;
  if exists(select 1 from jsonb_array_elements(p_items)e where jsonb_typeof(e)<>'object' or coalesce(e->>'quantity','') !~ '^[1-9][0-9]?$' or (e->>'kit_id' is null and e->>'variant_id' is null) or (e->>'kit_id' is not null and (e->>'variant_id' is not null or e->>'product_id' is distinct from e->>'kit_id'))) then raise exception 'Invalid line selection' using errcode='22023'; end if;
  if (select count(distinct coalesce(e->>'kit_id',e->>'variant_id')) from jsonb_array_elements(p_items)e) <> jsonb_array_length(p_items) then raise exception 'Duplicate packs' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('seedly-checkout:'||p_idempotency_key,0));
  -- 1. Idempotency Check
  IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) != '' THEN
    SELECT id, order_number, subtotal_minor, shipping_minor, total_minor, payment_status, order_status, request_fingerprint
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_order.request_fingerprint IS DISTINCT FROM p_request_fingerprint THEN
        RAISE EXCEPTION 'Idempotency conflict: key reused with different request fingerprint'
          USING ERRCODE = 'P0001';
      ELSE
        RETURN jsonb_build_object(
          'order_id', v_existing_order.id,
          'order_number', v_existing_order.order_number,
          'subtotal_minor', v_existing_order.subtotal_minor,
          'shipping_minor', v_existing_order.shipping_minor,
          'total_minor', v_existing_order.total_minor,
          'payment_status', v_existing_order.payment_status,
          'order_status', v_existing_order.order_status,
          'is_idempotent_replay', true
        );
      END IF;
    END IF;
  END IF;

  -- 2. Validate Items
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order items cannot be empty' USING ERRCODE = 'P0005';
  END IF;


  -- Lock catalog rows so prices, component definitions and shipping settings stay
  -- stable for the whole transaction. Parent rows are locked before variants.
  perform p.id from public.products p where p.id in (select e->>'product_id' from jsonb_array_elements(p_items)e where e->>'kit_id' is null union select ki.product_id from public.kit_items ki where ki.kit_id in (select e->>'kit_id' from jsonb_array_elements(p_items)e)) order by p.id for share;
  perform k.id from public.kits k where k.id in (select e->>'kit_id' from jsonb_array_elements(p_items)e) order by k.id for share;
  perform ki.id from public.kit_items ki where ki.kit_id in (select e->>'kit_id' from jsonb_array_elements(p_items)e) order by ki.id for share;
  perform s.key from public.site_settings s where s.key in ('delivery_fee_minor','free_delivery_threshold_minor') order by s.key for share;
  for v_item in select e->>'product_id' product_id,e->>'variant_id' variant_id,e->>'kit_id' kit_id from jsonb_array_elements(p_items)e loop
    if v_item.kit_id is null then
      if not exists(select 1 from public.product_variants pv join public.products p on p.id=pv.product_id where pv.id=v_item.variant_id and pv.product_id=v_item.product_id and pv.status='ACTIVE' and p.status='ACTIVE') then raise exception 'Invalid active pack ownership' using errcode='P0003'; end if;
    else
      if not exists(select 1 from public.kits k where k.id=v_item.kit_id and k.status='ACTIVE') or not exists(select 1 from public.kit_items ki where ki.kit_id=v_item.kit_id) or exists(select 1 from public.kit_items ki left join public.product_variants pv on pv.id=coalesce(ki.variant_id,ki.product_variant_id) left join public.products p on p.id=ki.product_id where ki.kit_id=v_item.kit_id and (pv.id is null or pv.product_id is distinct from ki.product_id or pv.status<>'ACTIVE' or p.status<>'ACTIVE')) then raise exception 'Invalid active kit component' using errcode='P0003'; end if;
    end if;
  end loop;

  -- 3. Lock affected product variants in consistent order (ASC) to prevent deadlocks
  -- Calculate demands
  FOR r_var IN (
    WITH raw_items AS (
      SELECT
        (elem->>'product_id') as product_id,
        (elem->>'variant_id') as variant_id,
        (elem->>'kit_id') as kit_id,
        (elem->>'quantity')::int as quantity
      FROM jsonb_array_elements(p_items) elem
    ),
    direct_demand AS (
      SELECT variant_id, SUM(quantity)::int as qty
      FROM raw_items
      WHERE kit_id IS NULL AND variant_id IS NOT NULL
      GROUP BY variant_id
    ),
    kit_demand AS (
      SELECT
        COALESCE(ki.variant_id, ki.product_variant_id) as variant_id,
        SUM(ri.quantity * ki.quantity)::int as qty
      FROM raw_items ri
      JOIN public.kit_items ki ON ki.kit_id = ri.kit_id
      WHERE ri.kit_id IS NOT NULL
      GROUP BY COALESCE(ki.variant_id, ki.product_variant_id)
    ),
    combined_demand AS (
      SELECT variant_id, SUM(qty)::int as total_qty
      FROM (
        SELECT * FROM direct_demand
        UNION ALL
        SELECT * FROM kit_demand
      ) c
      WHERE variant_id IS NOT NULL
      GROUP BY variant_id
    )
    SELECT
      pv.id as variant_id,
      pv.inventory_quantity,
      pv.status as variant_status,
      cd.total_qty,
      p.name as product_name,
      pv.option_value
    FROM public.product_variants pv
    JOIN combined_demand cd ON cd.variant_id = pv.id
    JOIN public.products p ON p.id = pv.product_id
    ORDER BY pv.id ASC
    FOR UPDATE OF pv
  ) LOOP
    IF r_var.variant_status != 'ACTIVE' THEN
      RAISE EXCEPTION 'Product variant "% (%)" is not active', r_var.product_name, r_var.option_value
        USING ERRCODE = 'P0003';
    END IF;

    IF r_var.inventory_quantity < r_var.total_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "% (%)". Available: %, Requested: %',
        r_var.product_name, r_var.option_value, r_var.inventory_quantity, r_var.total_qty
        USING ERRCODE = 'P0002';
    END IF;
  END LOOP;

  -- 4. Decrement inventory for locked variants
  WITH raw_items AS (
    SELECT
      (elem->>'product_id') as product_id,
      (elem->>'variant_id') as variant_id,
      (elem->>'kit_id') as kit_id,
      (elem->>'quantity')::int as quantity
    FROM jsonb_array_elements(p_items) elem
  ),
  direct_demand AS (
    SELECT variant_id, SUM(quantity)::int as qty
    FROM raw_items
    WHERE kit_id IS NULL AND variant_id IS NOT NULL
    GROUP BY variant_id
  ),
  kit_demand AS (
    SELECT
      COALESCE(ki.variant_id, ki.product_variant_id) as variant_id,
      SUM(ri.quantity * ki.quantity)::int as qty
    FROM raw_items ri
    JOIN public.kit_items ki ON ki.kit_id = ri.kit_id
    WHERE ri.kit_id IS NOT NULL
    GROUP BY COALESCE(ki.variant_id, ki.product_variant_id)
  ),
  combined_demand AS (
    SELECT variant_id, SUM(qty)::int as total_qty
    FROM (
      SELECT * FROM direct_demand
      UNION ALL
      SELECT * FROM kit_demand
    ) c
    WHERE variant_id IS NOT NULL
    GROUP BY variant_id
  )
  UPDATE public.product_variants pv
  SET inventory_quantity = pv.inventory_quantity - cd.total_qty,
      updated_at = NOW()
  FROM combined_demand cd
  WHERE pv.id = cd.variant_id;

  -- 5. Calculate Subtotal from authoritative catalog prices
  FOR v_item IN (
    SELECT
      (elem->>'product_id') as product_id,
      (elem->>'variant_id') as variant_id,
      (elem->>'kit_id') as kit_id,
      (elem->>'quantity')::int as quantity
    FROM jsonb_array_elements(p_items) elem
  ) LOOP
    IF v_item.kit_id IS NOT NULL THEN
      SELECT price_minor INTO v_line_total
      FROM public.kits
      WHERE id = v_item.kit_id AND status = 'ACTIVE';

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Kit % is not active or does not exist', v_item.kit_id USING ERRCODE = 'P0003';
      END IF;
      v_subtotal := v_subtotal + (v_line_total * v_item.quantity);
    ELSIF v_item.variant_id IS NOT NULL THEN
      SELECT price_minor INTO v_line_total
      FROM public.product_variants
      WHERE id = v_item.variant_id AND status = 'ACTIVE';

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant % is not active or does not exist', v_item.variant_id USING ERRCODE = 'P0003';
      END IF;
      v_subtotal := v_subtotal + (v_line_total * v_item.quantity);
    ELSE
      SELECT price_minor INTO v_line_total
      FROM public.products
      WHERE id = v_item.product_id AND status = 'ACTIVE';

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product % is not active or does not exist', v_item.product_id USING ERRCODE = 'P0003';
      END IF;
      v_subtotal := v_subtotal + (v_line_total * v_item.quantity);
    END IF;
  END LOOP;

  -- 6. Shipping & Total Calculation
  SELECT COALESCE((SELECT value::int FROM public.site_settings WHERE key = 'free_delivery_threshold_minor'), 200000) INTO v_free_thresh;
  SELECT COALESCE((SELECT value::int FROM public.site_settings WHERE key = 'delivery_fee_minor'), 20000) INTO v_delivery_fee;

  IF v_subtotal >= v_free_thresh THEN
    v_shipping := 0;
  ELSE
    v_shipping := v_delivery_fee;
  END IF;

  v_total := v_subtotal + v_shipping;

  -- 7. Determine initial order and payment status
  IF p_payment_method = 'COD' THEN
    v_payment_status := 'PENDING';
    v_order_status := 'RECEIVED';
  ELSIF p_payment_method = 'wallet_aggregator' OR (p_receipt_path IS NOT NULL AND TRIM(p_receipt_path) != '') THEN
    v_payment_status := 'UNDER_REVIEW';
    v_order_status := 'PAYMENT_REVIEW';
  ELSE
    v_payment_status := 'PENDING';
    v_order_status := 'PENDING_PAYMENT';
  END IF;

  -- 8. Insert Order
  INSERT INTO public.orders (
    id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_province, shipping_postal_code,
    shipping_notes, currency, subtotal_minor, shipping_minor, discount_minor,
    total_minor, payment_method, payment_status, order_status,
    receipt_path, idempotency_key, request_fingerprint, tracking_token_hash,
    created_at, updated_at
  ) VALUES (
    p_order_id, p_order_number, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_city, p_shipping_province, p_shipping_postal_code,
    p_shipping_notes, 'PKR', v_subtotal, v_shipping, 0,
    v_total, p_payment_method, v_payment_status, v_order_status,
    p_receipt_path, p_idempotency_key, p_request_fingerprint, p_tracking_token_hash,
    NOW(), NOW()
  );

  -- 9. Insert Line Items
  FOR v_item IN (
    SELECT
      elem->>'id' as item_id,
      elem->>'product_id' as product_id,
      elem->>'variant_id' as variant_id,
      elem->>'kit_id' as kit_id,
      (elem->>'quantity')::int as quantity,
      elem->>'name' as client_name,
      elem->>'sku' as client_sku,
      elem->>'image_url' as client_image
    FROM jsonb_array_elements(p_items) elem
  ) LOOP
    v_item_id := 'oi-' || gen_random_uuid();

    IF v_item.kit_id IS NOT NULL THEN
      DECLARE
        k_rec record;
      BEGIN
        SELECT name, price_minor, image_url INTO k_rec FROM public.kits WHERE id = v_item.kit_id;
        INSERT INTO public.order_items (
          id, order_id, product_id, kit_id, variant_id,
          product_name, variant_name, price_minor, quantity, line_total_minor,
          name_snapshot, sku_snapshot, image_url, unit_price_minor,
          created_at, updated_at
        ) VALUES (
          v_item_id, p_order_id, NULL, v_item.kit_id, NULL,
          k_rec.name, NULL, k_rec.price_minor, v_item.quantity, k_rec.price_minor * v_item.quantity,
          k_rec.name, COALESCE(v_item.client_sku, 'KIT-' || v_item.kit_id), COALESCE(k_rec.image_url, v_item.client_image), k_rec.price_minor,
          NOW(), NOW()
        );
      END;
    ELSE
      DECLARE
        p_rec record;
        var_rec record;
        v_name text;
        v_var_name text := NULL;
        v_price int;
        v_sku text;
        v_img text;
      BEGIN
        SELECT name, price_minor, sku, image_url INTO p_rec FROM public.products WHERE id = v_item.product_id;
        v_name := p_rec.name;
        v_price := p_rec.price_minor;
        v_sku := p_rec.sku;
        v_img := p_rec.image_url;

        IF v_item.variant_id IS NOT NULL THEN
          SELECT option_value, price_minor, sku INTO var_rec FROM public.product_variants WHERE id = v_item.variant_id;
          v_var_name := var_rec.option_value;
          v_price := var_rec.price_minor;
          v_sku := var_rec.sku;
          v_name := p_rec.name || ' (' || var_rec.option_value || ')';
        END IF;

        INSERT INTO public.order_items (
          id, order_id, product_id, kit_id, variant_id,
          product_name, variant_name, price_minor, quantity, line_total_minor,
          name_snapshot, sku_snapshot, image_url, unit_price_minor,
          created_at, updated_at
        ) VALUES (
          v_item_id, p_order_id, v_item.product_id, NULL, v_item.variant_id,
          p_rec.name, v_var_name, v_price, v_item.quantity, v_price * v_item.quantity,
          v_name, COALESCE(v_sku, v_item.client_sku), COALESCE(v_img, v_item.client_image), v_price,
          NOW(), NOW()
        );
      END;
    END IF;
  END LOOP;

  -- Snapshot the exact reserved variants, including kit components.
  insert into public.order_stock_reservations(order_id,variant_id,quantity)
  with direct as (select e->>'variant_id' variant_id,(e->>'quantity')::int quantity from jsonb_array_elements(p_items)e where e->>'kit_id' is null), kits as (select coalesce(ki.variant_id,ki.product_variant_id) variant_id,ki.quantity*(e->>'quantity')::int quantity from jsonb_array_elements(p_items)e join public.kit_items ki on ki.kit_id=e->>'kit_id'), combined as (select * from direct union all select * from kits) select p_order_id,variant_id,sum(quantity)::int from combined group by variant_id;
  -- 10. Audit event
  INSERT INTO public.order_events (
    id, order_id, actor_type, actor_id, event_type, old_status, new_status, metadata, created_at
  ) VALUES (
    gen_random_uuid(), p_order_id, 'CUSTOMER', NULL, 'ORDER_CREATED', NULL, v_order_status,
    jsonb_build_object('payment_status', v_payment_status, 'payment_method', p_payment_method),
    NOW()
  );

  RETURN jsonb_build_object(
    'order_id', p_order_id,
    'order_number', p_order_number,
    'subtotal_minor', v_subtotal,
    'shipping_minor', v_shipping,
    'total_minor', v_total,
    'payment_status', v_payment_status,
    'order_status', v_order_status,
    'is_idempotent_replay', false
  );
END;
$function$;

create or replace function public.create_order_secure_transactional(
 p_order_id text,p_order_number text,p_customer_name text,p_customer_email text,p_customer_phone text,
 p_shipping_address text,p_shipping_city text,p_shipping_province text,p_shipping_postal_code text,p_shipping_notes text,
 p_payment_method text,p_receipt_path text,p_idempotency_key text,p_request_fingerprint text,p_tracking_token_hash text,p_items jsonb,p_expected_quote jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_result jsonb; v_order_id text;
begin
 if jsonb_typeof(p_expected_quote)<>'object' or jsonb_typeof(p_expected_quote->'items')<>'array' then raise exception 'Expected quote required' using errcode='22023'; end if;
 v_result:=public.create_order_transactional(p_order_id,p_order_number,p_customer_name,p_customer_email,p_customer_phone,p_shipping_address,p_shipping_city,p_shipping_province,p_shipping_postal_code,p_shipping_notes,p_payment_method,p_receipt_path,p_idempotency_key,p_request_fingerprint,p_tracking_token_hash,p_items);
 if coalesce((v_result->>'is_idempotent_replay')::boolean,false) then return v_result; end if;
 v_order_id:=v_result->>'order_id';
 if (v_result->>'total_minor')::bigint is distinct from (p_expected_quote->>'total_minor')::bigint or (v_result->>'shipping_minor')::bigint is distinct from (p_expected_quote->>'shipping_minor')::bigint or (v_result->>'subtotal_minor')::bigint is distinct from (p_expected_quote->>'subtotal_minor')::bigint
 or (select count(*) from public.order_items where order_id=v_order_id) <> jsonb_array_length(p_expected_quote->'items')
 or exists(select 1 from public.order_items i where i.order_id=v_order_id and not exists(select 1 from jsonb_array_elements(p_expected_quote->'items')q where coalesce(i.product_id,i.kit_id)=q->>'product_id' and coalesce(i.variant_id,'')=coalesce(q->>'variant_id','') and coalesce(i.kit_id,'')=coalesce(q->>'kit_id','') and i.quantity=(q->>'quantity')::int and i.unit_price_minor=(q->>'unit_price_minor')::int))
 then raise exception 'Prices or delivery changed; review the updated quote' using errcode='P0004'; end if;
 return v_result;
end;
$$;

create or replace function public.update_order_fulfillment_transactional(p_order_id text,p_order_status text,p_tracking_number text default null,p_courier_name text default null,p_actor_type text default 'ADMIN',p_actor_id text default null,p_notes text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_order public.orders; v_actor text; v_allowed text[]; v_reservation record;
begin
 if coalesce(auth.role(),'')='service_role' then
   select id into v_actor from public.admin_users where id=p_actor_id and is_active=true;
 else
   select id into v_actor from public.admin_users where auth_user_id=auth.uid() and is_active=true;
 end if;
 if v_actor is null then raise exception 'Administrator access required' using errcode='42501'; end if;
 select * into v_order from public.orders where id=p_order_id for update;
 if not found then raise exception 'Order not found' using errcode='P0002'; end if;
 if p_order_status=v_order.order_status then return jsonb_build_object('order_id',p_order_id,'order_status',p_order_status,'is_idempotent_replay',true); end if;
 v_allowed:=case v_order.order_status
   when 'RECEIVED' then array['PROCESSING','CANCELLED']
   when 'PENDING_PAYMENT' then array['PAYMENT_REVIEW','CANCELLED']
   when 'PAYMENT_REVIEW' then array['CANCELLED']
   when 'PAID' then array['PROCESSING','CANCELLED']
   when 'PROCESSING' then array['PACKED','CANCELLED']
   when 'PACKED' then array['SHIPPED','CANCELLED']
   when 'SHIPPED' then array['DELIVERED']
   when 'DELIVERED' then array['REFUNDED']
   when 'CANCELLED' then array['REFUNDED'] else '{}'::text[] end;
 if p_order_status is null or not p_order_status=any(v_allowed) then raise exception 'Invalid order transition' using errcode='P0004'; end if;
 if p_order_status in ('PROCESSING','PACKED','SHIPPED','DELIVERED') and v_order.payment_method <> 'COD' and v_order.payment_status<>'VERIFIED' then raise exception 'Payment verification required' using errcode='P0004'; end if;
 if p_order_status='REFUNDED' and v_order.payment_status not in ('VERIFIED','PAID') then raise exception 'No verified payment to refund' using errcode='P0004'; end if;
 if p_order_status='SHIPPED' and (coalesce(nullif(btrim(p_tracking_number),''),nullif(v_order.tracking_number,'')) is null or coalesce(nullif(btrim(p_courier_name),''),nullif(v_order.tracking_courier,'')) is null) then raise exception 'Courier and tracking are required' using errcode='22023'; end if;
 if p_order_status='CANCELLED' then
  if not exists(select 1 from public.order_stock_reservations where order_id=p_order_id) then raise exception 'Historical stock reservation needs reconciliation before cancellation' using errcode='P0004'; end if;
  for v_reservation in select r.variant_id,r.quantity from public.order_stock_reservations r where r.order_id=p_order_id and r.released_at is null order by r.variant_id for update loop
   update public.product_variants set inventory_quantity=inventory_quantity+v_reservation.quantity,updated_at=now() where id=v_reservation.variant_id;
   update public.order_stock_reservations set released_at=now() where order_id=p_order_id and variant_id=v_reservation.variant_id;
  end loop;
 end if;
 update public.orders set order_status=p_order_status,payment_status=case when p_order_status='REFUNDED' then 'REFUNDED' else payment_status end,
 tracking_number=coalesce(nullif(btrim(p_tracking_number),''),tracking_number),tracking_courier=coalesce(nullif(btrim(p_courier_name),''),tracking_courier),courier_name=coalesce(nullif(btrim(p_courier_name),''),courier_name),admin_note=coalesce(nullif(p_notes,''),admin_note),updated_at=now() where id=p_order_id;
 insert into public.order_events(id,order_id,actor_type,actor_id,event_type,old_status,new_status,metadata) values(gen_random_uuid(),p_order_id,'ADMIN',v_actor,'ORDER_STATUS_UPDATED',v_order.order_status,p_order_status,jsonb_build_object('courier_name',p_courier_name,'tracking_number',p_tracking_number,'notes',p_notes));
 return jsonb_build_object('order_id',p_order_id,'order_status',p_order_status,'is_idempotent_replay',false);
end;
$$;

create or replace function public.update_order_payment_transactional(p_order_id text,p_payment_status text,p_order_status text default null,p_actor_type text default 'ADMIN',p_actor_id text default null,p_notes text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_order public.orders; v_actor text; v_status text;
begin
 if coalesce(auth.role(),'')='service_role' then select id into v_actor from public.admin_users where id=p_actor_id and is_active=true;
 else select id into v_actor from public.admin_users where auth_user_id=auth.uid() and is_active=true; end if;
 if v_actor is null then raise exception 'Administrator access required' using errcode='42501'; end if;
 select * into v_order from public.orders where id=p_order_id for update;
 if not found then raise exception 'Order not found' using errcode='P0002'; end if;
 if p_payment_status not in ('VERIFIED','REJECTED') or v_order.payment_method='COD' then raise exception 'Invalid manual payment action' using errcode='P0004'; end if;
 if v_order.payment_status=p_payment_status then return jsonb_build_object('order_id',p_order_id,'payment_status',p_payment_status,'order_status',v_order.order_status,'is_idempotent_replay',true); end if;
 if v_order.payment_status not in ('PENDING','UNDER_REVIEW') or v_order.order_status not in ('RECEIVED','PENDING_PAYMENT','PAYMENT_REVIEW') then raise exception 'This payment cannot be changed at the current stage' using errcode='P0004'; end if;
 if p_payment_status='REJECTED' then
   perform public.update_order_fulfillment_transactional(p_order_id,'CANCELLED',null,null,'ADMIN',v_actor,p_notes);
   v_status:='CANCELLED';
 else v_status:='PAID'; end if;
 update public.orders set payment_status=p_payment_status,order_status=v_status,admin_note=coalesce(nullif(p_notes,''),admin_note),updated_at=now() where id=p_order_id;
 insert into public.order_events(id,order_id,actor_type,actor_id,event_type,old_status,new_status,metadata) values(gen_random_uuid(),p_order_id,'ADMIN',v_actor,'PAYMENT_STATUS_UPDATED',v_order.payment_status,p_payment_status,jsonb_build_object('order_status',v_status,'notes',p_notes));
 return jsonb_build_object('order_id',p_order_id,'payment_status',p_payment_status,'order_status',v_status,'is_idempotent_replay',false);
end;
$$;

create or replace function public.lookup_order_with_capability(p_order_number text,p_token text default null,p_verify text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_order public.orders;v_admin boolean;v_items jsonb;
begin
 v_admin:=public.is_admin();
 if not v_admin and coalesce(p_token,'') !~ '^[a-fA-F0-9]{64}$' then return null; end if;
 select * into v_order from public.orders where order_number=p_order_number and (v_admin or tracking_token_hash=encode(extensions.digest(p_token,'sha256'),'hex'));
 if not found then return null; end if;
 select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) into v_items from public.order_items i where i.order_id=v_order.id;
 return jsonb_build_object('is_authorized',true,'order',case when v_admin then to_jsonb(v_order) else to_jsonb(v_order)-array['idempotency_key','request_fingerprint','tracking_token_hash','receipt_path','admin_note','notes'] end,'items',v_items);
end;
$$;
-- The guest lookup is deliberately capability-protected; email/phone are never credentials.
revoke execute on function public.lookup_order_with_capability(text,text,text) from public;
grant execute on function public.lookup_order_with_capability(text,text,text) to anon,authenticated,service_role;
revoke execute on function public.create_order_transactional(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_order_transactional(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb) to service_role;
revoke execute on function public.create_order_secure_transactional(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.create_order_secure_transactional(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,jsonb) to service_role;
revoke execute on function public.update_order_fulfillment_transactional(text,text,text,text,text,text,text),public.update_order_payment_transactional(text,text,text,text,text,text) from public,anon;
grant execute on function public.update_order_fulfillment_transactional(text,text,text,text,text,text,text),public.update_order_payment_transactional(text,text,text,text,text,text) to authenticated,service_role;
notify pgrst,'reload schema';
commit;
