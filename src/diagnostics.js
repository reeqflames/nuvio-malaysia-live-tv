const channels=require('./channels');
const alternates=[
  {id:'tv3-proxy',url:'https://radiomy-tonton-proxy.api-danidev.workers.dev/tonton/live/6420323'},
  {id:'8tv-proxy',url:'https://radiomy-tonton-proxy.api-danidev.workers.dev/tonton/live/6420325'},
  {id:'tv9-proxy',url:'https://radiomy-tonton-proxy.api-danidev.workers.dev/tonton/live/6420326'},
  {id:'didik-proxy',url:'https://radiomy-tonton-proxy.api-danidev.workers.dev/tonton/live/6420324'},
  {id:'tvs-proxy',url:'https://api.dani-dev.co.za/v1/stream/mytv/live/tvs'},
  {id:'rtm-tv1-glue',url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv1/playlist.m3u8?id=1',referer:'https://rtm-player.glueapi.io/'},
  {id:'rtm-tv2-glue',url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv2/playlist.m3u8?id=2',referer:'https://rtm-player.glueapi.io/'},
  {id:'rtm-okey-glue',url:'https://d25tgymtnqzu8s.cloudfront.net/smil:okey/playlist.m3u8?id=3',referer:'https://rtm-player.glueapi.io/'},
  {id:'rtm-berita-glue',url:'https://d25tgymtnqzu8s.cloudfront.net/smil:berita/playlist.m3u8?id=5',referer:'https://rtm-player.glueapi.io/'},
  {id:'rtm-tv6-glue',url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv6/playlist.m3u8?id=6',referer:'https://rtm-player.glueapi.io/'}
];
function timeout(ms=9000){return AbortSignal.timeout(ms)}
function headersFor(ref){const h={'user-agent':'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36','accept':'*/*'};if(ref)h.referer=ref;return h}
function firstUri(text){return text.split(/\r?\n/).map(x=>x.trim()).find(x=>x&&!x.startsWith('#'))||null}
function resolve(base,child){try{return new URL(child,base).toString()}catch{return null}}
async function getText(url,referer){const t=Date.now();const r=await fetch(url,{headers:headersFor(referer),redirect:'follow',signal:timeout()});const text=await r.text();return{status:r.status,url:r.url,ctype:r.headers.get('content-type')||'',ms:Date.now()-t,text}}
async function probeHls(info,referer){let text=info.text,base=info.url;for(let level=0;level<2;level++){
  const uri=firstUri(text);if(!uri)break;const next=resolve(base,uri);if(!next)break;
  if(/#EXT-X-STREAM-INF/i.test(text)){const n=await getText(next,referer);if(n.status>=400)return{childStatus:n.status};text=n.text;base=n.url;continue}
  const t=Date.now();const r=await fetch(next,{headers:{...headersFor(referer),range:'bytes=0-65535'},redirect:'follow',signal:timeout()});try{await r.arrayBuffer()}catch{}return{segmentStatus:r.status,segmentMs:Date.now()-t,segmentHost:new URL(r.url).host};
}return{} }
async function probeUrl(url,referer){const out={url};try{const a=await getText(url,referer);out.status=a.status;out.ms=a.ms;out.ctype=a.ctype;out.finalHost=new URL(a.url).host;const text=a.text||'';out.kind=text.includes('#EXTM3U')?'hls':(/<MPD[\s>]/i.test(text)?'dash':'other');out.encrypted=/ContentProtection|cenc:|pssh|widevine|clearkey/i.test(text);const res=[...text.matchAll(/RESOLUTION=(\d+x\d+)/gi)].map(x=>x[1]);if(res.length)out.resolutions=[...new Set(res)].slice(-6);if(out.kind==='hls'&&a.status<400)Object.assign(out,await probeHls(a,referer));return out}catch(e){out.error=e.name+': '+e.message;return out}}
function safeCandidate(u){return !/[?&](?:token|auth_key|signature|sig|key)=/i.test(u)}
function extractUrls(text,base){const out=new Set();for(const m of text.matchAll(/(?:src|href)=["']([^"']+)["']/gi)){const u=resolve(base,m[1]);if(u&&safeCandidate(u))out.add(u)}for(const m of text.matchAll(/https?:\\?\/\\?\/[^\s"'<>]+/gi)){let u=m[0].replace(/\\\//g,'/').replace(/&amp;/g,'&');if(safeCandidate(u))out.add(u)}return [...out]}
function interestingLines(text){return text.split(/\r?\n/).map(x=>x.trim()).filter(x=>/(fetch\s*\(|ajax|endpoint|nonce|stream|source|playlist|m3u8|signed|proxy|wp-json|admin-ajax)/i.test(x)).filter(x=>!/[?&](?:token|auth_key|signature|sig|key)=/i.test(x)).slice(0,80)}
async function inspectTv3Live(){const page='https://tv3live.my/tv3/';const out={page};try{const a=await getText(page);out.status=a.status;out.ms=a.ms;out.finalUrl=a.url;const urls=extractUrls(a.text,a.url);out.mediaCandidates=urls.filter(u=>/\.m3u8(?:[?#]|$)|\.mpd(?:[?#]|$)|dailymotion|akamaized|cloudfront|player|video|stream/i.test(u)).slice(0,40);out.iframes=[...a.text.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m=>resolve(a.url,m[1])).filter(Boolean).filter(safeCandidate).slice(0,20);out.htmlHints=interestingLines(a.text).slice(0,40);const scripts=urls.filter(u=>/\.js(?:[?#]|$)/i.test(u)).slice(0,12);out.scripts=[];for(const s of scripts){try{const js=await getText(s,a.url);const hints=interestingLines(js.text);const media=extractUrls(js.text,js.url).filter(u=>/\.m3u8(?:[?#]|$)|\.mpd(?:[?#]|$)|dailymotion|akamaized|cloudfront|player|video|stream|wp-json|admin-ajax/i.test(u));if(hints.length||media.length)out.scripts.push({url:s,status:js.status,hints:hints.slice(0,40),media:[...new Set(media)].slice(0,30)})}catch(e){out.scripts.push({url:s,error:e.message})}}return out}catch(e){out.error=e.name+': '+e.message;return out}}
async function runDiagnostics(){const results=[];for(const c of channels){if(!c.source){results.push({id:c.id,status:'no-source'});continue}results.push({id:c.id,...await probeUrl(c.source.url,c.source.referer)})}const alt=[];for(const a of alternates)alt.push({id:a.id,...await probeUrl(a.url,a.referer)});return{at:new Date().toISOString(),results,alternates:alt}}
module.exports={runDiagnostics,probeUrl,inspectTv3Live};
