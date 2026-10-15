import { resolveSrc } from "../data.js";
import { state, save } from "../state.js";

// 日记特伯罗挂件——不是独立站点了，直接挂在新_PROD微博主页右下角。
// 玩家点机器人图标才会弹出聊天框，首次打开只有寒暄，真正的触发词是
// "查看历史日记"（兼容几种说法），逐条展开阅读，最后一篇带工牌，
// 员工ID是 GALAXY WORKSPACE F04 的密码，这里不会主动提示这一点。
const DIARY = [
  { date: "2017-09-12", text: "今天教室的镜子换新的了。站在最中间拍了张照，感觉是个好兆头。" },
  { date: "2017-11-03", text: "老师说我这次进步很大，说不定真的能在这批里选上。" },
  { date: "2018-01-15", text: "如果真的能站上去，第一件事想给家里打个电话。" },
  { date: "2019-03-20", text: "听说要重新评估，说是要看\"风险\"。不太懂具体指什么，但心里有点慌。" },
  { date: "2019-06-15", text: "还是没通过。他们说是\"私人关系风险\"，我想不明白哪来的关系。" },
  { date: "2019-06-30", text: "五个人的群，现在我进不去了。" },
  { date: "2020-08-10", text: "又报了一个新公司的选秀，年龄要求正好卡在边上。我还有机会。" },
  { date: "2021-05-22", text: "复试没过。评委说条件都不错，就是差了点运气。再试一次。" },
  { date: "2022-02-14", text: "朋友劝我别再试了。为什么还是不行。" },
  { date: "2023-04-09", text: "填表格的时候看到年龄那一栏，愣了一下。同期的人有的都退圈了，我还在投简历。" },
  { date: "2024-03-01", text: "朋友介绍了一个后期的活，说是缺人手，先做着看看。" },
  { date: "2024-03-20", text: "第一次坐在监视器后面，感觉很奇怪。习惯了倒也没那么难受，至少还在这一行，不用再交材料了。" },
  { date: "2025-12-08", text: "这次周年企划把我调去负责F4ever这条线的素材了，挺意外的。工牌编号换了新的，随手拍了一张。", badge: true },
  { date: "2026-01-20", text: "没想到负责这次周年企划的人会是我。当年是我没能站到最后，现在轮到我给他们四个人做周年的东西，说不上什么滋味，只觉得有点讽刺。" },
];
const EMPLOYEE_ID = "P-0416";

const HISTORY_TRIGGERS = ["查看历史日记", "历史日记", "看以前的日记", "查看以前的日记"];
const FALLBACKS = [
  "这个我好像听不懂。",
  "我只记得主人让我保管的那些东西。",
  "换个说法试试看？",
  "如果是以前留下来的东西，也许我还能帮你找找。",
];
let fallbackIdx = 0;

function normalize(s) {
  return s.trim().replace(/[\s。！？，、]/g, "");
}

export function mountTeboluoWidget(container) {
  const wrap = document.createElement("div");
  wrap.className = "teboluo-wrap";
  wrap.innerHTML = `
    <div class="teboluo-mascot" id="teboluo-mascot"${state.teboluoUnlocked ? "" : " hidden"}>
      <img src="${resolveSrc("/images/teboluo-fullbody.png")}" alt="日记特伯罗" />
      <div class="teboluo-hint">点它试试</div>
    </div>
    <div class="teboluo-panel" id="teboluo-panel" hidden>
      <div class="teboluo-head">
        <img src="${resolveSrc("/images/teboluo-avatar.png")}" alt="" />
        <div class="ti">
          <div class="n">日记特伯罗</div>
          <div class="s"><span class="dot"></span>新_PROD的日记特伯罗</div>
        </div>
        <button class="teboluo-close" id="teboluo-close">✕</button>
      </div>
      <div class="teboluo-body" id="teboluo-body"></div>
      <div class="teboluo-input-row">
        <input id="teboluo-input" type="text" placeholder="想说点什么……" autocomplete="off" />
        <button id="teboluo-send">➤</button>
      </div>
    </div>
  `;
  container.appendChild(wrap);

  const mascot = wrap.querySelector("#teboluo-mascot");
  const panel = wrap.querySelector("#teboluo-panel");
  const body = wrap.querySelector("#teboluo-body");
  const input = wrap.querySelector("#teboluo-input");
  const sendBtn = wrap.querySelector("#teboluo-send");
  const closeBtn = wrap.querySelector("#teboluo-close");

  let chatOpened = false;

  // np07 帖子里的假链接不是真的外链（不用 <a>，点了不跳转），点一下
  // 只是让机器人图标出现在页面上——container 是整个主页（挂件 + 帖子
  // 列表的共同父节点），事件委托在这里绑一次就够，不用管帖子是先渲染
  // 还是后渲染。已经解锁过的话，这个监听器留着也无所谓，反正找不到
  // 未解锁的图标可摸。用捕获阶段绑：帖子卡片自己会在假链接上调用
  // stopPropagation 来防止点了跳进详情页，那是冒泡阶段的操作，捕获
  // 阶段在它之前就先跑完了，不会被拦到。
  container.addEventListener(
    "click",
    (e) => {
      if (!e.target.closest("[data-teboluo-fake-link]")) return;
      if (state.teboluoUnlocked) return;
      state.teboluoUnlocked = true;
      save();
      mascot.hidden = false;
      mascot.classList.add("is-revealing");
    },
    true
  );

  mascot.addEventListener("click", () => {
    panel.hidden = false;
    if (!chatOpened) {
      chatOpened = true;
      greet();
    }
  });
  closeBtn.addEventListener("click", () => { panel.hidden = true; });

  function greet() {
    addBot("你好呀，我是日记特伯罗。这里替主人保存了一些以前的东西。");
    addBot("想找什么的话，可以直接告诉我。");
    if (state.teboluoHistoryTriggered) {
      setTimeout(() => {
        addBot("上次翻到一半吧？要不要接着看？");
        addDateList();
      }, 300);
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
  }

  function addBot(text) {
    const row = document.createElement("div");
    row.className = "teboluo-row bot";
    row.innerHTML = `<img src="${resolveSrc("/images/teboluo-avatar.png")}" alt=""><div class="teboluo-bubble"></div>`;
    row.querySelector(".teboluo-bubble").textContent = text;
    body.appendChild(row);
    scrollToBottom();
  }
  function addMe(text) {
    const row = document.createElement("div");
    row.className = "teboluo-row me";
    row.innerHTML = `<div class="teboluo-bubble"></div>`;
    row.querySelector(".teboluo-bubble").textContent = text;
    body.appendChild(row);
    scrollToBottom();
  }

  function addDateList() {
    const list = document.createElement("div");
    list.className = "teboluo-date-list";
    DIARY.forEach((d, i) => {
      const btn = document.createElement("button");
      btn.textContent = d.date;
      if (state.teboluoViewedDates.includes(d.date)) btn.classList.add("viewed");
      btn.addEventListener("click", () => openEntry(i));
      list.appendChild(btn);
    });
    body.appendChild(list);
    scrollToBottom();
  }

  function openEntry(i) {
    const d = DIARY[i];
    if (!state.teboluoViewedDates.includes(d.date)) {
      state.teboluoViewedDates.push(d.date);
      save();
    }
    const card = document.createElement("div");
    card.className = "teboluo-entry";
    card.innerHTML = `<div class="d">${d.date}</div><div class="t"></div>`;
    card.querySelector(".t").textContent = d.text;
    body.appendChild(card);

    if (d.badge) {
      const badge = document.createElement("div");
      badge.className = "teboluo-badge";
      badge.innerHTML = `
        <div class="strap"></div>
        <div class="card">
          <img src="${resolveSrc("/images/hexun-prod-id.jpg")}" alt="工牌照片，编号 ${EMPLOYEE_ID}" />
        </div>`;
      body.appendChild(badge);
    }

    const nav = document.createElement("div");
    nav.className = "teboluo-nav";
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "‹ 上一则";
    prevBtn.disabled = i <= 0;
    prevBtn.addEventListener("click", () => openEntry(i - 1));
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "下一则 ›";
    nextBtn.disabled = i >= DIARY.length - 1;
    nextBtn.addEventListener("click", () => openEntry(i + 1));
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    body.appendChild(nav);
    scrollToBottom();
  }

  function handleInput(raw) {
    const text = raw.trim();
    if (!text) return;
    addMe(text);
    input.value = "";

    const n = normalize(text);

    if (HISTORY_TRIGGERS.some((k) => n.includes(k.replace(/\s/g, "")))) {
      state.teboluoHistoryTriggered = true;
      save();
      setTimeout(() => {
        addBot("找到了。");
        addBot("有些东西已经很久没人翻过了。");
        addDateList();
      }, 250);
      return;
    }

    if (/你好|hi|hello|嗨|在吗/i.test(n)) {
      setTimeout(() => addBot("你好呀，找我有什么事吗？"), 200);
      return;
    }
    if (n.includes("你是谁")) {
      setTimeout(() => addBot("我是日记特伯罗，负责帮主人整理和保存日记。"), 200);
      return;
    }
    if (/新_?prod是谁/i.test(n)) {
      setTimeout(() => addBot("这是这里的主人呀。至于其他的，我只负责保存他留下来的东西。"), 200);
      return;
    }
    if (n === "日记" || n.includes("有什么日记") || n.includes("能看日记")) {
      setTimeout(() => addBot("这里确实保存过一些旧记录。你想查看什么？"), 200);
      return;
    }

    setTimeout(() => {
      addBot(FALLBACKS[fallbackIdx % FALLBACKS.length]);
      fallbackIdx++;
    }, 200);
  }

  sendBtn.addEventListener("click", () => handleInput(input.value));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleInput(input.value); });
}
