import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import ServiceLogo from './ServiceLogo';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/service/${service.id}`)} style={{
      background: 'var(--card)', borderRadius: 'var(--radius)',
      padding: '16px', display: 'flex', alignItems: 'center',
      gap: 14, cursor: 'pointer', boxShadow: 'var(--shadow)',
      transition: 'transform 0.1s, box-shadow 0.1s',
      WebkitTapHighlightColor: 'transparent',
    }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <ServiceLogo logo={service.logo} color={service.color} name={service.name} size={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{service.name}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--primary)',
            background: 'var(--primary-bg)', borderRadius: 6, padding: '2px 7px',
          }}>{categoryLabel(service.category)}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {service.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>
            {service.monthly_price.toLocaleString()}원<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary)' }}>/월</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={12} fill="#FFB800" color="#FFB800" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{service.avg_rating || '—'}</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>({service.review_count})</span>
          </div>
        </div>
      </div>
      <ChevronRight size={16} color="var(--text-tertiary)" />
    </div>
  );
}

export function categoryLabel(cat) {
  const map = { ott: 'OTT', shopping: '쇼핑', music: '음악', ai: 'AI', food: '배달', game: '게임' };
  return map[cat] || cat;
}
