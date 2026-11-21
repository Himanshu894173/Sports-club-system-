import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true, unique: true, trim: true },
  tagline: { type: String },
  priceAnnual: { type: Number, required: true },
  priceMonthly: { type: Number, required: true },
  courtDiscountPercent: { type: Number, required: true, min: 0, max: 100 },
  shopDiscountPercent: { type: Number, required: true, min: 0, max: 100 },
  features: [{ type: String }],
  priorityBookingDays: { type: Number, default: 7 },
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

export const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
export default MembershipPlan;
