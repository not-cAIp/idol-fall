import { endings } from "../data.js";
import { state, resetGame } from "../state.js";

export function renderEnding(root) {
  const body = document.createElement("div");
  body.className = "view-body";

  const ending = endings.endings.find((e) => e.id === state.finalEnding);
  if (!ending) {
    body.innerHTML = `<p class="intro">还没有结局——回泡泡里把话说完再来看看。</p>`;
    root.appendChild(body);
    return;
  }

  body.innerHTML = `
    <div class="ending-card">
      <div class="tag mono">结局 ${ending.id}</div>
      <h2>${ending.name}</h2>
      <p>${ending.summary}</p>
    </div>
    <div class="reset-link" id="reset-link">重新调查一遍</div>
  `;
  root.appendChild(body);
  body.querySelector("#reset-link").addEventListener("click", resetGame);
}
