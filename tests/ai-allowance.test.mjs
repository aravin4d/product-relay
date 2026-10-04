import test, {after, afterEach, before} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createRelayHandler} from '../supabase/functions/_shared/handler.js';
import {createAIRequest} from '../src/ai.js';

// An in-memory PostgreSQL build runs the actual migration. These mock Auth roles
// and auth.users exist only in this disposable test database, never Supabase.
let db;
const userId='11111111-1111-4111-8111-111111111111';
const missingId='99999999-9999-4999-8999-999999999999';
const reserve=id=>db.query('select * from public.reserve_relay_ai_request($1::uuid)',[id]).then(result=>result.rows[0]);
async function addUser(id=userId,limit=3) {
  await db.query('insert into auth.users(id) values ($1::uuid)',[id]);
  if(limit!==null)await db.query('insert into public.relay_ai_access(user_id,daily_limit) values ($1::uuid,$2)',[id,limit]);
}
async function counters() {
  return (await db.query(`select
    (select coalesce(sum(reserved_requests),0)::int from public.relay_ai_usage) as users,
    (select coalesce(sum(reserved_requests),0)::int from public.relay_ai_global_usage) as global`)).rows[0];
}

before(async()=>{
  db=new PGlite();
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);');
  await db.exec(await readFile(new URL('../supabase/migrations/202610030001_ai_allowance.sql',import.meta.url),'utf8'));
});
afterEach(async()=>{await db.exec('truncate public.relay_ai_usage, public.relay_ai_global_usage, public.relay_ai_access, auth.users;');});
after(async()=>{await db?.close();});

test('actual allowance migration and operator SQL fixture execute and roll back all test data',async()=>{
  await db.exec(await readFile(new URL('../supabase/tests/ai_allowance.sql',import.meta.url),'utf8'));
  assert.deepEqual(await counters(),{users:0,global:0});
  assert.equal((await db.query('select count(*)::int as count from auth.users')).rows[0].count,0);
});

test('actual PostgreSQL grants and RLS keep allowance data private and reservation privileged',async()=>{
  for(const role of ['anon','authenticated']) {
    assert.equal((await db.query("select has_function_privilege($1,'public.reserve_relay_ai_request(uuid)','EXECUTE') as allowed",[role])).rows[0].allowed,false);
    for(const table of ['relay_ai_access','relay_ai_usage','relay_ai_global_usage']) {
      for(const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
        assert.equal((await db.query('select has_table_privilege($1,$2,$3) as allowed',[role,`public.${table}`,privilege])).rows[0].allowed,false,`${role} ${privilege} ${table}`);
      }
    }
  }
  assert.equal((await db.query("select has_function_privilege('service_role','public.reserve_relay_ai_request(uuid)','EXECUTE') as allowed")).rows[0].allowed,true);
  const tables=(await db.query("select relname,relrowsecurity from pg_class where oid in ('public.relay_ai_access'::regclass,'public.relay_ai_usage'::regclass,'public.relay_ai_global_usage'::regclass)")).rows;
  assert.equal(tables.length,3);assert.ok(tables.every(table=>table.relrowsecurity));
  assert.equal((await db.query("select count(*)::int as count from pg_policies where schemaname='public' and tablename like 'relay_ai_%'")).rows[0].count,0);
  const fn=(await db.query("select prosecdef,proconfig from pg_proc where oid='public.reserve_relay_ai_request(uuid)'::regprocedure")).rows[0];
  assert.equal(fn.prosecdef,true);assert.ok(fn.proconfig.includes('search_path=""'));
});

test('anonymous and authenticated SQL callers are denied while service role can reserve',async()=>{
  await addUser();
  for(const role of ['anon','authenticated']) {
    for(const sql of ['select * from public.relay_ai_access',`select * from public.reserve_relay_ai_request('${userId}'::uuid)`]) {
      await assert.rejects(db.transaction(async tx=>{await tx.exec(`set local role ${role}`);await tx.query(sql);}),error=>error.code==='42501');
    }
  }
  assert.deepEqual(await counters(),{users:0,global:0});
  await db.transaction(async tx=>{
    await tx.exec('set local role service_role');
    assert.deepEqual((await tx.query('select * from public.reserve_relay_ai_request($1::uuid)',[userId])).rows[0],{allowed:true,reason:'reserved',remaining:2});
  });
});

test('missing, unlisted and disabled users never increment either database counter',async()=>{
  assert.deepEqual(await reserve(null),{allowed:false,reason:'not_allowed',remaining:0});
  assert.deepEqual(await reserve(missingId),{allowed:false,reason:'not_allowed',remaining:0});
  await addUser(userId,null);
  assert.deepEqual(await reserve(userId),{allowed:false,reason:'not_allowed',remaining:0});
  await db.query('insert into public.relay_ai_access(user_id,enabled) values ($1::uuid,false)',[userId]);
  assert.deepEqual(await reserve(userId),{allowed:false,reason:'not_allowed',remaining:0});
  assert.deepEqual(await counters(),{users:0,global:0});
});

test('queued reservation burst exhausts per-user cap exactly and denied calls preserve counts',async()=>{
  await addUser();
  // PGlite queues these calls on one connection. This tests actual SQL admission
  // under a burst; cross-connection advisory-lock contention needs PostgreSQL.
  const results=await Promise.all(Array.from({length:40},()=>reserve(userId)));
  assert.deepEqual(results.filter(result=>result.allowed).map(result=>result.remaining),[2,1,0]);
  assert.ok(results.filter(result=>!result.allowed).every(result=>result.reason==='usage_limit'&&result.remaining===0));
  assert.deepEqual(await counters(),{users:3,global:3});
  await db.query('update public.relay_ai_access set enabled=false where user_id=$1::uuid',[userId]);
  assert.equal((await reserve(userId)).reason,'not_allowed');
  assert.deepEqual(await counters(),{users:3,global:3});
});

test('actual global allowance caps 120 queued reservations at 100 without partial counter writes',async()=>{
  const ids=Array.from({length:6},(_,index)=>`${String(index+1).padStart(8,'0')}-2222-4222-8222-222222222222`);
  for(const id of ids)await addUser(id,20);
  const results=await Promise.all(ids.flatMap(id=>Array.from({length:20},()=>reserve(id))));
  assert.equal(results.filter(result=>result.allowed).length,100);
  assert.equal(results.filter(result=>!result.allowed&&result.reason==='usage_limit').length,20);
  assert.deepEqual(await counters(),{users:100,global:100});
  assert.ok((await db.query('select reserved_requests from public.relay_ai_usage')).rows.every(row=>row.reserved_requests<=20));
  await addUser(missingId,20);
  assert.deepEqual(await reserve(missingId),{allowed:false,reason:'usage_limit',remaining:0});
  assert.equal((await db.query('select count(*)::int as count from public.relay_ai_usage where user_id=$1::uuid',[missingId])).rows[0].count,0);
});

test('allowance reservation rolls back atomically and day keys use UTC regardless of session timezone',async()=>{
  await addUser();
  await assert.rejects(db.transaction(async tx=>{
    await tx.query('select * from public.reserve_relay_ai_request($1::uuid)',[userId]);
    throw new Error('Simulated transaction rollback');
  }),/Simulated transaction rollback/);
  assert.deepEqual(await counters(),{users:0,global:0});
  await db.exec("set timezone='Pacific/Kiritimati'");
  await reserve(userId);
  assert.equal((await db.query("select day=(now() at time zone 'UTC')::date as is_utc from public.relay_ai_usage")).rows[0].is_utc,true);
  await db.exec("set timezone='UTC'");
});

test('invalid allowance limits fail PostgreSQL constraints and default admission remains ten',async()=>{
  await addUser(userId,null);
  for(const limit of [0,21])await assert.rejects(db.query('insert into public.relay_ai_access(user_id,daily_limit) values ($1::uuid,$2)',[userId,limit]),error=>error.code==='23514');
  await db.query('insert into public.relay_ai_access(user_id) values ($1::uuid)',[userId]);
  assert.equal((await reserve(userId)).remaining,9);
});

test('real SQL allowance wired into handler fails closed before provider on auth or admission errors',async()=>{
  await addUser(userId,1);
  let databaseCalls=0,providerCalls=0;
  const handler=createRelayHandler({
    authenticate:async token=>{if(token==='auth-fault')throw new Error('Auth unavailable');return token==='valid-token'?{id:userId}:null;},
    consumeAllowance:async id=>{databaseCalls++;return reserve(id);},
    provider:{name:'openai',model:'fixture',generate:async()=>{providerCalls++;throw new Error('Simulated provider failure');}}
  });
  const input=createAIRequest({projectTitle:'Fixture',consent:true,sources:[{sourceId:userId,revisionId:missingId,title:'Source',content:'The owner retains access until the paid period ends.'}]});
  const post=token=>new Request('https://fixture.invalid/relay-ai',{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(input)});
  assert.equal((await handler(post('invalid-token'))).status,401);
  assert.equal((await handler(post('auth-fault'))).status,503);
  assert.equal(databaseCalls,0);assert.equal(providerCalls,0);assert.deepEqual(await counters(),{users:0,global:0});
  // Failed processing consumes its reservation because inference may be billed.
  assert.equal((await handler(post('valid-token'))).status,502);
  assert.equal((await handler(post('valid-token'))).status,429);
  assert.equal(databaseCalls,2);assert.equal(providerCalls,1);assert.deepEqual(await counters(),{users:1,global:1});
});
