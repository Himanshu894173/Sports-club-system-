import { Court, Booking, Member } from '../models/index.js';
import { bookingService } from '../services/bookingService.js';

export const bookingController = {
  async getCourts(req, res) {
    try {
      const { sport } = req.query;
      const query = {};
      if (sport && sport !== 'all') {
        query.sport = new RegExp(`^${sport}$`, 'i');
      }
      const courts = await Court.find(query).sort({ id: 1 });
      res.json(courts);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving courts.', error: error.message });
    }
  },

  async getCourtById(req, res) {
    try {
      const court = await Court.findOne({ id: req.params.id });
      if (!court) return res.status(404).json({ message: 'Court not found.' });
      res.json(court);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving court.', error: error.message });
    }
  },

  async getBookings(req, res) {
    try {
      const { date, courtId, status } = req.query;
      const query = {};

      if (date) query.date = date;
      if (courtId && courtId !== 'all') query.courtId = courtId;
      if (status && status !== 'all') query.status = status;

      const list = await Booking.find(query).sort({ date: -1, startTime: 1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving bookings.', error: error.message });
    }
  },

  async getAvailability(req, res) {
    try {
      const targetDate = req.query.date || new Date().toISOString().split('T')[0];
      const { courtId } = req.query;

      const courtQuery = {};
      if (courtId && courtId !== 'all') {
        courtQuery.id = courtId;
      }
      const targetCourts = await Court.find(courtQuery).sort({ id: 1 });

      // Generate 30-minute intervals from 06:00 to 21:00 (1-hour slots)
      const timeSlots = [];
      for (let h = 6; h <= 21; h++) {
        ['00', '30'].forEach(m => {
          if (h === 21 && m === '30') return; // Last slot starts at 21:00 (ends 22:00)
          const startH = String(h).padStart(2, '0');
          const endH = m === '30' ? String(h + 1).padStart(2, '0') : String(h + 1).padStart(2, '0');
          const endM = m === '30' ? '30' : '00';
          timeSlots.push({
            startTime: `${startH}:${m}`,
            endTime: `${endH}:${endM}`
          });
        });
      }

      // Fetch confirmed bookings for target date
      const dayBookings = await Booking.find({
        date: targetDate,
        status: { $ne: 'cancelled' }
      });

      const result = targetCourts.map(court => {
        const courtBookings = dayBookings.filter(b => b.courtId === court.id);

        const slotsWithStatus = timeSlots.map(slot => {
          const conflict = courtBookings.find(b =>
            slot.startTime < b.endTime && slot.endTime > b.startTime
          );

          return {
            ...slot,
            isAvailable: !conflict && court.status !== 'maintenance',
            booking: conflict ? {
              id: conflict.id,
              memberName: conflict.memberName,
              bookingType: conflict.bookingType,
              status: conflict.status
            } : null
          };
        });

        return {
          court,
          date: targetDate,
          slots: slotsWithStatus
        };
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving availability.', error: error.message });
    }
  },

  async createBooking(req, res) {
    try {
      const { courtId, memberId, memberName, memberPhone, date, startTime, bookingType, notes } = req.body;

      let effectiveMemberId = memberId;
      if (req.user && req.user.role === 'member') {
        effectiveMemberId = req.user.memberId;
      }

      const booking = await bookingService.validateAndCreateBooking({
        courtId,
        memberId: effectiveMemberId,
        memberName: memberName || (req.user ? req.user.name : 'Walk-in Guest'),
        memberPhone: memberPhone || (req.user ? req.user.phone : 'N/A'),
        date,
        startTime,
        bookingType: bookingType || (effectiveMemberId ? 'member' : 'walk-in'),
        notes
      });

      res.status(201).json({
        message: 'Court booking successfully confirmed.',
        booking
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async cancelBooking(req, res) {
    try {
      const booking = await Booking.findOne({ id: req.params.id });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
      }

      // Security check: member can only cancel their own booking
      if (req.user && req.user.role === 'member') {
        if (booking.memberId !== req.user.memberId) {
          return res.status(403).json({ message: 'Forbidden: You cannot cancel another member booking.' });
        }
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({ message: 'Booking is already cancelled.' });
      }

      booking.status = 'cancelled';
      await booking.save();

      res.json({
        message: 'Court booking cancelled successfully.',
        booking
      });
    } catch (error) {
      res.status(500).json({ message: 'Error cancelling booking.', error: error.message });
    }
  },

  async getMyBookings(req, res) {
    try {
      if (!req.user || !req.user.memberId) {
        return res.status(400).json({ message: 'No member profile associated with this account.' });
      }

      const bookings = await Booking.find({ memberId: req.user.memberId }).sort({ date: -1, startTime: -1 });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving member bookings.', error: error.message });
    }
  }
};

export default bookingController;
