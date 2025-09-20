const express = require('express');
const auth = require('../middleware/auth');
const ShopItem = require('../models/ShopItem');
const Gift = require('../models/Gift');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

const router = express.Router();

// Получение товаров магазина
router.get('/items', async (req, res) => {
  try {
    const shopItems = await ShopItem.find({ isSold: false })
      .populate('gift')
      .populate('seller', 'username')
      .lean();
    
    const items = shopItems.map(item => ({
      id: item._id,
      name: item.gift.name,
      type: item.gift.type,
      value: item.gift.value,
      emoji: item.gift.emoji,
      price: item.price,
      seller: item.seller.username
    }));
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Покупка товара
router.post('/buy', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    
    // Находим товар
    const shopItem = await ShopItem.findById(itemId)
      .populate('gift')
      .populate('seller');
    
    if (!shopItem || shopItem.isSold) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    // Проверяем, что пользователь не покупает у себя
    if (shopItem.seller._id.toString() === req.userId) {
      return res.status(400).json({ message: 'Нельзя купить свой же товар' });
    }
    
    // Проверяем баланс пользователя
    const buyer = await User.findById(req.userId);
    if (buyer.coins < shopItem.price) {
      return res.status(400).json({ message: 'Недостаточно монет' });
    }
    
    // Совершаем покупку
    buyer.coins -= shopItem.price;
    await buyer.save();
    
    // Начисляем монеты продавцу
    const seller = await User.findById(shopItem.seller._id);
    seller.coins += shopItem.price;
    await seller.save();
    
    // Добавляем предмет в инвентарь покупателя
    let buyerInventory = await Inventory.findOne({
      user: req.userId,
      gift: shopItem.gift._id
    });
    
    if (buyerInventory) {
      buyerInventory.count += 1;
      await buyerInventory.save();
    } else {
      buyerInventory = new Inventory({
        user: req.userId,
        gift: shopItem.gift._id,
        obtainedFrom: 'purchase'
      });
      await buyerInventory.save();
    }
    
    // Помечаем товар как проданный
    shopItem.isSold = true;
    await shopItem.save();
    
    res.json({ message: 'Покупка успешна' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
