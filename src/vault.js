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
  const key=typeof passphraseOrKey==='string'?await deriveVaultKey(passphraseOrKey,envelope.salt):passphraseOrKey;
  let plain;
  try { plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(envelope.iv,24),additionalData:aad(envelope.salt)},key,decode(envelope.ciphertext,45000000)); }
  catch { throw new Error('Incorrect passphrase or damaged workspace file.'); }
  return {data:JSON.parse(decoder.decode(plain)),key};
}
