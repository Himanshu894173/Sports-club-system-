import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  transactionId: { type: String, index: true },
  type: { type: String, default: 'Tax Invoice' },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String },
  memberId: { type: String },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  paymentStatus: { type: String, default: 'paid' },
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

export const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
