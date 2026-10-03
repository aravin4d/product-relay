import {mkdir,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));const vendor=resolve(root,'src/vendor');
await rm(vendor,{recursive:true,force:true});await mkdir(resolve(vendor,'pdfjs'),{recursive:true});await mkdir(resolve(vendor,'mammoth'),{recursive:true});
for(const file of ['legacy/build/pdf.mjs','legacy/build/pdf.worker.mjs','LICENSE','cmaps','standard_fonts'])await cp(resolve(root,'node_modules/pdfjs-dist',file),resolve(vendor,'pdfjs',file.startsWith('legacy/build/')?file.slice(13):file),{recursive:true});
for(const file of ['mammoth.browser.min.js','LICENSE'])await cp(resolve(root,'node_modules/mammoth',file),resolve(vendor,'mammoth',file));
const dependencies={};for(const name of ['pdfjs-dist','mammoth'])dependencies[name]=JSON.parse(await readFile(resolve(root,'node_modules',name,'package.json'),'utf8')).version;
await writeFile(resolve(vendor,'versions.json'),JSON.stringify(dependencies,null,2)+'\n');console.log('Local PDF and Word parsers prepared.');
