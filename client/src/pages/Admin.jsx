import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Shield, Image } from 'lucide-react';
import axios from 'axios';

const ADMIN_KEY = '1234';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', headers: { 'x-admin-key': ADMIN_KEY } });

const CATEGORIES = ['ott', 'shopping', 'music', 'ai', 'food', 'game'];
const CATEGORY_LABELS = { ott: 'OTT', shopping: '쇼핑', music: '음악', ai: 'AI', food: '배달', game: '게임' };

const EMPTY = {
  name: '', category: 'ott', description: '', logo: '', color: '#5B4BDB',
  website: '', monthly_price: '', yearly_price: '', trial_days: 0, usability_score: 0, features: [],
};

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [expandedCat, setExpandedCat] = useState({});
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('services');
  const [cards, setCards] = useState([]);
  const [cardForm, setCardForm] = useState({ tag: '', title: '', description: '', bg: 'linear-gradient(135deg, #5B4BDB 0%, #7B6EE8 100%)', emoji: '🎯', link: '', sort_order: 0 });
  const [addingCard, setAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);

  const load = () => api.get('/api/admin/services').then(r => setServices(r.data));
  const loadCards = () => api.get('/api/carousel').then(r => setCards(r.data));

  useEffect(() => { if (authed) { load(); loadCards(); } }, [authed]);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2500); };

  const startEdit = (s) => {
    setAdding(false);
    setEditingId(s.id);
    setForm({ ...s, yearly_price: s.yearly_price || '', features: s.features || [] });
  };

  const saveEdit = async () => {
    await api.put(`/api/admin/services/${editingId}`, {
      ...form,
      monthly_price: Number(form.monthly_price),
      yearly_price: form.yearly_price ? Number(form.yearly_price) : null,
    });
    setEditingId(null);
    load();
    flash('저장되었습니다.');
  };

  const saveNew = async () => {
    await api.post('/api/admin/services', {
      ...form,
      monthly_price: Number(form.monthly_price),
      yearly_price: form.yearly_price ? Number(form.yearly_price) : null,
    });
    setAdding(false);
    setForm(EMPTY);
    load();
    flash('서비스가 추가되었습니다.');
  };

  const deleteService = async (id, name) => {
    if (!window.confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return;
    await api.delete(`/api/admin/services/${id}`);
    load();
    flash('삭제되었습니다.');
  };

  if (!authed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16 }}>
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: '40px 48px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', textAlign: 'center', minWidth: 320 }}>
          <Shield size={40} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>관리자 로그인</h2>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (pw === ADMIN_KEY ? setAuthed(true) : alert('비밀번호가 틀렸습니다.'))}
            placeholder="관리자 비밀번호"
            style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', marginBottom: 12, boxSizing: 'border-box' }}
          />
          <button onClick={() => pw === ADMIN_KEY ? setAuthed(true) : alert('비밀번호가 틀렸습니다.')}
            style={{ width: '100%', background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 15 }}>
            로그인
          </button>
        </div>
      </div>
    );
  }

  const EMPTY_CARD = { tag: '', title: '', description: '', bg: 'linear-gradient(135deg, #5B4BDB 0%, #7B6EE8 100%)', emoji: '🎯', link: '', sort_order: 0 };

  const saveNewCard = async () => {
    await api.post('/api/admin/carousel', cardForm);
    setAddingCard(false);
    setCardForm(EMPTY_CARD);
    loadCards();
    flash('카드가 추가되었습니다.');
  };

  const saveEditCard = async () => {
    await api.put(`/api/admin/carousel/${editingCardId}`, cardForm);
    setEditingCardId(null);
    loadCards();
    flash('저장되었습니다.');
  };

  const deleteCard = async (id) => {
    if (!window.confirm('카드를 삭제하시겠습니까?')) return;
    await api.delete(`/api/admin/carousel/${id}`);
    loadCards();
    flash('삭제되었습니다.');
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>🛠 관리자 페이지</h1>
        {tab === 'services' && (
          <button onClick={() => { setAdding(true); setEditingId(null); setForm(EMPTY); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 14 }}>
            <Plus size={16} /> 서비스 추가
          </button>
        )}
        {tab === 'carousel' && (
          <button onClick={() => { setAddingCard(true); setEditingCardId(null); setCardForm(EMPTY_CARD); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 14 }}>
            <Plus size={16} /> 카드 추가
          </button>
        )}
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ key: 'services', label: '구독 서비스' }, { key: 'carousel', label: '카드뉴스' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600,
            background: tab === t.key ? 'var(--primary)' : '#fff',
            color: tab === t.key ? '#fff' : 'var(--text-secondary)',
            border: '1px solid', borderColor: tab === t.key ? 'var(--primary)' : 'var(--border)',
          }}>{t.label}</button>
        ))}
      </div>

      {msg && (
        <div style={{ background: '#d4edda', color: '#155724', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontWeight: 600, fontSize: 14 }}>
          {msg}
        </div>
      )}

      {/* 카드뉴스 탭 */}
      {tab === 'carousel' && (
        <div>
          {addingCard && <CardForm form={cardForm} setForm={setCardForm} onSave={saveNewCard} onCancel={() => setAddingCard(false)} isNew />}
          {cards.map(card => (
            <div key={card.id}>
              {editingCardId === card.id ? (
                <CardForm form={cardForm} setForm={setCardForm} onSave={saveEditCard} onCancel={() => setEditingCardId(null)} />
              ) : (
                <div onClick={() => { setEditingCardId(card.id); setCardForm({ tag: card.tag, title: card.title, description: card.description, bg: card.bg, emoji: card.emoji, link: card.link || '', sort_order: card.sort_order }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 10, background: 'var(--card)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{card.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 20, padding: '2px 8px' }}>{card.tag}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>순서 {card.sort_order}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{card.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{card.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditingCardId(card.id); setCardForm({ tag: card.tag, title: card.title, description: card.description, bg: card.bg, emoji: card.emoji, link: card.link || '', sort_order: card.sort_order }); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
                      <Edit2 size={13} /> 수정
                    </button>
                    <button onClick={() => deleteCard(card.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
                      <Trash2 size={13} /> 삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 서비스 탭 */}
      {tab === 'services' && adding && <ServiceForm form={form} setForm={setForm} onSave={saveNew} onCancel={() => setAdding(false)} isNew />}

      {tab === 'services' && CATEGORIES.map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <button onClick={() => setExpandedCat(p => ({ ...p, [cat]: !p[cat] }))}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: expandedCat[cat] ? 0 : 0 }}>
            {CATEGORY_LABELS[cat]}
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, marginLeft: 4 }}>{grouped[cat].length}개</span>
            <span style={{ marginLeft: 'auto' }}>{expandedCat[cat] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
          </button>

          {(expandedCat[cat] ?? true) !== false && (
            <div style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              {grouped[cat].map(s => (
                <div key={s.id}>
                  {editingId === s.id ? (
                    <ServiceForm form={form} setForm={setForm} onSave={saveEdit} onCancel={() => setEditingId(null)} onDelete={() => { setEditingId(null); deleteService(s.id, s.name); }} />
                  ) : (
                    <div onClick={() => startEdit(s)} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 100px auto', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)', alignItems: 'center', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 8 }}>{s.logo}</span>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{Number(s.monthly_price).toLocaleString()}원/월</span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>무료체험 {s.trial_days}일</span>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => startEdit(s)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
                          <Edit2 size={13} /> 수정
                        </button>
                        <button onClick={() => deleteService(s.id, s.name)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
                          <Trash2 size={13} /> 삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {grouped[cat].length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
                  서비스가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceForm({ form, setForm, onSave, onCancel, onDelete, isNew }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const featStr = (form.features || []).join(', ');

  return (
    <div style={{ background: 'var(--primary-bg)', border: '1.5px solid var(--primary)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>{isNew ? '새 서비스 추가' : '서비스 수정'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="서비스명 *" value={form.name} onChange={v => set('name', v)} />
        <div>
          <label style={lStyle}>카테고리 *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
            {['ott', 'shopping', 'music', 'ai', 'food', 'game'].map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <Field label="월 구독료 (원) *" value={form.monthly_price} onChange={v => set('monthly_price', v)} type="number" />
        <Field label="연 구독료 (원)" value={form.yearly_price} onChange={v => set('yearly_price', v)} type="number" />
        <Field label="로고 키" value={form.logo} onChange={v => set('logo', v)} placeholder="예: netflix" />
        <div>
          <label style={lStyle}>색상</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ width: 42, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
            <input value={form.color} onChange={e => set('color', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
        </div>
        <Field label="웹사이트" value={form.website} onChange={v => set('website', v)} placeholder="https://" />
        <Field label="무료 체험 (일)" value={form.trial_days} onChange={v => set('trial_days', v)} type="number" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={lStyle}>설명</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
          style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>주요 기능 (쉼표로 구분)</label>
        <input value={featStr} onChange={e => set('features', e.target.value.split(',').map(f => f.trim()).filter(Boolean))}
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="예: 4K HDR, 오프라인 저장" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onSave} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14 }}>
          <Save size={15} /> {isNew ? '추가' : '저장'}
        </button>
        <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: 'var(--text-secondary)', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, border: '1px solid var(--border)' }}>
          <X size={15} /> 취소
        </button>
        {!isNew && onDelete && (
          <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEE2E2', color: '#DC2626', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, marginLeft: 'auto' }}>
            <Trash2 size={15} /> 삭제
          </button>
        )}
      </div>
    </div>
  );
}

function parseGradientColors(bg) {
  const matches = bg.match(/#[0-9A-Fa-f]{6}/g);
  return { c1: matches?.[0] || '#5B4BDB', c2: matches?.[1] || '#7B6EE8' };
}

function CardForm({ form, setForm, onSave, onCancel, isNew }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const { c1, c2 } = parseGradientColors(form.bg);

  const updateColor = (which, val) => {
    const next = which === 'c1'
      ? `linear-gradient(135deg, ${val} 0%, ${c2} 100%)`
      : `linear-gradient(135deg, ${c1} 0%, ${val} 100%)`;
    set('bg', next);
  };

  return (
    <div style={{ background: 'var(--primary-bg)', border: '1.5px solid var(--primary)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>{isNew ? '새 카드 추가' : '카드 수정'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="태그 (예: 이달의 추천)" value={form.tag} onChange={v => set('tag', v)} />
        <Field label="이모지" value={form.emoji} onChange={v => set('emoji', v)} />
        <Field label="제목" value={form.title} onChange={v => set('title', v)} />
        <Field label="순서" value={form.sort_order} onChange={v => set('sort_order', Number(v))} type="number" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={lStyle}>설명</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
          style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Field label="링크 (클릭 시 이동)" value={form.link} onChange={v => set('link', v)} placeholder="https://" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>배경 색상</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>시작색</span>
            <input type="color" value={c1} onChange={e => updateColor('c1', e.target.value)}
              style={{ width: 42, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
            <input value={c1} onChange={e => updateColor('c1', e.target.value)}
              style={{ ...inputStyle, width: 100 }} maxLength={7} />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: 18 }}>→</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>끝색</span>
            <input type="color" value={c2} onChange={e => updateColor('c2', e.target.value)}
              style={{ width: 42, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
            <input value={c2} onChange={e => updateColor('c2', e.target.value)}
              style={{ ...inputStyle, width: 100 }} maxLength={7} />
          </div>
        </div>
        <div style={{ height: 48, borderRadius: 10, background: form.bg }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onSave} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14 }}>
          <Save size={15} /> {isNew ? '추가' : '저장'}
        </button>
        <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: 'var(--text-secondary)', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, border: '1px solid var(--border)' }}>
          <X size={15} /> 취소
        </button>
      </div>
    </div>
  );
}

const lStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 5 };
const inputStyle = { border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#fff', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', width: '100%' };

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle} />
    </div>
  );
}
