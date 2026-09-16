const channels=require('./channels');
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
async function runDiagnostics(){const results=[];for(const c of channels){if(!c.source){results.push({id:c.id,status:'no-source'});continue}results.push({id:c.id,...await probeUrl(c.source.url,c.source.referer)})}return{at:new Date().toISOString(),results}}
module.exports={runDiagnostics,probeUrl};
