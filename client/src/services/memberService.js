import api from './api';

export const memberService = {
  async getMembers(params = {}) {
    const res = await api.get('/members', { params });
    return res.data;
  },

  async getPlans() {
    const res = await api.get('/members/plans');
    return res.data;
  },

  async getMemberById(id) {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },

  async addMember(data) {
    const res = await api.post('/members', data);
    return res.data;
  },

  async updateMember(id, data) {
    const res = await api.put(`/members/${id}`, data);
    return res.data;
  },

  async renewMembership(id, data) {
    const res = await api.post(`/members/${id}/renew`, data);
    return res.data;
  },

  async toggleStatus(id) {
    const res = await api.patch(`/members/${id}/status`);
    return res.data;
  }
};
