class ProfileManager {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        // Профиль автоматически обновляется через app.updateProfile()
    }
}

// Инициализация профиля
document.addEventListener('DOMContentLoaded', () => {
    if (app) {
        new ProfileManager(app);
    }
});
