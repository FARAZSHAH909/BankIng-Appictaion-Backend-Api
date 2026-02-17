
import mongoose from 'mongoose';

const TransactionMoneySchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true,
    default: () => `TXN-${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`
  },
  userEmail:{
    type: String,
    required: true,
  },
  loginId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OpenAccount',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OpenAccount',
    required: true,
  },
  senderAccountNumber: {
    type: String,
    required: true,
  },
  receiverAccountNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount cannot be negative"],
  },
  transactionType: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal', 'bill_payment'],
    default: 'transfer',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed',
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('TransactionMoney', TransactionMoneySchema);
