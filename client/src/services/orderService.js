import api from './api';

export const orderService = {
  // Admin & Staff: Fetch orders with KPIs
  async getOrders(params = {}) {
    const res = await api.get('/orders', { params });
    // Support both new { orders, kpi } format and legacy array format
    if (res.data && res.data.orders) {
      return res.data;
    }
    return { orders: Array.isArray(res.data) ? res.data : [], kpi: {} };
  },

  // Single order retrieval
  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  // Create/Place new order
  async createOrder(data) {
    const res = await api.post('/orders', data);
    return res.data;
  },

  // Update order status (Admin)
  async updateOrderStatus(id, payload) {
    const body = typeof payload === 'string' ? { status: payload } : payload;
    const res = await api.patch(`/orders/${id}/status`, body);
    return res.data;
  },

  // Cancel order (Member or Admin)
  async cancelOrder(id, reason) {
    const res = await api.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  // Refund order (Admin)
  async refundOrder(id, payload) {
    const res = await api.post(`/orders/${id}/refund`, payload);
    return res.data;
  },

  // Archive order (Admin soft-delete)
  async archiveOrder(id) {
    const res = await api.patch(`/orders/${id}/archive`);
    return res.data;
  },

  // Visual tracking stages & timeline
  async getOrderTracking(id) {
    const res = await api.get(`/orders/${id}/tracking`);
    return res.data;
  },

  // Structured Printable Invoice
  async getOrderInvoice(id) {
    const res = await api.get(`/orders/${id}/invoice`);
    return res.data;
  },

  // Authenticated Member's Orders
  async getMyOrders() {
    const res = await api.get('/orders/my-orders');
    return Array.isArray(res.data) ? res.data : [];
  }
};

export default orderService;
