const express = require('express');
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth');

// Models
require('../Model/DonationModel');
const Donation = mongoose.model('Donation');

const router = express.Router();

// POST /donations - create a new donation record (no real payment processing)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      amount,
      frequency = 'One-time',
      paymentMethod,
      cardNumber,
      cardHolderName,
      paypalAccount,
      bankAccount,
      bankName,
      bankReference,
      paypalName,
      paypalTransactionId,
      name,
      email,
      message
    } = req.body || {};

    if (!amount || !paymentMethod) {
      return res.status(400).json({ status: 'error', message: 'Amount and payment method are required' });
    }

    // Sanitize/mask sensitive data
    const maskedCardLast4 = cardNumber ? String(cardNumber).replace(/\D/g, '').slice(-4) : null;
    const maskedBank = bankAccount ? `****${String(bankAccount).replace(/\D/g, '').slice(-4)}` : null;

    const donation = await Donation.create({
      userId,
      amount: Number(amount),
      currency: 'LKR',
      frequency,
      paymentMethod,
      cardLast4: maskedCardLast4,
      cardHolderName: cardHolderName || null,
      paypalAccount: paypalAccount || null,
      bankAccountMasked: maskedBank,
      bankName: bankName || null,
      reference: bankReference || paypalTransactionId || null,
      donorName: paypalName || name || req.user.name,
      donorEmail: email || req.user.email,
      message: message || null,
      status: 'recorded'
    });

    return res.status(201).json({ status: 'success', data: { donation } });
  } catch (error) {
    console.error('[DonationRoutes] create error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to record donation', error: error.message });
  }
});

// GET /donations/mine - list current user's donations
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const donations = await Donation.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ status: 'success', data: { donations } });
  } catch (error) {
    console.error('[DonationRoutes] list mine error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to load donations', error: error.message });
  }
});

module.exports = router;
