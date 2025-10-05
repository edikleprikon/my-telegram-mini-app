class TelegramMiniApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.currentPage = 'pvp-page';
        this.userData = null;
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
            this.showMainApp();
            this.initNavigation();
            this.loadUserData();
        }, 2000);
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('app').classList.remove('hidden');
    }

    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.getAttribute('data-page');
                this.switchPage(targetPage);
                
                // Обновление активной кнопки
                navButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
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
        alert(message);
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TelegramMiniApp();
});
