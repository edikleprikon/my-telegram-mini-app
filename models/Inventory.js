const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift',
    required: true
  },
  count: {
    type: Number,
    default: 1
  },
  obtainedAt: {
    type: Date,
    default: Date.now
  },
  obtainedFrom: {
    type: String,
    enum: ['purchase', 'game_win', 'gift', 'trade'],
    required: true
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
