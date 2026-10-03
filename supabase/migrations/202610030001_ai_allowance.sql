-- Private admission and counters only; no source documents or AI output are stored.
create table public.relay_ai_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  daily_limit integer not null default 10 check (daily_limit between 1 and 20)
);
create table public.relay_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  reserved_requests integer not null check (reserved_requests between 1 and 20),
  primary key(user_id, day)
);
create table public.relay_ai_global_usage (
  day date primary key,
  reserved_requests integer not null check (reserved_requests between 1 and 100)
);
alter table public.relay_ai_access enable row level security;
alter table public.relay_ai_usage enable row level security;
alter table public.relay_ai_global_usage enable row level security;
revoke all on table public.relay_ai_access, public.relay_ai_usage, public.relay_ai_global_usage from public, anon, authenticated;
grant select, insert, update, delete on table public.relay_ai_access, public.relay_ai_usage, public.relay_ai_global_usage to service_role;

create function public.reserve_relay_ai_request(p_user_id uuid)
returns table (allowed boolean, reason text, remaining integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := (now() at time zone 'UTC')::date;
  v_limit integer;
  v_used integer;
  v_total integer;
begin
  -- Serialize reservation across function instances. Global and per-user limits
  -- are checked and incremented in this one transaction; never browser counters.
  perform pg_catalog.pg_advisory_xact_lock(764293610030001::bigint);
  select daily_limit into v_limit from public.relay_ai_access where user_id=p_user_id and enabled=true;
  if v_limit is null then return query select false, 'not_allowed'::text, 0; return; end if;
  select reserved_requests into v_used from public.relay_ai_usage where user_id=p_user_id and day=v_day;
  select reserved_requests into v_total from public.relay_ai_global_usage where day=v_day;
  v_used := coalesce(v_used,0); v_total := coalesce(v_total,0);
  if v_used>=v_limit or v_total>=100 then return query select false, 'usage_limit'::text, 0; return; end if;
  insert into public.relay_ai_usage (user_id,day,reserved_requests) values (p_user_id,v_day,1)
    on conflict (user_id,day) do update set reserved_requests=public.relay_ai_usage.reserved_requests+1;
  insert into public.relay_ai_global_usage (day,reserved_requests) values (v_day,1)
    on conflict (day) do update set reserved_requests=public.relay_ai_global_usage.reserved_requests+1;
  return query select true, 'reserved'::text, least(v_limit-v_used-1,100-v_total-1);
end;
$$;
revoke all on function public.reserve_relay_ai_request(uuid) from public, anon, authenticated;
grant execute on function public.reserve_relay_ai_request(uuid) to service_role;
