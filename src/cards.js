const sharp=require('sharp');

const UA='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const cache=new Map();

const THEMES={
  'tv3':['#0756d8','#ffd21e','#ed2638'],
  'astro-ria':['#7f22b7','#e62fb5','#ff7ac8'],
  'tv1':['#0879e8','#1749c8','#ef2b32'],
  'tv2':['#ff7a00','#f0441d','#ffc52f'],
  'tv-okey':['#1677ff','#f6b817','#ee3a9d'],
  '8tv':['#ee2b9a','#8d36c8','#ff69b4'],
  'tv9':['#96d700','#55ad12','#d6ff40'],
  'astro-awani':['#dc271b','#ff7a16','#f4b52d'],
  'bernama-tv':['#d71f2b','#17418f','#ffffff'],
  'berita-rtm':['#dd222f','#1760b7','#ffffff'],
  'tv-alhijrah':['#00a3a3','#c9a44a','#f3d88b'],
  'tvs':['#de2028','#1b65ba','#ffffff'],
  'sukan-plus':['#13a8ff','#0fd18f','#d8ff35'],
  'didik-tv':['#00a9d8','#ff8a23','#7f4bd9'],
  'tv6':['#6942c8','#ef4c8f','#ffb03a']
};

function esc(s){return String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function theme(c){return THEMES[c.id]||['#1e6cff','#7a42ff','#f33c78'];}

function backgroundSvg(c){
  const [a,b,d]=theme(c);
  const provider=esc(c.provider||'Malaysia');
  const group=esc(c.group||'Live TV');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 960 540">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07101c"/><stop offset=".55" stop-color="#09111c"/><stop offset="1" stop-color="#03060b"/></linearGradient>
      <radialGradient id="g1" cx="78%" cy="18%" r="75%"><stop stop-color="${a}" stop-opacity=".55"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
      <radialGradient id="g2" cx="18%" cy="88%" r="80%"><stop stop-color="${b}" stop-opacity=".34"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>
      <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></linearGradient>
    </defs>
    <rect width="960" height="540" fill="url(#bg)"/>
    <rect width="960" height="540" fill="url(#g1)"/>
    <rect width="960" height="540" fill="url(#g2)"/>
    <path d="M-90 478 C220 330 430 520 770 410 C860 380 920 315 1020 235" fill="none" stroke="url(#arc)" stroke-width="82" stroke-linecap="round" opacity=".18"/>
    <path d="M520 -80 C680 70 790 80 1050 20" fill="none" stroke="${d}" stroke-width="68" stroke-linecap="round" opacity=".16"/>
    <circle cx="820" cy="270" r="94" fill="#ffffff" fill-opacity=".035" stroke="#ffffff" stroke-opacity=".11" stroke-width="2"/>
    <circle cx="820" cy="270" r="70" fill="#ffffff" fill-opacity=".025" stroke="${a}" stroke-opacity=".35" stroke-width="3"/>
    <path d="M800 232 L800 308 L856 270 Z" fill="#ffffff" fill-opacity=".82"/>
    <text x="70" y="440" font-family="Arial, sans-serif" font-size="24" font-weight="600" letter-spacing="2.2" fill="#d7deea">${provider}</text>
    <text x="70" y="474" font-family="Arial, sans-serif" font-size="17" font-weight="500" letter-spacing="1.5" fill="#8190a4">${group} • Malaysia</text>
  </svg>`);
}

function fallbackLogoSvg(c){
  const [a,b]=theme(c);
  const name=esc(c.name);
  const size=name.length>10?58:name.length>7?68:84;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="230">
    <defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <text x="8" y="145" font-family="Arial, sans-serif" font-size="${size}" font-weight="800" fill="url(#t)">${name}</text>
  </svg>`);
}

async function fetchLogo(url){
  const r=await fetch(url,{headers:{'user-agent':UA,'accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'},redirect:'follow',signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw new Error(`logo HTTP ${r.status}`);
  const buf=Buffer.from(await r.arrayBuffer());
  if(buf.length<64||buf.length>3_000_000)throw new Error('logo size rejected');
  return buf;
}

async function renderChannelCard(c){
  const key=c.id;
  const hit=cache.get(key);
  if(hit)return hit;

  let logoBuffer=null;
  if(c.logo){
    try{
      const raw=await fetchLogo(c.logo);
      logoBuffer=await sharp(raw).resize({width:510,height:245,fit:'inside',withoutEnlargement:false}).png().toBuffer();
    }catch(e){
      console.log(`CARD_LOGO_FALLBACK ${c.id} ${e.message}`);
    }
  }

  const overlays=[];
  if(logoBuffer){
    const info=await sharp(logoBuffer).metadata();
    overlays.push({input:logoBuffer,left:72,top:Math.max(92,Math.round(240-(info.height||180)/2))});
  }else{
    overlays.push({input:fallbackLogoSvg(c),left:62,top:118});
  }

  const out=await sharp(backgroundSvg(c))
    .composite(overlays)
    .resize(1920,1080,{fit:'fill'}).webp({quality:92,effort:4})
    .toBuffer();
  cache.set(key,out);
  return out;
}

module.exports={renderChannelCard};
