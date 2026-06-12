import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import ServiceLogo from '../components/ServiceLogo';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' });

const CATEGORY_LABELS = { ott: 'OTT', shopping: '쇼핑', music: '음악', ai: 'AI', food: '배달', game: '기타' };

export default function King() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(() => {
    try { return JSON.parse(localStorage.getItem('king_selected') || '[]'); } catch { return []; }
  });
  const [expandedCat, setExpandedCat] = useState({});

  useEffect(() => {
    api.get('/api/services').then(r => setServices(r.data));
  }, []);

  useEffect(() => {
    localStorage.setItem('king_selected', JSON.stringify(selected));
  }, [selected]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedServices = services.filter(s => selected.includes(s.id));
  const total = selectedServices.reduce((sum, s) => sum + s.monthly_price, 0);

  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 26, display: 'inline-block', transform: 'translateY(-4px) translateX(6px)' }}>👑</span>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>구독왕</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* 서비스 선택 */}
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>구독 중인 서비스를 선택하세요</p>
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <button onClick={() => setExpandedCat(p => ({ ...p, [cat]: !p[cat] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: expandedCat[cat] === false ? 12 : '12px 12px 0 0', padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {CATEGORY_LABELS[cat]}
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {list.filter(s => selected.includes(s.id)).length > 0 && `${list.filter(s => selected.includes(s.id)).length}개 선택`}
                </span>
                <span style={{ marginLeft: 'auto' }}>{expandedCat[cat] === false ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</span>
              </button>

              {expandedCat[cat] !== false && (
                <div style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                  {list.map(s => {
                    const isSelected = selected.includes(s.id);
                    return (
                      <div key={s.id} onClick={() => toggle(s.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isSelected ? 'var(--primary-bg)' : '#fff', transition: 'background 0.1s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
                      >
                        <ServiceLogo logo={s.logo} color={s.color} name={s.name} size={36} />
                        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{s.name}</span>
                        <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{s.monthly_price.toLocaleString()}원/월</span>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: isSelected ? 'var(--primary)' : '#fff',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {isSelected && <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 합산 요약 */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '22px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>내 구독 현황</h3>

            {selectedServices.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>선택된 서비스가 없습니다</p>
            ) : (
              <>
                {selectedServices.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <ServiceLogo logo={s.logo} color={s.color} name={s.name} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{s.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.monthly_price.toLocaleString()}원</span>
                    <button onClick={() => toggle(s.id)} style={{ color: 'var(--text-tertiary)', padding: 2 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>월 합계</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{total.toLocaleString()}원</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>연 합계</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{(total * 12).toLocaleString()}원</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
