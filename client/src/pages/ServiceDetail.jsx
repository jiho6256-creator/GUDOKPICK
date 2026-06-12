import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, CheckCircle, Tag, MessageCircle, Send, TrendingUp, Pencil, Check, X } from 'lucide-react';
import { getService, postReview } from '../api';
import axios from 'axios';
import ServiceLogo from '../components/ServiceLogo';
import StarRating, { StarDisplay } from '../components/StarRating';

function PlatformBadge({ naverId }) {
  if (!naverId) return null;
  if (naverId.startsWith('google_')) return <span style={{ fontSize: 10, fontWeight: 800, background: '#9CA3AF', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>G</span>;
  if (naverId.startsWith('guest_')) return <span style={{ fontSize: 10, fontWeight: 800, background: '#9CA3AF', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>게스트</span>;
  return <span style={{ fontSize: 10, fontWeight: 800, background: '#03C75A', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 5 }}>N</span>;
}

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ nickname: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ nickname: '', rating: 0, comment: '' });
  const naverUser = (() => {
    const n = localStorage.getItem('naver_nickname');
    const i = localStorage.getItem('naver_id');
    return n && i ? { nickname: n, id: i } : null;
  })();

  useEffect(() => {
    if (naverUser) setReviewForm(f => ({ ...f, nickname: naverUser.nickname }));
  }, []);

  const load = () => {
    setLoading(true);
    getService(id).then(setService).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const alreadyReviewed = naverUser && service?.reviews?.some(r => r.naver_id === naverUser.id);

  const submitReview = async () => {
    if (!reviewForm.nickname || !reviewForm.rating) return;
    setSubmitting(true);
    try {
      const naverId = localStorage.getItem('naver_id');
      await postReview(id, { ...reviewForm, naver_id: naverId || undefined });
      setReviewForm({ nickname: naverUser?.nickname || '', rating: 0, comment: '' });
      setShowReviewForm(false);
      load();
    } catch (e) {
      if (e.response?.status === 409) alert('이미 이 서비스에 리뷰를 작성하셨습니다.');
      else alert('등록 중 오류가 발생했습니다: ' + (e.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px' }}>
      <div className="skeleton" style={{ height: 140, borderRadius: 16, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
      </div>
    </div>
  );

  if (!service) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>서비스를 찾을 수 없습니다.</div>;

  const rankScore = service.avg_rating > 0 ? service.avg_rating.toFixed(1) : '—';


  return (
    <div className="page-wrap">
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
        <ArrowLeft size={18} /> 목록으로 돌아가기
      </button>

      {/* Hero card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 36px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <ServiceLogo logo={service.logo} color={service.color} name={service.name} size={72} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{service.name}</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500 }}>{service.description}</p>
            {service.trial_days > 0 && (
              <span style={{ display: 'inline-block', marginTop: 10, background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 20, fontSize: 13, fontWeight: 700, padding: '4px 12px' }}>
                🎁 {service.trial_days}일 무료 체험
              </span>
            )}
          </div>
        </div>
        <a href={service.website} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary)',
          color: '#fff', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          <ExternalLink size={16} /> 구독하러 가기
        </a>
      </div>

      {/* Score bar */}
      <div className="score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'row', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ flex: 1, padding: '20px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>월 구독료</p>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{service.monthly_price.toLocaleString()}원</div>
          </div>
          {service.yearly_price && (
            <div style={{ flex: 1, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>연 구독료</p>
                {service.yearly_price <= service.monthly_price * 10 && (
                  <span style={{ fontSize: 10, fontWeight: 800, background: '#10B981', color: '#fff', borderRadius: 6, padding: '2px 6px' }}>BEST</span>
                )}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{service.yearly_price.toLocaleString()}원</div>
            </div>
          )}
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>유저 평점</p>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#FFB800', marginBottom: 4 }}>
            <Star size={16} fill="#FFB800" color="#FFB800" style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {rankScore}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>리뷰 {service.review_count}개 기반</p>
        </div>
      </div>

      <div>
          {/* Reviews */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '22px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageCircle size={18} color="var(--primary)" /> 유저 리뷰 ({service.review_count})
              </h3>
              {alreadyReviewed ? (
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>이미 리뷰를 작성하셨습니다</span>
              ) : naverUser ? (
                <button onClick={() => setShowReviewForm(!showReviewForm)} style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--primary)',
                  background: 'var(--primary-bg)', padding: '7px 14px', borderRadius: 20, border: '1px solid var(--primary)',
                }}>
                  {showReviewForm ? '취소' : '+ 리뷰 작성'}
                </button>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>로그인 후 리뷰를 작성할 수 있습니다</span>
              )}
            </div>

            {service.review_count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, padding: '14px', background: 'var(--bg)', borderRadius: 12 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{service.avg_rating}</span>
                <div>
                  <StarDisplay value={service.avg_rating} size={18} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>총 {service.review_count}개 리뷰 기준</p>
                </div>
              </div>
            )}

            {showReviewForm && (
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 18, marginBottom: 18 }}>
                <div className="review-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <input value={reviewForm.nickname} onChange={e => setReviewForm({ ...reviewForm, nickname: e.target.value })}
                      placeholder="닉네임" maxLength={20} readOnly={!!naverUser}
                      style={{ width: '100%', boxSizing: 'border-box', border: naverUser ? (localStorage.getItem('login_type') === 'naver' ? '1.5px solid #03C75A' : '1.5px solid #9CA3AF') : '1.5px solid var(--border)', borderRadius: 10, padding: naverUser ? '22px 14px 8px' : '10px 14px', fontSize: 14, background: naverUser ? 'var(--bg)' : '#fff', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
                    />
                    {naverUser && <span style={{ position: 'absolute', top: 7, left: 14, fontSize: 11, fontWeight: 700, color: localStorage.getItem('login_type') === 'naver' ? '#03C75A' : '#6B7280' }}>✓ {localStorage.getItem('login_type') === 'guest' ? '게스트' : localStorage.getItem('login_type') === 'google' ? '구글 로그인' : '네이버 로그인'}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>별점:</span>
                    <StarRating value={reviewForm.rating} onChange={v => setReviewForm({ ...reviewForm, rating: v })} size={26} />
                  </div>
                </div>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="리뷰를 작성해주세요 (선택)" maxLength={500} rows={3}
                  style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, resize: 'none', background: '#fff', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', marginBottom: 10 }}
                />
                <button onClick={submitReview} disabled={!reviewForm.nickname || !reviewForm.rating || submitting}
                  style={{
                    width: '100%', background: 'var(--primary)', color: '#fff',
                    borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14,
                    opacity: (!reviewForm.nickname || !reviewForm.rating) ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  <Send size={15} /> {submitting ? '제출 중...' : '리뷰 등록'}
                </button>
              </div>
            )}

            {service.reviews?.length === 0 && !showReviewForm && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px 0' }}>첫 리뷰를 작성해보세요!</p>
            )}
            {[...(service.reviews || [])].sort((a, b) => {
              if (naverUser?.nickname === a.nickname) return -1;
              if (naverUser?.nickname === b.nickname) return 1;
              return 0;
            }).map(r => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14, paddingLeft: 20 }}>
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{r.nickname}</span>
                      <PlatformBadge naverId={r.naver_id} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {editingReview === r.id
                        ? <StarRating value={editForm.rating} onChange={v => setEditForm({ ...editForm, rating: v })} size={18} />
                        : <StarDisplay value={r.rating} size={13} />}
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.created_at?.slice(0, 10)}</span>
                      {naverUser?.nickname === r.nickname && (editingReview === r.id ? <>
                        <button onClick={async () => {
                          if (!editForm.rating) return;
                          try {
                            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/reviews/${r.id}`, { ...editForm, nickname: r.nickname });
                            setEditingReview(null);
                            load();
                          } catch { alert('수정에 실패했습니다.'); }
                        }} style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--primary)', fontSize: 12, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--primary)', background: 'var(--primary-bg)' }}>
                          <Check size={11} /> 저장
                        </button>
                        <button onClick={() => setEditingReview(null)} style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-secondary)', fontSize: 12, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }}>
                          <X size={11} /> 취소
                        </button>
                      </> : <>
                        <button onClick={() => { setEditingReview(r.id); setEditForm({ nickname: naverUser.nickname, rating: r.rating, comment: r.comment || '' }); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-secondary)', fontSize: 12, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }}>
                          <Pencil size={11} /> 수정
                        </button>
                        <button onClick={async () => {
                          if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;
                          await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/reviews/${r.id}`, { data: { nickname: naverUser.nickname } });
                          load();
                        }} style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#DC2626', fontSize: 12, padding: '2px 6px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2' }}>
                          <X size={11} /> 삭제
                        </button>
                      </>)}
                    </div>
                  </div>
                  {editingReview === r.id
                    ? <textarea value={editForm.comment} onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                        maxLength={500} rows={2} autoFocus
                        style={{ width: '100%', border: '1.5px solid var(--primary)', borderRadius: 8, padding: '8px 10px', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: 'var(--text)' }} />
                    : r.comment && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>}
                </>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
