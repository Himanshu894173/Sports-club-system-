import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  courtId: { type: String, required: true, index: true },
  courtName: { type: String, required: true },
  memberId: { type: String, index: true, default: null },
  memberName: { type: String, required: true },
  memberPhone: { type: String, default: 'N/A' },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  startTime: { type: String, required: true }, // Format: HH:mm
  endTime: { type: String, required: true }, // Format: HH:mm
  bookingType: { type: String, enum: ['member', 'walk-in', 'social', 'coaching'], default: 'member' },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed', index: true },
  amount: { type: Number, default: 0, min: 0 },
  baseAmount: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (!ret.id && ret._id) ret.id = ret._id.toString();
      return ret;
    }
  }
});

// Composite index for fast conflict searches
bookingSchema.index({ courtId: 1, date: 1, status: 1 });
bookingSchema.index({ memberId: 1, date: 1, status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
