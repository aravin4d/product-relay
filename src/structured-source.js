// Parse bounded CSV without evaluating spreadsheet formula text.
export function csvRows(content){
 if(typeof content!=='string'||content.length>200000)throw new Error('Table limit: 200,000 characters.');
 const rows=[];let cells=[],cell='',quoted=false,closed=false,start=content.charCodeAt(0)===0xfeff?1:0;
 for(let i=start;i<=content.length;i++){const ch=content[i];if(quoted){if(ch==='"'&&content[i+1]==='"'){cell+='"';i++;}else if(ch==='"'){quoted=false;closed=true;}else if(ch===undefined)throw new Error('Unclosed quoted CSV cell.');else cell+=ch;continue;}
  if(closed&&(ch===' '||ch==='\t'))continue;
  if(closed&&ch!==','&&ch!=='\n'&&ch!=='\r'&&ch!==undefined)throw new Error('Unexpected text after a quoted CSV cell.');
  if(ch==='"'){if(cell)throw new Error('Unexpected quote in CSV cell.');quoted=true;}
  else if(ch===','){cells.push(cell);cell='';closed=false;if(cells.length>=100)throw new Error('Table limit: 100 columns.');}
  else if(ch==='\n'||ch==='\r'||ch===undefined){cells.push(cell);if(cells.some(v=>v.trim()))rows.push({cells,start,end:i});cells=[];cell='';closed=false;if(ch==='\r'&&content[i+1]==='\n')i++;start=i+1;if(rows.length>2000)throw new Error('Table limit: 2,000 nonempty rows.');}
  else cell+=ch;
 }
 if(rows.some(r=>r.cells.length>100))throw new Error('Table limit: 100 columns.');return rows;
}
export function textLocations(content,type){
 if(type==='csv')return csvRows(content).map((r,i)=>({id:'row-'+(i+1),start:r.start,end:r.end,location:{label:(i?'CSV row ':'CSV header row ')+(i+1)}}));
 if(!['srt','vtt'].includes(type))return [{id:'text-1',start:0,end:content.length,location:{label:'Source text'}}];
 const blocks=[];const pattern=/([^\n]*\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3}\s*-->[^\n]*)/g;let match;
 while((match=pattern.exec(content))){if(blocks.length)blocks.at(-1).end=match.index;blocks.push({id:'cue-'+(blocks.length+1),start:match.index,end:content.length,location:{label:match[1].trim().slice(0,280)}});if(blocks.length>2000)throw new Error('Transcript limit: 2,000 cues.');}
 return blocks.length?blocks:[{id:'transcript-text',start:0,end:content.length,location:{label:'Unsegmented transcript; timestamps unknown'}}];
}
