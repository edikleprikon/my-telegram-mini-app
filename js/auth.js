class AuthManager {
    constructor(app) {
        this.app = app;
        this.authScreen = document.getElementById('auth-screen');
        this.connectWalletBtn = document.getElementById('connect-wallet');
        this.demoModeBtn = document.getElementById('demo-mode');
        this.walletModal = document.getElementById('wallet-modal');
        this.init();
    }

    init() {
        this.connectWalletBtn.addEventListener('click', () => this.showWalletModal());
        this.demoModeBtn.addEventListener('click', () => this.enterDemoMode());
        
        this.initWalletModal();
        
        // Проверяем, был ли пользователь уже авторизован
        this.checkPreviousAuth();
    }

    checkPreviousAuth() {
        const authData = localStorage.getItem('userAuth');
        if (authData) {
            const auth = JSON.parse(authData);
            if (auth.isAuthenticated) {
                if (auth.mode === 'wallet' && auth.walletConnected) {
                    this.hideAuthScreen();
                    this.app.showMainApp();
                } else if (auth.mode === 'demo') {
                    this.hideAuthScreen();
                    this.app.showMainApp();
                    this.app.setDemoMode(true);
                }
            }
        }
    }

    showWalletModal() {
        this.walletModal.classList.remove('hidden');
    }

    enterDemoMode() {
        const authData = {
            isAuthenticated: true,
            mode: 'demo',
            walletConnected: false,
            timestamp: Date.now()
        };
        
        localStorage.setItem('userAuth', JSON.stringify(authData));
        this.hideAuthScreen();
        this.app.showMainApp();
        this.app.setDemoMode(true);
        
        this.app.showNotification('Демо режим активирован! Используются тестовые TON');
    }

    hideAuthScreen() {
        this.authScreen.classList.add('hidden');
    }

    initWalletModal() {
        const closeBtn = this.walletModal.querySelector('.close');
        const tonkeeperBtn = document.getElementById('connect-tonkeeper');
        const telegramWalletBtn = document.getElementById('connect-telegram-wallet');
        const mytonwalletBtn = document.getElementById('connect-mytonwallet');

        closeBtn.addEventListener('click', () => {
            this.walletModal.classList.add('hidden');
        });

        this.walletModal.addEventListener('click', (e) => {
            if (e.target === this.walletModal) {
                this.walletModal.classList.add('hidden');
            }
        });

        // Обработчики для разных кошельков
        tonkeeperBtn.addEventListener('click', () => this.connectWallet('tonkeeper'));
        telegramWalletBtn.addEventListener('click', () => this.connectWallet('telegram'));
        mytonwalletBtn.addEventListener('click', () => this.connectWallet('mytonwallet'));
    }

    async connectWallet(walletType) {
        try {
            this.app.showNotification(`Подключение к ${this.getWalletName(walletType)}...`);
            
            // Имитация подключения к кошельку
            // В реальном приложении здесь будет интеграция с TON Connect 2.0
            
            await this.simulateWalletConnection(walletType);
            
            const authData = {
                isAuthenticated: true,
                mode: 'wallet',
                walletConnected: true,
                walletType: walletType,
                walletAddress: this.generateMockAddress(),
                timestamp: Date.now()
            };
            
            localStorage.setItem('userAuth', JSON.stringify(authData));
            localStorage.setItem('walletData', JSON.stringify({
                address: authData.walletAddress,
                balance: this.generateRandomBalance(),
                connected: true
            }));
            
            this.walletModal.classList.add('hidden');
            this.hideAuthScreen();
            this.app.showMainApp();
            this.app.initWallet();
            
            this.app.showNotification('Кошелёк успешно подключен!');
            
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.app.showNotification('Ошибка подключения кошелька');
        }
    }

    getWalletName(type) {
        const names = {
            'tonkeeper': 'Tonkeeper',
            'telegram': 'Telegram Wallet',
            'mytonwallet': 'MyTonWallet'
        };
        return names[type] || 'Кошелёк';
    }

    simulateWalletConnection(walletType) {
        return new Promise((resolve) => {
            // Имитация задержки подключения
            setTimeout(() => {
                // В реальном приложении здесь будет:
                // 1. Инициализация TON Connect 2.0
                // 2. Запрос на подключение
                // 3. Обработка ответа от кошелька
                resolve();
            }, 2000);
        });
    }

    generateMockAddress() {
        // Генерация mock адреса кошелька TON
        const chars = '0123456789ABCDEF';
        let address = 'EQ';
        for (let i = 0; i < 48; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }

    generateRandomBalance() {
        // Генерация случайного баланса от 10 до 1000 TON
        return Math.floor(Math.random() * 990) + 10;
    }
}
