export async function fingerprint(text){const bytes=new TextEncoder().encode(text);const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));return Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');}
export async function writeLinkedFile(handle,text,expectedFingerprint=null) {
  if(expectedFingerprint!==null && await fingerprint(await (await handle.getFile()).text())!==expectedFingerprint)throw new Error('The project file changed outside this tool. Save your changes to a separate file and review the other copy before replacing anything.');
  const stream=await handle.createWritable();
  try{await stream.write(text);await stream.close();}catch(error){try{await stream.abort();}catch{}throw error;}
  return fingerprint(text);
}
