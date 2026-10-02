import {writeFile} from 'node:fs/promises';
import {demoProject,exportProject} from '../src/domain.js';
import {createVault} from '../src/vault.js';
const {envelope}=await createVault(JSON.parse(exportProject(demoProject())),'orbit-demo-context');
await writeFile(new URL('../examples/orbit-demo.relay',import.meta.url),JSON.stringify(envelope,null,2));
console.log('Fictional example file generated. Demo passphrase: orbit-demo-context');
