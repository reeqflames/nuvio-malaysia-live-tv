const http = require('node:http');
const channels = require('./channels');

const PORT = Number(process.env.PORT || 3000);
const BASE = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const manifest = {
  id: 'my.reeqflames.nuvio.malaysia.live',
  version: '1.0.0',
  name: 'Malaysia Live TV',
  description: 'Malaysian live TV directory for Nuvio. Direct playback is exposed only when an authorized stream URL is configured.',
  resources: ['catalog', 'meta', 'stream'],
  types: ['tv'],
  catalogs: [
    { type: 'tv', id: 'malaysia-live', name: 'Malaysia Live TV' },
    ...['RTM','Media Prima','News','Sports','Kids'].map(group => ({ type:'tv', id:`malaysia-${group.toLowerCase().replace(/\s+/g,'-')}`, name:group }))
  ],
  idPrefixes: ['mytv:'],
  behaviorHints: { configurable: false }
};

function meta(c) {
  return {
    id: `mytv:${c.id}`,
    type: 'tv',
    name: c.name,
    poster: c.logo,
    posterShape: 'square',
    description: `${c.group} • Malaysia Live TV`,
    genres: [c.group, 'Malaysia', 'Live TV'],
    links: c.officialPage ? [{ name: 'Official', category: 'official', url: c.officialPage }] : []
  };
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type':'application/json; charset=utf-8', 'access-control-allow-origin':'*', 'cache-control':'public, max-age=300' });
  res.end(JSON.stringify(body));
}

function html(res) {
  const rows = channels.map(c => `<article><div class="logo">${c.name.slice(0,3)}</div><div><b>${c.name}</b><small>${c.group}</small></div><span>LIVE</span></article>`).join('');
  res.writeHead(200, {'content-type':'text/html; charset=utf-8'});
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Malaysia Live TV</title><style>body{margin:0;background:#080b12;color:#fff;font:15px system-ui}main{max-width:980px;margin:auto;padding:42px 20px}h1{font-size:34px;margin:0}p{color:#9ba4b5}.tabs{display:flex;gap:10px;margin:28px 0}.tabs b{background:#1c2330;padding:10px 18px;border-radius:99px}.tabs b:first-child{background:#e21b2d}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}article{background:#111722;border:1px solid #202938;border-radius:16px;padding:18px;display:flex;align-items:center;gap:14px}.logo{width:48px;height:48px;border-radius:12px;background:#222b39;display:grid;place-items:center;font-weight:800}small{display:block;color:#8994a6;margin-top:4px}article span{margin-left:auto;color:#ff5361;font-size:11px;font-weight:800}code{color:#9ee6b8}</style><main><h1>Malaysia Live TV</h1><p>Nuvio addon • Live channels + EPG-ready architecture</p><div class="tabs"><b>LIVE</b><b>TV GUIDE</b><b>CHANNELS</b></div><div class="grid">${rows}</div><p>Manifest: <code>${BASE}/manifest.json</code></p></main>`);
}

const server = http.createServer((req,res) => {
  const u = new URL(req.url, BASE);
  if (u.pathname === '/') return html(res);
  if (u.pathname === '/health') return json(res,200,{ok:true,channels:channels.length});
  if (u.pathname === '/manifest.json') return json(res,200,manifest);

  let m = u.pathname.match(/^\/catalog\/tv\/([^/]+)\.json$/);
  if (m) {
    const id = decodeURIComponent(m[1]);
    let list = channels;
    if (id !== 'malaysia-live') {
      const slug = id.replace(/^malaysia-/,'');
      list = channels.filter(c => c.group.toLowerCase().replace(/\s+/g,'-') === slug);
    }
    return json(res,200,{metas:list.map(meta)});
  }

  m = u.pathname.match(/^\/meta\/tv\/mytv:([^/]+)\.json$/);
  if (m) {
    const c = channels.find(x => x.id === decodeURIComponent(m[1]));
    return c ? json(res,200,{meta:meta(c)}) : json(res,404,{error:'Channel not found'});
  }

  m = u.pathname.match(/^\/stream\/tv\/mytv:([^/]+)\.json$/);
  if (m) {
    const c = channels.find(x => x.id === decodeURIComponent(m[1]));
    if (!c) return json(res,404,{error:'Channel not found'});
    const envKey = `STREAM_${c.id.toUpperCase().replace(/-/g,'_')}`;
    const url = process.env[envKey];
    return json(res,200,{streams:url ? [{title:`${c.name} • Official/authorized live`,url,behaviorHints:{notWebReady:false}}] : []});
  }
  return json(res,404,{error:'Not found'});
});

server.listen(PORT,'0.0.0.0',()=>console.log(`Malaysia Live TV running on ${PORT}`));
