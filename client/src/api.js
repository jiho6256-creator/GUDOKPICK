import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL: BASE });

export const getServices = (params) => api.get('/api/services', { params }).then(r => r.data);
export const getService = (id) => api.get(`/api/services/${id}`).then(r => r.data);
export const postReview = (id, data) => api.post(`/api/services/${id}/reviews`, data).then(r => r.data);
export const getPromotions = () => api.get('/api/promotions').then(r => r.data);
export const getRanking = (params) => api.get('/api/ranking', { params }).then(r => r.data);
