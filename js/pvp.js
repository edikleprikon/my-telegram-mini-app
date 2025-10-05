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

    async spinWheel() {
        if (this.isSpinning) return;
        
        // Проверяем подключение кошелька
        const authData = localStorage.getItem('userAuth');
        if (!authData || !JSON.parse(authData).walletConnected) {
            this.app.showNotification('Для участия в PVP необходимо подключить кошелёк!');
            return;
        }

        const betAmount = 10;

        try {
            // В демо режиме используем локальный баланс, иначе реальную транзакцию
            if (this.app.isDemoMode) {
                const userData = this.app.getUserData();
                if (userData.balance < betAmount) {
                    this.app.showNotification('Недостаточно TON для ставки!');
                    return;
                }
                userData.balance -= betAmount;
                this.app.saveUserData(userData);
            } else {
                // Реальная транзакция через кошелёк
                await this.app.walletManager.sendTransaction(
                    'game_contract_address', // Адрес игрового контракта
                    betAmount,
                    'PVP Game Bet'
                );
            }

            this.startSpinning();

        } catch (error) {
            this.app.showNotification(`Ошибка: ${error.message}`);
        }
    }

    startSpinning() {
        this.isSpinning = true;
        this.spinButton.disabled = true;

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

    async determineWinner() {
        const winners = ['Игрок 1', 'Игрок 2', 'Игрок 3', 'Вы'];
        const winner = winners[Math.floor(Math.random() * winners.length)];
        const winAmount = 100;
        
        if (winner === 'Вы') {
            if (this.app.isDemoMode) {
                const userData = this.app.getUserData();
                userData.balance += winAmount;
                userData.pvpWins += 1;
                userData.inventory.push({
                    id: Date.now(),
                    name: 'PVP Подарок',
                    type: 'pvp',
                    price: 50,
                    canSell: true
                });
                this.app.saveUserData(userData);
            } else {
                // В реальном режиме получаем выигрыш от смарт-контракта
                // await this.app.walletManager.receiveFromContract(winAmount);
            }
            this.app.showNotification(`🎉 Поздравляем! Вы выиграли ${winAmount} TON и подарок!`);
        } else {
            this.app.showNotification(`Победитель: ${winner}`);
        }
    }
}

// Инициализация PVP игры
document.addEventListener('DOMContentLoaded', () => {
    if (app) {
        new PVPGame(app);
    }
});
