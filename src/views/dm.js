import { endings } from "../data.js";
import { state, save, CLUE_TOTAL } from "../state.js";
import { goTo } from "../router.js";
import { renderTopNav } from "../components/weiboChrome.js";

const HINT_TIERS = [
  { max: 10, text: "超话里还有很多人似乎知道些什么。试着留意评论里反复出现的名字。" },
  { max: 20, text: "有些账号并不能用真名找到。你见过的昵称、物品、宠物，也许都有意义。" },
  { max: 29, text: "你已经很接近了。但死亡前最后几个小时，还有人的说法没有互相对上。" },
  { max: 33, text: "只差一点。也许该回头看看你已经找到的人——有些主页后来出现了新的内容。" },
];

function hintFor(found) {
  const tier = HINT_TIERS.find((t) => found <= t.max);
  return tier ? tier.text : "";
}

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
  const ready = found >= CLUE_TOTAL;
  const { conclusionChoices } = endings.reportOptions;

  const thread = document.createElement("div");
  thread.className = "bubble-thread";
  panel.appendChild(thread);

  if (!ready) {
    thread.innerHTML = `
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你是不是也觉得这件事不对？</div>
      <p class="clue-progress mono">目前掌握线索：${found} / ${CLUE_TOTAL}</p>
      <p class="clue-hint">你掌握的信息似乎还不足以还原那一晚。${hintFor(found)}</p>
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
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>看你这几天查了不少东西。方便说说，你手上到底有什么，打算怎么处理吗？</div>
  `;

  if (state.finalEnding) {
    const chosen = conclusionChoices.find((c) => c.id === state.finalReply);
    thread.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${chosen ? chosen.text : ""}</div>`;
    const link = document.createElement("div");
    link.className = "reset-link";
    link.textContent = "查看结案结果 ›";
    link.addEventListener("click", () => goTo("ending"));
    panel.appendChild(link);
    return;
  }

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
  panel.appendChild(optionsEl);
}

function computeEnding(replyId) {
  if (replyId === "c_expose_su") return "D";
  const hasHistory = state.foundClues.includes("c26") && state.foundClues.includes("c27");
  const hasPressure = state.foundClues.includes("c03") && state.foundClues.includes("c05");
  if (replyId === "c_company") return hasHistory ? "A" : "D";
  if (replyId === "c_pressure") return hasPressure ? "B" : "D";
  if (replyId === "c_protect") return "C";
  return "D";
}
