import test from 'node:test';
import assert from 'node:assert/strict';
import {createVault,openVault,sealVault} from '../src/vault.js';
import {fingerprint,writeLinkedFile} from '../src/files.js';
import * as D from '../src/domain.js';
const passphrase='fictional-test-project-passphrase';
test('an encrypted project preserves the complete product context',async()=>{
 const project=D.demoProject(),bundle=JSON.parse(D.exportProject(project));
 const {envelope,key}=await createVault(bundle,passphrase);
 assert.equal(JSON.stringify(envelope).includes('Orbit'),false);
 assert.equal(key.extractable,false);
 const {data}=await openVault(envelope,passphrase);
 assert.deepEqual(D.importProject(JSON.stringify(data)),project);
});
test('a wrong passphrase cannot open the file',async()=>{
 const {envelope}=await createVault({private:'context'},passphrase);
 await assert.rejects(()=>openVault(envelope,'incorrect-passphrase'),/Incorrect passphrase/);
});
test('ciphertext, salt, and nonce tampering are rejected',async()=>{
 const {envelope,key}=await createVault({private:'context'},passphrase);
 for(const field of ['ciphertext','salt','iv']){
   const altered=structuredClone(envelope);altered[field]=(altered[field][0]==='A'?'B':'A')+altered[field].slice(1);
   await assert.rejects(()=>openVault(altered,key),/damaged/);
 }
});
test('unsupported envelope parameters are rejected before key derivation',async()=>{
 const {envelope}=await createVault({},passphrase);
 await assert.rejects(()=>openVault({...envelope,iterations:1},passphrase),/Unsupported/);
 await assert.rejects(()=>openVault({...envelope,version:2},passphrase),/Unsupported/);
 await assert.rejects(()=>openVault({...envelope,iv:'bad'},passphrase),/Invalid/);
});
test('repeated local saves have fresh nonces and remain decryptable',async()=>{
 const {envelope,key}=await createVault({revision:1},passphrase);
 const next=await sealVault({revision:2},key,envelope.salt);
 assert.notEqual(next.iv,envelope.iv);assert.notEqual(next.ciphertext,envelope.ciphertext);
 assert.deepEqual((await openVault(next,key)).data,{revision:2});
});
test('short passphrases are rejected when creating files',async()=>{
 await assert.rejects(()=>createVault({},'short'),/at least 12/);
});
test('large encrypted files avoid conversion stack limits',async()=>{
 const value={body:'Context '.repeat(50000)};const {envelope,key}=await createVault(value,passphrase);
 assert.deepEqual((await openVault(envelope,key)).data,value);
});
function handle(initial,fail=false){let value=initial,writes=0,aborted=false;return {getFile:async()=>({text:async()=>value}),createWritable:async()=>({write:async text=>{writes++;if(fail)throw new Error('Disk full');value=text;},close:async()=>{},abort:async()=>{aborted=true;}}),value:()=>value,writes:()=>writes,aborted:()=>aborted};}
test('an externally changed linked file is preserved',async()=>{
 const disk=handle('Someone else saved this');
 await assert.rejects(()=>writeLinkedFile(disk,'My edit',awaitedFingerprint),/changed outside/);
 assert.equal(disk.value(),'Someone else saved this');assert.equal(disk.writes(),0);
});
const awaitedFingerprint=await fingerprint('Original file');
test('an unchanged linked file can be updated and fingerprinted',async()=>{
 const disk=handle('Original file');const result=await writeLinkedFile(disk,'New file',awaitedFingerprint);
 assert.equal(disk.value(),'New file');assert.equal(result,await fingerprint('New file'));
});
test('file write errors abort the stream and report failure',async()=>{
 const disk=handle('Original',true);await assert.rejects(()=>writeLinkedFile(disk,'New'),/Disk full/);assert.equal(disk.aborted(),true);
});
