import { endings, resolveSrc } from "../data.js";
import { state, resetGame, continueInvestigating } from "../state.js";
import { goTo } from "../router.js";

const BG_IMAGE = "/images/fan-avatar-yanxing-backstage-back.jpg";

let fxController = null;

export function renderEnding(root) {
  root.className = "";
  document.body.classList.remove("desktop-mode");

  const bg = document.createElement("div");
  bg.className = "ending-bg";
  bg.style.backgroundImage = `url(${resolveSrc(BG_IMAGE)})`;
  root.appendChild(bg);

  const body = document.createElement("div");
  body.className = "view-body";
  root.appendChild(body);

  const isUnproven = state.finalEnding === "hexun_unproven";
  const ending = isUnproven ? endings.hexun_unproven : endings.endings[state.finalEnding];
  if (!ending) {
    body.innerHTML = `<p class="intro">还没有结局——先去私信里把话说完再来看看。</p>`;
    return;
  }

  const suspect = endings.suspects.find((s) => s.id === state.finalSuspect);
  const summary = ending.summary.replaceAll("{name}", suspect?.name || "那个人");
  const paragraphs = summary
    .split("\n\n")
    .map((p) => `<p>${wrapForFocusFx(p)}</p>`)
    .join("");
  const tag = isUnproven
    ? "证据不足"
    : suspect?.correct
    ? "推断正确"
    : state.finalSuspect === "unclear"
    ? "未指认任何人"
    : "推断有误";

  body.innerHTML = `
    <div class="ending-card">
      <div class="tag mono">${tag}</div>
      <h2>${ending.name}</h2>
      ${paragraphs}
    </div>
    <div class="reset-link" id="continue-link">继续调查 ›</div>
    <div class="reset-link reset-link-faint" id="restart-link">重新开始（清空存档）</div>
  `;

  body.querySelector("#continue-link").addEventListener("click", () => {
    continueInvestigating();
    goTo("dm");
  });
  body.querySelector("#restart-link").addEventListener("click", resetGame);

  setupFocusFx(body);
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
