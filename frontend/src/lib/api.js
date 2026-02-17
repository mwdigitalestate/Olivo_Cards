import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// VCards API
export const vcardsAPI = {
  getAll: () => api.get('/vcards'),
  getOne: (id) => api.get(`/vcards/${id}`),
  create: (data) => api.post('/vcards', data),
  update: (id, data) => api.put(`/vcards/${id}`, data),
  delete: (id) => api.delete(`/vcards/${id}`),
  getPublic: (id) => api.get(`/vcard/${id}/public`),
};

// Plans API
export const plansAPI = {
  getAll: () => api.get('/plans'),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getCurrent: () => api.get('/subscriptions/current'),
  create: (data) => api.post('/subscriptions', data),
  cancel: () => api.post('/subscriptions/cancel'),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role?role=${role}`),
  getSubscriptions: () => api.get('/admin/subscriptions'),
  getSettings: () => api.get('/admin/settings'),
  updatePayPalSettings: (data) => api.put('/admin/settings/paypal', data),
};

// Public Settings API
export const settingsAPI = {
  getPayPalClientId: () => api.get('/settings/paypal-client-id'),
};

// Seed data
export const seedPlans = () => api.post('/seed-plans');

export default api;
