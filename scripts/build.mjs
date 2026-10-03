import './prepare-parsers.mjs';
import {cp,mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));const site=resolve(root,'site');
await rm(site,{recursive:true,force:true});await mkdir(site,{recursive:true});await cp(resolve(root,'index.html'),resolve(site,'index.html'));await cp(resolve(root,'src'),resolve(site,'src'),{recursive:true});console.log('GitHub Pages site built in site/.');
