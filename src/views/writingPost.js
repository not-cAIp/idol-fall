import { state } from "../state.js";
import { goTo } from "../router.js";
import { renderTopNav } from "../components/weiboChrome.js";

// PT2 选了"实名公开指认"或"写报道不点名"之后，不直接跳结局页，先过
// 这一段：黑屏 → 睁眼式的眨眼动画 → 写微博界面 → 玩家点下面唯一那个
// 建议话题（看着像给了个选择，其实只有一个能点）→ 微博逐字打出来 →
// 点发送 → 淡出到结局页。私下交给陪你走到最后/什么都不做这两种不
// 涉及公开发帖，dm.js 里还是直接 goTo("ending")，不会经过这里。
const POST_DRAFTS = {
  public_name:
    "关于周晏星的死，我不再保持沉默。这段时间查到的东西，我全部附在下面——证据链接都在，指向一个具体的人。希望大家理智讨论，也请对其他不相干的人保留基本的边界。",
  report_noname:
    "这些天查到的东西，我整理成了一篇长文放在下面。没有指名道姓，但所有的证据和时间线都摆在这儿了——是不是巧合，大家自己判断。",
};

export function renderWritingPost(root) {
  root.className = "weibo-scope";
  renderTopNav(root);

  const layout = document.createElement("div");
  layout.className = "wlayout no-leftnav";
  layout.style.gridTemplateColumns = "minmax(0, 1fr)";
  layout.style.maxWidth = "640px";
  root.appendChild(layout);

  const main = document.createElement("main");
  layout.appendChild(main);

  const panel = document.createElement("div");
  panel.className = "wfeed-card wpost-card";
  panel.innerHTML = `
    <div class="wpost-head">发微博</div>
    <textarea class="wpost-textarea" id="wpost-textarea" readonly placeholder="有什么新鲜事想告诉大家？"></textarea>
    <div class="wpost-suggest-row">
      <button class="wpost-suggest-chip" id="wpost-suggest-chip"># 加个话题 #</button>
    </div>
    <div class="wpost-actions">
      <button class="wpost-send-btn" id="wpost-send-btn" disabled>发送</button>
    </div>
  `;
  main.appendChild(panel);

  const blackout = document.createElement("div");
  blackout.className = "wpost-blackout";
  root.appendChild(blackout);
  blackout.addEventListener("animationend", () => blackout.remove());
  setTimeout(() => blackout.classList.add("wpost-blink"), 500);

  const draft = POST_DRAFTS[state.finalAction] || POST_DRAFTS.report_noname;
  const textarea = panel.querySelector("#wpost-textarea");
  const chip = panel.querySelector("#wpost-suggest-chip");
  const sendBtn = panel.querySelector("#wpost-send-btn");

  chip.addEventListener("click", () => {
    chip.disabled = true;
    chip.classList.add("used");
    typeInto(textarea, draft, () => {
      sendBtn.disabled = false;
    });
  });

  sendBtn.addEventListener("click", () => {
    sendBtn.disabled = true;
    sendBtn.textContent = "已发送";
    const fadeOut = document.createElement("div");
    fadeOut.className = "wpost-blackout wpost-fadein";
    root.appendChild(fadeOut);
    setTimeout(() => goTo("ending"), 700);
  });
}

function typeInto(el, text, onDone) {
  el.value = "";
  el.classList.add("typing");
  let i = 0;
  const timer = setInterval(() => {
    el.value += text[i];
    i += 1;
    if (i >= text.length) {
      clearInterval(timer);
      el.classList.remove("typing");
      onDone?.();
    }
  }, 38);
}
