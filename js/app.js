class TelegramMiniApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.currentPage = 'pvp-page';
        this.userData = null;
        this.isDemoMode = false;
        this.walletManager = null;
        this.init();
    }

    init() {
        // Инициализация Telegram WebApp
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        
        // Получение данных пользователя
        this.userData = this.tg.initDataUnsafe?.user || {
            id: 1,
            first_name: 'Тестовый',
            last_name: 'Пользователь',
            username: 'test_user'
        };

        // Имитация загрузки
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showAuthScreen();
            this.initAuth();
        }, 2000);
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    showAuthScreen() {
        document.getElementById('auth-screen').classList.remove('hidden');
    }

    showMainApp() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.initNavigation();
        this.loadUserData();
        this.initWallet();
    }

    initAuth() {
        this.authManager = new AuthManager(this);
    }

    initWallet() {
        this.walletManager = new WalletManager(this);
        
        // Проверяем, требуется ли кошелёк для текущей страницы
        this.checkWalletRequirements();
    }

    setDemoMode(demo) {
        this.isDemoMode = demo;
        this.updateDemoIndicators();
    }

    updateDemoIndicators() {
        const demoIndicator = document.createElement('div');
        demoIndicator.className = 'demo-indicator';
        demoIndicator.textContent = 'DEMO MODE';
        demoIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 5px 10px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
        `;

        if (this.isDemoMode) {
            document.body.appendChild(demoIndicator);
        } else {
            const existing = document.querySelector('.demo-indicator');
            if (existing) {
                existing.remove();
            }
        }
    }

    checkWalletRequirements() {
        const authData = localStorage.getItem('userAuth');
        if (!authData) return;

        const auth = JSON.parse(authData);
        const isWalletConnected = auth.walletConnected;
        
        // Для PVP страницы проверяем подключение кошелька
        const pvpContainer = document.getElementById('pvp-game-container');
        const pvpWalletRequired = document.getElementById('pvp-wallet-required');
        
        if (isWalletConnected) {
            pvpContainer.classList.remove('hidden');
            pvpWalletRequired.classList.add('hidden');
        } else {
            pvpContainer.classList.add('hidden');
            pvpWalletRequired.classList.remove('hidden');
            
            // Добавляем обработчик для кнопки подключения в PVP
            document.getElementById('pvp-connect-btn').addEventListener('click', () => {
                document.getElementById('wallet-modal').classList.remove('hidden');
            });
        }
    }

    // Остальные методы остаются без изменений
    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.getAttribute('data-page');
                this.switchPage(targetPage);
                
                // Обновление активной кнопки
                navButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Проверяем требования кошелька при переключении страниц
                this.checkWalletRequirements();
            });
        });
    }

    switchPage(pageId) {
        // Скрыть все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Показать выбранную страницу
        document.getElementById(pageId).classList.add('active');
        this.currentPage = pageId;
    }

    loadUserData() {
        // Загрузка данных пользователя из localStorage
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            this.updateProfile(userData);
        } else {
            // Создание начальных данных
            const initialData = {
                balance: 100,
                pvpWins: 0,
                prizesWon: 0,
                tickets: 0,
                inventory: [
                    { id: 1, name: 'Обычный подарок', type: 'common', price: 10, canSell: true },
                    { id: 2, name: 'Редкий подарок', type: 'rare', price: 25, canSell: true }
                ]
            };
            localStorage.setItem('userData', JSON.stringify(initialData));
            this.updateProfile(initialData);
        }
    }

    updateProfile(data) {
        document.getElementById('user-balance').textContent = data.balance;
        document.getElementById('pvp-wins').textContent = data.pvpWins;
        document.getElementById('prizes-won').textContent = data.prizesWon;
        document.getElementById('ticket-count').textContent = data.tickets;
        
        // Обновление аватара и имени
        document.getElementById('user-avatar').textContent = 
            this.userData.first_name?.[0] || 'U';
        document.getElementById('user-name').textContent = 
            `${this.userData.first_name || 'Пользователь'} ${this.userData.last_name || ''}`.trim();
    }

    // Утилиты для работы с данными
    saveUserData(data) {
        localStorage.setItem('userData', JSON.stringify(data));
        this.updateProfile(data);
    }

    getUserData() {
        return JSON.parse(localStorage.getItem('userData'));
    }

    showNotification(message, type = 'info') {
        // Простая реализация уведомления
        if (this.tg.showPopup) {
            this.tg.showPopup({
                title: type === 'error' ? 'Ошибка' : 'Уведомление',
                message: message,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert(message);
        }
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TelegramMiniApp();
});
