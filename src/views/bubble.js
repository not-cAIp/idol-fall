import { bubble, clues, endings } from "../data.js";
import { state, save, markClueFound } from "../state.js";
import { goTo } from "../router.js";

let activeTab = "broadcast";

export function renderBubble(root) {
  const header = document.createElement("header");
  header.className = "view-header";
  header.innerHTML = `
    <div class="vh-left">
      <button class="icon-btn back" id="btn-back">‹</button>
      <span class="vh-title">泡泡</span>
    </div>
  `;
  root.appendChild(header);
  header.querySelector("#btn-back").addEventListener("click", () => goTo("forum"));

  const body = document.createElement("div");
  body.className = "view-body";
  root.appendChild(body);

  if (!state.bubbleUnlocked) {
    renderLogin(body);
    return;
  }

  body.innerHTML = `
    <p class="intro">已登录 ${bubble.login.username}。</p>
    <div class="bubble-tabs">
      <button data-tab="broadcast">群发</button>
      <button data-tab="drafts">草稿箱</button>
      <button data-tab="private">私信 #0412</button>
    </div>
    <div id="bubble-content"></div>
  `;

  const contentEl = body.querySelector("#bubble-content");
  const tabButtons = body.querySelectorAll(".bubble-tabs button");

  function renderTab() {
    tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === activeTab));
    contentEl.innerHTML = "";

    if (activeTab === "broadcast") {
      contentEl.innerHTML = `<div class="bubble-thread">${bubble.broadcasts
        .map((m) => `<div class="bubble-msg out"><span class="tag mono">${m.time}</span>${m.text}</div>`)
        .join("")}</div>`;
    }

    if (activeTab === "drafts") {
      contentEl.innerHTML = `<div class="bubble-thread">${bubble.drafts
        .map((m) => `<div class="bubble-msg priv"><span class="tag mono">未发送 · ${m.time}</span>${m.text}</div>`)
        .join("")}</div>`;
    }

    if (activeTab === "private") {
      markClueFound("t04");
      renderPrivateThread(contentEl);
    }
  }

  tabButtons.forEach((b) =>
    b.addEventListener("click", () => {
      activeTab = b.dataset.tab;
      renderTab();
    })
  );

  renderTab();
}

function renderLogin(body) {
  body.innerHTML = `
    <p class="intro">晏星生前用的粉丝付费通讯软件，账号一直没人退订。密码没人直接告诉过你——要从别处拼出来。</p>
    <div class="lock-app">
      <div class="app-name">泡泡 · 晏星本人</div>
      <div class="app-sub">粉丝专属通讯 · 账号状态：未注销</div>
      <input id="bb-user" type="text" placeholder="账号" />
      <input id="bb-pass" type="password" placeholder="密码" />
      <button id="bb-login">登录</button>
      <div id="bb-msg"></div>
    </div>
  `;

  body.querySelector("#bb-login").addEventListener("click", () => {
    const user = body.querySelector("#bb-user").value.trim();
    const pass = body.querySelector("#bb-pass").value.trim();
    const msgEl = body.querySelector("#bb-msg");

    if (user === bubble.login.username && pass === bubble.login.password) {
      state.bubbleUnlocked = true;
      save();
      goTo("bubble");
      return;
    }

    state.bubbleAttempts += 1;
    save();
    if (state.bubbleAttempts >= 3) {
      msgEl.innerHTML = `<div class="lock-hint">密码格式为 4 位数字。提示：账号主人有个习惯，喜欢把重要日期设成密码。</div>`;
    } else {
      msgEl.innerHTML = `<div class="lock-error">账号或密码错误。</div>`;
    }
  });
}

function renderPrivateThread(contentEl) {
  const threadHtml = bubble.privateThread.messages
    .map((m) => `<div class="bubble-msg priv"><span class="tag mono">${m.from} · ${m.time}</span>${m.text}</div>`)
    .join("");

  const wrap = document.createElement("div");
  wrap.className = "bubble-thread";
  wrap.innerHTML = threadHtml;
  contentEl.appendChild(wrap);

  const { conclusionChoices } = endings.reportOptions;

  if (state.finalEnding) {
    const chosen = conclusionChoices.find((c) => c.id === state.finalReply);
    wrap.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${chosen ? chosen.text : ""}</div>`;
    const link = document.createElement("div");
    link.className = "reset-link";
    link.textContent = "查看结案结果 ›";
    link.addEventListener("click", () => goTo("ending"));
    contentEl.appendChild(link);
    return;
  }

  wrap.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">#0412 · 刚刚</span>你不是他。你是谁？</div>`;

  const optionsEl = document.createElement("div");
  optionsEl.className = "reply-options";
  conclusionChoices.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      state.finalReply = opt.id;
      state.finalEnding = computeEnding(opt.id);
      save();
      goTo("ending");
    });
    optionsEl.appendChild(btn);
  });
  contentEl.appendChild(optionsEl);
}

function computeEnding(replyId) {
  const coreClues = clues.timeline.filter((c) => c.core);
  const hasAllCore = coreClues.every((c) => state.foundClues.includes(c.id));

  if (replyId === "c_expose_su") return "D";
  if (!hasAllCore) return "D";
  if (state.foundClues.includes("t06") && replyId === "c_company") return "A";
  if (state.foundClues.includes("t01") && state.foundClues.includes("t03") && replyId === "c_pressure") return "B";
  if (replyId === "c_protect") return "C";
  return "D";
}
