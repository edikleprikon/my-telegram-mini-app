const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gameRoutes = require('./routes/game');
const inventoryRoutes = require('./routes/inventory');
const shopRoutes = require('./routes/shop');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB подключена'))
.catch(err => console.log('Ошибка подключения к MongoDB:', err));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shop', shopRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
