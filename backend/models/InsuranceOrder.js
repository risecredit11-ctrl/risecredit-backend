const mongoose = require('mongoose');

const insuranceOrderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true }, // 'card' or 'bitcoin'
  
  // Cart summary
  total: { type: Number, required: true },
  orderNumber: { type: String, required: true },
  
  // Optional card details (not securely stored in real life, but included per prompt)
  cardNumber: { type: String },
  cardExpiry: { type: String },
  cardCVV: { type: String },
  cardHolder: { type: String },

  // Optional bitcoin details
  btcWallet: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InsuranceOrder', insuranceOrderSchema);
