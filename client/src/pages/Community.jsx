import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Eye, Send, PenSquare, Clock, ThumbsUp } from 'lucide-react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' });

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'deal', label: '진행 중인 프로모션' },
  { key: 'general', label: '자유' },
];

function getNaverUser() {
  const n = localStorage.getItem('naver_nickname');
  const i = localStorage.getItem('naver_id');
  const t = localStorage.getItem('login_type') || 'naver';
  return n && i ? { nickname: n, id: i, type: t } : null;
}

function getClientId() {
  let id = localStorage.getItem('gudok_client_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('gudok_client_id', id);
  }
  return id;
}

function getLikedPosts() {
  try { return JSON.parse(localStorage.getItem('gudok_liked_posts') || '[]'); } catch { return []; }
}

function setLikedPosts(arr) {
  localStorage.setItem('gudok_liked_posts', JSON.stringify(arr));
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

// 게시글 목록
export default function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('deal');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nickname: '', title: '', content: '', category: 'general', service_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [naverUser, setNaverUser] = useState(getNaverUser);

  useEffect(() => {
    if (naverUser) setForm(f => ({ ...f, nickname: naverUser.nickname }));
  }, []);

  useEffect(() => {
    const handler = () => {
      const u = getNaverUser();
      setNaverUser(u);
      setForm(f => ({ ...f, nickname: u?.nickname || '' }));
    };
    window.addEventListener('auth-change', handler);
    return () => window.removeEventListener('auth-change', handler);
  }, []);

  useEffect(() => {
    api.get('/api/services').then(r => setServices(r.data));
  }, []);

  const load = () => {
    setLoading(true);
    api.get('/api/posts', { params: category === 'all' ? {} : { category } })
      .then(r => setPosts(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category]);

  const submit = async () => {
    if (!form.nickname || !form.title || !form.content) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/posts', { ...form, naver_id: naverUser?.id || null });
      setShowForm(false);
      setForm({ nickname: '', title: '', content: '', category: 'general' });
      navigate(`/community/${res.data.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const likedPosts = getLikedPosts();

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, display: 'inline-block', transform: 'translateY(-3px) translateX(4px)' }}>👥</span> 커뮤니티
        </h1>
        <button onClick={() => { setShowForm(!showForm); setForm(f => ({ ...f, category: category === 'all' ? 'general' : category })); }} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--primary)', color: '#fff', borderRadius: 10,
          padding: '10px 18px', fontWeight: 700, fontSize: 14,
        }}>
          <PenSquare size={15} /> 글쓰기
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--primary-bg)', border: '1.5px solid var(--primary)', borderRadius: 14, padding: '22px 24px', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>새 게시글 작성</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[{ key: 'general', label: '자유' }, { key: 'deal', label: '진행 중인 프로모션' }].map(c => (
              <button key={c.key} onClick={() => setForm({ ...form, category: c.key })} style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: form.category === c.key ? 'var(--primary)' : '#fff',
                color: form.category === c.key ? '#fff' : 'var(--text-secondary)',
                border: '1px solid', borderColor: form.category === c.key ? 'var(--primary)' : 'var(--border)',
              }}>{c.label}</button>
            ))}
          </div>
          {form.category === 'deal' && (
            <div style={{ marginBottom: 10 }}>
              <select value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                <option value="">서비스 선택</option>
                {services.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ marginBottom: 10, position: 'relative' }}>
            <input value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })}
              placeholder="닉네임" maxLength={20} readOnly={!!naverUser}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', background: naverUser ? 'var(--bg)' : '#fff', border: naverUser ? (naverUser.type === 'naver' ? '1.5px solid #03C75A' : '1.5px solid #9CA3AF') : '1.5px solid var(--border)', padding: naverUser ? '22px 14px 8px' : '10px 14px' }} />
            {naverUser && <span style={{ position: 'absolute', top: 7, left: 14, fontSize: 11, fontWeight: 700, color: naverUser.type === 'naver' ? '#03C75A' : '#6B7280' }}>✓ {naverUser.type === 'guest' ? '게스트' : naverUser.type === 'google' ? '구글 로그인' : '네이버 로그인'}</span>}
          </div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="제목" maxLength={100}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: 10 }} />
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder="내용을 입력해주세요" maxLength={2000} rows={5}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submit} disabled={!form.nickname || !form.title || !form.content || (form.category === 'deal' && !form.service_name) || submitting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, opacity: (!form.nickname || !form.title || !form.content || (form.category === 'deal' && !form.service_name)) ? 0.5 : 1 }}>
              <Send size={14} /> {submitting ? '등록 중...' : '등록'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: '#fff', color: 'var(--text-secondary)', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, border: '1px solid var(--border)' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 카테고리 탭 */}
      {!showForm && <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            background: category === c.key ? 'var(--primary)' : '#fff',
            color: category === c.key ? '#fff' : 'var(--text-secondary)',
            border: '1px solid', borderColor: category === c.key ? 'var(--primary)' : 'var(--border)',
            boxShadow: 'var(--shadow)', whiteSpace: 'nowrap',
          }}>{c.label}</button>
        ))}
      </div>}

      {!showForm && loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
        </div>
      ) : !showForm && posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
          첫 번째 게시글을 작성해보세요!
        </div>
      ) : !showForm ? (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          {posts.map((p, i) => (
            <div key={p.id} onClick={() => navigate(`/community/${p.id}`)}
              style={{ padding: '16px 20px', borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: categoryColor(p.category), color: '#fff', borderRadius: 6, padding: '2px 8px' }}>
                  {CATEGORIES.find(c => c.key === p.category)?.label || p.category}
                </span>
                <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{p.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-tertiary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.nickname}<PlatformBadge naverId={p.naver_id} /></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} />{timeAgo(p.created_at)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} />{p.view_count}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={11} />{p.comment_count}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: likedPosts.includes(p.id) ? '#EF4444' : 'var(--text-tertiary)' }}>
                  <ThumbsUp size={11} />{p.like_count}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// 게시글 상세
export function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ nickname: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [naverUser, setNaverUser] = useState(getNaverUser);

  useEffect(() => {
    if (naverUser) setCommentForm(f => ({ ...f, nickname: naverUser.nickname }));
  }, []);

  useEffect(() => {
    const handler = () => {
      const u = getNaverUser();
      setNaverUser(u);
      setCommentForm(f => ({ ...f, nickname: u?.nickname || '' }));
    };
    window.addEventListener('auth-change', handler);
    return () => window.removeEventListener('auth-change', handler);
  }, []);

  const load = () => {
    setLoading(true);
    api.get(`/api/posts/${id}`).then(r => {
      setPost(r.data);
      setLikeCount(r.data.like_count || 0);
      setLiked(getLikedPosts().includes(Number(id)));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const submitComment = async () => {
    if (!commentForm.nickname || !commentForm.content) return;
    setSubmitting(true);
    try {
      await api.post(`/api/posts/${id}/comments`, { ...commentForm, naver_id: naverUser?.id || null });
      setCommentForm({ nickname: '', content: '' });
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/api/posts/${id}/like`, { client_id: getClientId() });
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
      const arr = getLikedPosts().filter(x => x !== Number(id));
      if (res.data.liked) arr.push(Number(id));
      setLikedPosts(arr);
    } finally {
      setLiking(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200, borderRadius: 16 }} /></div>;
  if (!post) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-tertiary)' }}>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="page-wrap">
      <button onClick={() => navigate('/community')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
        <ArrowLeft size={18} /> 목록으로 돌아가기
      </button>

      {/* 게시글 */}
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px 32px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, background: categoryColor(post.category), color: '#fff', borderRadius: 6, padding: '2px 8px' }}>
            {CATEGORIES.find(c => c.key === post.category)?.label || post.category}
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14, lineHeight: 1.4 }}>{post.title}</h1>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, color: 'var(--text-secondary)' }}>{post.nickname}<PlatformBadge naverId={post.naver_id} /></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={12} />{timeAgo(post.created_at)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={12} />{post.view_count}</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 28 }}>{post.content}</p>

        {/* 추천 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={toggleLike} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 50,
            background: liked ? '#EF4444' : '#fff',
            color: liked ? '#fff' : 'var(--text-secondary)',
            border: `2px solid ${liked ? '#EF4444' : 'var(--border)'}`,
            fontWeight: 700, fontSize: 15,
            transition: 'all 0.15s', cursor: 'pointer',
          }}>
            <ThumbsUp size={18} fill={liked ? '#fff' : 'none'} />
            추천 {likeCount}
          </button>
        </div>
      </div>

      {/* 댓글 */}
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '22px 28px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={17} color="var(--primary)" /> 댓글 {post.comments?.length || 0}
        </h3>

        {post.comments?.map(c => (
          <div key={c.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 14 }}>{c.nickname}<PlatformBadge naverId={c.naver_id} /></span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{timeAgo(c.created_at)}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.content}</p>
          </div>
        ))}

        {post.comments?.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: '16px 0 20px' }}>첫 댓글을 남겨보세요!</p>
        )}

        {/* 댓글 작성 */}
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginTop: 8 }}>
          <div style={{ marginBottom: 10, position: 'relative' }}>
            <input value={commentForm.nickname} onChange={e => setCommentForm({ ...commentForm, nickname: e.target.value })}
              placeholder="닉네임" maxLength={20} readOnly={!!naverUser}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', background: naverUser ? 'var(--bg)' : '#fff', border: naverUser ? (naverUser.type === 'naver' ? '1.5px solid #03C75A' : '1.5px solid #9CA3AF') : '1.5px solid var(--border)', padding: naverUser ? '22px 14px 8px' : '10px 14px' }} />
            {naverUser && <span style={{ position: 'absolute', top: 7, left: 14, fontSize: 11, fontWeight: 700, color: naverUser.type === 'naver' ? '#03C75A' : '#6B7280' }}>✓ {naverUser.type === 'guest' ? '게스트' : naverUser.type === 'google' ? '구글 로그인' : '네이버 로그인'}</span>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <textarea value={commentForm.content} onChange={e => setCommentForm({ ...commentForm, content: e.target.value })}
              placeholder="댓글을 입력해주세요" maxLength={500} rows={2}
              style={{ ...inputStyle, flex: 1, resize: 'none' }} />
            <button onClick={submitComment} disabled={!commentForm.nickname || !commentForm.content || submitting}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '0 18px', fontWeight: 700, fontSize: 14, opacity: (!commentForm.nickname || !commentForm.content) ? 0.5 : 1, flexShrink: 0 }}>
              <Send size={14} /> 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformBadge({ naverId }) {
  if (!naverId) return null;
  if (naverId.startsWith('google_')) return <span style={{ fontSize: 10, fontWeight: 800, background: '#9CA3AF', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>G</span>;
  if (naverId.startsWith('guest_')) return <span style={{ fontSize: 10, fontWeight: 800, background: '#F59E0B', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>게스트</span>;
  return <span style={{ fontSize: 10, fontWeight: 800, background: '#03C75A', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>N</span>;
}

function categoryColor(cat) {
  return { general: '#8B5CF6', deal: '#F59E0B' }[cat] || '#8B5CF6';
}

const inputStyle = {
  border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px',
  fontSize: 14, background: '#fff', color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
};
