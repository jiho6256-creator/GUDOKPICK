import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getRanking } from '../api';
import ServiceLogo from '../components/ServiceLogo';
import Carousel from '../components/Carousel';
import Sparkline from '../components/Sparkline';

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'ott', label: 'OTT' },
  { key: 'ai', label: 'AI' },
  { key: 'shopping', label: '쇼핑' },
  { key: 'music', label: '음악' },
  { key: 'food', label: '배달' },
  { key: 'game', label: '게임' },
];

export default function Ranking() {
  const [category, setCategory] = useState('all');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getRanking({ category: category === 'all' ? undefined : category })
      .then(setRanking).finally(() => setLoading(false));
  }, [category]);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <Carousel />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 24, display: 'inline-block', transform: 'translateX(8px)' }}>🏆</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>구독서비스 랭킹</h1>
        </div>
      </div>

      {/* Category tabs + Info icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1 }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 600,
              background: category === c.key ? 'var(--primary)' : '#fff',
              color: category === c.key ? '#fff' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow)', border: '1px solid',
              borderColor: category === c.key ? 'var(--primary)' : 'var(--border)',
              transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {c.label}
            </button>
          ))}
        </div>

      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 72 }} />)}
        </div>
      ) : (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px', gap: 16, padding: '12px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            {['순위', '서비스', '월 구독료', '유저 평점'].map(h => (
              <span key={h} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>{h}</span>
            ))}
          </div>
          {ranking.map((s, i) => (
            <div key={s.id} onClick={() => navigate(`/service/${s.id}`)}
              style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px',
                gap: 16, padding: '14px 20px', alignItems: 'center',
                borderBottom: '1px solid var(--border)', cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: i < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : 'var(--text-tertiary)', textAlign: 'center' }}>
                {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ServiceLogo logo={s.logo} color={s.color} name={s.name} size={40} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{s.monthly_price.toLocaleString()}원</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={13} fill="#FFB800" color="#FFB800" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.avg_rating || '—'}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>({s.review_count})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
