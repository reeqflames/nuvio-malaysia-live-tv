const BOOTSTRAP='https://malaysia-tv.net/wp-json/media-hub/v1/bootstrap';
const ORIGIN='https://malaysia-tv.net';
const UA='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const cache=new Map();

function enc3(value){
  let s=JSON.stringify(value);
  for(let i=0;i<3;i++)s=Buffer.from(s,'utf8').toString('base64');
  return s;
}

function decodeResponse(text){
  let cur=String(text).trim();
  for(let i=0;i<7;i++){
    try{
      const j=JSON.parse(cur);
      if(typeof j==='string'){cur=j.trim();continue;}
      if(j&&j.url)return j;
      if(j&&j.error)throw new Error(j.error);
    }catch(e){
      if(e instanceof SyntaxError){} else throw e;
    }
    if(!/^[A-Za-z0-9+/=\s]+$/.test(cur))break;
    cur=Buffer.from(cur,'base64').toString('utf8').trim();
  }
  throw new Error('Invalid bootstrap response');
}

async function resolveMediaPrima(channel,page){
  const now=Math.floor(Date.now()/1000);
  const hit=cache.get(channel);
  if(hit&&hit.expiresAt-now>300)return hit;

  const payload={p:'tonton',c:channel,q:'main',e:'1800s'};
  const v=enc3(payload);
  const res=await fetch(`${BOOTSTRAP}?v=${encodeURIComponent(v)}`,{
    headers:{'user-agent':UA,'accept':'application/json,text/plain,*/*','referer':page,'origin':ORIGIN},
    redirect:'follow',signal:AbortSignal.timeout(10000)
  });
  if(!res.ok)throw new Error(`bootstrap HTTP ${res.status}`);
  const data=decodeResponse(await res.text());
  const u=new URL(data.url);
  if(!/^https:$/.test(u.protocol)||!u.pathname.includes('.m3u8'))throw new Error('bootstrap returned non-HLS URL');
  const expiresAt=Number(data.expires_at)||now+Math.min(Number(data.expires_in)||1800,1800);
  const item={url:data.url,expiresAt,quality:data.quality||'main',headers:{Referer:page,Origin:ORIGIN,'User-Agent':UA}};
  cache.set(channel,item);
  return item;
}

async function probeMediaPrima(items){
  const out=[];
  for(const item of items){
    try{
      const s=await resolveMediaPrima(item.channel,item.page);
      const u=new URL(s.url);
      const r=await fetch(s.url,{headers:s.headers,redirect:'follow',signal:AbortSignal.timeout(9000)});
      const text=await r.text();
      out.push({id:item.id,status:r.status,host:u.host,hls:text.includes('#EXTM3U'),bodyHint:text.slice(0,60).replace(/\s+/g,' '),expiresIn:Math.max(0,s.expiresAt-Math.floor(Date.now()/1000))});
    }catch(e){out.push({id:item.id,error:e.name+': '+e.message});}
  }
  return out;
}

module.exports={resolveMediaPrima,probeMediaPrima};
