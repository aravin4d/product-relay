import assert from 'node:assert/strict';
import {createAIRequest, aiInputHash} from '../../src/ai.js';

// Runs the actual index.ts, pinned Supabase SDK, handler and provider adapter in
// Deno. All HTTP and serve calls are intercepted; no secrets or paid calls exist.
Deno.test('gateway entry point starts and routes Auth, RPC and provider correctly in Deno',async t=>{
  const env={SUPABASE_URL:'https://fixture.invalid',SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:'sb_publishable_fixture_only'}),SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_fixture_only'}),RELAY_ALLOWED_ORIGINS:'https://relay.example',OPENAI_API_KEY:'fixture-only-provider-secret',OPENAI_MODEL:'fixture-model'};
  const originals=new Map(Object.keys(env).map(key=>[key,Deno.env.get(key)]));
  for(const [key,value] of Object.entries(env))Deno.env.set(key,value);
  const originalFetch=globalThis.fetch;
  const originalServe=Deno.serve;
  let handler:((request:Request)=>Promise<Response>)|undefined;
  let authCalls=0,rpcCalls=0,providerCalls=0;
  let admission:'allow'|'deny'|'fault'='allow';
  const userId='11111111-1111-4111-8111-111111111111';
  const revisionId='22222222-2222-4222-8222-222222222222';
  const quote='Ordinary cancellation keeps access until the paid period ends.';
  const input=createAIRequest({projectTitle:'Deno fixture',consent:true,sources:[{sourceId:userId,revisionId,title:'Policy',content:quote}]});
  const result={behaviors:[{title:'Cancellation',actor:'Owner',condition:'Ordinary cancellation',outcome:'Keep access until the paid period ends.',scope:'Ordinary cancellation',exclusions:'',roles:['Everyone'],evidence:[{sourceId:userId,revisionId,quote}]}],questions:[],warnings:[]};
  const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
  const post=(token='valid-token',origin='https://relay.example')=>new Request('https://fixture.invalid/functions/v1/relay-ai',{method:'POST',headers:{authorization:`Bearer ${token}`,origin,'content-type':'application/json'},body:JSON.stringify(input)});
  try {
    // Capturing serve prevents opening a port while exercising startup setup.
    Deno.serve=((callback:unknown)=>{handler=callback as typeof handler;return {} as Deno.HttpServer;}) as typeof Deno.serve;
    globalThis.fetch=async (resource,options={})=>{
      const url=new URL(typeof resource==='string'?resource:resource instanceof URL?resource.href:resource.url);
      const headers=new Headers(options.headers);
      if(url.hostname==='fixture.invalid'&&url.pathname==='/auth/v1/user') {
        authCalls++;
        assert.equal(headers.get('apikey'),env.SUPABASE_PUBLISHABLE_KEYS.includes('sb_publishable_fixture_only')?'sb_publishable_fixture_only':'');
        const token=headers.get('authorization');
        if(token==='Bearer invalid-token')return json({code:'bad_jwt',message:'Invalid JWT'},401);
        return json({id:userId,aud:'authenticated',role:'authenticated',is_anonymous:token==='Bearer anonymous-token',app_metadata:{},user_metadata:{},created_at:'2026-10-03T00:00:00.000Z'});
      }
      if(url.hostname==='fixture.invalid'&&url.pathname==='/rest/v1/rpc/reserve_relay_ai_request') {
        rpcCalls++;
        assert.equal(headers.get('apikey'),'sb_secret_fixture_only');
        assert.equal(headers.get('authorization'),'Bearer sb_secret_fixture_only');
        assert.deepEqual(JSON.parse(String(options.body)),{p_user_id:userId});
        if(admission==='fault')return json({code:'XX000',message:'Fixture DB unavailable'},503);
        return json([{allowed:admission==='allow',reason:admission==='allow'?'reserved':'not_allowed',remaining:admission==='allow'?9:0}]);
      }
      if(url.href==='https://api.openai.com/v1/responses') {
        providerCalls++;
        assert.equal(headers.get('authorization'),'Bearer fixture-only-provider-secret');
        const body=JSON.parse(String(options.body));
        assert.equal(body.model,'fixture-model');assert.equal(body.store,false);assert.equal(body.text.format.strict,true);
        return json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(result)}]}],usage:{input_tokens:10,output_tokens:20,total_tokens:30}});
      }
      throw new Error(`Unexpected outbound URL: ${url.origin}${url.pathname}`);
    };
    await import('../functions/relay-ai/index.ts');
    assert.equal(typeof handler,'function');
    const endpoint=handler!;
    await t.step('CORS preflight and denied origin do not contact services',async()=>{
      const preflight=await endpoint(new Request('https://fixture.invalid/functions/v1/relay-ai',{method:'OPTIONS',headers:{origin:'https://relay.example'}}));
      assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://relay.example');
      assert.equal((await endpoint(post('valid-token','https://unknown.example'))).status,403);
      assert.deepEqual([authCalls,rpcCalls,providerCalls],[0,0,0]);
    });
    await t.step('invalid and anonymous Auth sessions fail before the privileged RPC',async()=>{
      assert.equal((await endpoint(post('invalid-token'))).status,401);
      assert.equal((await endpoint(post('anonymous-token'))).status,401);
      assert.deepEqual([authCalls,rpcCalls,providerCalls],[2,0,0]);
    });
    await t.step('denied and failed allowance reservation never call provider',async()=>{
      admission='deny';assert.equal((await endpoint(post())).status,403);
      admission='fault';assert.equal((await endpoint(post())).status,503);
      assert.deepEqual([authCalls,rpcCalls,providerCalls],[4,2,0]);
    });
    await t.step('verified caller receives bounded result and exact provenance',async()=>{
      admission='allow';const response=await endpoint(post());
      assert.equal(response.status,200);const body=await response.json();
      assert.deepEqual(body.result,result);assert.equal(body.metadata.inputHash,await aiInputHash(input));
      assert.equal(body.metadata.provider,'openai');assert.equal(body.metadata.model,'fixture-model');
      assert.equal(body.metadata.remainingRequests,9);assert.equal(body.metadata.usage.totalTokens,30);
      assert.deepEqual([authCalls,rpcCalls,providerCalls],[5,3,1]);
    });
  } finally {
    globalThis.fetch=originalFetch;Deno.serve=originalServe;
    for(const [key,value] of originals)value===undefined?Deno.env.delete(key):Deno.env.set(key,value);
  }
});
