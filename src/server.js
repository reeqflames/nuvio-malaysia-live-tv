const http=require('node:http');
const channels=require('./channels');
const {runDiagnostics}=require('./diagnostics');
const {resolveMediaPrima,probeMediaPrima}=require('./media-prima');
const PORT=Number(process.env.PORT||3000);
const PUBLIC_BASE=process.env.PUBLIC_URL||'https://nuvio-malaysia-live-tv.onrender.com';

const manifest={
  id:'my.reeqflames.nuvio.malaysia.live',
  version:'1.10.0',
  name:'Malaysia Live TV',
  description:'Malaysian live TV, tuned for simple home-screen playback.',
  resources:['catalog','meta','stream'],
  types:['tv'],
  catalogs:[{type:'tv',id:'malaysia-live',name:'Live TV'}],
  idPrefixes:['mytv:'],
  behaviorHints:{configurable:false,p2pNotSupported:true}
};

function allSources(c){return c.sources&&c.sources.length?c.sources:(c.source?[c.source]:[])}
function configured(c){return !!c.resolver||allSources(c).length>0}
const logo=c=>c.logo||`${PUBLIC_BASE}/logo/${encodeURIComponent(c.id)}.svg`;
const card=c=>`${PUBLIC_BASE}/card/${encodeURIComponent(c.id)}.svg`;

function meta(c){return{
  id:`mytv:${c.id}`,
  type:'tv',
  name:c.name,
  poster:card(c),
  posterShape:'landscape',
  background:card(c),
  description:`${c.provider} • ${c.group} • Live`,
  genres:[c.group,'Malaysia','Live TV'],
  behaviorHints:{defaultVideoId:`mytv:${c.id}`}
};}

function json(res,status,body,age=60){
  res.writeHead(status,{
    'content-type':'application/json; charset=utf-8',
    'access-control-allow-origin':'*',
    'access-control-allow-methods':'GET,HEAD,OPTIONS',
    'access-control-allow-headers':'*',
    'cache-control':`public,max-age=${age}`
  });
  if(res.req?.method==='HEAD')return res.end();
  res.end(JSON.stringify(body));
}

function esc(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}

function svg(res,id){
  const c=channels.find(x=>x.id===id);
  if(!c){res.writeHead(404);return res.end();}
  res.writeHead(200,{'content-type':'image/svg+xml','access-control-allow-origin':'*','cache-control':'public,max-age=86400'});
  if(res.req?.method==='HEAD')return res.end();
  res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="96" fill="white"/><text x="256" y="284" text-anchor="middle" font-family="Arial" font-size="64" font-weight="700" fill="#111">${esc(c.name)}</text></svg>`);
}

function cardSvg(res,id){
  const c=channels.find(x=>x.id===id);
  if(!c){res.writeHead(404);return res.end();}
  res.writeHead(200,{'content-type':'image/svg+xml','access-control-allow-origin':'*','cache-control':'public,max-age=86400'});
  if(res.req?.method==='HEAD')return res.end();
  const name=esc(c.name);
  const provider=esc(c.provider);
  const group=esc(c.group);
  res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101722"/><stop offset="1" stop-color="#05070b"/></linearGradient>
      <radialGradient id="glow" cx="78%" cy="18%" r="70%"><stop stop-color="#26364f" stop-opacity=".8"/><stop offset="1" stop-color="#26364f" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="960" height="540" rx="34" fill="url(#bg)"/>
    <rect width="960" height="540" rx="34" fill="url(#glow)"/>
    <rect x="58" y="55" width="96" height="38" rx="19" fill="#e31b23"/>
    <text x="106" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="white">LIVE</text>
    <text x="58" y="330" font-family="Arial, sans-serif" font-size="86" font-weight="800" fill="white">${name}</text>
    <text x="61" y="386" font-family="Arial, sans-serif" font-size="27" font-weight="500" fill="#b9c4d2">${provider}  •  ${group}</text>
    <circle cx="846" cy="392" r="63" fill="#ffffff" fill-opacity=".08"/>
    <path d="M830 357 L830 427 L882 392 Z" fill="white" fill-opacity=".92"/>
  </svg>`);
}

function oneStream(c,s){
  const o={
    name:'Malaysia Live TV',
    title:`${c.name} • Live`,
    url:s.url,
    behaviorHints:{notWebReady:false,bingeGroup:`malaysia-live-${c.id}`}
  };
  const h=s.headers||(s.referer?{Referer:s.referer}:null);
  if(h)o.behaviorHints.proxyHeaders={request:h};
  return o;
}

async function primaryStream(c){
  if(c.resolver?.type==='malaysia-tv'){
    try{
      const s=await resolveMediaPrima(c.resolver.channel,c.resolver.page);
      return [oneStream(c,{url:s.url,quality:'HD',headers:s.headers})];
    }catch(e){
      console.log(`MEDIA_PRIMA_RESOLVE_ERROR ${c.id} ${e.name}: ${e.message}`);
      return [];
    }
  }
  const list=allSources(c);
  return list.length?[oneStream(c,list[0])]:[];
}

function normalizePath(path){
  let p=path;
  try{p=decodeURIComponent(p)}catch{}
  while(p.startsWith('/manifest.json/'))p=p.slice('/manifest.json'.length);
  return p||'/';
}

function home(res){
  const live=channels.filter(configured);
  const pending=channels.filter(c=>!configured(c));
  const cards=channels.map(c=>`<article class="card ${configured(c)?'':'off'}"><img src="${card(c)}" alt=""><div class="info"><b>${esc(c.name)}</b><small>${esc(c.provider)} • ${esc(c.group)}</small></div><span>${configured(c)?'LIVE':'PENDING'}</span></article>`).join('');
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','access-control-allow-origin':'*'});
  res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Malaysia Live TV</title><style>*{box-sizing:border-box}body{margin:0;background:#07090e;color:#f7f8fb;font:15px/1.45 Inter,system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:1000px;margin:auto;padding:34px 18px 60px}.hero{padding:10px 2px 24px}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8c96a8;font-weight:700}.hero h1{font-size:34px;margin:7px 0 6px}.hero p{margin:0;color:#9ca6b8}.stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.pill{padding:7px 10px;border:1px solid #202735;background:#10151d;border-radius:999px;color:#b9c2d0;font-size:12px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}.card{position:relative;overflow:hidden;background:#0f141c;border:1px solid #1d2632;border-radius:18px}.card>img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}.info{padding:11px 13px 13px;display:flex;flex-direction:column;gap:2px}.info small{color:#8f9aaa}.card span{position:absolute;right:12px;top:12px;background:#10151dcc;border:1px solid #2a3443;border-radius:999px;padding:5px 8px;font-size:10px;letter-spacing:.08em;font-weight:800;color:#6ee7a8}.card.off{opacity:.42}.card.off span{color:#7f8997}.manifest{margin-top:24px;padding:14px;border:1px solid #1d2632;background:#0d1219;border-radius:14px}.manifest small{display:block;color:#7f8997;margin-bottom:5px}.manifest code{font-size:12px;color:#b7f5cd;word-break:break-all}</style></head><body><main><section class="hero"><div class="eyebrow">Nuvio Addon</div><h1>Malaysia Live TV</h1><p>One Live TV row, clean channel cards, one visible playback source.</p><div class="stats"><div class="pill">${live.length} playable</div><div class="pill">${pending.length} pending</div><div class="pill">v${manifest.version}</div></div></section><section class="grid">${cards}</section><div class="manifest"><small>Manifest</small><code>${PUBLIC_BASE}/manifest.json</code></div></main></body></html>`);
}

const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,PUBLIC_BASE);
  const p=normalizePath(u.pathname);
  res.on('finish',()=>console.log(`${req.method} ${u.pathname}${u.search||''} -> ${p} [${res.statusCode}]`));
  if(req.method==='OPTIONS'){
    res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,HEAD,OPTIONS','access-control-allow-headers':'*'});
    return res.end();
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'method not allowed'},0);
  if(p==='/')return home(res);
  if(p==='/health')return json(res,200,{ok:true,version:manifest.version,channels:channels.length,playable:channels.filter(configured).length,pending:channels.filter(c=>!configured(c)).map(c=>c.name)},0);
  if(p==='/diag')return json(res,200,await runDiagnostics(),0);
  if(p==='/manifest.json')return json(res,200,manifest,0);
  let m=p.match(/^\/logo\/([^/]+)\.svg$/);if(m)return svg(res,decodeURIComponent(m[1]));
  m=p.match(/^\/card\/([^/]+)\.svg$/);if(m)return cardSvg(res,decodeURIComponent(m[1]));
  m=p.match(/^\/catalog\/tv\/([^/]+?)(?:\/[^/]+)?\.json$/);
  if(m){const id=decodeURIComponent(m[1]);const list=id==='malaysia-live'?channels.filter(configured):[];return json(res,200,{metas:list.map(meta)},10);}
  m=p.match(/^\/meta\/tv\/mytv:([^/]+)\.json$/);
  if(m){const c=channels.find(x=>x.id===decodeURIComponent(m[1]));return c?json(res,200,{meta:meta(c)},10):json(res,404,{error:'not found'},0);}
  m=p.match(/^\/stream\/tv\/mytv:([^/]+)\.json$/);
  if(m){const c=channels.find(x=>x.id===decodeURIComponent(m[1]));if(!c)return json(res,404,{error:'not found'},0);const streams=await primaryStream(c);return json(res,200,{streams},3);}
  return json(res,404,{error:'not found',path:p},0);
});

server.listen(PORT,'0.0.0.0',()=>{
  console.log(`Malaysia Live TV ${manifest.version} dynamic-media-prima`);
  const mp=channels.filter(c=>c.resolver?.type==='malaysia-tv').map(c=>({id:c.id,channel:c.resolver.channel,page:c.resolver.page}));
  probeMediaPrima(mp).then(d=>console.log('MEDIA_PRIMA_PROBE '+JSON.stringify(d))).catch(e=>console.log('MEDIA_PRIMA_PROBE_ERROR '+e.message));
  runDiagnostics().then(d=>console.log('STREAM_DIAG '+JSON.stringify(d))).catch(e=>console.log('STREAM_DIAG_ERROR '+e.message));
});
