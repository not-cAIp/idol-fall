import { bubble } from "../data.js";
import { state, save, markClueFound } from "../state.js";
import { goTo } from "../router.js";

let activeTab = "broadcast";

export function renderBubble(root) {
  root.className = "";

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
    <p class="intro">已登录账号 #${bubble.login.username}。</p>
    <div class="bubble-tabs">
      <button data-tab="broadcast">群发消息</button>
      <button data-tab="personal">专属消息</button>
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
        .map((m) => `<div class="bubble-msg out"><span class="tag mono">${m.from} · ${m.time}</span>${m.text}</div>`)
        .join("")}</div>`;
    }

    if (activeTab === "personal") {
      markClueFound("t04");
      contentEl.innerHTML = `
        <p class="intro" style="margin-bottom:10px;">${bubble.personalMessages.note}</p>
        <div class="bubble-thread">${bubble.personalMessages.messages
          .map((m) => `<div class="bubble-msg priv"><span class="tag mono">${m.from} · ${m.time}</span>${m.text}</div>`)
          .join("")}</div>
      `;
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
    <p class="intro">粉丝专属通讯 App，登录后能看到这个账号收到过的所有消息。账号密码没人直接告诉过你——要从别处拼出来。</p>
    <div class="lock-app">
      <div class="app-name">泡泡</div>
      <div class="app-sub">粉丝账号登录</div>
      <input id="bb-user" type="text" placeholder="账号（粉丝编号）" />
      <input id="bb-pass" type="password" placeholder="密码" />
      <button id="bb-login">登录</button>
      <div id="bb-msg"></div>
    </div>
  `;

  body.querySelector("#bb-login").addEventListener("click", () => {
    const user = body.querySelector("#bb-user").value.trim().replace(/^#/, "");
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
      msgEl.innerHTML = `<div class="lock-hint">密码格式为 4 位数字。提示：这个账号的主人有个习惯，喜欢把重要日期设成密码。</div>`;
    } else {
      msgEl.innerHTML = `<div class="lock-error">账号或密码错误。</div>`;
    }
  });
}
