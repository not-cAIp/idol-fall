import { findProfile, isBlockedQuery, posts, profiles, avatarFor, resolveSrc, timeSortKey, displayTime } from "../data.js";
import { state, markProfileFound, markClueFound, recordSearch, canUnlockPt2 } from "../state.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { goTo } from "../router.js";
import { renderTopNav, renderLeftNav, renderRightbar } from "../components/weiboChrome.js";
import { icon, verifiedBadge } from "../components/icons.js";
import { THREADS } from "./forum.js";
import { mountTeboluoWidget } from "../components/teboluoWidget.js";

export function renderSearch(root, { profile: profileId, query } = {}) {
  root.className = "weibo-scope";
  renderTopNav(root);

  const layout = document.createElement("div");
  layout.className = "wlayout";
  root.appendChild(layout);

  layout.appendChild(renderLeftNav(null));

  const main = document.createElement("main");
  layout.appendChild(main);
  layout.appendChild(renderRightbar());

  main.innerHTML = `
    <div class="wfeed-card" style="cursor:default;">
      <p class="intro" style="margin-bottom:12px;">搜姓名、绰号或暗号，能找到对应的账号主页。不是所有人都搜得到——有些账号要先从别处拼出该搜什么词。</p>
      <div class="search-row">
        <input id="search-input" type="text" placeholder="搜索账号 / 昵称 / 关键词" />
        <button id="search-btn">搜索</button>
      </div>
      <div id="recent-searches"></div>
    </div>
    <div id="search-result" style="margin-top:14px;"></div>
  `;

  const input = main.querySelector("#search-input");
  const resultEl = main.querySelector("#search-result");
  const recentEl = main.querySelector("#recent-searches");

  // 纯氛围的"最近搜索"，不参与任何判定——搜够一定数量后底下配一句
  // 很淡的系统小字，见 state.js 的 recordSearch()。
  function renderRecent() {
    if (!state.recentSearches.length) {
      recentEl.innerHTML = "";
      return;
    }
    recentEl.innerHTML = `
      <div class="recent-searches">
        <span class="rs-label">最近搜索</span>
        ${state.recentSearches.map((q) => `<span class="rs-tag">${escapeHtml(q)}</span>`).join("")}
      </div>
      ${
        canUnlockPt2(state) && state.recentSearches.length >= 5
          ? `<div class="rs-meta">
               搜索记录仅保存在本机。
               <span class="rs-meta-faint">有些记录，当年也是这么保存的。</span>
             </div>`
          : ""
      }
    `;
    recentEl.querySelectorAll(".rs-tag").forEach((tag) => {
      tag.addEventListener("click", () => {
        input.value = tag.textContent;
        runSearch();
      });
    });
  }
  renderRecent();

  function showProfile(profile) {
    markProfileFound(profile.id);
    if (profile.clueOnFound) markClueFound(profile.clueOnFound);

    resultEl.innerHTML = `
      <div class="wbanner" style="min-height:170px;background:linear-gradient(135deg,#2b3242,#171b22);">
        <div class="wbanner-top">
          <button class="wbanner-btn primary">＋关注</button>
          <button class="wbanner-btn">留言</button>
          <button class="wbanner-btn">•••</button>
        </div>
        <div class="wbanner-id" style="padding-top:60px;">
          <div class="wbanner-avatar round" style="${profile.avatarImage ? `background:url(${resolveSrc(profile.avatarImage)}) center/cover;` : ""}"></div>
          <div class="wbanner-name">
            <div class="n">${profile.name}${profile.verified ? '<span class="badge">认证</span>' : ""}</div>
            <div class="stats mono">${profile.handle}</div>
          </div>
        </div>
      </div>
      <div class="wtabs"><span class="active">精选</span><span>微博</span><span>视频</span><span>文章</span><span>相册</span></div>
      <div class="wfeed-card" style="cursor:default;margin-top:12px;">
        <p style="font-size:14px;color:var(--ink-soft);line-height:1.7;margin:0;">${profile.bio}</p>
        <div class="factions" style="margin-top:12px;">${profile.stats.map((s) => `<span>${s}</span>`).join("")}</div>
        ${profile.locked ? `<div class="locked-note" style="margin-top:10px;display:flex;align-items:center;gap:5px;">${icon("lock", { size: 13 })} ${profile.lockedNote || "部分内容仅粉丝可见"}</div>` : ""}
      </div>
      <div class="wfeed" id="profile-feed" style="margin-top:12px;"></div>
    `;

    // "留言"目前只对沈溪这个账号是真正可交互的私信入口——其余账号
    // 保持原样的装饰性按钮，不是每个主页都新增这个功能。
    if (profile.id === "shenxi_sunflower") {
      const msgBtns = resultEl.querySelectorAll(".wbanner-btn");
      const msgBtn = [...msgBtns].find((b) => b.textContent === "留言");
      if (msgBtn) msgBtn.addEventListener("click", () => goTo("shenxiDm"));
    }

    // 日记特伯罗挂件只挂在新_PROD这一个主页上，不是通用功能——挂进
    // resultEl，下次 showProfile() 重写 resultEl.innerHTML 时会连同
    // 挂件一起清掉，不需要手动卸载。
    if (profile.id === "xinprod_work") {
      mountTeboluoWidget(resultEl);
    }

    const feedEl = resultEl.querySelector("#profile-feed");
    const ownPosts = posts.posts
      .filter((p) => p.profile === profile.id)
      .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || timeSortKey(b.time) - timeSortKey(a.time));
    ownPosts.forEach((p) => feedEl.appendChild(profilePostCard(p)));
    if (!ownPosts.length) {
      feedEl.innerHTML = `<div class="wfeed-card" style="cursor:default;color:var(--ink-faint);text-align:center;">这里还没有内容</div>`;
    }
  }

  function runSearch() {
    const q = input.value;
    resultEl.innerHTML = "";
    if (!q.trim()) return;

    recordSearch(q.trim());
    renderRecent();

    if (isBlockedQuery(q)) {
      resultEl.innerHTML = `<div class="wfeed-card" style="cursor:default;"><div class="search-blocked">搜索结果存在风险，已隐藏。</div></div>`;
      return;
    }

    const profile = findProfile(q);
    if (!profile) {
      resultEl.innerHTML = `<div class="wfeed-card" style="cursor:default;"><div class="search-empty">没有找到"${escapeHtml(q)}"相关的账号。</div></div>`;
      return;
    }

    showProfile(profile);
  }

  main.querySelector("#search-btn").addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });

  if (profileId) {
    const profile = profiles.profiles.find((p) => p.id === profileId);
    if (profile) {
      input.value = profile.searchKeywords[0];
      showProfile(profile);
    }
  } else if (query) {
    input.value = query;
    runSearch();
  }
}

function profilePostCard(p) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  const tagThreadName = p.tagThread ? THREADS[p.tagThread]?.name : null;
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar" style="background:${avatarFor(p)};"></div>
      <div>
        <div class="fname">${p.pinned ? '<span class="fpin">置顶</span>' : ""}${p.author}${p.verified ? `<span class="verified">${verifiedBadge({ size: 13 })}</span>` : ""}${p.tag ? `<span class="ftag-status">${p.tag}</span>` : ""}</div>
        <div class="fmeta">${p.time ? `${displayTime(p.time)} · ` : ""}来自 iPhone客户端</div>
      </div>
    </div>
    ${tagThreadName ? `<span class="ftag"># ${tagThreadName} #</span>` : ""}
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
  card.querySelectorAll(".fbody a, .fbody [data-teboluo-fake-link]").forEach((a) => a.addEventListener("click", (e) => e.stopPropagation()));
  card.querySelector(".ftag")?.addEventListener("click", (e) => {
    e.stopPropagation();
    goTo("forum", { thread: p.tagThread });
  });
  card.addEventListener("click", () => goTo("postDetail", { id: p.id }));
  return card;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
