const cl = (domain) => `https://logo.clearbit.com/${domain}`;

const LOGO_IMAGES = {
  netflix:     cl('netflix.com'),
  tving:       cl('tving.com'),
  wavve:       cl('wavve.com'),
  coupangplay: cl('coupangplay.com'),
  watcha:      cl('watcha.com'),
  disneyplus:  cl('disneyplus.com'),
  coupang:     cl('coupang.com'),
  naver:       cl('naver.com'),
  ssg:         cl('ssg.com'),
  kakao:       cl('kakao.com'),
  melon:       cl('melon.com'),
  spotify:     cl('spotify.com'),
  applemusic:  cl('music.apple.com'),
  bugs:        cl('bugs.co.kr'),
  chatgpt:     cl('openai.com'),
  claude:      cl('anthropic.com'),
  gemini:      cl('google.com'),
  copilot:     cl('microsoft.com'),
  perplexity:  cl('perplexity.ai'),
  kurly:       cl('kurly.com'),
  baemin:      cl('baemin.com'),
  yogiyo:      cl('yogiyo.co.kr'),
  ddanggyeoyo: cl('ddanggyeoyo.com'),
  elevenst:    cl('11st.co.kr'),
  xbox:        cl('xbox.com'),
  playstation: cl('playstation.com'),
  nintendo:    cl('nintendo.com'),
  nexon:       cl('nexon.com'),
  youtube:     cl('youtube.com'),
};

const LOGOS_FALLBACK = {
  netflix: '🎬', tving: '📺', wavve: '📡', coupangplay: '🎥', watcha: '🎞️', disneyplus: '✨',
  coupang: '🛒', naver: '🟢', ssg: '🏪', kakao: '💛',
  melon: '🍈', spotify: '🎵', youtubemusic: '▶️', applemusic: '🎶', bugs: '🎙️',
  chatgpt: '🤖', claude: '💜', gemini: '💎', copilot: '🔷', perplexity: '🔍',
  kurly: '🥬', baemin: '🛵', yogiyo: '🍔', ddanggyeoyo: '🚀', elevenst: '🛍️',
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
          style={{ width: size * 0.65, height: size * 0.65, objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <span style={{ display: imgUrl ? 'none' : 'flex' }}>{emoji}</span>
    </div>
  );
}
