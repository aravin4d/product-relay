// JSON record equality: object insertion order is not part of an agreement.
export function canonical(value, seen=new Set()) {
  if(value===undefined)return 'undefined';
  if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number'){if(!Number.isFinite(value))throw new Error('Non-finite project value.');return JSON.stringify(value);}
  if(typeof value!=='object'||seen.has(value))throw new Error('Unsupported or cyclic project value.');
  seen.add(value);let result;
  if(Array.isArray(value))result='['+value.map(item=>{if(item===undefined)throw new Error('Undefined array entry.');return canonical(item,seen);}).join(',')+']';
  else {if(![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw new Error('Only plain project records are supported.');result='{'+Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>JSON.stringify(key)+':'+canonical(value[key],seen)).join(',')+'}';}
  seen.delete(value);return result;
}
export const equal=(a,b)=>canonical(a)===canonical(b);
export async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof value==='string'?value:canonical(value)));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
