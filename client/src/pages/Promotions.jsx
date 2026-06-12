import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Clock, ExternalLink, Flame } from 'lucide-react';
import { getPromotions } from '../api';
import ServiceLogo from '../components/ServiceLogo';

const TYPE_LABELS = { percent: '% 할인', fixed: '금액 할인', free_trial: '무료 체험', free_months: '무료 기간' };
const TYPE_COLORS = { percent: '#E53935', fixed: '#8E24AA', free_trial: '#00897B', free_months: '#FB8C00' };

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPromotions().then(setPromos).finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const active = promos.filter(p => !p.end_date || new Date(p.end_date) >= today);
  const ended = promos.filter(p => p.end_date && new Date(p.end_date) < today);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Tag size={26} color="#FF6B6B" />
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>할인 프로모션</h1>
          {active.length > 0 && (
            <span style={{ background: '#FF6B6B', color: '#fff', borderRadius: 20, fontSize: 12, fontWeight: 700, padding: '3px 10px', marginLeft: 4 }}>
              진행 중 {active.length}
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>지금 가입하면 더 저렴하게 이용할 수 있는 프로모션 정보입니다.</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 'var(--radius)' }} />)}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Flame size={18} color="#FF6B6B" fill="#FF6B6B" />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>진행 중인 프로모션</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {active.map(p => <PromoCard key={p.id} promo={p} navigate={navigate} />)}
              </div>
            </section>
          )}
          {ended.length > 0 && (
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 14 }}>종료된 프로모션</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {ended.map(p => <PromoCard key={p.id} promo={p} navigate={navigate} ended />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function PromoCard({ promo, navigate, ended }) {
  const typeColor = TYPE_COLORS[promo.discount_type] || '#666';
  const typeLabel = TYPE_LABELS[promo.discount_type] || '혜택';
  const daysLeft = promo.end_date
    ? Math.ceil((new Date(promo.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => navigate(`/service/${promo.service_id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: ended ? '#F8F8FA' : 'var(--card)', borderRadius: 'var(--radius)',
        padding: '20px', cursor: 'pointer', opacity: ended ? 0.65 : 1,
        boxShadow: hover && !ended ? 'var(--shadow-lg)' : 'var(--shadow)',
        border: `1.5px solid ${hover && !ended ? typeColor + '60' : 'var(--border)'}`,
        transform: hover && !ended ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
        <ServiceLogo logo={promo.logo} color={promo.color} name={promo.service_name} size={50} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{promo.service_name}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: typeColor,
              background: typeColor + '15', borderRadius: 6, padding: '2px 8px',
            }}>{typeLabel}</span>
          </div>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{promo.title}</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{promo.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {daysLeft !== null && !ended && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: daysLeft <= 7 ? '#E53935' : 'var(--text-tertiary)', fontWeight: 600, background: daysLeft <= 7 ? '#FFEBEE' : 'var(--bg)', padding: '3px 9px', borderRadius: 6 }}>
              <Clock size={12} />
              {daysLeft > 0 ? `${daysLeft}일 남음` : '오늘 마감'}
            </span>
          )}
          {promo.end_date && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>~ {promo.end_date}</span>}
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
          자세히 보기 <ExternalLink size={13} />
        </span>
      </div>
    </div>
  );
}
