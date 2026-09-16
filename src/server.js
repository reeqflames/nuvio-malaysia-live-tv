const http=require('node:http');
const channels=require('./channels');
const {runDiagnostics}=require('./diagnostics');
const PORT=Number(process.env.PORT||3000);
const PUBLIC_BASE=process.env.PUBLIC_URL||'https://nuvio-malaysia-live-tv.onrender.com';
const groups=['General','News','Sports','Kids'];
const manifest={
  id:'my.reeqflames.nuvio.malaysia.live',
  version:'1.8.0',
  name:'Malaysia Live TV',
  description:'Malaysian live TV, curated for clean and reliable playback.',
  resources:['catalog','meta','stream'],
  types:['tv'],
  catalogs:[
    {type:'tv',id:'malaysia-live',name:'Live TV'},
    ...groups.map(g=>({type:'tv',id:`malaysia-${g.toLowerCase()}`,name:g}))
  ],
  idPrefixes:['mytv:'],
  behaviorHints:{configurable:false,p2pNotSupported:true}
};
const logo=c=>c.logo||`${PUBLIC_BASE}/logo/${encodeURIComponent(c.id)}.svg`;
function configured(c){return streamsFor(c).length>0}
function meta(c){return{
  id:`mytv:${c.id}`,
  type:'tv',
  name:c.name,
  poster:logo(c),
  posterShape:'square',
  description:`${c.provider} • ${c.group}`,
  genres:[c.group,'Malaysia','Live TV']
};}
function json(res,status,body,age=60){res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'GET,HEAD,OPTIONS','access-control-allow-headers':'*','cache-control':`public,max-age=${age}`});if(res.req?.method==='HEAD')return res.end();res.end(JSON.stringify(body));}
function esc(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function svg(res,id){const c=channels.find(x=>x.id===id);if(!c){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':'image/svg+xml','access-control-allow-origin':'*','cache-control':'public,max-age=86400'});if(res.req?.method==='HEAD')return res.end();res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="96" fill="white"/><text x="256" y="284" text-anchor="middle" font-family="Arial" font-size="64" font-weight="700" fill="#111">${esc(c.name)}</text></svg>`);}
function oneStream(c,s,i){const isBackup=i>0||String(s.label||'').toLowerCase().includes('backup');const o={
  name:'Malaysia Live TV',
  title:`${c.name} • ${s.quality||'HD'}${isBackup?' • Backup':''}`,
  url:s.url,
  behaviorHints:{notWebReady:false}
};
  const h=s.headers||(s.referer?{Referer:s.referer}:null);
  if(h)o.behaviorHints.proxyHeaders={request:h};
  return o;
}
function streamsFor(c){const list=(c.sources&&c.sources.length?c.sources:(c.source?[c.source]:[]));return list.map((s,i)=>oneStream(c,s,i));}
function normalizePath(path){let p=path;try{p=decodeURIComponent(p)}catch{}while(p.startsWith('/manifest.json/'))p=p.slice('/manifest.json'.length);return p||'/';}
function home(res){
  const live=channels.filter(configured);
  const pending=channels.filter(c=>!configured(c));
  const cards=channels.map(c=>`<article class="card ${configured(c)?'':'off'}"><div class="logo"><img src="${logo(c)}" alt=""></div><div class="info"><b>${esc(c.name)}</b><small>${esc(c.provider)} • ${esc(c.group)}</small></div><span>${configured(c)?'LIVE':'PENDING'}</span></article>`).join('');
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','access-control-allow-origin':'*'});
  res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Malaysia Live TV</title><style>*{box-sizing:border-box}body{margin:0;background:#07090e;color:#f7f8fb;font:15px/1.45 Inter,system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:920px;margin:auto;padding:34px 18px 60px}.hero{padding:10px 2px 24px}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8c96a8;font-weight:700}.hero h1{font-size:32px;margin:7px 0 6px}.hero p{margin:0;color:#9ca6b8}.stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.pill{padding:7px 10px;border:1px solid #202735;background:#10151d;border-radius:999px;color:#b9c2d0;font-size:12px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:10px}.card{display:flex;align-items:center;gap:12px;background:#0f141c;border:1px solid #1d2632;padding:12px;border-radius:16px;min-height:76px}.card.off{opacity:.48}.logo{width:52px;height:52px;border-radius:12px;background:#fff;display:grid;place-items:center;overflow:hidden;flex:0 0 auto}.logo img{width:100%;height:100%;object-fit:contain}.info{min-width:0;display:flex;flex-direction:column;gap:3px}.info b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.info small{color:#8f9aaa}.card span{margin-left:auto;font-size:10px;letter-spacing:.08em;font-weight:800;color:#6ee7a8}.card.off span{color:#7f8997}.manifest{margin-top:24px;padding:14px;border:1px solid #1d2632;background:#0d1219;border-radius:14px}.manifest small{display:block;color:#7f8997;margin-bottom:5px}.manifest code{font-size:12px;color:#b7f5cd;word-break:break-all}</style></head><body><main><section class="hero"><div class="eyebrow">Nuvio Addon</div><h1>Malaysia Live TV</h1><p>Clean, HD-first Malaysian live channels.</p><div class="stats"><div class="pill">${live.length} live sources</div><div class="pill">${pending.length} pending</div><div class="pill">v${manifest.version}</div></div></section><section class="grid">${cards}</section><div class="manifest"><small>Manifest</small><code>${PUBLIC_BASE}/manifest.json</code></div></main></body></html>`);
}
const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,PUBLIC_BASE);const p=normalizePath(u.pathname);
  res.on('finish',()=>console.log(`${req.method} ${u.pathname}${u.search||''} -> ${p} [${res.statusCode}]`));
  if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,HEAD,OPTIONS','access-control-allow-headers':'*'});return res.end();}
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'method not allowed'},0);
  if(p==='/')return home(res);
  if(p==='/health')return json(res,200,{ok:true,version:manifest.version,channels:channels.length,playable:channels.filter(configured).length,pending:channels.filter(c=>!configured(c)).map(c=>c.name)},0);
  if(p==='/diag')return json(res,200,await runDiagnostics(),0);
  if(p==='/manifest.json')return json(res,200,manifest,0);
  let m=p.match(/^\/logo\/([^/]+)\.svg$/);if(m)return svg(res,decodeURIComponent(m[1]));
  m=p.match(/^\/catalog\/tv\/([^/]+?)(?:\/[^/]+)?\.json$/);
  if(m){const id=decodeURIComponent(m[1]);let list=channels.filter(configured);if(id!=='malaysia-live')list=list.filter(c=>c.group.toLowerCase()===id.replace(/^malaysia-/,''));return json(res,200,{metas:list.map(meta)},10);}
  m=p.match(/^\/meta\/tv\/mytv:([^/]+)\.json$/);
  if(m){const c=channels.find(x=>x.id===decodeURIComponent(m[1]));return c?json(res,200,{meta:meta(c)},10):json(res,404,{error:'not found'},0);}
  m=p.match(/^\/stream\/tv\/mytv:([^/]+)\.json$/);
  if(m){const c=channels.find(x=>x.id===decodeURIComponent(m[1]));if(!c)return json(res,404,{error:'not found'},0);return json(res,200,{streams:streamsFor(c)},5);}
  return json(res,404,{error:'not found',path:p},0);
});
server.listen(PORT,'0.0.0.0',()=>{console.log(`Malaysia Live TV ${manifest.version} clean UI`);runDiagnostics().then(d=>console.log('STREAM_DIAG '+JSON.stringify(d))).catch(e=>console.log('STREAM_DIAG_ERROR '+e.message));});
