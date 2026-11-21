import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const fetchBookings = () => {
    setLoading(true);
    bookingService.getMyBookings()
      .then(data => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you wish to cancel this court reservation?')) return;
    setCancellingId(id);
    setActionMessage({ text: '', type: '' });

    try {
      await bookingService.cancelBooking(id);
      setActionMessage({ text: 'Booking successfully cancelled.', type: 'success' });
      fetchBookings();
    } catch (err) {
      setActionMessage({ text: err.message || 'Failed to cancel booking.', type: 'error' });
    } finally {
      setCancellingId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled');
  const past = bookings.filter(b => b.date < today || b.status === 'cancelled');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-forest-950">My Court Reservations</h2>
        <p className="text-xs text-gray-500 mt-1">Review scheduled matches, court types, and reservation history.</p>
      </div>

      {actionMessage.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {loading ? (
        <Loader message="Loading your reservation history..." />
      ) : (
        <div className="space-y-8">
          {/* Upcoming Reservations */}
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-950 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-600" />
              Upcoming Sessions ({upcoming.length})
            </h3>

            {upcoming.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-cream-300">
                <p className="text-xs text-gray-500">You have no upcoming court reservations scheduled.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white p-5 rounded-2xl border border-cream-300 shadow-premium flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {b.status}
                        </span>
                        <span className="text-xs font-bold text-forest-950">
                          {b.amount === 0 ? 'Free (Gold Plan)' : formatCurrency(b.amount)}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-forest-950">{b.courtName}</h4>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        {formatDate(b.date)} • {formatTime(b.startTime)} to {formatTime(b.endTime)}
                      </p>
                      {b.notes && <p className="text-xs text-gray-400 italic mt-2">"{b.notes}"</p>}
                    </div>

                    <div className="mt-4 pt-4 border-t border-cream-200 flex justify-end">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancellingId === b.id}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        Cancel Reservation
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / Cancelled Reservations */}
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-950 mb-4">
              Past & Cancelled Bookings ({past.length})
            </h3>
            <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Court</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Time Interval</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Fee</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {past.map((b) => (
                      <tr key={b.id} className="hover:bg-cream-50">
                        <td className="p-3.5 font-bold text-forest-950">{b.courtName}</td>
                        <td className="p-3.5">{formatDate(b.date)}</td>
                        <td className="p-3.5">{formatTime(b.startTime)} - {formatTime(b.endTime)}</td>
                        <td className="p-3.5 capitalize">{b.bookingType}</td>
                        <td className="p-3.5 font-semibold">{formatCurrency(b.amount)}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyBookings;
