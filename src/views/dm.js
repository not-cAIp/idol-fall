import { endings } from "../data.js";
import { state, save, CLUE_TOTAL, MIN_TO_TALK } from "../state.js";
import { goTo } from "../router.js";
import { renderTopNav } from "../components/weiboChrome.js";

export function renderDm(root) {
  root.className = "weibo-scope";
  renderTopNav(root);

  const layout = document.createElement("div");
  layout.className = "wlayout no-leftnav";
  layout.style.gridTemplateColumns = "minmax(0, 1fr)";
  layout.style.maxWidth = "640px";
  root.appendChild(layout);

  const main = document.createElement("main");
  layout.appendChild(main);

  const back = document.createElement("div");
  back.className = "wback-row";
  back.innerHTML = "‹ 返回超话";
  back.addEventListener("click", () => goTo("forum"));
  main.appendChild(back);

  const panel = document.createElement("div");
  panel.className = "wfeed-card";
  panel.style.cursor = "default";
  panel.innerHTML = `<h3 style="margin:0 0 14px;font-size:15px;">私信 · 陪你走到最后</h3>`;
  main.appendChild(panel);

  const found = state.foundClues.length;
  const ready = found >= MIN_TO_TALK;

  const thread = document.createElement("div");
  thread.className = "bubble-thread";
  panel.appendChild(thread);

  if (!ready) {
    thread.innerHTML = `
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>先别急着下结论，多查查清楚，别搞错了伤到不相干的人。</div>
      <p class="clue-progress mono">目前掌握线索：${found} / ${CLUE_TOTAL}</p>
    `;
    const link = document.createElement("div");
    link.className = "reset-link";
    link.textContent = "继续调查 ›";
    link.addEventListener("click", () => goTo("forum"));
    panel.appendChild(link);
    return;
  }

  thread.innerHTML = `
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你是不是也觉得这件事不对？</div>
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>看你这几天查了不少东西。你觉得，那晚真正该为这件事负责的人是谁？</div>
  `;

  // 已经结案过了：直接展示当初选的两步，附一个查看结果的链接。
  if (state.finalEnding) {
    const suspect = endings.suspects.find((s) => s.id === state.finalSuspect);
    const action = endings.actions.find((a) => a.id === state.finalAction);
    thread.innerHTML += `
      <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${suspect ? suspect.label : ""}</div>
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>那你打算怎么处理？</div>
      <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${action ? action.label : ""}</div>
    `;
    const link = document.createElement("div");
    link.className = "reset-link";
    link.textContent = "查看结案结果 ›";
    link.addEventListener("click", () => goTo("ending"));
    panel.appendChild(link);
    return;
  }

  const stepEl = document.createElement("div");
  stepEl.className = "reply-options";
  panel.appendChild(stepEl);

  renderSuspectStep();

  function renderSuspectStep() {
    stepEl.innerHTML = "";
    endings.suspects.forEach((s) => {
      const btn = document.createElement("button");
      btn.textContent = s.label;
      btn.addEventListener("click", () => {
        state.finalSuspect = s.id;
        save();
        thread.innerHTML += `
          <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${s.label}</div>
          <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>那你打算怎么处理？</div>
        `;
        renderActionStep();
      });
      stepEl.appendChild(btn);
    });
  }

  function renderActionStep() {
    stepEl.innerHTML = "";
    endings.actions.forEach((a) => {
      const btn = document.createElement("button");
      btn.textContent = a.label;
      btn.addEventListener("click", () => {
        state.finalAction = a.id;
        state.finalEnding = computeEndingKey(state.finalSuspect, a.id);
        save();
        goTo("ending");
      });
      stepEl.appendChild(btn);
    });
  }
}

function computeEndingKey(suspectId, actionId) {
  if (suspectId === "unclear") return "unclear";
  const suspect = endings.suspects.find((s) => s.id === suspectId);
  const bucket = suspect?.correct ? "correct" : "wrong";
  return `${bucket}_${actionId}`;
}
