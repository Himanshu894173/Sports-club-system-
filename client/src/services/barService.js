import api from './api';

export const barService = {
  // Menu
  async getMenu(params = {}) {
    const res = await api.get('/bar/menu', { params });
    return res.data;
  },

  async createMenuItem(data) {
    const res = await api.post('/bar/menu', data);
    return res.data;
  },

  async updateMenuItem(id, data) {
    const res = await api.put(`/bar/menu/${id}`, data);
    return res.data;
  },

  async deleteMenuItem(id) {
    const res = await api.delete(`/bar/menu/${id}`);
    return res.data;
  },

  async updateStock(id, data) {
    const res = await api.patch(`/bar/menu/${id}/stock`, data);
    return res.data;
  },

  // Tables
  async getTables() {
    const res = await api.get('/bar/tables');
    return res.data;
  },

  async updateTableStatus(id, status) {
    const res = await api.patch(`/bar/tables/${id}/status`, { status });
    return res.data;
  },

  async transferTable(id, targetTableId) {
    const res = await api.post(`/bar/tables/${id}/transfer`, { targetTableId });
    return res.data;
  },

  async releaseTable(id) {
    const res = await api.post(`/bar/tables/${id}/release`);
    return res.data;
  },

  // Orders & Tabs
  async getOrders(params = {}) {
    const res = await api.get('/bar/orders', { params });
    return res.data;
  },

  async getOrderById(id) {
    const res = await api.get(`/bar/orders/${id}`);
    return res.data;
  },

  async createOrder(data) {
    const res = await api.post('/bar/orders', data);
    return res.data;
  },

  async addItemsToOrder(id, items) {
    const res = await api.post(`/bar/orders/${id}/items`, { items });
    return res.data;
  },

  async updateOrderItems(id, items) {
    const res = await api.put(`/bar/orders/${id}/items`, { items });
    return res.data;
  },

  async updateKitchenStatus(id, payload) {
    // payload can be string status or { kitchenStatus, itemIndex, itemStatus }
    const body = typeof payload === 'string' ? { kitchenStatus: payload } : payload;
    const res = await api.patch(`/bar/orders/${id}/kitchen-status`, body);
    return res.data;
  },

  async settleOrder(id, paymentData) {
    // paymentData can be string paymentMethod or { paymentMethod, payments }
    const body = typeof paymentData === 'string' ? { paymentMethod: paymentData } : paymentData;
    const res = await api.post(`/bar/orders/${id}/settle`, body);
    return res.data;
  },

  async splitOrder(id, splitItemIndices) {
    const res = await api.post(`/bar/orders/${id}/split`, { splitItemIndices });
    return res.data;
  },

  async cancelOrder(id, data) {
    const res = await api.post(`/bar/orders/${id}/cancel`, data);
    return res.data;
  },

  async getInvoice(id) {
    const res = await api.get(`/bar/orders/${id}/invoice`);
    return res.data;
  },

  async getReports(params = {}) {
    const res = await api.get('/bar/reports', { params });
    return res.data;
  }
};

export default barService;
