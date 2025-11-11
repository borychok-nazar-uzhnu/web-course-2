// 1. Створення змінних і масиву з даними
// Змінна для загальної назви
const pageTitle = "Мої ТОП-5 фільмів";

// Масив для зберігання назв фільмів
const favoriteMovies = [
    "Володар перснів: Повернення короля",
    "Зелена миля",
    "Інтерстеллар",
    "Початок",
    "Матриця"
];

// Змінна-лічильник
let movieCount = favoriteMovies.length;


// 2. Виведення цих даних у HTML через innerText або innerHTML

// A) Зміна заголовка через DOM (приклад роботи зі змінною)
document.querySelector('header h1').innerText = pageTitle;

// B) Виведення кількості фільмів (innerText)
document.querySelector('#movie-count span').innerText = movieCount;

// C) Виведення списку фільмів (innerHTML)
const movieListElement = document.getElementById('movie-list');
let listHTML = '';

// Цикл для проходу по масиву та формування HTML
for (let i = 0; i < favoriteMovies.length; i++) {
    // Використання змінної з масиву
    listHTML += `<li>${i + 1}. ${favoriteMovies[i]}</li>`; 
}

// Вставлення сформованого HTML у DOM
movieListElement.innerHTML = listHTML;


// 3. Зміна тексту або стилю елементів за подією (при натисканні кнопки)

// Отримуємо посилання на кнопки та елемент повідомлення
const highlightBtn = document.getElementById('highlight-btn');
const checkLengthBtn = document.getElementById('check-length-btn');
const statusMessage = document.getElementById('status-message');


// Подія 1: Виділення першого фільму
highlightBtn.addEventListener('click', () => {
    // Отримуємо перший елемент списку (перший <li>)
    const firstMovie = movieListElement.querySelector('li');
    
    // Додаємо CSS-клас для зміни стилю
    if (firstMovie) {
        firstMovie.classList.add('highlight');
        statusMessage.innerText = "Перший фільм був виділений червоним кольором.";
    }
});


// Подія 2: Перевірка довжини списку (використання if/else)
checkLengthBtn.addEventListener('click', () => {
    
    let message;
    let isBlockbusterLength = movieCount >= 5; // Булева змінна

    // Використання оператора if/else (умова)
    if (isBlockbusterLength) {
        message = `✅ У вас ${movieCount} фільмів. Це справжній 'Блокбастер-список'!`;
    } else {
        message = `⚠️ У вас лише ${movieCount} фільмів. Додайте ще!`;
    }
    
    // Зміна тексту елемента
    statusMessage.innerText = message;
    
    // Приклад тернарного оператора:
    // Зміна кольору повідомлення в залежності від умови
    statusMessage.style.backgroundColor = isBlockbusterLength ? '#d4edda' : '#fff3cd';
    statusMessage.style.color = isBlockbusterLength ? '#155724' : '#856404';

});