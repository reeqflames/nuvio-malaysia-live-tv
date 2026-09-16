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
function cleanConfig(c){if(!c)return null;return{signedMode:!!c.useSignedMode,endpoint:c.signedEndpoint||null,provider:c.signedProvider||null,channel:c.signedChannel||null,quality:c.signedQuality||null,expirySeconds:c.signedExpirySeconds||null}}
function looksB64(s){return typeof s==='string'&&s.length>20&&/^[A-Za-z0-9+/=\s]+$/.test(s)}
function decodeBootstrap(text){let cur=String(text).trim();for(let i=0;i<5;i++){try{const j=JSON.parse(cur);if(j&&j.url){const u=new URL(j.url);return{ok:true,host:u.host,path:u.pathname,expiresAt:j.expires_at||null,expiresIn:j.expires_in||null,quality:j.quality||null}}}catch{}if(!looksB64(cur))break;try{cur=Buffer.from(cur,'base64').toString('utf8').trim()}catch{break}}return{ok:false,sample:cur.slice(0,120)}}
async function inspectPage(id,page){try{const r=await req(page);return{id,page,status:r.status,config:cleanConfig(pageConfig(r.text))}}catch(e){return{id,page,error:e.name+': '+e.message}}}
async function inspectRest(configs){const out={endpoint:BOOTSTRAP};try{const r=await req(BOOTSTRAP,{method:'OPTIONS',referer:PAGES.tv3});let body=null;try{body=JSON.parse(r.text)}catch{}out.options={status:r.status,allow:r.allow,methods:body?.methods||null,args:body?.endpoints?.[0]?.args||null}}catch(e){out.options={error:e.name+': '+e.message}}
  out.probes=[];
  for(const c of configs){const ch=c.config?.channel;if(!ch)continue;for(const mode of ['none','channel']){try{const u=mode==='channel'?`${BOOTSTRAP}?v=${encodeURIComponent(ch)}`:BOOTSTRAP;const r=await req(u,{referer:c.page});out.probes.push({pageId:c.id,channel:ch,mode,status:r.status,result:decodeBootstrap(r.text)})}catch(e){out.probes.push({pageId:c.id,channel:ch,mode,error:e.name+': '+e.message})}if(mode==='none'&&c.id!=='tv3')break;}
  }
  return out;
}
async function inspectMalaysiaTv(){const configs=[];for(const [id,page] of Object.entries(PAGES))configs.push(await inspectPage(id,page));return{at:new Date().toISOString(),configs,rest:await inspectRest(configs)}}
inspectMalaysiaTv().then(x=>console.log('MALAYSIA_TV_COMPACT '+JSON.stringify(x))).catch(e=>console.log('MALAYSIA_TV_COMPACT_ERROR '+e.message));
module.exports={inspectMalaysiaTv};
