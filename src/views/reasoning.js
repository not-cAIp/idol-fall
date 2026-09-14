import { clues } from "../data.js";
import { state } from "../state.js";
import { goTo } from "../router.js";

export function renderReasoning(root) {
  const header = document.createElement("header");
  header.className = "view-header";
  header.innerHTML = `
    <div class="vh-left">
      <button class="icon-btn back" id="btn-back">‹</button>
      <span class="vh-title">推理</span>
    </div>
  `;
  root.appendChild(header);
  header.querySelector("#btn-back").addEventListener("click", () => goTo("forum"));

  const total = clues.timeline.length;
  const found = state.foundClues.length;
  const coreClues = clues.timeline.filter((c) => c.core);
  const hasAllCore = coreClues.every((c) => state.foundClues.includes(c.id));

  const body = document.createElement("div");
  body.className = "view-body";
  body.innerHTML = `
    <p class="board-progress mono" style="font-size:22px;color:var(--ink);">已查看提示 ${found} / ${total}</p>
    <p class="intro">${hasAllCore ? "线索已经够多了——也许该回泡泡里问问她。" : "似乎还有些地方说不通，超话和搜索里应该还有没翻到的东西。"}</p>
    <div id="found-list"></div>
  `;
  root.appendChild(body);

  const listEl = body.querySelector("#found-list");
  clues.timeline
    .filter((c) => state.foundClues.includes(c.id))
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((c) => {
      const el = document.createElement("div");
      el.className = "tl-item";
      el.innerHTML = `
        <div class="t mono">${c.time}</div>
        <h3>${c.title}</h3>
        <div class="src">来源：${c.source}</div>
      `;
      listEl.appendChild(el);
    });
}
