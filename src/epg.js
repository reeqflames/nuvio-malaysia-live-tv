const channels=require('./channels');
const ASTRO='https://contenthub-api.eco.astro.com.my';
const TTL=6*60*60*1000;
let state={updatedAt:0,programmes:new Map(),sourceStatus:[],refreshing:null};

const aliases={
  'tv3':['tv3'],'astro-ria':['astro ria'],'tv1':['tv1'],'tv2':['tv2'],
  'tv-okey':['tv okey','okey'],'8tv':['8tv'],'tv9':['tv9'],
  'astro-awani':['astro awani'],'bernama-tv':['bernama tv','bernama'],
  'berita-rtm':['berita rtm'],'sukan-plus':['sukan rtm','sukan+','sukan plus'],
  'didik-tv':['didiktv kpm','didik tv kpm','didiktv']
};
const norm=s=>String(s||'').toLowerCase().replace(/\s+hd$/,'').replace(/[^a-z0-9+]+/g,' ').trim();
async function getJson(url){
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),15000);
  try{const r=await fetch(url,{headers:{'user-agent':'NuvioMalaysiaLiveTV/2.1','accept':'application/json'},signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}
}
function duration(s='00:00:00'){const m=s.match(/(\d{2}):(\d{2}):(\d{2})/);return m?(+m[1]*3600 + +m[2]*60 + +m[3])*1000:0}
function findAstroChannel(c,list){
  const wanted=(aliases[c.id]||[c.name]).map(norm);
  return list.find(x=>wanted.includes(norm(x.title)))||null;
}
function parseSchedule(data){
  const sched=data?.response?.schedule||{},out=[];
  for(const items of Object.values(sched))for(const x of (Array.isArray(items)?items:[])){
    const start=Date.parse(x.datetimeInUtc),stop=start+duration(x.duration);
    const title=x.title||x.programmeTitle||x.name;
    if(Number.isFinite(start)&&stop>start&&title){
      const image=x.image||x.imageUrl||x.imageURL||x.thumbnail||x.poster||x.landscapeImage||x.programmeImage||x.eventImage||null;
      out.push({start,stop,title,desc:x.synopsis||x.shortSynopsis||'',category:x.genre||'',image,channel:null});
    }
  }
  return out.sort((a,b)=>a.start-b.start);
}
async function refresh(force=false){
  if(!force&&Date.now()-state.updatedAt<TTL&&state.programmes.size)return state;
  if(state.refreshing)return state.refreshing;
  state.refreshing=(async()=>{
    const merged=new Map(),status={source:'Astro ContentHub',ok:false,matched:0};
    try{
      const all=await getJson(ASTRO+'/channel/all.json');
      const list=all?.response||[];
      for(const c of channels){
        const ac=findAstroChannel(c,list); if(!ac)continue;
        try{const data=await getJson(ASTRO+'/channel/'+encodeURIComponent(ac.id)+'.json');const ps=parseSchedule(data);if(ps.length){merged.set(c.id,ps);status.matched++}}catch{}
      }
      status.ok=status.matched>0;
      if(!status.ok)status.error='No channel schedules matched';
    }catch(e){status.error=e.message}
    if(merged.size)state={...state,updatedAt:Date.now(),programmes:merged,sourceStatus:[status]};
    else state.sourceStatus=[status];
    return state;
  })().finally(()=>{state.refreshing=null});
  return state.refreshing;
}
function schedule(id,now=Date.now()){
  const ps=state.programmes.get(id)||[];
  return {current:ps.find(p=>p.start<=now&&p.stop>now)||null,upcoming:ps.filter(p=>p.start>now).slice(0,6)};
}
function snapshot(){
  const now=Date.now(),out={};
  for(const c of channels)out[c.id]={channel:c.name,...schedule(c.id,now)};
  return {updatedAt:state.updatedAt,ageSeconds:state.updatedAt?Math.round((now-state.updatedAt)/1000):null,sources:state.sourceStatus,channels:out};
}
function status(){return {updatedAt:state.updatedAt,channelsMatched:state.programmes.size,sources:state.sourceStatus}}
module.exports={refresh,schedule,snapshot,status};
