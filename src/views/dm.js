import { endings } from "../data.js";
import { state, save, CLUE_TOTAL, canUnlockPt2, canConvictHeXun } from "../state.js";
import { goTo } from "../router.js";
import { renderTopNav } from "../components/weiboChrome.js";

const GW_URL = "https://saraliuxt-coder.github.io/galaxy-workspace/";

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

  const thread = document.createElement("div");
  thread.className = "bubble-thread";
  panel.appendChild(thread);

  const found = state.foundClues.length;
  const pt2Open = canUnlockPt2(state);

  if (!pt2Open) {
    renderPt1(panel, thread, found);
    return;
  }

  thread.innerHTML = `
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>如果23:47他还活着，公司说的那个时间就站不住了。</div>
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你查了这么多，那你觉得，那晚真正该为这件事负责的人是谁？</div>
  `;

  if (!state.foundClues.includes("c37") || !state.foundClues.includes("c38")) {
    const gwLink = document.createElement("a");
    gwLink.className = "reset-link";
    gwLink.textContent = "打开陈屿_经纪人文件夹 ›";
    gwLink.href = `${GW_URL}?code=0913run`;
    gwLink.target = "_blank";
    gwLink.rel = "noopener";
    panel.appendChild(gwLink);
  }

  if (state.finalEnding) {
    renderAlreadyDecided(panel, thread);
    return;
  }

  const stepEl = document.createElement("div");
  stepEl.className = "reply-options";
  panel.appendChild(stepEl);

  renderSuspectStep(thread, stepEl);
}

const PT1_OPTIONS = [
  { id: "at_2320", label: "成立，约23:20死亡" },
  { id: "after_2343", label: "不成立，23:43之后仍然活着" },
  { id: "unsure", label: "无法判断" },
];

function renderPt1(panel, thread, found) {
  thread.innerHTML = `
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>先别急着下结论，多查查清楚，别搞错了伤到不相干的人。</div>
    <p class="clue-progress mono">目前掌握线索：${found} / ${CLUE_TOTAL}</p>
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>公司公布的死亡时间是否成立？</div>
  `;

  if (state.deathTimeAnswer) {
    const label = PT1_OPTIONS.find((o) => o.id === state.deathTimeAnswer)?.label || "";
    thread.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${label}</div>`;
  }

  // 注意：canUnlockPt2(state) 在这里必然是 false——一旦为 true，
  // renderDm() 顶层就已经直接路由到 PT2 分支，根本不会调用 renderPt1()。
  // 『推翻死亡时间』成功后的那句反馈文案和陈屿文件夹链接，放在 PT2
  // 分支开头显示（见 renderDm 里 pt2Open 分支），这里不用重复处理。
  if (state.deathTimeAnswer === "after_2343") {
    thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>光有判断还不够，你手上得先有能撑住这个判断的证据。</div>`;
  } else if (state.deathTimeAnswer) {
    thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你确定吗？先别急着下结论，多找找能撑住判断的证据。</div>`;
  }

  const stepEl = document.createElement("div");
  stepEl.className = "reply-options";
  panel.appendChild(stepEl);

  PT1_OPTIONS.forEach((o) => {
    const btn = document.createElement("button");
    btn.textContent = o.label;
    btn.addEventListener("click", () => {
      state.deathTimeAnswer = o.id;
      save();
      const rootEl = document.getElementById("view");
      const scrollTop = window.scrollY;
      rootEl.innerHTML = "";
      renderDm(rootEl);
      window.scrollTo(0, scrollTop);
    });
    stepEl.appendChild(btn);
  });
}

function renderAlreadyDecided(panel, thread) {
  const suspect = endings.suspects.find((s) => s.id === state.finalSuspect);
  if (state.finalEnding === "hexun_unproven") {
    thread.innerHTML += `
      <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${suspect ? suspect.label : ""}</div>
    `;
  } else {
    const action = endings.actions.find((a) => a.id === state.finalAction);
    thread.innerHTML += `
      <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${suspect ? suspect.label : ""}</div>
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>那你打算怎么处理？</div>
      <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${action ? action.label : ""}</div>
    `;
  }
  const link = document.createElement("div");
  link.className = "reset-link";
  link.textContent = "查看结案结果 ›";
  link.addEventListener("click", () => goTo("ending"));
  panel.appendChild(link);
}

function renderSuspectStep(thread, stepEl) {
  stepEl.innerHTML = "";
  endings.suspects.forEach((s) => {
    const btn = document.createElement("button");
    btn.textContent = s.label;
    btn.addEventListener("click", () => {
      state.finalSuspect = s.id;
      save();
      thread.innerHTML += `
        <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${s.label}</div>
      `;

      if (s.id === "hexun" && !canConvictHeXun(state)) {
        state.finalAction = null;
        state.finalEnding = "hexun_unproven";
        save();
        goTo("ending");
        return;
      }

      thread.innerHTML += `
        <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>那你打算怎么处理？</div>
      `;
      renderActionStep(stepEl);
    });
    stepEl.appendChild(btn);
  });
}

function renderActionStep(stepEl) {
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

function computeEndingKey(suspectId, actionId) {
  if (suspectId === "unclear") return "unclear";
  const suspect = endings.suspects.find((s) => s.id === suspectId);
  const bucket = suspect?.correct ? "correct" : "wrong";
  return `${bucket}_${actionId}`;
}
