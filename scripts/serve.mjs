import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url))); const port=Number(process.env.PORT||4173);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.md':'text/plain'};
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path=pathname==='/_checks'?resolve(root,'tests/browser.html'):resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if (!path.startsWith(root+sep) || !types[extname(path)] || !['/','/index.html','/_checks'].includes(pathname)&&!pathname.startsWith('/src/')) {res.writeHead(404);res.end('Not found');return;}
    const content=await readFile(path); res.writeHead(200,{'Content-Type':types[extname(path)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':`default-src 'self'; script-src 'self'${pathname==='/_checks'?" 'unsafe-inline'":''}; style-src 'self'${pathname==='/_checks'?" 'unsafe-inline'":''}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`});res.end(content);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Product Relay: http://127.0.0.1:${port}`));
