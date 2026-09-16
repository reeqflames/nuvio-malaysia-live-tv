// LOCKED curated order for Malaysia Live TV.
// Playback sources are configured separately and only exposed when available.
const channels = [
  { rank:1, id:'tv3', name:'TV3', group:'General', provider:'Media Prima', officialPage:'https://www.tonton.com.my/' },
  { rank:2, id:'astro-ria', name:'Astro Ria', group:'General', provider:'Astro', officialPage:'https://www.astro.com.my/' },
  { rank:3, id:'tv1', name:'TV1', group:'General', provider:'RTM', officialPage:'https://rtmklik.rtm.gov.my/' },
  { rank:4, id:'tv2', name:'TV2', group:'General', provider:'RTM', officialPage:'https://rtmklik.rtm.gov.my/' },
  { rank:5, id:'tv-okey', name:'TV Okey', group:'General', provider:'RTM', officialPage:'https://rtmklik.rtm.gov.my/' },
  { rank:6, id:'8tv', name:'8TV', group:'General', provider:'Media Prima', officialPage:'https://www.tonton.com.my/' },
  { rank:7, id:'tv9', name:'TV9', group:'General', provider:'Media Prima', officialPage:'https://www.tonton.com.my/' },
  { rank:8, id:'astro-awani', name:'Astro Awani', group:'News', provider:'Astro', officialPage:'https://www.astroawani.com/' },
  { rank:9, id:'bernama-tv', name:'Bernama TV', group:'News', provider:'Bernama', officialPage:'https://www.bernama.com/' },
  { rank:10, id:'berita-rtm', name:'Berita RTM', group:'News', provider:'RTM', officialPage:'https://rtmklik.rtm.gov.my/' },
  { rank:11, id:'tv-alhijrah', name:'TV AlHijrah', group:'General', provider:'TV AlHijrah', officialPage:'https://www.tvalhijrah.com/' },
  { rank:12, id:'tvs', name:'TVS', group:'General', provider:'TVS', officialPage:'https://www.tvsarawak.my/' },
  { rank:13, id:'sukan-plus', name:'Sukan+', group:'Sports', provider:'RTM', officialPage:'https://rtmklik.rtm.gov.my/' },
  { rank:14, id:'didik-tv', name:'DidikTV KPM', group:'Kids', provider:'Media Prima', officialPage:'https://www.tonton.com.my/' },
  { rank:15, id:'tv6', name:'TV6', group:'General', provider:'RTM', officialPage:'https://rtmklik.rtm.gov.my/' }
].sort((a,b)=>a.rank-b.rank);

module.exports = channels;
