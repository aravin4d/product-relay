-- The edge service validates domain commands. Clients cannot write these tables/RPCs.
create table public.relay_projects (
 id uuid primary key, name text not null, owner_user_id uuid not null references auth.users(id),
 revision bigint not null default 1 check(revision>0), active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.relay_memberships (
 project_id uuid not null references public.relay_projects(id), user_id uuid not null references auth.users(id),
 member_id uuid not null, capability text not null check(capability in ('owner','reviewer','editor','observer','reader')),
 perspective text not null default 'Everyone', active boolean not null default true,
 primary key(project_id,user_id)
);
create table public.relay_project_state (
 project_id uuid primary key references public.relay_projects(id), payload jsonb not null
);
create table public.relay_project_revisions (
 project_id uuid not null references public.relay_projects(id), revision bigint not null,
 payload jsonb not null, actor_user_id uuid not null references auth.users(id), at timestamptz not null default now(),
 primary key(project_id,revision)
);
create table public.relay_commands (
 project_id uuid not null references public.relay_projects(id), command_id uuid not null, actor_user_id uuid not null,
 request_hash text not null check(length(request_hash)=64), expected_revision bigint not null,
 resulting_revision bigint not null, summary text not null check(length(summary)<=1000), at timestamptz not null default now(),
 primary key(project_id,command_id)
);
create table public.relay_notifications (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.relay_projects(id),
 user_id uuid not null references auth.users(id), command_id uuid not null, revision bigint not null,
 summary text not null, read_at timestamptz, created_at timestamptz not null default now(),
 unique(project_id,user_id,command_id)
);
create table public.relay_subscriptions (
 project_id uuid not null references public.relay_projects(id), user_id uuid not null references auth.users(id),
 enabled boolean not null default true, digest_minutes integer not null default 0 check(digest_minutes between 0 and 10080),
 perspective text not null default 'Everyone', owned_only boolean not null default false,
 release_id uuid, environment_id uuid, primary key(project_id,user_id)
);
create table public.relay_jobs (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.relay_projects(id),
 actor_user_id uuid not null references auth.users(id), kind text not null,
 idempotency_key uuid not null, input_hash text not null, expected_revision bigint not null,
 input jsonb not null, status text not null default 'queued' check(status in ('queued','leased','succeeded','failed','cancelled','review-required','uncertain')),
 checkpoint jsonb not null default '{}', output jsonb, attempts integer not null default 0 check(attempts between 0 and 5),
 lease_token uuid, lease_until timestamptz, available_at timestamptz not null default now(),
 cancel_requested boolean not null default false, error_code text, cost_uncertain boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(project_id,idempotency_key)
);
create table public.relay_outbox (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.relay_projects(id),
 actor_user_id uuid not null references auth.users(id), external_record_id uuid not null,
 expected_external_revision text not null, idempotency_key uuid not null,
 operation text not null check(operation in ('comment','test-dispatch')), diff jsonb not null,
 status text not null default 'pending' check(status in ('pending','sent','failed','uncertain','cancelled')),
 receipt jsonb, created_at timestamptz not null default now(), unique(project_id,idempotency_key)
);
create index relay_jobs_claim on public.relay_jobs(status,available_at,lease_until);
create index relay_notifications_user on public.relay_notifications(user_id,created_at desc);

create function public.relay_capability(p_project_id uuid) returns text
 language sql stable security definer set search_path='' as $$
 select m.capability from public.relay_memberships m join public.relay_projects p on p.id=m.project_id
 where m.project_id=p_project_id and m.user_id=auth.uid() and m.active and p.active
 $$;
revoke all on function public.relay_capability(uuid) from public,anon;
grant execute on function public.relay_capability(uuid) to authenticated,service_role;

alter table public.relay_projects enable row level security;
alter table public.relay_memberships enable row level security;
alter table public.relay_project_state enable row level security;
alter table public.relay_project_revisions enable row level security;
alter table public.relay_commands enable row level security;
alter table public.relay_notifications enable row level security;
alter table public.relay_subscriptions enable row level security;
alter table public.relay_jobs enable row level security;
alter table public.relay_outbox enable row level security;
revoke all on public.relay_projects,public.relay_memberships,public.relay_project_state,public.relay_project_revisions,public.relay_commands,public.relay_notifications,public.relay_subscriptions,public.relay_jobs,public.relay_outbox from public,anon,authenticated;
grant select on public.relay_projects,public.relay_memberships,public.relay_project_state,public.relay_project_revisions,public.relay_commands,public.relay_notifications,public.relay_subscriptions,public.relay_jobs,public.relay_outbox to authenticated;
grant all on public.relay_projects,public.relay_memberships,public.relay_project_state,public.relay_project_revisions,public.relay_commands,public.relay_notifications,public.relay_subscriptions,public.relay_jobs,public.relay_outbox to service_role;
create policy relay_project_metadata on public.relay_projects for select to authenticated using(public.relay_capability(id) is not null);
create policy relay_member_read on public.relay_memberships for select to authenticated using(user_id=auth.uid() and active or public.relay_capability(project_id)='owner');
create policy relay_state_read on public.relay_project_state for select to authenticated using(public.relay_capability(project_id) in ('owner','reviewer','editor','observer'));
create policy relay_revision_read on public.relay_project_revisions for select to authenticated using(public.relay_capability(project_id) in ('owner','reviewer','editor','observer'));
create policy relay_command_read on public.relay_commands for select to authenticated using(public.relay_capability(project_id) in ('owner','reviewer','editor','observer'));
create policy relay_notification_read on public.relay_notifications for select to authenticated using(user_id=auth.uid() and public.relay_capability(project_id) is not null);
create policy relay_subscription_read on public.relay_subscriptions for select to authenticated using(user_id=auth.uid() and public.relay_capability(project_id) is not null);
create policy relay_job_read on public.relay_jobs for select to authenticated using(public.relay_capability(project_id) in ('owner','reviewer','editor','observer'));
create policy relay_outbox_read on public.relay_outbox for select to authenticated using(public.relay_capability(project_id) in ('owner','reviewer','editor','observer'));

create function public.relay_create_project(p_actor uuid,p_project jsonb,p_member uuid) returns bigint
 language plpgsql security definer set search_path='' as $$
 declare v_id uuid:=(p_project->>'id')::uuid;
 begin
 if not exists(select 1 from jsonb_array_elements(p_project->'members') m where (m->>'id')::uuid=p_member) then raise exception 'member_binding_required';end if;
 insert into public.relay_projects(id,name,owner_user_id) values(v_id,p_project->>'name',p_actor);
 insert into public.relay_memberships(project_id,user_id,member_id,capability) values(v_id,p_actor,p_member,'owner');
 insert into public.relay_project_state values(v_id,p_project);
 insert into public.relay_project_revisions(project_id,revision,payload,actor_user_id) values(v_id,1,p_project,p_actor);
 return 1;
 end $$;

create function public.relay_commit_project(p_project uuid,p_actor uuid,p_command uuid,p_expected bigint,p_payload jsonb,p_hash text,p_summary text,p_targets uuid[],p_cap text,p_member uuid) returns jsonb
 language plpgsql security definer set search_path='' as $$
 declare v_revision bigint;v_cap text;v_existing public.relay_commands;v_next bigint;
 begin
 select revision into v_revision from public.relay_projects where id=p_project and active for update;
 if v_revision is null then raise exception 'access_denied';end if;
 select capability into v_cap from public.relay_memberships where project_id=p_project and user_id=p_actor and active;
 if v_cap not in ('owner','reviewer','editor') or v_cap is null or v_cap<>p_cap or not exists(select 1 from public.relay_memberships where project_id=p_project and user_id=p_actor and member_id=p_member and active) then raise exception 'access_denied';end if;
 select * into v_existing from public.relay_commands where project_id=p_project and command_id=p_command;
 if found then
 if v_existing.actor_user_id<>p_actor or v_existing.request_hash<>p_hash then raise exception 'idempotency_conflict';end if;
 return jsonb_build_object('revision',v_existing.resulting_revision,'duplicate',true);
 end if;
 if v_revision<>p_expected then raise exception 'revision_conflict';end if;
 if p_payload->>'id'<>p_project::text then raise exception 'project_identity_mismatch';end if;
 v_next:=v_revision+1;
 update public.relay_project_state set payload=p_payload where project_id=p_project;
 update public.relay_projects set revision=v_next,name=p_payload->>'name',updated_at=now() where id=p_project;
 insert into public.relay_project_revisions(project_id,revision,payload,actor_user_id) values(p_project,v_next,p_payload,p_actor);
 insert into public.relay_commands values(p_project,p_command,p_actor,p_hash,p_expected,v_next,p_summary,now());
 insert into public.relay_notifications(project_id,user_id,command_id,revision,summary)
 select p_project,m.user_id,p_command,v_next,case when m.capability='reader' then 'Reviewed project context changed' else p_summary end
 from public.relay_memberships m left join public.relay_subscriptions s on s.project_id=m.project_id and s.user_id=m.user_id
 where m.project_id=p_project and m.active and m.user_id<>p_actor and coalesce(s.enabled,true) and m.user_id=any(p_targets)
 on conflict do nothing;
 return jsonb_build_object('revision',v_next,'duplicate',false);
 end $$;

create function public.relay_set_membership(p_project uuid,p_actor uuid,p_user uuid,p_member uuid,p_cap text,p_active boolean,p_perspective text) returns void
 language plpgsql security definer set search_path='' as $$
 declare v_owner uuid;v_payload jsonb;
 begin
 select owner_user_id into v_owner from public.relay_projects where id=p_project and active for update;
 if v_owner is distinct from p_actor then raise exception 'owner_required';end if;
 if p_user=p_actor and (not p_active or p_cap<>'owner') then raise exception 'transfer_owner_first';end if;
 if p_cap='owner' and p_user<>p_actor then raise exception 'use_owner_transfer';end if;
 select payload into v_payload from public.relay_project_state where project_id=p_project;
 if not exists(select 1 from jsonb_array_elements(v_payload->'members') m where (m->>'id')::uuid=p_member) then raise exception 'unknown_member';end if;
 insert into public.relay_memberships values(p_project,p_user,p_member,p_cap,p_perspective,p_active)
 on conflict(project_id,user_id) do update set member_id=excluded.member_id,capability=excluded.capability,perspective=excluded.perspective,active=excluded.active;
 end $$;
create function public.relay_transfer_owner(p_project uuid,p_actor uuid,p_new_owner uuid) returns void
 language plpgsql security definer set search_path='' as $$
 declare v_owner uuid;
 begin
 select owner_user_id into v_owner from public.relay_projects where id=p_project and active for update;
 if v_owner is distinct from p_actor then raise exception 'owner_required';end if;
 if not exists(select 1 from public.relay_memberships where project_id=p_project and user_id=p_new_owner and active) then raise exception 'active_member_required';end if;
 update public.relay_memberships set capability='reviewer' where project_id=p_project and user_id=p_actor;
 update public.relay_memberships set capability='owner' where project_id=p_project and user_id=p_new_owner;
 update public.relay_projects set owner_user_id=p_new_owner where id=p_project;
 end $$;

create function public.relay_claim_job(p_lease_seconds integer default 45) returns setof public.relay_jobs
 language plpgsql security definer set search_path='' as $$
 declare v_job public.relay_jobs;
 begin
 if p_lease_seconds not between 10 and 120 then raise exception 'invalid_lease';end if;
 update public.relay_jobs set status='cancelled',lease_token=null,lease_until=null,updated_at=now() where status='leased' and lease_until<now() and cancel_requested;
 update public.relay_jobs set status='failed',error_code='retry_exhausted',updated_at=now() where status='queued' and attempts>=5;
 select j.* into v_job from public.relay_jobs j where ((j.status='queued' and j.available_at<=now()) or (j.status='leased' and j.lease_until<now())) and not j.cancel_requested and j.attempts<5 order by j.created_at for update skip locked limit 1;
 if not found then return;end if;
 -- An expired lease may have incurred provider charges. Never silently repeat it.
 if v_job.status='leased' then update public.relay_jobs set status='uncertain',cost_uncertain=true,error_code='expired_lease_review',lease_token=null,lease_until=null where id=v_job.id returning * into v_job;
 else update public.relay_jobs set status='leased',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+make_interval(secs=>p_lease_seconds),updated_at=now() where id=v_job.id returning * into v_job;end if;
 return next v_job;
 end $$;
create function public.relay_checkpoint_job(p_job uuid,p_lease uuid,p_checkpoint jsonb,p_status text,p_output jsonb,p_error text) returns boolean
 language plpgsql security definer set search_path='' as $$
 declare v_job public.relay_jobs;v_revision bigint;v_cap text;
 begin
 if p_status not in ('queued','succeeded','failed','review-required','uncertain','cancelled') then raise exception 'invalid_job_status';end if;
 if p_status in ('succeeded','review-required') then
 select * into v_job from public.relay_jobs where id=p_job;
 if not found then return false;end if;
 -- Same project lock/order as commits and membership changes: output cannot
 -- become reviewable against a concurrently changed revision or authority.
 select revision into v_revision from public.relay_projects where id=v_job.project_id and active for update;
 select capability into v_cap from public.relay_memberships where project_id=v_job.project_id and user_id=v_job.actor_user_id and active;
 if v_revision is distinct from v_job.expected_revision then raise exception 'stale_input';end if;
 if v_cap is null or v_cap not in ('owner','reviewer','editor') or v_job.kind<>'connector-read' and v_cap not in ('owner','reviewer') then raise exception 'access_denied';end if;
 end if;
 update public.relay_jobs set checkpoint=p_checkpoint,status=p_status,output=p_output,error_code=p_error,lease_token=null,lease_until=null,available_at=now()+make_interval(secs=>least(300,5*power(2,least(attempts,5))::integer)),updated_at=now(),cost_uncertain=(p_status='uncertain')
 where id=p_job and status='leased' and lease_token=p_lease and lease_until>now() and (not cancel_requested or p_status='cancelled');
 return found;
 end $$;

revoke all on function public.relay_create_project(uuid,jsonb,uuid),public.relay_commit_project(uuid,uuid,uuid,bigint,jsonb,text,text,uuid[],text,uuid),public.relay_set_membership(uuid,uuid,uuid,uuid,text,boolean,text),public.relay_transfer_owner(uuid,uuid,uuid),public.relay_claim_job(integer),public.relay_checkpoint_job(uuid,uuid,jsonb,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.relay_create_project(uuid,jsonb,uuid),public.relay_commit_project(uuid,uuid,uuid,bigint,jsonb,text,text,uuid[],text,uuid),public.relay_set_membership(uuid,uuid,uuid,uuid,text,boolean,text),public.relay_transfer_owner(uuid,uuid,uuid),public.relay_claim_job(integer),public.relay_checkpoint_job(uuid,uuid,jsonb,text,jsonb,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit) values('relay-originals','relay-originals',false,15000000) on conflict(id) do nothing;
-- Storage paths are PROJECT_UUID/ASSET_UUID; upload/delete requires the reviewed edge API.
create policy relay_original_read on storage.objects for select to authenticated using(bucket_id='relay-originals' and exists(select 1 from public.relay_memberships m join public.relay_projects p on p.id=m.project_id where m.project_id::text=(storage.foldername(name))[1] and m.user_id=auth.uid() and m.active and p.active and m.capability in ('owner','reviewer','editor','observer')));
