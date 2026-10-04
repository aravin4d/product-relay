import {cp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const destination=resolve(process.argv[2]??'work/relay-backend-package');
await mkdir(destination,{recursive:true});const functions=resolve(destination,'functions');await mkdir(functions,{recursive:true});
for(const name of ['_shared','relay-ai','relay-projects','relay-jobs','relay-domain'])await rm(resolve(functions,name),{recursive:true,force:true});
for(const name of ['_shared','relay-ai','relay-projects','relay-jobs'])await cp(resolve('supabase/functions',name),resolve(functions,name),{recursive:true});
const sources=new Set(),queue=['domain.js','ai.js','media.js','knowledge.js'];
while(queue.length){const name=queue.shift();if(sources.has(name))continue;sources.add(name);const content=await readFile(resolve('src',name),'utf8');for(const match of content.matchAll(/(?:from\s*|import\s*)['"]\.\/([^'"]+)['"]/g))queue.push(match[1]);}
await mkdir(resolve(functions,'relay-domain'),{recursive:true});for(const name of sources)await cp(resolve('src',name),resolve(functions,'relay-domain',name));
for(const name of await readdir(resolve(functions,'_shared'))){if(!/\.(js|ts)$/.test(name))continue;const path=resolve(functions,'_shared',name),source=await readFile(path,'utf8');await writeFile(path,source.replaceAll('../../../src/','../relay-domain/'));}
for(const name of ['migrations','operator'])await rm(resolve(destination,name),{recursive:true,force:true});
await cp('supabase/migrations',resolve(destination,'migrations'),{recursive:true});await cp('deploy',resolve(destination,'operator'),{recursive:true});
await mkdir(resolve(destination,'scripts'),{recursive:true});await cp('scripts/run-worker.mjs',resolve(destination,'scripts/run-worker.mjs'));
const files={};async function walk(path){for(const item of await readdir(path,{withFileTypes:true})){const next=resolve(path,item.name);if(item.isDirectory())await walk(next);else{const key=next.slice(destination.length+1);if(key==='manifest.json')continue;files[key]=createHash('sha256').update(await readFile(next)).digest('hex');}}}await walk(destination);
await writeFile(resolve(destination,'manifest.json'),JSON.stringify({format:'product-relay-backend-package',version:1,supabaseComposeRef:'self-hosted/v0.8.2',supabaseClient:'2.117.2',files},null,2));
console.log(`Backend source package written to ${destination}. No service started or secrets configured.`);
