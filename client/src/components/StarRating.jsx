import { useRef, useEffect, useState } from 'react';
import { Star } from 'lucide-react';

function getValueFromStars(clientX, starEls) {
  for (let i = starEls.length - 1; i >= 0; i--) {
    const rect = starEls[i].getBoundingClientRect();
    if (clientX >= rect.left) {
      const frac = (clientX - rect.left) / rect.width;
      return frac < 0.5 ? i + 0.5 : i + 1;
    }
  }
  return 0.5;
}

export default function StarRating({ value, onChange, size = 24 }) {
  const starRefs = useRef([]);
  const dragging = useRef(false);

  const getValue = (clientX) => getValueFromStars(clientX, starRefs.current);

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

  return (
    <div style={{ display: 'flex', gap: 4, cursor: 'pointer', userSelect: 'none' }}
      onMouseDown={e => { dragging.current = true; onChange?.(getValue(e.clientX)); }}
      onTouchStart={e => { dragging.current = true; onChange?.(getValue(e.touches[0].clientX)); }}
    >
      {[1, 2, 3, 4, 5].map((n, i) => {
        const full = value >= n;
        const half = !full && value >= n - 0.5;
        return (
          <span key={n} ref={el => starRefs.current[i] = el}
            style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
            <Star size={size} fill="transparent" color="#DDD" strokeWidth={1.5} />
            {(full || half) && (
              <span style={{
                position: 'absolute', top: 0, left: 0,
                overflow: 'hidden', width: full ? '100%' : '50%',
                display: 'inline-block', pointerEvents: 'none',
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
