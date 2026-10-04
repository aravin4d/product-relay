import test from 'node:test';
import assert from 'node:assert/strict';
import {DOMParser} from '@xmldom/xmldom';
import {reportRows,boundedBytes} from '../src/artifact-report.js';
const Parser=class extends DOMParser{constructor(){super({errorHandler:{warning:()=>{throw new Error('Malformed XML');},error:()=>{throw new Error('Malformed XML');},fatalError:()=>{throw new Error('Malformed XML');}}});}};
test('actual JUnit outcomes preserve failed/skipped status without claiming mapped coverage',()=>{const rows=reportRows('<testsuite><testcase name="paid boundary"/><testcase name="fraud"><failure>Access retained</failure></testcase><testcase name="production"><skipped/></testcase></testsuite>','actual.xml',Parser);assert.deepEqual(rows.map(r=>r.result),['pass','fail','not-run']);assert.equal(rows[0].caseId,undefined);});
test('entity expansion and malformed/non-report XML cannot produce pass evidence',()=>{for(const text of ['<!DOCTYPE x [<!ENTITY evil SYSTEM "file:///etc/passwd">]><testsuite/>','<arbitrary><testcase name="x"/></arbitrary>','<testsuite><testcase></testsuite>'])assert.throws(()=>reportRows(text,'x.xml',Parser));});
test('streaming artifact byte budget aborts oversized download',async()=>{await assert.rejects(()=>boundedBytes(new Response(new Uint8Array(11)),10));});
