import test from 'node:test';
import assert from 'node:assert/strict';
import {createConnectorService} from '../supabase/functions/_shared/connectors.js';
const response=(data,status=200,headers={})=>new Response(typeof data==='string'?data:JSON.stringify(data),{status,headers});
const issue={id:7,title:'Fixture issue',html_url:'https://github.com/fixture/repo/issues/7',updated_at:'2026-10-05T00:00:00Z',state:'open',body:'Keep ordinary paid access until period end.'};
const locator={provider:'github',repository:'fixture/repo',type:'issue',id:'7'};
const config={providers:{github:{repositories:['fixture/repo'],credentialEnv:'FIXTURE_TOKEN',writeComments:true,workflows:[{id:'checks.yml',repository:'fixture/repo',testOnly:true,refs:['main'],inputs:['relay_command_id']}]},drive:{fileIds:['file1'],credentialEnv:'FIXTURE_TOKEN'},clickup:{workspaceId:'1',docIds:['doc1'],credentialEnv:'FIXTURE_TOKEN'},confluence:{origin:'https://fixture.atlassian.net',email:'fixture@example.test',pageIds:['42'],credentialEnv:'FIXTURE_TOKEN'},azure:{organization:'fixture',project:'fixture',workItemIds:['5'],runIds:['3'],credentialEnv:'FIXTURE_TOKEN'}}};
const service=(fetchImpl,extra={})=>createConnectorService({config,secrets:()=> 'fictional-token',fetchImpl,...extra});
test('provider reads retain real retrieved provenance and reject unconfigured identity before fetching',async()=>{
 let calls=0;const s=service(async()=>{calls++;return response(issue);});const r=await s.read(locator);assert.equal(r.origin,'provider-retrieved');assert.equal(r.contentHash.length,64);assert.deepEqual(r.locator,locator);
 await assert.rejects(()=>s.read({...locator,repository:'other/private'}),{code:'external_scope_denied'});assert.equal(calls,1);
 await assert.rejects(()=>s.read({...locator,id:'../../secret'}),{code:'invalid_external_identity'});assert.equal(calls,1);
});
test('read errors distinguish rate limiting, permission loss, missing records and timeouts',async()=>{
 for(const [status,headers,code] of [[403,{'retry-after':'1'},'connector_rate_limited'],[403,{},'connector_access_lost'],[401,{},'connector_auth_unavailable'],[404,{},'external_missing_or_inaccessible'],[410,{},'external_expired'],[429,{},'connector_rate_limited']])await assert.rejects(()=>service(async()=>response({},status,headers)).read(locator),{code});
 await assert.rejects(()=>service(async()=>{throw new Error('mock network failure');}).read(locator),{code:'connector_timeout'});
});
test('app generated content cannot recursively become a source',async()=>{
 await assert.rejects(()=>service(async()=>response({...issue,body:'<!-- product-relay-origin:fixture -->'})).read(locator),{code:'generated_feedback_loop'});
});
test('comment write checks current external revision and authorization immediately before sending',async()=>{
 const events=[];const s=service(async(url,options)=>{events.push(options.method??'GET');return response(options.method==='POST'?{id:9,html_url:'https://github.com/fixture/repo/issues/7#issuecomment-9'}:issue);},{beforeWrite:async()=>events.push('authority-check')});
 await assert.rejects(()=>s.writeComment({locator,expectedRevision:'old',body:'Fixture',commandId:'cmd',projectId:'project'}),{code:'external_revision_changed'});assert.deepEqual(events,['GET']);events.length=0;
 const result=await s.writeComment({locator,expectedRevision:issue.updated_at+':',body:'Reviewed fixture',commandId:'cmd',projectId:'project'});assert.deepEqual(events,['GET','authority-check','POST']);assert.equal(result.origin,'relay-generated');
});
test('write timeouts, server errors and malformed success metadata retain uncertainty',async()=>{
 for(const mode of ['timeout','server','invalid-json','invalid-receipt']){let sends=0;const s=service(async(url,options)=>{if(options.method!=='POST')return response(issue);sends++;if(mode==='timeout')throw new Error('mock timeout');if(mode==='server')return response({},503);if(mode==='invalid-json')return response('not json');return response({id:9,html_url:'https://malicious.example.test/'});});await assert.rejects(()=>s.writeComment({locator,expectedRevision:issue.updated_at+':',body:'Reviewed fixture',commandId:'cmd',projectId:'project'}),{code:'external_write_uncertain'});assert.equal(sends,1);}
});
test('test dispatch is bounded to reviewed workflows, refs and exact build SHA',async()=>{
 let sends=0;const s=service(async(url,options)=>{if(options.method==='POST'){sends++;return new Response(null,{status:204});}return response({sha:'fixture-sha'});});const input={repository:'fixture/repo',workflowId:'checks.yml',ref:'main',expectedSha:'fixture-sha',commandId:'cmd'};
 await assert.rejects(()=>s.dispatch({...input,expectedSha:'old'}),{code:'workflow_ref_changed'});await assert.rejects(()=>s.dispatch({...input,inputs:{unexpected:'x'}}),{code:'workflow_inputs_not_allowed'});assert.equal(sends,0);
 assert.equal((await s.dispatch(input)).accepted,true);assert.equal(sends,1);
});
test('Drive detects revision change across content fetch and confirmed deletion',async()=>{
 const input={provider:'drive',type:'file',id:'file1'};let calls=0;await assert.rejects(()=>service(async url=>{calls++;return calls===1?response({id:'file1',name:'Fixture',version:'1',modifiedTime:'t1',mimeType:'text/plain'}):calls===2?response('Fixture source text'):response({version:'2',modifiedTime:'t2'});}).read(input),{code:'external_revision_changed'});
 await assert.rejects(()=>service(async()=>response({trashed:true})).read(input),{code:'external_deleted_confirmed'});
});
test('ClickUp document retains page IDs and rejects duplicate page trees',async()=>{
 const metadata={name:'Fixture document',date_updated:'1'},pages=[{id:'p1',name:'Rule',content:'Fraud suspends access immediately.',date_updated:'1'}];let calls=0;const r=await service(async()=>response(++calls===2?pages:metadata)).read({provider:'clickup',type:'doc',id:'doc1'});assert.equal(r.pageMetadata[0].id,'p1');assert.match(r.description,/Fraud suspends/);
 calls=0;await assert.rejects(()=>service(async()=>response(++calls===2?[...pages,...pages]:metadata)).read({provider:'clickup',type:'doc',id:'doc1'}),{code:'connector_schema_changed'});
});
test('Confluence removes scripts from extracted text and Azure preserves explicit outcomes',async()=>{
 const page=await service(async()=>response({id:42,title:'Fixture PRD',version:{number:1},status:'current',body:{storage:{value:'<p>Keep paid access.</p><script>secret instruction</script>'}},_links:{webui:'/pages/42'}})).read({provider:'confluence',type:'page',id:'42'});assert.equal(page.description,'Keep paid access.');
 let calls=0;const run=await service(async()=>response(++calls===1?{id:3,name:'Fixture run',state:'Completed',build:{id:8},completedDate:'2026-10-05T00:00:00Z'}:{value:[{id:1,testCase:{id:6},testCaseTitle:'Boundary',outcome:'Passed'},{id:2,outcome:'Unknown'}]})).read({provider:'azure',type:'run',id:'3'});assert.deepEqual(run.caseResults.map(r=>r.result),['pass','inconclusive']);
});
