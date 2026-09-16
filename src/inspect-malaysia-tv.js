const PAGES={
  tv3:'https://malaysia-tv.net/tv3-live/',
  '8tv':'https://malaysia-tv.net/8-tv/',
  tv9:'https://malaysia-tv.net/tv9-malaysia/',
  'didik-tv':'https://malaysia-tv.net/didik-tv-live/'
};
const BOOTSTRAP='https://malaysia-tv.net/wp-json/media-hub/v1/bootstrap';
const UA='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
function timeout(ms=12000){return AbortSignal.timeout(ms)}
function abs(base,u){try{return new URL(String(u).replace(/&amp;/g,'&'),base).toString()}catch{return null}}
function safe(u){return u && !/[?&](?:token|auth_key|signature|sig|key|license)=/i.test(u)}
async function req(url,{method='GET',referer,body,headers={}}={}){const r=await fetch(url,{method,headers:{'user-agent':UA,'accept':'application/json,text/html,*/*',...(referer?{referer}: {}),...headers},body,redirect:'follow',signal:timeout()});return{status:r.status,url:r.url,type:r.headers.get('content-type')||'',allow:r.headers.get('allow')||'',text:await r.text()}}
async function get(url,referer){return req(url,{referer})}
function extract(html,base){
  const urls=new Set();
  for(const m of html.matchAll(/(?:src|href|file|source|url)\s*[:=]\s*["']([^"']+)["']/gi)){const u=abs(base,m[1]);if(safe(u))urls.add(u)}
  for(const m of html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+/gi)){const u=m[0].replace(/\\\//g,'/');if(safe(u))urls.add(u)}
  return [...urls];
}
function mediaOnly(urls){return [...new Set(urls.filter(u=>/\.m3u8(?:[?#]|$)|\.mpd(?:[?#]|$)|akamaized|fastly|cloudfront|dailymotion|stream|player|embed/i.test(u)))].slice(0,60)}
function hints(text){return text.split(/\r?\n/).map(x=>x.trim()).filter(x=>/(stream-proxy|player-init|bootstrap|wp-json|admin-ajax|endpoint|provider|channel|signed|nonce|data-|m3u8|videojs|video\.js|fetch\s*\()/i.test(x)).filter(x=>!/[?&](?:token|auth_key|signature|sig|key|license)=/i.test(x)).slice(0,80)}
async function inspectPage(id,page){
  const out={id,page};
  try{
    const p=await get(page);out.status=p.status;out.finalUrl=p.url;
    const urls=extract(p.text,p.url);
    out.pageHints=hints(p.text);
    out.media=mediaOnly(urls);
    out.iframes=[...p.text.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m=>abs(p.url,m[1])).filter(safe).slice(0,20);
    const scripts=urls.filter(u=>/\.js(?:[?#]|$)/i.test(u));
    const priority=[...new Set([...scripts.filter(u=>/stream-proxy|player-init/i.test(u)),...scripts])].slice(0,20);
    out.scripts=[];
    for(const s of priority){
      try{const j=await get(s,p.url);const m=mediaOnly(extract(j.text,j.url));const h=hints(j.text);if(m.length||h.length)out.scripts.push({url:s,status:j.status,hints:h,media:m})}catch(e){}
    }
  }catch(e){out.error=e.name+': '+e.message}
  return out;
}
function safeJson(text){try{const x=JSON.parse(text);if(x&&typeof x==='object'){if(x.url)x.url='[redacted-url]';if(x.src)x.src='[redacted-url]';if(x.stream)x.stream='[redacted-url]';}return x}catch{return text.slice(0,2000)}}
async function inspectRest(){const out={endpoint:BOOTSTRAP};for(const method of ['OPTIONS','GET']){try{const r=await req(BOOTSTRAP,{method,referer:PAGES.tv3});out[method.toLowerCase()]={status:r.status,type:r.type,allow:r.allow,body:safeJson(r.text)}}catch(e){out[method.toLowerCase()]={error:e.name+': '+e.message}}}return out}
async function inspectMalaysiaTv(){const results=[];for(const [id,page] of Object.entries(PAGES))results.push(await inspectPage(id,page));return{at:new Date().toISOString(),rest:await inspectRest(),results}}
inspectMalaysiaTv().then(x=>console.log('MALAYSIA_TV_INSPECT '+JSON.stringify(x))).catch(e=>console.log('MALAYSIA_TV_INSPECT_ERROR '+e.message));
module.exports={inspectMalaysiaTv};
