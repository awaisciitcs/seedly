-- New settings and leads only. Existing commerce and CMS records are not changed.
create table public.visitor_tracking_settings (
 id integer primary key check(id=1), version integer not null default 1 check(version>0), updated_at timestamptz not null default now(),
 posthog_enabled boolean not null default false, posthog_token text not null default '' check(posthog_token='' or posthog_token ~ '^phc_[A-Za-z0-9_-]{10,190}$'),
 posthog_region text not null default 'eu' check(posthog_region in ('eu','us')), posthog_project_id text not null default '' check(posthog_project_id='' or posthog_project_id ~ '^[1-9][0-9]{0,11}$'),
 clarity_enabled boolean not null default false, clarity_project_id text not null default '' check(clarity_project_id='' or clarity_project_id ~ '^[a-z0-9]{5,30}$'),
 leads_enabled boolean not null default true, retention_days integer not null default 90 check(retention_days between 30 and 365),
 banner_title text not null default 'Your privacy choices' check(length(banner_title) between 1 and 120),
 banner_body text not null default 'With your permission, we use analytics to understand visits and improve the shop. Optional recordings show interactions with sensitive text masked. You can shop without accepting.' check(length(banner_body) between 1 and 700),
 form_title text not null default 'Ask our team to get in touch' check(length(form_title) between 1 and 120),
 form_intro text not null default 'Leave your details and our customer care team can contact you.' check(length(form_intro) between 1 and 500),
 form_button text not null default 'Request a reply' check(length(form_button) between 1 and 60),
 privacy_notice text not null default 'We use the details you submit to respond to your request. Marketing is optional. If you accept analytics, your request can be linked to your website journey.' check(length(privacy_notice) between 1 and 700),
 check(not posthog_enabled or posthog_token<>''), check(not clarity_enabled or clarity_project_id<>'')
);
alter table public.visitor_tracking_settings enable row level security;
revoke all on public.visitor_tracking_settings from public,anon,authenticated;
grant select on public.visitor_tracking_settings to anon,authenticated;
grant update on public.visitor_tracking_settings to authenticated;
grant all on public.visitor_tracking_settings to service_role;
create policy "Public tracking configuration" on public.visitor_tracking_settings for select to anon,authenticated using(id=1);
create policy "Active owners update tracking configuration" on public.visitor_tracking_settings for update to authenticated
 using(exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.is_active and a.role='OWNER'))
 with check(id=1 and exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.is_active and a.role='OWNER'));
create function private.stamp_tracking_settings() returns trigger language plpgsql security invoker set search_path='' as $$
 begin new.version:=old.version+1;new.updated_at:=clock_timestamp();return new;end $$;
revoke all on function private.stamp_tracking_settings() from public,anon,authenticated;
create trigger tracking_settings_version before update on public.visitor_tracking_settings for each row execute function private.stamp_tracking_settings();
insert into public.visitor_tracking_settings(id) values(1);

create table public.leads (
 id uuid primary key default gen_random_uuid(), submission_key uuid not null unique, submission_hash text not null check(submission_hash ~ '^[0-9a-f]{64}$'),
 name text check(name is null or length(name) between 1 and 120), email text check(email is null or (length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
 phone text check(phone is null or (length(phone)<=16 and phone ~ '^[+]?[1-9][0-9]{7,14}$')), city text check(city is null or length(city)<=80),
 source text not null check(source in ('contact','checkout','restock')),
 posthog_id text check(posthog_id is null or length(posthog_id) between 1 and 120), analytics_consent boolean not null default false, marketing_consent boolean not null default false,
 landing_page text check(landing_page is null or (length(landing_page)<=1024 and landing_page ~ '^/[A-Za-z0-9/_-]*$')),
 page text check(page is null or (length(page)<=1024 and page ~ '^/[A-Za-z0-9/_-]*$')),
 referrer text check(referrer is null or referrer ~ '^[a-zA-Z0-9.-]{1,253}$'),
 utm_source text check(utm_source is null or length(utm_source)<=80),utm_medium text check(utm_medium is null or length(utm_medium)<=80),utm_campaign text check(utm_campaign is null or length(utm_campaign)<=80),
 order_id text unique references public.orders(id) on delete set null,
 created_at timestamptz not null default now(), expires_at timestamptz not null,
 check(email is not null or phone is not null), check(source<>'contact' or name is not null),check(source='checkout' or order_id is null),
 check(analytics_consent or (posthog_id is null and landing_page is null and page is null and referrer is null and utm_source is null and utm_medium is null and utm_campaign is null))
);
create index leads_created_at_id_idx on public.leads(created_at desc,id desc);
create index leads_expires_at_idx on public.leads(expires_at);
create index leads_source_created_idx on public.leads(source,created_at desc);
alter table public.leads enable row level security;
revoke all on public.leads from public,anon,authenticated;
grant select,delete on public.leads to authenticated;
grant all on public.leads to service_role;
create policy "Active administrators read unexpired leads" on public.leads for select to authenticated
 using(expires_at>now() and exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.is_active and a.role in ('OWNER','STAFF')));
create policy "Active owners erase leads" on public.leads for delete to authenticated
 using(exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.is_active and a.role='OWNER'));
-- A service-only maintenance RPC. It cannot access commerce, customer or CMS tables.
create function public.purge_expired_leads() returns integer language plpgsql security invoker set search_path='' as $$
 declare removed integer;
 begin delete from public.leads where id in(select id from public.leads where expires_at<=now() order by expires_at limit 1000);get diagnostics removed=row_count;return removed;end $$;
revoke all on function public.purge_expired_leads() from public,anon,authenticated;
grant execute on function public.purge_expired_leads() to service_role;
