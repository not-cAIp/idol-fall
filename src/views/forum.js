import { posts, clues } from "../data.js";
import { state, save, markClueFound, computeAct } from "../state.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";

export function renderForum(root) {
  draw(root);
}

function redraw(root) {
  const scrollTop = root.scrollTop;
  root.innerHTML = "";
  draw(root);
  root.scrollTop = scrollTop;
}

function draw(root) {
  const act = computeAct(state);
  const visible = posts.posts
    .filter((p) => p.act <= act)
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || a.time.localeCompare(b.time));

  visible.forEach((p) => {
    if (p.id === "p001") {
      markClueFound("t02");
      markClueFound("t05");
    }
    if (p.id === "p010") markClueFound("t06");
  });

  const totalHints = clues.timeline.length;
  const foundHints = state.foundClues.length;

  const header = document.createElement("header");
  header.className = "view-header";
  header.innerHTML = `
    <div class="vh-left"><span class="brand">星潮</span></div>
    <div class="vh-actions">
      ${foundHints > 0 ? `<button class="icon-btn" id="btn-reasoning" title="推理">🧭</button>` : ""}
      ${state.bubbleDiscovered ? `<button class="icon-btn" id="btn-bubble" title="泡泡">🫧</button>` : ""}
      <button class="icon-btn" id="btn-search" title="搜索">🔍</button>
    </div>
  `;
  root.appendChild(header);
  header.querySelector("#btn-search").addEventListener("click", () => goTo("search"));
  header.querySelector("#btn-bubble")?.addEventListener("click", () => goTo("bubble"));
  header.querySelector("#btn-reasoning")?.addEventListener("click", () => goTo("reasoning"));

  const body = document.createElement("div");
  body.className = "view-body";
  body.innerHTML = `<p class="intro">晏星本人超话 · 已发现线索 ${foundHints} / ${totalHints}</p>`;

  visible.forEach((p) => {
    const el = document.createElement("article");
    el.className = "post" + (p.pinned ? " pinned" : "");
    el.innerHTML = `
      <div class="topline">
        <div>
          <span class="uname">${p.author}${p.verified ? '<span class="verified">✓ 已认证</span>' : ""}</span>
          <div class="handle">${p.handle}</div>
        </div>
        <div class="time mono">${p.time}</div>
      </div>
      <div class="text">${p.text}</div>
      <div class="flags">${(p.flags || []).map((f) => `<span class="flag${f.includes("官方") ? " official" : f.includes("存疑") || f.includes("未证实") || f.includes("修改") ? " warn" : ""}">${f}</span>`).join("")}</div>
      <div class="replies"></div>
    `;
    if (p.image || p.imagePrompt) {
      el.querySelector(".flags").after(
        createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt, imageCaption: p.imageCaption })
      );
    }
    const repliesEl = el.querySelector(".replies");
    (p.replies || []).forEach((r, idx) => {
      const key = `${p.id}-${idx}`;
      const revealed = state.expandedReplies.includes(key);
      const rEl = document.createElement("div");
      rEl.className = "reply" + (r.buried ? " buried" : "") + (revealed ? " revealed" : "");

      const bodyHtml = r.linkTo
        ? `<span class="text">${r.text} <a class="link-pill" data-link="${r.linkTo}">${r.linkLabel}</a></span>`
        : `<span class="text">${r.text}</span>`;
      rEl.innerHTML = `<b>${r.author}</b>：${bodyHtml}<div class="meta">${r.meta || ""}</div>`;

      if (r.buried && !revealed) {
        rEl.addEventListener("click", () => {
          state.expandedReplies.push(key);
          save();
          if (p.id === "p006" && idx === 1) markClueFound("t01");
          redraw(root);
        });
      }
      if (r.linkTo) {
        rEl.querySelector(".link-pill").addEventListener("click", (e) => {
          e.stopPropagation();
          state.bubbleDiscovered = true;
          save();
          goTo(r.linkTo);
        });
      }
      repliesEl.appendChild(rEl);
    });
    body.appendChild(el);
  });

  root.appendChild(body);
}
