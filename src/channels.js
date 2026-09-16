// LOCKED curated order for Malaysia Live TV.
// Sources below are public, unprotected candidates. Header requirements are explicit.
const channels = [
  { rank:1, id:'tv3', name:'TV3', group:'General', provider:'Media Prima', logo:'https://freeview.github.io/iptv/logos/tv3.png', officialPage:'https://www.tonton.com.my/' },
  { rank:2, id:'astro-ria', name:'Astro Ria', group:'General', provider:'Astro', logo:'https://astrocontent.s3.amazonaws.com/Images/ChannelLogo/Pos/104_300.png', officialPage:'https://www.astro.com.my/' },
  { rank:3, id:'tv1', name:'TV1', group:'General', provider:'RTM', logo:'https://freeview.github.io/iptv/logos/tv1.png', officialPage:'https://rtmklik.rtm.gov.my/', source:{ url:'https://rtm1hd.secureswiftcontent.com/Origin01/ngrp:RTM1/chunklist_b1064000.m3u8', quality:'HD', referer:'https://myklik.rtm.gov.my' } },
  { rank:4, id:'tv2', name:'TV2', group:'General', provider:'RTM', logo:'https://freeview.github.io/iptv/logos/tv2.png', officialPage:'https://rtmklik.rtm.gov.my/', source:{ url:'https://rtm5hd.secureswiftcontent.com/Origin1/ngrp:RTM1/chunklist_b1064000.m3u8', quality:'HD', referer:'https://myklik.rtm.gov.my' } },
  { rank:5, id:'tv-okey', name:'TV Okey', group:'General', provider:'RTM', logo:'https://freeview.github.io/iptv/logos/okey.png', officialPage:'https://rtmklik.rtm.gov.my/', source:{ url:'https://rtm2hd.secureswiftcontent.com/Origin02/ngrp:RTM2/chunklist_b1064000.m3u8', quality:'HD', referer:'https://myklik.rtm.gov.my' } },
  { rank:6, id:'8tv', name:'8TV', group:'General', provider:'Media Prima', logo:'https://freeview.github.io/iptv/logos/8tv.png', officialPage:'https://www.tonton.com.my/' },
  { rank:7, id:'tv9', name:'TV9', group:'General', provider:'Media Prima', logo:'https://freeview.github.io/iptv/logos/tv9.png', officialPage:'https://www.tonton.com.my/' },
  { rank:8, id:'astro-awani', name:'Astro Awani', group:'News', provider:'Astro', logo:'https://freeview.github.io/iptv/logos/awani.png', officialPage:'https://www.astroawani.com/', source:{ url:'https://awanitv.akamaized.net/hls/live/2017836/LiveTV1/index.m3u8', quality:'1080p' } },
  { rank:9, id:'bernama-tv', name:'Bernama TV', group:'News', provider:'Bernama', logo:'https://freeview.github.io/iptv/logos/bernama.png', officialPage:'https://www.bernama.com/' },
  { rank:10, id:'berita-rtm', name:'Berita RTM', group:'News', provider:'RTM', logo:'https://freeview.github.io/iptv/logos/bes.png', officialPage:'https://rtmklik.rtm.gov.my/', source:{ url:'https://rtm3hd.secureswiftcontent.com/Origin03/ngrp:RTM3/chunklist_b1064000.m3u8', quality:'HD', referer:'https://myklik.rtm.gov.my' } },
  { rank:11, id:'tv-alhijrah', name:'TV AlHijrah', group:'General', provider:'TV AlHijrah', logo:'https://freeview.github.io/iptv/logos/tvalhijrah.png', officialPage:'https://www.tvalhijrah.com/' },
  { rank:12, id:'tvs', name:'TVS', group:'General', provider:'TVS', officialPage:'https://www.tvsarawak.my/' },
  { rank:13, id:'sukan-plus', name:'Sukan+', group:'Sports', provider:'RTM', logo:'https://freeview.github.io/iptv/logos/rtmhdsports.png', officialPage:'https://rtmklik.rtm.gov.my/', source:{ url:'https://rtm6hd.secureswiftcontent.com/Origin2/ngrp:RTM2/chunklist_b1064000.m3u8', quality:'HD', referer:'https://myklik.rtm.gov.my' } },
  { rank:14, id:'didik-tv', name:'DidikTV KPM', group:'Kids', provider:'Media Prima', officialPage:'https://www.tonton.com.my/' },
  { rank:15, id:'tv6', name:'TV6', group:'General', provider:'RTM', officialPage:'https://rtmklik.rtm.gov.my/', source:{ url:'https://rtm6.secureswiftcontent.com/Origin03/ngrp:RTM3/playlist.m3u8', quality:'1080p', referer:'https://rtmklik.rtm.gov.my' } }
].sort((a,b)=>a.rank-b.rank);

module.exports = channels;
