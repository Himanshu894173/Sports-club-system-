import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  memberPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 },
  minStockAlert: { type: Number, default: 5 },
  image: { type: String },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true, index: true },
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

export const Product = mongoose.model('Product', productSchema);
export default Product;
