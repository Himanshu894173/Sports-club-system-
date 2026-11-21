import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  sku: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  discount: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: function() { return this.price * this.quantity; } },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: String, default: 'System' },
  shipmentReference: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  orderId: { type: String, unique: true, index: true },
  invoiceReference: { type: String, index: true },
  userId: { type: String, default: null, index: true },
  memberId: { type: String, index: true, default: null },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, lowercase: true, trim: true, default: '' },
  customerPhone: { type: String, trim: true, default: '' },
  isCounterSale: { type: Boolean, default: false },
  fulfillmentType: {
    type: String,
    enum: ['Home Delivery', 'Front Desk Pickup', 'Pickup', 'Delivery'],
    default: 'Front Desk Pickup'
  },
  deliveryAddress: { type: String, default: '' },
  shippingAddress: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    addressLine: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  deliveryCharge: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Member Tab', 'Net Banking'],
    default: 'UPI'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    default: 'paid',
    index: true
  },
  orderStatus: {
    type: String,
    enum: [
      'Placed', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered',
      'Preparing', 'Ready for Pickup', 'Collected',
      'Cancelled', 'Returned', 'Refunded',
      'Pending', 'Ready', 'Completed'
    ],
    default: 'Placed',
    index: true
  },
  statusHistory: [statusHistorySchema],
  estimatedDeliveryDate: { type: Date, default: null },
  cancellationReason: { type: String, default: '' },
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: String, default: '' },
  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'processing', 'refunded'],
    default: 'none'
  },
  refundAmount: { type: Number, default: 0 },
  refundReference: { type: String, default: '' },
  refundedAt: { type: Date, default: null },
  shipmentReference: { type: String, default: '' },
  carrierName: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  archivedAt: { type: Date, default: null, index: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (!ret.id && ret.orderId) ret.id = ret.orderId;
      if (!ret.id && ret._id) ret.id = ret._id.toString();
      if (!ret.orderId && ret.id) ret.orderId = ret.id;
      return ret;
    }
  }
});

// Auto-fill fallback identifiers
orderSchema.pre('validate', function() {
  if (!this.orderId && this.id) {
    this.orderId = this.id;
  }
  if (!this.id && this.orderId) {
    this.id = this.orderId;
  }
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
