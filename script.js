const pages = {
  welcome: document.querySelector("#welcome-page"),
  main: document.querySelector("#main-page"),
  task: document.querySelector("#task-page")
};

const pageLabels = {
  welcome: "はじめる",
  main: "ホーム",
  task: "タスク登録"
};

const tasks = [];
let nextTaskId = 1;

const profileForm = document.querySelector("#profile-form");
const taskForm = document.querySelector("#task-form");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const taskCardTemplate = document.querySelector("#task-card-template");
const pageLabel = document.querySelector("#page-label");
const greeting = document.querySelector("#greeting");
const characterImage = document.querySelector("#character-image");
const characterPlaceholder = document.querySelector("#character-placeholder");

function showPage(pageName) {
  Object.entries(pages).forEach(([name, page]) => {
    const isCurrentPage = name === pageName;
    page.hidden = !isCurrentPage;
    page.classList.toggle("is-active", isCurrentPage);
  });

  pageLabel.textContent = pageLabels[pageName];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDeadline(deadline) {
  const date = new Date(deadline + "T00:00:00");

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function createEmptyState() {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  const icon = document.createElement("div");
  icon.className = "empty-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✓";

  const title = document.createElement("h3");
  title.textContent = "タスクはまだありません";

  const description = document.createElement("p");
  description.textContent = "課題を登録すると、ここに一覧で表示されます。";

  const addButton = document.createElement("button");
  addButton.className = "text-button";
  addButton.type = "button";
  addButton.dataset.page = "task";
  addButton.textContent = "最初のタスクを追加する →";

  emptyState.append(icon, title, description, addButton);
  return emptyState;
}

function renderTasks() {
  taskList.replaceChildren();
  taskCount.textContent = tasks.length + "件";

  if (tasks.length === 0) {
    taskList.append(createEmptyState());
    return;
  }

  tasks.forEach((task) => {
    const taskCard = taskCardTemplate.content.firstElementChild.cloneNode(true);
    taskCard.dataset.taskId = String(task.id);

    taskCard.querySelector("[data-task-title]").textContent = task.title;
    taskCard.querySelector("[data-task-deadline]").textContent = formatDeadline(task.deadline);
    taskCard.querySelector("[data-task-duration]").textContent = task.estimatedMinutes + "分";
    taskCard.querySelector("[data-task-memo]").textContent = task.memo || "メモなし";

    taskList.append(taskCard);
  });
}

function removeTask(taskId) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) return;

  tasks.splice(taskIndex, 1);
  renderTasks();
}

document.addEventListener("click", (event) => {
  const navigationButton = event.target.closest("[data-page]");
  if (!navigationButton) return;

  showPage(navigationButton.dataset.page);
});

taskList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const taskCard = actionButton.closest("[data-task-id]");
  if (!taskCard) return;

  const taskId = Number(taskCard.dataset.taskId);

  if (actionButton.dataset.action === "complete") {
    removeTask(taskId);
  }

  if (actionButton.dataset.action === "delete") {
    removeTask(taskId);
  }
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const displayName = document.querySelector("#display-name").value.trim();
  greeting.textContent = displayName + "さん、今日も一歩ずつ。";
  showPage("main");
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);
  const task = {
    id: nextTaskId,
    title: formData.get("title").trim(),
    deadline: formData.get("deadline"),
    estimatedMinutes: Number(formData.get("duration")),
    memo: formData.get("memo").trim()
  };

  tasks.push(task);
  nextTaskId += 1;

  renderTasks();
  taskForm.reset();
  showPage("main");
});

characterImage.addEventListener("load", () => {
  characterPlaceholder.hidden = true;
});

characterImage.addEventListener("error", () => {
  characterImage.hidden = true;
  characterPlaceholder.hidden = false;
});

renderTasks();
