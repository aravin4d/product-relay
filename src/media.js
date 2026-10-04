export function validateMedia(bytes,kind){
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>2000000)throw new Error('Media limit: one nonempty file up to 2 MB.');
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),ascii=(start,n)=>String.fromCharCode(...bytes.subarray(start,start+n));
 if(kind==='transcribe'){
  if(bytes.length<44||ascii(0,4)!=='RIFF'||ascii(8,4)!=='WAVE'||v.getUint32(4,true)+8!==bytes.length)throw new Error('Use a complete PCM WAV file.');
  let offset=12,format,dataSize;while(offset+8<=bytes.length){const name=ascii(offset,4),size=v.getUint32(offset+4,true),start=offset+8;if(start+size>bytes.length)throw new Error('Truncated WAV chunk.');if(name==='fmt '){if(size<16)throw new Error('Invalid WAV format.');format={codec:v.getUint16(start,true),channels:v.getUint16(start+2,true),rate:v.getUint32(start+4,true),bytesPerSecond:v.getUint32(start+8,true),bits:v.getUint16(start+14,true)};}if(name==='data')dataSize=size;offset=start+size+(size%2);}
  if(!format||format.codec!==1||![1,2].includes(format.channels)||format.bits!==16||format.rate<8000||format.rate>48000||format.bytesPerSecond!==format.rate*format.channels*2||!dataSize)throw new Error('Use 16-bit mono/stereo PCM WAV at 8–48 kHz.');
  const seconds=dataSize/format.bytesPerSecond;if(seconds>120)throw new Error('Split recordings into at most two-minute WAV clips.');return {mediaType:'audio/wav',seconds};
 }
 if(kind!=='ocr')throw new Error('Unsupported media processing choice.');
 let width,height,mediaType;
 if(bytes.length>=24&&ascii(1,3)==='PNG'&&bytes[0]===137&&ascii(12,4)==='IHDR'){width=v.getUint32(16);height=v.getUint32(20);mediaType='image/png';}
 else if(bytes[0]===255&&bytes[1]===216){mediaType='image/jpeg';let i=2;while(i+8<bytes.length){if(bytes[i++]!==255)continue;let marker=bytes[i++];while(marker===255)marker=bytes[i++];if(marker===217||marker===218)break;if(marker===216||marker===0)continue;const size=v.getUint16(i);if(size<2||i+size>bytes.length)throw new Error('Invalid JPEG segment.');if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){height=v.getUint16(i+3);width=v.getUint16(i+5);break;}i+=size;}}
 if(!mediaType||!width||!height||width*height>20000000)throw new Error('Use a PNG/JPEG image with at most 20 million pixels.');return {mediaType,width,height};
}
