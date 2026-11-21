import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatTime } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Shield,
  Filter
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Courts = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getCourtImage = (court) => {
    if (court.image) return court.image;
    const name = (court.name || '').toLowerCase();
    const sport = (court.sport || '').toLowerCase();
    if (sport === 'cricket' || name.includes('cricket') || name.includes('roboarm')) {
      return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800';
    }
    if (name.includes('clay')) {
      return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800';
    }
    if (sport === 'padel' || name.includes('padel')) {
      return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800';
    }
    return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800';
  };

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSport, setSelectedSport] = useState('all');
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingType, setBookingType] = useState('member'); // member, walk-in, social
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAvailability = (date) => {
    setLoading(true);
    bookingService.getAvailability(date)
      .then((data) => setAvailability(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to load court availability:', err);
        setAvailability([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  const handleOpenBooking = (court, slot) => {
    setErrorMessage('');
    setSuccessMessage('');
    setSelectedSlot({ court, ...slot });
    setBookingModalOpen(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        courtId: selectedSlot.court?.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        bookingType,
        memberName: isAuthenticated ? user?.name : guestName,
        memberPhone: isAuthenticated ? user?.phone : guestPhone,
        notes: bookingNotes
      };

      const result = await bookingService.createBooking(payload);
      setSuccessMessage(`Booking confirmed for ${result.courtName || selectedSlot.court?.name} from ${result.startTime} to ${result.endTime}!`);
      fetchAvailability(selectedDate);
      setTimeout(() => {
        setBookingModalOpen(false);
        setSuccessMessage('');
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Booking conflict or limit reached.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAvailability = Array.isArray(availability)
    ? availability.filter(item => {
        if (!item || !item.court) return false;
        if (selectedSport === 'all') return true;
        return (item.court.sport || '').toLowerCase() === selectedSport.toLowerCase();
      })
    : [];

  return (
    <div className="pb-24 space-y-12">
      {/* Header Banner */}
      <section className="bg-forest-950 text-cream-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
                Live Reservation Grid
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-cream-50">
                Court Availability & Scheduling
              </h1>
              <p className="mt-2 text-sm text-cream-200 max-w-xl">
                1-hour sessions with 30-minute start intervals from 06:00 to 22:00. Members receive complimentary or heavily discounted rates.
              </p>
            </div>

            {/* Quick Rules Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs bg-forest-900/70 p-3 rounded-xl border border-forest-800">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span> Reserved
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gold-400">Max 2 Bookings/Day</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters: Date Picker & Sport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-cream-300 shadow-premium flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-cream-100 px-3.5 py-2 rounded-xl border border-cream-300">
              <CalendarIcon className="w-4 h-4 text-gold-600" />
              <label htmlFor="court-date" className="text-xs font-semibold text-forest-950">
                Select Date:
              </label>
              <input
                id="court-date"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-forest-950 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-cream-100 border border-cream-300">
              {['all', 'Tennis', 'Cricket'].map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedSport === sport
                      ? 'bg-forest-900 text-cream-50 font-bold shadow'
                      : 'text-gray-600 hover:text-forest-950'
                  }`}
                >
                  {sport === 'all' ? 'All Courts' : sport}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Showing availability for <span className="font-bold text-forest-950">{selectedDate}</span>
          </p>
        </div>
      </div>

      {/* Courts Availability Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <Loader message="Checking court reservation schedules..." />
        ) : filteredAvailability.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
            <p className="font-serif text-lg font-bold text-gray-700">No courts matching filter</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredAvailability.map((item, cIdx) => {
              const court = item?.court || {};
              const slots = Array.isArray(item?.slots) ? item.slots : [];
              return (
              <div
                key={court.id || court._id || cIdx}
                className="bg-white rounded-2xl p-6 border border-cream-300 shadow-premium"
              >
                {/* Court Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-cream-200 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-forest-950 shadow-md">
                      <img
                        src={getCourtImage(court)}
                        alt={court.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-forest-900 text-cream-50">
                          {court.sport}
                        </span>
                        <span className="text-xs text-gray-500">{court.type}</span>
                      </div>
                      <h3 className="font-serif font-bold text-xl text-forest-950 mt-1">{court.name}</h3>
                      <p className="text-xs text-gold-700 font-medium">{court.surface} • {court.lighting}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-forest-950">
                      {formatCurrency(court.hourlyRate)}
                    </span>
                    <span className="text-xs text-gray-500"> / hr</span>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Gold Member: Free • Silver: 50% Off
                    </p>
                  </div>
                </div>

                {/* Slots Grid: 30-min start intervals */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold-600" />
                    1-Hour Slots (Starts Every 30 Minutes):
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                    {slots.map((slot, index) => {
                      const isAvailable = slot.isAvailable;

                      return (
                        <button
                          key={index}
                          disabled={!isAvailable}
                          onClick={() => handleOpenBooking(court, slot)}
                          className={`p-2.5 rounded-xl text-center border transition-all ${
                            isAvailable
                              ? 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-300 text-emerald-950 hover:shadow-sm cursor-pointer'
                              : 'bg-rose-50/60 border-rose-200 text-rose-900 opacity-80 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-xs font-bold block">
                            {formatTime(slot.startTime)}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            till {formatTime(slot.endTime)}
                          </span>
                          <span className={`text-[10px] font-semibold mt-1 inline-block ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {isAvailable ? 'Available' : 'Reserved'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Reserve Court Session"
        subtitle={selectedSlot ? `${selectedSlot.court.name} on ${selectedDate}` : ''}
      >
        {selectedSlot && (
          <form onSubmit={handleCreateBooking} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Session Info Box */}
            <div className="bg-cream-100 p-4 rounded-xl border border-cream-300 space-y-1.5 text-xs text-gray-700">
              <p><span className="font-bold text-forest-950">Surface:</span> {selectedSlot.court.surface}</p>
              <p><span className="font-bold text-forest-950">Time Slot:</span> {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)} (Strict 1-Hour Session)</p>
              <p><span className="font-bold text-forest-950">Hourly Rate:</span> {formatCurrency(selectedSlot.court.hourlyRate)}</p>
              <div className="pt-2 border-t border-cream-300 flex justify-between items-center text-sm font-bold text-forest-900">
                <span>Effective Fee:</span>
                <span>
                  {isAuthenticated && user?.plan?.toLowerCase() === 'gold'
                    ? '₹0 (Gold Member Privilege)'
                    : isAuthenticated && user?.plan?.toLowerCase() === 'silver'
                    ? `${formatCurrency(selectedSlot.court.hourlyRate * 0.5)} (50% Off)`
                    : formatCurrency(selectedSlot.court.hourlyRate)}
                </span>
              </div>
            </div>

            {/* If Not Authenticated, collect Guest info */}
            {!isAuthenticated && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Rahul Sen"
                    className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
                  />
                </div>
              </div>
            )}

            {/* Booking Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Booking Classification</label>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white focus:ring-1 focus:ring-forest-900"
              >
                <option value="member">Standard Member Session</option>
                <option value="walk-in">Walk-in Player</option>
                <option value="social">Friday Social Play (Shared Court)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Session Notes (Optional)</label>
              <input
                type="text"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="e.g., Singles match, Bowling machine pace preset"
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="md"
                type="submit"
                loading={submitting}
                className="font-bold shadow"
              >
                Confirm Court Reservation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
export default Courts;
