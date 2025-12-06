// Пошук елементів через querySelector / querySelectorAll
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const statusText = document.querySelector("#status-text");
const emptyMessage = document.querySelector("#empty-message");
const totalCountSpan = document.querySelector("#total-count");
const doneCountSpan = document.querySelector("#done-count");

// Стан додатку (масив завдань)
let tasks = [];

// Оновлення лічильників
function updateCounters() {
    const total = tasks.length;
    const done = tasks.filter(task => task.completed).length;

    totalCountSpan.innerText = total;
    doneCountSpan.innerText = done;

    if (total === 0) {
        emptyMessage.style.display = "block";
        statusText.innerText = "Список поки порожній. Додай перше завдання.";
    } else {
        emptyMessage.style.display = "none";
        statusText.innerText = "Клікни «Готово», щоб позначити завдання виконаним.";
    }
}

// Створення одного елементу списку
function createTaskElement(task) {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    if (task.completed) {
        li.classList.add("completed");
    }
    li.dataset.id = task.id; // зберігаємо id у атрибуті

    const spanText = document.createElement("span");
    spanText.classList.add("todo-text");
    spanText.innerText = task.text;

    // Кнопка "Готово"
    const doneBtn = document.createElement("button");
    doneBtn.classList.add("btn", "secondary");
    doneBtn.innerText = "Готово";

    // Кнопка "Видалити"
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "danger");
    deleteBtn.innerText = "Видалити";

    // Додаємо елементи в li
    li.appendChild(spanText);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);

    // Обробники подій
    doneBtn.addEventListener("click", () => toggleTask(task.id, li));
    deleteBtn.addEventListener("click", () => deleteTask(task.id, li));

    return li;
}

// Додавання нового завдання
function addTask(text) {
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);

    const taskElement = createTaskElement(newTask);
    todoList.appendChild(taskElement);

    updateCounters();
}

// Перемикання стану "виконано"
function toggleTask(id, listItem) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // змінюємо стан
    task.completed = !task.completed;

    // toggle класу через classList
    listItem.classList.toggle("completed");

    updateCounters();
}

// Видалення завдання
function deleteTask(id, listItem) {
    tasks = tasks.filter(t => t.id !== id);

    // видаляємо елемент з DOM
    listItem.remove();

    updateCounters();
}

// Обробка відправки форми
todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = todoInput.value.trim();

    if (text === "") {
        // Приклад зміни стилю та тексту
        statusText.innerText = "Поле не може бути порожнім.";
        statusText.style.color = "#dc3545"; // червоний
        return;
    }

    statusText.style.color = "#555"; // повертаємо нормальний колір
    addTask(text);

    // очищаємо поле вводу
    todoInput.value = "";
    todoInput.focus();
});

// Початковий виклик
updateCounters();
