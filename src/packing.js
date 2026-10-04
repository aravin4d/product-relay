import {canonical} from './value.js';
// Every container is tagged, so user data cannot collide with reference markers.
// References only point backwards; decoding cannot introduce cycles.
export function packProject(project) {
  const dictionary=[],seen=new Map();
  function encode(value,depth=0){
    if(depth>96)throw new Error('Project nesting exceeds the supported bound.');
    if(value===null||typeof value!=='object')return value;
    const key=canonical(value),large=key.length>=512;
    if(large&&seen.has(key))return ['r',seen.get(key)];
    const node=Array.isArray(value)?['a',value.map(v=>encode(v,depth+1))]:['o',Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,encode(value[k],depth+1)])];
    if(!large)return node;
    if(dictionary.length>=50000)throw new Error('Too many packed project records.');
    const id=dictionary.length;dictionary.push(node);seen.set(key,id);return ['r',id];
  }
  return {encoding:'record-dictionary-v1',root:encode(project),dictionary};
}
export function unpackProject(packed) {
  if(packed?.encoding!=='record-dictionary-v1'||!Array.isArray(packed.dictionary)||packed.dictionary.length>50000)throw new Error('Unsupported packed project.');
  let budget=32000000,containers=0;
  function decode(node,upper,depth=0){
    if(depth>96||++containers>500000)throw new Error('Packed project exceeds the expansion budget.');
    if(node===null||typeof node==='string'||typeof node==='boolean'||(typeof node==='number'&&Number.isFinite(node))){budget-=typeof node==='string'?new TextEncoder().encode(node).length:8;if(budget<0)throw new Error('Expanded project exceeds 32 MB.');return node;}
    if(!Array.isArray(node)||node.length!==2)throw new Error('Invalid packed project node.');
    const [tag,data]=node;
    if(tag==='r'){if(!Number.isSafeInteger(data)||data<0||data>=upper)throw new Error('Invalid or cyclic packed reference.');return decode(packed.dictionary[data],data,depth+1);}
    if(!Array.isArray(data))throw new Error('Invalid packed project container.');
    budget-=data.length*12;if(budget<0)throw new Error('Expanded project exceeds 32 MB.');
    if(tag==='a')return data.map(v=>decode(v,upper,depth+1));
    if(tag!=='o')throw new Error('Unknown packed project tag.');
    const result={},keys=new Set();for(const pair of data){if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||keys.has(pair[0]))throw new Error('Invalid packed object key.');keys.add(pair[0]);budget-=new TextEncoder().encode(pair[0]).length+8;if(budget<0)throw new Error('Expanded project exceeds 32 MB.');Object.defineProperty(result,pair[0],{value:decode(pair[1],upper,depth+1),enumerable:true,writable:true,configurable:true});}return result;
  }
  return decode(packed.root,packed.dictionary.length);
}
