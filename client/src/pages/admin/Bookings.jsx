import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { memberService } from '../../services/memberService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  Grid,
  XCircle,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // New Booking Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courtId: '',
    memberId: '',
    memberName: '',
    memberPhone: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    bookingType: 'member',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Social Play Modal
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    bookingService.getBookings({ date: selectedDate, courtId: selectedCourt, status: selectedStatus })
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      bookingService.getCourts().catch(() => []),
      memberService.getMembers().catch(() => [])
    ]).then(([courtsData, membersData]) => {
      setCourts(courtsData);
      setMembers(membersData);
      if (courtsData.length > 0) {
        setFormData(prev => ({ ...prev, courtId: courtsData[0].id }));
      }
    });
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedCourt, selectedStatus]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await bookingService.createBooking(formData);
      setNewModalOpen(false);
      setFormData({
        courtId: courts[0]?.id || '',
        memberId: '',
        memberName: '',
        memberPhone: '',
        date: selectedDate,
        startTime: '07:00',
        bookingType: 'member',
        notes: ''
      });
      fetchBookings();
    } catch (err) {
      setFormError(err.message || 'Failed to create booking. Check for conflicts.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this court booking?')) return;
    try {
      await bookingService.cancelBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMemberSelect = (e) => {
    const memId = e.target.value;
    if (!memId) {
      setFormData(prev => ({ ...prev, memberId: '', memberName: '', memberPhone: '' }));
      return;
    }
    const mem = members.find(m => m.id === memId);
    if (mem) {
      setFormData(prev => ({
        ...prev,
        memberId: mem.id,
        memberName: mem.name,
        memberPhone: mem.phone,
        bookingType: 'member'
      }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Court Reservations & Match Schedules</h2>
          <p className="text-xs text-gray-500 mt-0.5">Strict 1-hour intervals, overlap conflict prevention & daily member caps</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={() => setSocialModalOpen(true)}>
            <Users className="w-4 h-4 mr-1.5" /> Social Play Manager
          </Button>
          <Button variant="gold" size="md" className="font-bold" onClick={() => setNewModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Booking
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-cream-100 px-3 py-1.5 rounded-xl border border-cream-300">
            <CalendarIcon className="w-4 h-4 text-gold-600" />
            <label htmlFor="admin-booking-date" className="text-xs font-semibold text-gray-700">Date:</label>
            <input
              id="admin-booking-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-forest-950 focus:outline-none"
            />
          </div>

          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="text-xs p-2 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900"
          >
            <option value="all">All Courts & Nets</option>
            {courts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-2 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <p className="text-xs text-gray-500">
          Showing <span className="font-bold text-forest-950">{bookings.length}</span> reservations
        </p>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
        {loading ? (
          <Loader message="Loading court reservations..." />
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-serif font-bold text-base text-gray-700">No bookings for selected date</p>
            <p className="text-xs text-gray-500 mt-1">Click "New Booking" to reserve a slot.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Court</th>
                  <th className="p-4">Time Interval</th>
                  <th className="p-4">Player / Member</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Fee Charged</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-4 font-bold text-forest-950">{b.courtName}</td>
                    <td className="p-4 font-semibold text-gray-900">
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-forest-950">{b.memberName}</p>
                      <p className="text-[11px] text-gray-500">{b.memberPhone}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-200 text-forest-950">
                        {b.bookingType}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-800">
                      {b.amount === 0 ? 'Complimentary' : formatCurrency(b.amount)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Create Court Booking"
        subtitle="1-hour slot automatically enforced with collision detection"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Court / Net</label>
              <select
                value={formData.courtId}
                onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
                required
              >
                {courts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({formatCurrency(c.hourlyRate)}/hr)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Booking Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time (30-min increments)</label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white font-mono font-bold"
              >
                {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                  <option key={t} value={t}>{t} (Duration: 1 Hr)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Booking Classification</label>
              <select
                value={formData.bookingType}
                onChange={(e) => setFormData({ ...formData, bookingType: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
              >
                <option value="member">Member Booking</option>
                <option value="walk-in">Walk-in Counter</option>
                <option value="social">Friday Social Play</option>
              </select>
            </div>
          </div>

          {/* Quick Member Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Lookup Club Member (Optional)</label>
            <select
              value={formData.memberId}
              onChange={handleMemberSelect}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
            >
              <option value="">-- Select Registered Member or Enter Guest Below --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.plan} Plan - {m.id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Player Name</label>
              <input
                type="text"
                required
                value={formData.memberName}
                onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                placeholder="e.g. Vikram Mehta"
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={formData.memberPhone}
                onChange={(e) => setFormData({ ...formData, memberPhone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Coach Marcus attending, RoboArm speed setting"
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Confirm & Book Court
            </Button>
          </div>
        </form>
      </Modal>

      {/* Friday Social Play Management Modal */}
      <Modal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        title="Friday Night Social Play Management"
        subtitle="Manage shared court rotations where multiple club members participate simultaneously"
      >
        <div className="space-y-4">
          <div className="bg-cream-100 p-4 rounded-xl text-xs space-y-2 border border-cream-300">
            <h4 className="font-bold text-forest-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-600" /> Friday Social Play Policy
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Every Friday from 18:00 to 21:00, Court 1 and Court 2 transition into open doubles rotations. Players rotate every 20 minutes with cafeteria refreshments served on the veranda.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-forest-950 uppercase tracking-wider">Registered Social Attendees (Tonight):</p>
            <div className="space-y-2">
              {members.slice(0, 3).map((m, idx) => (
                <div key={idx} className="p-3 bg-white border border-cream-300 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-forest-950">{m.name}</span>
                    <span className="text-gray-400 ml-2">({m.plan} Tier)</span>
                  </div>
                  <span className="text-emerald-700 font-semibold">Confirmed Rotation</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setSocialModalOpen(false)}>
              Close Social Manager
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Bookings;
