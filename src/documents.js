/** Local document extraction. Imported files are never uploaded by this module. */
export const DOCUMENT_LIMITS = Object.freeze({bytes:15*1024*1024, characters:200000, pdfPages:200, zipEntries:1000, zipExpandedBytes:32*1024*1024, zipEntryBytes:8*1024*1024, milliseconds:45000});
const PARSER_VERSIONS = Object.freeze({pdfjs:'6.3.289',mammoth:'1.13.0','plain-text':'1'});
const MIME = Object.freeze({pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',txt:'text/plain',md:'text/markdown',csv:'text/csv',srt:'application/x-subrip',vtt:'text/vtt'});
const fail=(message,code='document-invalid')=>Object.assign(new Error(message),{code});
const cancelled=()=>fail('Document import cancelled.','document-cancelled');
export function documentType(file){
 const extension=String(file?.name??'').toLowerCase().split('.').at(-1);
 if(!Object.hasOwn(MIME,extension))throw fail('Choose a PDF, DOCX, TXT, Markdown, CSV, SRT, or VTT file.','document-type');
 return extension;
}
function checkText(content){
 if(typeof content!=='string'||!content.trim())throw fail('No readable text was found. Scanned PDFs and image-only documents need OCR before importing.','document-empty');
 if(content.length>DOCUMENT_LIMITS.characters)throw fail('The extracted document exceeds 200,000 characters. Split it into smaller documents.','document-limit');
 return content;
}
function normalizedText(text){return text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();}
/** Offsets refer to the exact extracted text that is stored in a source revision. */
export function joinDocumentBlocks(parts){
 let content='';const blocks=[];
 for(const part of parts){const text=normalizedText(part.text);if(!text)continue;if(content)content+='\n\n';const start=content.length;content+=text;blocks.push({id:part.id,start,end:content.length,location:{...part.location}});if(content.length>DOCUMENT_LIMITS.characters)checkText(content);}
 checkText(content);return {content,blocks};
}
/** Reject large ZIP expansion before Mammoth allocates the DOCX contents. */
export function inspectDocxArchive(bytes){
 const data=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);const view=new DataView(data.buffer,data.byteOffset,data.byteLength);let eocd=-1;
 for(let p=data.length-22;p>=Math.max(0,data.length-65557);p--){if(view.getUint32(p,true)===0x06054b50&&p+22+view.getUint16(p+20,true)===data.length){eocd=p;break;}}
 if(eocd<0)throw fail('This DOCX is not a readable Word document.');
 const count=view.getUint16(eocd+10,true),size=view.getUint32(eocd+12,true),offset=view.getUint32(eocd+16,true);
 if(view.getUint16(eocd+4,true)||view.getUint16(eocd+6,true)||view.getUint16(eocd+8,true)!==count||count===65535||offset===0xffffffff||size===0xffffffff||offset+size>eocd)throw fail('Multi-volume and ZIP64 Word documents are not supported.');
 if(count>DOCUMENT_LIMITS.zipEntries)throw fail('This Word document contains too many embedded entries.','document-limit');
 let position=offset,total=0;const names=[];
 for(let index=0;index<count;index++){
  if(position+46>offset+size||view.getUint32(position,true)!==0x02014b50)throw fail('The Word document archive is damaged.');
  const flags=view.getUint16(position+8,true),method=view.getUint16(position+10,true),expanded=view.getUint32(position+24,true),nameLength=view.getUint16(position+28,true),extraLength=view.getUint16(position+30,true),commentLength=view.getUint16(position+32,true),next=position+46+nameLength+extraLength+commentLength;
  if(next>offset+size||view.getUint16(position+34,true)||view.getUint32(position+42,true)>=offset)throw fail('The Word document archive is damaged.');
  if(flags&1)throw fail('Password-protected Word documents are not supported.','document-password');
  if(![0,8].includes(method))throw fail('The Word document uses an unsupported archive compression method.');
  total+=expanded;if(expanded>DOCUMENT_LIMITS.zipEntryBytes||total>DOCUMENT_LIMITS.zipExpandedBytes)throw fail('This Word document expands beyond the safe import limit. Remove large embedded objects or split it.','document-limit');
  names.push(new TextDecoder().decode(data.subarray(position+46,position+46+nameLength)));position=next;
 }
 if(position!==offset+size||!names.includes('word/document.xml')||!names.includes('[Content_Types].xml'))throw fail('This file is not a DOCX Word document.');
 return {entries:count,expandedBytes:total};
}
export function pdfItemsToText(items){
 let output='',lastY=null;
 for(const item of items){if(typeof item.str!=='string')continue;const y=Array.isArray(item.transform)?item.transform[5]:null;
  if(output&&!output.endsWith('\n')&&lastY!==null&&y!==null&&Math.abs(lastY-y)>2)output+='\n';
  if(item.str){if(output&&!/[\s]$/.test(output)&&!/^\s/.test(item.str))output+=' ';output+=item.str;}
  if(item.hasEOL&&!output.endsWith('\n'))output+='\n';lastY=y;
 }
 return normalizedText(output);
}
async function loadPdf(){const pdfjs=await import('./vendor/pdfjs/pdf.mjs');if(typeof document==='undefined')await import('./vendor/pdfjs/pdf.worker.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;return pdfjs;}
async function loadMammoth(){
 if(globalThis.mammoth)return globalThis.mammoth;
 if(typeof importScripts==='function'){importScripts(new URL('./vendor/mammoth/mammoth.browser.min.js',import.meta.url).href);return globalThis.mammoth;}
 throw fail('The Word parser must run in the local document worker. Reload the application and try again.','document-parser');
}
/** Core parser also accepts injected official parsers for Node fixture tests. */
export async function parseDocumentBytes(bytes,type,{pdfjs,mammoth,onProgress=()=>{}}={}){
 const data=bytes instanceof Uint8Array?new Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength):new Uint8Array(bytes);const warnings=[];
 if(data.byteLength>DOCUMENT_LIMITS.bytes)throw fail('Choose a document smaller than 15 MB.','document-limit');
 if(type==='pdf'){
  if(!new TextDecoder().decode(data.subarray(0,1024)).includes('%PDF-'))throw fail('The file does not contain a readable PDF header.');
  const library=pdfjs??await loadPdf();const loading=library.getDocument({data,isEvalSupported:false,useSystemFonts:false,disableFontFace:true,isOffscreenCanvasSupported:false,stopAtErrors:true,cMapUrl:new URL('./vendor/pdfjs/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/pdfjs/standard_fonts/',import.meta.url).href,useWorkerFetch:false});let pdf;
  try{
   pdf=await loading.promise;if(pdf.numPages>DOCUMENT_LIMITS.pdfPages)throw fail('This PDF has more than 200 pages. Split it into smaller documents.','document-limit');const parts=[];let emptyPages=0;
   for(let page=1;page<=pdf.numPages;page++){const documentPage=await pdf.getPage(page);const text=pdfItemsToText((await documentPage.getTextContent()).items);if(!text)emptyPages++;parts.push({id:`page-${page}-block-1`,text,location:{page,label:`Page ${page}`}});onProgress({page,total:pdf.numPages});documentPage.cleanup();}
   warnings.push('PDF reading order and tables may differ from the original. Check the extracted text before saving.');if(emptyPages)warnings.push(`${emptyPages} page${emptyPages===1?'':'s'} had no readable text. Image text was not extracted.`);
   return {...joinDocumentBlocks(parts),warnings,pageCount:pdf.numPages,parser:'pdfjs',parserVersion:library.version??PARSER_VERSIONS.pdfjs};
  }catch(error){if(error?.name==='PasswordException')throw fail('Password-protected PDFs are not supported. Export an unlocked copy before importing.','document-password');throw error;}finally{await loading.destroy().catch(()=>{});}
 }
 if(type==='docx'){
  inspectDocxArchive(data);const library=mammoth??await loadMammoth();const buffer=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);const result=await library.extractRawText({arrayBuffer:buffer});
  warnings.push('Word formatting, comments, and images are not preserved. Paragraph numbers refer to extracted text, not printed page numbers.');for(const message of result.messages??[]){if(typeof message.message==='string'&&warnings.length<21)warnings.push(message.message.slice(0,500));}
  const parts=result.value.split(/\n\s*\n/).map((text,index)=>({id:`paragraph-${index+1}`,text,location:{paragraph:index+1,label:`Paragraph ${index+1}`}}));
  return {...joinDocumentBlocks(parts),warnings,parser:'mammoth',parserVersion:PARSER_VERSIONS.mammoth};
 }
 if(!Object.hasOwn(MIME,type))throw fail('Unsupported document type.','document-type');
 let content;try{content=normalizedText(new TextDecoder('utf-8',{fatal:true}).decode(data));}catch{throw fail('Text files must use UTF-8 encoding. Save an UTF-8 copy and import it again.','document-encoding');}
 if(content.includes('\0'))throw fail('This file contains binary data. Choose a supported text document.');checkText(content);
 if(type==='csv')warnings.push('CSV is imported as text; column relationships are not interpreted automatically.');
 if(['srt','vtt'].includes(type))warnings.push('Transcript timestamps are preserved as text; speakers are not identified automatically.');
 return {content,blocks:[{id:'text-1',start:0,end:content.length,location:{label:'Source text'}}],warnings,parser:'plain-text',parserVersion:PARSER_VERSIONS['plain-text']};
}
async function workerParse(bytes,type,{signal,onProgress=()=>{}}={}){
 if(typeof Worker!=='function')throw fail('This browser cannot run the local document parser. Use a current browser with Web Worker support.','document-parser');
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./document-worker.js',import.meta.url));let settled=false;
  const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);worker.terminate();error?reject(error):resolve(value);};
  const abort=()=>finish(cancelled());const timer=setTimeout(()=>finish(fail('Document parsing took too long. Split the document or export a simpler copy.','document-timeout')),DOCUMENT_LIMITS.milliseconds);
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)return abort();
  worker.onmessage=({data})=>{if(data.type==='progress'){onProgress(data.progress);return;}if(data.type==='result')finish(null,data.result);else if(data.type==='error')finish(fail(data.error?.message??'This document could not be read.',data.error?.code));};
  worker.onerror=()=>finish(fail('The local document parser failed to start. Reload the app; if using a local checkout, run npm ci and npm run dev.','document-parser'));
  worker.postMessage({bytes:bytes.buffer,type},[bytes.buffer]);
 });
}
export async function extractDocument(file,options={}){
 if(!file||typeof file.arrayBuffer!=='function'||!Number.isSafeInteger(file.size)||file.size<=0)throw fail('Choose a nonempty document.','document-empty');
 const type=documentType(file);if(file.size>DOCUMENT_LIMITS.bytes)throw fail('Choose a document smaller than 15 MB.','document-limit');if(options.signal?.aborted)throw cancelled();
 const bytes=new Uint8Array(await file.arrayBuffer());if(bytes.byteLength!==file.size)throw fail('The document changed while it was being read. Choose it again.');
 const sha256=[...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('');if(options.signal?.aborted)throw cancelled();
 const result=['pdf','docx'].includes(type)?await workerParse(bytes,type,options):await parseDocumentBytes(bytes,type,options);
 const metadata={fileName:file.name,mediaType:MIME[type],byteLength:file.size,sha256,parser:result.parser,parserVersion:result.parserVersion,warnings:result.warnings,blocks:result.blocks,...(result.pageCount?{pageCount:result.pageCount}:{})};
 return {title:file.name,kind:['srt','vtt'].includes(type)?'Walkthrough':'Document',content:result.content,metadata,warnings:result.warnings};
}
/** A correction cannot continue claiming the untouched original page/paragraph offsets. */
export function reconcileDocumentEdit(result,newContent){
 const content=checkText(normalizedText(newContent));if(content===result.content)return {...result,content,metadata:structuredClone(result.metadata)};
 const warning='Text was corrected in the import preview. Original page and paragraph locations are unavailable for this revision.';
 const metadata={...structuredClone(result.metadata),reviewed:true,warnings:[...result.metadata.warnings,warning],blocks:[{id:'reviewed-text',start:0,end:content.length,location:{label:'Reviewed text (original locations unavailable)'}}]};
 return {...result,content,metadata,warnings:metadata.warnings};
}
export function findDuplicateDocument(project,result){
 for(const source of project.sources??[])for(const revision of source.revisions??[]){if(result.metadata?.sha256&&revision.document?.sha256===result.metadata.sha256||revision.content===result.content)return {sourceId:source.id,sourceTitle:source.title,revisionId:revision.id,archived:Boolean(source.archived),match:revision.document?.sha256===result.metadata?.sha256?'file':'text'};}
 return null;
}
