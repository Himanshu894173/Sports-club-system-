import api from './api';

export const financeService = {
  async getDashboardStats(params = {}) {
    const res = await api.get('/finance/dashboard', { params });
    return res.data;
  },

  async getTransactions(params = {}) {
    const res = await api.get('/finance/transactions', { params });
    return res.data;
  },

  async getInvoice(id) {
    const res = await api.get(`/finance/invoices/${id}`);
    return res.data;
  },

  async getCorporateClients() {
    const res = await api.get('/finance/corporate');
    return res.data;
  },

  async addExpense(data) {
    const res = await api.post('/finance/expenses', data);
    return res.data;
  }
};

export const dashboardService = financeService;
