import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, size = 24 }) {
  const handleClick = (e, n) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX < rect.left + rect.width / 2;
    onChange?.(half ? n - 0.5 : n);
  };

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const full = value >= n;
        const half = !full && value >= n - 0.5;
        return (
          <button key={n} onClick={e => handleClick(e, n)} style={{ padding: 2, position: 'relative' }}>
            <Star size={size} fill="transparent" color="#DDD" strokeWidth={1.5} />
            {(full || half) && (
              <span style={{
                position: 'absolute', top: 2, left: 2,
                overflow: 'hidden', width: full ? '100%' : '50%',
                display: 'inline-block',
              }}>
                <Star size={size} fill="#FFB800" color="#FFB800" strokeWidth={1.5} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StarDisplay({ value, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const full = value >= n;
        const half = !full && value >= n - 0.5;
        return (
          <span key={n} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
            <Star size={size} fill="transparent" color="#DDD" strokeWidth={1.5} />
            {(full || half) && (
              <span style={{
                position: 'absolute', top: 0, left: 0,
                overflow: 'hidden', width: full ? '100%' : '50%',
                display: 'inline-block',
              }}>
                <Star size={size} fill="#FFB800" color="#FFB800" strokeWidth={1.5} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
