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
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (email, new_password) => api.post('/auth/reset-password', { email, new_password }),
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

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Plans API
export const plansAPI = {
  getAll: () => api.get('/plans'),
  getOne: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getCurrent: () => api.get('/subscriptions/current'),
  create: (data) => api.post('/subscriptions', data),
  cancel: () => api.post('/subscriptions/cancel'),
  cancelRecurring: () => api.post('/subscriptions/cancel-recurring'),
  // PayPal recurring subscriptions
  createPayPalSubscription: (data) => api.post('/subscriptions/paypal/create', data),
  activatePayPalSubscription: (paypal_subscription_id, plan_id) => 
    api.post(`/subscriptions/paypal/activate?paypal_subscription_id=${paypal_subscription_id}&plan_id=${plan_id}`),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role?role=${role}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getSubscriptions: () => api.get('/admin/subscriptions'),
  getSettings: () => api.get('/admin/settings'),
  updatePayPalSettings: (data) => api.put('/admin/settings/paypal', data),
  getEmailSettings: () => api.get('/admin/settings/email'),
  updateEmailSettings: (data) => api.put('/admin/settings/email', data),
  testEmail: () => api.post('/admin/test-email'),
  checkExpiringSubscriptions: () => api.post('/admin/check-expiring-subscriptions'),
  // PayPal plan sync
  syncPlanWithPayPal: (planId) => api.post('/admin/paypal/sync-plan', { plan_id: planId }),
  syncAllPlansWithPayPal: () => api.post('/admin/paypal/sync-all-plans'),
  resetAllPayPalPlans: () => api.post('/admin/paypal/reset-all-plans'),
};

// Public Settings API
export const settingsAPI = {
  getPayPalClientId: () => api.get('/settings/paypal-client-id'),
};

// Seed data
export const seedPlans = () => api.post('/seed-plans');

export default api;
