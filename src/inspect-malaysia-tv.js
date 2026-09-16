const PAGES={
  tv3:'https://malaysia-tv.net/tv3-live/',
  '8tv':'https://malaysia-tv.net/8-tv/',
  tv9:'https://malaysia-tv.net/tv9-malaysia/',
  'didik-tv':'https://malaysia-tv.net/didik-tv-live/'
};
const UA='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
function timeout(ms=12000){return AbortSignal.timeout(ms)}
function abs(base,u){try{return new URL(String(u).replace(/&amp;/g,'&'),base).toString()}catch{return null}}
function safe(u){return u && !/[?&](?:token|auth_key|signature|sig|key|license)=/i.test(u)}
async function get(url,referer){const r=await fetch(url,{headers:{'user-agent':UA,'accept':'text/html,application/xhtml+xml,*/*',...(referer?{referer}: {})},redirect:'follow',signal:timeout()});return{status:r.status,url:r.url,type:r.headers.get('content-type')||'',text:await r.text()}}
function extract(html,base){
  const urls=new Set();
  for(const m of html.matchAll(/(?:src|href|file|source|url)\s*[:=]\s*["']([^"']+)["']/gi)){const u=abs(base,m[1]);if(safe(u))urls.add(u)}
  for(const m of html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+/gi)){const u=m[0].replace(/\\\//g,'/');if(safe(u))urls.add(u)}
  return [...urls];
}
function mediaOnly(urls){return [...new Set(urls.filter(u=>/\.m3u8(?:[?#]|$)|\.mpd(?:[?#]|$)|akamaized|fastly|cloudfront|dailymotion|stream|player|embed/i.test(u)))].slice(0,60)}
async function inspectPage(id,page){
  const out={id,page};
  try{
    const p=await get(page);out.status=p.status;out.finalUrl=p.url;
    const urls=extract(p.text,p.url);
    out.media=mediaOnly(urls);
    out.iframes=[...p.text.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m=>abs(p.url,m[1])).filter(safe).slice(0,20);
    const scripts=urls.filter(u=>/\.js(?:[?#]|$)/i.test(u)).slice(0,16);
    out.scripts=[];
    for(const s of scripts){
      try{const j=await get(s,p.url);const m=mediaOnly(extract(j.text,j.url));if(m.length)out.scripts.push({url:s,status:j.status,media:m})}catch(e){}
    }
    for(const iframe of out.iframes.slice(0,8)){
      try{const f=await get(iframe,p.url);const m=mediaOnly(extract(f.text,f.url));if(m.length)out.scripts.push({url:iframe,status:f.status,media:m})}catch(e){}
    }
  }catch(e){out.error=e.name+': '+e.message}
  return out;
}
async function inspectMalaysiaTv(){const results=[];for(const [id,page] of Object.entries(PAGES))results.push(await inspectPage(id,page));return{at:new Date().toISOString(),results}}
module.exports={inspectMalaysiaTv};
