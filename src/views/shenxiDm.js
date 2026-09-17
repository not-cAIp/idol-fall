import { state, save, markClueFound } from "../state.js";
import { goTo } from "../router.js";
import { renderTopNav } from "../components/weiboChrome.js";
import { createPhotoThumb } from "../components/photoViewer.js";

// 沈溪主页"留言"按钮点进来的真实可交互私信——不是静态聊天截图。
// 她不知道凶手是谁，只给出她自己的判断（拾光有问题），不是系统
// 确认。这条私信的核心产出是拾光杯子照片：这张图原来是超话里一条
// 公开帖子（p003），这一版改成必须主动私信她才能拿到。
export function renderShenxiDm(root) {
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
  back.innerHTML = "‹ 返回主页";
  back.addEventListener("click", () => goTo("search", { query: "晏星今天早点睡" }));
  main.appendChild(back);

  const panel = document.createElement("div");
  panel.className = "wfeed-card";
  panel.style.cursor = "default";
  panel.innerHTML = `<h3 style="margin:0 0 14px;font-size:15px;">私信 · 晏星今天早点睡</h3>`;
  main.appendChild(panel);

  const thread = document.createElement("div");
  thread.className = "bubble-thread";
  panel.appendChild(thread);

  const stepEl = document.createElement("div");
  stepEl.className = "reply-options";
  panel.appendChild(stepEl);

  renderThread(thread, stepEl);
}

function renderThread(thread, stepEl) {
  thread.innerHTML = `
    <div class="bubble-msg priv"><span class="tag mono">晏星今天早点睡 · 刚刚</span>说吧，想问什么。</div>
  `;

  if (!state.shenxiAsked) {
    stepEl.innerHTML = "";
    const btn = document.createElement("button");
    btn.textContent = "你看到什么了？";
    btn.addEventListener("click", () => {
      state.shenxiAsked = true;
      save();
      markClueFound("c43");
      renderThread(thread, stepEl);
    });
    stepEl.appendChild(btn);
    return;
  }

  stepEl.innerHTML = "";
  thread.innerHTML += `
    <div class="bubble-msg out"><span class="tag mono">你 · 刚刚</span>你看到什么了？</div>
    <div class="bubble-msg priv"><span class="tag mono">晏星今天早点睡 · 刚刚</span>老实说，我不知道是谁动的手，我要是知道早报警了。</div>
    <div class="bubble-msg priv"><span class="tag mono">晏星今天早点睡 · 刚刚</span>但我觉得拾光肯定跟这件事有关系。</div>
    <div class="bubble-msg priv"><span class="tag mono">晏星今天早点睡 · 刚刚</span>不是瞎说的，我盯了她很久了，之前发的那些我都留着。</div>
    <div class="bubble-msg priv"><span class="tag mono">晏星今天早点睡 · 刚刚</span>给你看一张，你自己判断。</div>
  `;

  const photoRow = document.createElement("div");
  photoRow.className = "bubble-msg priv";
  photoRow.style.maxWidth = "82%";
  photoRow.style.padding = "8px";
  const thumb = createPhotoThumb({
    src: "/images/p003-shiguang-cup.jpg",
    imagePrompt: "写实摄影风格，偶像后台化妆间桌面特写。前景是一只米白色保温杯，杯身贴着一枚可爱风格的猫咪贴纸，贴纸下方印着小小的黑色中文『拾光』二字。",
    imageCaption: "后台桌面截图，杯身贴纸下方印着「拾光」两个字。",
  });
  photoRow.appendChild(thumb);
  thread.appendChild(photoRow);

  const tail = document.createElement("div");
  tail.className = "bubble-msg priv";
  tail.innerHTML = `<span class="tag mono">晏星今天早点睡 · 刚刚</span>信不信你自己决定，反正我该说的都说了。`;
  thread.appendChild(tail);
}
