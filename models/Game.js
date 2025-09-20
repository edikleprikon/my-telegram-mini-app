const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  currentRound: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timer: {
    type: Number,
    default: 60
  },
  isSpinning: {
    type: Boolean,
    default: false
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  prize: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);
