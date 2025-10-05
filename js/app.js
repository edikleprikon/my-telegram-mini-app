class TelegramMiniApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.currentPage = 'pvp-page';
        this.userData = null;
        this.isDemoMode = false;
        this.walletManager = null;
        this.authManager = null;
        this.isInitialized = false;
        
        // Сохраняем экземпляр в глобальной области
        window.app = this;
        
        this.init();
    }

    init() {
        console.log('🚀 Инициализация приложения...');
        
        // Инициализация Telegram WebApp
        if (this.tg) {
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            console.log('✅ Telegram WebApp инициализирован');
        }

        // Получение данных пользователя
        this.userData = this.tg?.initDataUnsafe?.user || {
            id: 1,
            first_name: 'Тестовый',
            last_name: 'Пользователь',
            username: 'test_user'
        };

        console.log('👤 Данные пользователя:', this.userData);

        // Имитация загрузки
        setTimeout(() => {
            this.hideLoadingScreen();
            this.checkInitialAuth();
            this.isInitialized = true;
            console.log('✅ Приложение полностью инициализировано');
        }, 2000);
    }

    checkInitialAuth() {
        console.log('🔐 Проверка авторизации...');
        const authData = localStorage.getItem('userAuth');
        const tonConnectData = localStorage.getItem('tonConnectData');

        if (tonConnectData && JSON.parse(tonConnectData).isConnected) {
            console.log('✅ Найден подключенный кошелёк');
            this.showMainApp();
            this.setDemoMode(false);
        } else if (authData && JSON.parse(authData).isAuthenticated) {
            console.log('✅ Пользователь в демо-режиме');
            this.showMainApp();
            this.setDemoMode(true);
        } else {
            console.log('🔄 Показываем экран авторизации');
            this.showAuthScreen();
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            console.log('✅ Загрузочный экран скрыт');
        }
    }

    showAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        const appContainer = document.getElementById('app');
        
        if (authScreen && appContainer) {
            authScreen.classList.remove('hidden');
            appContainer.classList.add('hidden');
            this.initAuth();
            console.log('✅ Экран авторизации показан');
        }
    }

    showMainApp() {
        const authScreen = document.getElementById('auth-screen');
        const appContainer = document.getElementById('app');
        
        if (authScreen && appContainer) {
            authScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            this.initNavigation();
            this.loadUserData();
            this.initWallet();
            console.log('✅ Главное приложение показано');
        }
    }

    initAuth() {
        console.log('🔐 Инициализация авторизации...');
        // Инициализация будет в отдельном файле auth.js
        // Но добавим базовые обработчики здесь для надежности
        
        const demoModeBtn = document.getElementById('demo-mode-btn');
        if (demoModeBtn) {
            demoModeBtn.addEventListener('click', () => {
                console.log('🎮 Нажата кнопка демо-режима');
                this.enterDemoMode();
            });
        }
    }

    initNavigation() {
        console.log('🧭 Инициализация навигации...');
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.getAttribute('data-page');
                console.log('📱 Переключение на страницу:', targetPage);
                this.switchPage(targetPage);
                
                // Обновление активной кнопки
                navButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Проверяем требования кошелька при переключении страниц
                this.checkWalletRequirements();
            });
        });

        // Инициализация кнопок демо-режима
        this.initDemoButtons();
    }

    initDemoButtons() {
        console.log('🎮 Инициализация кнопок демо-режима...');
        
        // Кнопка демо-режима в PVP
        const pvpDemoBtn = document.getElementById('pvp-demo-btn');
        if (pvpDemoBtn) {
            pvpDemoBtn.addEventListener('click', () => {
                console.log('🎮 Демо-режим из PVP');
                this.enterDemoMode();
            });
        }

        // Кнопка демо-режима в профиле
        const profileDemoBtn = document.getElementById('profile-demo-btn');
        if (profileDemoBtn) {
            profileDemoBtn.addEventListener('click', () => {
                console.log('🎮 Демо-режим из профиля');
                this.enterDemoMode();
            });
        }

        // Кнопка демо-режима в модальном окне
        const modalDemoBtn = document.getElementById('modal-demo-btn');
        if (modalDemoBtn) {
            modalDemoBtn.addEventListener('click', () => {
                console.log('🎮 Демо-режим из модального окна');
                this.enterDemoMode();
            });
        }

        // Кнопка закрытия модального окна
        const closeModalBtn = document.getElementById('close-wallet-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideWalletModal();
            });
        }
    }

    switchPage(pageId) {
        console.log('🔄 Переключение на страницу:', pageId);
        // Скрыть все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Показать выбранную страницу
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            console.log('✅ Страница активирована:', pageId);
        }
    }

    enterDemoMode() {
        console.log('🎮 Активация демо-режима...');
        const authData = {
            isAuthenticated: true,
            mode: 'demo',
            walletConnected: false,
            timestamp: Date.now()
        };
        
        localStorage.setItem('userAuth', JSON.stringify(authData));
        
        // Закрываем модальные окна
        this.hideWalletModal();
        
        this.hideAuthScreen();
        this.showMainApp();
        this.setDemoMode(true);
        
        this.showNotification('Демо режим активирован! Используются тестовые TON');
    }

    hideWalletModal() {
        const modal = document.getElementById('wallet-connect-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    hideAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) {
            authScreen.classList.add('hidden');
        }
    }

    setDemoMode(demo) {
        this.isDemoMode = demo;
        this.updateDemoIndicators();
        console.log('🎮 Демо-режим:', demo ? 'включен' : 'выключен');
    }

    updateDemoIndicators() {
        let demoIndicator = document.querySelector('.demo-indicator');
        
        if (this.isDemoMode) {
            if (!demoIndicator) {
                demoIndicator = document.createElement('div');
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
                document.body.appendChild(demoIndicator);
            }
        } else if (demoIndicator) {
            demoIndicator.remove();
        }
    }

    initWallet() {
        console.log('💰 Инициализация кошелька...');
        // Кошелек инициализируется в отдельном файле
        this.checkWalletRequirements();
    }

    checkWalletRequirements() {
        const isWalletConnected = window.tonConnect ? window.tonConnect.getConnectionStatus() : false;
        console.log('🔗 Статус кошелька:', isWalletConnected ? 'подключен' : 'не подключен');
        
        // Для PVP страницы проверяем подключение кошелька
        const pvpContainer = document.getElementById('pvp-game-container');
        const pvpWalletRequired = document.getElementById('pvp-wallet-required');
        
        if (pvpContainer && pvpWalletRequired) {
            if (isWalletConnected || this.isDemoMode) {
                pvpContainer.classList.remove('hidden');
                pvpWalletRequired.classList.add('hidden');
                console.log('✅ PVP игра доступна');
            } else {
                pvpContainer.classList.add('hidden');
                pvpWalletRequired.classList.remove('hidden');
                console.log('❌ PVP игра требует кошелёк');
            }
        }
    }

    loadUserData() {
        console.log('📊 Загрузка данных пользователя...');
        // Загрузка данных пользователя из localStorage
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            this.updateProfile(userData);
            console.log('✅ Данные пользователя загружены');
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
            console.log('✅ Созданы начальные данные пользователя');
        }
    }

    updateProfile(data) {
        console.log('👤 Обновление профиля...');
        const balanceElement = document.getElementById('user-balance');
        const pvpWinsElement = document.getElementById('pvp-wins');
        const prizesWonElement = document.getElementById('prizes-won');
        const ticketCountElement = document.getElementById('ticket-count');
        const userAvatarElement = document.getElementById('user-avatar');
        const userNameElement = document.getElementById('user-name');
        const userTelegramIdElement = document.getElementById('user-telegram-id');

        if (balanceElement) balanceElement.textContent = data.balance;
        if (pvpWinsElement) pvpWinsElement.textContent = data.pvpWins;
        if (prizesWonElement) prizesWonElement.textContent = data.prizesWon;
        if (ticketCountElement) ticketCountElement.textContent = data.tickets;
        
        // Обновление аватара и имени
        if (userAvatarElement) {
            userAvatarElement.textContent = this.userData.first_name?.[0] || 'U';
        }
        if (userNameElement) {
            userNameElement.textContent = 
                `${this.userData.first_name || 'Пользователь'} ${this.userData.last_name || ''}`.trim();
        }
        if (userTelegramIdElement) {
            userTelegramIdElement.textContent = `@${this.userData.username || 'username'}`;
        }
    }

    // Обработчики событий от TON Connect
    onWalletConnected(walletInfo) {
        console.log('✅ Кошелёк подключен:', walletInfo);
        this.setDemoMode(false);
        this.checkWalletRequirements();
        this.showNotification('Кошелёк успешно подключен!');
    }

    onWalletDisconnected() {
        console.log('❌ Кошелёк отключен');
        this.setDemoMode(true);
        this.checkWalletRequirements();
        this.showNotification('Кошелёк отключен');
    }

    showNotification(message, type = 'info') {
        console.log('💬 Уведомление:', message);
        // Простая реализация уведомления
        if (this.tg?.showPopup) {
            this.tg.showPopup({
                title: type === 'error' ? 'Ошибка' : 'Уведомление',
                message: message,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert(message);
        }
    }

    // Утилиты для работы с данными
    saveUserData(data) {
        localStorage.setItem('userData', JSON.stringify(data));
        this.updateProfile(data);
    }

    getUserData() {
        return JSON.parse(localStorage.getItem('userData') || '{}');
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, запускаем приложение...');
    new TelegramMiniApp();
});
