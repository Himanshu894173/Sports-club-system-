import api from './api';

export const bookingService = {
  async getCourts(params = {}) {
    const res = await api.get('/courts', { params });
    return res.data;
  },

  async getCourtById(id) {
    const res = await api.get(`/courts/${id}`);
    return res.data;
  },

  async getAvailability(date, courtId = null) {
    const params = { date };
    if (courtId && courtId !== 'all') params.courtId = courtId;
    const res = await api.get('/bookings/availability', { params });
    return res.data;
  },

  async getBookings(params = {}) {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  async getMyBookings() {
    const res = await api.get('/bookings/my-bookings');
    return res.data;
  },

  async createBooking(data) {
    const res = await api.post('/bookings', data);
    return res.data;
  },

  async cancelBooking(id) {
    const res = await api.patch(`/bookings/${id}/cancel`);
    return res.data;
  }
};
