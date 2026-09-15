import { posts } from "../data.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { renderTopNav, renderRightbar } from "../components/weiboChrome.js";
import { icon, verifiedBadge } from "../components/icons.js";

// 三个超话都是「静态互联网世界」：所有帖子从游戏一开始就在这里，
// 不会因为线索状态而出现/消失。两个功能标签页「最新」「精华」都可点，
// 其余四个（安利帖/图文产出/绝美舞台/水贴专区）是纯装饰。精华=真正
// 重要的信息（每条帖子在 posts.json 里标了 section:"hot"），最新=纯
// 水贴氛围池（section:"flavor"）——两边内容完全不重叠，重要的东西
// 不会混进纯水贴里，但代码也不会替玩家把线索挑出来单独列一份
// "证据清单"，精华里一样是帖子和评论的原始形态。
export const THREADS = {
  yanxing: { name: "周晏星本人超话", stats: "892.4万 帖子 ｜ 2140万 粉丝", chip: "娱乐超话 No.1" },
  linan: { name: "林安本人超话", stats: "215万 帖子 ｜ 640万 粉丝", chip: "娱乐超话 No.8" },
  xinganlide: { name: "星安理得超话", stats: "430万 帖子 ｜ 158万 粉丝", chip: "CP超话 No.2" },
};

const TABS_CLICKABLE = ["最新", "精华"];
const TABS_STATIC = ["安利帖", "图文产出", "绝美舞台", "水贴专区"];
const TABS = [...TABS_CLICKABLE, ...TABS_STATIC];
let activeTab = "最新";

function postsForThread(threadSlug, tab) {
  return posts.posts
    .filter((p) => p.thread === threadSlug && (tab === "精华" ? p.section !== "flavor" : p.section === "flavor"))
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || b.time.localeCompare(a.time));
}

export function renderForum(root, { thread } = {}) {
  const slug = thread && THREADS[thread] ? thread : "yanxing";
  const info = THREADS[slug];
  activeTab = "最新";

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
        <button class="wbanner-btn">${icon("pencil", { size: 13 })} 发帖</button>
        <button class="wbanner-btn primary">已关注</button>
        <button class="wbanner-btn">签到</button>
      </div>
      <div class="wbanner-id">
        <div class="wbanner-avatar"></div>
        <div class="wbanner-name">
          <div class="n">${info.name} <span class="badge">超话</span></div>
          <div class="stats">${info.stats}</div>
        </div>
      </div>
      <div class="wbanner-chips"><span>${info.chip}</span><span>今日发帖 ${Math.floor(800 + Math.random() * 4000)}</span></div>
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
    const all = postsForThread(slug, activeTab);
    all.forEach((p) => feed.appendChild(postCard(p)));
    if (!all.length) {
      feed.innerHTML = `<div class="wfeed-card" style="cursor:default;color:var(--ink-faint);text-align:center;">这里还没有内容</div>`;
    }
  }

  renderFeed();
  layout.appendChild(renderRightbar(slug));
}

function postCard(p) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  const threadName = THREADS[p.thread]?.name || "";
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar"></div>
      <div>
        <div class="fname">${p.pinned ? '<span class="fpin">置顶</span>' : ""}${p.author}${p.verified ? `<span class="verified">${verifiedBadge({ size: 13 })}</span>` : ""}<span class="ffollow">＋关注</span></div>
        <div class="fmeta">${p.time} · 来自 iPhone客户端</div>
      </div>
    </div>
    <span class="ftag"># ${threadName} #</span>
    <div class="fbody">${p.text}</div>
    <div class="fthumb-slot"></div>
    <div class="factions">
      <span>${icon("repost", { size: 14 })} ${p.reposts || 0}</span>
      <span>${icon("chat", { size: 14 })} ${p.replies?.length || 0}</span>
      <span>${icon("like", { size: 14 })} ${p.likes || 0}</span>
    </div>
  `;
  if (p.image || p.imagePrompt) {
    const slot = card.querySelector(".fthumb-slot");
    slot.className = "fthumb";
    const thumb = createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt, imageCaption: p.imageCaption });
    thumb.addEventListener("click", (e) => e.stopPropagation());
    slot.appendChild(thumb);
  }
  card.querySelectorAll(".fbody a").forEach((a) => a.addEventListener("click", (e) => e.stopPropagation()));
  card.addEventListener("click", () => goTo("postDetail", { id: p.id }));
  return card;
}
