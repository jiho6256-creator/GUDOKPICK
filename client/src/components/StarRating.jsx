import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, size = 24 }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange?.(n)} style={{ padding: 2 }}>
          <Star
            size={size}
            fill={n <= value ? '#FFB800' : 'transparent'}
            color={n <= value ? '#FFB800' : '#DDD'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          fill={n <= Math.round(value) ? '#FFB800' : 'transparent'}
          color={n <= Math.round(value) ? '#FFB800' : '#DDD'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
