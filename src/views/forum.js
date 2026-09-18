import { posts, avatarFor, resolveSrc, timeSortKey, displayTime } from "../data.js";
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
  yanxing: {
    name: "周晏星本人超话",
    stats: "892.4万 帖子 ｜ 2140万 粉丝",
    chip: "娱乐超话 No.1",
    banner: "/images/banner-yanxing-supertopic.jpg",
    avatar: "/images/fan-avatar-yanxing-variety.jpg",
    todayPosts: 6974,
  },
  linan: {
    name: "林安本人超话",
    stats: "215万 帖子 ｜ 640万 粉丝",
    chip: "娱乐超话 No.8",
    banner: "/images/banner-linan-supertopic.jpg",
    avatar: "/images/fan-avatar-linan-encore.jpg",
    todayPosts: 3726,
  },
  xinganlide: {
    name: "星安理得超话",
    stats: "430万 帖子 ｜ 158万 粉丝",
    chip: "CP超话 No.2",
    banner: "/images/banner-xingan-cp.jpg",
    avatar: "/images/cp-xingan-selfie.jpg",
    todayPosts: 4613,
  },
  // F4ever（团体超话）：纯氛围水贴，不承担任何线索——不像另外三个超话
  // 那样区分"精华/最新"（onlyLatest:true，只留"最新"一个能点的标签），
  // 帖子也不能点进详情页（nonClickable:true，反正点进去也没有更多内容）。
  f4ever: {
    name: "F4ever超话",
    stats: "68万 帖子 ｜ 890万 粉丝",
    chip: "团体超话",
    todayPosts: 2158,
    onlyLatest: true,
    nonClickable: true,
  },
};

const TABS_CLICKABLE = ["最新", "精华"];
const TABS_STATIC = ["安利帖", "图文产出", "绝美舞台", "水贴专区"];
let activeTab = "最新";

// section 通常是个字符串（"hot"/"flavor"），少数帖子（比如 p001）
// 想同时出现在两个标签页，就写成数组 ["hot","flavor"]——两种写法都要
// 支持，下面两个判断函数分别对应「该不该出现在精华」「该不该出现在
// 最新」，字符串走原来的精确匹配，数组走 includes。
function inHot(p) {
  return Array.isArray(p.section) ? p.section.includes("hot") : p.section !== "flavor";
}
function inFlavor(p) {
  return Array.isArray(p.section) ? p.section.includes("flavor") : p.section === "flavor";
}

function postsForThread(threadSlug, tab) {
  return posts.posts
    .filter((p) => p.thread === threadSlug && (tab === "精华" ? inHot(p) : inFlavor(p)))
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || timeSortKey(b.time) - timeSortKey(a.time));
}

export function renderForum(root, { thread, tab } = {}) {
  const slug = thread && THREADS[thread] ? thread : "yanxing";
  const info = THREADS[slug];
  const clickableTabs = info.onlyLatest ? ["最新"] : TABS_CLICKABLE;
  const tabs = [...clickableTabs, ...TABS_STATIC];
  activeTab = clickableTabs.includes(tab) ? tab : "最新";

  root.className = "weibo-scope";
  renderTopNav(root);

  const layout = document.createElement("div");
  layout.className = "wlayout no-leftnav";
  root.appendChild(layout);

  const main = document.createElement("main");
  layout.appendChild(main);

  main.innerHTML = `
    <div class="wbanner" style="${info.banner ? `background:linear-gradient(0deg, rgba(20,14,18,.55), rgba(20,14,18,.15)), url(${resolveSrc(info.banner)}) center/cover;` : ""}">
      <div class="wbanner-top">
        <button class="wbanner-btn">${icon("pencil", { size: 13 })} 发帖</button>
        <button class="wbanner-btn primary">已关注</button>
        <button class="wbanner-btn">签到</button>
      </div>
      <div class="wbanner-id">
        <div class="wbanner-avatar" style="${info.avatar ? `background:url(${resolveSrc(info.avatar)}) center/cover;` : ""}"></div>
        <div class="wbanner-name">
          <div class="n">${info.name} <span class="badge">超话</span></div>
          <div class="stats">${info.stats}</div>
        </div>
      </div>
      <div class="wbanner-chips"><span>${info.chip}</span><span>今日发帖 ${info.todayPosts}</span></div>
    </div>
    <div class="wtabs">${tabs.map(
      (t) => `<span data-tab="${t}" class="${t === activeTab ? "active" : ""}${clickableTabs.includes(t) ? "" : " static"}">${t}</span>`
    ).join("")}</div>
    <div class="wfeed" id="wfeed"></div>
  `;

  const tabEls = main.querySelectorAll(".wtabs span");
  const feed = main.querySelector("#wfeed");

  tabEls.forEach((el) => {
    if (!clickableTabs.includes(el.dataset.tab)) return;
    el.addEventListener("click", () => {
      activeTab = el.dataset.tab;
      tabEls.forEach((t) => t.classList.toggle("active", t.dataset.tab === activeTab));
      renderFeed();
    });
  });

  function renderFeed() {
    feed.innerHTML = "";
    const all = postsForThread(slug, activeTab);
    all.forEach((p) => feed.appendChild(postCard(p, info)));
    if (!all.length) {
      feed.innerHTML = `<div class="wfeed-card" style="cursor:default;color:var(--ink-faint);text-align:center;">这里还没有内容</div>`;
    }
  }

  renderFeed();
  layout.appendChild(renderRightbar(slug));
}

function postCard(p, threadInfo) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  const threadName = THREADS[p.thread]?.name || "";
  const nonClickable = threadInfo?.nonClickable;
  if (nonClickable) card.style.cursor = "default";
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar" style="background:${avatarFor(p)};"></div>
      <div>
        <div class="fname">${p.pinned ? '<span class="fpin">置顶</span>' : ""}${p.author}${p.verified ? `<span class="verified">${verifiedBadge({ size: 13 })}</span>` : ""}<span class="ffollow">＋关注</span></div>
        <div class="fmeta">${displayTime(p.time)} · 来自 iPhone客户端</div>
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
    const thumb = createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt });
    thumb.addEventListener("click", (e) => e.stopPropagation());
    slot.appendChild(thumb);
  }
  card.querySelectorAll(".fbody a").forEach((a) => a.addEventListener("click", (e) => e.stopPropagation()));
  if (nonClickable) {
    // 纯水贴超话：帖子不跳详情页，#标签也不用跳（本来就只有这一个超话）。
    return card;
  }
  card.querySelector(".ftag")?.addEventListener("click", (e) => {
    e.stopPropagation();
    goTo("forum", { thread: p.thread });
  });
  card.addEventListener("click", () => goTo("postDetail", { id: p.id, fromTab: activeTab }));
  return card;
}
