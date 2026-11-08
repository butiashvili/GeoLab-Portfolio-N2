// =========================================================
// საერთო ინტერაქტიულობა: ფერის რეჟიმი, მობილური მენიუ და ფილტრები
// =========================================================

const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("#main-navigation");
const menuOpenIcon = document.querySelector("[data-menu-open-icon]");
const menuCloseIcon = document.querySelector("[data-menu-close-icon]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeIcon = document.querySelector("[data-theme-icon]");
const themeLabel = document.querySelector("[data-theme-label]");

// მობილური მენიუს ხილვადობასა და ხელმისაწვდომობის ატრიბუტებს ვაახლებთ.
function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "მენიუს დახურვა" : "მენიუს გახსნა",
  );
  navigation.classList.toggle("hidden", !isOpen);
  menuOpenIcon.classList.toggle("hidden", isOpen);
  menuCloseIcon.classList.toggle("hidden", !isOpen);
}

// მიმდინარე რეჟიმის მიხედვით ღილაკის ტექსტს, ხატულასა და ARIA-ს ვაახლებთ.
function updateThemeButton() {
  const isLight = document.documentElement.classList.contains("light-mode");

  themeToggle.setAttribute(
    "aria-label",
    isLight ? "მუქ რეჟიმზე გადართვა" : "ღია რეჟიმზე გადართვა",
  );
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeIcon.textContent = isLight ? "☾" : "☀";
  themeLabel.textContent = isLight ? "მუქი რეჟიმი" : "ღია რეჟიმი";
}

// ფერის რეჟიმს ყველა გვერდზე ერთი და იმავე პარამეტრით ვინახავთ.
let themeAnimationTimer;

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.add("theme-transition");
  document.documentElement.getBoundingClientRect();
  const isLight = document.documentElement.classList.toggle("light-mode");
  window.clearTimeout(themeAnimationTimer);
  themeAnimationTimer = window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
  }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 700);

  localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
  updateThemeButton();
});

// მობილური მენიუს გახსნა/დახურვა ღილაკით, ბმულით, Escape-ით ან ეკრანის ზომის შეცვლით.
menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

window.matchMedia("(min-width: 640px)").addEventListener("change", () => {
  setMenuOpen(false);
});

// პროექტების გვერდზე ბარათებს არჩეული კატეგორიის მიხედვით ვფილტრავთ.
const projectFilters = document.querySelectorAll("[data-project-filter]");
const projectCards = document.querySelectorAll("[data-project-category]");
const filterStatus = document.querySelector("[data-filter-status]");

projectFilters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    const selectedCategory = filterButton.dataset.projectFilter;
    let visibleProjects = 0;

    projectFilters.forEach((button) => {
      const isActive = button === filterButton;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      const isVisible =
        selectedCategory === "all" ||
        card.dataset.projectCategory.split(" ").includes(selectedCategory);

      card.hidden = !isVisible;
      visibleProjects += Number(isVisible);
    });

    if (filterStatus) {
      filterStatus.textContent = `ნაჩვენებია ${visibleProjects} პროექტი`;
    }
  });
});

// JSONPlaceholder-იდან თანამშრომლების სიის ჩატვირთვა და ძიება.
const employeesContainer = document.querySelector("[data-employees]");
const employeeSearch = document.querySelector("[data-employee-search]");
const employeeSort = document.querySelector("[data-employee-sort]");
const employeeStatus = document.querySelector("[data-employee-status]");
let employees = [];

function renderEmployees(searchTerm = "") {
  const normalizedTerm = searchTerm.trim().toLocaleLowerCase();
  const matchingEmployees = employees
    .filter((employee) =>
      [employee.name, employee.email, employee.company.name]
        .some((value) => value.toLocaleLowerCase().includes(normalizedTerm)),
    )
    .sort((first, second) => {
      const sortBy = employeeSort?.value ?? "name";
      const firstValue = sortBy === "company" ? first.company.name : first.name;
      const secondValue = sortBy === "company" ? second.company.name : second.name;
      return firstValue.localeCompare(secondValue);
    });

  employeesContainer.replaceChildren();

  if (matchingEmployees.length === 0) {
    employeeStatus.textContent = "თანამშრომლები ვერ მოიძებნა.";
    return;
  }

  employeeStatus.textContent = `ნაჩვენებია ${matchingEmployees.length} თანამშრომელი`;
  matchingEmployees.forEach((employee) => {
    const card = document.createElement("article");
    card.className = "employee-card rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6";

    const name = document.createElement("h2");
    name.className = "employee-card-name text-lg font-bold text-white";
    name.textContent = employee.name;

    const avatar = document.createElement("span");
    avatar.className = "employee-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = employee.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toLocaleUpperCase();

    const heading = document.createElement("div");
    heading.className = "flex items-center gap-3";
    heading.append(avatar, name);

    const company = document.createElement("p");
    company.className = "mt-2 text-sm font-medium text-violet-300";
    company.textContent = employee.company.name;

    const email = document.createElement("a");
    email.className = "mt-4 block break-all text-sm text-slate-300 hover:text-violet-300";
    email.href = `mailto:${employee.email}`;
    email.textContent = employee.email;

    const location = document.createElement("p");
    location.className = "mt-2 text-sm text-slate-400";
    location.textContent = `${employee.address.city}, ${employee.address.street}`;

    const phone = document.createElement("p");
    phone.className = "mt-2 text-sm text-slate-400";
    phone.textContent = employee.phone;

    card.append(heading, company, email, location, phone);
    employeesContainer.append(card);
  });
}

if (employeesContainer) {
  fetch("https://jsonplaceholder.typicode.com/users")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`თანამშრომლების ჩატვირთვა ვერ მოხერხდა (${response.status}).`);
      }
      return response.json();
    })
    .then((data) => {
      employees = data;
      renderEmployees(employeeSearch.value);
    })
    .catch((error) => {
      employeeStatus.textContent = error.message;
    });

  employeeSearch.addEventListener("input", () => {
    renderEmployees(employeeSearch.value);
  });
  employeeSort?.addEventListener("change", () => {
    renderEmployees(employeeSearch.value);
  });
}

// JSONPlaceholder-ის PATCH მეთოდით დავალების სტატუსის განახლება.
const todoList = document.querySelector("[data-todo-list]");
const todoStatus = document.querySelector("[data-todo-status]");

function renderTodos(todos) {
  todoList.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between";

    const title = document.createElement("span");
    title.className = todo.completed ? "text-sm text-slate-400 line-through" : "text-sm text-slate-200";
    title.textContent = todo.title;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "w-fit rounded-full border border-violet-400/30 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/15 focus:outline-none focus:ring-2 focus:ring-violet-400";
    button.textContent = todo.completed ? "აღდგენა" : "შესრულებულად მონიშვნა";
    button.addEventListener("click", async () => {
      const completed = !todo.completed;
      button.disabled = true;
      todoStatus.textContent = "სტატუსი ახლდება...";

      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
        if (!response.ok) {
          throw new Error(`დავალების განახლება ვერ მოხერხდა (${response.status}).`);
        }

        todo.completed = completed;
        renderTodos(todos);
        todoStatus.textContent = "დავალების სტატუსი განახლდა.";
      } catch (error) {
        button.disabled = false;
        todoStatus.textContent = error.message;
      }
    });

    item.append(title, button);
    todoList.append(item);
  });
}

if (todoList) {
  fetch("https://jsonplaceholder.typicode.com/todos?_limit=5")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`დავალებების ჩატვირთვა ვერ მოხერხდა (${response.status}).`);
      }
      return response.json();
    })
    .then((todos) => {
      renderTodos(todos);
      todoStatus.textContent = "დავალებების სტატუსის შეცვლა შეგიძლიათ PATCH მეთოდით.";
    })
    .catch((error) => {
      todoStatus.textContent = error.message;
    });
}

// გვერდის პროგრესის ზოლი და ზედა ნაწილში სწრაფად დაბრუნების ღილაკი.
const progressBar = document.createElement("div");
progressBar.className = "page-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.append(progressBar);

const backToTop = document.createElement("button");
backToTop.type = "button";
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "გვერდის თავში დაბრუნება");
backToTop.textContent = "↑";
document.body.append(backToTop);

function updateScrollControls() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  backToTop.classList.toggle("is-visible", window.scrollY > 420);
}

window.addEventListener("scroll", updateScrollControls, { passive: true });
window.addEventListener("resize", updateScrollControls);
backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
});
updateScrollControls();

const messageField = document.querySelector("#message");
const messageCount = document.querySelector("[data-message-count]");

if (messageField && messageCount) {
  const updateMessageCount = () => {
    messageCount.textContent = `${messageField.value.length} / ${messageField.maxLength} სიმბოლო`;
  };
  messageField.addEventListener("input", updateMessageCount);
  updateMessageCount();
}

// საწყისი მდგომარეობა გვერდის ჩატვირთვისას სინქრონდება.
updateThemeButton();
