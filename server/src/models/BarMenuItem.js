import mongoose from 'mongoose';

const barMenuItemSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Smoothies', 'Coffee', 'Food', 'Snacks', 'Beverages'], required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  memberPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 50, min: 0 },
  minStockAlert: { type: Number, default: 10 },
  trackStock: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: true },
  description: { type: String, default: '' },
  image: { type: String },
  calories: { type: Number, default: 0 },
  protein: { type: String, default: '' },
  tags: [{ type: String }],
  prepTime: { type: String, default: '5-10 mins' },
  ingredients: [{
    name: { type: String },
    quantity: { type: Number },
    unit: { type: String }
  }]
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

export const BarMenuItem = mongoose.model('BarMenuItem', barMenuItemSchema);
export default BarMenuItem;
