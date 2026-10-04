// The same Web Crypto envelope is used by the browser and the Node companion.
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 600000;
const aad = salt => encoder.encode('product-relay-vault:1:'+salt);
const encode = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
function decode(value, max) {
  if (typeof value !== 'string' || value.length > max || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error('Invalid encrypted workspace.');
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}
export function validateEnvelope(value) {
  if(value?.format==='product-relay-vault'&&value.version===2){
    if(value.algorithm!=='AES-256-GCM'||value.kdf!=='PBKDF2-SHA256'||value.iterations!==ITERATIONS||decode(value.salt,32).length!==16||decode(value.iv,24).length!==12||decode(value.ciphertext,45000000).length<16)throw new Error('Invalid recoverable workspace.');
    for(const name of ['password','recovery']){const w=value[name];if(!w||decode(w.salt,32).length!==16||decode(w.iv,24).length!==12||decode(w.wrappedKey,80).length!==48)throw new Error('Invalid encrypted key wrapper.');}return value;
  }
  if (!value || value.format !== 'product-relay-vault' || value.version !== 1 || value.algorithm !== 'AES-256-GCM' || value.kdf !== 'PBKDF2-SHA256' || value.iterations !== ITERATIONS) throw new Error('Unsupported encrypted workspace.');
  if (decode(value.salt, 32).length !== 16 || decode(value.iv, 24).length !== 12 || decode(value.ciphertext, 45000000).length < 16) throw new Error('Invalid encrypted workspace.');
  return value;
}
export async function deriveVaultKey(passphrase, salt) {
  if (typeof passphrase !== 'string' || passphrase.length > 1024) throw new Error('Invalid passphrase.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2', hash:'SHA-256', salt:decode(salt,32), iterations:ITERATIONS}, material, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
}
export async function sealVault(data, key, salt) {
  if(typeof salt==='object'&&salt.version===2){const previous=validateEnvelope(salt),iv=crypto.getRandomValues(new Uint8Array(12)),plain=encoder.encode(JSON.stringify(data));if(plain.length>32000000)throw new Error('Workspace exceeds 32 MB.');const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode('product-relay-vault:2:'+previous.salt)},key,plain);let binary='';const bytes=new Uint8Array(encrypted);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return {...previous,iv:encode(iv),ciphertext:btoa(binary)};}
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = encoder.encode(JSON.stringify(data));
  if (plain.byteLength > 32000000) throw new Error('Workspace exceeds the 32 MB limit. Export older projects into a separate workspace.');
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(salt)},key,plain));
  // Chunk conversion avoids overflowing the stack for larger workspaces.
  let binary=''; for(let i=0;i<encrypted.length;i+=8192) binary+=String.fromCharCode(...encrypted.subarray(i,i+8192));
  return {format:'product-relay-vault',version:1,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt,iv:encode(iv),ciphertext:btoa(binary)};
}
export async function createVault(data, passphrase) {
  if (typeof passphrase !== 'string' || passphrase.length < 12 || passphrase.length > 1024) throw new Error('Use a passphrase of at least 12 characters.');
  const salt=encode(crypto.getRandomValues(new Uint8Array(16)));
  const key=await deriveVaultKey(passphrase,salt);
  return {envelope:await sealVault(data,key,salt),key};
}
export async function openVault(envelope, passphraseOrKey) {
  validateEnvelope(envelope);
  if(envelope.version===2){let key=passphraseOrKey;if(typeof key==='string'){let raw;for(const name of ['password','recovery']){const w=envelope[name];try{const wrapping=await deriveVaultKey(passphraseOrKey,w.salt);raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(w.iv,24),additionalData:encoder.encode('product-relay-key:2:'+envelope.salt+':'+name)},wrapping,decode(w.wrappedKey,80));break;}catch{}}if(!raw||raw.byteLength!==32)throw new Error('Incorrect passphrase/recovery secret or damaged workspace.');key=await crypto.subtle.importKey('raw',raw,'AES-GCM',true,['encrypt','decrypt']);}try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(envelope.iv,24),additionalData:encoder.encode('product-relay-vault:2:'+envelope.salt)},key,decode(envelope.ciphertext,45000000));return {data:JSON.parse(decoder.decode(plain)),key};}catch{throw new Error('Incorrect secret or damaged workspace.');}}
  const key=typeof passphraseOrKey==='string'?await deriveVaultKey(passphraseOrKey,envelope.salt):passphraseOrKey;
  let plain;
  try { plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(envelope.iv,24),additionalData:aad(envelope.salt)},key,decode(envelope.ciphertext,45000000)); }
  catch { throw new Error('Incorrect passphrase or damaged workspace file.'); }
  return {data:JSON.parse(decoder.decode(plain)),key};
}

async function wrapDataKey(key,secret,name,salt){const wrapperSalt=encode(crypto.getRandomValues(new Uint8Array(16))),iv=crypto.getRandomValues(new Uint8Array(12)),wrapping=await deriveVaultKey(secret,wrapperSalt),raw=await crypto.subtle.exportKey('raw',key),wrapped=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode('product-relay-key:2:'+salt+':'+name)},wrapping,raw);return {salt:wrapperSalt,iv:encode(iv),wrappedKey:encode(wrapped)};}
export async function createRecoverableVault(data,passphrase){if(typeof passphrase!=='string'||passphrase.length<12||passphrase.length>1024)throw new Error('Use a passphrase of at least 12 characters.');const secret=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''),salt=encode(crypto.getRandomValues(new Uint8Array(16))),key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);const header={format:'product-relay-vault',version:2,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt,iv:encode(new Uint8Array(12)),ciphertext:encode(new Uint8Array(16)),password:await wrapDataKey(key,passphrase,'password',salt),recovery:await wrapDataKey(key,secret,'recovery',salt)};return {envelope:await sealVault(data,key,header),key,secret};}
export async function rotateVault(envelope,knownPassphrase,newPassphrase){if(newPassphrase.length<12||newPassphrase.length>1024)throw new Error('Use a passphrase of at least 12 characters.');const {data,key}=await openVault(envelope,knownPassphrase);if(envelope.version===1)return {...await createVault(data,newPassphrase),data};const next={...envelope,password:await wrapDataKey(key,newPassphrase,'password',envelope.salt)};return {envelope:await sealVault(data,key,next),key,data};}
