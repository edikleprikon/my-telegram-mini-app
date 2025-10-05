class WalletManager {
    constructor(app) {
        this.app = app;
        this.walletInfo = document.getElementById('wallet-info');
        this.walletBalance = document.getElementById('wallet-balance');
        this.walletConnectBtn = document.getElementById('wallet-connect-btn');
        this.isConnected = false;
        this.walletData = null;
        this.init();
    }

    init() {
        this.walletConnectBtn.addEventListener('click', () => this.showWalletModal());
        this.loadWalletData();
    }

    loadWalletData() {
        const walletData = localStorage.getItem('walletData');
        const authData = localStorage.getItem('userAuth');
        
        if (walletData && authData) {
            const auth = JSON.parse(authData);
            if (auth.walletConnected) {
                this.walletData = JSON.parse(walletData);
                this.isConnected = true;
                this.updateWalletDisplay();
            }
        }
    }

    updateWalletDisplay() {
        if (this.isConnected && this.walletData) {
            this.walletBalance.textContent = `${this.walletData.balance} TON`;
            const status = this.walletConnectBtn.querySelector('.wallet-status');
            status.classList.remove('disconnected');
            status.classList.add('connected');
            this.walletConnectBtn.innerHTML = `
                <span class="wallet-status connected"></span>
                ${this.formatAddress(this.walletData.address)}
            `;
        } else {
            this.walletBalance.textContent = '0 TON';
            const status = this.walletConnectBtn.querySelector('.wallet-status');
            status.classList.remove('connected');
            status.classList.add('disconnected');
            this.walletConnectBtn.innerHTML = `
                <span class="wallet-status disconnected"></span>
                Подключить кошелёк
            `;
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    showWalletModal() {
        if (this.isConnected) {
            this.showWalletMenu();
        } else {
            // Показываем модальное окно выбора кошелька
            document.getElementById('wallet-modal').classList.remove('hidden');
        }
    }

    showWalletMenu() {
        // Создаем контекстное меню для подключенного кошелька
        const menu = document.createElement('div');
        menu.className = 'wallet-menu';
        menu.innerHTML = `
            <div class="wallet-menu-content">
                <div class="menu-header">
                    <h4>Кошелёк</h4>
                    <button class="menu-close">&times;</button>
                </div>
                <div class="menu-balance">
                    <span>Баланс: ${this.walletData.balance} TON</span>
                </div>
                <div class="menu-address">
                    <span>Адрес: ${this.formatAddress(this.walletData.address)}</span>
                    <button class="btn-copy">📋</button>
                </div>
                <div class="menu-actions">
                    <button class="menu-btn" id="disconnect-wallet">Отключить</button>
                    <button class="menu-btn" id="view-transactions">Транзакции</button>
                </div>
            </div>
        `;

        // Стили для меню
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const menuContent = menu.querySelector('.wallet-menu-content');
        menuContent.style.cssText = `
            background: #2d2d2d;
            padding: 20px;
            border-radius: 15px;
            max-width: 300px;
            width: 90%;
        `;

        document.body.appendChild(menu);

        // Обработчики событий
        menu.querySelector('.menu-close').addEventListener('click', () => {
            document.body.removeChild(menu);
        });

        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                document.body.removeChild(menu);
            }
        });

        menu.querySelector('#disconnect-wallet').addEventListener('click', () => {
            this.disconnectWallet();
            document.body.removeChild(menu);
        });

        menu.querySelector('.btn-copy').addEventListener('click', () => {
            this.copyToClipboard(this.walletData.address);
            this.app.showNotification('Адрес скопирован в буфер обмена');
        });
    }

    disconnectWallet() {
        this.isConnected = false;
        this.walletData = null;
        
        // Обновляем данные авторизации
        const authData = localStorage.getItem('userAuth');
        if (authData) {
            const auth = JSON.parse(authData);
            auth.walletConnected = false;
            localStorage.setItem('userAuth', JSON.stringify(auth));
        }
        
        localStorage.removeItem('walletData');
        this.updateWalletDisplay();
        this.app.showNotification('Кошелёк отключен');
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    // Методы для работы с транзакциями
    async sendTransaction(toAddress, amount, comment = '') {
        if (!this.isConnected) {
            throw new Error('Кошелёк не подключен');
        }

        if (this.walletData.balance < amount) {
            throw new Error('Недостаточно средств');
        }

        try {
            this.app.showNotification(`Отправка ${amount} TON...`);
            
            // Имитация отправки транзакции
            await this.simulateTransaction();
            
            // Обновляем баланс
            this.walletData.balance -= amount;
            localStorage.setItem('walletData', JSON.stringify(this.walletData));
            this.updateWalletDisplay();
            
            this.app.showNotification(`Успешно отправлено ${amount} TON`);
            return true;
            
        } catch (error) {
            console.error('Transaction error:', error);
            throw error;
        }
    }

    simulateTransaction() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }

    // Получение реального баланса (в реальном приложении)
    async updateRealBalance() {
        if (!this.isConnected) return;
        
        // Здесь будет интеграция с TON API для получения реального баланса
        // const realBalance = await tonApi.getBalance(this.walletData.address);
        // this.walletData.balance = realBalance;
        // this.updateWalletDisplay();
    }
}
