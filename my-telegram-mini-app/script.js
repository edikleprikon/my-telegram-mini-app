// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Основная кнопка внизу экрана (можно активировать)
tg.MainButton.setText("Готово!");
tg.MainButton.hide(); // Скрываем по умолчанию

// Обработчик кнопки
document.getElementById("btn").addEventListener("click", function() {
    tg.showPopup({
        title: "Popup!",
        message: "Вы нажали на кнопку!",
        buttons: [{ type: "ok" }]
    });
});

// Когда приложение готово к отображению
tg.expand(); // Развернем приложение на весь экран
tg.isExpanded = true;
tg.enableClosingConfirmation(); // Включим подтверждение закрытия (опционально)

// Обработчик события нажатия на основную кнопку
tg.MainButton.onClick(function() {
    tg.sendData("Данные для отправки"); // Отправляем данные в бота и закрываем WebApp
});
