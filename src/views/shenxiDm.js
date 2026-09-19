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

  renderThread(thread, stepEl, false);
}

// 完整回复拆成一条条独立气泡，逐条"一句一句"地冒出来，而不是一次性
// 整段贴出——只在玩家第一次点"你看到什么了？"那一刻播放这个节奏；
// 已经问过（state.shenxiAsked）之后再回来看，直接把全部内容摆出来，
// 不用每次重新等动画。
const SHENXI_REPLY_STEPS = [
  { text: "老实说，我不知道是谁动的手，我要是知道早报警了。" },
  { text: "但我觉得拾光肯定跟这件事有关系。" },
  { text: "就是那个他的前女友。" },
  { text: "他们都说我是瞎编的。" },
  { text: "但真不是我造谣，我盯了她很久了，之前发的那些我都留着。" },
  { text: "给你看一张周晏星之前直播我截的，你自己判断。" },
  { photo: "cup" },
  { text: "信不信你自己决定，反正我该说的都说了。" },
];

// 这条追问是从 GALAXY WORKSPACE 的 06_安保 挪过来的——原本是公司内部
// A02/A03 两份文件（安保巡查照片 + 监控维修申请），现在改成沈溪自己
// 当晚在楼下蹲到的独立目击，同一件事有两个互不知情的来源，比单靠
// 一份公司内部文件更立得住。只有先问完"你看到什么了"（state.shenxiAsked）
// 才会解锁这一步，不是一进私信就能看到。
const SHENXI_FOLLOWUP_STEPS = [
  { text: "还有件事，我一直没跟人说过。" },
  { text: "那天晚上我其实又去蹲了一次，就在楼下。" },
  { text: "看到一个人穿着黑色工作服从员工通道进去了，没看清脸。" },
  { photo: "jacket" },
  { text: "而且那段时间那栋楼有一块监控一直是坏的，之前路过看到过维修通知，说是常规报修。" },
  { text: "所以就算真出了什么事，那段可能也调不出监控。" },
  { text: "但也可能就是普通的安保巡逻，我说不准，你自己判断。" },
];

const SHENXI_PHOTOS = {
  cup: {
    src: "/images/p003-shiguang-cup.jpg",
    imagePrompt: "写实摄影风格，偶像后台化妆间桌面特写。前景是一只米白色保温杯，杯身贴着一枚可爱风格的猫咪贴纸，贴纸下方印着小小的黑色中文『拾光』二字。",
  },
  jacket: {
    imagePrompt: "写实摄影风格，夜间远距离偷拍，住所大厦地下通道入口处，一个穿黑色工作外套的背影正在刷卡，画面昏暗、构图倾斜，能看出是手机长焦仓促抓拍，没有拍到脸。",
  },
};

function appendShenxiStep(thread, step) {
  if (step.photo) {
    const photoRow = document.createElement("div");
    photoRow.className = "bubble-msg priv";
    photoRow.style.maxWidth = "82%";
    photoRow.style.padding = "8px";
    const thumb = createPhotoThumb(SHENXI_PHOTOS[step.photo]);
    photoRow.appendChild(thumb);
    thread.appendChild(photoRow);
    return;
  }
  const row = document.createElement("div");
  row.className = "bubble-msg priv";
  row.innerHTML = `<span class="tag mono">晏星今天早点睡 · 刚刚</span>${step.text}`;
  thread.appendChild(row);
}

function renderShenxiReply(thread, animate, steps = SHENXI_REPLY_STEPS, onDone) {
  if (!animate) {
    steps.forEach((step) => appendShenxiStep(thread, step));
    if (onDone) onDone();
    return;
  }
  let i = 0;
  const next = () => {
    if (i >= steps.length) { if (onDone) onDone(); return; }
    appendShenxiStep(thread, steps[i]);
    i += 1;
    setTimeout(next, 650);
  };
  next();
}

// 三步走："你知道什么 能跟我说说吗"（开场）→ 她说"说吧，想问什么。"
// → 玩家再问"你看到什么了？" → 她的完整回复逐句冒出来。openerDone
// 只是渲染态的本地标记，不写存档——每次重新点进这个私信，都从头
// 走一遍开场问候，很自然；只有"问没问过、拿没拿到线索"这件事
// （state.shenxiAsked）才需要跨会话记住。
function renderThread(thread, stepEl, openerDone) {
  stepEl.innerHTML = "";

  if (state.shenxiAsked) {
    thread.innerHTML = `
      <div class="bubble-msg out"><span class="tag mono">你 · 刚刚</span>你知道什么 能跟我说说吗</div>
      <div class="bubble-msg priv"><span class="tag mono">晏星今天早点睡 · 刚刚</span>说吧，想问什么。</div>
      <div class="bubble-msg out"><span class="tag mono">你 · 刚刚</span>你看到什么了？</div>
    `;
    renderShenxiReply(thread, false);
    if (state.shenxiFollowupAsked) {
      thread.innerHTML += `<div class="bubble-msg out"><span class="tag mono">你 · 刚刚</span>那天晚上你还看到什么吗？</div>`;
      renderShenxiReply(thread, false, SHENXI_FOLLOWUP_STEPS);
    } else {
      renderFollowupButton(thread, stepEl);
    }
    return;
  }

  if (!openerDone) {
    thread.innerHTML = "";
    const btn = document.createElement("button");
    btn.textContent = "你知道什么 能跟我说说吗";
    btn.addEventListener("click", () => renderThread(thread, stepEl, true));
    stepEl.appendChild(btn);
    return;
  }

  thread.innerHTML = `
    <div class="bubble-msg out"><span class="tag mono">你 · 刚刚</span>你知道什么 能跟我说说吗</div>
    <div class="bubble-msg priv"><span class="tag mono">晏星今天早点睡 · 刚刚</span>说吧，想问什么。</div>
  `;

  const btn = document.createElement("button");
  btn.textContent = "你看到什么了？";
  btn.addEventListener("click", () => {
    state.shenxiAsked = true;
    save();
    markClueFound("c43");
    stepEl.innerHTML = "";
    thread.innerHTML += `<div class="bubble-msg out"><span class="tag mono">你 · 刚刚</span>你看到什么了？</div>`;
    renderShenxiReply(thread, true, SHENXI_REPLY_STEPS, () => renderFollowupButton(thread, stepEl));
  });
  stepEl.appendChild(btn);
}

function renderFollowupButton(thread, stepEl) {
  stepEl.innerHTML = "";
  const btn = document.createElement("button");
  btn.textContent = "那天晚上你还看到什么吗？";
  btn.addEventListener("click", () => {
    state.shenxiFollowupAsked = true;
    save();
    markClueFound("c40");
    stepEl.innerHTML = "";
    thread.innerHTML += `<div class="bubble-msg out"><span class="tag mono">你 · 刚刚</span>那天晚上你还看到什么吗？</div>`;
    renderShenxiReply(thread, true, SHENXI_FOLLOWUP_STEPS);
  });
  stepEl.appendChild(btn);
}
