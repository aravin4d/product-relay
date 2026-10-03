import {writeFile,mkdir} from 'node:fs/promises';
import {createPdfFixture,createDocxFixture} from '../tests/helpers/document-fixtures.mjs';
await mkdir(new URL('../tests/fixtures/',import.meta.url),{recursive:true});
await writeFile(new URL('../tests/fixtures/orbit-cancellation.pdf',import.meta.url),createPdfFixture());
await writeFile(new URL('../tests/fixtures/orbit-cancellation.docx',import.meta.url),createDocxFixture());
