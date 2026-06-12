import { useRef, useEffect, useState } from 'react';
import { Star } from 'lucide-react';

function getValueFromStars(clientX, starEls) {
  for (let i = starEls.length - 1; i >= 0; i--) {
    const rect = starEls[i].getBoundingClientRect();
    if (clientX >= rect.left) {
      const frac = (clientX - rect.left) / rect.width;
      const raw = i + frac;
      return Math.round(raw * 10) / 10;
    }
  }
  return 0.1;
}

export default function StarRating({ value, onChange, size = 24 }) {
  const starRefs = useRef([]);
  const dragging = useRef(false);

  const getValue = (clientX) => {
    const v = getValueFromStars(clientX, starRefs.current);
    return Math.min(5, Math.max(0.1, v));
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      onChange?.(getValue(clientX));
    };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [onChange]);

  const handleInput = (e) => {
    const n = parseFloat(e.target.value);
    if (!isNaN(n)) onChange?.(Math.min(5, Math.max(0.1, Math.round(n * 10) / 10)));
  };

  const fillWidth = (n) => {
    if (value >= n) return '100%';
    if (value > n - 1) return `${(value - (n - 1)) * 100}%`;
    return '0%';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, cursor: 'pointer', userSelect: 'none' }}
        onMouseDown={e => { dragging.current = true; onChange?.(getValue(e.clientX)); }}
        onTouchStart={e => { dragging.current = true; onChange?.(getValue(e.touches[0].clientX)); }}
      >
        {[1, 2, 3, 4, 5].map((n, i) => (
          <span key={n} ref={el => starRefs.current[i] = el}
            style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
            <Star size={size} fill="transparent" color="#DDD" strokeWidth={1.5} />
            <span style={{
              position: 'absolute', top: 0, left: 0,
              overflow: 'hidden', width: fillWidth(n),
              display: 'inline-block', pointerEvents: 'none',
            }}>
              <Star size={size} fill="#FFB800" color="#FFB800" strokeWidth={1.5} />
            </span>
          </span>
        ))}
      </div>
      <input
        type="text" inputMode="decimal"
        value={value > 0 ? value : ''}
        onChange={handleInput}
        style={{ width: 48, border: '1.5px solid #FFB800', borderRadius: 6, padding: '0', fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'inherit', color: '#FFB800', lineHeight: 1, height: 28, display: 'flex', alignItems: 'center' }}
        placeholder="0.0"
      />
    </div>
  );
}

export function StarDisplay({ value, size = 14 }) {
  const fillWidth = (n) => {
    if (value >= n) return '100%';
    if (value > n - 1) return `${(value - (n - 1)) * 100}%`;
    return '0%';
  };
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
          <Star size={size} fill="transparent" color="#DDD" strokeWidth={1.5} />
          <span style={{
            position: 'absolute', top: 0, left: 0,
            overflow: 'hidden', width: fillWidth(n),
            display: 'inline-block',
          }}>
            <Star size={size} fill="#FFB800" color="#FFB800" strokeWidth={1.5} />
          </span>
        </span>
      ))}
    </div>
  );
}
