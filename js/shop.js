class ShopManager {
    constructor(app) {
        this.app = app;
        this.shopGrid = document.getElementById('shop-grid');
        this.init();
    }

    init() {
        this.loadShopItems();
    }

    loadShopItems() {
        let shopItems = JSON.parse(localStorage.getItem('shopItems') || '[]');
        this.shopGrid.innerHTML = '';

        if (shopItems.length === 0) {
            this.shopGrid.innerHTML = '<div class="no-items">Магазин пуст</div>';
            return;
        }

        shopItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'gift-item';
            itemElement.innerHTML = `
                <div class="gift-image">🎁</div>
                <div class="gift-name">${item.name}</div>
                <div class="gift-seller">Продавец: ${item.seller}</div>
                <div class="gift-price">${item.sellPrice} TON</div>
                <button class="btn-buy">Купить</button>
            `;

            const buyBtn = itemElement.querySelector('.btn-buy');
            buyBtn.addEventListener('click', () => {
                this.buyItem(item, index);
            });

            this.shopGrid.appendChild(itemElement);
        });
    }

    buyItem(item, index) {
        const userData = this.app.getUserData();
        
        if (userData.balance < item.sellPrice) {
            this.app.showNotification('Недостаточно TON для покупки!');
            return;
        }

        // Списание средств
        userData.balance -= item.sellPrice;
        
        // Добавление в инвентарь
        userData.inventory.push({
            id: item.id,
            name: item.name,
            type: item.type,
            price: item.price,
            canSell: true
        });

        this.app.saveUserData(userData);

        // Удаление из магазина
        let shopItems = JSON.parse(localStorage.getItem('shopItems') || '[]');
        shopItems.splice(index, 1);
        localStorage.setItem('shopItems', JSON.stringify(shopItems));

        this.loadShopItems();
        this.app.showNotification('Подарок куплен!');
    }
}

// Инициализация магазина
document.addEventListener('DOMContentLoaded', () => {
    if (app) {
        new ShopManager(app);
    }
});
