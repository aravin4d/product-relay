import test from 'node:test';
import assert from 'node:assert/strict';
import * as documents from '../src/documents.js';
import {createPdfFixture,createDocxFixture,makeZip} from './helpers/document-fixtures.mjs';
const mammoth=(await import('mammoth/mammoth.browser.js')).default;
const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
pdfjs.GlobalWorkerOptions.workerSrc=new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',import.meta.url).href;
const textFile=(name,text)=>new File([text],name);
function assertLocations(result){for(const block of result.blocks){assert.ok(block.start>=0&&block.end<=result.content.length&&block.start<block.end);assert.ok(result.content.slice(block.start,block.end).trim());}}
test('Actual PDF.js extracts page-qualified ordinary and fraud rules',async()=>{
 const result=await documents.parseDocumentBytes(createPdfFixture(),'pdf',{pdfjs});assert.equal(result.pageCount,2);assert.match(result.content,/paid period ends/);assert.match(result.content,/only for confirmed fraud/);assert.equal(result.blocks.length,2);assert.equal(result.blocks[1].location.page,2);assertLocations(result);
});
test('Actual Mammoth extracts DOCX paragraphs as plain text, including inert markup',async()=>{
 const result=await documents.parseDocumentBytes(createDocxFixture(),'docx',{mammoth});assert.equal(result.blocks.length,4);assert.equal(result.blocks[2].location.paragraph,3);assert.match(result.content,/<script>alert\("fictional"\)<\/script>/);assert.match(result.content,/release 2/);assertLocations(result);
});
test('Plain text import hashes file bytes and keeps normalized source offsets',async()=>{
 const result=await documents.extractDocument(textFile('walkthrough.md','\uFEFF  First rule.\r\n\r\nSecond rule.  '));assert.equal(result.content,'First rule.\n\nSecond rule.');assert.equal(result.metadata.parser,'plain-text');assert.match(result.metadata.sha256,/^[a-f0-9]{64}$/);assert.equal(result.metadata.byteLength,34);assert.equal(result.metadata.blocks[0].end,result.content.length);
});
test('Empty, unsupported, oversized and binary text inputs fail safely',async()=>{
 await assert.rejects(()=>documents.extractDocument(textFile('empty.txt',' ')),/No readable text/);await assert.rejects(()=>documents.extractDocument(textFile('app.html','<script>')),/Choose a PDF/);await assert.rejects(()=>documents.extractDocument({name:'huge.pdf',size:documents.DOCUMENT_LIMITS.bytes+1,arrayBuffer:()=>{throw new Error('must not read');}}),/smaller than 15 MB/);await assert.rejects(()=>documents.extractDocument(textFile('binary.txt','hello\0world')),/binary data/);await assert.rejects(()=>documents.extractDocument(new File([new Uint8Array([255,254,240])],'bad.txt')),/UTF-8/);
});
test('Scanned and overlong PDF inputs are not silently imported',async()=>{
 await assert.rejects(()=>documents.parseDocumentBytes(createPdfFixture([[]]),'pdf',{pdfjs}),/No readable text/);await assert.rejects(()=>documents.parseDocumentBytes(createPdfFixture(Array.from({length:201},()=>['Rule'])),'pdf',{pdfjs}),/more than 200 pages/);
});
test('DOCX ZIP preflight rejects non-Word packages, corrupt headers, and expansion bombs',()=>{
 assert.equal(documents.inspectDocxArchive(createDocxFixture()).entries,3);assert.throws(()=>documents.inspectDocxArchive(new Uint8Array([1,2,3])),/not a readable Word/);assert.throws(()=>documents.inspectDocxArchive(makeZip([['data.txt','x']])),/not a DOCX/);const bomb=createDocxFixture();const start=bomb.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));bomb.writeUInt32LE(documents.DOCUMENT_LIMITS.zipEntryBytes+1,start+24);assert.throws(()=>documents.inspectDocxArchive(bomb),/safe import limit/);
});
test('Malformed PDF and DOCX are rejected without producing content',async()=>{
 await assert.rejects(()=>documents.parseDocumentBytes(new TextEncoder().encode('not a pdf'),'pdf',{pdfjs}),/PDF header/);await assert.rejects(()=>documents.parseDocumentBytes(new Uint8Array([80,75,1]),'docx',{mammoth}),/not a readable Word/);
});
test('Text corrections discard original offsets rather than creating false page citations',async()=>{
 const result=await documents.extractDocument(textFile('prd.txt','Original rule.'));const unchanged=documents.reconcileDocumentEdit(result,'Original rule.');assert.deepEqual(unchanged.metadata.blocks,result.metadata.blocks);const edited=documents.reconcileDocumentEdit(result,'Corrected rule.');assert.equal(edited.metadata.reviewed,true);assert.equal(edited.metadata.blocks.length,1);assert.equal(edited.metadata.blocks[0].location.page,undefined);assert.match(edited.metadata.blocks[0].location.label,/unavailable/);assert.equal(edited.metadata.blocks[0].end,edited.content.length);assert.throws(()=>documents.reconcileDocumentEdit(result,' '),/No readable text/);
});
test('Duplicate detection finds original file revisions or equal extracted text',async()=>{
 const result=await documents.extractDocument(textFile('prd.txt','Same rule.'));const project={sources:[{id:'source-id',title:'PRD',revisions:[{id:'revision-id',content:result.content,document:result.metadata}]}]};assert.equal(documents.findDuplicateDocument(project,result).match,'file');assert.equal(documents.findDuplicateDocument(project,{...result,metadata:{...result.metadata,sha256:'different'}}).match,'text');assert.equal(documents.findDuplicateDocument(project,{...result,content:'different',metadata:{sha256:'other'}}),null);
});
test('Abort prevents file reads and CSV/transcript imports advertise interpretation limits',async()=>{
 const controller=new AbortController();controller.abort();await assert.rejects(()=>documents.extractDocument(textFile('prd.txt','Rule'),{signal:controller.signal}),/cancelled/);const csv=await documents.extractDocument(textFile('cases.csv','name,rule\nordinary,keep access'));assert.match(csv.warnings[0],/Map columns explicitly/);const transcript=await documents.extractDocument(textFile('walkthrough.vtt','WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOnly fraud.'));assert.equal(transcript.kind,'Walkthrough');assert.match(transcript.content,/00:00:01/);
});
