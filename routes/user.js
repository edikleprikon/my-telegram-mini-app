const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Получение профиля пользователя
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Подключение кошелька
router.post('/wallet/connect', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    user.walletConnected = !user.walletConnected;
    if (user.walletConnected) {
      user.walletBalance = 5.25; // Пример баланса
    } else {
      user.walletBalance = 0;
    }
    
    await user.save();
    res.json({ 
      walletConnected: user.walletConnected, 
      walletBalance: user.walletBalance 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
