-- Continuation hardening: media authority, delivery leases and operational review.
create or replace function public.relay_enqueue_job(p_project uuid,p_actor uuid,p_command uuid,p_revision bigint,p_kind text,p_hash text,p_input jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_cap text;v_revision bigint;v_job public.relay_jobs;
begin
 select revision into v_revision from public.relay_projects where id=p_project and active for update;
 select capability into v_cap from public.relay_memberships where project_id=p_project and user_id=p_actor and active;
 if v_cap is null or v_cap not in ('owner','reviewer','editor') then raise exception 'access_denied';end if;
 if p_kind not in ('connector-read','connector-write','test-dispatch','ocr','transcribe') or length(p_hash)<>64 or pg_column_size(p_input)>10000000 then raise exception 'invalid_job';end if;
 if p_kind in ('connector-write','test-dispatch') and v_cap not in ('owner','reviewer') then raise exception 'access_denied';end if;
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

create or replace function public.relay_touch_job(p_job uuid,p_lease uuid,p_checkpoint jsonb,p_lease_seconds integer) returns boolean
 language plpgsql security definer set search_path='' as $$
 declare v_job public.relay_jobs;v_revision bigint;v_cap text;
 begin
 if p_lease_seconds not between 10 and 120 then raise exception 'invalid_lease';end if;
 select * into v_job from public.relay_jobs where id=p_job;
 if not found then return false;end if;
 select revision into v_revision from public.relay_projects where id=v_job.project_id and active for update;
 select capability into v_cap from public.relay_memberships where project_id=v_job.project_id and user_id=v_job.actor_user_id and active;
 if v_revision is distinct from v_job.expected_revision or v_cap is null or v_cap not in ('owner','reviewer','editor') or v_job.kind in ('connector-write','test-dispatch') and v_cap not in ('owner','reviewer') then return false;end if;
 update public.relay_jobs set checkpoint=p_checkpoint,lease_until=now()+make_interval(secs=>p_lease_seconds),updated_at=now() where id=p_job and status='leased' and lease_token=p_lease and lease_until>now() and not cancel_requested;
 return found;
 end $$;

create or replace function public.relay_checkpoint_job(p_job uuid,p_lease uuid,p_checkpoint jsonb,p_status text,p_output jsonb,p_error text) returns boolean
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
 if v_cap is null or v_cap not in ('owner','reviewer','editor') or v_job.kind in ('connector-write','test-dispatch') and v_cap not in ('owner','reviewer') then raise exception 'access_denied';end if;
 end if;
 update public.relay_jobs set checkpoint=p_checkpoint,status=p_status,output=p_output,error_code=p_error,lease_token=null,lease_until=null,available_at=now()+make_interval(secs=>least(300,5*power(2,least(attempts,5))::integer)),updated_at=now(),cost_uncertain=(p_status='uncertain' and kind in ('ocr','transcribe'))
 where id=p_job and status='leased' and lease_token=p_lease and lease_until>now() and (not cancel_requested or p_status='cancelled');
 return found;
 end $$;

alter table public.relay_delivery_batches add column lease_token uuid;
create or replace function public.relay_claim_delivery() returns setof public.relay_delivery_batches
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
 return query update public.relay_delivery_batches set status='sending',lease_token=gen_random_uuid(),lease_until=now()+interval '90 seconds' where id=(select b.id from public.relay_delivery_batches b where b.status='queued' order by created_at for update skip locked limit 1) returning *;
end $$;

create function public.relay_finish_delivery(p_batch uuid,p_lease uuid,p_status text,p_error text default null) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if p_status not in ('sent','failed','uncertain','cancelled') or length(coalesce(p_error,''))>200 then raise exception 'invalid_delivery_result';end if;
 update public.relay_delivery_batches set status=p_status,error_code=p_error,sent_at=case when p_status='sent' then now() else sent_at end
 where id=p_batch and lease_token=p_lease and (status='sending' and lease_until>now() or status in ('sending','uncertain') and p_status in ('sent','uncertain'));
 return found;
end $$;

create function public.relay_save_delivery(p_project uuid,p_actor uuid,p_channel text,p_destination text,p_enabled boolean,p_digest integer,p_subscription_enabled boolean) returns void
language plpgsql security definer set search_path='' as $$
declare perspective text;
begin
 perform 1 from public.relay_projects where id=p_project and active for update;if not found then raise exception 'access_denied';end if;
 select m.perspective into perspective from public.relay_memberships m where m.project_id=p_project and m.user_id=p_actor and m.active;if not found then raise exception 'access_denied';end if;
 if p_channel not in ('email','slack','teams','webhook') or length(p_destination)>200 or p_digest not between 0 and 10080 then raise exception 'invalid_delivery_settings';end if;
 insert into public.relay_subscriptions(project_id,user_id,enabled,digest_minutes,perspective,owned_only) values(p_project,p_actor,p_subscription_enabled,p_digest,perspective,false)
 on conflict(project_id,user_id) do update set enabled=excluded.enabled,digest_minutes=excluded.digest_minutes;
 insert into public.relay_delivery_settings(project_id,user_id,channel,destination,enabled) values(p_project,p_actor,p_channel,p_destination,p_enabled)
 on conflict(project_id,user_id,channel) do update set destination=excluded.destination,enabled=excluded.enabled,updated_at=now();
 insert into public.relay_administration_audit(project_id,actor_user_id,operation,details) values(p_project,p_actor,'delivery-consent',jsonb_build_object('channel',p_channel,'destination',p_destination,'enabled',p_enabled,'digestMinutes',p_digest,'subscriptionEnabled',p_subscription_enabled));
end $$;

create table public.relay_operational_reviews(
 id uuid primary key,project_id uuid not null references public.relay_projects(id),job_id uuid references public.relay_jobs(id),delivery_batch_id uuid references public.relay_delivery_batches(id),actor_user_id uuid not null references auth.users(id),report jsonb not null,at timestamptz not null default clock_timestamp(),check((job_id is not null)::integer+(delivery_batch_id is not null)::integer=1)
);
alter table public.relay_operational_reviews enable row level security;revoke all on public.relay_operational_reviews from public,anon,authenticated;grant all on public.relay_operational_reviews to service_role;
create function public.relay_review_operation(p_project uuid,p_actor uuid,p_command uuid,p_job uuid,p_delivery uuid,p_report jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare cap text;old public.relay_operational_reviews;
begin
 perform 1 from public.relay_projects where id=p_project and active for update;if not found then raise exception 'access_denied';end if;
 select capability into cap from public.relay_memberships where project_id=p_project and user_id=p_actor and active;if cap is null or cap not in ('owner','reviewer') then raise exception 'reviewer_required';end if;
 if (p_job is null)=(p_delivery is null) then raise exception 'invalid_review_target';end if;
 if p_job is not null and not exists(select 1 from public.relay_jobs where id=p_job and project_id=p_project and status not in ('queued','leased')) then raise exception 'job_still_active';end if;
 if p_delivery is not null and not exists(select 1 from public.relay_delivery_batches where id=p_delivery and project_id=p_project and status not in ('queued','sending')) then raise exception 'delivery_still_active';end if;
 if coalesce(p_report->>'decision','') not in ('confirmed-side-effect','confirmed-no-side-effect','unknown') or coalesce(p_report->>'billing','') not in ('unreviewed','billing-confirmed') or length(coalesce(p_report->>'note','')) not between 1 and 4000 or length(coalesce(p_report->>'evidence','')) not between 1 and 2000 then raise exception 'review_evidence_required';end if;
 select * into old from public.relay_operational_reviews where id=p_command;if found then
  if old.project_id<>p_project or old.job_id is distinct from p_job or old.delivery_batch_id is distinct from p_delivery or old.actor_user_id<>p_actor or old.report<>p_report then raise exception 'idempotency_conflict';end if;return;
 end if;
 insert into public.relay_operational_reviews(id,project_id,job_id,delivery_batch_id,actor_user_id,report) values(p_command,p_project,p_job,p_delivery,p_actor,p_report);
 insert into public.relay_administration_audit(project_id,actor_user_id,operation,details) values(p_project,p_actor,'operator-reconciliation',jsonb_build_object('jobId',p_job,'deliveryId',p_delivery,'reviewId',p_command,'authority','account-authenticated operator report; not provider retrieval'));
end $$;

create function public.relay_project_job_health(p_project uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'queue',(select count(*) from public.relay_jobs where project_id=p_project and status in ('queued','leased')),
 'failures',(select count(*) from public.relay_jobs where project_id=p_project and status='failed'),
 'recentFailures',(select count(*) from public.relay_jobs where project_id=p_project and status='failed' and updated_at>now()-interval '24 hours'),
 'oldestPendingAt',(select min(updated_at) from public.relay_jobs where project_id=p_project and status in ('queued','leased')),
 'uncertain',(select count(*) from public.relay_jobs j where j.project_id=p_project and (j.status='uncertain' and not exists(select 1 from public.relay_operational_reviews r where r.job_id=j.id and r.report->>'decision'<>'unknown' and r.id=(select n.id from public.relay_operational_reviews n where n.job_id=j.id order by n.at desc,n.id desc limit 1)) or j.cost_uncertain and not exists(select 1 from public.relay_operational_reviews r where r.job_id=j.id and r.report->>'billing'='billing-confirmed' and r.id=(select n.id from public.relay_operational_reviews n where n.job_id=j.id order by n.at desc,n.id desc limit 1)))),
 'uncertainDeliveries',(select count(*) from public.relay_delivery_batches b where b.project_id=p_project and b.status='uncertain' and not exists(select 1 from public.relay_operational_reviews r where r.delivery_batch_id=b.id and r.report->>'decision'<>'unknown' and r.id=(select n.id from public.relay_operational_reviews n where n.delivery_batch_id=b.id order by n.at desc,n.id desc limit 1)))
 )
 $$;
create index relay_reviews_delivery on public.relay_operational_reviews(delivery_batch_id,at desc);
create index relay_reviews_job on public.relay_operational_reviews(job_id,at desc);
create index relay_health_jobs on public.relay_jobs(project_id,status,updated_at);
revoke all on function public.relay_finish_delivery(uuid,uuid,text,text),public.relay_save_delivery(uuid,uuid,text,text,boolean,integer,boolean),public.relay_review_operation(uuid,uuid,uuid,uuid,uuid,jsonb),public.relay_project_job_health(uuid) from public,anon,authenticated;
grant execute on function public.relay_finish_delivery(uuid,uuid,text,text),public.relay_save_delivery(uuid,uuid,text,text,boolean,integer,boolean),public.relay_review_operation(uuid,uuid,uuid,uuid,uuid,jsonb),public.relay_project_job_health(uuid) to service_role;

create or replace function public.relay_prune_operations(p_project uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare controls public.relay_operational_controls;rev bigint;cutoff timestamptz;n integer;j integer;r integer;
begin
 select revision into rev from public.relay_projects where id=p_project and active for update;
 select * into controls from public.relay_operational_controls where project_id=p_project;
 if not controls.retention_enabled or controls.retention_days is null or not exists(select 1 from public.relay_backup_receipts where project_id=p_project and revision>=rev and verified_at>now()-interval '48 hours') then return jsonb_build_object('pruned',false,'reason','current verified backup and enabled retention required');end if;
 cutoff:=now()-make_interval(days=>controls.retention_days);
 -- Preserve all approval/source/command journals, original objects and referenced job outputs.
 delete from public.relay_jobs j where j.project_id=p_project and j.status in ('failed','cancelled','succeeded','review-required') and j.updated_at<cutoff and not exists(select 1 from public.relay_project_state s where s.project_id=p_project and s.payload::text like '%'||j.id::text||'%') and not exists(select 1 from public.relay_offline_returns r where r.project_id=p_project and r.payload::text like '%'||j.id::text||'%') and not exists(select 1 from public.relay_outbox o where o.project_id=p_project and o.idempotency_key=j.idempotency_key) and not exists(select 1 from public.relay_operational_reviews v where v.job_id=j.id);get diagnostics j=row_count;
 delete from public.relay_project_revisions where project_id=p_project and revision<rev and at<cutoff;get diagnostics r=row_count;
 -- Notification delivery receipts retain their parent foreign keys; prune only never-exported read feed entries.
 delete from public.relay_notifications n where n.project_id=p_project and n.read_at is not null and n.created_at<cutoff and not exists(select 1 from public.relay_delivery_receipts d where d.notification_id=n.id);get diagnostics n=row_count;
 return jsonb_build_object('pruned',true,'jobs',j,'oldServerSnapshots',r,'readNotifications',n);
end $$;

-- Retain the lease identity for late outcomes without permitting a resend.
create or replace function public.relay_claim_job(p_lease_seconds integer default 45) returns setof public.relay_jobs
 language plpgsql security definer set search_path='' as $$
 declare v_job public.relay_jobs;
 begin
 if p_lease_seconds not between 10 and 120 then raise exception 'invalid_lease';end if;
 update public.relay_jobs set status=case when checkpoint->>'phase' in ('provider-send-started','external-send-started') then 'uncertain' else 'cancelled' end,cost_uncertain=coalesce(checkpoint->>'phase'='provider-send-started',false),error_code=case when checkpoint->>'phase' in ('provider-send-started','external-send-started') then 'cancel_outcome_uncertain' else error_code end,lease_until=null,updated_at=now() where status='leased' and lease_until<now() and cancel_requested;
 update public.relay_jobs set status='failed',error_code='retry_exhausted',updated_at=now() where status='queued' and attempts>=5;
 select j.* into v_job from public.relay_jobs j where ((j.status='queued' and j.available_at<=now() and j.attempts<5) or (j.status='leased' and j.lease_until<now())) and not j.cancel_requested order by j.created_at for update skip locked limit 1;
 if not found then return;end if;
 -- An expired lease may have incurred provider charges. Never silently repeat it.
 if v_job.status='leased' then update public.relay_jobs set status='uncertain',cost_uncertain=kind in ('ocr','transcribe'),error_code='expired_lease_review',lease_until=null where id=v_job.id returning * into v_job;
 else update public.relay_jobs set status='leased',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+make_interval(secs=>p_lease_seconds),updated_at=now() where id=v_job.id returning * into v_job;end if;
 return next v_job;
 end $$;

create function public.relay_retain_job_outcome(p_job uuid,p_lease uuid,p_output jsonb,p_error text) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if pg_column_size(p_output)>2500000 or length(coalesce(p_error,''))>200 then raise exception 'invalid_job_outcome';end if;
 update public.relay_jobs set status='uncertain',output=coalesce(p_output,output),error_code=p_error,lease_until=null,updated_at=now(),cost_uncertain=kind in ('ocr','transcribe')
 where id=p_job and lease_token=p_lease and kind in ('connector-write','test-dispatch','ocr','transcribe') and status in ('leased','uncertain','cancelled','failed') and checkpoint->>'phase' in ('provider-send-started','external-send-started');
 return found;
end $$;
revoke all on function public.relay_retain_job_outcome(uuid,uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.relay_retain_job_outcome(uuid,uuid,jsonb,text) to service_role;
