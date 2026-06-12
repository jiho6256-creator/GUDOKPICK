import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, Tag, Calculator } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/ranking', icon: Trophy, label: '순위' },
  { path: '/promotions', icon: Tag, label: '프로모션' },
  { path: '/calculator', icon: Calculator, label: '계산기' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480, background: '#fff',
      borderTop: '1px solid #EBEBEB', display: 'flex',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '4px 0', color: active ? 'var(--primary)' : 'var(--text-tertiary)',
            transition: 'color 0.15s',
          }}>
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
