import mongoose from 'mongoose';

const barOrderItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  category: { type: String },
  notes: { type: String, default: '' },
  itemStatus: { type: String, enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending' },
}, { _id: false });

const paymentRecordSchema = new mongoose.Schema({
  method: { type: String, required: true }, // 'Cash', 'Card', 'UPI'
  amount: { type: Number, required: true },
  transactionId: { type: String },
  paidAt: { type: Date, default: Date.now }
}, { _id: false });

const barOrderSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  orderNumber: { type: String, index: true },
  tableId: { type: String, required: true, index: true },
  tableName: { type: String, default: 'Takeaway' },
  customerType: { type: String, enum: ['member', 'walk-in', 'staff'], default: 'walk-in' },
  memberId: { type: String, index: true, default: null },
  customerName: { type: String, default: 'Guest' },
  customerPhone: { type: String, default: '' },
  isTab: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open', index: true },
  kitchenStatus: { type: String, enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending', index: true },
  items: [barOrderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, default: null },
  payments: [paymentRecordSchema],
  paymentStatus: { type: String, enum: ['paid', 'unpaid', 'partially_paid', 'refunded'], default: 'unpaid', index: true },
  invoiceId: { type: String, default: null },
  cancellationReason: { type: String, default: null },
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: String, default: null },
  serverName: { type: String, default: 'Bar Staff' }
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

export const BarOrder = mongoose.model('BarOrder', barOrderSchema);
export default BarOrder;
