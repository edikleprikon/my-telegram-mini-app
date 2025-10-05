class TelegramMiniApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.currentPage = 'pvp-page';
        this.userData = null;
        this.isDemoMode = false;
        this.walletManager = null;
        this.authManager = null;
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

        // Сохраняем ссылку на приложение в глобальной области
        window.app = this;

        // Имитация загрузки
        setTimeout(() => {
            this.hideLoadingScreen();
            this.checkInitialAuth();
        }, 2000);
    }

    checkInitialAuth() {
        const authData = localStorage.getItem('userAuth');
        const tonConnectData = localStorage.getItem('tonConnectData');

        if (tonConnectData && JSON.parse(tonConnectData).isConnected) {
            // Пользователь уже подключил кошелёк через TON Connect
            this.showMainApp();
            this.setDemoMode(false);
        } else if (authData && JSON.parse(authData).isAuthenticated) {
            // Пользователь в демо-режиме
            this.showMainApp();
            this.setDemoMode(true);
        } else {
            // Показываем экран авторизации
            this.showAuthScreen();
        }
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    showAuthScreen() {
        document.getElementById('auth-screen').classList.remove('hidden');
        this.initAuth();
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
        this.checkWalletRequirements();
    }

    // Обработчики событий от TON Connect
    onWalletConnected(walletInfo) {
        if (this.walletManager) {
            this.walletManager.onWalletConnected(walletInfo);
        }
        
        // Сохраняем данные авторизации
        const authData = {
            isAuthenticated: true,
            mode: 'wallet',
            walletConnected: true,
            timestamp: Date.now()
        };
        localStorage.setItem('userAuth', JSON.stringify(authData));
        
        this.setDemoMode(false);
        this.checkWalletRequirements();
        
        this.showNotification('Кошелёк успешно подключен!');
    }

    onWalletDisconnected() {
        if (this.walletManager) {
            this.walletManager.onWalletDisconnected();
        }
        
        // Обновляем данные авторизации
        const authData = {
            isAuthenticated: true,
            mode: 'demo',
            walletConnected: false,
            timestamp: Date.now()
        };
        localStorage.setItem('userAuth', JSON.stringify(authData));
        
        this.setDemoMode(true);
        this.checkWalletRequirements();
        
        this.showNotification('Кошелёк отключен');
    }

    // Остальные методы остаются без изменений...
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
        const isWalletConnected = this.walletManager?.isConnected || false;
        
        // Для PVP страницы проверяем подключение кошелька
        const pvpContainer = document.getElementById('pvp-game-container');
        const pvpWalletRequired = document.getElementById('pvp-wallet-required');
        
        if (isWalletConnected) {
            pvpContainer.classList.remove('hidden');
            pvpWalletRequired.classList.add('hidden');
        } else {
            pvpContainer.classList.add('hidden');
            pvpWalletRequired.classList.remove('hidden');
        }
    }

    // ... остальные методы без изменений
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TelegramMiniApp();
});
class TelegramMiniApp {
    // ... существующий код ...

    enterDemoMode() {
        const authData = {
            isAuthenticated: true,
            mode: 'demo',
            walletConnected: false,
            timestamp: Date.now()
        };
        
        localStorage.setItem('userAuth', JSON.stringify(authData));
        
        // Закрываем модальные окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        this.hideAuthScreen();
        this.showMainApp();
        this.setDemoMode(true);
        
        this.showNotification('Демо режим активирован! Используются тестовые TON');
    }

    // ... остальной код ...
}

// Делаем метод доступным глобально для кнопок
window.app = new TelegramMiniApp();
