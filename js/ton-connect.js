// Упрощенная версия TON Connect для тестирования
class TONConnectIntegration {
    constructor() {
        this.isConnected = false;
        this.walletInfo = null;
        this.init();
    }

    async init() {
        console.log('🔗 Инициализация TON Connect...');
        
        // Проверяем существующее подключение
        const savedData = localStorage.getItem('tonConnectData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.isConnected) {
                this.isConnected = true;
                this.walletInfo = data.walletInfo;
                this.updateUI();
                if (window.app) {
                    window.app.onWalletConnected(this.walletInfo);
                }
            }
        }

        // Создаем кнопки вручную для тестирования
        this.createTestButtons();
    }

    createTestButtons() {
        console.log('🎨 Создание тестовых кнопок...');
        
        // Создаем кнопки для всех контейнеров
        const containers = [
            'ton-connect-button',
            'header-wallet-connect', 
            'pvp-ton-connect-button',
            'profile-ton-connect-button',
            'modal-ton-connect-button'
        ];

        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                if (this.isConnected) {
                    // Показываем информацию о подключенном кошельке
                    container.innerHTML = `
                        <button class="tc-connected-btn" onclick="tonConnect.disconnect()">
                            <span class="wallet-status connected"></span>
                            Подключен: ${this.formatAddress(this.walletInfo?.account?.address || 'EQ...')}
                        </button>
                    `;
                } else {
                    // Показываем кнопку подключения
                    container.innerHTML = `
                        <button class="tc-connect-btn" onclick="tonConnect.connect()">
                            <span class="wallet-icon">🔗</span>
                            Подключить кошелёк
                        </button>
                    `;
                }
            }
        });
    }

    async connect() {
        console.log('🔗 Подключение кошелька...');
        
        // Имитация подключения кошелька
        this.isConnected = true;
        this.walletInfo = {
            account: {
                address: 'EQ' + Math.random().toString(36).substr(2, 48).toUpperCase(),
                chain: '-239',
                walletStateInit: 'test'
            },
            device: {
                platform: 'ios',
                appName: 'Tonkeeper',
                appVersion: '3.4.1'
            },
            provider: 'tonkeeper'
        };

        // Сохраняем данные
        this.saveWalletConnection();
        
        // Обновляем UI
        this.createTestButtons();
        this.updateUI();
        
        // Уведомляем приложение
        if (window.app) {
            window.app.onWalletConnected(this.walletInfo);
        }

        this.showNotification('Кошелёк успешно подключен! (тестовый режим)');
    }

    async disconnect() {
        console.log('🔗 Отключение кошелька...');
        
        this.isConnected = false;
        this.walletInfo = null;
        
        // Очищаем данные
        localStorage.removeItem('tonConnectData');
        
        // Обновляем UI
        this.createTestButtons();
        this.updateUI();
        
        // Уведомляем приложение
        if (window.app) {
            window.app.onWalletDisconnected();
        }

        this.showNotification('Кошелёк отключен');
    }

    updateUI() {
        if (this.isConnected && this.walletInfo) {
            // Обновляем баланс
            const balanceElement = document.getElementById('wallet-balance');
            if (balanceElement) {
                balanceElement.textContent = '150.75 TON'; // Тестовый баланс
            }

            // Обновляем статус в профиле
            const statusElement = document.getElementById('profile-wallet-status');
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="status-dot connected"></span>
                    <span>Кошелёк подключен</span>
                `;
            }
        } else {
            // Сбрасываем отображение
            const balanceElement = document.getElementById('wallet-balance');
            if (balanceElement) {
                balanceElement.textContent = '0 TON';
            }
            
            const statusElement = document.getElementById('profile-wallet-status');
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="status-dot disconnected"></span>
                    <span>Кошелёк не подключен</span>
                `;
            }
        }
    }

    formatAddress(address) {
        if (!address) return 'EQ...';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    saveWalletConnection() {
        const connectionData = {
            isConnected: true,
            walletInfo: this.walletInfo,
            timestamp: Date.now()
        };
        localStorage.setItem('tonConnectData', JSON.stringify(connectionData));
    }

    getConnectionStatus() {
        return this.isConnected;
    }

    getWalletInfo() {
        return this.walletInfo;
    }

    showNotification(message) {
        if (window.app) {
            window.app.showNotification(message);
        } else {
            alert(message);
        }
    }
}

// Глобальная переменная для TON Connect
let tonConnect;

// Инициализация когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔗 Инициализация TON Connect...');
    tonConnect = new TONConnectIntegration();
});
