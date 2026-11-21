import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  sport: { type: String, enum: ['Tennis', 'Cricket', 'Padel', 'Badminton'], default: 'Tennis', index: true },
  surface: { type: String, required: true },
  hourlyRate: { type: Number, required: true, min: 0 },
  isIndoor: { type: Boolean, default: false },
  status: { type: String, enum: ['available', 'maintenance', 'reserved'], default: 'available', index: true },
  description: { type: String },
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

export const Court = mongoose.model('Court', courtSchema);
export default Court;
