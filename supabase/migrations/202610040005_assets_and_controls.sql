-- Provider call receipts retain measurements/identity, never prompt or output bodies.
create table public.relay_ai_receipts (
 id uuid primary key, project_id uuid references public.relay_projects(id), actor_user_id uuid not null,
 input_hash text not null check(length(input_hash)=64), provider text not null, model text not null,
 prompt_version text not null, schema_version integer not null, at timestamptz not null,
 usage jsonb, latency_ms bigint not null check(latency_ms>=0)
);
alter table public.relay_ai_receipts enable row level security;
revoke all on public.relay_ai_receipts from public,anon,authenticated;
grant select on public.relay_ai_receipts to authenticated;
grant all on public.relay_ai_receipts to service_role;
create policy relay_ai_receipt_read on public.relay_ai_receipts for select to authenticated using(actor_user_id=auth.uid() or public.relay_capability(project_id) in ('owner','reviewer'));

create table public.relay_asset_receipts (
 project_id uuid not null references public.relay_projects(id), hash text not null check(length(hash)=64),
 object_key text not null, byte_length bigint not null check(byte_length between 1 and 6000000),
 file_name text not null, media_type text not null, actor_user_id uuid not null, at timestamptz not null default now(),
 primary key(project_id,hash)
);
alter table public.relay_asset_receipts enable row level security;
revoke all on public.relay_asset_receipts from public,anon,authenticated;
grant select on public.relay_asset_receipts to authenticated;
grant all on public.relay_asset_receipts to service_role;
create policy relay_asset_receipt_read on public.relay_asset_receipts for select to authenticated using(public.relay_capability(project_id) in ('owner','reviewer','editor','observer'));

create table public.relay_operational_controls (
 project_id uuid primary key references public.relay_projects(id), alert_owner text not null default '',
 retention_days integer check(retention_days between 30 and 3650), restore_drill_at timestamptz,
 restore_evidence text not null default '', recovery_minutes integer check(recovery_minutes>0),
 recoverable_loss_minutes integer check(recoverable_loss_minutes>=0),
 updated_by uuid not null, updated_at timestamptz not null default now()
);
alter table public.relay_operational_controls enable row level security;
revoke all on public.relay_operational_controls from public,anon,authenticated;
grant select on public.relay_operational_controls to authenticated;
grant all on public.relay_operational_controls to service_role;
create policy relay_operational_controls_read on public.relay_operational_controls for select to authenticated using(public.relay_capability(project_id) in ('owner','reviewer','editor','observer'));

create function public.relay_set_controls(p_project uuid,p_actor uuid,p_enabled boolean,p_daily integer,p_controls jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare v_owner uuid;
begin
 select owner_user_id into v_owner from public.relay_projects where id=p_project and active for update;
 if v_owner is distinct from p_actor then raise exception 'owner_required';end if;
 if p_daily<0 or p_daily>100 or length(coalesce(p_controls->>'alertOwner',''))>300 or length(coalesce(p_controls->>'restoreEvidence',''))>2000 then raise exception 'invalid_controls';end if;
 insert into public.relay_project_ai_budgets(project_id,enabled,daily_requests) values(p_project,p_enabled,p_daily)
 on conflict(project_id) do update set enabled=excluded.enabled,daily_requests=excluded.daily_requests;
 insert into public.relay_operational_controls(project_id,alert_owner,retention_days,restore_drill_at,restore_evidence,recovery_minutes,recoverable_loss_minutes,updated_by)
 values(p_project,coalesce(p_controls->>'alertOwner',''),nullif(p_controls->>'retentionDays','')::integer,nullif(p_controls->>'restoreDrillAt','')::timestamptz,coalesce(p_controls->>'restoreEvidence',''),nullif(p_controls->>'recoveryMinutes','')::integer,nullif(p_controls->>'recoverableLossMinutes','')::integer,p_actor)
 on conflict(project_id) do update set alert_owner=excluded.alert_owner,retention_days=excluded.retention_days,restore_drill_at=excluded.restore_drill_at,restore_evidence=excluded.restore_evidence,recovery_minutes=excluded.recovery_minutes,recoverable_loss_minutes=excluded.recoverable_loss_minutes,updated_by=p_actor,updated_at=now();
 insert into public.relay_administration_audit(project_id,actor_user_id,operation,details)
 values(p_project,p_actor,'operational-controls',jsonb_build_object('enabled',p_enabled,'dailyRequests',p_daily,'controls',p_controls));
end $$;
revoke all on function public.relay_set_controls(uuid,uuid,boolean,integer,jsonb) from public,anon,authenticated;
grant execute on function public.relay_set_controls(uuid,uuid,boolean,integer,jsonb) to service_role;
