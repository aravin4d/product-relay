-- Disposable LOCAL database only. The entire fixture is rolled back.
-- This executable SQL check needs a migrated Supabase PostgreSQL instance.
begin;
do $$
declare
  v_user uuid := '77777777-7777-4777-8777-777777777777';
  v_other uuid;
  v_day date := (now() at time zone 'UTC')::date;
  v_result record;
  v_count integer;
begin
  if pg_catalog.has_function_privilege('anon','public.reserve_relay_ai_request(uuid)','EXECUTE')
     or pg_catalog.has_function_privilege('authenticated','public.reserve_relay_ai_request(uuid)','EXECUTE') then
    raise exception 'Public callers can reserve an allowance';
  end if;
  if pg_catalog.has_table_privilege('authenticated','public.relay_ai_access','SELECT')
     or pg_catalog.has_table_privilege('anon','public.relay_ai_usage','UPDATE') then
    raise exception 'Public callers can access allowance tables';
  end if;
  if not pg_catalog.has_function_privilege('service_role','public.reserve_relay_ai_request(uuid)','EXECUTE') then
    raise exception 'Gateway cannot reserve an allowance';
  end if;
  delete from public.relay_ai_usage where day=v_day;
  delete from public.relay_ai_global_usage where day=v_day;
  insert into auth.users (id) values(v_user);
  select * into v_result from public.reserve_relay_ai_request(v_user);
  if v_result.allowed or v_result.reason<>'not_allowed' then raise exception 'Unlisted account was allowed'; end if;
  insert into public.relay_ai_access (user_id,daily_limit) values(v_user,2);
  select * into v_result from public.reserve_relay_ai_request(v_user);
  if not v_result.allowed or v_result.remaining<>1 then raise exception 'First allowance reservation failed'; end if;
  select * into v_result from public.reserve_relay_ai_request(v_user);
  if not v_result.allowed or v_result.remaining<>0 then raise exception 'Second allowance reservation failed'; end if;
  select * into v_result from public.reserve_relay_ai_request(v_user);
  if v_result.allowed or v_result.reason<>'usage_limit' then raise exception 'Per-user limit was exceeded'; end if;
  select reserved_requests into v_count from public.relay_ai_usage where user_id=v_user and day=v_day;
  if v_count<>2 then raise exception 'Denied reservations changed the counter'; end if;
  update public.relay_ai_access set enabled=false where user_id=v_user;
  select * into v_result from public.reserve_relay_ai_request(v_user);
  if v_result.allowed or v_result.reason<>'not_allowed' then raise exception 'Disabled account was allowed'; end if;
  for account_index in 1..5 loop
    v_other := gen_random_uuid();
    insert into auth.users (id) values(v_other);
    insert into public.relay_ai_access (user_id,daily_limit) values(v_other,20);
    for request_index in 1..20 loop
      perform public.reserve_relay_ai_request(v_other);
    end loop;
  end loop;
  select reserved_requests into v_count from public.relay_ai_global_usage where day=v_day;
  if v_count<>100 then raise exception 'Global allowance was not bounded at 100'; end if;
  v_other := gen_random_uuid();
  insert into auth.users (id) values(v_other);
  insert into public.relay_ai_access (user_id,daily_limit) values(v_other,20);
  select * into v_result from public.reserve_relay_ai_request(v_other);
  if v_result.allowed or v_result.reason<>'usage_limit' then raise exception 'Global allowance was exceeded'; end if;
  if exists (select 1 from public.relay_ai_usage where user_id=v_other and day=v_day) then raise exception 'Denied global reservation changed user counters'; end if;
end;
$$;
rollback;
