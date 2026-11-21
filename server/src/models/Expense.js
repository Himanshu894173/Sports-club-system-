import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  vendor: { type: String, default: '' },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0], index: true },
  status: { type: String, default: 'paid' },
  approvedBy: { type: String, default: 'Club Manager' },
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

export const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
