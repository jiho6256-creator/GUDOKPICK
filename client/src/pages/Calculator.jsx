import { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Plus, Trash2, TrendingDown, PieChart } from 'lucide-react';
import { getServices } from '../api';
import ServiceLogo from '../components/ServiceLogo';

const CAT_LABELS = { ott: 'OTT', shopping: '쇼핑', music: '음악', ai: 'AI', food: '배달', game: '기타' };
const CAT_COLORS = { ott: '#E50914', shopping: '#C00011', music: '#1DB954', ai: '#5B4BDB', food: '#FFE040', game: '#107C10' };

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'ott', label: 'OTT' },
  { key: 'shopping', label: '쇼핑' },
  { key: 'music', label: '음악' },
  { key: 'ai', label: 'AI' },
  { key: 'food', label: '배달' },
  { key: 'game', label: '기타' },
];

export default function Calculator() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => { getServices({}).then(setServices); }, []);

  const toggle = (service) => {
    setSelected(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const total = selected.reduce((sum, s) => sum + s.monthly_price, 0);
  const yearly = total * 12;

  // Category breakdown
  const breakdown = Object.entries(
    selected.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.monthly_price;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const filtered = categoryFilter === 'all' ? services : services.filter(s => s.category === categoryFilter);

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <CalcIcon size={26} color="var(--primary)" />
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>구독료 계산기</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left panel: summary + selected */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Total */}
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', borderRadius: 18, padding: '28px 24px', color: '#fff' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>월 총 구독료</p>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, marginBottom: 4 }}>
              {total.toLocaleString()}<span style={{ fontSize: 20, fontWeight: 600, marginLeft: 4 }}>원</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              연간 <strong style={{ color: '#fff', fontSize: 15 }}>{yearly.toLocaleString()}원</strong>
            </p>
            {total > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>이걸로 뭘 살 수 있을까?</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <TipBadge>☕ 커피 {Math.round(total / 5000)}잔</TipBadge>
                  <TipBadge>🍕 피자 {Math.round(total / 20000)}판</TipBadge>
                  {total > 50000 && <TipBadge warn>⚠️ 구독 다이어트 필요</TipBadge>}
                </div>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          {breakdown.length > 0 && (
            <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <PieChart size={16} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>카테고리별 지출</span>
              </div>
              {breakdown.map(([cat, amount]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{CAT_LABELS[cat] || cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{amount.toLocaleString()}원</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(amount / total) * 100}%`, background: CAT_COLORS[cat] || 'var(--primary)', borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected list */}
          {selected.length > 0 && (
            <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>선택한 구독 ({selected.length}개)</p>
              {selected.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <ServiceLogo logo={s.logo} color={s.color} name={s.name} size={34} />
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{s.monthly_price.toLocaleString()}원</span>
                  <button onClick={() => toggle(s)} style={{ color: '#FF5A5A', padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selected.length === 0 && (
            <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '32px 20px', textAlign: 'center', border: '2px dashed var(--border)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🛒</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>오른쪽에서 구독 서비스를 선택하세요</p>
            </div>
          )}
        </div>

        {/* Right panel: service picker */}
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategoryFilter(c.key)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: categoryFilter === c.key ? 'var(--primary)' : 'var(--bg)',
                color: categoryFilter === c.key ? '#fff' : 'var(--text-secondary)',
                border: '1px solid', borderColor: categoryFilter === c.key ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.15s',
              }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {filtered.map(s => {
              const isSelected = selected.some(sel => sel.id === s.id);
              return (
                <div key={s.id} onClick={() => toggle(s)} style={{
                  background: isSelected ? 'var(--primary-bg)' : 'var(--bg)',
                  borderRadius: 12, padding: '14px',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}>
                  <ServiceLogo logo={s.logo} color={s.color} name={s.name} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 700 : 400 }}>
                      {s.monthly_price.toLocaleString()}원/월
                    </div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--primary)' : '#CCC'}`,
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TipBadge({ children, warn }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '4px 10px',
      background: warn ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
      color: warn ? '#FFCDD2' : 'rgba(255,255,255,0.9)',
    }}>{children}</span>
  );
}
