create table public.relay_project_ai_budgets(project_id uuid primary key references public.relay_projects(id),daily_requests integer not null default 20 check(daily_requests between 0 and 100),enabled boolean not null default true);
create table public.relay_project_ai_usage(project_id uuid not null references public.relay_projects(id),day date not null,reserved_requests integer not null,primary key(project_id,day));
alter table public.relay_project_ai_budgets enable row level security;
alter table public.relay_project_ai_usage enable row level security;
revoke all on public.relay_project_ai_budgets,public.relay_project_ai_usage from public,anon,authenticated;
grant select on public.relay_project_ai_budgets,public.relay_project_ai_usage to authenticated;
grant all on public.relay_project_ai_budgets,public.relay_project_ai_usage to service_role;
create policy relay_budget_owner_read on public.relay_project_ai_budgets for select to authenticated using(public.relay_capability(project_id)='owner');
create policy relay_budget_usage_owner_read on public.relay_project_ai_usage for select to authenticated using(public.relay_capability(project_id)='owner');
create function public.reserve_relay_project_ai_request(p_user_id uuid,p_project_id uuid) returns table(allowed boolean,reason text,remaining integer)
 language plpgsql security definer set search_path='' as $$
 declare v_limit integer;v_used integer;v_day date:=(now() at time zone 'UTC')::date;v_account record;
 begin
 perform pg_advisory_xact_lock(764293610030001::bigint);
 if not exists(select 1 from public.relay_memberships m join public.relay_projects p on p.id=m.project_id where m.project_id=p_project_id and m.user_id=p_user_id and m.active and p.active and m.capability in ('owner','reviewer','editor')) then return query select false,'not_allowed'::text,0;return;end if;
 insert into public.relay_project_ai_budgets(project_id) values(p_project_id) on conflict do nothing;
 select daily_requests into v_limit from public.relay_project_ai_budgets where project_id=p_project_id and enabled;
 select reserved_requests into v_used from public.relay_project_ai_usage where project_id=p_project_id and day=v_day;
 if v_limit is null or coalesce(v_used,0)>=v_limit then return query select false,'project_usage_limit'::text,0;return;end if;
 select * into v_account from public.reserve_relay_ai_request(p_user_id);
 if not v_account.allowed then return query select false,v_account.reason,v_account.remaining;return;end if;
 insert into public.relay_project_ai_usage values(p_project_id,v_day,1) on conflict(project_id,day) do update set reserved_requests=public.relay_project_ai_usage.reserved_requests+1;
 return query select true,'reserved'::text,least(v_account.remaining,v_limit-coalesce(v_used,0)-1);
 end $$;
create function public.relay_touch_job(p_job uuid,p_lease uuid,p_checkpoint jsonb,p_lease_seconds integer) returns boolean
 language plpgsql security definer set search_path='' as $$
 declare v_job public.relay_jobs;v_revision bigint;v_cap text;
 begin
 if p_lease_seconds not between 10 and 120 then raise exception 'invalid_lease';end if;
 select * into v_job from public.relay_jobs where id=p_job;
 if not found then return false;end if;
 select revision into v_revision from public.relay_projects where id=v_job.project_id and active for update;
 select capability into v_cap from public.relay_memberships where project_id=v_job.project_id and user_id=v_job.actor_user_id and active;
 if v_revision is distinct from v_job.expected_revision or v_cap is null or v_cap not in ('owner','reviewer','editor') or v_job.kind<>'connector-read' and v_cap not in ('owner','reviewer') then return false;end if;
 update public.relay_jobs set checkpoint=p_checkpoint,lease_until=now()+make_interval(secs=>p_lease_seconds),updated_at=now() where id=p_job and status='leased' and lease_token=p_lease and lease_until>now() and not cancel_requested;
 return found;
 end $$;
revoke all on function public.reserve_relay_project_ai_request(uuid,uuid),public.relay_touch_job(uuid,uuid,jsonb,integer) from public,anon,authenticated;
grant execute on function public.reserve_relay_project_ai_request(uuid,uuid),public.relay_touch_job(uuid,uuid,jsonb,integer) to service_role;
