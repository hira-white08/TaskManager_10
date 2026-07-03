const tasks = [];
let nextTaskId = 1;

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  const pages = {
    welcome: document.getElementById("welcome-page"),
    main: document.getElementById("main-page"),
    task: document.getElementById("task-page")
  };

  const pageLabels = {
    welcome: "はじめる",
    main: "ホーム",
    task: "タスク登録"
  };

  const profileForm = document.getElementById("profile-form");
  const taskForm = document.getElementById("task-form");
  const taskList = document.getElementById("task-list");
  const taskCount = document.getElementById("task-count");
  const taskCardTemplate = document.getElementById("task-card-template");
  const taskTitleInput = document.getElementById("task-title-input");
  const taskDeadlineInput = document.getElementById("task-deadline-input");
  const taskDurationInput = document.getElementById("task-duration-input");
  const taskMemoInput = document.getElementById("task-memo-input");
  const pageLabel = document.getElementById("page-label");
  const greeting = document.getElementById("greeting");
  const displayNameInput = document.getElementById("display-name");
  const characterImage = document.getElementById("character-image");
  const characterPlaceholder = document.getElementById("character-placeholder");

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

    removeTask(Number(taskCard.dataset.taskId));
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const displayName = displayNameInput.value.trim();
    greeting.textContent = displayName + "さん、今日も一歩ずつ。";
    showPage("main");
  });

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = taskTitleInput.value.trim();
    const deadline = taskDeadlineInput.value;
    const estimatedMinutes = Number(taskDurationInput.value);
    const memo = taskMemoInput.value.trim();

    if (!title || !deadline || !Number.isFinite(estimatedMinutes) || estimatedMinutes < 1) {
      return;
    }

    tasks.push({
      id: nextTaskId,
      title,
      deadline,
      estimatedMinutes,
      memo
    });

    nextTaskId += 1;
    taskForm.reset();
    renderTasks();
    showPage("main");
  });

  function showCharacterPlaceholder() {
    characterImage.hidden = true;
    characterPlaceholder.hidden = false;
  }

  characterImage.addEventListener("load", () => {
    characterPlaceholder.hidden = true;
  });

  characterImage.addEventListener("error", showCharacterPlaceholder);

  if (characterImage.complete && characterImage.naturalWidth === 0) {
    showCharacterPlaceholder();
  }

  renderTasks();
}
