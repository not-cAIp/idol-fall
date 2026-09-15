import { posts } from "../data.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { renderTopNav } from "../components/weiboChrome.js";
import { icon, verifiedBadge } from "../components/icons.js";
import { THREADS } from "./forum.js";

// 微博本身的首页——点顶部「微博」word mark 应该落在这里，而不是直接
// 弹回某个人的超话。参考真实 weibo.com 首页（深色模式）的版式：深色
// 星空 hero + 搜索框，下面一排热门分类标签，三栏正文。这里的「热门」
// feed 是把三个超话里 section:"hot" 的帖子按点赞数混排——真实感来自
// 「首页热门」本来就是跨话题聚合的，不是某一个超话自己的东西。
const CATEGORY_TABS = ["热门", "同城", "实时", "榜单", "明星", "搞笑", "情感"];
const HOT_SEARCH = ["#周晏星本人超话#", "#星安理得#", "#林安#", "#银河星途#", "#泡泡App#"];

function likesToNumber(s) {
  if (!s) return 0;
  const str = String(s);
  if (str.includes("万")) return parseFloat(str) * 10000;
  return parseFloat(str.replace(/,/g, "")) || 0;
}

export function renderHome(root) {
  root.className = "weibo-scope";
  renderTopNav(root);

  const page = document.createElement("div");
  page.className = "whome";
  root.appendChild(page);

  page.innerHTML = `
    <div class="whome-hero">
      <div class="whome-hero-stars"></div>
      <div class="whome-hero-inner">
        <div class="whome-logo">
          <span class="wmark-big">微</span>
          <div class="whome-word"><b>微博</b><span>weibo.com</span></div>
        </div>
        <div class="whome-search">
          <input id="whome-search-input" type="text" placeholder="超话" />
          <button id="whome-search-btn">搜索</button>
        </div>
      </div>
    </div>
    <div class="whome-cats">
      ${CATEGORY_TABS.map((t, i) => `<span class="${i === 0 ? "active" : ""}" data-cat="${t}">${t}</span>`).join("")}
      <span class="whome-cats-more">${icon("clipboard", { size: 15 })}</span>
    </div>
    <div class="whome-body">
      <aside class="whome-left">
        <div class="wln-item active"><span class="ic">${icon("fire", { size: 16 })}</span>热门推荐</div>
        <div class="wln-item"><span class="ic">${icon("star", { size: 16 })}</span>热门榜单</div>
        <div class="wln-item"><span class="ic">${icon("search", { size: 16 })}</span>微博热搜</div>
        <h4>浏览</h4>
        <div class="wln-item"><span class="ic">·</span>热搜</div>
        <div class="wln-item"><span class="ic">·</span>文娱</div>
        <div class="wln-item"><span class="ic">·</span>社会</div>
        <div class="wln-item"><span class="ic">·</span>科技</div>
      </aside>
      <main class="whome-feed" id="whome-feed"></main>
      <aside class="whome-right">
        <div class="whome-promo">
          <div class="whome-promo-title">随时随地<br/>发现新鲜事</div>
        </div>
        <div class="wwidget">
          <h5>微博热搜 <span class="refresh">${icon("refresh", { size: 12 })} 点击刷新</span></h5>
          ${HOT_SEARCH.map((h, i) => `<div class="whome-hs"><span class="whome-hs-rank">${i + 1}</span>${h}</div>`).join("")}
        </div>
      </aside>
    </div>
  `;

  page.querySelector("#whome-search-btn").addEventListener("click", () => goTo("search"));
  page.querySelector("#whome-search-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") goTo("search");
  });

  const feed = page.querySelector("#whome-feed");
  const hot = posts.posts
    .filter((p) => p.thread && p.section === "hot")
    .sort((a, b) => likesToNumber(b.likes) - likesToNumber(a.likes))
    .slice(0, 12);
  hot.forEach((p) => feed.appendChild(trendingCard(p)));
}

function trendingCard(p) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  const threadName = THREADS[p.thread]?.name || "";
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar"></div>
      <div>
        <div class="fname">${p.author}${p.verified ? `<span class="verified">${verifiedBadge({ size: 13 })}</span>` : ""}<span class="ffollow">＋关注</span></div>
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
  card.addEventListener("click", () => goTo("postDetail", { id: p.id }));
  return card;
}
