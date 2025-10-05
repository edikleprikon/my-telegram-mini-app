// TON Connect 2.0 интеграция
class TONConnectIntegration {
    constructor() {
        this.connector = null;
        this.walletInfo = null;
        this.isConnected = false;
        this.manifestUrl = 'https://your-app.com/tonconnect-manifest.json';
        this.init();
    }

    async init() {
        try {
            // Инициализация TON Connect
            this.connector = new TonConnectUI.TonConnect({
                manifestUrl: this.manifestUrl,
                buttonRootId: 'ton-connect-button'
            });

            // Подписка на события
            this.connector.onStatusChange(wallet => {
                this.handleWalletChange(wallet);
            });

            // Проверяем существующее подключение
            const currentWallet = this.connector.wallet;
            if (currentWallet) {
                await this.handleWalletChange(currentWallet);
            }

        } catch (error) {
            console.error('TON Connect initialization error:', error);
        }
    }

    async handleWalletChange(wallet) {
        if (wallet) {
            this.walletInfo = wallet;
            this.isConnected = true;
            await this.updateWalletData();
            
            // Сохраняем данные о подключении
            this.saveWalletConnection();
            
            // Уведомляем приложение
            if (window.app) {
                window.app.onWalletConnected(this.walletInfo);
            }
            
        } else {
            this.isConnected = false;
            this.walletInfo = null;
            this.clearWalletData();
            
            // Уведомляем приложение
            if (window.app) {
                window.app.onWalletDisconnected();
            }
        }
    }

    async updateWalletData() {
        if (!this.walletInfo) return;

        try {
            // Получаем баланс кошелька
            const balance = await this.getWalletBalance();
            
            // Обновляем данные
            this.walletInfo.balance = balance;
            
            // Обновляем UI
            this.updateUI();

        } catch (error) {
            console.error('Error updating wallet data:', error);
        }
    }

    async getWalletBalance() {
        if (!this.walletInfo?.account?.address) return 0;

        try {
            // Используем TON API для получения баланса
            const response = await fetch(`https://tonapi.io/v2/accounts/${this.walletInfo.account.address}`);
            const data = await response.json();
            
            // Конвертируем наноTON в TON
            return parseInt(data.balance) / 1000000000;
            
        } catch (error) {
            console.error('Error fetching balance:', error);
            return 0;
        }
    }

    updateUI() {
        if (this.isConnected && this.walletInfo) {
            // Обновляем отображение баланса
            const balanceElement = document.getElementById('wallet-balance');
            if (balanceElement) {
                balanceElement.textContent = `${this.walletInfo.balance?.toFixed(2) || '0'} TON`;
            }

            // Обновляем статус подключения
            this.updateConnectionStatus(true);
            
        } else {
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(connected) {
        const connectContainer = document.getElementById('wallet-connect-container');
        if (!connectContainer) return;

        if (connected) {
            connectContainer.innerHTML = `
                <div class="wallet-connected">
                    <span class="wallet-status connected"></span>
                    <span class="wallet-address">${this.formatAddress(this.walletInfo.account.address)}</span>
                    <button id="disconnect-wallet" class="btn-disconnect">Отключить</button>
                </div>
            `;

            // Добавляем обработчик для отключения
            document.getElementById('disconnect-wallet').addEventListener('click', () => {
                this.disconnect();
            });

        } else {
            connectContainer.innerHTML = `
                <div id="header-ton-connect-button"></div>
            `;

            // Инициализируем кнопку в хедере
            if (this.connector) {
                new TonConnectUI.TonConnect({
                    manifestUrl: this.manifestUrl,
                    buttonRootId: 'header-ton-connect-button'
                });
            }
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    async disconnect() {
        try {
            await this.connector.disconnect();
            this.clearWalletData();
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    }

    saveWalletConnection() {
        const connectionData = {
            isConnected: true,
            walletInfo: this.walletInfo,
            timestamp: Date.now()
        };
        localStorage.setItem('tonConnectData', JSON.stringify(connectionData));
    }

    clearWalletData() {
        localStorage.removeItem('tonConnectData');
        this.updateConnectionStatus(false);
    }

    // Метод для отправки транзакций
    async sendTransaction(transaction) {
        if (!this.isConnected) {
            throw new Error('Кошелёк не подключен');
        }

        try {
            const result = await this.connector.sendTransaction(transaction);
            return result;
            
        } catch (error) {
            console.error('Transaction error:', error);
            throw error;
        }
    }

    // Создание транзакции для игры
    createGameTransaction(toAddress, amount, payload = '') {
        return {
            validUntil: Math.floor(Date.now() / 1000) + 300, // 5 минут
            messages: [
                {
                    address: toAddress,
                    amount: (amount * 1000000000).toString(), // Конвертируем в наноTON
                    payload: payload
                }
            ]
        };
    }

    // Получение информации о кошельке
    getWalletInfo() {
        return this.walletInfo;
    }

    // Проверка подключения
    getConnectionStatus() {
        return this.isConnected;
    }
}

// Глобальная переменная для TON Connect
let tonConnect;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    tonConnect = new TONConnectIntegration();
});
