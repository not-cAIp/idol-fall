import { endings } from "../data.js";
import { state, resetGame } from "../state.js";

export function renderEnding(root) {
  root.className = "";
  document.body.classList.remove("desktop-mode");
  const body = document.createElement("div");
  body.className = "view-body";

  const ending = endings.endings[state.finalEnding];
  if (!ending) {
    body.innerHTML = `<p class="intro">还没有结局——先去私信里把话说完再来看看。</p>`;
    root.appendChild(body);
    return;
  }

  const suspect = endings.suspects.find((s) => s.id === state.finalSuspect);
  const summary = ending.summary.replaceAll("{name}", suspect?.name || "那个人");

  body.innerHTML = `
    <div class="ending-card">
      <div class="tag mono">${suspect?.correct ? "推断正确" : state.finalSuspect === "unclear" ? "未指认任何人" : "推断有误"}</div>
      <h2>${ending.name}</h2>
      <p>${summary}</p>
    </div>
    <div class="reset-link" id="reset-link">重新调查一遍</div>
  `;
  root.appendChild(body);
  body.querySelector("#reset-link").addEventListener("click", resetGame);
}
