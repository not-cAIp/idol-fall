import { resolveSrc } from "../data.js";
import { state, save } from "../state.js";

// 日记特伯罗挂件——不是独立站点了，直接挂在新_PROD微博主页右下角。
// 玩家点机器人图标才会弹出聊天框，首次打开只有寒暄，真正的触发词是
// "查看历史日记"（兼容几种说法），逐条展开阅读，最后一篇带工牌，
// 员工ID是 GALAXY WORKSPACE F04 的密码，这里不会主动提示这一点。
const DIARY = [
  { date: "2017-09-12", text: "今天第一次进大练习室。\n\n镜子比学校舞蹈室大好多。旁边那个人跳得特别好，我没敢跟他说话。\n\n跟家里说了要留下来试试，我妈没说不行，只问了一句『如果几年都没结果怎么办』。我说不会的。" },
  { date: "2017-11-03", text: "老师说我这次进步很大，说不定真的能在这批里选上。\n\n家里不算特别支持，但也没拦着，就是每次视频都要问一句『什么时候能定下来』。我说快了。" },
  { date: "2018-02-06", text: "老师说我看镜头的时候像在看仇人。\n\n对着前置摄像头笑了四十分钟。\n\n越笑越像仇人。" },
  { date: "2018-05-19", text: "今天综合排名第二。第一名请喝奶茶。\n\n我觉得第二也应该有人请，就自己请了自己一杯。" },
  { date: "2018-07-30", text: "有个舞团的演出邀请，档期还挺长的。问了公司，说出道项目近期有调整，建议不要参与长期的外部项目。\n\n没去了。有点可惜。不过如果真的今年能进项目，也没什么好可惜的。" },
  { date: "2018-10-11", text: "今天帮忙顶了一场别人的直拍位置，事后没人发现是我顶的，效果反而说挺好。\n\n让别人看起来毫不费力，比自己不出错难多了。" },
  { date: "2019-03-07", text: "五个人。\n\n先不写是谁，万一以后真的成了再回来补。\n\n今天量了舞台服。以前一直觉得『出道』是个很远的词，今天突然觉得好像可以数日子了。" },
  { date: "2019-04-18", text: "公司内部测试出来了。老师说没有哪一项需要特别改，我问那为什么数据还是最低，他说这个很难解释。\n\n我觉得『很难解释』应该就是没办法改的意思。" },
  { date: "2019-05-10", text: "那边又来问了。\n\n最后一次。\n\n我其实想了挺久。但现在走才是真的疯了吧，都到这一步了。" },
  { date: "2019-05-21", text: "回绝了。\n\n有点睡不着。应该没选错。" },
  { date: "2019-05-23", text: "小时候最喜欢把字母往后挪三格写东西，写小纸条给自己看，也没什么用，就是觉得好玩。今天突然又想起这个。\n\n—— L FDQ VWLOO PDNH LW" },
  { date: "2019-06-10", text: "没有吵。也不知道该吵什么。\n\n他说不是能力问题。我问那是什么，他说综合考虑。\n\n『综合考虑』到底是哪一科？\n\n—— ZKDW GR L GR QRZ" },
  { date: "2020-03-02", text: "新公司，第一次月评。又从零开始，也没那么难。" },
  { date: "2020-09-18", text: "项目停了。原因没细说，反正也不是第一次听这种理由了。" },
  { date: "2021-05-22", text: "复试没过。评委说条件都不错，就是差了点运气。再试一次。" },
  { date: "2022-02-14", text: "今天有人问我以前练了这么久为什么没出，我说项目调整。\n\n说完突然觉得自己特别像HR。" },
  { date: "2022-11-03", text: "试镜老师问年龄的时候停了一下。我知道那个停顿是什么意思。" },
  { date: "2023-04-09", text: "填表格的时候看到职业那一栏不知道写什么，最后写了：舞台执行。\n\n居然也没有很难写。" },
  { date: "2024-03-01", text: "朋友介绍了一个后期的活，说是缺人手，先做着看看。" },
  { date: "2024-03-20", text: "第一次给别人贴麦。老师以前说我的手特别稳，没想到最后还真的有用。" },
  { date: "2025-12-08", text: "这次周年企划把我调去负责F4ever这条线的素材了，挺意外的。工牌编号换了新的，随手拍了一张。", badge: true },
  { date: "2026-01-20", text: "七年。人会变很多，练习室好像不会。\n\n没想到负责这次周年企划的人会是我。当年是我没能站到最后，现在轮到我给他们四个人做周年的东西，说不上什么滋味，只觉得有点讽刺。" },
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
        addBot("上次翻到一半吧？接着往下看。");
        openEntry(resumeIndex());
      }, 300);
    }
  }

  // 不再一次性列出全部日期给玩家自己跳着点——找到哪年哪天变成"一则一则
  // 往下翻"，只能按顺序推进，中途关掉聊天窗口重进也从上次看到的那篇
  // 接着开始，不会退回起点，但也不能直接跳到后面还没看过的篇章。
  function resumeIndex() {
    // 用"已读过的日期里，在 DIARY 顺序中最靠后的那一篇"而不是数组最后
    // 一个元素——旧存档（改版前允许跳着点）里 viewedDates 的顺序不一定
    // 跟 DIARY 顺序一致，这样才能稳妥地接到玩家实际读到的最远处。
    let best = -1;
    state.teboluoViewedDates.forEach((date) => {
      const idx = DIARY.findIndex((d) => d.date === date);
      if (idx > best) best = idx;
    });
    return best >= 0 ? best : 0;
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

  function openEntry(i) {
    const d = DIARY[i];
    if (!state.teboluoViewedDates.includes(d.date)) {
      state.teboluoViewedDates.push(d.date);
      save();
    }
    const card = document.createElement("div");
    card.className = "teboluo-entry";
    card.innerHTML = `<div class="d">${d.date}<span class="teboluo-idx"> · 第 ${i + 1} / ${DIARY.length} 篇</span></div><div class="t"></div>`;
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
      const alreadyTriggered = state.teboluoHistoryTriggered;
      state.teboluoHistoryTriggered = true;
      save();
      setTimeout(() => {
        if (alreadyTriggered) {
          addBot("接着上次翻到的地方往下看。");
        } else {
          addBot("找到了。");
          addBot("有些东西已经很久没人翻过了。");
        }
        openEntry(resumeIndex());
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
