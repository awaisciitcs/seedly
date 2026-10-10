begin;
-- Persist the previous effective public defaults. Preserve every configured value.
insert into public.site_settings(key,value)
select 'store_name',content#>>'{config,name}' from public.site_documents where slug='site' on conflict(key) do nothing;
insert into public.site_settings(key,value)
select 'tagline',content#>>'{config,brandLine}' from public.site_documents where slug='site' on conflict(key) do nothing;
insert into public.site_settings(key,value)
select 'support_email',content#>>'{config,contact,email}' from public.site_documents where slug='site' on conflict(key) do nothing;
insert into public.site_settings(key,value)
select 'whatsapp_number',content#>>'{config,contact,phoneInternational}' from public.site_documents where slug='site' on conflict(key) do nothing;
insert into public.site_settings(key,value) values
('currency','PKR'),
('serviceable_cities','["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta","Sialkot","Gujranwala","Hyderabad","Abbottabad","Gilgit","Skardu","Bahawalpur"]')
on conflict(key) do nothing;
notify pgrst,'reload schema';
commit;
