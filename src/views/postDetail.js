import { postById } from "../data.js";
import { state, save, markClueFound } from "../state.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { renderTopNav, renderRightbar } from "../components/weiboChrome.js";
import { icon, verifiedBadge } from "../components/icons.js";

export function renderPostDetail(root, { id } = {}) {
  const p = postById(id);

  root.className = "weibo-scope";
  renderTopNav(root);

  const layout = document.createElement("div");
  layout.className = "wlayout no-leftnav";
  root.appendChild(layout);

  const main = document.createElement("main");
  layout.appendChild(main);
  layout.appendChild(renderRightbar(p?.thread));

  const back = document.createElement("div");
  back.className = "wback-row";
  back.innerHTML = p?.profile ? "‹ 返回主页" : "‹ 返回超话";
  back.addEventListener("click", () => {
    if (p?.profile) goTo("search", { profile: p.profile });
    else goTo("forum", { thread: p?.thread });
  });
  main.appendChild(back);

  if (!p) {
    const empty = document.createElement("div");
    empty.className = "wfeed-card";
    empty.textContent = "这条微博已被删除。";
    main.appendChild(empty);
    return;
  }

  (p.clueOnOpen || []).forEach((clueId) => markClueFound(clueId));

  const post = document.createElement("article");
  post.className = "post" + (p.pinned ? " pinned" : "");
  post.innerHTML = `
    <div class="topline">
      <div>
        <span class="uname">${p.author}${p.verified ? `<span class="verified">${verifiedBadge({ size: 13 })} 已认证</span>` : ""}${p.tag ? `<span class="ftag-status">${p.tag}</span>` : ""}</span>
        <div class="handle">${p.handle}</div>
      </div>
      <div class="time mono">${p.time}</div>
    </div>
    <div class="text">${p.text}</div>
    <div class="wb-actionbar" style="margin-top:10px;display:flex;gap:22px;font-size:12px;color:var(--ink-faint);font-family:'JetBrains Mono',monospace;">
      <span style="display:inline-flex;align-items:center;gap:5px;">${icon("like", { size: 14 })} ${p.likes || 0}</span>
      <span style="display:inline-flex;align-items:center;gap:5px;">${icon("chat", { size: 14 })} ${p.replies?.length || 0}</span>
      <span style="display:inline-flex;align-items:center;gap:5px;">${icon("repost", { size: 14 })} ${p.reposts || 0}</span>
    </div>
  `;
  if (p.image || p.imagePrompt) {
    post.querySelector(".text").after(
      createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt, imageCaption: p.imageCaption })
    );
  }
  main.appendChild(post);

  if (p.history) {
    const revealed = state.foundClues.includes(p.history.clueId);
    if (revealed) {
      const histEl = document.createElement("div");
      histEl.className = "post-history revealed";
      histEl.innerHTML = `<div class="ph-label">历史版本</div><div class="text">${p.history.oldText}</div>`;
      main.appendChild(histEl);
    } else {
      const toggle = document.createElement("div");
      toggle.className = "post-history-toggle";
      toggle.textContent = "‹ 查看历史版本";
      toggle.addEventListener("click", () => {
        markClueFound(p.history.clueId);
        renderAgain();
      });
      main.appendChild(toggle);
    }
  }

  const commentsTitle = document.createElement("h3");
  commentsTitle.style.cssText = "font-size:14px;margin:18px 0 10px;color:var(--ink-soft);";
  commentsTitle.textContent = `全部评论 ${p.replies?.length || 0}`;
  main.appendChild(commentsTitle);

  const list = document.createElement("div");
  list.className = "post";
  const repliesEl = document.createElement("div");
  repliesEl.className = "replies";
  repliesEl.style.borderTop = "none";
  repliesEl.style.paddingTop = "0";
  list.appendChild(repliesEl);
  main.appendChild(list);

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
        if (r.clueId) markClueFound(r.clueId);
        renderAgain();
      });
    }
    repliesEl.appendChild(rEl);
  });

  function renderAgain() {
    const scrollTop = window.scrollY;
    root.innerHTML = "";
    renderPostDetail(root, { id });
    window.scrollTo(0, scrollTop);
  }
}
