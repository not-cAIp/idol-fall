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

// 首页热门不应该只有案件相关的严肃内容——真实微博热门永远混着一堆
// 完全不相干的废话文学/无意义热搜，这些纯属氛围，跟案件无关，不接
// postDetail、不可点，只是为了让首页看起来像真的微博而不是一个
// 案件线索聚合器。
const MEME_POSTS = [
  { author: "今日份废话", handle: "@今日份废话", time: "2小时前", text: "【震惊】18岁花季少女，10年前居然只有8岁", likes: "8.2万", reposts: "3.1万", comments: 4200 },
  { author: "热搜观察员", handle: "@热搜观察员", time: "3小时前", text: "多地网友反映：早上7点起床，比8点起床整整早了一个小时", likes: "5.6万", reposts: "1.9万", comments: 2800 },
  { author: "深夜小课堂", handle: "@深夜小课堂", time: "5小时前", text: "医生提醒：长期不吃饭，可能会导致饿", likes: "9.9万", reposts: "4.4万", comments: 6100 },
  { author: "随手一拍", handle: "@随手一拍", time: "6小时前", text: "实测：把手机倒过来拿，屏幕也跟着倒过来了，附视频", likes: "3.3万", reposts: "1.1万", comments: 1500 },
  { author: "今天也在摆烂", handle: "@今天也在摆烂", time: "8小时前", text: "深夜发文：兄弟们，今天到底是星期几来着", likes: "2.1万", reposts: "890", comments: 3300 },
];

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

  // 第一条永远是官方通报——这是热搜第一名该有的位置。剩下的热门帖
  // 按点赞混排，中间穿插几条完全不相干的废话文学，模拟真实首页的
  // 混乱感：不是所有热门都跟案件有关。
  const official = posts.posts.find((p) => p.id === "p001");
  const rest = posts.posts
    .filter((p) => p.thread && p.section === "hot" && p.id !== "p001")
    .sort((a, b) => likesToNumber(b.likes) - likesToNumber(a.likes))
    .slice(0, 10);

  if (official) feed.appendChild(trendingCard(official));
  feed.appendChild(memeCard(MEME_POSTS[0]));
  feed.appendChild(memeCard(MEME_POSTS[1]));
  rest.slice(0, 4).forEach((p) => feed.appendChild(trendingCard(p)));
  feed.appendChild(memeCard(MEME_POSTS[2]));
  rest.slice(4, 7).forEach((p) => feed.appendChild(trendingCard(p)));
  feed.appendChild(memeCard(MEME_POSTS[3]));
  rest.slice(7).forEach((p) => feed.appendChild(trendingCard(p)));
  feed.appendChild(memeCard(MEME_POSTS[4]));
}

function memeCard(m) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  card.style.cursor = "default";
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar"></div>
      <div>
        <div class="fname">${m.author}<span class="ffollow">＋关注</span></div>
        <div class="fmeta">${m.time} · 来自 微博 weibo.com</div>
      </div>
    </div>
    <div class="fbody">${m.text}</div>
    <div class="factions">
      <span>${icon("repost", { size: 14 })} ${m.reposts}</span>
      <span>${icon("chat", { size: 14 })} ${m.comments}</span>
      <span>${icon("like", { size: 14 })} ${m.likes}</span>
    </div>
  `;
  return card;
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
  card.querySelector(".ftag")?.addEventListener("click", (e) => {
    e.stopPropagation();
    goTo("forum", { thread: p.thread });
  });
  card.addEventListener("click", () => goTo("postDetail", { id: p.id }));
  return card;
}
