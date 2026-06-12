import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Carousel() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [animated, setAnimated] = useState(true);
  const intervalRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/carousel`).then(r => setCards(r.data));
  }, []);

  const extended = cards.length > 0 ? [...cards, cards[0]] : [];

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => advance(), 6000);
  };

  const advance = () => {
    setAnimated(true);
    setIndex(prev => prev + 1);
  };

  useEffect(() => {
    if (cards.length === 0) return;
    if (index === cards.length) {
      const t = setTimeout(() => {
        setAnimated(false);
        setIndex(0);
      }, 550);
      return () => clearTimeout(t);
    }
  }, [index, cards.length]);

  useEffect(() => {
    if (cards.length === 0) return;
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [cards.length]);

  const handleDotEnter = (i) => {
    clearTimeout(resumeTimeoutRef.current);
    clearInterval(intervalRef.current);
    setAnimated(true);
    setIndex(i);
  };

  const handleDotLeave = () => {
    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      advance();
      startInterval();
    }, 3000);
  };

  const dotIndex = index === cards.length ? 0 : index;

  if (cards.length === 0) return <div style={{ height: 140, marginBottom: 32 }} />;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 32 }}>
      <div style={{
        display: 'flex',
        transform: `translateX(-${index * 100}%)`,
        transition: animated ? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      }}>
        {extended.map((card, i) => {
          const href = card.link ? (card.link.startsWith('http') ? card.link : `https://${card.link}`) : null;
          const Wrapper = href ? 'a' : 'div';
          const wrapperProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {};
          return (
          <Wrapper key={i} {...wrapperProps} style={{
            minWidth: '100%', background: card.bg,
            borderRadius: 16, padding: 'clamp(20px, 5vw, 32px) clamp(16px, 5vw, 40px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            textDecoration: 'none', cursor: href ? 'pointer' : 'default',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* glass overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(2px)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.2)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                borderRadius: 20, padding: '3px 12px', marginBottom: 12, display: 'inline-block',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>{card.tag}</span>
              <h2 style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: -0.5 }}>{card.title}</h2>
              <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'rgba(255,255,255,0.82)', maxWidth: 480, lineHeight: 1.6 }}>{card.description}</p>
            </div>
            <div style={{ fontSize: 72, flexShrink: 0, marginLeft: 32, opacity: 0.75, position: 'relative', zIndex: 1 }}>{card.emoji}</div>
          </Wrapper>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6,
      }}>
        {cards.map((_, i) => (
          <button key={i}
            onMouseEnter={() => handleDotEnter(i)}
            onMouseLeave={handleDotLeave}
            style={{
              width: i === dotIndex ? 20 : 6, height: 6, borderRadius: 3,
              background: i === dotIndex ? '#fff' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.3s', padding: 0, cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}
