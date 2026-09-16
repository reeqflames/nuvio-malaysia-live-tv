// Keep playback URLs limited to streams you are authorized to redistribute/use.
// Official web pages are provided as fallbacks while direct stream URLs are verified.
const channels = [
  { id: 'tv1', name: 'TV1', group: 'RTM', logo: 'https://rtmklik.rtm.gov.my/favicon.ico', officialPage: 'https://rtmklik.rtm.gov.my/' },
  { id: 'tv2', name: 'TV2', group: 'RTM', logo: 'https://rtmklik.rtm.gov.my/favicon.ico', officialPage: 'https://rtmklik.rtm.gov.my/' },
  { id: 'tv-okey', name: 'TV Okey', group: 'RTM', logo: 'https://rtmklik.rtm.gov.my/favicon.ico', officialPage: 'https://rtmklik.rtm.gov.my/' },
  { id: 'berita-rtm', name: 'Berita RTM', group: 'News', logo: 'https://rtmklik.rtm.gov.my/favicon.ico', officialPage: 'https://rtmklik.rtm.gov.my/' },
  { id: 'tv-sukan', name: 'Sukan RTM', group: 'Sports', logo: 'https://rtmklik.rtm.gov.my/favicon.ico', officialPage: 'https://rtmklik.rtm.gov.my/' },
  { id: 'tv3', name: 'TV3', group: 'Media Prima', logo: 'https://www.tonton.com.my/favicon.ico', officialPage: 'https://www.tonton.com.my/' },
  { id: '8tv', name: '8TV', group: 'Media Prima', logo: 'https://www.tonton.com.my/favicon.ico', officialPage: 'https://www.tonton.com.my/' },
  { id: 'tv9', name: 'TV9', group: 'Media Prima', logo: 'https://www.tonton.com.my/favicon.ico', officialPage: 'https://www.tonton.com.my/' },
  { id: 'didik-tv', name: 'DidikTV KPM', group: 'Kids', logo: 'https://www.tonton.com.my/favicon.ico', officialPage: 'https://www.tonton.com.my/' }
];

module.exports = channels;
