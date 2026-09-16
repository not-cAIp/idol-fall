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
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>如果他是23:52之后在自己住所去世的，公司的说法就站不住了。</div>
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

// PT1 分三步：①先问『公司公布的死亡时间是否成立』，选『不成立，23:43
// 之后仍然活着』才往下走，选别的只给一句轻推回，停在这一步反复问；
// ②过了①，再直接问『几点』——答案『23:52之后』要靠 AURORA 手环同步
// 记录撑住；③再问『哪里』——答案『自己住所』要靠沈溪主页的帖子撑住
// （如果他真去了杭州，不会有人在住所附近看到他）。
const PT1_GATE_OPTIONS = [
  { id: "at_2320", label: "成立，约23:20死亡" },
  { id: "after_2343", label: "不成立，23:43之后仍然活着" },
  { id: "unsure", label: "无法判断" },
];
const PT1_LOCATION_OPTIONS = [
  { id: "hangzhou", label: "杭州（官方原定行程地）" },
  { id: "residence", label: "自己住所" },
  { id: "unsure", label: "无法判断" },
];

function renderPt1(panel, thread, found) {
  thread.innerHTML = `
    <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>先别急着下结论，多查查清楚，别搞错了伤到不相干的人。</div>
    <p class="clue-progress mono">目前掌握线索：${found} / ${CLUE_TOTAL}</p>
  `;

  const stepEl = document.createElement("div");
  stepEl.className = "reply-options";

  thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>公司公布的死亡时间是否成立？</div>`;
  if (state.officialTimeAnswer !== "after_2343") {
    if (state.officialTimeAnswer) {
      thread.innerHTML += `
        <div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${optLabel(PT1_GATE_OPTIONS, state.officialTimeAnswer)}</div>
        <div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你确定吗？先别急着下结论，多找找能撑住判断的证据。</div>
      `;
    }
    panel.appendChild(stepEl);
    renderOptions(stepEl, PT1_GATE_OPTIONS, (id) => {
      state.officialTimeAnswer = id;
      save();
      rerenderDm();
    });
    return;
  }
  thread.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${optLabel(PT1_GATE_OPTIONS, state.officialTimeAnswer)}</div>`;

  thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>周晏星是几点之后去世的？</div>`;
  if (!state.deathTimeAnswer) {
    panel.appendChild(stepEl);
    renderTimeInput(stepEl, (id, raw) => {
      state.deathTimeAnswer = id;
      state.deathTimeAnswerRaw = raw;
      save();
      rerenderDm();
    });
    return;
  }
  const timeRecap = state.deathTimeAnswer === "unsure" ? "无法判断" : `${state.deathTimeAnswerRaw || ""} 之后`;
  thread.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${timeRecap}</div>`;

  thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>他是在哪里去世的？</div>`;
  if (!state.deathLocationAnswer) {
    panel.appendChild(stepEl);
    renderOptions(stepEl, PT1_LOCATION_OPTIONS, (id) => {
      state.deathLocationAnswer = id;
      save();
      rerenderDm();
    });
    return;
  }
  thread.innerHTML += `<div class="bubble-msg out chat-sent"><span class="tag mono">你 · 刚刚</span>${optLabel(PT1_LOCATION_OPTIONS, state.deathLocationAnswer)}</div>`;

  // 注意：canUnlockPt2(state) 在这里必然是 false——一旦为 true，
  // renderDm() 顶层就已经直接路由到 PT2 分支，根本不会调用 renderPt1()。
  const answersRight = state.deathTimeAnswer === "after_2352" && state.deathLocationAnswer === "residence";
  if (answersRight) {
    thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>光有判断还不够，你手上得先有能撑住这个判断的证据。</div>`;
  } else {
    thread.innerHTML += `<div class="bubble-msg priv"><span class="tag mono">陪你走到最后 · 刚刚</span>你确定吗？先别急着下结论，多找找能撑住判断的证据。</div>`;
  }

  const retry = document.createElement("div");
  retry.className = "reset-link";
  retry.textContent = "重新想想 ›";
  retry.addEventListener("click", () => {
    state.deathTimeAnswer = null;
    state.deathTimeAnswerRaw = null;
    state.deathLocationAnswer = null;
    save();
    rerenderDm();
  });
  panel.appendChild(retry);
}

function optLabel(options, id) {
  return options.find((o) => o.id === id)?.label || "";
}

// 玩家自己填时间，不给选项——"23:52之后"不能靠排除法蒙，得真的从
// AURORA 手环记录（23:47仍在同步、23:52中断）里读出这个点。00:00-05:59
// 也算"当晚这之后"，覆盖真实死亡窗口 23:50-00:10 附近的合理填法。
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

function classifyDeathTime(raw) {
  const mins = parseTimeToMinutes(raw);
  if (mins === null) return null;
  if (mins >= 23 * 60 + 52 || mins < 6 * 60) return "after_2352";
  return "wrong";
}

function renderTimeInput(stepEl, onSubmit) {
  stepEl.innerHTML = `
    <div class="search-row" style="align-items:center;">
      <input id="pt1-time-input" type="text" placeholder="输入具体时间，例如 23:52" />
      <span style="color:var(--ink-faint);font-size:13px;white-space:nowrap;">之后</span>
      <button id="pt1-time-submit">提交</button>
    </div>
    <div id="pt1-time-err" style="color:var(--danger);font-size:12px;margin-top:6px;"></div>
  `;
  const input = stepEl.querySelector("#pt1-time-input");
  const err = stepEl.querySelector("#pt1-time-err");
  function submit() {
    const raw = input.value.trim();
    if (!raw) return;
    const cat = classifyDeathTime(raw);
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
