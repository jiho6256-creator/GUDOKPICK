import { useLocation, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

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

      </div>
    </header>
  );
}
