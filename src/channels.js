// LOCKED curated order. Public/unprotected sources only; prefer official/public feeds.
const UA='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const rtmHeaders=(page)=>({Referer:page,Origin:'https://rtmklik.rtm.gov.my','User-Agent':UA});
const RTM_PAGES={
  tv1:'https://rtmklik.rtm.gov.my/live/tv/tv1',
  tv2:'https://rtmklik.rtm.gov.my/live/tv/tv2',
  okey:'https://rtmklik.rtm.gov.my/live/tv/okey',
  berita:'https://rtmklik.rtm.gov.my/live/tv/beritartm',
  sukan:'https://rtmklik.rtm.gov.my/live/tv/sukan'
};
const MP=(channel,page)=>({type:'malaysia-tv',channel,page});
const channels = [
  { rank:1,id:'tv3',name:'TV3',group:'General',provider:'Media Prima',epg:'103',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/103_600.png',officialPage:'https://www.tonton.com.my/',resolver:MP('tv3','https://malaysia-tv.net/tv3-live/') },
  { rank:2,id:'astro-ria',name:'Astro Ria',group:'General',provider:'Astro',epg:'104',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/104_600.png',officialPage:'https://www.astro.com.my/content/channels/Astro-Ria-193' },
  { rank:3,id:'tv1',name:'TV1',group:'General',provider:'RTM',epg:'101',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/101_600.png',officialPage:RTM_PAGES.tv1,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv1/playlist.m3u8?id=1',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.tv1)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv1/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.tv1)}
  ]},
  { rank:4,id:'tv2',name:'TV2',group:'General',provider:'RTM',epg:'102',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/102_600.png',officialPage:RTM_PAGES.tv2,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv2/playlist.m3u8?id=2',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.tv2)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:tv2/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.tv2)}
  ]},
  { rank:5,id:'tv-okey',name:'TV Okey',group:'General',provider:'RTM',epg:'146',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/146_600.png',officialPage:RTM_PAGES.okey,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:okey/playlist.m3u8?id=3',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.okey)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:okey/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.okey)}
  ]},
  { rank:6,id:'8tv',name:'8TV',group:'General',provider:'Media Prima',epg:'148',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/148_600.png',officialPage:'https://www.tonton.com.my/',resolver:MP('8tv','https://malaysia-tv.net/8-tv/') },
  { rank:7,id:'tv9',name:'TV9',group:'General',provider:'Media Prima',epg:'149',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/149_600.png',officialPage:'https://www.tonton.com.my/',resolver:MP('tv9','https://malaysia-tv.net/tv9-malaysia/') },
  { rank:8,id:'astro-awani',name:'Astro Awani',group:'News',provider:'Astro',epg:'501',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/501_600.png',officialPage:'https://www.astroawani.com/',sources:[
    {url:'https://d2idp3hzkhjpih.cloudfront.net/out/v1/4b85d9c2bf97413eb0c9fd875599b837/index.m3u8',quality:'720p',label:'Primary'}
  ]},
  { rank:9,id:'bernama-tv',name:'Bernama TV',group:'News',provider:'Bernama',epg:'502',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/502_600.png',officialPage:'https://www.bernama.com/' },
  { rank:10,id:'berita-rtm',name:'Berita RTM',group:'News',provider:'RTM',epg:'505',officialPage:RTM_PAGES.berita,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:berita/playlist.m3u8?id=5',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.berita)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:berita/manifest.mpd',quality:'HD',label:'Backup',headers:rtmHeaders(RTM_PAGES.berita)}
  ]},
  { rank:11,id:'sukan-plus',name:'Sukan+',group:'Sports',provider:'RTM',epg:'806',officialPage:RTM_PAGES.sukan,sources:[
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:sukan/playlist.m3u8?id=4',quality:'HD',label:'Primary',headers:rtmHeaders(RTM_PAGES.sukan)},
    {url:'https://d25tgymtnqzu8s.cloudfront.net/smil:sukan/manifest.mpd',quality:'1080p',label:'Backup',headers:rtmHeaders(RTM_PAGES.sukan)}
  ]},
  { rank:12,id:'didik-tv',name:'DidikTV KPM',group:'Kids',provider:'Media Prima',epg:'147',logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/147_600.png',officialPage:'https://didik.tv/',resolver:MP('didik','https://malaysia-tv.net/didik-tv-live/') }
].map(c=>({...c,source:(c.sources||[])[0]})).sort((a,b)=>a.rank-b.rank);
module.exports=channels;
