import {list} from './lifecycle.js';
import {reportRows} from './artifact-report.js';
export function parseResults(text,fileName,p){if(typeof text!=='string'||text.length>5000000)throw new Error('Report is too large.');return reportRows(text,fileName).map(row=>{const candidates=list(p,'cases').filter(c=>c.status==='approved'&&!c.archived&&c.title===row.title);return {...row,caseId:candidates.length===1?candidates[0].id:''};});}
