import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning'], default: 'available', index: true },
  section: { type: String, default: 'Indoor Veranda' },
  currentOrderId: { type: String, default: null },
  currentCustomerName: { type: String, default: null },
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

export const Table = mongoose.model('Table', tableSchema);
export default Table;
