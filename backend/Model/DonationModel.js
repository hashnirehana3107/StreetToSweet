const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'LKR' },
    frequency: { type: String, enum: ['One-time', 'Monthly', 'Yearly'], default: 'One-time' },
    paymentMethod: { type: String, enum: ['Credit/Debit Card', 'PayPal', 'Bank Transfer'], required: true },
    // Non-sensitive payment details for reference only
    cardLast4: { type: String, default: null },
    cardHolderName: { type: String, default: null },
    paypalAccount: { type: String, default: null },
    bankAccountMasked: { type: String, default: null },
    bankName: { type: String, default: null },
    reference: { type: String, default: null },
    donorName: { type: String, default: null },
    donorEmail: { type: String, default: null },
    message: { type: String, default: null },
    status: { type: String, enum: ['recorded', 'failed'], default: 'recorded' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', DonationSchema);
