import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {sharedDatabase,rpc,asUser} from './helpers/shared-db.mjs';
let db;
before(async()=>{db=await sharedDatabase();});
after(async()=>{await db?.close();});
const hash='a'.repeat(64),json=JSON.stringify;
const scalar=async(name,args)=>(await rpc(db,name,args))[0]?.[name];
async function fixture(){
 const users=Array.from({length:5},()=>randomUUID()),members=users.map(()=>randomUUID()),id=randomUUID();
 for(const u of users)await db.query('insert into auth.users values($1)',[u]);
 const p={id,name:'Fictional isolated SQL project',members:members.map((id,i)=>({id,name:'Fixture '+i,role:'QA'}))};
 await scalar('relay_create_project',[users[0],json(p),members[0]]);
 const caps=['owner','reviewer','editor','observer','reader'];
 for(let i=1;i<users.length;i++)await scalar('relay_set_membership',[id,users[0],users[i],members[i],caps[i],true,'QA']);
 return {id,p,users,members,caps};
}
const commit=(f,{actor=0,command=randomUUID(),expected=1,payload=f.p,digest=hash,targets=[]}={})=>scalar('relay_commit_project',[f.id,f.users[actor],command,expected,json(payload),digest,'Fixture update',targets,f.caps[actor],f.members[actor]]);
const enqueue=(f,{actor=0,command=randomUUID(),revision=1,kind='ocr',digest=hash}={})=>scalar('relay_enqueue_job',[f.id,f.users[actor],command,revision,kind,digest,json({fixture:true})]);
async function claim(id){const [j]=await rpc(db,'relay_claim_job',[45]);assert.equal(j.id,id);return j;}

test('all eight migrations install with private tables and privileged RPCs',async()=>{
 const tables=(await db.query("select tablename from pg_tables where schemaname='public' and tablename like 'relay_%'")).rows;
 assert.ok(tables.length>=25);
 const exposed=(await db.query("select proname from pg_proc join pg_namespace n on n.oid=pronamespace where n.nspname='public' and (proname like 'relay_%' or proname like 'reserve_relay%') and proname<>'relay_capability' and (has_function_privilege('authenticated',pg_proc.oid,'EXECUTE') or has_function_privilege('anon',pg_proc.oid,'EXECUTE'))")).rows;
 assert.deepEqual(exposed,[]);
});
test('SQL RLS distinguishes full readers, limited readers, other projects and revoked users',async()=>{
 const f=await fixture(),other=await fixture();
 for(let i=0;i<5;i++)await asUser(db,f.users[i],async tx=>{
  assert.deepEqual((await tx.query('select id from relay_projects')).rows.map(r=>r.id),[f.id]);
  assert.equal((await tx.query('select * from relay_project_state')).rows.length,i===4?0:1);
  assert.equal((await tx.query('select * from relay_project_state where project_id=$1',[other.id])).rows.length,0);
 });
 await scalar('relay_set_membership',[f.id,f.users[0],f.users[2],f.members[2],'editor',false,'QA']);
 await asUser(db,f.users[2],async tx=>assert.equal((await tx.query('select * from relay_projects')).rows.length,0));
 await assert.rejects(()=>asUser(db,f.users[0],tx=>tx.query("update relay_projects set name='forged' where id=$1",[f.id])),/permission denied/);
 await assert.rejects(()=>asUser(db,f.users[0],tx=>tx.query('select * from relay_connector_accounts')),/permission denied/);
});
test('commits are atomic, bound to member/capability, revision checked and idempotent',async()=>{
 const f=await fixture(),command=randomUUID();
 const first=await commit(f,{command,targets:f.users.slice(1)});assert.deepEqual(first,{revision:2,duplicate:false});
 assert.deepEqual(await commit(f,{command}),{revision:2,duplicate:true});
 await assert.rejects(()=>commit(f,{command,digest:'b'.repeat(64)}),/idempotency_conflict/);
 await assert.rejects(()=>commit(f),/revision_conflict/);
 for(const actor of [3,4])await assert.rejects(()=>commit(f,{actor,expected:2}),/access_denied/);
 await assert.rejects(()=>commit(f,{expected:2,payload:{...f.p,id:randomUUID()}}),/project_identity_mismatch/);
 assert.equal((await db.query('select count(*)::integer as n from relay_commands where project_id=$1',[f.id])).rows[0].n,1);
 assert.equal((await db.query('select summary from relay_notifications where project_id=$1 and user_id=$2',[f.id,f.users[4]])).rows[0].summary,'Reviewed project context changed');
});
test('offline rebase preserves the original draft and rejects a second replacement',async()=>{
 const f=await fixture(),original=randomUUID(),replacement=randomUUID();await commit(f);
 const args=[f.id,f.users[0],replacement,2,json(f.p),hash,'Reviewed draft',[],'owner',f.members[0],original,json({...f.p,name:'Offline draft'})];
 await scalar('relay_rebase_project',args);
 assert.equal((await db.query('select payload from relay_offline_returns where project_id=$1',[f.id])).rows[0].payload.name,'Offline draft');
 await assert.rejects(()=>scalar('relay_rebase_project',args.map((v,i)=>i===2?randomUUID():i===3?3:v)),/already_rebased/);
});
test('owner continuity prevents self demotion and transfer requires active membership',async()=>{
 const f=await fixture();
 await assert.rejects(()=>scalar('relay_set_membership',[f.id,f.users[0],f.users[0],f.members[0],'reader',true,'QA']),/transfer_owner_first/);
 await scalar('relay_audited_transfer',[f.id,f.users[0],f.users[1]]);
 await assert.rejects(()=>scalar('relay_audited_transfer',[f.id,f.users[0],f.users[2]]),/owner_required/);
 assert.equal((await db.query('select owner_user_id from relay_projects where id=$1',[f.id])).rows[0].owner_user_id,f.users[1]);
});
test('media jobs allow editors while writes require reviewers and duplicate identity is bound',async()=>{
 const f=await fixture();
 for(const actor of [3,4])await assert.rejects(()=>enqueue(f,{actor}),/access_denied/);
 for(const kind of ['connector-write','test-dispatch'])await assert.rejects(()=>enqueue(f,{actor:2,kind}),/access_denied/);
 const command=randomUUID(),id=await enqueue(f,{actor:2,command});
 assert.equal(await enqueue(f,{actor:2,command}),id);
 await assert.rejects(()=>enqueue(f,{actor:2,command,kind:'transcribe'}),/idempotency_conflict/);
 await assert.rejects(()=>enqueue(f,{revision:2}),/revision_conflict/);
 const job=await claim(id);
 assert.equal(await scalar('relay_checkpoint_job',[id,job.lease_token,json({}),'review-required',json({candidate:true}),null]),true);
});
test('jobs recheck changed project revision and revoked authority before publishing',async()=>{
 const f=await fixture(),id=await enqueue(f),j=await claim(id);await commit(f);
 assert.equal(await scalar('relay_touch_job',[id,j.lease_token,json({}),45]),false);
 await assert.rejects(()=>scalar('relay_checkpoint_job',[id,j.lease_token,json({}),'review-required',json({}),null]),/stale_input/);
 await scalar('relay_checkpoint_job',[id,j.lease_token,json({}),'failed',null,'stale_input']);
 const next=await enqueue(f,{actor:2,revision:2}),k=await claim(next);
 await scalar('relay_set_membership',[f.id,f.users[0],f.users[2],f.members[2],'editor',false,'QA']);
 await assert.rejects(()=>scalar('relay_checkpoint_job',[next,k.lease_token,json({}),'succeeded',json({}),null]),/access_denied/);
 await scalar('relay_checkpoint_job',[next,k.lease_token,json({}),'failed',null,'access_denied']);
});
test('expired send lease cannot resend and retains actual late outcome with the original token',async()=>{
 const f=await fixture(),id=await enqueue(f,{kind:'connector-write'}),j=await claim(id);
 await db.query("update relay_jobs set lease_until=now()-interval '1 second',checkpoint=$2 where id=$1",[id,json({phase:'external-send-started'})]);
 const expired=await claim(id);assert.equal(expired.status,'uncertain');assert.equal(expired.lease_token,j.lease_token);
 assert.equal((await rpc(db,'relay_claim_job',[45])).length,0);
 assert.equal(await scalar('relay_retain_job_outcome',[id,randomUUID(),json({url:'https://example.test/receipt'}),'late']),false);
 assert.equal(await scalar('relay_retain_job_outcome',[id,j.lease_token,json({url:'https://example.test/receipt'}),'late']),true);
 assert.equal((await db.query('select output from relay_jobs where id=$1',[id])).rows[0].output.url,'https://example.test/receipt');
});
test('delivery consent retains relevance filters, leases reject forgery and receipts deduplicate',async()=>{
 const f=await fixture(),u=f.users[1];
 await db.query('insert into relay_subscriptions(project_id,user_id,perspective,owned_only) values($1,$2,$3,true)',[f.id,u,'Development']);
 await scalar('relay_save_delivery',[f.id,u,'webhook','fixture-channel',true,0,true]);
 const sub=(await db.query('select * from relay_subscriptions where project_id=$1 and user_id=$2',[f.id,u])).rows[0];assert.equal(sub.perspective,'Development');assert.equal(sub.owned_only,true);
 await commit(f,{targets:[u]});const [batch]=await rpc(db,'relay_claim_delivery',[]);assert.equal(batch.project_id,f.id);
 assert.equal(await scalar('relay_finish_delivery',[batch.id,randomUUID(),'sent',null]),false);
 await db.query("update relay_delivery_batches set lease_until=now()-interval '1 second' where id=$1",[batch.id]);
 await rpc(db,'relay_claim_delivery',[]);
 assert.equal(await scalar('relay_finish_delivery',[batch.id,batch.lease_token,'sent',null]),true);
 assert.equal(await scalar('relay_finish_delivery',[batch.id,batch.lease_token,'failed','late_error']),false);
 assert.equal((await rpc(db,'relay_claim_delivery',[])).length,0);
});
test('health aggregates more than 200 retained jobs and reports operator reconciliation separately',async()=>{
 const f=await fixture();
 await db.query("insert into relay_jobs(project_id,actor_user_id,kind,idempotency_key,input_hash,expected_revision,input,status) select $1,$2,'ocr',gen_random_uuid(),$3,1,'{}'::jsonb,'failed' from generate_series(1,205)",[f.id,f.users[0],hash]);
 const id=await enqueue(f);await db.query("update relay_jobs set status='uncertain',cost_uncertain=true where id=$1",[id]);
 const initial=await scalar('relay_project_job_health',[f.id]);assert.equal(initial.failures,205);assert.equal(initial.uncertain,1);
 const command=randomUUID(),report={decision:'confirmed-no-side-effect',billing:'billing-confirmed',note:'Fixture review',evidence:'Fixture receipt'};
 await assert.rejects(()=>scalar('relay_review_operation',[f.id,f.users[2],command,id,null,json(report)]),/reviewer_required/);
 await scalar('relay_review_operation',[f.id,f.users[1],command,id,null,json(report)]);
 await scalar('relay_review_operation',[f.id,f.users[1],command,id,null,json(report)]);
 assert.equal((await scalar('relay_project_job_health',[f.id])).uncertain,0);
 assert.equal((await db.query('select status,cost_uncertain from relay_jobs where id=$1',[id])).rows[0].status,'uncertain');
 await assert.rejects(()=>scalar('relay_review_operation',[f.id,f.users[1],command,id,null,json({...report,note:'Changed'})]),/idempotency_conflict/);
});
test('retention requires a current backup and preserves journals and referenced job evidence',async()=>{
 const f=await fixture(),keep=await enqueue(f),drop=await enqueue(f);await commit(f,{payload:{...f.p,proof:keep}});
 await db.query("update relay_jobs set status='succeeded',updated_at=now()-interval '90 days' where id=any($1::uuid[])",[[keep,drop]]);
 await db.query('insert into relay_operational_controls(project_id,retention_days,retention_enabled,updated_by) values($1,30,true,$2)',[f.id,f.users[0]]);
 assert.equal((await scalar('relay_prune_operations',[f.id])).pruned,false);
 await db.query('insert into relay_backup_receipts(project_id,revision,artifact_hash,storage_label,verified_at) values($1,2,$2,$3,now())',[f.id,hash,'Fixture only']);
 assert.equal((await scalar('relay_prune_operations',[f.id])).jobs,1);
 assert.deepEqual((await db.query('select id from relay_jobs where project_id=$1',[f.id])).rows.map(r=>r.id),[keep]);
 assert.equal((await db.query('select * from relay_commands where project_id=$1',[f.id])).rows.length,1);
});
test('directory grants restore pre-existing membership on group removal',async()=>{
 const f=await fixture(),actor=f.users[0],{id:org}=await scalar('relay_directory_command',[actor,'create',json({name:'Fixture organization'})]);
 const {id:group}=await scalar('relay_directory_command',[actor,'group',json({organizationId:org,name:'Fixture QA'})]);
 const input={organizationId:org,groupId:group,userId:f.users[2],active:true};
 await scalar('relay_directory_command',[actor,'user',json(input)]);
 await scalar('relay_directory_command',[actor,'grant',json({...input,projectId:f.id,capability:'reviewer',members:[{userId:f.users[2],memberId:f.members[2]}]})]);
 await scalar('relay_directory_command',[actor,'user',json({...input,active:false})]);
 assert.equal((await db.query('select capability from relay_memberships where project_id=$1 and user_id=$2',[f.id,f.users[2]])).rows[0].capability,'editor');
});
test('OAuth state is single-use and refresh leases bind token updates to revision and lease',async()=>{
 const f=await fixture(),state=randomUUID(),lease=randomUUID();
 await db.query("insert into relay_oauth_states values($1,$2,$3,'github','{}',$4,now()+interval '1 minute',false)",[state,f.id,f.users[0],'https://example.test/']);
 assert.equal((await rpc(db,'relay_claim_oauth_state',[state])).length,1);assert.equal((await rpc(db,'relay_claim_oauth_state',[state])).length,0);
 await db.query("insert into relay_connector_accounts(project_id,user_id,provider,account_label,secret) values($1,$2,'github','Fixture','{}')",[f.id,f.users[0]]);
 assert.equal(await scalar('relay_claim_token_refresh',[f.id,f.users[0],'github',1,lease]),true);
 assert.equal(await scalar('relay_claim_token_refresh',[f.id,f.users[0],'github',1,randomUUID()]),false);
 assert.equal(await scalar('relay_store_token_refresh',[f.id,f.users[0],'github',randomUUID(),json({ciphertext:'fake'})]),false);
 assert.equal(await scalar('relay_store_token_refresh',[f.id,f.users[0],'github',lease,json({ciphertext:'fake'})]),true);
 assert.equal(await scalar('relay_claim_token_refresh',[f.id,f.users[0],'github',1,randomUUID()]),false);
});
