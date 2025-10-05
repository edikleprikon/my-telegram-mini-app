class AuthManager {
    constructor(app) {
        this.app = app;
        this.authScreen = document.getElementById('auth-screen');
        this.demoModeBtn = document.getElementById('demo-mode');
        this.init();
    }

    init() {
        this.demoModeBtn.addEventListener('click', () => this.enterDemoMode());
        
        // Проверяем существующее подключение TON Connect
        this.checkTONConnectConnection();
        
        // Инициализируем TON Connect кнопку в PVP разделе
        this.initPVPConnectButton();
    }

    checkTONConnectConnection() {
        const connectionData = localStorage.getItem('tonConnectData');
        if (connectionData) {
            const data = JSON.parse(connectionData);
            if (data.isConnected && window.tonConnect) {
                // Автоматически скрываем экран авторизации если кошелёк подключен
                setTimeout(() => {
                    this.hideAuthScreen();
                    this.app.showMainApp();
                    this.app.setDemoMode(false);
                }, 1000);
            }
        }
    }

    initPVPConnectButton() {
        // Создаем TON Connect кнопку для PVP раздела
        const pvpConnectContainer = document.getElementById('pvp-ton-connect-button');
        if (pvpConnectContainer && window.TonConnectUI) {
            new TonConnectUI.TonConnect({
                manifestUrl: 'https://your-app.com/tonconnect-manifest.json',
                buttonRootId: 'pvp-ton-connect-button',
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/your_bot/app'
                }
            });
        }
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
}
