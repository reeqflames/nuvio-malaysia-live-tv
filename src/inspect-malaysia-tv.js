const PAGES={
  tv3:'https://malaysia-tv.net/tv3-live/',
  '8tv':'https://malaysia-tv.net/8-tv/',
  tv9:'https://malaysia-tv.net/tv9-malaysia/',
  'didik-tv':'https://malaysia-tv.net/didik-tv-live/'
};
const BOOTSTRAP='https://malaysia-tv.net/wp-json/media-hub/v1/bootstrap';
const UA='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
function timeout(ms=12000){return AbortSignal.timeout(ms)}
async function req(url,{method='GET',referer}={}){const r=await fetch(url,{method,headers:{'user-agent':UA,'accept':'application/json,text/plain,text/html,*/*',...(referer?{referer}: {})},redirect:'follow',signal:timeout()});return{status:r.status,type:r.headers.get('content-type')||'',allow:r.headers.get('allow')||'',text:await r.text()}}
function htmlDecode(s){return String(s).replace(/&quot;|&#34;/g,'"').replace(/&amp;|&#38;/g,'&').replace(/&#x2F;|&#47;/gi,'/').replace(/&lt;/g,'<').replace(/&gt;/g,'>')}
function pageConfig(html){const m=html.match(/data-tv3p-config=["']([^"']+)["']/i);if(!m)return null;try{return JSON.parse(htmlDecode(m[1]))}catch{return null}}
function cleanConfig(c){if(!c)return null;return{provider:c.signedProvider||null,channel:c.signedChannel||null,quality:c.signedQuality||null,expirySpec:c.signedExpirySpec||null,expirySeconds:c.signedExpirySeconds||null}}
function looksB64(s){return typeof s==='string'&&s.length>8&&/^[A-Za-z0-9+/=\s]+$/.test(s)}
function decodeBootstrap(text){let cur=String(text).trim();for(let i=0;i<7;i++){try{const j=JSON.parse(cur);if(typeof j==='string'){cur=j.trim();continue}if(j&&j.url){const u=new URL(j.url);return{ok:true,host:u.host,path:u.pathname,expiresAt:j.expires_at||null,expiresIn:j.expires_in||null,quality:j.quality||null}}if(j&&j.error)return{ok:false,error:j.error}}catch{}if(!looksB64(cur))break;try{cur=Buffer.from(cur,'base64').toString('utf8').trim()}catch{break}}return{ok:false,sample:cur.slice(0,100)}}
function enc3(value){let s=typeof value==='string'?value:JSON.stringify(value);for(let i=0;i<3;i++)s=Buffer.from(s,'utf8').toString('base64');return s}
async function inspectPage(id,page){try{const r=await req(page);return{id,page,status:r.status,config:cleanConfig(pageConfig(r.text))}}catch(e){return{id,page,error:e.name+': '+e.message}}}
async function probePayloads(cfg){const p=cfg.provider,c=cfg.channel,q=cfg.quality,e=cfg.expirySpec,es=cfg.expirySeconds;const candidates=[
  ['full-spec',{provider:p,channel:c,quality:q,expiry:e}],
  ['full-seconds',{provider:p,channel:c,quality:q,expiry:es}],
  ['expires-spec',{provider:p,channel:c,quality:q,expires:e}],
  ['expiry-seconds',{provider:p,channel:c,quality:q,expiry_seconds:es}],
  ['signed-names',{signedProvider:p,signedChannel:c,signedQuality:q,signedExpirySpec:e}],
  ['short',{p,c,q,e}],
  ['no-expiry',{provider:p,channel:c,quality:q}],
  ['array',[p,c,q,e]],
  ['pipe',`${p}|${c}|${q}|${e}`]
];const out=[];for(const [name,payload] of candidates){try{const v=enc3(payload);const r=await req(`${BOOTSTRAP}?v=${encodeURIComponent(v)}`,{referer:PAGES.tv3});out.push({name,status:r.status,result:decodeBootstrap(r.text)})}catch(err){out.push({name,error:err.name+': '+err.message})}}return out}
async function inspectMalaysiaTv(){const configs=[];for(const [id,page] of Object.entries(PAGES))configs.push(await inspectPage(id,page));let options=null;try{const r=await req(BOOTSTRAP,{method:'OPTIONS',referer:PAGES.tv3});let b=null;try{b=JSON.parse(r.text)}catch{}options={status:r.status,allow:r.allow,methods:b?.methods||null,args:b?.endpoints?.[0]?.args||null}}catch(e){options={error:e.name+': '+e.message}}const tv3=configs.find(x=>x.id==='tv3')?.config;const probes=tv3?await probePayloads(tv3):[];return{at:new Date().toISOString(),configs,options,probes}}
inspectMalaysiaTv().then(x=>console.log('MALAYSIA_TV_PAYLOAD '+JSON.stringify(x))).catch(e=>console.log('MALAYSIA_TV_PAYLOAD_ERROR '+e.message));
module.exports={inspectMalaysiaTv};
