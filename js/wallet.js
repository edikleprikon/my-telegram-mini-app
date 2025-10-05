class WalletManager {
    constructor(app) {
        this.app = app;
        this.walletInfo = document.getElementById('wallet-info');
        this.walletBalance = document.getElementById('wallet-balance');
        this.transactionModal = document.getElementById('transaction-modal');
        this.isConnected = false;
        this.walletData = null;
        this.init();
    }

    init() {
        this.initTransactionModal();
        
        // Слушаем события от TON Connect
        if (window.tonConnect) {
            this.checkConnection();
        }
    }

    checkConnection() {
        if (window.tonConnect.getConnectionStatus()) {
            this.isConnected = true;
            this.walletData = window.tonConnect.getWalletInfo();
            this.updateWalletDisplay();
        }
    }

    updateWalletDisplay() {
        if (this.isConnected && this.walletData) {
            const balance = this.walletData.balance || 0;
            this.walletBalance.textContent = `${balance.toFixed(2)} TON`;
        } else {
            this.walletBalance.textContent = '0 TON';
        }
    }

    initTransactionModal() {
        const closeBtn = this.transactionModal.querySelector('.close');
        const confirmBtn = document.getElementById('confirm-transaction');
        const cancelBtn = document.getElementById('cancel-transaction');

        closeBtn.addEventListener('click', () => {
            this.hideTransactionModal();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideTransactionModal();
        });

        this.transactionModal.addEventListener('click', (e) => {
            if (e.target === this.transactionModal) {
                this.hideTransactionModal();
            }
        });

        confirmBtn.addEventListener('click', () => {
            this.executePendingTransaction();
        });
    }

    async sendTransaction(toAddress, amount, comment = '') {
        if (!this.isConnected) {
            throw new Error('Кошелёк не подключен');
        }

        // Показываем модальное окно подтверждения
        this.showTransactionModal(toAddress, amount, comment);
        
        // Сохраняем данные транзакции для выполнения
        this.pendingTransaction = { toAddress, amount, comment };
    }

    showTransactionModal(toAddress, amount, comment) {
        document.getElementById('tx-amount').textContent = `${amount} TON`;
        document.getElementById('tx-total').textContent = `${amount + 0.05} TON`;
        
        this.transactionModal.classList.remove('hidden');
    }

    hideTransactionModal() {
        this.transactionModal.classList.add('hidden');
        this.pendingTransaction = null;
    }

    async executePendingTransaction() {
        if (!this.pendingTransaction || !window.tonConnect) {
            return;
        }

        const { toAddress, amount, comment } = this.pendingTransaction;

        try {
            // Создаем транзакцию через TON Connect
            const transaction = window.tonConnect.createGameTransaction(
                toAddress, 
                amount, 
                comment
            );

            // Отправляем транзакцию
            const result = await window.tonConnect.sendTransaction(transaction);
            
            this.hideTransactionModal();
            this.app.showNotification('Транзакция успешно отправлена!');
            
            // Обновляем баланс
            setTimeout(() => {
                window.tonConnect.updateWalletData();
            }, 3000);
            
            return result;

        } catch (error) {
            console.error('Transaction execution error:', error);
            this.app.showNotification(`Ошибка транзакции: ${error.message}`);
            this.hideTransactionModal();
            throw error;
        }
    }

    // Получение реального баланса через TON API
    async updateRealBalance() {
        if (!this.isConnected || !window.tonConnect) return;
        
        await window.tonConnect.updateWalletData();
        this.updateWalletDisplay();
    }

    // Обработчики событий от TON Connect
    onWalletConnected(walletInfo) {
        this.isConnected = true;
        this.walletData = walletInfo;
        this.updateWalletDisplay();
        this.app.checkWalletRequirements();
    }

    onWalletDisconnected() {
        this.isConnected = false;
        this.walletData = null;
        this.updateWalletDisplay();
        this.app.checkWalletRequirements();
    }
}
