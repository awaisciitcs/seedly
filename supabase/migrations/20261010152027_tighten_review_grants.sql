begin;
revoke insert,update,delete on public.reviews from anon;
notify pgrst,'reload schema';
commit;
