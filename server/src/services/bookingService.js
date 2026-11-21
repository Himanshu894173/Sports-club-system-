import { Court, Booking, Member, MembershipPlan, Transaction } from '../models/index.js';

export const bookingService = {
  async validateAndCreateBooking({
    courtId,
    memberId,
    memberName,
    memberPhone,
    date,
    startTime,
    bookingType = 'member',
    notes = ''
  }) {
    const bookingDate = date || new Date().toISOString().split('T')[0];
    
    // 1. Court validation & maintenance check
    const court = await Court.findOne({ id: courtId });
    if (!court) {
      throw new Error('Court not found.');
    }
    if (court.status === 'maintenance') {
      throw new Error(`Court '${court.name}' is currently closed for scheduled maintenance.`);
    }

    // 2. Start time validation (30-minute intervals)
    if (!startTime) {
      throw new Error('Start time is required.');
    }
    const [hours, minutes] = startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || (minutes !== 0 && minutes !== 30)) {
      throw new Error('Invalid start time. Bookings must start on the hour or half-hour (e.g., 07:00, 07:30).');
    }

    // 3. 1-hour duration rule
    const endHours = minutes === 30 ? hours + 1 : hours + 1;
    const endMinutes = minutes === 30 ? 30 : 0;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    if (hours < 6 || endHours > 22 || (endHours === 22 && endMinutes > 0)) {
      throw new Error('Court operating hours are strictly 06:00 to 22:00.');
    }

    // 4. Member daily booking limit (Max 2 active bookings per member per day)
    if (memberId) {
      const activeMemberBookingsToday = await Booking.find({
        memberId,
        date: bookingDate,
        status: { $ne: 'cancelled' }
      });

      if (activeMemberBookingsToday.length >= 2) {
        throw new Error('Member daily booking limit reached: Maximum 2 active bookings allowed per member per day.');
      }
    }

    // 5. Overlapping conflict check on the same court
    // Rule: existing.startTime < new.endTime && existing.endTime > new.startTime
    const existingConflict = await Booking.findOne({
      courtId,
      date: bookingDate,
      status: { $ne: 'cancelled' },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (existingConflict) {
      throw new Error(`Court Conflict: ${court.name} is already booked from ${existingConflict.startTime} to ${existingConflict.endTime} on ${bookingDate}.`);
    }

    // 6. Pricing calculation based on active membership plan
    let discountPercent = 0;
    let finalMemberName = memberName;
    let finalPhone = memberPhone;

    if (memberId) {
      const member = await Member.findOne({ id: memberId });
      if (member) {
        finalMemberName = member.name;
        finalPhone = member.phone;

        // Verify active status
        if (member.status === 'active') {
          const plan = await MembershipPlan.findOne({ name: member.plan });
          if (plan) {
            discountPercent = plan.courtDiscountPercent;
          }
        }
      }
    }

    const baseAmount = court.hourlyRate;
    const discountAmount = Math.round((baseAmount * discountPercent) / 100);
    const finalAmount = Math.max(0, baseAmount - discountAmount);

    const bookingId = `bkg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newBooking = await Booking.create({
      id: bookingId,
      courtId: court.id,
      courtName: court.name,
      memberId: memberId || null,
      memberName: finalMemberName || 'Walk-in Guest',
      memberPhone: finalPhone || 'N/A',
      date: bookingDate,
      startTime,
      endTime,
      bookingType,
      status: 'confirmed',
      amount: finalAmount,
      baseAmount,
      discount: discountAmount,
      notes: notes || ''
    });

    // Record transaction if paid amount > 0
    if (finalAmount > 0) {
      await Transaction.create({
        id: `txn_${Date.now()}`,
        type: 'income',
        category: 'Courts',
        referenceId: newBooking.id,
        description: `Court Booking: ${court.name} (${startTime}-${endTime}) - ${finalMemberName}`,
        amount: finalAmount,
        method: memberId ? 'UPI' : 'Cash',
        status: 'paid',
        memberName: finalMemberName,
        memberId: memberId || null
      });
    }

    // Increment member total bookings count
    if (memberId) {
      await Member.updateOne({ id: memberId }, { $inc: { totalBookings: 1, totalSpent: finalAmount } });
    }

    return newBooking;
  }
};

export default bookingService;
