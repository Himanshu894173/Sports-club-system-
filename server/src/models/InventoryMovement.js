import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  productId: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  type: { type: String, enum: ['Restock', 'Sale', 'CounterSale', 'Damaged', 'Correction', 'Wastage'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, default: '' },
  performedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now, index: true },
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

export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
export default InventoryMovement;
