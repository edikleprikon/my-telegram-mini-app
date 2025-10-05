// TON Connect 2.0 интеграция с улучшенными кнопками
class TONConnectIntegration {
    constructor() {
        this.connector = null;
        this.walletInfo = null;
        this.isConnected = false;
        this.manifestUrl = 'https://your-app.com/tonconnect-manifest.json';
        this.buttons = {};
        this.init();
    }

    async init() {
        try {
            // Инициализация основной кнопки TON Connect
            this.buttons.main = new TonConnectUI.TonConnect({
                manifestUrl: this.manifestUrl,
                buttonRootId: 'ton-connect-button',
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/your_bot/app'
                },
                uiPreferences: {
                    theme: 'DARK',
                    colorsSet: {
                        connectButton: {
                            background: '#0088cc',
                            foreground: '#ffffff'
                        }
                    }
                }
            });

            // Инициализация кнопки в хедере
            this.buttons.header = new TonConnectUI.TonConnect({
                manifestUrl: this.manifestUrl,
                buttonRootId: 'header-wallet-connect',
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/your_bot/app'
                },
                uiPreferences: {
                    theme: 'DARK',
                    colorsSet: {
                        connectButton: {
                            background: 'transparent',
                            foreground: '#ffffff'
                        }
                    }
                }
            });

            // Инициализация кнопки в PVP разделе
            this.buttons.pvp = new TonConnectUI.TonConnect({
                manifestUrl: this.manifestUrl,
                buttonRootId: 'pvp-ton-connect-button',
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/your_bot/app'
                },
                uiPreferences: {
                    theme: 'DARK',
                    colorsSet: {
                        connectButton: {
                            background: '#0088cc',
                            foreground: '#ffffff'
                        }
                    }
                }
            });

            // Инициализация кнопки в профиле
            this.buttons.profile = new TonConnectUI.TonConnect({
                manifestUrl: this.manifestUrl,
                buttonRootId: 'profile-ton-connect-button',
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/your_bot/app'
                },
                uiPreferences: {
                    theme: 'DARK',
                    colorsSet: {
                        connectButton: {
                            background: '#0088cc',
                            foreground: '#ffffff'
                        }
                    }
                }
            });

            // Инициализация кнопки в модальном окне
            this.buttons.modal = new TonConnectUI.TonConnect({
                manifestUrl: this.manifestUrl,
                buttonRootId: 'modal-ton-connect-button',
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/your_bot/app'
                },
                uiPreferences: {
                    theme: 'DARK',
                    colorsSet: {
                        connectButton: {
                            background: '#0088cc',
                            foreground: '#ffffff'
                        }
                    }
                }
            });

            // Подписка на события для всех кнопок
            Object.values(this.buttons).forEach(connector => {
                connector.onStatusChange(wallet => {
                    this.handleWalletChange(wallet);
                });
            });

            // Проверяем существующее подключение
            const currentWallet = this.buttons.main.wallet;
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
            
            // Синхронизируем все кнопки
            this.syncAllButtons();
            
            // Уведомляем приложение
            if (window.app) {
                window.app.onWalletConnected(this.walletInfo);
            }
            
        } else {
            this.isConnected = false;
            this.walletInfo = null;
            this.clearWalletData();
            
            // Синхронизируем все кнопки
            this.syncAllButtons();
            
            // Уведомляем приложение
            if (window.app) {
                window.app.onWalletDisconnected();
            }
        }
    }

    syncAllButtons() {
        // Синхронизируем состояние всех кнопок
        Object.values(this.buttons).forEach(connector => {
            if (this.isConnected && this.walletInfo) {
                // Обновляем подключенное состояние
                this.updateButtonStyle(connector, 'connected');
            } else {
                // Возвращаем в состояние подключения
                this.updateButtonStyle(connector, 'disconnected');
            }
        });
    }

    updateButtonStyle(connector, state) {
        // Можно добавить кастомные стили для разных состояний
        const buttonElement = connector.getButtonRoot();
        if (buttonElement) {
            if (state === 'connected') {
                buttonElement.classList.add('tc-connected');
            } else {
                buttonElement.classList.remove('tc-connected');
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

            // Обновляем статус в профиле
            this.updateProfileWalletStatus(true);
            
        } else {
            // Сбрасываем отображение
            const balanceElement = document.getElementById('wallet-balance');
            if (balanceElement) {
                balanceElement.textContent = '0 TON';
            }
            
            this.updateProfileWalletStatus(false);
        }
    }

    updateProfileWalletStatus(connected) {
        const statusElement = document.getElementById('profile-wallet-status');
        if (!statusElement) return;

        if (connected) {
            statusElement.innerHTML = `
                <span class="status-dot connected"></span>
                <span>Кошелёк подключен</span>
            `;
        } else {
            statusElement.innerHTML = `
                <span class="status-dot disconnected"></span>
                <span>Кошелёк не подключен</span>
            `;
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    async disconnect() {
        try {
            await this.buttons.main.disconnect();
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
    }

    // Метод для отправки транзакций
    async sendTransaction(transaction) {
        if (!this.isConnected) {
            throw new Error('Кошелёк не подключен');
        }

        try {
            const result = await this.buttons.main.sendTransaction(transaction);
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

    // Показать модальное окно подключения
    showConnectModal() {
        const modal = document.getElementById('wallet-connect-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Добавляем обработчик закрытия
            const closeBtn = modal.querySelector('.close');
            closeBtn.onclick = () => modal.classList.add('hidden');
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            };
        }
    }
}

// Глобальная переменная для TON Connect
let tonConnect;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    tonConnect = new TONConnectIntegration();
});
