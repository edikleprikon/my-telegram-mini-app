const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  gift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isSold: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ShopItem', shopItemSchema);
