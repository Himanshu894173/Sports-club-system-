import api from './api';

export const leadService = {
  async getLeads(params = {}) {
    const res = await api.get('/leads', { params });
    return res.data;
  },

  async createLead(data) {
    const res = await api.post('/leads', data);
    return res.data;
  },

  async updateLead(id, data) {
    const res = await api.put(`/leads/${id}`, data);
    return res.data;
  },

  async convertToMember(id) {
    const res = await api.post(`/leads/${id}/convert`);
    return res.data;
  }
};
