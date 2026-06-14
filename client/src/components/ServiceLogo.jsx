const gf = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const LOGO_IMAGES = {
  netflix:     'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.png',
  tving:       gf('tving.com'),
  wavve:       gf('wavve.com'),
  coupangplay: gf('coupangplay.com'),
  watcha:      gf('watcha.com'),
  disneyplus:  'https://cnbl-cdn.bamgrid.com/assets/7ecc8bcb60ad77193058d63e321bd21cbac2fc67/original',
  coupang:     gf('coupang.com'),
  naver:       'https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png',
  ssg:         gf('ssg.com'),
  kakao:       'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/5f9c58e3017800001e000001',
  melon:       gf('melon.com'),
  spotify:     'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
  youtubemusic: 'https://music.youtube.com/img/favicon_144.png',
  applemusic:  'https://www.apple.com/favicon.ico',
  bugs:        gf('bugs.co.kr'),
  chatgpt:     'https://cdn.oaistatic.com/assets/favicon-o20kmmos.svg',
  claude:      gf('claude.ai'),
  gemini:      gf('gemini.google.com'),
  copilot:     gf('copilot.microsoft.com'),
  perplexity:  gf('perplexity.ai'),
  baemin:      gf('baemin.com'),
  yogiyo:      gf('yogiyo.co.kr'),
  coupangeats: gf('eats.coupang.com'),
  xbox:        'https://xbox.com/favicon.ico',
  playstation: gf('playstation.com'),
  nintendo:    gf('nintendo.com'),
  nexon:       gf('nexon.com'),
  youtube:     gf('youtube.com'),
};

const LOGOS_FALLBACK = {
  netflix: '🎬', tving: '📺', wavve: '📡', coupangplay: '🎥', watcha: '🎞️', disneyplus: '✨',
  coupang: '🛒', naver: '🟢', ssg: '🏪', kakao: '💛',
  melon: '🍈', spotify: '🎵', youtubemusic: '▶️', applemusic: '🎶', bugs: '🎙️',
  chatgpt: '🤖', claude: '💜', gemini: '💎', copilot: '🔷', perplexity: '🔍',
  baemin: '🛵', yogiyo: '🍔', coupangeats: '🚀',
  xbox: '🎮', playstation: '🕹️', nintendo: '🎯', nexon: '⚔️', youtube: '▶️',
};

export default function ServiceLogo({ logo, color, name, size = 48 }) {
  const imgUrl = LOGO_IMAGES[logo];
  const emoji = LOGOS_FALLBACK[logo] || '📦';

  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25,
      background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, flexShrink: 0,
      border: `1px solid ${color}22`, overflow: 'hidden',
    }}>
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={name}
          style={{ width: size * 0.7, height: size * 0.7, objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <span style={{ display: imgUrl ? 'none' : 'flex' }}>{emoji}</span>
    </div>
  );
}
