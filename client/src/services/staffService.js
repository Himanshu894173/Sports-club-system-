import api from './api';

export const staffService = {
  async getEmployees(params = {}) {
    const res = await api.get('/staff', { params });
    return res.data;
  },

  async addEmployee(data) {
    const res = await api.post('/staff', data);
    return res.data;
  },

  async updateEmployee(id, data) {
    const res = await api.put(`/staff/${id}`, data);
    return res.data;
  },

  async getLeaves(params = {}) {
    const res = await api.get('/staff/leaves', { params });
    return res.data;
  },

  async applyLeave(data) {
    const res = await api.post('/staff/leaves', data);
    return res.data;
  },

  async updateLeaveStatus(id, status) {
    const res = await api.patch(`/staff/leaves/${id}`, { status });
    return res.data;
  }
};
