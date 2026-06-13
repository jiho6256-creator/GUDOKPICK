import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ServiceDetail from './pages/ServiceDetail';
import Ranking from './pages/Ranking';
import Calculator from './pages/Calculator';
import Admin from './pages/Admin';
import Community, { PostDetail } from './pages/Community';
import King from './pages/King';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function ServerWakeup({ onReady }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    let attempts = 0;

    const ping = async () => {
      try {
        await fetch(`${BASE}/api/ranking?category=all&limit=1`, { signal: AbortSignal.timeout(8000) });
        onReady();
      } catch {
        attempts++;
        if (attempts < 20) setTimeout(ping, 3000);
        else onReady();
      }
    };

    ping();
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
      <div style={{ fontSize: 40 }}>⛏️</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>서버 준비 중{dots}</p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>잠시만 기다려주세요 (최대 1분)</p>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <BrowserRouter>
      {!ready ? (
        <ServerWakeup onReady={() => setReady(true)} />
      ) : (
        <>
          <Sidebar />
          <main style={{ marginTop: 60, minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/ranking" replace />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/king" element={<King />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:id" element={<PostDetail />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </>
      )}
    </BrowserRouter>
  );
}
