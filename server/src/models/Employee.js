import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  department: {
    type: String,
    enum: ['Coaching', 'Front Desk', 'Maintenance', 'Food & Beverage', 'Administration'],
    default: 'Front Desk',
    index: true
  },
  shift: { type: String, default: 'Morning (06:00 - 14:00)' },
  salary: { type: Number, default: 35000 },
  joinDate: { type: String },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active', index: true },
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

export const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
