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

const profileForm = document.querySelector("#profile-form");
const taskForm = document.querySelector("#task-form");
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

document.addEventListener("click", (event) => {
  const navigationButton = event.target.closest("[data-page]");
  if (!navigationButton) return;

  showPage(navigationButton.dataset.page);
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const displayName = document.querySelector("#display-name").value.trim();
  greeting.textContent = displayName + "さん、今日も一歩ずつ。";
  showPage("main");
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // タスク登録処理は次の段階で追加する。
  showPage("main");
});

characterImage.addEventListener("load", () => {
  characterPlaceholder.hidden = true;
});

characterImage.addEventListener("error", () => {
  characterImage.hidden = true;
  characterPlaceholder.hidden = false;
});
