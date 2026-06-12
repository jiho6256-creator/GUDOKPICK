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
  const [inputVal, setInputVal] = useState('');
  const [editing, setEditing] = useState(false);

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

  const handleInputBlur = () => {
    setEditing(false);
    const n = parseFloat(inputVal);
    if (!isNaN(n)) onChange?.(Math.min(5, Math.max(0.1, Math.round(n * 10) / 10)));
    setInputVal('');
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
      {editing ? (
        <input
          autoFocus
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={e => e.key === 'Enter' && handleInputBlur()}
          style={{ width: 44, border: '1.5px solid var(--primary)', borderRadius: 6, padding: '2px 6px', fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }}
          placeholder={value?.toString()}
        />
      ) : (
        <span onClick={() => { setEditing(true); setInputVal(value?.toString() || ''); }}
          style={{ fontSize: 13, fontWeight: 700, color: '#FFB800', minWidth: 28, cursor: 'text', borderBottom: '1px dashed #FFB800' }}>
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      )}
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
