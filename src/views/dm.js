import { endings } from "../data.js";
import { state, save, PT1_CLUE_IDS, canUnlockPt2, canConvictHeXun } from "../state.js";
import { goTo } from "../router.js";
import { renderTopNav } from "../components/weiboChrome.js";
import { icon } from "../components/icons.js";

const GW_URL = "https://not-cAIp.github.io/galaxy-workspace/";

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

  const pt1Found = PT1_CLUE_IDS.filter((id) => state.foundClues.includes(id)).length;
  const pt2Open = canUnlockPt2(state);

  if (!pt2Open) {
    renderPt1(panel, thread, pt1Found);
    return;
  }

  thread.innerHTML = `
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>如果他是23:52之后在自己住所去世的，公司的说法就站不住了。</div>
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你查了这么多，那你觉得，那晚真正该为这件事负责的人是谁？</div>
  `;

  if (!state.foundClues.includes("c37") || !state.foundClues.includes("c38")) {
    thread.innerHTML += `
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>我之前保存过陈屿工作文件夹的入口。密码他换过，我不知道现在还是不是那个。</div>
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>他以前有个很奇怪的习惯，重要项目都用"日期+当天发生的事"。</div>
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>我只记得那天是 9 月 13 日。后面的三个字母……好像和行程有关。</div>
    `;
    const gwLink = document.createElement("a");
    gwLink.className = "file-card";
    gwLink.href = GW_URL;
    gwLink.target = "_blank";
    gwLink.rel = "noopener";
    gwLink.innerHTML = `
      <span class="fc-icon">${icon("clipboard", { size: 17 })}</span>
      <span class="fc-info">
        <span class="fc-name">GALAXY WORKSPACE</span>
        <span class="fc-sub">需要访问口令</span>
      </span>
    `;
    thread.appendChild(gwLink);
  } else if (state.foundClues.includes("c36")) {
    // 沈溪的道德矛盾——只在玩家已经走完 GW（c37/c38）和 ECHO（c36）
    // 之后才出现，不早也不晚。不给判断，不说教，就摆出这个事实让
    // 玩家自己坐着不舒服一下：能证明公司撒谎的证据，一半是跟踪/
    // 偷拍/入侵账号换来的。这跟最终「实名公开/写报道/私下交给我/
    // 什么都不做」四选一是同一个主题的预埋，不需要提前点破。
    thread.innerHTML += `
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你有没有发现一件事。</div>
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>我们现在用来证明公司撒谎的东西，有一半是她跟踪他留下来的。</div>
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>真相是真的。</div>
      <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>但拿到它的方法也是。</div>
    `;
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

// PT1 分三步：①先问『几点之前去世的』——答案『00:20』要靠 AURORA
// 『尝试读取心率，未找到设备』这条记录撑住，是死亡区间的上界；②再问『几点之后
// 去世的』——答案『23:52』靠泡泡账号状态『最后活跃：23:52』撑住
// （Bubble 这一版起不再有任何私人聊天，只剩艺人广播 + 这一行账号
// 状态），是死亡区间的下界；两问都
// 答对后会有一条系统消息把两个点拼成一个区间讲给玩家听；③再问
// 『哪里』——答案『自己住所』要靠沈溪主页的帖子撑住（如果他真去了
// 杭州，不会有人在住所附近看到他）。每一步答错都只会停在原地反复
// 问，不会带着错的时间/地点先看到下一题。
const PT1_LOCATION_OPTIONS = [
  { id: "hangzhou", label: "杭州（官方原定行程地）" },
  { id: "residence", label: "自己住所" },
  { id: "unsure", label: "无法判断" },
];

function renderPt1(panel, thread, pt1Found) {
  thread.innerHTML = `
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>先别急着下结论，多查查清楚，别搞错了伤到不相干的人。</div>
    <p class="clue-progress mono">PT1 · 目前掌握线索：${pt1Found} / ${PT1_CLUE_IDS.length}</p>
  `;

  const stepEl = document.createElement("div");
  stepEl.className = "reply-options";

  thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>周晏星是几点之前去世的？</div>`;
  if (state.deathBeforeAnswer !== "before_0020") {
    if (state.deathBeforeAnswer) {
      const timeRecap = state.deathBeforeAnswer === "unsure" ? "无法判断" : `${state.deathBeforeAnswerRaw || ""} 之前`;
      thread.innerHTML += `
        <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${timeRecap}</div>
        <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你确定吗？先别急着下结论，多找找能撑住判断的证据。</div>
      `;
    }
    panel.appendChild(stepEl);
    renderTimeInput(
      stepEl,
      { placeholder: "输入具体时间，例如 01:15", suffix: "之前", classify: classifyBeforeTime },
      (cat, raw) => {
        state.deathBeforeAnswer = cat;
        state.deathBeforeAnswerRaw = raw;
        save();
        rerenderDm();
      }
    );
    return;
  }
  thread.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${state.deathBeforeAnswerRaw || ""} 之前</div>`;

  thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>那他是几点之后去世的？</div>`;
  if (state.deathAfterAnswer !== "after_2352") {
    if (state.deathAfterAnswer) {
      const timeRecap = state.deathAfterAnswer === "unsure" ? "无法判断" : `${state.deathAfterAnswerRaw || ""} 之后`;
      thread.innerHTML += `
        <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${timeRecap}</div>
        <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你确定吗？先别急着下结论，多找找能撑住判断的证据。</div>
      `;
    }
    panel.appendChild(stepEl);
    renderTimeInput(
      stepEl,
      { placeholder: "输入具体时间，例如 22:30", suffix: "之后", classify: classifyAfterTime },
      (cat, raw) => {
        state.deathAfterAnswer = cat;
        state.deathAfterAnswerRaw = raw;
        save();
        rerenderDm();
      }
    );
    return;
  }
  thread.innerHTML += `
    <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${state.deathAfterAnswerRaw || ""} 之后</div>
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>所以他是在 23:52 到 00:20 之间去世的。</div>
  `;

  thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>他是在哪里去世的？</div>`;
  if (state.deathLocationAnswer !== "residence") {
    if (state.deathLocationAnswer) {
      thread.innerHTML += `
        <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${optLabel(PT1_LOCATION_OPTIONS, state.deathLocationAnswer)}</div>
        <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你确定吗？先别急着下结论，多找找能撑住判断的证据。</div>
      `;
    }
    panel.appendChild(stepEl);
    renderOptions(stepEl, PT1_LOCATION_OPTIONS, (id) => {
      state.deathLocationAnswer = id;
      save();
      rerenderDm();
    });
    return;
  }
  // 三问全对：canUnlockPt2(state) 现在必然为真，renderDm() 顶层会在
  // 下一次渲染直接路由到 PT2 分支，这里不会真的执行到这一行之后。
  thread.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${optLabel(PT1_LOCATION_OPTIONS, state.deathLocationAnswer)}</div>`;
}

function optLabel(options, id) {
  return options.find((o) => o.id === id)?.label || "";
}

// 玩家自己填时间，不给选项——两个答案都不能靠排除法蒙，得真的从
// AURORA/泡泡的具体记录里读出准确的分钟数。
function parseTimeToMinutes(raw) {
  const s = (raw || "").trim();
  let m = s.match(/^(\d{1,2})\s*[:：点时]\s*(\d{1,2})\s*分?$/);
  if (!m) m = s.match(/^(\d{2})(\d{2})$/);
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (hh > 23 || mm > 59) return null;
  return hh * 60 + mm;
}

// 死亡区间的上界，只认一个准确时间点：AURORA 同步记录里『00:20 尝试
// 读取心率，未找到设备』——不是测到了心跳为零，是设备联系不上了，
// 但过了这个点就再没有任何活动迹象。
function classifyBeforeTime(raw) {
  const mins = parseTimeToMinutes(raw);
  if (mins === null) return null;
  if (mins === 0 * 60 + 20) return "before_0020";
  return "wrong";
}

// 死亡区间的下界，只认一个准确时间点：泡泡账号状态『最后活跃：
// 23:52』——Bubble 不再有任何私人聊天，这是唯一的时间来源。
function classifyAfterTime(raw) {
  const mins = parseTimeToMinutes(raw);
  if (mins === null) return null;
  if (mins === 23 * 60 + 52) return "after_2352";
  return "wrong";
}

function renderTimeInput(stepEl, { placeholder, suffix = "", classify }, onSubmit) {
  stepEl.innerHTML = `
    <div class="search-row" style="align-items:center;">
      <input id="pt1-time-input" type="text" placeholder="${placeholder}" />
      ${suffix ? `<span style="color:var(--ink-faint);font-size:13px;white-space:nowrap;">${suffix}</span>` : ""}
      <button id="pt1-time-submit">提交</button>
    </div>
    <div id="pt1-time-err" style="color:var(--danger);font-size:12px;margin-top:6px;"></div>
  `;
  const input = stepEl.querySelector("#pt1-time-input");
  const err = stepEl.querySelector("#pt1-time-err");
  function submit() {
    const raw = input.value.trim();
    if (!raw) return;
    const cat = classify(raw);
    if (cat === null) {
      err.textContent = "看不懂这个时间，试试类似 23:52 的格式";
      return;
    }
    onSubmit(cat, raw);
  }
  stepEl.querySelector("#pt1-time-submit").addEventListener("click", submit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });

  const unsureBtn = document.createElement("button");
  unsureBtn.className = "reset-link";
  unsureBtn.style.marginTop = "10px";
  unsureBtn.textContent = "无法判断";
  unsureBtn.addEventListener("click", () => onSubmit("unsure", null));
  stepEl.appendChild(unsureBtn);
}

function renderOptions(stepEl, options, onPick) {
  stepEl.innerHTML = "";
  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.textContent = o.label;
    btn.addEventListener("click", () => onPick(o.id));
    stepEl.appendChild(btn);
  });
}

function rerenderDm() {
  const rootEl = document.getElementById("view");
  const scrollTop = window.scrollY;
  rootEl.innerHTML = "";
  renderDm(rootEl);
  window.scrollTo(0, scrollTop);
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
