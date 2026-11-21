import mongoose from 'mongoose';

const corporateClientSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  contractValue: { type: Number, required: true },
  balanceDue: { type: Number, default: 0 },
  activeSlots: { type: Number, default: 1 },
  renewalDate: { type: String },
  status: { type: String, enum: ['Active', 'Pending Renewal', 'Overdue'], default: 'Active' },
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

export const CorporateClient = mongoose.model('CorporateClient', corporateClientSchema);
export default CorporateClient;
