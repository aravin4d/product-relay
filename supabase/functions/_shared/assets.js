// Called only after verified full-project access in relay-projects.
export async function assetOperation({admin,operation,input,projectId,actorUserId,capability}){
 const denied=(message,code='invalid_asset',status=400)=>{throw Object.assign(new Error(message),{code,status});};
 const data=async query=>{const result=await query;if(result.error)denied('Private original unavailable.','asset_unavailable',503);return result.data;};
 const reauthorize=async capabilities=>{const membership=await data(admin.from('relay_memberships').select('active,capability').eq('project_id',projectId).eq('user_id',actorUserId).maybeSingle()),project=await data(admin.from('relay_projects').select('active').eq('id',projectId).maybeSingle());if(!membership?.active||!project?.active||!capabilities.includes(membership.capability))denied('Access changed during original processing.','access_denied',403);};
 if(operation==='upload-asset'){
  if(!['owner','reviewer','editor'].includes(capability)||input.consent!==true)denied('Explicit authorized plaintext upload required.','access_denied',403);
  if(typeof input.base64!=='string'||input.base64.length>8000000||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.base64)||typeof input.fileName!=='string'||!input.fileName.trim()||input.fileName.length>512)denied('Original file exceeds its bounds.');
  const bytes=Uint8Array.from(atob(input.base64),c=>c.charCodeAt(0));if(!bytes.length||bytes.length>6000000)denied('Private original limit: 6 MB per upload.');
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join(''),objectKey=projectId+'/'+hash;
  const old=await data(admin.from('relay_asset_receipts').select('*').eq('project_id',projectId).eq('hash',hash).maybeSingle());if(old)return {asset:old,duplicate:true};
  const type=typeof input.mediaType==='string'&&input.mediaType.length<=150?input.mediaType:'application/octet-stream';
  const result=await admin.storage.from('relay-originals').upload(objectKey,bytes,{contentType:type,upsert:false});if(result.error)denied('Upload did not complete; inspect private storage before repeating.','asset_upload_uncertain',503);
  await reauthorize(['owner','reviewer','editor']);
  const asset=await data(admin.from('relay_asset_receipts').upsert({project_id:projectId,hash,object_key:objectKey,byte_length:bytes.length,file_name:input.fileName,media_type:type,actor_user_id:actorUserId},{onConflict:'project_id,hash',ignoreDuplicates:true}).select('*').single());return {asset};
 }
 if(operation==='download-asset'){
  if(!/^[a-f0-9]{64}$/.test(input.hash))denied('Invalid original reference.');const asset=await data(admin.from('relay_asset_receipts').select('*').eq('project_id',projectId).eq('hash',input.hash).maybeSingle());if(!asset)denied('Original is not available in this shared service.','asset_unavailable',404);
  const result=await admin.storage.from('relay-originals').download(asset.object_key);if(result.error)denied('Private original unavailable.','asset_unavailable',503);
  if(result.data.size>6000000)denied('Stored original exceeds its supported size.','asset_integrity',409);
  const bytes=new Uint8Array(await result.data.arrayBuffer());if(bytes.length!==asset.byte_length)denied('Original length differs from receipt.','asset_integrity',409);
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==asset.hash)denied('Original checksum differs from receipt.','asset_integrity',409);
  await reauthorize(['owner','reviewer','editor','observer']);
  let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return {asset,base64:btoa(binary)};
 }
 denied('Unsupported asset operation.');
}
