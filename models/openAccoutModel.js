import mongoose from 'mongoose';

const openAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    default: null,
    select: false,
  },
  otpExpiry: {
    type: Date,
    default: null,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'customer'
  },
  accountTitle: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  
}, {
  timestamps: true
});

export default mongoose.model('OpenAccount', openAccountSchema);
