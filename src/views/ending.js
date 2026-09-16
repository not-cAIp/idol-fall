import { endings, resolveSrc } from "../data.js";
import { state, resetGame, continueInvestigating } from "../state.js";
import { goTo } from "../router.js";

const BG_IMAGE = "/images/fan-avatar-yanxing-backstage-back.jpg";

let fxController = null;

export function renderEnding(root) {
  root.className = "";
  document.body.classList.remove("desktop-mode");
  document.body.classList.add("ending-mode");

  const bg = document.createElement("div");
  bg.className = "ending-bg";
  bg.style.backgroundImage = `url(${resolveSrc(BG_IMAGE)})`;
  root.appendChild(bg);

  const body = document.createElement("div");
  body.className = "view-body";
  root.appendChild(body);

  const isUnproven = state.finalEnding === "hexun_unproven";
  const suspect = endings.suspects.find((s) => s.id === state.finalSuspect);

  // 贺寻（正确）和 unclear 各自是一篇完整独立的结局，直接按 key 查表。
  // 其余 5 个错误嫌疑人不再共用一份 {name} 模板——每个人有自己独立的
  // 调查正文（body），只有中间那一小段"传播后果"（actionSuffix）随
  // 处理方式变化，结尾统一收在一段"未解释的裂缝"（crack）上，裂缝
  // 不随处理方式变化，见 content/endings.json 的 wrongEndings。
  let ending;
  if (isUnproven) {
    ending = endings.hexun_unproven;
  } else if (state.finalSuspect === "unclear") {
    ending = endings.endings.unclear;
  } else if (suspect?.correct) {
    ending = endings.endings[state.finalEnding];
  } else {
    const w = endings.wrongEndings?.[state.finalSuspect];
    if (w) {
      const suffix = w.actionSuffix[state.finalAction] || "";
      ending = { name: w.name, summary: [w.body, suffix, w.crack].filter(Boolean).join("\n\n") };
    }
  }

  if (!ending) {
    body.innerHTML = `<p class="intro">还没有结局——先去私信里把话说完再来看看。</p>`;
    return;
  }

  const paragraphs = ending.summary
    .split("\n\n")
    .map((p) => renderParagraph(p))
    .join("");
  const tag = isUnproven
    ? "证据不足"
    : suspect?.correct
    ? "推断正确"
    : state.finalSuspect === "unclear"
    ? "未指认任何人"
    : "推断有误";

  // 上下各留一块空白（约一屏高），保证正文第一句和最后一句都能被
  // 滚动到视口中间——不然贴着内容顶/底的那几行永远够不到聚焦带，
  // 永远是虚的，读不清楚。
  body.innerHTML = `
    <div class="ending-spacer"></div>
    <div class="ending-overlay">
      <div class="tag mono">${tag}</div>
      <h2>${ending.name}</h2>
      ${paragraphs}
      <div class="ending-actions">
        <div class="reset-link" id="continue-link">继续调查 ›</div>
        <div class="reset-link reset-link-faint" id="restart-link">重新开始（清空存档）</div>
      </div>
    </div>
    <div class="ending-spacer"></div>
  `;

  body.querySelector("#continue-link").addEventListener("click", () => {
    continueInvestigating();
    goTo("dm");
  });
  body.querySelector("#restart-link").addEventListener("click", () => {
    if (window.confirm("确定要清空所有存档、从头开始吗？已经找到的线索和推理进度都会消失，这个操作不能撤销。")) {
      resetGame();
    }
  });

  setupFocusFx(body);
}

// 三种段落：①裸时间戳（"23:52"这种整段就是一个时间点）当视觉锚点，
// 用等宽字体加大间距，不进入模糊/清晰的 fx 效果，滚动经过时始终清楚；
// ②整段加粗的强调句（**...**，原稿里都是独立成段的，不是段内一个词）
// 同样跳过 fx 效果、直接加粗常驻清晰；③其余正文照常走 fx 切片。三种
// 都是纯文字，没有卡片、没有边框、没有背景色，直接铺在结局背景图上。
function renderParagraph(p) {
  if (/^\d{2}:\d{2}(：\d{2})?[。.]?$/.test(p.trim())) {
    return `<div class="ending-time mono">${p.trim().replace(/[。.]$/, "")}</div>`;
  }
  const boldMatch = p.trim().match(/^\*\*(.+)\*\*$/);
  if (boldMatch) {
    return `<p class="ending-emphasis">${boldMatch[1]}</p>`;
  }
  return `<p>${wrapForFocusFx(p)}</p>`;
}

// 把一段文字按标点切成小段，各自包一个 span——配合 setupFocusFx()
// 做"只有视口中间一小段是清晰的，滚动的时候上下都是虚的"效果。中文
// 没有空格分词，按标点分段比按字符更自然，也不会切成一堆单字。
function wrapForFocusFx(text) {
  const chunks = text.split(/([，。！？；：、“”""]+)/).filter(Boolean);
  const spans = [];
  chunks.forEach((chunk) => {
    if (/^[，。！？；：、“”""]+$/.test(chunk)) {
      // 标点跟在上一段末尾，不单独成 span，避免视觉上断得太碎
      if (spans.length) spans[spans.length - 1] += chunk;
      else spans.push(chunk);
      return;
    }
    // 单段太长的话再按 ~8 字切一次，让虚化的过渡更细腻
    for (let i = 0; i < chunk.length; i += 8) {
      spans.push(chunk.slice(i, i + 8));
    }
  });
  return spans.map((s) => `<span class="fx-chunk">${s}</span>`).join("");
}

function setupFocusFx(body) {
  if (fxController) fxController.abort();
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const spans = body.querySelectorAll(".fx-chunk");
  if (!spans.length) return;

  fxController = new AbortController();
  const { signal } = fxController;

  const FOCUS_HALF = 65; // 约 5 行清晰区的半高
  const FADE_RANGE = 240;
  const MAX_BLUR = 7;

  let ticking = false;
  function apply() {
    const centerY = window.innerHeight / 2;
    spans.forEach((el) => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const dist = Math.abs(mid - centerY);
      if (dist <= FOCUS_HALF) {
        el.style.filter = "";
        el.style.opacity = "";
        return;
      }
      const t = Math.min(1, (dist - FOCUS_HALF) / FADE_RANGE);
      el.style.filter = `blur(${(t * MAX_BLUR).toFixed(2)}px)`;
      el.style.opacity = (1 - t * 0.55).toFixed(2);
    });
    ticking = false;
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  }

  window.addEventListener("scroll", onScroll, { passive: true, signal });
  document.getElementById("view")?.addEventListener("scroll", onScroll, { passive: true, signal });
  window.addEventListener("resize", onScroll, { signal });
  requestAnimationFrame(apply);
}
