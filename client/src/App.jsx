import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ServiceDetail from './pages/ServiceDetail';
import Ranking from './pages/Ranking';
import Calculator from './pages/Calculator';
import Admin from './pages/Admin';
import Community, { PostDetail } from './pages/Community';
import King from './pages/King';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
