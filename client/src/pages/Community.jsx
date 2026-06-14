import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Eye, Send, PenSquare, Clock, ThumbsUp } from 'lucide-react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' });

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'deal', label: '진행 중인 프로모션' },
  { key: 'general', label: '자유' },
];

const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function getChosung(str) {
  return [...str].map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch;
    return CHOSUNG[Math.floor(code / 588)];
  }).join('');
}
function matchChosung(name, query) {
  if (!query) return true;
  const isChosung = [...query].every(ch => CHOSUNG.includes(ch));
  if (isChosung) return getChosung(name).startsWith(query);
  if (query.length < 2) return false;
  return name.toLowerCase().includes(query.toLowerCase());
}

function DateInput({ value, onChange, inputStyle, placeholder = 'YY.MM.DD' }) {
  const [text, setText] = useState('');
  const dateRef = useRef(null);

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setText(`${y.slice(2)}.${m}.${d}`);
    } else {
      setText('');
    }
  }, [value]);

  const handleChange = (e) => {
    let v = e.target.value.replace(/[^0-9.]/g, '');
    // auto-insert dots
    v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{2})(\d)/, '$1.$2');
    if (v.length > 8) v = v.slice(0, 8);
    setText(v);

    const parts = v.split('.');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 2) {
      const year = parseInt(parts[0]) >= 0 ? `20${parts[0]}` : parts[0];
      const iso = `${year}-${parts[1]}-${parts[2]}`;
      if (!isNaN(new Date(iso).getTime())) onChange(iso);
    } else if (v === '') {
      onChange('');
    }
  };

  const handleDatePick = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      <input
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={8}
        style={{ ...inputStyle, flex: 1, border: 'none', outline: 'none', margin: 0, borderRadius: 0, background: 'transparent' }}
      />
      <button type="button" onClick={() => dateRef.current?.showPicker?.()}
        style={{ padding: '0 10px', color: 'var(--text-secondary)', fontSize: 16, flexShrink: 0 }}>📅</button>
      <input ref={dateRef} type="date" value={value} onChange={handleDatePick}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
    </div>
  );
}

function ServiceSearchSelect({ services, value, onChange, inputStyle }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sorted = [...services].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const filtered = sorted.filter(s => matchChosung(s.name, query));

  const select = (name) => { onChange(name); setQuery(''); setOpen(false); };
  const clear = () => { onChange(''); setQuery(''); setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); };

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <input
          ref={inputRef}
          value={value ? value : query}
          onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true); }}
          onFocus={() => { if (!value) setOpen(true); }}
          onClick={() => { if (value) setOpen(true); }}
          placeholder="서비스 검색 또는 선택"
          readOnly={!!value}
          style={{ ...inputStyle, flex: 1, border: 'none', outline: 'none', margin: 0, borderRadius: 0, background: 'transparent', cursor: 'pointer' }}
        />
        {value
          ? <button onClick={clear} style={{ padding: '0 12px', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 700 }}>×</button>
          : <span onClick={() => setOpen(v => !v)} style={{ padding: '0 12px', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>▼</span>
        }
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
          {(value ? sorted : filtered).length === 0
            ? <div style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>검색 결과 없음</div>
            : (value ? sorted : filtered).map(s => (
              <div key={s.id} onMouseDown={() => select(s.name)}
                style={{ padding: '10px 16px', fontSize: 14, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                {s.name}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

function sanitizeHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('script,style,iframe,object,embed').forEach(el => el.remove());
  tmp.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith('on') || (attr.name === 'href' && /^javascript/i.test(attr.value))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return tmp.innerHTML;
}

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
  const [form, setForm] = useState({ nickname: '', title: '', content: '', category: 'general', service_name: '', discount_rate: '', promo_start: '', promo_end: '' });
  const [submitting, setSubmitting] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [services, setServices] = useState([]);
  const [naverUser, setNaverUser] = useState(getNaverUser);
  const editorRef = useRef(null);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'jaeezkgh');
    const res = await fetch('https://api.cloudinary.com/v1_1/dazyzaeda/image/upload', { method: 'POST', body: data });
    const json = await res.json();
    return json.secure_url;
  };

  const insertImage = async (file) => {
    setImgUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;height:auto;display:block;margin:4px 0;resize:both;overflow:auto;" />`);
    } finally {
      setImgUploading(false);
    }
  };

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
    const content = editorRef.current?.innerHTML || '';
    if (!form.nickname || !form.title || !content) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/posts', { ...form, content, service_tag: form.service_name || null, naver_id: naverUser?.id || null });
      setShowForm(false);
      setForm({ nickname: '', title: '', content: '', category: 'general', service_name: '', discount_rate: '', promo_start: '', promo_end: '' });
      if (editorRef.current) editorRef.current.innerHTML = '';
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>새 게시글 작성</h3>
            <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--primary)', color: '#fff', borderRadius: 20, padding: '3px 12px' }}>
              {form.category === 'deal' ? '진행 중' : '자유'}
            </span>
          </div>
          {form.category === 'deal' && (
            <>
            <ServiceSearchSelect
              services={services}
              value={form.service_name}
              onChange={v => setForm({ ...form, service_name: v })}
              inputStyle={inputStyle}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>할인율</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                  <input type="number" min="1" max="100" value={form.discount_rate} onChange={e => setForm({ ...form, discount_rate: e.target.value })}
                    placeholder="30" className="no-spinner" style={{ ...inputStyle, flex: 1, border: 'none', outline: 'none', margin: 0, borderRadius: 0, background: 'transparent', width: 0, textAlign: 'right', MozAppearance: 'textfield' }} />
                  <span style={{ padding: '0 10px', fontSize: 13, color: 'var(--text-secondary)' }}>%</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>시작일</label>
                <DateInput value={form.promo_start} onChange={v => setForm({ ...form, promo_start: v })} inputStyle={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>종료일</label>
                <DateInput value={form.promo_end} onChange={v => setForm({ ...form, promo_end: v })} inputStyle={inputStyle} />
              </div>
            </div>
            </>
          )}
          <div style={{ marginBottom: 10, position: 'relative' }}>
            <input value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })}
              placeholder="닉네임" maxLength={20} readOnly={!!naverUser}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', background: naverUser ? 'var(--bg)' : '#fff', border: naverUser ? (naverUser.type === 'naver' ? '1.5px solid #03C75A' : '1.5px solid #4B5563') : '1.5px solid var(--border)', padding: naverUser ? '22px 14px 8px' : '10px 14px' }} />
            {naverUser && <span style={{ position: 'absolute', top: 7, left: 14, fontSize: 11, fontWeight: 700, color: naverUser.type === 'naver' ? '#03C75A' : '#4B5563' }}>✓ {naverUser.type === 'guest' ? '게스트' : naverUser.type === 'google' ? '구글 로그인' : '네이버 로그인'}</span>}
          </div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="제목" maxLength={100}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: 10 }} />
          {/* 에디터 툴바 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: imgUploading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', opacity: imgUploading ? 0.6 : 1 }}>
              🖼️ {imgUploading ? '업로드 중...' : '이미지 삽입'}
              <input type="file" accept="image/*" disabled={imgUploading} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) insertImage(f); e.target.value = ''; }} />
            </label>
          </div>
          {/* contentEditable 에디터 */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="내용을 입력해주세요"
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', minHeight: 120, outline: 'none', resize: 'vertical', overflow: 'auto', marginBottom: 12, lineHeight: 1.7, wordBreak: 'break-word' }}
            className="post-editor"
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submit} disabled={!form.nickname || !form.title || (form.category === 'deal' && !form.service_name) || submitting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, opacity: (!form.nickname || !form.title || (form.category === 'deal' && !form.service_name)) ? 0.5 : 1 }}>
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
                {p.service_tag && <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', flexShrink: 0 }}>[{p.service_tag}]</span>}
                {p.category === 'deal'
                  ? (p.promo_end && new Date(p.promo_end) < new Date()
                    ? <span style={{ fontSize: 11, fontWeight: 700, background: '#9CA3AF', color: '#fff', borderRadius: 6, padding: '2px 8px' }}>종료됨</span>
                    : <span style={{ fontSize: 11, fontWeight: 700, background: categoryColor(p.category), color: '#fff', borderRadius: 6, padding: '2px 8px' }}>진행 중</span>)
                  : <span style={{ fontSize: 11, fontWeight: 700, background: categoryColor(p.category), color: '#fff', borderRadius: 6, padding: '2px 8px' }}>{CATEGORIES.find(c => c.key === p.category)?.label || p.category}</span>
                }
                {p.discount_rate && <span style={{ fontSize: 11, fontWeight: 700, background: '#EF4444', color: '#fff', borderRadius: 6, padding: '2px 8px' }}>🔥 {p.discount_rate}% 할인</span>}
                {p.category === 'deal' && p.promo_end && !(new Date(p.promo_end) < new Date()) && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }}>~{p.promo_end}</span>
                )}
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
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', discount_rate: '', promo_start: '', promo_end: '', service_tag: '' });
  const [services, setServices] = useState([]);
  const [editImgUploading, setEditImgUploading] = useState(false);
  const editEditorRef = useRef(null);

  useEffect(() => {
    api.get('/api/services').then(r => setServices(r.data)).catch(() => {});
  }, []);

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

  const startEdit = (p) => {
    setEditForm({ title: p.title, content: p.content, discount_rate: p.discount_rate || '', promo_start: p.promo_start || '', promo_end: p.promo_end || '', service_tag: p.service_tag || '' });
    setEditing(true);
    setTimeout(() => { if (editEditorRef.current) editEditorRef.current.innerHTML = p.content || ''; }, 0);
  };

  const saveEdit = async () => {
    const content = editEditorRef.current?.innerHTML || editForm.content;
    await api.put(`/api/posts/${id}`, { ...editForm, content, naver_id: naverUser?.id });
    setEditing(false);
    load();
  };

  const insertEditImage = async (file) => {
    setEditImgUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'jaeezkgh');
      const res = await fetch('https://api.cloudinary.com/v1_1/dazyzaeda/image/upload', { method: 'POST', body: data });
      const json = await res.json();
      editEditorRef.current?.focus();
      document.execCommand('insertHTML', false, `<img src="${json.secure_url}" style="max-width:100%;height:auto;display:block;margin:4px 0;resize:both;overflow:auto;" />`);
    } finally {
      setEditImgUploading(false);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {post.category === 'deal'
            ? (post.promo_end && new Date(post.promo_end) < new Date()
              ? <span style={{ fontSize: 11, fontWeight: 700, background: '#9CA3AF', color: '#fff', borderRadius: 6, padding: '2px 8px' }}>종료됨</span>
              : <span style={{ fontSize: 11, fontWeight: 700, background: categoryColor(post.category), color: '#fff', borderRadius: 6, padding: '2px 8px' }}>진행 중</span>)
            : <span style={{ fontSize: 11, fontWeight: 700, background: categoryColor(post.category), color: '#fff', borderRadius: 6, padding: '2px 8px' }}>{CATEGORIES.find(c => c.key === post.category)?.label || post.category}</span>
          }
          {!editing && post.discount_rate && <span style={{ fontSize: 11, fontWeight: 700, background: '#EF4444', color: '#fff', borderRadius: 6, padding: '2px 8px' }}>🔥 {post.discount_rate}% 할인</span>}
          {!editing && post.category === 'deal' && (post.promo_start || post.promo_end) && !(post.promo_end && new Date(post.promo_end) < new Date()) && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }}>
              📅 {post.promo_start || '?'} ~ {post.promo_end || '?'}
            </span>
          )}
          {naverUser?.id === post.naver_id && !editing && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button onClick={() => startEdit(post)} style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--primary)', borderRadius: 6, padding: '2px 10px', background: 'var(--primary-bg)' }}>수정</button>
              <button onClick={async () => {
                if (!confirm('게시글을 삭제할까요?')) return;
                const isAdmin = naverUser.id === 'guest_adm_v8r3kx92mw';
                await api.delete(`/api/posts/${post.id}`, { headers: {
                  'x-naver-id': naverUser.id,
                  ...(isAdmin ? { 'x-admin-key': import.meta.env.VITE_ADMIN_KEY || '1234' } : {}),
                }});
                navigate('/community');
              }} style={{ fontSize: 12, color: '#EF4444', fontWeight: 700, border: '1px solid #EF4444', borderRadius: 6, padding: '2px 10px', background: '#FEF2F2' }}>삭제</button>
            </div>
          )}
        </div>

        {editing ? (
          <div>
            <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 16, fontWeight: 700, marginBottom: 10, fontFamily: 'inherit' }} />
            {post.category === 'deal' && (
              <>
              <ServiceSearchSelect
                services={services}
                value={editForm.service_tag}
                onChange={v => setEditForm({ ...editForm, service_tag: v })}
                inputStyle={{ padding: '10px 14px', fontSize: 13, fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input type="number" min="1" max="100" value={editForm.discount_rate} onChange={e => setEditForm({ ...editForm, discount_rate: e.target.value })}
                  placeholder="할인율 (%)" className="no-spinner" style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 10, outline: 'none', padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', textAlign: 'right', MozAppearance: 'textfield' }} />
                <DateInput value={editForm.promo_start} onChange={v => setEditForm({ ...editForm, promo_start: v })} inputStyle={{ padding: '8px 12px', fontSize: 13, fontFamily: 'inherit' }} />
                <DateInput value={editForm.promo_end} onChange={v => setEditForm({ ...editForm, promo_end: v })} inputStyle={{ padding: '8px 12px', fontSize: 13, fontFamily: 'inherit' }} />
              </div>
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: editImgUploading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', opacity: editImgUploading ? 0.6 : 1 }}>
                🖼️ {editImgUploading ? '업로드 중...' : '이미지 삽입'}
                <input type="file" accept="image/*" disabled={editImgUploading} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) insertEditImage(f); e.target.value = ''; }} />
              </label>
            </div>
            <div
              ref={editEditorRef}
              contentEditable
              suppressContentEditableWarning
              style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 15, minHeight: 140, outline: 'none', resize: 'vertical', overflow: 'auto', marginBottom: 12, fontFamily: 'inherit', lineHeight: 1.7, wordBreak: 'break-word' }}
              className="post-editor"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveEdit} style={{ background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '9px 20px', fontWeight: 700, fontSize: 14 }}>저장</button>
              <button onClick={() => setEditing(false)} style={{ background: '#fff', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 20px', fontWeight: 700, fontSize: 14 }}>취소</button>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14, lineHeight: 1.4 }}>
              {post.service_tag && <span style={{ color: 'var(--text)', marginRight: 6 }}>[{post.service_tag}]</span>}{post.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, color: 'var(--text-secondary)' }}>{post.nickname}<PlatformBadge naverId={post.naver_id} /></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={12} />{timeAgo(post.created_at)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={12} />{post.view_count}</span>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text)', marginBottom: 28, wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
          </>
        )}

        {/* 추천 버튼 */}
        {!editing && <div style={{ display: 'flex', justifyContent: 'center' }}>
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
        </div>}
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
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', background: naverUser ? 'var(--bg)' : '#fff', border: naverUser ? (naverUser.type === 'naver' ? '1.5px solid #03C75A' : '1.5px solid #4B5563') : '1.5px solid var(--border)', padding: naverUser ? '22px 14px 8px' : '10px 14px' }} />
            {naverUser && <span style={{ position: 'absolute', top: 7, left: 14, fontSize: 11, fontWeight: 700, color: naverUser.type === 'naver' ? '#03C75A' : '#4B5563' }}>✓ {naverUser.type === 'guest' ? '게스트' : naverUser.type === 'google' ? '구글 로그인' : '네이버 로그인'}</span>}
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
  if (naverId.startsWith('google_')) return <span style={{ fontSize: 10, fontWeight: 800, background: '#4B5563', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>G</span>;
  if (naverId.startsWith('guest_')) return null;
  return <span style={{ fontSize: 10, fontWeight: 800, background: '#03C75A', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>N</span>;
}

function categoryColor(cat) {
  return { general: '#8B5CF6', deal: '#F59E0B' }[cat] || '#8B5CF6';
}

const inputStyle = {
  border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px',
  fontSize: 14, background: '#fff', color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
};
