import { useRef, useEffect, useState } from 'react';
import { Star } from 'lucide-react';

function getValueFromStars(clientX, starEls) {
  for (let i = starEls.length - 1; i >= 0; i--) {
    const rect = starEls[i].getBoundingClientRect();
    if (clientX >= rect.left) {
      const frac = (clientX - rect.left) / rect.width;
      return Math.round((i + frac) * 10) / 10;
    }
  }
  return 0.1;
}

export default function StarRating({ value, onChange, size = 24 }) {
  const starRefs = useRef([]);
  const dragging = useRef(false);
  const isFocused = useRef(false);
  const [inputVal, setInputVal] = useState(value > 0 ? String(value) : '');

  useEffect(() => {
    if (!isFocused.current) setInputVal(value > 0 ? String(value) : '');
  }, [value]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || isFocused.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const v = Math.min(5, Math.max(0.5, getValueFromStars(clientX, starRefs.current)));
      onChange?.(v);
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

  const fillWidth = (n) => {
    if (value >= n) return '100%';
    if (value > n - 1) return `${(value - (n - 1)) * 100}%`;
    return '0%';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, cursor: 'pointer', userSelect: 'none' }}
        onMouseDown={e => { dragging.current = true; if (!isFocused.current) { const v = Math.min(5, Math.max(0.5, getValueFromStars(e.clientX, starRefs.current))); onChange?.(v); } }}
        onTouchStart={e => { dragging.current = true; if (!isFocused.current) { const v = Math.min(5, Math.max(0.5, getValueFromStars(e.touches[0].clientX, starRefs.current))); onChange?.(v); } }}
      >
        {[1, 2, 3, 4, 5].map((n, i) => (
          <span key={n} ref={el => starRefs.current[i] = el}
            style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
            <Star size={size} fill="transparent" color="#DDD" strokeWidth={1.5} />
            <span style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: fillWidth(n), display: 'inline-block', pointerEvents: 'none' }}>
              <Star size={size} fill="#FFB800" color="#FFB800" strokeWidth={1.5} />
            </span>
          </span>
        ))}
      </div>
      <input
        type="text" inputMode="decimal"
        value={inputVal}
        onChange={e => {
          const raw = e.target.value;
          if (/\.\d{2,}/.test(raw)) return;
          const n = parseFloat(raw);
          if (!isNaN(n) && n > 5) { setInputVal('5'); onChange?.(5); return; }
          setInputVal(raw);
          if (!isNaN(n) && n > 0) {
            if (n < 0.5) { setInputVal('0.5'); onChange?.(0.5); return; }
            onChange?.(Math.min(5, Math.max(0.5, Math.round(n * 10) / 10)));
          }
        }}
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => { isFocused.current = false; const n = parseFloat(inputVal); setInputVal(n > 0 ? String(n) : ''); }}
        style={{ width: 48, border: '1.5px solid #FFB800', borderRadius: 6, padding: 0, fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'inherit', color: '#FFB800', height: 28 }}
        placeholder=""
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
          <span style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: fillWidth(n), display: 'inline-block' }}>
            <Star size={size} fill="#FFB800" color="#FFB800" strokeWidth={1.5} />
          </span>
        </span>
      ))}
    </div>
  );
}
