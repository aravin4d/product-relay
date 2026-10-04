-- Optional operational services. Browser roles have no direct write access.
create table public.relay_organizations(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 200),owner_user_id uuid not null references auth.users(id),created_at timestamptz not null default now());
create table public.relay_directory_groups(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.relay_organizations(id),name text not null check(length(name) between 1 and 200));
create table public.relay_directory_users(group_id uuid not null references public.relay_directory_groups(id),user_id uuid not null references auth.users(id),primary key(group_id,user_id));
create table public.relay_group_grants(project_id uuid not null references public.relay_projects(id),group_id uuid not null references public.relay_directory_groups(id),user_id uuid not null references auth.users(id),previous_membership jsonb,primary key(project_id,group_id,user_id),unique(project_id,user_id));
create table public.relay_delivery_settings(project_id uuid not null references public.relay_projects(id),user_id uuid not null references auth.users(id),channel text not null check(channel in ('email','slack','teams','webhook')),destination text not null check(length(destination)<=200),enabled boolean not null default false,updated_at timestamptz not null default now(),last_polled_at timestamptz not null default '-infinity',primary key(project_id,user_id,channel));
create table public.relay_delivery_batches(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.relay_projects(id),user_id uuid not null references auth.users(id),channel text not null,destination text not null,notification_ids uuid[] not null,summary text not null,status text not null default 'queued' check(status in ('queued','sending','sent','failed','uncertain','cancelled')),lease_until timestamptz,created_at timestamptz not null default now(),sent_at timestamptz,error_code text);
create table public.relay_delivery_receipts(notification_id uuid not null references public.relay_notifications(id),channel text not null,batch_id uuid not null references public.relay_delivery_batches(id),primary key(notification_id,channel));
create table public.relay_backup_receipts(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.relay_projects(id),revision bigint not null,artifact_hash text not null check(length(artifact_hash)=64),storage_label text not null,verified_at timestamptz not null,restore_at timestamptz,recovery_seconds integer,created_at timestamptz not null default now());
alter table public.relay_operational_controls add column backup_interval_hours integer not null default 24 check(backup_interval_hours between 1 and 168),add column retention_enabled boolean not null default false,add column backup_max_age_hours integer not null default 48 check(backup_max_age_hours between 1 and 336),add column queue_max_age_minutes integer not null default 30 check(queue_max_age_minutes between 1 and 1440),add column alert_destination text not null default '';
do $$ declare t text;begin foreach t in array array['relay_organizations','relay_directory_groups','relay_directory_users','relay_group_grants','relay_delivery_settings','relay_delivery_batches','relay_delivery_receipts','relay_backup_receipts'] loop execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from public,anon,authenticated',t);execute format('grant all on public.%I to service_role',t);end loop;end $$;

create table public.relay_offline_returns(project_id uuid not null references public.relay_projects(id),command_id uuid not null,rebased_command_id uuid not null,actor_user_id uuid not null,payload jsonb not null,at timestamptz not null default now(),primary key(project_id,command_id));
alter table public.relay_offline_returns enable row level security;revoke all on public.relay_offline_returns from public,anon,authenticated;grant all on public.relay_offline_returns to service_role;
create function public.relay_rebase_project(p_project uuid,p_actor uuid,p_command uuid,p_expected bigint,p_payload jsonb,p_hash text,p_summary text,p_targets uuid[],p_cap text,p_member uuid,p_original_command uuid,p_return jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 perform 1 from public.relay_projects where id=p_project for update;
 if exists(select 1 from public.relay_commands where project_id=p_project and command_id=p_original_command) then raise exception 'already_committed';end if;
 if exists(select 1 from public.relay_offline_returns where project_id=p_project and command_id=p_original_command and rebased_command_id<>p_command) then raise exception 'already_rebased';end if;
 if p_return->>'id'<>p_project::text then raise exception 'project_identity_mismatch';end if;
 insert into public.relay_offline_returns(project_id,command_id,rebased_command_id,actor_user_id,payload) values(p_project,p_original_command,p_command,p_actor,p_return) on conflict do nothing;
 result:=public.relay_commit_project(p_project,p_actor,p_command,p_expected,p_payload,p_hash,p_summary,p_targets,p_cap,p_member);
 insert into public.relay_administration_audit(project_id,actor_user_id,operation,details) values(p_project,p_actor,'reviewed-rebase',jsonb_build_object('originalCommand',p_original_command,'newCommand',p_command));return result;
end $$;

create function public.relay_directory_command(p_actor uuid,p_operation text,p_input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare org uuid;grp uuid;u uuid;project uuid;member uuid;cap text;rows jsonb;grant_row record;prior jsonb;
begin
 if p_operation='create' then insert into public.relay_organizations(name,owner_user_id) values(p_input->>'name',p_actor) returning id into org;return jsonb_build_object('id',org);end if;
 org:=(p_input->>'organizationId')::uuid;
 perform 1 from public.relay_organizations where id=org and owner_user_id=p_actor for update;if not found then raise exception 'owner_required';end if;
 if p_operation='group' then insert into public.relay_directory_groups(organization_id,name) values(org,p_input->>'name') returning id into grp;return jsonb_build_object('id',grp);end if;
 grp:=(p_input->>'groupId')::uuid;if not exists(select 1 from public.relay_directory_groups where id=grp and organization_id=org) then raise exception 'access_denied';end if;
 if p_operation='user' then u:=(p_input->>'userId')::uuid;if (p_input->>'active')::boolean then insert into public.relay_directory_users values(grp,u) on conflict do nothing;else
  for grant_row in select * from public.relay_group_grants where group_id=grp and user_id=u order by project_id loop
   if not exists(select 1 from public.relay_projects where id=grant_row.project_id and owner_user_id=p_actor) then raise exception 'owner_required';end if;
   select row_to_json(m) into prior from public.relay_memberships m where project_id=grant_row.project_id and user_id=u;
   if grant_row.previous_membership is not null then prior:=grant_row.previous_membership;perform public.relay_audited_membership(grant_row.project_id,p_actor,u,(prior->>'member_id')::uuid,prior->>'capability',(prior->>'active')::boolean,prior->>'perspective');
   elsif prior is not null then perform public.relay_audited_membership(grant_row.project_id,p_actor,u,(prior->>'member_id')::uuid,prior->>'capability',false,prior->>'perspective');end if;
  end loop;
  delete from public.relay_group_grants where group_id=grp and user_id=u;delete from public.relay_directory_users where group_id=grp and user_id=u;
 end if;return '{}';end if;
 if p_operation='grant' then
  project:=(p_input->>'projectId')::uuid;perform 1 from public.relay_projects where id=project and owner_user_id=p_actor and active for update;if not found then raise exception 'owner_required';end if;
  cap:=p_input->>'capability';if cap not in ('editor','reviewer','observer','reader') then raise exception 'invalid_capability';end if;
  for rows in select value from jsonb_array_elements(p_input->'members') loop
   u:=(rows->>'userId')::uuid;member:=(rows->>'memberId')::uuid;if not exists(select 1 from public.relay_directory_users where group_id=grp and user_id=u) then raise exception 'active_member_required';end if;
   select row_to_json(m) into prior from public.relay_memberships m where project_id=project and user_id=u;
   insert into public.relay_group_grants(project_id,group_id,user_id,previous_membership) values(project,grp,u,prior) on conflict(project_id,group_id,user_id) do nothing;
   perform public.relay_audited_membership(project,p_actor,u,member,cap,true,coalesce(p_input->>'perspective','Everyone'));
  end loop;
  insert into public.relay_administration_audit(project_id,actor_user_id,operation,details) values(project,p_actor,'directory-group-grant',jsonb_build_object('groupId',grp,'count',jsonb_array_length(p_input->'members')));return '{}';
 end if;raise exception 'invalid_directory_operation';
end $$;

create function public.relay_claim_delivery() returns setof public.relay_delivery_batches
language plpgsql security definer set search_path='' as $$
declare settings record;ids uuid[];batch uuid;
begin
 update public.relay_delivery_batches set status='uncertain',error_code='send_outcome_uncertain' where status='sending' and lease_until<now();
 for settings in select d.*,s.digest_minutes from public.relay_delivery_settings d join public.relay_subscriptions s using(project_id,user_id) join public.relay_memberships m using(project_id,user_id) join public.relay_projects p on p.id=d.project_id where d.enabled and s.enabled and m.active and p.active order by d.last_polled_at,d.updated_at limit 100 for update of d skip locked loop
  select array_agg(id) into ids from (select n.id from public.relay_notifications n where n.project_id=settings.project_id and n.user_id=settings.user_id and n.created_at<=now()-make_interval(mins=>settings.digest_minutes) and not exists(select 1 from public.relay_delivery_receipts r where r.notification_id=n.id and r.channel=settings.channel) order by n.created_at limit 100) q;
  if cardinality(ids)>0 then
   insert into public.relay_delivery_batches(project_id,user_id,channel,destination,notification_ids,summary) values(settings.project_id,settings.user_id,settings.channel,settings.destination,ids,'Product Relay: '||cardinality(ids)||' relevant update(s). Open the authorized project to review context.') returning id into batch;
   insert into public.relay_delivery_receipts select unnest(ids),settings.channel,batch;
  end if;
  update public.relay_delivery_settings set last_polled_at=now() where project_id=settings.project_id and user_id=settings.user_id and channel=settings.channel;
 end loop;
 return query update public.relay_delivery_batches set status='sending',lease_until=now()+interval '90 seconds' where id=(select b.id from public.relay_delivery_batches b where b.status='queued' order by created_at for update skip locked limit 1) returning *;
end $$;

create function public.relay_prune_operations(p_project uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare controls public.relay_operational_controls;rev bigint;cutoff timestamptz;n integer;j integer;r integer;
begin
 select revision into rev from public.relay_projects where id=p_project and active for update;
 select * into controls from public.relay_operational_controls where project_id=p_project;
 if not controls.retention_enabled or controls.retention_days is null or not exists(select 1 from public.relay_backup_receipts where project_id=p_project and revision>=rev and verified_at>now()-interval '48 hours') then return jsonb_build_object('pruned',false,'reason','current verified backup and enabled retention required');end if;
 cutoff:=now()-make_interval(days=>controls.retention_days);
 -- Preserve all approval/source/command journals, original objects and referenced job outputs.
 delete from public.relay_jobs j where j.project_id=p_project and j.status in ('failed','cancelled','succeeded','review-required') and j.updated_at<cutoff and not exists(select 1 from public.relay_project_state s where s.project_id=p_project and s.payload::text like '%'||j.id::text||'%');get diagnostics j=row_count;
 delete from public.relay_project_revisions where project_id=p_project and revision<rev and at<cutoff;get diagnostics r=row_count;
 -- Notification delivery receipts retain their parent foreign keys; prune only never-exported read feed entries.
 delete from public.relay_notifications n where n.project_id=p_project and n.read_at is not null and n.created_at<cutoff and not exists(select 1 from public.relay_delivery_receipts d where d.notification_id=n.id);get diagnostics n=row_count;
 return jsonb_build_object('pruned',true,'jobs',j,'oldServerSnapshots',r,'readNotifications',n);
end $$;
revoke all on function public.relay_rebase_project(uuid,uuid,uuid,bigint,jsonb,text,text,uuid[],text,uuid,uuid,jsonb),public.relay_directory_command(uuid,text,jsonb),public.relay_claim_delivery(),public.relay_prune_operations(uuid) from public,anon,authenticated;
grant execute on function public.relay_rebase_project(uuid,uuid,uuid,bigint,jsonb,text,text,uuid[],text,uuid,uuid,jsonb),public.relay_directory_command(uuid,text,jsonb),public.relay_claim_delivery(),public.relay_prune_operations(uuid) to service_role;

create function public.relay_set_operations(p_project uuid,p_actor uuid,p_settings jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.relay_projects where id=p_project and owner_user_id=p_actor and active for update;if not found then raise exception 'owner_required';end if;
 update public.relay_operational_controls set backup_interval_hours=coalesce((p_settings->>'backupIntervalHours')::integer,backup_interval_hours),backup_max_age_hours=coalesce((p_settings->>'backupMaxAgeHours')::integer,backup_max_age_hours),queue_max_age_minutes=coalesce((p_settings->>'queueMaxAgeMinutes')::integer,queue_max_age_minutes),retention_enabled=coalesce((p_settings->>'retentionEnabled')::boolean,retention_enabled),updated_at=now() where project_id=p_project;
 insert into public.relay_administration_audit(project_id,actor_user_id,operation,details) values(p_project,p_actor,'operations-settings',p_settings);
end $$;
revoke all on function public.relay_set_operations(uuid,uuid,jsonb) from public,anon,authenticated;grant execute on function public.relay_set_operations(uuid,uuid,jsonb) to service_role;

create table public.relay_health_signals(project_id uuid primary key references public.relay_projects(id),signals text[] not null,updated_at timestamptz not null default now());
alter table public.relay_health_signals enable row level security;revoke all on public.relay_health_signals from public,anon,authenticated;grant all on public.relay_health_signals to service_role;
create function public.relay_record_health(p_project uuid,p_owner uuid,p_revision bigint,p_signals text[]) returns void language plpgsql security definer set search_path='' as $$
declare old text[];begin
 perform 1 from public.relay_projects where id=p_project and active and owner_user_id=p_owner for update;if not found then return;end if;
 select signals into old from public.relay_health_signals where project_id=p_project;
 if cardinality(p_signals)>0 and old is distinct from p_signals then insert into public.relay_notifications(project_id,user_id,command_id,revision,summary) values(p_project,p_owner,gen_random_uuid(),p_revision,'Service needs attention: '||array_to_string(p_signals,', '));end if;
 insert into public.relay_health_signals values(p_project,p_signals,now()) on conflict(project_id) do update set signals=excluded.signals,updated_at=excluded.updated_at;
end $$;
revoke all on function public.relay_record_health(uuid,uuid,bigint,text[]) from public,anon,authenticated;grant execute on function public.relay_record_health(uuid,uuid,bigint,text[]) to service_role;

-- Fair bounded health scheduling: a project cannot be hidden behind the first page forever.
alter table public.relay_projects add column health_next_check timestamptz not null default '-infinity';
create index relay_health_due on public.relay_projects(health_next_check) where active;
create function public.relay_claim_health_projects(p_limit integer default 20) returns table(id uuid,owner_user_id uuid,revision bigint)
language plpgsql security definer set search_path='' as $$
begin
 return query update public.relay_projects p set health_next_check=now()+interval '5 minutes'
 where p.id in (select q.id from public.relay_projects q where q.active and q.health_next_check<=now() order by q.health_next_check,q.id for update skip locked limit greatest(1,least(p_limit,100)))
 returning p.id,p.owner_user_id,p.revision;
end $$;
revoke all on function public.relay_claim_health_projects(integer) from public,anon,authenticated;
grant execute on function public.relay_claim_health_projects(integer) to service_role;

-- Keep manual membership overrides and combined settings atomic with their audit records.
create function public.relay_direct_membership(p_project uuid,p_actor uuid,p_user uuid,p_member uuid,p_cap text,p_active boolean,p_perspective text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.relay_audited_membership(p_project,p_actor,p_user,p_member,p_cap,p_active,p_perspective);
 delete from public.relay_group_grants where project_id=p_project and user_id=p_user;
end $$;
create function public.relay_set_all_controls(p_project uuid,p_actor uuid,p_enabled boolean,p_daily integer,p_controls jsonb,p_operations jsonb) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.relay_set_controls(p_project,p_actor,p_enabled,p_daily,p_controls);
 perform public.relay_set_operations(p_project,p_actor,p_operations);
end $$;
revoke all on function public.relay_direct_membership(uuid,uuid,uuid,uuid,text,boolean,text),public.relay_set_all_controls(uuid,uuid,boolean,integer,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.relay_direct_membership(uuid,uuid,uuid,uuid,text,boolean,text),public.relay_set_all_controls(uuid,uuid,boolean,integer,jsonb,jsonb) to service_role;
