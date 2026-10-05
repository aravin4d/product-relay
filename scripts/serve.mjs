import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url))); const port=Number(process.env.PORT||4173);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.bcmap':'application/octet-stream','.pfb':'application/octet-stream','.ttf':'application/octet-stream','.woff':'font/woff','.woff2':'font/woff2','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.json':'application/json','.md':'text/plain'};
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const checks={'/_checks':'tests/browser.html','/_document-checks':'tests/document-browser.html','/_performance':'tests/phase2-performance.html'};
    const isCheck=Object.hasOwn(checks,pathname),path=isCheck?resolve(root,checks[pathname]):resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if (!path.startsWith(root+sep) || !types[extname(path)] || !['/','/index.html'].includes(pathname)&&!isCheck&&!pathname.startsWith('/src/')&&!pathname.startsWith('/tests/fixtures/')) {res.writeHead(404);res.end('Not found');return;}
    const content=await readFile(path); res.writeHead(200,{'Content-Type':types[extname(path)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':`default-src 'self'; script-src 'self'${isCheck?" 'unsafe-inline'":''}; worker-src 'self'; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; style-src 'self'${isCheck?" 'unsafe-inline'":''}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`});res.end(content);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Product Relay: http://127.0.0.1:${port}`));
