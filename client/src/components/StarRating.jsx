import { useRef, useEffect, useState } from 'react';
import { Star } from 'lucide-react';

function getValueFromRect(clientX, rect) {
  const x = clientX - rect.left;
  const starWidth = rect.width / 5;
  const raw = x / starWidth;
  const star = Math.ceil(raw);
  const clamped = Math.min(5, Math.max(1, star));
  const frac = raw - Math.floor(raw);
  return frac < 0.5 ? clamped - 0.5 : clamped;
}

export default function StarRating({ value, onChange, size = 24 }) {
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = containerRef.current.getBoundingClientRect();
      const v = Math.min(5, Math.max(0.5, getValueFromRect(clientX, rect)));
      onChange?.(v);
      setHover(v);
    };
    const onUp = () => {
      dragging.current = false;
      setHover(null);
    };
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

  const display = value;

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', gap: 4, cursor: 'pointer', userSelect: 'none' }}
      onMouseDown={e => {
        dragging.current = true;
        const rect = containerRef.current.getBoundingClientRect();
        const v = Math.min(5, Math.max(0.5, getValueFromRect(e.clientX, rect)));
        onChange?.(v);
        setHover(v);
      }}
      onMouseMove={e => { if (!dragging.current) return; }}
      onMouseLeave={() => {}}
      onTouchStart={e => {
        dragging.current = true;
        const rect = containerRef.current.getBoundingClientRect();
        const v = Math.min(5, Math.max(0.5, getValueFromRect(e.touches[0].clientX, rect)));
        onChange?.(v);
        setHover(v);
      }}
    >
      {[1, 2, 3, 4, 5].map(n => {
        const full = display >= n;
        const half = !full && display >= n - 0.5;
        return (
          <span key={n} style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
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
