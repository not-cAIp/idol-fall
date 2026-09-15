import { posts } from "../data.js";
import { state, computeAct } from "../state.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { renderTopNav, renderRightbar } from "../components/weiboChrome.js";

const TABS_CLICKABLE = ["最新", "精华"];
const TABS_STATIC = ["安利帖", "图文产出", "绝美舞台", "水贴专区"];
const TABS = [...TABS_CLICKABLE, ...TABS_STATIC];
const FEED_CAP = 10;
let activeTab = "最新";

function postsForTab(tab, act) {
  if (tab === "精华") {
    return posts.posts
      .filter((p) => (!p.section || p.section === "essence") && p.act <= act)
      .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || a.time.localeCompare(b.time));
  }
  // 最新：纯水贴池，不含线索
  return posts.posts
    .filter((p) => p.section === "flavor")
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || b.time.localeCompare(a.time));
}

export function renderForum(root) {
  root.className = "weibo-scope";

  renderTopNav(root);

  const layout = document.createElement("div");
  layout.className = "wlayout no-leftnav";
  root.appendChild(layout);

  const main = document.createElement("main");
  layout.appendChild(main);

  main.innerHTML = `
    <div class="wbanner">
      <div class="wbanner-top">
        <button class="wbanner-btn">✎ 发帖</button>
        <button class="wbanner-btn primary">已关注</button>
        <button class="wbanner-btn">签到</button>
      </div>
      <div class="wbanner-id">
        <div class="wbanner-avatar"></div>
        <div class="wbanner-name">
          <div class="n">周晏星本人超话 <span class="badge">超话</span></div>
          <div class="stats">11.2万 帖子 ｜ 89.4万 粉丝</div>
        </div>
      </div>
      <div class="wbanner-chips"><span>娱乐超话 No.3</span><span>今日发帖 8400</span></div>
    </div>
    <div class="wtabs">${TABS.map(
      (t) => `<span data-tab="${t}" class="${t === activeTab ? "active" : ""}${TABS_CLICKABLE.includes(t) ? "" : " static"}">${t}</span>`
    ).join("")}</div>
    <div class="wfeed" id="wfeed"></div>
  `;

  const tabEls = main.querySelectorAll(".wtabs span");
  const feed = main.querySelector("#wfeed");

  tabEls.forEach((el) => {
    if (!TABS_CLICKABLE.includes(el.dataset.tab)) return;
    el.addEventListener("click", () => {
      activeTab = el.dataset.tab;
      tabEls.forEach((t) => t.classList.toggle("active", t.dataset.tab === activeTab));
      renderFeed();
    });
  });

  function renderFeed() {
    feed.innerHTML = "";
    const act = computeAct(state);
    const all = postsForTab(activeTab, act);
    all.slice(0, FEED_CAP).forEach((p) => feed.appendChild(postCard(p)));
    if (!feed.children.length) {
      feed.innerHTML = `<div class="wfeed-card" style="cursor:default;color:var(--ink-faint);text-align:center;">这里还没有内容</div>`;
      return;
    }
    if (all.length > FEED_CAP) {
      const more = document.createElement("div");
      more.className = "wfeed-more";
      more.textContent = "更多帖子已被折叠";
      feed.appendChild(more);
    }
  }

  renderFeed();
  layout.appendChild(renderRightbar());
}

function postCard(p) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar"></div>
      <div>
        <div class="fname">${p.pinned ? '<span class="fpin">置顶</span>' : ""}${p.author}${p.verified ? '<span class="verified">✓</span>' : ""}<span class="ffollow">＋关注</span></div>
        <div class="fmeta">${p.time} · 来自 iPhone客户端</div>
      </div>
    </div>
    <span class="ftag"># 周晏星本人超话 #</span>
    <div class="fbody">${p.text}</div>
    <div class="fthumb-slot"></div>
    <div class="factions">
      <span>🔁 ${p.reposts || 0}</span>
      <span>💬 ${p.replies?.length || 0}</span>
      <span>👍 ${p.likes || 0}</span>
    </div>
  `;
  if (p.image || p.imagePrompt) {
    const slot = card.querySelector(".fthumb-slot");
    slot.className = "fthumb";
    const thumb = createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt, imageCaption: p.imageCaption });
    thumb.addEventListener("click", (e) => e.stopPropagation());
    slot.appendChild(thumb);
  }
  card.addEventListener("click", () => goTo("postDetail", { id: p.id }));
  return card;
}
