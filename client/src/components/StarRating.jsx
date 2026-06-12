import { useRef } from 'react';
import { Star } from 'lucide-react';

function getValueFromEvent(e, containerRef) {
  const rect = containerRef.current.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
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

  const handle = (e) => {
    const v = getValueFromEvent(e, containerRef);
    onChange?.(Math.max(0.5, v));
  };

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', gap: 4, cursor: 'pointer', userSelect: 'none' }}
      onMouseDown={e => { dragging.current = true; handle(e); }}
      onMouseMove={e => { if (dragging.current) handle(e); }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchStart={e => { dragging.current = true; handle(e); }}
      onTouchMove={e => { if (dragging.current) handle(e); }}
      onTouchEnd={() => { dragging.current = false; }}
    >
      {[1, 2, 3, 4, 5].map(n => {
        const full = value >= n;
        const half = !full && value >= n - 0.5;
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
