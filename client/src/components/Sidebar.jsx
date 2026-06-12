import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { path: '/ranking', emoji: '🏆', emojiY: '-1px', emojiMR: -6, label: '구독서비스 랭킹' },
  { path: '/king', emoji: '👑', emojiY: '-3px', label: '구독왕' },
  { path: '/community', emoji: '👥', emojiY: '-2px', label: '커뮤니티' },
];

const CATEGORIES = [
  { key: 'ott', label: 'OTT' },
  { key: 'shopping', label: '쇼핑' },
  { key: 'music', label: '음악' },
  { key: 'ai', label: 'AI' },
  { key: 'food', label: '배달' },
  { key: 'game', label: '게임' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [naverUser, setNaverUser] = useState(() => {
    const n = localStorage.getItem('naver_nickname');
    const i = localStorage.getItem('naver_id');
    return n && i ? { nickname: n, id: i } : null;
  });
  const modalRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nn = params.get('naver_nickname');
    const ni = params.get('naver_id');
    if (nn && ni) {
      localStorage.setItem('naver_nickname', nn);
      localStorage.setItem('naver_id', ni);
      setNaverUser({ nickname: nn, id: ni });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setShowLoginModal(false);
    };
    if (showLoginModal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLoginModal]);

  const logout = () => {
    localStorage.removeItem('naver_nickname');
    localStorage.removeItem('naver_id');
    setNaverUser(null);
    setShowLoginModal(false);
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: '#fff', borderBottom: '1px solid var(--border)',
      zIndex: 100, boxShadow: '0 2px 12px rgba(91,75,219,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 60, gap: 32, maxWidth: 1000, margin: '0 auto', padding: '0 40px', width: '100%', boxSizing: 'border-box' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/ranking')}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>🎯</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5 }}>구독픽</span>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV.map(({ path, icon: Icon, emoji, emojiY, emojiMR, label }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 10,
                background: active ? 'var(--primary-bg)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all 0.15s',
              }}>
                {emoji ? <span style={{ fontSize: 14, lineHeight: 1, display: 'inline-block', transform: `translateY(${emojiY || '-3px'})`, marginRight: emojiMR ?? -4 }}>{emoji}</span> : <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />}
                {label}
              </button>
            );
          })}
        </nav>

        {/* 로그인 버튼 */}
        <div style={{ marginLeft: 'auto', position: 'relative' }} ref={modalRef}>
          <button onClick={() => setShowLoginModal(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 20,
            background: naverUser ? 'var(--primary-bg)' : 'var(--primary)',
            color: naverUser ? 'var(--primary)' : '#fff',
            fontWeight: 700, fontSize: 14,
            border: naverUser ? '1.5px solid var(--primary)' : 'none',
            transition: 'all 0.15s',
          }}>
            {naverUser ? (
              <>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#03C75A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>N</span>
                {naverUser.nickname}
              </>
            ) : '로그인'}
          </button>

          {showLoginModal && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              border: '1px solid var(--border)', width: 240, zIndex: 200, overflow: 'hidden',
            }}>
              {naverUser ? (
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>로그인됨</p>
                  <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{naverUser.nickname}</p>
                  <button onClick={logout} style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#f3f4f6', color: 'var(--text)', fontWeight: 700, fontSize: 14 }}>
                    로그아웃
                  </button>
                </div>
              ) : (
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14 }}>소셜 로그인</p>
                  <a href={`https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=uN9fdPdJAEJaccJbKpvD&redirect_uri=${encodeURIComponent('https://gudokpick.onrender.com/auth/naver/callback')}&state=gudokpick`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, background: '#03C75A', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 8 }}>
                    <span style={{ width: 24, height: 24, background: '#fff', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#03C75A', fontWeight: 900, fontSize: 14 }}>N</span>
                    네이버로 로그인
                  </a>
                  <button disabled style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, background: '#FEE500', color: '#3C1E1E', fontWeight: 700, fontSize: 14, width: '100%', marginBottom: 8, opacity: 0.5, cursor: 'not-allowed' }}>
                    <span style={{ width: 24, height: 24, background: '#3C1E1E', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>💬</span>
                    카카오로 로그인
                  </button>
                  <button disabled style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, background: '#fff', color: '#3c4043', fontWeight: 700, fontSize: 14, width: '100%', border: '1.5px solid #dadce0', opacity: 0.5, cursor: 'not-allowed' }}>
                    <span style={{ width: 24, height: 24, background: '#fff', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>G</span>
                    구글로 로그인
                  </button>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12 }}>카카오/구글은 준비 중입니다</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
