const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'gudokpick.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    color TEXT,
    website TEXT,
    monthly_price INTEGER NOT NULL,
    yearly_price INTEGER,
    trial_days INTEGER DEFAULT 0,
    usability_score REAL DEFAULT 0,
    features TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    nickname TEXT NOT NULL,
    naver_id TEXT,
    rating REAL NOT NULL CHECK(rating BETWEEN 0.5 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT,
    discount_value INTEGER,
    start_date TEXT,
    end_date TEXT,
    link TEXT,
    FOREIGN KEY (service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    naver_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    service_tag TEXT,
    discount_rate INTEGER,
    promo_start TEXT,
    promo_end TEXT,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS post_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    nickname TEXT NOT NULL,
    naver_id TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    client_id TEXT NOT NULL,
    UNIQUE(post_id, client_id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS carousel_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bg TEXT NOT NULL,
    emoji TEXT NOT NULL,
    link TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
  );
`);

// Migrate: add columns if not exists
try { db.exec('ALTER TABLE posts ADD COLUMN service_tag TEXT'); } catch {}
try { db.exec('ALTER TABLE posts ADD COLUMN discount_rate INTEGER'); } catch {}
try { db.exec('ALTER TABLE posts ADD COLUMN promo_start TEXT'); } catch {}
try { db.exec('ALTER TABLE posts ADD COLUMN promo_end TEXT'); } catch {}

// Seed carousel cards
const carouselCount = db.prepare('SELECT COUNT(*) as c FROM carousel_cards').get();
if (carouselCount.c === 0) {
  const insertCard = db.prepare(`INSERT INTO carousel_cards (tag, title, description, bg, emoji, sort_order) VALUES (?, ?, ?, ?, ?, ?)`);
  const cards = [
    ['이달의 추천', 'Xbox 게임패스 얼티밋', '100개 이상의 게임을 월 15,900원에. Day One 출시 타이틀 포함', 'linear-gradient(135deg, #107C10 0%, #1DB954 100%)', '🎮', 1],
    ['가성비 픽', '쿠팡 로켓와우', '무료 배송 + 쿠팡플레이까지. 월 7,890원으로 두 가지를 한 번에', 'linear-gradient(135deg, #C00011 0%, #FF5252 100%)', '🛒', 2],
    ['AI 특집', 'Claude Pro vs ChatGPT Plus', '코딩엔 Claude, 범용엔 ChatGPT. 나에게 맞는 AI 구독은?', 'linear-gradient(135deg, #5B4BDB 0%, #7B6EE8 100%)', '🤖', 3],
    ['할인 중', '스포티파이 3개월 무료', '신규 가입 시 프리미엄 3개월 무료 체험. 지금 바로 시작하세요', 'linear-gradient(135deg, #1DB954 0%, #17A844 100%)', '🎵', 4],
    ['OTT 비교', '넷플릭스 vs 디즈니플러스', '오리지널 콘텐츠 최강자 넷플릭스, 마블·스타워즈는 디즈니+', 'linear-gradient(135deg, #E50914 0%, #1130A7 100%)', '🎬', 5],
  ];
  const tx = db.transaction(() => { for (const c of cards) insertCard.run(...c); });
  tx();
}

// Seed data
const count = db.prepare('SELECT COUNT(*) as c FROM services').get();
if (count.c === 0) {
  const insertService = db.prepare(`
    INSERT INTO services (name, category, description, logo, color, website, monthly_price, yearly_price, trial_days, usability_score, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const services = [
    // OTT
    ['넷플릭스', 'ott', '세계 최대 스트리밍 서비스. 오리지널 콘텐츠 최강자', 'netflix', '#E50914', 'https://netflix.com', 17000, null, 0, 4.5, '["4K HDR", "오프라인 저장", "멀티 프로필", "오리지널 콘텐츠"]'],
    ['티빙', 'ott', 'CJ ENM 국내 OTT. tvN, OCN 등 채널 실시간 시청 가능', 'tving', '#FF153C', 'https://tving.com', 7900, 79000, 0, 4.0, '["실시간 TV", "스포츠 중계", "국내 드라마", "웹드라마"]'],
    ['웨이브', 'ott', 'KBS, MBC, SBS 지상파 콘텐츠 특화 스트리밍', 'wavve', '#006EFF', 'https://wavve.com', 7900, 79000, 0, 3.8, '["지상파 콘텐츠", "실시간 채널", "뉴스", "스포츠"]'],
    ['쿠팡플레이', 'ott', '쿠팡 로켓와우 회원이라면 무료. 스포츠 중계 강점', 'coupangplay', '#C00011', 'https://coupangplay.com', 7890, null, 0, 3.9, '["손흥민 EPL", "K리그", "로켓배송 무료", "오리지널"]'],
    ['왓챠', 'ott', '다양한 영화 & 드라마 취향 맞춤 추천 서비스', 'watcha', '#FF0558', 'https://watcha.com', 7900, 79000, 0, 3.7, '["영화 특화", "취향 추천", "왓챠피디아", "독립영화"]'],
    ['디즈니플러스', 'ott', '디즈니, 마블, 스타워즈, 픽사 콘텐츠 총집합', 'disneyplus', '#1130A7', 'https://disneyplus.com', 9900, 99000, 0, 4.2, '["마블 MCU", "스타워즈", "픽사", "4K UHD"]'],

    // 쇼핑 멤버십
    ['쿠팡 로켓와우', 'shopping', '무료 배송, 쿠팡플레이 포함. 국내 최대 이커머스 멤버십', 'coupang', '#C00011', 'https://coupang.com', 7890, null, 30, 4.6, '["무료 배송", "쿠팡플레이", "로켓프레시", "새벽배송"]'],
    ['네이버플러스', 'shopping', '네이버 포인트 적립 + 디지털 콘텐츠 혜택', 'naver', '#03C75A', 'https://naver.com', 4900, 49000, 0, 4.1, '["포인트 5% 적립", "시리즈온", "웹툰", "클로바"]'],
    ['SSG 유니버스', 'shopping', 'SSG닷컴, 이마트 등 신세계 계열사 통합 멤버십', 'ssg', '#FF0000', 'https://ssg.com', 3900, 39000, 0, 3.6, '["이마트 할인", "온라인 적립", "스타벅스 혜택", "신세계포인트"]'],
    ['카카오구독', 'shopping', '카카오 서비스 할인 + 이모티콘 + 혜택 패키지', 'kakao', '#FEE500', 'https://kakao.com', 2900, null, 0, 3.5, '["이모티콘 플러스", "카카오T", "멜론", "톡딜 할인"]'],

    // 음악 스트리밍
    ['멜론', 'music', '국내 점유율 1위 음악 스트리밍. 가장 넓은 국내 음원', 'melon', '#00CD3C', 'https://melon.com', 10900, 109000, 0, 4.0, '["국내 최다 음원", "가사 동기화", "뮤직비디오", "AI DJ"]'],
    ['스포티파이', 'music', '글로벌 1위 음악 스트리밍. 팟캐스트 & 추천 알고리즘 최강', 'spotify', '#1DB954', 'https://spotify.com', 10900, 109000, 3, 4.6, '["맞춤 추천", "팟캐스트", "글로벌 음원", "오프라인"]'],
    ['유튜브뮤직', 'music', '유튜브 영상과 연동되는 음악 스트리밍. 유튜브 프리미엄 포함 시 추가 비용 없음', 'youtubemusic', '#FF0000', 'https://music.youtube.com', 10450, 104500, 1, 4.2, '["유튜브 연동", "뮤직비디오", "라이브", "믹스 생성"]'],
    ['애플뮤직', 'music', '고음질 로스리스 & 돌비 애트모스. 애플 생태계 최적화', 'applemusic', '#FC3C44', 'https://music.apple.com', 10900, 109000, 3, 4.3, '["로스리스 음질", "돌비 애트모스", "애플 연동", "뮤직비디오"]'],
    ['벅스', 'music', '국내 고음질 음원 특화. FLAC 무손실 음원 제공', 'bugs', '#FF5C00', 'https://bugs.co.kr', 8900, 89000, 0, 3.6, '["FLAC 음질", "가사 서비스", "뮤직비디오", "라디오"]'],

    // 생성형 AI
    ['ChatGPT Plus', 'ai', 'OpenAI GPT-4o. 텍스트, 이미지, 음성 멀티모달 AI', 'chatgpt', '#10A37F', 'https://chatgpt.com', 27000, null, 0, 4.7, '["GPT-4o", "이미지 생성", "코드 해석", "플러그인"]'],
    ['Claude Pro', 'ai', 'Anthropic Claude. 긴 문서 분석 & 코딩 특화 AI', 'claude', '#5B4BDB', 'https://claude.ai', 27000, null, 0, 4.6, '["200K 컨텍스트", "코딩 특화", "문서 분석", "아티팩트"]'],
    ['Gemini Advanced', 'ai', 'Google Gemini. 구글 서비스 통합 & 멀티모달 AI', 'gemini', '#4285F4', 'https://gemini.google.com', 27000, null, 0, 4.3, '["구글 통합", "멀티모달", "코드 실행", "검색 연동"]'],
    ['Copilot Pro', 'ai', 'Microsoft AI. Office 365 앱 직접 통합', 'copilot', '#0078D4', 'https://copilot.microsoft.com', 27000, null, 0, 4.1, '["Office 통합", "워드 초안", "Excel 분석", "파워포인트"]'],
    ['Perplexity Pro', 'ai', 'AI 검색 엔진. 실시간 웹 정보 기반 답변', 'perplexity', '#20808D', 'https://perplexity.ai', 22000, 220000, 0, 4.4, '["실시간 검색", "출처 표시", "심층 리서치", "파일 분석"]'],

    // 배달/외식
    ['배민클럽', 'food', '배달의민족 구독. 배달비 할인 + 포인트 적립', 'baemin', '#FFE040', 'https://baemin.com', 3990, null, 0, 4.2, '["배달비 할인", "포인트 적립", "쿠폰", "B마트 할인"]'],
    ['요기요패스', 'food', '요기요 정기 구독. 무료 배달 + 할인 쿠폰', 'yogiyo', '#FA2027', 'https://yogiyo.co.kr', 2900, null, 0, 3.8, '["무료 배달", "10% 쿠폰", "슈퍼클럽", "매주 혜택"]'],
    ['쿠팡이츠패스', 'food', '쿠팡이츠 무료 배달. 로켓와우 포함 시 추가 혜택', 'coupangeats', '#C00011', 'https://eats.coupang.com', 2900, null, 0, 3.9, '["무료 배달", "빠른 배달", "로켓와우 연계", "할인 쿠폰"]'],

    // 게임
    ['Xbox 게임패스 얼티밋', 'game', 'PC+콘솔+클라우드 게임 100+개. EA Play 포함', 'xbox', '#107C10', 'https://xbox.com', 15900, null, 0, 4.7, '["100+ 게임", "EA Play", "클라우드 게임", "Day One 출시"]'],
    ['PlayStation Plus 에센셜', 'game', 'PS 온라인 + 월 무료 게임 3종', 'playstation', '#003087', 'https://playstation.com', 6500, 59000, 0, 4.0, '["온라인 멀티", "월 무료 3종", "할인 쿠폰", "클라우드 저장"]'],
    ['Nintendo Switch Online', 'game', '닌텐도 온라인 + NES/SNES 고전 게임 라이브러리', 'nintendo', '#E4000F', 'https://nintendo.com', 4750, 47500, 0, 3.9, '["온라인 멀티", "고전 게임", "DLC 팩", "클라우드 저장"]'],
    ['넥슨 메이플패스', 'game', '메이플스토리 월 정기권. 경험치 & 아이템 혜택', 'nexon', '#FF6600', 'https://nexon.com', 9900, null, 0, 3.8, '["경험치 부스트", "일일 아이템", "코인 지급", "특별 퀘스트"]'],
  ];

  const insertMany = db.transaction(() => {
    for (const s of services) {
      insertService.run(...s);
    }
  });
  insertMany();

  // Seed promotions
  const insertPromo = db.prepare(`
    INSERT INTO promotions (service_id, title, description, discount_type, discount_value, start_date, end_date, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const promos = [
    [1, '넷플릭스 첫 달 50% 할인', '신규 가입 시 첫 달 8,500원', 'percent', 50, '2026-06-01', '2026-06-30', 'https://netflix.com'],
    [7, '쿠팡 로켓와우 첫 달 무료', '신규 회원 30일 무료 체험', 'free_trial', 100, '2026-06-01', '2026-07-31', 'https://coupang.com'],
    [11, '스포티파이 3개월 0원', '프리미엄 3개월 무료 체험', 'free_trial', 100, '2026-06-01', '2026-06-30', 'https://spotify.com'],
    [15, 'ChatGPT Plus 연간 2개월 무료', '연간 결제 시 2개월 추가 혜택', 'free_months', 2, '2026-06-01', '2026-08-31', 'https://chatgpt.com'],
    [23, 'Xbox 게임패스 첫 달 1,000원', '신규 가입 첫 달 특가', 'fixed', 14900, '2026-06-01', '2026-07-15', 'https://xbox.com'],
    [16, 'Claude Pro 학생 할인 50%', '학생 인증 시 매달 50% 할인', 'percent', 50, '2026-06-01', '2026-12-31', 'https://claude.ai'],
  ];

  const insertPromosTx = db.transaction(() => {
    for (const p of promos) {
      insertPromo.run(...p);
    }
  });
  insertPromosTx();
}

module.exports = db;
