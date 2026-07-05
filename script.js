const tasks = [];
let nextTaskId = 1;
let juiceCount = 0;
let skullCount = 0;
let characterLevel = 1;
let userInfo = null;

const STORAGE_KEY = "taskAppState";
const CUP_MAX = 5;
const CHARACTER_LEVEL_MIN = 1;
const CHARACTER_LEVEL_MAX = 5;

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
  const gachaCount = document.getElementById("gacha-count");
  const gachaBalls = document.getElementById("gacha-balls");
  const juiceCountElement = document.getElementById("juice-count");
  const skullCountElement = document.getElementById("skull-count");
  const juiceCup = document.getElementById("juice-cup");
  const skullCup = document.getElementById("skull-cup");
  const juiceBlocks = document.getElementById("juice-blocks");
  const skullBlocks = document.getElementById("skull-blocks");
  const taskTitleInput = document.getElementById("task-title-input");
  const taskDeadlineInput = document.getElementById("task-deadline-input");
  const taskDeadlineTimeInput = document.getElementById("task-deadline-time-input");
  const taskDurationInput = document.getElementById("task-duration-input");
  const taskMemoInput = document.getElementById("task-memo-input");
  const pageLabel = document.getElementById("page-label");
  const greeting = document.getElementById("greeting");
  const nameInput = document.getElementById("name");
  const displayNameInput = document.getElementById("display-name");
  const characterLevelElement = document.getElementById("character-level");
  const characterImage = document.getElementById("character-image");
  const characterPlaceholder = document.getElementById("character-placeholder");
  const characterFallbackText = document.getElementById("character-fallback-text");

  function saveState() {
    const state = {
      userInfo,
      tasks,
      juiceCount,
      skullCount,
      characterLevel
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    const savedText = localStorage.getItem(STORAGE_KEY);
    if (!savedText) return;

    try {
      const savedState = JSON.parse(savedText);

      if (
        savedState.userInfo &&
        typeof savedState.userInfo.name === "string" &&
        typeof savedState.userInfo.displayName === "string"
      ) {
        userInfo = {
          name: savedState.userInfo.name,
          displayName: savedState.userInfo.displayName
        };
      }

      if (Array.isArray(savedState.tasks)) {
        savedState.tasks.forEach((task) => {
          if (
            !task ||
            typeof task.title !== "string" ||
            typeof task.deadline !== "string"
          ) {
            return;
          }

          const taskId = Number(task.id);
          const minutes = Number(task.estimatedMinutes);

          tasks.push({
            id: Number.isFinite(taskId) ? taskId : nextTaskId,
            title: task.title,
            deadline: task.deadline,
            deadlineTime:
              typeof task.deadlineTime === "string" ? task.deadlineTime : "23:59",
            estimatedMinutes:
              Number.isFinite(minutes) && minutes > 0 ? minutes : 1,
            memo: typeof task.memo === "string" ? task.memo : ""
          });
        });

        nextTaskId =
          tasks.reduce((largestId, task) => Math.max(largestId, task.id), 0) + 1;
      }

      if (Number.isInteger(savedState.juiceCount)) {
        juiceCount = Math.min(Math.max(savedState.juiceCount, 0), CUP_MAX - 1);
      }

      if (Number.isInteger(savedState.skullCount)) {
        skullCount = Math.min(Math.max(savedState.skullCount, 0), CUP_MAX - 1);
      }

      if (Number.isInteger(savedState.characterLevel)) {
        characterLevel = Math.min(
          Math.max(savedState.characterLevel, CHARACTER_LEVEL_MIN),
          CHARACTER_LEVEL_MAX
        );
      }
    } catch (error) {
      console.warn("保存データを読み込めませんでした。", error);
    }
  }

  function showPage(pageName) {
    Object.entries(pages).forEach(([name, page]) => {
      const isCurrentPage = name === pageName;
      page.hidden = !isCurrentPage;
      page.classList.toggle("is-active", isCurrentPage);
    });

    pageLabel.textContent = pageLabels[pageName];
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createDeadlineDate(task) {
    const [year, month, day] = task.deadline.split("-").map(Number);
    const [hours, minutes] = task.deadlineTime.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  function formatDeadline(task) {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(createDeadlineDate(task));
  }

  function isOverdue(task) {
    return createDeadlineDate(task) < new Date();
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

  function renderCupBlocks(container, count, type) {
    container.replaceChildren();

    for (let index = 0; index < CUP_MAX; index += 1) {
      const block = document.createElement("div");
      block.className = "cup-block " + type;

      if (index < count) {
        block.classList.add("is-filled");
      }

      container.append(block);
    }
  }

  function renderCups() {
    juiceCountElement.textContent = juiceCount + " / " + CUP_MAX;
    skullCountElement.textContent = skullCount + " / " + CUP_MAX;
    juiceCup.setAttribute("aria-label", "ジュース " + juiceCount + " / " + CUP_MAX);
    skullCup.setAttribute("aria-label", "ドクロ " + skullCount + " / " + CUP_MAX);

    renderCupBlocks(juiceBlocks, juiceCount, "juice-block");
    renderCupBlocks(skullBlocks, skullCount, "skull-block");
  }

  function handleFullCups() {
    if (juiceCount >= CUP_MAX) {
      characterLevel = Math.min(characterLevel + 1, CHARACTER_LEVEL_MAX);
      juiceCount = 0;
    }

    if (skullCount >= CUP_MAX) {
      characterLevel = Math.max(characterLevel - 1, CHARACTER_LEVEL_MIN);
      skullCount = 0;
    }
  }

  function renderCharacter() {
    const imagePath = "images/character" + characterLevel + ".png";
    const imageLabel = "キャラクター画像（" + characterLevel + "）";

    characterLevelElement.textContent = String(characterLevel);
    characterFallbackText.textContent = imageLabel;
    characterPlaceholder.setAttribute("aria-label", imageLabel);
    characterImage.alt = imageLabel;
    characterImage.hidden = false;
    characterPlaceholder.hidden = true;

    if (characterImage.getAttribute("src") !== imagePath) {
      characterImage.setAttribute("src", imagePath);
    } else if (characterImage.complete && characterImage.naturalWidth === 0) {
      showCharacterPlaceholder();
    }
  }

  function renderGachaBalls() {
    const ballColors = ["#f59baa", "#ffd15d", "#83c0e9", "#9bc982", "#a986c1", "#f49a5b"];

    gachaBalls.replaceChildren();
    gachaCount.textContent = tasks.length + "個";

    if (tasks.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "gacha-empty";
      emptyMessage.innerHTML = "タスク1件につき<br>ボールが1個入ります";
      gachaBalls.append(emptyMessage);
      return;
    }

    tasks.forEach(() => {
      const ball = document.createElement("div");
      const randomColor = ballColors[Math.floor(Math.random() * ballColors.length)];

      ball.className = "gacha-ball";
      ball.style.backgroundColor = randomColor;
      ball.setAttribute("aria-hidden", "true");
      gachaBalls.append(ball);
    });
  }

  function renderTasks() {
    taskList.replaceChildren();
    taskCount.textContent = tasks.length + "件";
    renderGachaBalls();

    if (tasks.length === 0) {
      taskList.append(createEmptyState());
      return;
    }

    const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
      const firstIsOverdue = isOverdue(firstTask);
      const secondIsOverdue = isOverdue(secondTask);

      if (firstIsOverdue === secondIsOverdue) return 0;
      return firstIsOverdue ? -1 : 1;
    });

    sortedTasks.forEach((task) => {
      const taskCard = taskCardTemplate.content.firstElementChild.cloneNode(true);
      const taskIsOverdue = isOverdue(task);

      taskCard.dataset.taskId = String(task.id);

      if (taskIsOverdue) {
        taskCard.classList.add("overdue");

        const missedButton = document.createElement("button");
        missedButton.className = "task-button task-button-missed";
        missedButton.type = "button";
        missedButton.dataset.action = "missed";
        missedButton.textContent = "未完了";

        const actionArea = taskCard.querySelector(".task-actions");
        const deleteButton = taskCard.querySelector('[data-action="delete"]');
        actionArea.insertBefore(missedButton, deleteButton);
      }

      taskCard.querySelector("[data-task-title]").textContent = task.title;
      taskCard.querySelector("[data-task-deadline]").textContent = formatDeadline(task);
      taskCard.querySelector("[data-task-duration]").textContent = task.estimatedMinutes + "分";
      taskCard.querySelector("[data-task-memo]").textContent = task.memo || "メモなし";

      taskList.append(taskCard);
    });
  }

  function removeTask(taskId) {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    tasks.splice(taskIndex, 1);
    saveState();
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
    const action = actionButton.dataset.action;

    if (action === "complete") {
      juiceCount += 1;
    } else if (action === "missed") {
      skullCount += 1;
    }

    handleFullCups();
    renderCups();
    renderCharacter();
    removeTask(taskId);
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const displayName = displayNameInput.value.trim();

    userInfo = { name, displayName };
    saveState();

    greeting.textContent = displayName + "さん、今日も一歩ずつ。";
    showPage("main");
  });

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = taskTitleInput.value.trim();
    const deadline = taskDeadlineInput.value;
    const deadlineTime = taskDeadlineTimeInput.value;
    const estimatedMinutes = Number(taskDurationInput.value);
    const memo = taskMemoInput.value.trim();

    if (
      !title ||
      !deadline ||
      !deadlineTime ||
      !Number.isFinite(estimatedMinutes) ||
      estimatedMinutes < 1
    ) {
      return;
    }

    tasks.push({
      id: nextTaskId,
      title,
      deadline,
      deadlineTime,
      estimatedMinutes,
      memo
    });

    nextTaskId += 1;
    saveState();
    taskForm.reset();
    renderTasks();
    showPage("main");
  });

  function showCharacterPlaceholder() {
    characterImage.hidden = true;
    characterPlaceholder.hidden = false;
  }

  characterImage.addEventListener("load", () => {
    characterImage.hidden = false;
    characterPlaceholder.hidden = true;
  });

  characterImage.addEventListener("error", showCharacterPlaceholder);

  loadState();
  renderCups();
  renderCharacter();
  renderTasks();

  if (userInfo) {
    nameInput.value = userInfo.name;
    displayNameInput.value = userInfo.displayName;
    greeting.textContent = userInfo.displayName + "さん、今日も一歩ずつ。";
    showPage("main");
  } else {
    showPage("welcome");
  }
}
