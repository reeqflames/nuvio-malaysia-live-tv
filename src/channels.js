// LOCKED curated order. Public/unprotected sources only; prefer official/public feeds.
const UA='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const rtmHeaders=(page)=>({Referer:page,Origin:'https://rtmklik.rtm.gov.my','User-Agent':UA});
const TONTON_HEADERS={Referer:'https://live-xtra-sg1.global.ssl.fastly.net/','User-Agent':UA};
const RTM_PAGES={
  tv1:'https://rtmklik.rtm.gov.my/live/tv/tv1',
  tv2:'https://rtmklik.rtm.gov.my/live/tv/tv2',
  okey:'https://rtmklik.rtm.gov.my/live/tv/okey',
  berita:'https://rtmklik.rtm.gov.my/live/tv/beritartm',
  sukan:'https://rtmklik.rtm.gov.my/live/tv/sukanrtm',
  tv6:'https://rtmklik.rtm.gov.my/live/tv/tv6'
};
const channels = [
  { rank:1,id:'tv3',name:'TV3',group:'General',provider:'Media Prima',epg:'103',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/103_300.png',officialPage:'https://www.tonton.com.my/' },
  { rank:2,id:'astro-ria',name:'Astro Ria',group:'General',provider:'Astro',epg:'104',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/104_300.png',officialPage:'https://www.astro.com.my/content/channels/Astro-Ria-193' },
  { rank:3,id:'tv1',name:'TV1',group:'General',provider:'RTM',epg:'101',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/101_300.png',officialPage:RTM_PAGES.tv1,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv1/playlist.m3u8?id=1',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.tv1)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv1/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.tv1)}
  ]},
  { rank:4,id:'tv2',name:'TV2',group:'General',provider:'RTM',epg:'102',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/102_300.png',officialPage:RTM_PAGES.tv2,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv2/playlist.m3u8?id=2',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.tv2)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv2/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.tv2)}
  ]},
  { rank:5,id:'tv-okey',name:'TV Okey',group:'General',provider:'RTM',epg:'146',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/146_300.png',officialPage:RTM_PAGES.okey,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:okey/playlist.m3u8?id=3',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.okey)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:okey/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.okey)}
  ]},
  { rank:6,id:'8tv',name:'8TV',group:'General',provider:'Media Prima',epg:'148',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/148_300.png',officialPage:'https://www.tonton.com.my/',sources:[
    {url:'https://tonton-live-ssai.akamaized.net/live/a884c33b-6b11-4433-8bf9-a8899939e224/cmaf.isml/.m3u8',quality:'HD',label:'Primary',headers:TONTON_HEADERS},
    {url:'https://raw.githubusercontent.com/samleong123/tonton_dailymotion_php/main/m3u8/8TV.m3u8',quality:'HD',label:'Backup',headers:{Referer:'https://www.dailymotion.com/','User-Agent':UA}}
  ]},
  { rank:7,id:'tv9',name:'TV9',group:'General',provider:'Media Prima',epg:'149',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/149_300.png',officialPage:'https://www.tonton.com.my/',sources:[
    {url:'https://tonton-live-ssai.akamaized.net/live/2020783a-0303-401a-9c92-b7c3c9108c0b/cmaf.isml/.m3u8',quality:'HD',label:'Primary',headers:TONTON_HEADERS},
    {url:'https://raw.githubusercontent.com/samleong123/tonton_dailymotion_php/main/m3u8/TV9.m3u8',quality:'HD',label:'Backup',headers:{Referer:'https://www.dailymotion.com/','User-Agent':UA}}
  ]},
  { rank:8,id:'astro-awani',name:'Astro Awani',group:'News',provider:'Astro',epg:'501',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/501_300.png',officialPage:'https://www.astroawani.com/',sources:[
    {url:'https://d2idp3hzkhjpih.cloudfront.net/out/v1/4b85d9c2bf97413eb0c9fd875599b837/index.m3u8',quality:'720p',label:'Primary'}
  ]},
  { rank:9,id:'bernama-tv',name:'Bernama TV',group:'News',provider:'Bernama',epg:'502',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/502_300.png',officialPage:'https://www.bernama.com/' },
  { rank:10,id:'berita-rtm',name:'Berita RTM',group:'News',provider:'RTM',epg:'505',officialPage:RTM_PAGES.berita,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:berita/playlist.m3u8?id=5',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.berita)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:berita/manifest.mpd',quality:'HD',label:'Backup',headers:rtmHeaders(RTM_PAGES.berita)}
  ]},
  { rank:11,id:'tv-alhijrah',name:'TV AlHijrah',group:'General',provider:'TV AlHijrah',epg:'114',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/114_300.png',officialPage:'https://www.tvalhijrah.com/',sources:[
    {url:'https://172048-castr.akamaized.net/61e0e9a88ecf869e0a595bfa/live_8b9f457013db11ed850317f9f49848aa/index.fmp4.m3u8',quality:'HD',label:'Primary'}
  ]},
  { rank:12,id:'tvs',name:'TVS',group:'General',provider:'TVS',epg:'122',officialPage:'https://www.tvsarawak.my/',sources:[
    {url:'https://live-tvs.tvsarawak.my/live/tvs.m3u8',quality:'HD',label:'Primary'}
  ]},
  { rank:13,id:'sukan-plus',name:'Sukan+',group:'Sports',provider:'RTM',epg:'806',officialPage:RTM_PAGES.sukan,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:sukan/playlist.m3u8?id=4',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.sukan)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:sukan/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.sukan)}
  ]},
  { rank:14,id:'didik-tv',name:'DidikTV KPM',group:'Kids',provider:'Media Prima',epg:'147',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/147_300.png',officialPage:'https://didik.tv/',sources:[
    {url:'https://tonton-live-ssai.akamaized.net/live/0e27ef78-4cc9-4c62-bec9-5c946c9e7354/cmaf.isml/.m3u8',quality:'HD',label:'Primary',headers:TONTON_HEADERS},
    {url:'https://raw.githubusercontent.com/samleong123/tonton_dailymotion_php/main/m3u8/DidikTVKPM.m3u8',quality:'HD',label:'Backup',headers:{Referer:'https://www.dailymotion.com/','User-Agent':UA}}
  ]},
  { rank:15,id:'tv6',name:'TV6',group:'General',provider:'RTM',epg:'106',officialPage:RTM_PAGES.tv6,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv6/playlist.m3u8?id=6',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.tv6)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv6/manifest.mpd',quality:'HD',label:'Backup',headers:rtmHeaders(RTM_PAGES.tv6)}
  ]}
].map(c=>({...c,source:(c.sources||[])[0]})).sort((a,b)=>a.rank-b.rank);
module.exports=channels;
