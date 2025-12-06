"use strict";

const state = {
    students: [],
    filtered: [],
    currentGroup: "all",
};

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function initApp() {
    setupModalHandlers();
    await loadStudents();
    buildGroupFilters();
    renderStats();
    renderStudents();
}

/* ======= FETCH + ОБРОБКА ПОМИЛОК ======= */
async function loadStudents() {
    const statusEl = document.getElementById("status-message");

    try {
        statusEl.textContent = "Завантаження даних студентів...";
        statusEl.classList.remove("status-message--error");

        const response = await fetch("data.json");
        if (!response.ok) {
            throw new Error(`Статус відповіді: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("JSON повинен містити масив обʼєктів студентів");
        }

        state.students = data;
        state.filtered = data;
        statusEl.textContent = "";
    } catch (error) {
        console.error("Помилка завантаження:", error);
        statusEl.textContent =
            "Не вдалося завантажити дані студентів. Онови сторінку або перевір JSON.";
        statusEl.classList.add("status-message--error");
    }
}

/* ======= РЕНДЕР КАРТОК ======= */
function renderStudents() {
    const listEl = document.getElementById("students-list");
    listEl.innerHTML = "";

    state.filtered.forEach((student) => {
        const card = createStudentCard(student);
        listEl.append(card);
    });

    if (state.filtered.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.textContent = "За вибраною групою студентів не знайдено.";
        emptyMsg.style.fontSize = "0.9rem";
        emptyMsg.style.color = "var(--text-muted)";
        listEl.append(emptyMsg);
    }
}

function createStudentCard(student) {
    const article = document.createElement("article");
    article.className = "card";
    article.setAttribute("tabindex", "0");
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", `Деталі про студента ${student.fullName}`);

    const header = document.createElement("div");
    header.className = "card__header";

    const nameEl = document.createElement("h2");
    nameEl.className = "card__name";
    nameEl.textContent = student.fullName;

    const groupEl = document.createElement("span");
    groupEl.className = "card__group";
    groupEl.textContent = student.group;

    header.append(nameEl, groupEl);

    const addressEl = document.createElement("p");
    addressEl.className = "card__address";
    addressEl.textContent = formatShortAddress(student.address);

    const meta = document.createElement("div");
    meta.className = "card__meta";

    const gpaEl = document.createElement("span");
    gpaEl.className = "card__gpa";
    const avg = calcAverage(student.grades);
    gpaEl.textContent = `Сер. бал: ${avg.toFixed(2)}`;

    const btn = document.createElement("button");
    btn.className = "card__btn";
    btn.type = "button";
    btn.innerHTML = '<span>⋯</span> Детальніше';

    meta.append(gpaEl, btn);

    article.append(header, addressEl, meta);

    const open = () => openModal(student);

    article.addEventListener("click", open);
    article.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
        }
    });
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        open();
    });

    return article;
}

/* ======= ФІЛЬТРИ ======= */
function buildGroupFilters() {
    const container = document.getElementById("group-filters");
    container.innerHTML = "";

    const groups = Array.from(new Set(state.students.map((s) => s.group))).sort();

    const allChip = createGroupChip("Усі групи", "all");
    container.append(allChip);

    groups.forEach((group) => {
        const chip = createGroupChip(group, group);
        container.append(chip);
    });

    updateChipActiveState();
}

function createGroupChip(label, value) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = label;
    btn.dataset.group = value;

    btn.addEventListener("click", () => {
        state.currentGroup = value;
        applyFilter();
        updateChipActiveState();
    });

    return btn;
}

function applyFilter() {
    if (state.currentGroup === "all") {
        state.filtered = state.students;
    } else {
        state.filtered = state.students.filter(
            (s) => s.group === state.currentGroup
        );
    }
    renderStats();
    renderStudents();
}

function updateChipActiveState() {
    const chips = document.querySelectorAll(".chip");
    chips.forEach((chip) => {
        chip.classList.toggle(
            "chip--active",
            chip.dataset.group === state.currentGroup
        );
    });
}

/* ======= СТАТИСТИКА ======= */
function renderStats() {
    const totalEl = document.getElementById("total-count");
    const avgEl = document.getElementById("avg-gpa");

    totalEl.textContent = state.students.length.toString();

    if (state.students.length === 0) {
        avgEl.textContent = "–";
        return;
    }

    const allGrades = state.students.flatMap((s) => s.grades || []);
    const overallAvg = calcAverage(allGrades);

    if (Number.isNaN(overallAvg)) {
        avgEl.textContent = "–";
    } else {
        avgEl.textContent = overallAvg.toFixed(2);
    }
}

/* ======= MODAL ======= */
function setupModalHandlers() {
    const overlay = document.getElementById("modal-overlay");
    const closeBtn = overlay.querySelector(".modal__close");

    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
}

function openModal(student) {
    const overlay = document.getElementById("modal-overlay");
    const content = overlay.querySelector(".modal__content");

    content.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const title = document.createElement("h2");
    title.className = "modal__title";
    title.id = "modal-title";
    title.textContent = student.fullName;

    const subtitle = document.createElement("p");
    subtitle.className = "modal__subtitle";
    subtitle.textContent = `Група: ${student.group}`;

    const grid = document.createElement("div");
    grid.className = "modal__grid";

    // Блок адреси
    const addressBlock = document.createElement("div");
    addressBlock.className = "modal-block";

    const addressTitle = document.createElement("h3");
    addressTitle.textContent = "Адреса";

    const addressList = document.createElement("ul");
    addressList.className = "modal-list";

    const addItem = (label, value) => {
        const li = document.createElement("li");

        const labelSpan = document.createElement("span");
        labelSpan.className = "modal-list__label";
        labelSpan.textContent = label;

        const valueSpan = document.createElement("span");
        valueSpan.className = "modal-list__value";
        valueSpan.textContent = value || "—";

        li.append(labelSpan, valueSpan);
        addressList.append(li);
    };

    addItem("Місто:", student.address.city);
    addItem("Вулиця:", student.address.street);
    addItem("Будинок:", student.address.building);
    addItem("Кімната / квартира:", student.address.room);

    addressBlock.append(addressTitle, addressList);

    // Блок оцінок
    const gradesBlock = document.createElement("div");
    gradesBlock.className = "modal-block";

    const gradesTitle = document.createElement("h3");
    gradesTitle.textContent = "Оцінки";

    const gradesList = document.createElement("ul");
    gradesList.className = "modal-list";

    (student.grades || []).forEach((grade, index) => {
        const li = document.createElement("li");
        const labelSpan = document.createElement("span");
        labelSpan.className = "modal-list__label";
        labelSpan.textContent = `Семестр ${index + 1}:`;

        const valueSpan = document.createElement("span");
        valueSpan.className = "modal-list__value";
        valueSpan.textContent = grade.toFixed(2);

        li.append(labelSpan, valueSpan);
        gradesList.append(li);
    });

    const avg = calcAverage(student.grades);
    const avgLi = document.createElement("li");
    const avgLabel = document.createElement("span");
    avgLabel.className = "modal-list__label";
    avgLabel.textContent = "Середній бал:";

    const avgValue = document.createElement("span");
    avgValue.className = "modal-list__value";
    avgValue.textContent = Number.isNaN(avg) ? "—" : avg.toFixed(2);

    avgLi.append(avgLabel, avgValue);
    gradesList.append(avgLi);

    gradesBlock.append(gradesTitle, gradesList);

    // блок курсів
    const coursesBlock = document.createElement("div");
    coursesBlock.className = "modal-block";
    coursesBlock.style.gridColumn = "1 / -1";

    const coursesTitle = document.createElement("h3");
    coursesTitle.textContent = "Курси";

    const coursesList = document.createElement("ul");
    coursesList.className = "courses-list";

    (student.courses || []).forEach((course) => {
        const li = document.createElement("li");

        const nameEl = document.createElement("div");
        nameEl.className = "course-name";
        nameEl.textContent = course.name;

        const metaEl = document.createElement("div");
        metaEl.className = "course-meta";
        metaEl.textContent = `Викладач: ${course.teacher} · Кредити: ${course.credits}`;

        li.append(nameEl, metaEl);
        coursesList.append(li);
    });

    coursesBlock.append(coursesTitle, coursesList);

    grid.append(addressBlock, gradesBlock, coursesBlock);

    fragment.append(title, subtitle, grid);
    content.append(fragment);

    overlay.classList.remove("hidden");
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
}

function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    overlay.classList.remove("visible");
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
}

/* ======= HELPERS ======= */
function calcAverage(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return NaN;
    const sum = arr.reduce((acc, val) => acc + Number(val || 0), 0);
    return sum / arr.length;
}

function formatShortAddress(address = {}) {
    const parts = [address.city, address.street, address.building]
        .filter(Boolean)
        .join(", ");
    return parts || "Адресу не вказано";
}
