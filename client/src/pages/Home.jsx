import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getServices, getPromotions, getRanking } from '../api';
import ServiceLogo from '../components/ServiceLogo';
import { StarDisplay } from '../components/StarRating';

const CATEGORIES = [
  { key: 'all', label: '전체', emoji: '🔍' },
  { key: 'ott', label: 'OTT', emoji: '🎬' },
  { key: 'shopping', label: '쇼핑', emoji: '🛒' },
  { key: 'music', label: '음악', emoji: '🎵' },
  { key: 'ai', label: 'AI', emoji: '🤖' },
  { key: 'food', label: '배달', emoji: '🍔' },
  { key: 'game', label: '게임', emoji: '🎮' },
];

const SORTS = [
  { key: 'rank', label: '추천순' },
  { key: 'price_asc', label: '낮은 가격순' },
  { key: 'price_desc', label: '높은 가격순' },
  { key: 'rating', label: '평점순' },
];

const CAT_LABELS = { ott: 'OTT', shopping: '쇼핑', music: '음악', ai: 'AI', food: '배달', game: '기타' };

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('rank');
  const [services, setServices] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [promos, setPromos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const category = searchParams.get('cat') || 'all';

  useEffect(() => {
    setLoading(true);
    getServices({ category: category === 'all' ? undefined : category, sort })
      .then(setServices).finally(() => setLoading(false));
  }, [category, sort]);

  useEffect(() => {
    getRanking({}).then(d => setTopServices(d.slice(0, 3)));
    getPromotions().then(d => setPromos(d.slice(0, 2)));
  }, []);

  const setCategory = (k) => {
    if (k === 'all') setSearchParams({});
    else setSearchParams({ cat: k });
  };

  const filtered = search
    ? services.filter(s => s.name.includes(search) || (s.description || '').includes(search))
    : services;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #7B6EE8 100%)',
        borderRadius: 20, padding: '36px 40px', marginBottom: 32,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -0.8, marginBottom: 8 }}>
            어떤 구독이 나에게 맞을까? 🎯
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
            가격·사용성·유저 평점을 종합해 최고의 구독 서비스를 추천해드립니다.
          </p>
          {/* Search */}
          <div style={{
            background: '#fff', borderRadius: 12, display: 'flex',
            alignItems: 'center', padding: '12px 16px', gap: 10, maxWidth: 400,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            <Search size={16} color="var(--text-tertiary)" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="서비스 이름으로 검색..."
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, background: 'transparent', color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Top 3 mini */}
        <div style={{ display: 'flex', gap: 12 }}>
          {topServices.map((s, i) => (
            <div key={s.id} onClick={() => navigate(`/service/${s.id}`)}
              style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                borderRadius: 14, padding: '14px 16px', cursor: 'pointer', minWidth: 120,
                border: '1px solid rgba(255,255,255,0.25)', transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 16, marginBottom: 6 }}>{'🥇🥈🥉'[i]}</div>
              <ServiceLogo logo={s.logo} color={s.color} name={s.name} size={36} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 8 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{s.monthly_price.toLocaleString()}원/월</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo strip */}
      {promos.length > 0 && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          {promos.map(p => (
            <div key={p.id} onClick={() => navigate('/promotions')}
              style={{
                flex: 1, background: 'linear-gradient(135deg, #FF6B6B, #FFB347)',
                borderRadius: 14, padding: '14px 18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>🔥 한정 프로모션</p>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{p.title}</p>
              </div>
              <ChevronRight size={18} color="#fff" />
            </div>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)} style={{
            padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 600,
            background: category === c.key ? 'var(--primary)' : '#fff',
            color: category === c.key ? '#fff' : 'var(--text-secondary)',
            boxShadow: 'var(--shadow)', border: '1px solid',
            borderColor: category === c.key ? 'var(--primary)' : 'var(--border)',
            transition: 'all 0.15s',
          }}>
            {c.emoji} {c.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <SlidersHorizontal size={15} color="var(--text-tertiary)" />
          {SORTS.map(s => (
            <button key={s.key} onClick={() => setSort(s.key)} style={{
              padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              background: sort === s.key ? 'var(--primary-bg)' : 'transparent',
              color: sort === s.key ? 'var(--primary)' : 'var(--text-tertiary)',
              border: '1px solid', borderColor: sort === s.key ? 'var(--primary)' : 'var(--border)',
              transition: 'all 0.15s',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
        {category !== 'all' && <><strong style={{ color: 'var(--primary)' }}>{CAT_LABELS[category] || category}</strong> · </>}
        총 <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong>개 서비스
      </p>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {loading
          ? Array(8).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 'var(--radius)' }} />
          ))
          : filtered.length === 0
            ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
                <p style={{ fontSize: 16 }}>검색 결과가 없습니다</p>
              </div>
            )
            : filtered.map(s => <ServiceCardPC key={s.id} service={s} />)
        }
      </div>
    </div>
  );
}

function ServiceCardPC({ service }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => navigate(`/service/${service.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--card)', borderRadius: 'var(--radius)',
        padding: '20px', cursor: 'pointer',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow)',
        border: `1.5px solid ${hover ? 'var(--primary)' : 'var(--border)'}`,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
        <ServiceLogo logo={service.logo} color={service.color} name={service.name} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{service.name}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--primary)',
              background: 'var(--primary-bg)', borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap',
            }}>{CAT_LABELS[service.category]}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {service.description}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
        {(service.features || []).slice(0, 3).map(f => (
          <span key={f} style={{ fontSize: 11, background: 'var(--bg)', color: 'var(--text-secondary)', borderRadius: 6, padding: '3px 8px', border: '1px solid var(--border)' }}>{f}</span>
        ))}
        {(service.features || []).length > 3 && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '3px 4px' }}>+{service.features.length - 3}개</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{service.monthly_price.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 2 }}>원/월</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarDisplay value={service.avg_rating} size={13} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{service.avg_rating || '—'}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>({service.review_count})</span>
        </div>
      </div>
    </div>
  );
}
