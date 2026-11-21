import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  type: { type: String, enum: ['income', 'expense'], default: 'income', index: true },
  category: {
    type: String,
    enum: ['Courts', 'Shop', 'Bar', 'Membership', 'Corporate', 'Operations', 'Utilities', 'Salaries', 'Refund'],
    required: true,
    index: true
  },
  referenceId: { type: String, index: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Member Tab'],
    default: 'UPI'
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    default: 'paid',
    index: true
  },
  memberName: { type: String },
  memberId: { type: String, index: true, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
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

export const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
