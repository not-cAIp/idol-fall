import { postById } from "../data.js";
import { state, save, markClueFound } from "../state.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";

export function renderPostDetail(root, { id } = {}) {
  root.className = "weibo-scope";
  const p = postById(id);

  const header = document.createElement("header");
  header.className = "view-header";
  header.innerHTML = `
    <div class="vh-left">
      <button class="icon-btn back" id="btn-back">‹</button>
      <span class="vh-title">微博正文</span>
    </div>
  `;
  root.appendChild(header);
  header.querySelector("#btn-back").addEventListener("click", () => goTo("forum"));

  if (!p) {
    const body = document.createElement("div");
    body.className = "view-body";
    body.innerHTML = `<p class="intro">这条微博已被删除。</p>`;
    root.appendChild(body);
    return;
  }

  (p.clueOnOpen || []).forEach((id) => markClueFound(id));

  const body = document.createElement("div");
  body.className = "view-body";

  const post = document.createElement("article");
  post.className = "post" + (p.pinned ? " pinned" : "");
  post.innerHTML = `
    <div class="topline">
      <div>
        <span class="uname">${p.author}${p.verified ? '<span class="verified">✓ 已认证</span>' : ""}</span>
        <div class="handle">${p.handle}</div>
      </div>
      <div class="time mono">${p.time}</div>
    </div>
    <div class="text">${p.text}</div>
    <div class="flags">${(p.flags || []).map((f) => `<span class="flag${f.includes("官方") ? " official" : f.includes("存疑") || f.includes("未证实") || f.includes("修改") ? " warn" : ""}">${f}</span>`).join("")}</div>
    <div class="wb-actionbar" style="margin-top:10px;">
      <span>👍 ${p.likes || 0}</span>
      <span>💬 ${p.replies?.length || 0}</span>
      <span>🔁 ${p.reposts || 0}</span>
    </div>
  `;
  if (p.image || p.imagePrompt) {
    post.querySelector(".flags").after(
      createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt, imageCaption: p.imageCaption })
    );
  }
  body.appendChild(post);

  const commentsTitle = document.createElement("h3");
  commentsTitle.style.cssText = "font-size:14px;margin:18px 0 10px;color:var(--ink-soft);";
  commentsTitle.textContent = `全部评论 ${p.replies?.length || 0}`;
  body.appendChild(commentsTitle);

  const list = document.createElement("div");
  list.className = "post";
  const repliesEl = document.createElement("div");
  repliesEl.className = "replies";
  repliesEl.style.borderTop = "none";
  repliesEl.style.paddingTop = "0";
  list.appendChild(repliesEl);
  body.appendChild(list);

  (p.replies || []).forEach((r, idx) => {
    const key = `${p.id}-${idx}`;
    const revealed = state.expandedReplies.includes(key);
    const rEl = document.createElement("div");
    rEl.className = "reply" + (r.buried ? " buried" : "") + (revealed ? " revealed" : "");
    rEl.innerHTML = `<b>${r.author}</b>：<span class="text">${r.text}</span><div class="meta">${r.meta || ""}</div>`;

    if (r.buried && !revealed) {
      rEl.addEventListener("click", () => {
        state.expandedReplies.push(key);
        save();
        if (p.id === "p006" && idx === 1) markClueFound("t01");
        renderAgain();
      });
    }
    repliesEl.appendChild(rEl);
  });

  root.appendChild(body);

  function renderAgain() {
    const scrollTop = root.scrollTop;
    root.innerHTML = "";
    renderPostDetail(root, { id });
    root.scrollTop = scrollTop;
  }
}
