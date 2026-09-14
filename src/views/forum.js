import { posts, clues } from "../data.js";
import { state, computeAct } from "../state.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";

export function renderForum(root) {
  root.className = "weibo-scope";
  const act = computeAct(state);
  const visible = posts.posts
    .filter((p) => p.act <= act)
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || a.time.localeCompare(b.time));

  const coreDone = clues.timeline.filter((c) => c.core).every((c) => state.foundClues.includes(c.id));

  const header = document.createElement("header");
  header.className = "wb-header";
  header.innerHTML = `
    <span class="wb-logo">星潮</span>
    <div class="wb-search-bar" id="wb-search">🔍 搜索账号 / 昵称 / 关键词</div>
    <button class="wb-dm-btn" id="wb-dm" title="私信">✉️${coreDone ? '<span class="wb-dot"></span>' : ""}</button>
  `;
  root.appendChild(header);
  header.querySelector("#wb-search").addEventListener("click", () => goTo("search"));
  header.querySelector("#wb-dm").addEventListener("click", () => goTo("dm"));

  const feed = document.createElement("div");
  feed.className = "wb-feed";

  feed.appendChild(
    promoCard({
      icon: "🧭",
      name: "案件推理台",
      url: "case.xingchao.fm/timeline",
      tag: "站内工具",
      onClick: () => goTo("reasoning"),
    })
  );
  feed.appendChild(
    promoCard({
      icon: "🫧",
      name: "泡泡 · 偶像通讯",
      url: "bubble.fan/login",
      tag: "第三方 App",
      onClick: () => goTo("bubble"),
    })
  );

  visible.forEach((p) => {
    const card = document.createElement("article");
    card.className = "wb-card";
    card.innerHTML = `
      <div class="wb-avatar"></div>
      <div class="wb-body">
        <div class="wb-top">
          <span class="wb-name">${p.pinned ? '<span class="wb-pin">置顶</span>' : ""}${p.author}${p.verified ? '<span class="verified">✓</span>' : ""}</span>
          <span class="wb-time mono">${p.time}</span>
        </div>
        <div class="wb-text">${p.text}</div>
        <div class="wb-thumb-slot"></div>
        <div class="wb-actionbar">
          <span>👍 ${p.likes || 0}</span>
          <span>💬 ${p.replies?.length || 0}</span>
          <span>🔁 ${p.reposts || 0}</span>
        </div>
      </div>
    `;
    if (p.image || p.imagePrompt) {
      const slot = card.querySelector(".wb-thumb-slot");
      slot.className = "wb-thumb";
      const thumb = createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt, imageCaption: p.imageCaption });
      thumb.addEventListener("click", (e) => e.stopPropagation());
      slot.appendChild(thumb);
    }
    card.addEventListener("click", () => goTo("postDetail", { id: p.id }));
    feed.appendChild(card);
  });

  root.appendChild(feed);
}

function promoCard({ icon, name, url, tag, onClick }) {
  const el = document.createElement("div");
  el.className = "wb-promo";
  el.innerHTML = `
    <span class="wb-promo-icon">${icon}</span>
    <div>
      <div class="wb-promo-name">${name}</div>
      <div class="wb-promo-url mono">${url}</div>
    </div>
    <span class="wb-promo-tag">${tag}</span>
  `;
  el.addEventListener("click", onClick);
  return el;
}
