const express = require('express');
const auth = require('../middleware/auth');
const Game = require('../models/Game');
const Bet = require('../models/Bet');
const User = require('../models/User');
const Gift = require('../models/Gift');
const Inventory = require('../models/Inventory');

const router = express.Router();

// Получение состояния игры
router.get('/state', async (req, res) => {
  try {
    let game = await Game.findOne({ isActive: true })
      .populate('players', 'username avatar')
      .populate('winner', 'username')
      .populate('prize', 'name value emoji');
    
    if (!game) {
      // Создаем новую игру, если активной нет
      game = new Game({ isActive: true });
      await game.save();
    }
    
    // Получаем текущие ставки
    const bets = await Bet.find({ game: game._id })
      .populate('user', 'username avatar')
      .populate('gift', 'name value emoji');
    
    const players = bets.map(bet => ({
      id: bet.user._id,
      name: bet.user.username,
      avatar: bet.user.avatar,
      bet: bet.gift
    }));
    
    res.json({
      timer: game.timer,
      isSpinning: game.isSpinning,
      currentRound: game.currentRound,
      players: players
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Размещение ставки
router.post('/bet', auth, async (req, res) => {
  try {
    const { giftId } = req.body;
    
    // Проверяем, существует ли подарок
    const gift = await Gift.findById(giftId);
    if (!gift) {
      return res.status(404).json({ message: 'Подарок не найден' });
    }
    
    // Проверяем, есть ли подарок в инвентаре пользователя
    const userInventory = await Inventory.findOne({ 
      user: req.userId, 
      gift: giftId 
    });
    
    if (!userInventory || userInventory.count < 1) {
      return res.status(400).json({ message: 'У вас нет этого подарка' });
    }
    
    // Находим активную игру
    let game = await Game.findOne({ isActive: true });
    if (!game) {
      game = new Game({ isActive: true });
      await game.save();
    }
    
    // Проверяем, не сделал ли пользователь уже ставку
    const existingBet = await Bet.findOne({ 
      user: req.userId, 
      game: game._id 
    });
    
    if (existingBet) {
      return res.status(400).json({ message: 'Вы уже сделали ставку в этом раунде' });
    }
    
    // Создаем ставку
    const bet = new Bet({
      user: req.userId,
      gift: giftId,
      game: game._id
    });
    
    await bet.save();
    
    // Уменьшаем количество подарков в инвентаре
    userInventory.count -= 1;
    if (userInventory.count === 0) {
      await Inventory.deleteOne({ _id: userInventory._id });
    } else {
      await userInventory.save();
    }
    
    // Добавляем пользователя в игру, если его еще нет
    if (!game.players.includes(req.userId)) {
      game.players.push(req.userId);
      await game.save();
    }
    
    res.json({ message: 'Ставка принята' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Запуск вращения рулетки
router.post('/spin', auth, async (req, res) => {
  try {
    const game = await Game.findOne({ isActive: true })
      .populate('players')
      .populate({
        path: 'bets',
        populate: {
          path: 'gift user'
        }
      });
    
    if (!game) {
      return res.status(404).json({ message: 'Активная игра не найдена' });
    }
    
    if (game.players.length < 2) {
      return res.status(400).json({ message: 'Недостаточно игроков' });
    }
    
    game.isSpinning = true;
    await game.save();
    
    // Имитация вращения и определения победителя
    const winningIndex = Math.floor(Math.random() * game.players.length);
    const winner = game.players[winningIndex];
    
    // Находим самую ценную ставку для приза
    const bets = await Bet.find({ game: game._id }).populate('gift');
    let highestValue = 0;
    let prizeGift = null;
    
    for (const bet of bets) {
      if (bet.gift.value > highestValue) {
        highestValue = bet.gift.value;
        prizeGift = bet.gift;
      }
    }
    
    // Начисляем приз победителю
    if (prizeGift) {
      let winnerInventory = await Inventory.findOne({
        user: winner._id,
        gift: prizeGift._id
      });
      
      if (winnerInventory) {
        winnerInventory.count += 1;
        await winnerInventory.save();
      } else {
        winnerInventory = new Inventory({
          user: winner._id,
          gift: prizeGift._id,
          obtainedFrom: 'game_win'
        });
        await winnerInventory.save();
      }
      
      // Обновляем статистику победителя
      winner.gamesWon += 1;
      await winner.save();
    }
    
    // Обновляем статистику всех игроков
    for (const player of game.players) {
      player.gamesPlayed += 1;
      await player.save();
    }
    
    // Обновляем игру
    game.winner = winner._id;
    game.prize = prizeGift ? prizeGift._id : null;
    game.isSpinning = false;
    game.currentRound += 1;
    game.timer = 60;
    await game.save();
    
    // Очищаем ставки для нового раунда
    await Bet.deleteMany({ game: game._id });
    
    res.json({
      winner: {
        id: winner._id,
        name: winner.username
      },
      prize: prizeGift,
      rotationAngle: Math.floor(Math.random() * 360) + 1440 // 4 полных оборота + случайный угол
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
