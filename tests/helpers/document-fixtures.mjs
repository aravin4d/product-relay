import {deflateRawSync} from 'node:zlib';
const escapeXml=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let index=0;index<8;index++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
export function makeZip(entries){
 const localParts=[],centralParts=[];let offset=0;
 for(const [name,value] of entries){const bytes=Buffer.from(value),nameBytes=Buffer.from(name),compressed=deflateRawSync(bytes),crc=crc32(bytes);const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(8,8);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(nameBytes.length,26);localParts.push(local,nameBytes,compressed);
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(8,10);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(bytes.length,24);central.writeUInt16LE(nameBytes.length,28);central.writeUInt32LE(offset,42);centralParts.push(central,nameBytes);offset+=local.length+nameBytes.length+compressed.length;
 }
 const central=Buffer.concat(centralParts),eocd=Buffer.alloc(22);eocd.writeUInt32LE(0x06054b50);eocd.writeUInt16LE(entries.length,8);eocd.writeUInt16LE(entries.length,10);eocd.writeUInt32LE(central.length,12);eocd.writeUInt32LE(offset,16);return Buffer.concat([...localParts,central,eocd]);
}
export function createDocxFixture(paragraphs=['Orbit: cancellation policy','For ordinary cancellations, access remains active until the paid period ends.','For confirmed fraud in release 2, access is revoked immediately.','<script>alert("fictional")</script> is source text, never executable content.']){
 return makeZip([
  ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
  ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
  ['word/document.xml',`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.map(text=>`<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`).join('')}<w:sectPr/></w:body></w:document>`]
 ]);
}
export function createPdfFixture(pages=[['Orbit: ordinary cancellation','Access remains active until the paid period ends.'],['Orbit: confirmed fraud, release 2','Access is revoked immediately only for confirmed fraud.']]){
 const objects=[];const add=value=>{objects.push(value);return objects.length;};add('<< /Type /Catalog /Pages 2 0 R >>');add('');const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');const pageIds=[];
 for(const lines of pages){const text=lines.map((line,index)=>`${index?'0 -24 Td\n':''}(${line.replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)')}) Tj`).join('\n');const stream=`BT\n/F1 12 Tf\n72 720 Td\n${text}\nET`;const streamId=add(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);pageIds.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${streamId} 0 R >>`));}
 objects[1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;let pdf='%PDF-1.4\n';const offsets=[0];for(let index=0;index<objects.length;index++){offsets.push(Buffer.byteLength(pdf));pdf+=`${index+1} 0 obj\n${objects[index]}\nendobj\n`;}
 const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return Buffer.from(pdf);
}
