import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true },
  interestedSport: { type: String, default: 'Tennis' },
  membershipTier: { type: String, default: 'Gold' },
  source: {
    type: String,
    enum: ['Website Contact', 'Trial Booking', 'Walk-in', 'Referral'],
    default: 'Website Contact'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'trial_scheduled', 'converted', 'closed'],
    default: 'new',
    index: true
  },
  trialDate: { type: String },
  trialTime: { type: String },
  assignedStaff: { type: String, default: 'Front Desk Team' },
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

export const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
