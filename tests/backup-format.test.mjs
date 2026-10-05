import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,mkdir,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {packBackup,unpackBackup,fileHash} from '../scripts/backup-format.mjs';
async function fixture(fn){const root=await mkdtemp(join(tmpdir(),'relay-test-backup-')),old=process.env.RELAY_BACKUP_KEY,budget=process.env.RELAY_RESTORE_MAX_BYTES;process.env.RELAY_BACKUP_KEY=randomBytes(32).toString('base64');delete process.env.RELAY_RESTORE_MAX_BYTES;try{const files=[];for(const name of ['database.dump','manifest.json','operator-config.json']){const path=join(root,name);await writeFile(path,name==='operator-config.json'?'fictional-secret-only':name);files.push({name,path});}await fn({root,files,archive:join(root,'fixture.relaybackup'),destination:join(root,'restored')});}finally{if(old===undefined)delete process.env.RELAY_BACKUP_KEY;else process.env.RELAY_BACKUP_KEY=old;if(budget===undefined)delete process.env.RELAY_RESTORE_MAX_BYTES;else process.env.RELAY_RESTORE_MAX_BYTES=budget;await rm(root,{recursive:true,force:true});}}
test('backup round trip verifies encrypted bytes, empty last frame and private file modes',()=>fixture(async f=>{
 await writeFile(f.files.at(-1).path,'');const hash=await packBackup(f.files,f.archive);assert.equal(hash,await fileHash(f.archive));
 assert.equal((await readFile(f.archive)).includes(Buffer.from('database.dump')),false);
 const entries=await unpackBackup(f.archive,f.destination);assert.equal(entries.length,3);assert.equal((await readFile(join(f.destination,'operator-config.json'))).length,0);
 assert.equal((await stat(f.archive)).mode&0o777,0o600);assert.equal((await stat(f.destination)).mode&0o777,0o700);
}));
test('wrong backup key and tampered ciphertext reject and remove only owned extraction',()=>fixture(async f=>{
 await packBackup(f.files,f.archive);const old=process.env.RELAY_BACKUP_KEY;process.env.RELAY_BACKUP_KEY=randomBytes(32).toString('base64');await assert.rejects(()=>unpackBackup(f.archive,f.destination));await assert.rejects(()=>stat(f.destination),/ENOENT/);process.env.RELAY_BACKUP_KEY=old;
 const bytes=await readFile(f.archive);bytes[35]^=1;await writeFile(f.archive,bytes);await assert.rejects(()=>unpackBackup(f.archive,f.destination));await assert.rejects(()=>stat(f.destination),/ENOENT/);
}));
test('restore refuses a populated destination without changing its contents',()=>fixture(async f=>{
 await packBackup(f.files,f.archive);await mkdir(f.destination);await writeFile(join(f.destination,'keep.txt'),'must survive');await assert.rejects(()=>unpackBackup(f.archive,f.destination),/EEXIST/);assert.equal(await readFile(join(f.destination,'keep.txt'),'utf8'),'must survive');
}));
test('restore rejects unsafe paths, duplicate frames, missing required entries and byte overflow',()=>fixture(async f=>{
 const cases=[{files:[...f.files,{name:'../escape',path:f.files[0].path}],pattern:/Unsafe backup entry/},{files:[...f.files,f.files[0]],pattern:/Unsafe backup entry/},{files:f.files.slice(1),pattern:/Required backup entries/},{files:f.files,budget:'1',pattern:/restore budget/}];
 for(let i=0;i<cases.length;i++){const c=cases[i],archive=join(f.root,'case-'+i);await packBackup(c.files,archive);if(c.budget)process.env.RELAY_RESTORE_MAX_BYTES=c.budget;await assert.rejects(()=>unpackBackup(archive,f.destination),c.pattern);await assert.rejects(()=>stat(f.destination),/ENOENT/);}
}));
test('backup never replaces an existing artifact and malformed formats fail safely',()=>fixture(async f=>{
 await writeFile(f.archive,'preserved');await assert.rejects(()=>packBackup(f.files,f.archive),/EEXIST/);assert.equal(await readFile(f.archive,'utf8'),'preserved');await assert.rejects(()=>unpackBackup(f.archive,f.destination),/truncated/);
 await writeFile(f.archive,Buffer.alloc(100));await assert.rejects(()=>unpackBackup(f.archive,f.destination),/Unsupported backup format/);
}));
