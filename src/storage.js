import {exportProject,importProject,clone,uid} from './domain.js';
import {createVault,openVault,sealVault} from './vault.js';
import {writeLinkedFile,fingerprint} from './files.js';
const DB='product-relay-files-v1';
const sessions=new Map();
const withLock=(id,operation)=>globalThis.navigator?.locks?navigator.locks.request('product-relay:'+id,operation):operation();
let database;
async function open() {
  if(database)return database;
  database=await new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
  database.onversionchange=()=>{database.close();database=undefined;};return database;
}
async function readAll(){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readonly');const request=tx.objectStore('files').getAll();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
// Encrypt before the transaction; compare the cache revision inside the transaction.
async function writeCache(entry,expected) {
  const db=await open();return new Promise((resolve,reject)=>{
    const tx=db.transaction('files','readwrite');const store=tx.objectStore('files');let failure;
    const read=store.get(entry.id);
    read.onsuccess=()=>{
      if((read.result?.sequence??0)!==expected){failure=new Error('Another tab saved this project. Your edit was not saved. Lock and reopen the local recovery copy before trying again.');tx.abort();return;}
      store.put({...entry,sequence:expected+1});
    };
    tx.oncomplete=()=>resolve(expected+1);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(failure??tx.error??new Error('Local recovery save was interrupted.'));
  });
}
export async function listCachedFiles(){return (await readAll()).map(e=>({id:e.id,dirty:e.dirty,updatedAt:e.updatedAt,lastExportAt:e.lastExportAt,sequence:e.sequence}));}
export function storageState(id){const s=sessions.get(id);return s?{protected:true,dirty:s.entry.dirty,linked:!!s.handle,lastExportAt:s.entry.lastExportAt}: {protected:false,dirty:true,linked:false};}
export function lockProjects(){sessions.clear();}
export function closeProject(id){sessions.delete(id);}
export async function createProtectedProject(project,passphrase) {
 return withLock(project.id,async()=>{
  project=importProject(exportProject(project));
  const {envelope,key}=await createVault(JSON.parse(exportProject(project)),passphrase);
  const entry={id:project.id,envelope,dirty:true,updatedAt:new Date().toISOString()};
  entry.sequence=await writeCache(entry,0);sessions.set(project.id,{key,entry});return clone(project);
 });
}
export async function unlockCached(id,passphrase) {
  const entry=(await readAll()).find(e=>e.id===id);if(!entry)throw new Error('Recovery copy not found.');
  const {data,key}=await openVault(entry.envelope,passphrase);const project=importProject(JSON.stringify(data));
  if(project.id!==entry.id)throw new Error('Recovery copy has an inconsistent project ID.');
  sessions.set(id,{key,entry});return project;
}
export async function openProjectFile(text,passphrase,handle=null,asCopy=false) {
  if(text.length>45000000)throw new Error('Project file exceeds the supported size.');
  const envelope=JSON.parse(text);const {data,key}=await openVault(envelope,passphrase);const project=importProject(JSON.stringify(data));
  if(asCopy){delete project.sharing;project.reviewOf=project.reviewOf??project.id;project.id=uid();project.name+=' · review copy';await createProtectedProject(project,passphrase);return project;}
 return withLock(project.id,async()=>{
  const existing=(await readAll()).find(e=>e.id===project.id);
  if(existing?.dirty)throw new Error('This project has unsaved local changes. Open and save its recovery copy first, then open the shared file.');
  const entry={id:project.id,envelope,dirty:false,updatedAt:new Date().toISOString(),lastExportAt:new Date().toISOString()};
  entry.sequence=await writeCache(entry,existing?.sequence??0);
  sessions.set(project.id,{key,entry,handle,fileFingerprint:await fingerprint(text)});return project;
 });
}
export async function putProject(project) {
 return withLock(project.id,async()=>{
  project=importProject(exportProject(project));
  const session=sessions.get(project.id);if(!session)throw new Error('Unlock this project before saving.');
  const envelope=await sealVault(JSON.parse(exportProject(project)),session.key,session.entry.envelope.salt);
  const entry={...session.entry,envelope,dirty:true,updatedAt:new Date().toISOString()};
  entry.sequence=await writeCache(entry,session.entry.sequence);session.entry=entry;
 });
}
export function encryptedProjectFile(id) {
  const session=sessions.get(id);if(!session)throw new Error('Unlock the project before saving a file.');
  return JSON.stringify(session.entry.envelope,null,2);
}
export function linkedHandle(id){return sessions.get(id)?.handle;}
export async function rotateProjectPassphrase(id,knownPassphrase,newPassphrase) {
 return withLock(id,async()=>{
  const session=sessions.get(id);if(!session)throw new Error('Unlock this project first.');
  const {data}=await openVault(session.entry.envelope,knownPassphrase);
  const project=importProject(JSON.stringify(data));if(project.id!==id)throw new Error('Project identity mismatch.');
  const backup=JSON.stringify(session.entry.envelope),{envelope,key}=await createVault(JSON.parse(exportProject(project)),newPassphrase);
  importProject(JSON.stringify((await openVault(envelope,key)).data));
  const entry={...session.entry,envelope,dirty:true,updatedAt:new Date().toISOString()};
  entry.sequence=await writeCache(entry,session.entry.sequence);session.entry=entry;session.key=key;
  return {backup,project};
 });
}
export async function createRecoveryBackup(id) {
 const session=sessions.get(id);if(!session)throw new Error('Unlock this project first.');
 const {data}=await openVault(session.entry.envelope,session.key);importProject(JSON.stringify(data));
 const secret=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 const {envelope}=await createVault(data,secret);
 return {secret,file:JSON.stringify(envelope),createdAt:new Date().toISOString()};
}
export async function saveProjectFile(id,handle=null,exportOnly=false) {
 return withLock(id,async()=>{
  const session=sessions.get(id);if(!session)throw new Error('Unlock the project first.');
  const opened=await openVault(session.entry.envelope,session.key);importProject(JSON.stringify(opened.data));
  const text=encryptedProjectFile(id);const chosen=exportOnly?null:handle??session.handle;
  const stored=(await readAll()).find(e=>e.id===id);
  if(stored?.sequence!==session.entry.sequence)throw new Error('Another tab saved a newer recovery copy. Lock and reopen the project before saving its file.');
  if(chosen){
    session.fileFingerprint=await writeLinkedFile(chosen,text,chosen===session.handle?session.fileFingerprint:null);
    session.handle=chosen;
  }
  const entry={...session.entry,dirty:false,lastExportAt:new Date().toISOString()};
  entry.sequence=await writeCache(entry,session.entry.sequence);session.entry=entry;return text;
 });
}
export async function legacyProjects() {
  if(!indexedDB.databases)return [];
  if(!(await indexedDB.databases()).some(d=>d.name==='product-relay-v1'))return [];
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('product-relay-v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  try{return await new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}
}
export async function migrateLegacy(passphrase) {
  const projects=await legacyProjects();const converted=[];
  for(const old of projects){
    const p=importProject(exportProject(old));
    if((await readAll()).some(e=>e.id===p.id)) throw new Error('A matching recovery copy already exists. Export that copy before migrating the earlier workspace.');
    await createProtectedProject(p,passphrase);converted.push(p);
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('product-relay-v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try{await new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').delete(old.id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
  }
  return converted;
}
