import {writeFile} from 'node:fs/promises';
import {exportProject} from '../src/domain.js';
import {createVault} from '../src/vault.js';
import {completeDemoProject} from '../src/demo-story.js';
import {startSharingRound} from '../src/sharing.js';
const {envelope}=await createVault(JSON.parse(exportProject(await startSharingRound(completeDemoProject()))),'orbit-demo-context');
await writeFile(new URL('../examples/orbit-demo.relay',import.meta.url),JSON.stringify(envelope,null,2));
console.log('Fictional example file generated. Demo passphrase: orbit-demo-context');
