import api from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('cc_token', res.data.token);
      localStorage.setItem('cc_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('cc_token', res.data.token);
      localStorage.setItem('cc_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.user) {
      const current = JSON.parse(localStorage.getItem('cc_user') || '{}');
      localStorage.setItem('cc_user', JSON.stringify({ ...current, ...res.data.user }));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  },

  getCurrentUser() {
    const stored = localStorage.getItem('cc_user');
    return stored ? JSON.parse(stored) : null;
  },

  getToken() {
    return localStorage.getItem('cc_token');
  }
};
