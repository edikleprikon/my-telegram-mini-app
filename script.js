// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;

// Основная функция инициализации
function init() {
    tg.expand(); // Разворачиваем приложение на весь экран
    tg.enableClosingConfirmation(); // Включаем подтверждение при закрытии
    
    // Получаем информацию о пользователе
    let user = tg.initDataUnsafe.user;
    
    if (user) {
        let userData = `
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Имя:</strong> ${user.first_name}</p>
            ${user.last_name ? `<p><strong>Фамилия:</strong> ${user.last_name}</p>` : ''}
            ${user.username ? `<p><strong>Username:</strong> @${user.username}</p>` : ''}
        `;
        document.getElementById('user-data').innerHTML = userData;
    } else {
        document.getElementById('user-data').innerHTML = '<p>Пользователь не авторизован</p>';
    }
    
    // Обработчики событий
    document.getElementById('mainButton').addEventListener('click', handleMainButton);
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    
    // Настройка MainButton (если нужно)
    tg.MainButton.setText("Сделать что-то");
    tg.MainButton.show();
    tg.MainButton.onClick(handleMainButtonClick);
}

// Обработчик клика по основной кнопке
function handleMainButton() {
    tg.showPopup({
        title: "Уведомление",
        message: "Вы нажали на кнопку!",
        buttons: [{type: "ok"}]
    });
}

// Обработчик клика по MainButton Telegram
function handleMainButtonClick() {
    tg.showAlert("MainButton была нажата!");
}

// Функция отправки сообщения
function sendMessage() {
    let messageInput = document.getElementById('messageInput');
    let message = messageInput.value.trim();
    
    if (message) {
        // В реальном приложении здесь будет отправка данных на сервер
        tg.showPopup({
            title: "Сообщение отправлено",
            message: `Вы отправили: "${message}"`,
            buttons: [{type: "ok"}]
        });
        
        messageInput.value = "";
    } else {
        tg.showAlert("Введите сообщение!");
    }
}

// Инициализируем приложение при загрузке
document.addEventListener('DOMContentLoaded', init);

// Обработчик события изменения темы
tg.onEvent('themeChanged', function() {
    // При изменении темы перезагружаем страницу для применения стилей
    document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
});

// Обработчик события изменения размера viewport
tg.onEvent('viewportChanged', function() {
    // Можно добавить логику адаптации под новый размер
});
