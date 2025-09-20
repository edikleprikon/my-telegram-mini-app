const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Аутентификация через Telegram
router.post('/login', async (req, res) => {
  try {
    const { initData } = req.body;
    
    // Здесь должна быть проверка подписи Telegram WebApp
    // Для демонстрации просто извлекаем данные пользователя
    const userData = parseInitData(initData);
    
    if (!userData) {
      return res.status(400).json({ message: 'Неверные данные' });
    }
    
    // Поиск или создание пользователя
    let user = await User.findOne({ telegramId: userData.id });
    
    if (!user) {
      user = new User({
        telegramId: userData.id,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name
      });
      await user.save();
    }
    
    // Создание JWT токена
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вспомогательная функция для парсинга initData
function parseInitData(initData) {
  // В реальном приложении нужно проверять подпись
  // Для демонстрации просто парсим данные
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
}

module.exports = router;
