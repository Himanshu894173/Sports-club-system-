import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  userId: { type: String, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true },
  plan: { type: String, enum: ['Gold', 'Silver', 'Junior'], default: 'Gold', index: true },
  status: { type: String, enum: ['active', 'expired', 'suspended'], default: 'active', index: true },
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  expiryDate: { type: String },
  emergencyContact: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  sportsInterest: [{ type: String }],
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
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

export const Member = mongoose.model('Member', memberSchema);
export default Member;
