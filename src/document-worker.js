/* Dedicated parser worker: terminating this worker cancels all document processing. */
self.onmessage=async({data})=>{
 try{
  const {parseDocumentBytes}=await import('./documents.js');
  const result=await parseDocumentBytes(new Uint8Array(data.bytes),data.type,{onProgress:progress=>self.postMessage({type:'progress',progress})});
  self.postMessage({type:'result',result});
 }catch(error){self.postMessage({type:'error',error:{message:error?.message||'Document could not be read.',code:error?.code||'document-invalid'}});}
};
