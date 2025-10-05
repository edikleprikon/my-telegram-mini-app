class InventoryManager {
    constructor(app) {
        this.app = app;
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.modal = document.getElementById('gift-modal');
        this.init();
    }

    init() {
        this.loadInventory();
        this.initModal();
    }

    loadInventory() {
        const userData = this.app.getUserData();
        this.inventoryGrid.innerHTML = '';

        userData.inventory.forEach((gift, index) => {
            const giftElement = document.createElement('div');
            giftElement.className = 'gift-item';
            giftElement.innerHTML = `
                <div class="gift-image">🎁</div>
                <div class="gift-name">${gift.name}</div>
                <div class="gift-type">${this.getTypeName(gift.type)}</div>
            `;
            
            giftElement.addEventListener('click', () => {
                this.showGiftModal(gift, index);
            });

            this.inventoryGrid.appendChild(giftElement);
        });
    }

    getTypeName(type) {
        const types = {
            'common': 'Обычный',
            'rare': 'Редкий',
            'pvp': 'PVP',
            'fortune': 'Колесо'
        };
        return types[type] || type;
    }

    initModal() {
        const closeBtn = this.modal.querySelector('.close');
        const sellBtn = document.getElementById('sell-gift');

        closeBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
        });

        sellBtn.addEventListener('click', () => {
            this.sellGift();
        });

        // Закрытие модального окна при клике вне его
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.add('hidden');
            }
        });
    }

    showGiftModal(gift, index) {
        if (!gift.canSell) {
            this.app.showNotification('Этот подарок нельзя продать');
            return;
        }

        document.getElementById('modal-gift-name').textContent = gift.name;
        document.getElementById('modal-gift-description').textContent = 
            `Тип: ${this.getTypeName(gift.type)}\nБазовая цена: ${gift.price} TON`;
        document.getElementById('gift-price').value = gift.price;
        
        this.modal.currentGiftIndex = index;
        this.modal.classList.remove('hidden');
    }

    sellGift() {
        const price = parseInt(document.getElementById('gift-price').value);
        const index = this.modal.currentGiftIndex;
        
        if (price < 1) {
            this.app.showNotification('Цена должна быть не менее 1 TON');
            return;
        }

        const userData = this.app.getUserData();
        const gift = userData.inventory[index];
        
        // Добавление в магазин
        const shopItem = {
            ...gift,
            seller: this.app.userData.username || 'Аноним',
            sellerId: this.app.userData.id,
            sellPrice: price,
            timestamp: Date.now()
        };

        // Сохранение в магазин (в реальном приложении это бы отправлялось на сервер)
        let shopItems = JSON.parse(localStorage.getItem('shopItems') || '[]');
        shopItems.push(shopItem);
        localStorage.setItem('shopItems', JSON.stringify(shopItems));

        // Удаление из инвентаря
        userData.inventory.splice(index, 1);
        this.app.saveUserData(userData);
        
        this.modal.classList.add('hidden');
        this.loadInventory();
        
        this.app.showNotification('Подарок выставлен на продажу!');
    }
}

// Инициализация инвентаря
document.addEventListener('DOMContentLoaded', () => {
    if (app) {
        new InventoryManager(app);
    }
});
