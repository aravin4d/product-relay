// Static linking only: no project mutations, provider calls or application evaluation.
import {SourceTextModule} from 'node:vm';
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const cache=new Map();
async function moduleAt(path){path=resolve(path);if(cache.has(path))return cache.get(path);const source=await readFile(path,'utf8'),m=new SourceTextModule(source,{identifier:path});cache.set(path,m);return m;}
const roots=process.argv.slice(2);if(!roots.length)roots.push('src/app.js','supabase/functions/_shared/projects.js','supabase/functions/_shared/jobs.js','supabase/functions/_shared/handler.js','supabase/functions/_shared/project-ai.js');
for(const root of roots){
 const m=await moduleAt(root);if(m.status==='unlinked')await m.link((specifier,parent)=>{if(!specifier.startsWith('.'))throw new Error('Unexpected external static import: '+specifier);return moduleAt(resolve(dirname(parent.identifier),specifier));});
}
// Named namespace access needs an explicit check: JS permits missing ns.member
// until execution, even though an equivalent named import would fail to link.
for(const [path] of cache){const source=await readFile(path,'utf8');for(const match of source.matchAll(/import\s*\*\s*as\s+([\w$]+)\s+from\s*['"]([^'"]+)['"]/g)){const target=cache.get(resolve(dirname(path),match[2]));if(!target)continue;const exports=new Set(Object.getOwnPropertyNames(target.namespace));for(const access of source.matchAll(new RegExp('\\b'+match[1]+'\\.([\\w$]+)','g')))if(!exports.has(access[1]))throw new Error(`${path}: ${match[1]}.${access[1]} is not exported by ${match[2]}`);}}
console.log(`Statically linked ${cache.size} JavaScript modules; application not executed.`);
