const express = require('express');
const auth = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const Gift = require('../models/Gift');

const router = express.Router();

// Получение инвентаря пользователя
router.get('/', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find({ user: req.userId })
      .populate('gift')
      .lean();
    
    // Группируем предметы по типу
    const groupedInventory = {};
    
    inventory.forEach(item => {
      if (groupedInventory[item.gift._id]) {
        groupedInventory[item.gift._id].count += item.count;
      } else {
        groupedInventory[item.gift._id] = {
          id: item.gift._id,
          type: item.gift.type,
          name: item.gift.name,
          value: item.gift.value,
          emoji: item.gift.emoji,
          count: item.count
        };
      }
    });
    
    res.json(Object.values(groupedInventory));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
