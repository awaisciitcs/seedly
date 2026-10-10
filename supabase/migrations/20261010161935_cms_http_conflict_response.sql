-- A stale editor version is a user conflict, never a transient serialization failure.
-- Supabase/PostgREST retries SQLSTATE 40001; PT409 returns a bounded HTTP conflict.
-- Keep the existing function body, role checks, search_path, locks and grants.
do $migration$
declare v_definition text;
begin
 v_definition:=pg_catalog.pg_get_functiondef('public.mutate_site_content(text,text,bigint,text,jsonb,uuid)'::regprocedure);
 if position('errcode=''40001''' in v_definition)=0 then
  raise exception 'Expected CMS conflict marker was not found';
 end if;
 execute replace(v_definition,'errcode=''40001''','errcode=''PT409''');
end
$migration$;
