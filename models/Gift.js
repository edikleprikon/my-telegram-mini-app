const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary', 'special'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Gift', giftSchema);
