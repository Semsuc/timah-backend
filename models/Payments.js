// models/Payments.js
const mongoose = require('mongoose');

const paymentsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'GBP', // pounds as the default
    },
    symbol: {
      type: String,
      default: '£',   // pounds symbol
    },
    method: {
      type: String,
      enum: ['card', 'cash', 'other'], // Stripe payments counted as 'card'
      default: 'card',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    verifiedByAdmin: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    reference: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Payments', paymentsSchema);
