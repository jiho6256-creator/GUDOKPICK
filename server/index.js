const express = require('express');
const cors = require('cors');
const db = require('./db');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// GET all services (with avg rating)
app.get('/api/services', (req, res) => {
  const { category, sort } = req.query;

  let query = `
    SELECT s.*,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as review_count
    FROM services s
    LEFT JOIN reviews r ON s.id = r.service_id
  `;
  const params = [];

  if (category && category !== 'all') {
    query += ' WHERE s.category = ?';
    params.push(category);
  }

  query += ' GROUP BY s.id';

  if (sort === 'price_asc') query += ' ORDER BY s.monthly_price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY s.monthly_price DESC';
  else if (sort === 'rating') query += ' ORDER BY avg_rating DESC';
  else if (sort === 'rank') query += ' ORDER BY (avg_rating * 0.4 + s.usability_score * 0.4 + (5.0 - s.monthly_price / 10000.0) * 0.2) DESC';
  else query += ' ORDER BY s.id ASC';

  const services = db.prepare(query).all(...params);
  res.json(services.map(s => ({
    ...s,
    features: JSON.parse(s.features || '[]'),
    avg_rating: Math.round(s.avg_rating * 10) / 10,
  })));
});

// GET single service
app.get('/api/services/:id', (req, res) => {
  const service = db.prepare(`
    SELECT s.*,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as review_count
    FROM services s
    LEFT JOIN reviews r ON s.id = r.service_id
    WHERE s.id = ?
    GROUP BY s.id
  `).get(req.params.id);

  if (!service) return res.status(404).json({ error: 'Not found' });

  const reviews = db.prepare('SELECT * FROM reviews WHERE service_id = ? ORDER BY created_at DESC').all(req.params.id);
  const promotions = db.prepare('SELECT * FROM promotions WHERE service_id = ?').all(req.params.id);

  res.json({
    ...service,
    features: JSON.parse(service.features || '[]'),
    avg_rating: Math.round(service.avg_rating * 10) / 10,
    reviews,
    promotions,
  });
});

// POST review
app.post('/api/services/:id/reviews', (req, res) => {
  const { nickname, rating, comment, naver_id } = req.body;
  if (!nickname || !rating) return res.status(400).json({ error: 'nickname and rating required' });
  if (rating < 0.5 || rating > 5) return res.status(400).json({ error: 'rating must be 0.5-5' });
  if (naver_id) {
    const existing = db.prepare('SELECT id FROM reviews WHERE service_id = ? AND naver_id = ?').get(req.params.id, naver_id);
    if (existing) return res.status(409).json({ error: 'already reviewed' });
  }

  const result = db.prepare(
    'INSERT INTO reviews (service_id, nickname, naver_id, rating, comment) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, nickname.slice(0, 20), naver_id || null, Number(rating), (comment || '').slice(0, 500));

  res.json({ id: result.lastInsertRowid });
});

// PUT update review
app.put('/api/reviews/:id', (req, res) => {
  const { nickname, rating, comment } = req.body;
  if (!nickname || !rating) return res.status(400).json({ error: 'nickname and rating required' });
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Not found' });
  if (review.nickname !== nickname) return res.status(403).json({ error: 'nickname mismatch' });
  db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?')
    .run(Number(rating), (comment || '').slice(0, 300), req.params.id);
  res.json({ ok: true });
});

// DELETE all reviews (admin)
app.delete('/api/admin/reviews/all', adminAuth, (req, res) => {
  db.prepare('DELETE FROM reviews').run();
  res.json({ ok: true });
});

// DELETE review (nickname 확인)
app.delete('/api/reviews/:id', (req, res) => {
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: 'nickname required' });
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Not found' });
  if (review.nickname !== nickname) return res.status(403).json({ error: 'nickname mismatch' });
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// GET promotions
app.get('/api/promotions', (req, res) => {
  const promos = db.prepare(`
    SELECT p.*, s.name as service_name, s.category, s.logo, s.color
    FROM promotions p
    JOIN services s ON p.service_id = s.id
    ORDER BY p.id ASC
  `).all();
  res.json(promos);
});

// GET ranking
app.get('/api/ranking', (req, res) => {
  const { category } = req.query;
  let query = `
    SELECT s.*,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as review_count,
      ROUND(
        (COALESCE(AVG(r.rating), 0) * 0.4 + s.usability_score * 0.4 + MAX(0, (5.0 - s.monthly_price / 10000.0)) * 0.2),
        2
      ) as rank_score
    FROM services s
    LEFT JOIN reviews r ON s.id = r.service_id
  `;
  const params = [];
  if (category && category !== 'all') {
    query += ' WHERE s.category = ?';
    params.push(category);
  }
  query += ' GROUP BY s.id ORDER BY rank_score DESC LIMIT 20';

  const services = db.prepare(query).all(...params);
  res.json(services.map(s => ({
    ...s,
    features: JSON.parse(s.features || '[]'),
    avg_rating: Math.round(s.avg_rating * 10) / 10,
  })));
});

// ── Community API ──────────────────────────────────────────
// GET posts list
app.get('/api/posts', (req, res) => {
  const { category } = req.query;
  let query = `
    SELECT p.*,
      COUNT(DISTINCT c.id) as comment_count,
      COUNT(DISTINCT l.id) as like_count
    FROM posts p
    LEFT JOIN post_comments c ON p.id = c.post_id
    LEFT JOIN post_likes l ON p.id = l.post_id
  `;
  const params = [];
  if (category && category !== 'all') {
    query += ' WHERE p.category = ?';
    params.push(category);
  }
  query += ' GROUP BY p.id ORDER BY p.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// GET single post
app.get('/api/posts/:id', (req, res) => {
  db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);
  const post = db.prepare(`
    SELECT p.*, COUNT(DISTINCT l.id) as like_count
    FROM posts p
    LEFT JOIN post_likes l ON p.id = l.post_id
    WHERE p.id = ?
    GROUP BY p.id
  `).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  const comments = db.prepare('SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ ...post, comments });
});

// POST create post
app.post('/api/posts', (req, res) => {
  const { nickname, title, content, category, naver_id } = req.body;
  if (!nickname || !title || !content) return res.status(400).json({ error: 'nickname, title, content required' });
  const result = db.prepare(
    'INSERT INTO posts (nickname, naver_id, title, content, category) VALUES (?, ?, ?, ?, ?)'
  ).run(nickname.slice(0, 20), naver_id || null, title.slice(0, 100), content.slice(0, 2000), category || 'general');
  res.json({ id: result.lastInsertRowid });
});

// POST comment
app.post('/api/posts/:id/comments', (req, res) => {
  const { nickname, content, naver_id } = req.body;
  if (!nickname || !content) return res.status(400).json({ error: 'nickname, content required' });
  const result = db.prepare(
    'INSERT INTO post_comments (post_id, nickname, naver_id, content) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, nickname.slice(0, 20), naver_id || null, content.slice(0, 500));
  res.json({ id: result.lastInsertRowid });
});

// POST like / unlike (toggle)
app.post('/api/posts/:id/like', (req, res) => {
  const { client_id } = req.body;
  if (!client_id) return res.status(400).json({ error: 'client_id required' });
  const existing = db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND client_id = ?').get(req.params.id, client_id);
  if (existing) {
    db.prepare('DELETE FROM post_likes WHERE post_id = ? AND client_id = ?').run(req.params.id, client_id);
    const count = db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?').get(req.params.id).c;
    return res.json({ liked: false, count });
  } else {
    db.prepare('INSERT INTO post_likes (post_id, client_id) VALUES (?, ?)').run(req.params.id, client_id);
    const count = db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?').get(req.params.id).c;
    return res.json({ liked: true, count });
  }
});

// DELETE post (admin)
app.delete('/api/posts/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM post_comments WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Admin API ──────────────────────────────────────────────
const ADMIN_KEY = process.env.ADMIN_KEY || '1234';

function adminAuth(req, res, next) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// GET all services (admin — no join needed for editing)
app.get('/api/admin/services', adminAuth, (req, res) => {
  const services = db.prepare('SELECT * FROM services ORDER BY category, id').all();
  res.json(services.map(s => ({ ...s, features: JSON.parse(s.features || '[]') })));
});

// POST create service
app.post('/api/admin/services', adminAuth, (req, res) => {
  const { name, category, description, logo, color, website, monthly_price, yearly_price, trial_days, usability_score, features } = req.body;
  if (!name || !category || !monthly_price) return res.status(400).json({ error: 'name, category, monthly_price required' });
  const result = db.prepare(`
    INSERT INTO services (name, category, description, logo, color, website, monthly_price, yearly_price, trial_days, usability_score, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, category, description || '', logo || '', color || '#888', website || '', Number(monthly_price), yearly_price ? Number(yearly_price) : null, Number(trial_days || 0), Number(usability_score || 0), JSON.stringify(features || []));
  res.json({ id: result.lastInsertRowid });
});

// PUT update service
app.put('/api/admin/services/:id', adminAuth, (req, res) => {
  const { name, category, description, logo, color, website, monthly_price, yearly_price, trial_days, usability_score, features } = req.body;
  db.prepare(`
    UPDATE services SET name=?, category=?, description=?, logo=?, color=?, website=?, monthly_price=?, yearly_price=?, trial_days=?, usability_score=?, features=?
    WHERE id=?
  `).run(name, category, description || '', logo || '', color || '#888', website || '', Number(monthly_price), yearly_price ? Number(yearly_price) : null, Number(trial_days || 0), Number(usability_score || 0), JSON.stringify(features || []), req.params.id);
  res.json({ ok: true });
});

// ── Carousel API ──────────────────────────────────────────────
app.get('/api/carousel', (req, res) => {
  res.json(db.prepare('SELECT * FROM carousel_cards ORDER BY sort_order ASC').all());
});

app.post('/api/admin/carousel', adminAuth, (req, res) => {
  const { tag, title, description, bg, emoji, link, sort_order } = req.body;
  if (!tag || !title || !description || !bg || !emoji) return res.status(400).json({ error: 'All fields required' });
  const result = db.prepare('INSERT INTO carousel_cards (tag, title, description, bg, emoji, link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)').run(tag, title, description, bg, emoji, link || '', sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/carousel/:id', adminAuth, (req, res) => {
  const { tag, title, description, bg, emoji, link, sort_order } = req.body;
  db.prepare('UPDATE carousel_cards SET tag=?, title=?, description=?, bg=?, emoji=?, link=?, sort_order=? WHERE id=?').run(tag, title, description, bg, emoji, link || '', sort_order || 0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/admin/carousel/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM carousel_cards WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// DELETE service
app.delete('/api/admin/services/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE service_id = ?').run(req.params.id);
  db.prepare('DELETE FROM promotions WHERE service_id = ?').run(req.params.id);
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Naver OAuth ──────────────────────────────────────────────
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || 'uN9fdPdJAEJaccJbKpvD';
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || 'alO3KS19DV';
const CLIENT_URL = process.env.CLIENT_URL || 'https://gudokpick.vercel.app';

app.get('/auth/naver', (req, res) => {
  const state = Math.random().toString(36).substring(2);
  const callbackUrl = `https://gudokpick.onrender.com/auth/naver/callback`;
  const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`;
  res.redirect(url);
});

app.get('/auth/naver/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenRes = await axios.get('https://nid.naver.com/oauth2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code,
        state,
      },
    });
    const accessToken = tokenRes.data.access_token;
    const profileRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { nickname, id } = profileRes.data.response;
    const displayName = nickname || `naver_${id.slice(0, 8)}`;
    res.redirect(`${CLIENT_URL}?naver_nickname=${encodeURIComponent(displayName)}&naver_id=${encodeURIComponent(id)}`);
  } catch (e) {
    res.redirect(`${CLIENT_URL}?naver_error=1`);
  }
});

// ── Google OAuth ──────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK = 'https://gudokpick.onrender.com/auth/google/callback';

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK,
      grant_type: 'authorization_code',
    });
    const accessToken = tokenRes.data.access_token;
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { name, id } = profileRes.data;
    const displayName = name || `google_${id.slice(0, 8)}`;
    res.redirect(`${CLIENT_URL}?naver_nickname=${encodeURIComponent(displayName)}&naver_id=${encodeURIComponent('google_' + id)}&login_type=google`);
  } catch (e) {
    res.redirect(`${CLIENT_URL}?login_error=1`);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
