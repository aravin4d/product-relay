create table public.relay_administration_audit (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.relay_projects(id),
 actor_user_id uuid not null, operation text not null, details jsonb not null, at timestamptz not null default now()
);
alter table public.relay_administration_audit enable row level security;
revoke all on public.relay_administration_audit from public,anon,authenticated;
grant select on public.relay_administration_audit to authenticated;
grant all on public.relay_administration_audit to service_role;
create policy relay_admin_audit_read on public.relay_administration_audit for select to authenticated using(public.relay_capability(project_id)='owner');

-- Atomic access/revision checks share the same project lock as commits/transfers.
create function public.relay_enqueue_job(p_project uuid,p_actor uuid,p_command uuid,p_revision bigint,p_kind text,p_hash text,p_input jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_cap text;v_revision bigint;v_job public.relay_jobs;
begin
 select revision into v_revision from public.relay_projects where id=p_project and active for update;
 select capability into v_cap from public.relay_memberships where project_id=p_project and user_id=p_actor and active;
 if v_cap is null or v_cap not in ('owner','reviewer','editor') then raise exception 'access_denied';end if;
 if p_kind not in ('connector-read','connector-write','test-dispatch','ocr','transcribe') or length(p_hash)<>64 or pg_column_size(p_input)>10000000 then raise exception 'invalid_job';end if;
 if p_kind<>'connector-read' and v_cap not in ('owner','reviewer') then raise exception 'access_denied';end if;
 select * into v_job from public.relay_jobs where project_id=p_project and idempotency_key=p_command;
 if found then
  if v_job.input_hash<>p_hash or v_job.kind<>p_kind or v_job.actor_user_id<>p_actor then raise exception 'idempotency_conflict';end if;
  return v_job.id;
 end if;
 if v_revision is distinct from p_revision then raise exception 'revision_conflict';end if;
 insert into public.relay_jobs(project_id,actor_user_id,kind,idempotency_key,input_hash,expected_revision,input)
 values(p_project,p_actor,p_kind,p_command,p_hash,p_revision,p_input) returning * into v_job;
 return v_job.id;
end $$;
revoke all on function public.relay_enqueue_job(uuid,uuid,uuid,bigint,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.relay_enqueue_job(uuid,uuid,uuid,bigint,text,text,jsonb) to service_role;

-- These wrapper RPCs place access changes and audit entries in one transaction.
create function public.relay_audited_membership(p_project uuid,p_actor uuid,p_user uuid,p_member uuid,p_cap text,p_active boolean,p_perspective text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.relay_set_membership(p_project,p_actor,p_user,p_member,p_cap,p_active,p_perspective);
 insert into public.relay_administration_audit(project_id,actor_user_id,operation,details)
 values(p_project,p_actor,'membership',jsonb_build_object('userId',p_user,'memberId',p_member,'capability',p_cap,'active',p_active,'perspective',p_perspective));
end $$;
create function public.relay_audited_transfer(p_project uuid,p_actor uuid,p_new_owner uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.relay_transfer_owner(p_project,p_actor,p_new_owner);
 insert into public.relay_administration_audit(project_id,actor_user_id,operation,details)
 values(p_project,p_actor,'ownership-transfer',jsonb_build_object('previousOwner',p_actor,'newOwner',p_new_owner));
end $$;
revoke all on function public.relay_audited_membership(uuid,uuid,uuid,uuid,text,boolean,text),public.relay_audited_transfer(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.relay_audited_membership(uuid,uuid,uuid,uuid,text,boolean,text),public.relay_audited_transfer(uuid,uuid,uuid) to service_role;
