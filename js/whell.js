class FortuneWheel {
    constructor(app) {
        this.app = app;
        this.wheel = document.getElementById('fortune-wheel');
        this.spinButton = document.getElementById('spin-fortune');
        this.ticketCount = document.getElementById('ticket-count');
        this.isSpinning = false;
        this.init();
    }

    init() {
        this.spinButton.addEventListener('click', () => this.spinWheel());
        this.updateTicketDisplay();
    }

    updateTicketDisplay() {
        const userData = this.app.getUserData();
        this.ticketCount.textContent = userData.tickets;
    }

    spinWheel() {
        if (this.isSpinning) return;

        const userData = this.app.getUserData();
        
        if (userData.tickets <= 0) {
            if (userData.balance < 1) {
                this.app.showNotification('Недостаточно TON для покупки билета!');
                return;
            }
            // Покупка билета
            userData.balance -= 1;
            userData.tickets += 1;
            this.app.saveUserData(userData);
            this.updateTicketDisplay();
        }

        this.isSpinning = true;
        this.spinButton.disabled = true;

        // Использование билета
        userData.tickets -= 1;
        this.app.saveUserData(userData);
        this.updateTicketDisplay();

        // Анимация вращения
        this.wheel.style.animation = 'none';
        setTimeout(() => {
            this.wheel.classList.add('wheel-spinning');
        }, 50);

        // Определение приза
        setTimeout(() => {
            this.givePrize();
            this.wheel.classList.remove('wheel-spinning');
            this.wheel.style.animation = 'wheel-rotate 20s linear infinite';
            this.isSpinning = false;
            this.spinButton.disabled = false;
        }, 3000);
    }

    givePrize() {
        const prizes = [
            { type: 'small', amount: 5, name: 'Малый приз' },
            { type: 'medium', amount: 10, name: 'Средний приз' },
            { type: 'large', amount: 25, name: 'Большой приз' },
            { type: 'gift', amount: 0, name: 'Особый подарок' }
        ];
        
        const prize = prizes[Math.floor(Math.random() * prizes.length)];
        const userData = this.app.getUserData();

        if (prize.type === 'gift') {
            userData.inventory.push({
                id: Date.now(),
                name: prize.name,
                type: 'fortune',
                price: 30,
                canSell: true
            });
            userData.prizesWon += 1;
            this.app.showNotification(`🎁 Вы выиграли ${prize.name}!`);
        } else {
            userData.balance += prize.amount;
            this.app.showNotification(`🎉 Вы выиграли ${prize.amount} TON!`);
        }

        this.app.saveUserData(userData);
    }
}

// Инициализация колеса фортуны
document.addEventListener('DOMContentLoaded', () => {
    if (app) {
        new FortuneWheel(app);
    }
});
