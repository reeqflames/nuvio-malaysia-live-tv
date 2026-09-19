const channels=require('./channels');

const SOURCES=[
  {name:'Astro',url:'https://iptv-org.github.io/epg/guides/ms/astro.com.my.xml'},
  {name:'RTM Klik',url:'https://iptv-org.github.io/epg/guides/ms/rtmklik.rtm.gov.my.xml'}
];
const TTL=6*60*60*1000;
let state={updatedAt:0,programmes:new Map(),sourceStatus:[],rawXml:'',refreshing:null};

const aliases={
  'tv3':['tv3'],
  'astro-ria':['astro ria'],
  'tv1':['tv1','rtm tv1'],
  'tv2':['tv2','rtm tv2'],
  'tv-okey':['tv okey','okey'],
  '8tv':['8tv'],
  'tv9':['tv9'],
  'astro-awani':['astro awani'],
  'bernama-tv':['bernama tv','bernama'],
  'berita-rtm':['berita rtm'],
  'sukan-plus':['sukan rtm','sukan+','sukan plus'],
  'didik-tv':['didiktv kpm','didik tv kpm','didiktv']
};

function unesc(s=''){return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")}
function textTag(block,tag){
  const m=block.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+tag+'>','i'));
  return m?unesc(m[1].replace(/<[^>]+>/g,'').trim()):'';
}
function parseTime(s){
  const m=String(s||'').match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{4})?/);
  if(!m)return NaN;
  const [,Y,M,D,h,mi,se='00',z='+0000']=m;
  const sign=z[0]==='-'?-1:1,off=(Number(z.slice(1,3))*60+Number(z.slice(3,5)))*sign;
  return Date.UTC(+Y,+M-1,+D,+h,+mi,+se)-off*60000;
}
function parseXml(xml){
  const names=new Map();
  for(const m of xml.matchAll(/<channel\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/channel>/gi)){
    const ds=[...m[2].matchAll(/<display-name(?:\s[^>]*)?>([\s\S]*?)<\/display-name>/gi)].map(x=>unesc(x[1].replace(/<[^>]+>/g,'').trim()).toLowerCase());
    names.set(m[1],ds);
  }
  const byId=new Map();
  for(const m of xml.matchAll(/<programme\s+([^>]*)>([\s\S]*?)<\/programme>/gi)){
    const a=m[1],id=(a.match(/channel="([^"]+)"/i)||[])[1],start=(a.match(/start="([^"]+)"/i)||[])[1],stop=(a.match(/stop="([^"]+)"/i)||[])[1];
    if(!id)continue;
    const p={channel:id,start:parseTime(start),stop:parseTime(stop),title:textTag(m[2],'title'),desc:textTag(m[2],'desc'),category:textTag(m[2],'category')};
    if(!Number.isFinite(p.start)||!Number.isFinite(p.stop)||!p.title)continue;
    if(!byId.has(id))byId.set(id,[]); byId.get(id).push(p);
  }
  return {names,byId};
}
function wanted(c,names){
  const list=(aliases[c.id]||[c.name]).map(x=>x.toLowerCase());
  for(const [xmlId,ds] of names)if(ds.some(d=>list.some(a=>d===a||d.replace(/\s+hd$/,'')===a)))return xmlId;
  return null;
}
async function fetchText(url){
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),15000);
  try{const r=await fetch(url,{headers:{'user-agent':'NuvioMalaysiaLiveTV/2.0'},signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.text()}finally{clearTimeout(t)}
}
async function refresh(force=false){
  if(!force&&Date.now()-state.updatedAt<TTL&&state.programmes.size)return state;
  if(state.refreshing)return state.refreshing;
  state.refreshing=(async()=>{
    const merged=new Map(),statuses=[],xmlParts=[];
    for(const s of SOURCES){
      try{
        const xml=await fetchText(s.url),parsed=parseXml(xml); let matched=0;
        for(const c of channels){
          if(merged.has(c.id))continue;
          const xid=wanted(c,parsed.names); if(!xid)continue;
          const ps=(parsed.byId.get(xid)||[]).sort((a,b)=>a.start-b.start);
          if(ps.length){merged.set(c.id,ps);matched++}
        }
        statuses.push({source:s.name,ok:true,matched}); xmlParts.push(xml);
      }catch(e){statuses.push({source:s.name,ok:false,error:e.message})}
    }
    if(merged.size){state={...state,updatedAt:Date.now(),programmes:merged,sourceStatus:statuses,rawXml:xmlParts[0]||state.rawXml}}
    else state.sourceStatus=statuses;
    return state;
  })().finally(()=>{state.refreshing=null});
  return state.refreshing;
}
function schedule(id,now=Date.now()){
  const ps=state.programmes.get(id)||[];
  const current=ps.find(p=>p.start<=now&&p.stop>now)||null;
  const upcoming=ps.filter(p=>p.start>now).slice(0,6);
  return {current,upcoming};
}
function snapshot(){
  const now=Date.now(),out={};
  for(const c of channels){const s=schedule(c.id,now);out[c.id]={...s,channel:c.name}}
  return {updatedAt:state.updatedAt,ageSeconds:state.updatedAt?Math.round((now-state.updatedAt)/1000):null,sources:state.sourceStatus,channels:out};
}
function status(){return {updatedAt:state.updatedAt,channelsMatched:state.programmes.size,sources:state.sourceStatus}}
module.exports={refresh,schedule,snapshot,status,SOURCES};
