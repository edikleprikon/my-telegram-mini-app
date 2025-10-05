class PVPGame {
    constructor(app) {
        this.app = app;
        this.wheel = document.getElementById('pvp-wheel');
        this.spinButton = document.getElementById('spin-pvp');
        this.playersList = document.getElementById('players-list');
        this.isSpinning = false;
        this.init();
    }

    init() {
        this.spinButton.addEventListener('click', () => this.spinWheel());
        this.generatePlayers();
    }

    generatePlayers() {
        const players = [
            { id: 1, name: 'Игрок 1', bet: 50, avatar: 'P1' },
            { id: 2, name: 'Игрок 2', bet: 30, avatar: 'P2' },
            { id: 3, name: 'Игрок 3', bet: 20, avatar: 'P3' },
            { id: 4, name: 'Вы', bet: 10, avatar: 'YOU' }
        ];

        this.playersList.innerHTML = '';
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.innerHTML = `
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-bet">${player.bet} TON</div>
            `;
            this.playersList.appendChild(playerElement);
        });
    }

    spinWheel() {
        if (this.isSpinning) return;
        
        const userData = this.app.getUserData();
        if (userData.balance < 10) {
            this.app.showNotification('Недостаточно TON для ставки!');
            return;
        }

        this.isSpinning = true;
        this.spinButton.disabled = true;

        // Обновление баланса
        userData.balance -= 10;
        this.app.saveUserData(userData);

        // Анимация вращения
        this.wheel.style.animation = 'none';
        setTimeout(() => {
            this.wheel.classList.add('wheel-spinning');
        }, 50);

        // Определение победителя
        setTimeout(() => {
            this.determineWinner();
            this.wheel.classList.remove('wheel-spinning');
            this.wheel.style.animation = 'wheel-rotate 20s linear infinite';
            this.isSpinning = false;
            this.spinButton.disabled = false;
        }, 3000);
    }

    determineWinner() {
        const winners = ['Игрок 1', 'Игрок 2', 'Игрок 3', 'Вы'];
        const winner = winners[Math.floor(Math.random() * winners.length)];
        
        const userData = this.app.getUserData();
        
        if (winner === 'Вы') {
            userData.balance += 100; // Выигрыш
            userData.pvpWins += 1;
            userData.inventory.push({
                id: Date.now(),
                name: 'PVP Подарок',
                type: 'pvp',
                price: 50,
                canSell: true
            });
            this.app.showNotification(`🎉 Поздравляем! Вы выиграли 100 TON и подарок!`);
        } else {
            this.app.showNotification(`Победитель: ${winner}`);
        }
        
        this.app.saveUserData(userData);
    }
}

// Инициализация PVP игры
document.addEventListener('DOMContentLoaded', () => {
    if (app) {
        new PVPGame(app);
    }
});
