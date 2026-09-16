import { findProfile, isBlockedQuery, posts, profiles, avatarFor, resolveSrc, timeSortKey } from "../data.js";
import { markProfileFound, markClueFound } from "../state.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { goTo } from "../router.js";
import { renderTopNav, renderLeftNav, renderRightbar } from "../components/weiboChrome.js";
import { icon, verifiedBadge } from "../components/icons.js";

export function renderSearch(root, { profile: profileId } = {}) {
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
    </div>
    <div id="search-result" style="margin-top:14px;"></div>
  `;

  const input = main.querySelector("#search-input");
  const resultEl = main.querySelector("#search-result");

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
  }
}

function profilePostCard(p) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar" style="background:${avatarFor(p)};"></div>
      <div>
        <div class="fname">${p.author}${p.verified ? `<span class="verified">${verifiedBadge({ size: 13 })}</span>` : ""}${p.tag ? `<span class="ftag-status">${p.tag}</span>` : ""}</div>
        <div class="fmeta">${p.time ? `${p.time} · ` : ""}来自 iPhone客户端</div>
      </div>
    </div>
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
    const thumb = createPhotoThumb({ src: p.image, imagePrompt: p.imagePrompt, imageCaption: p.imageCaption, imageFit: p.imageFit });
    thumb.addEventListener("click", (e) => e.stopPropagation());
    slot.appendChild(thumb);
  }
  card.querySelectorAll(".fbody a").forEach((a) => a.addEventListener("click", (e) => e.stopPropagation()));
  card.addEventListener("click", () => goTo("postDetail", { id: p.id }));
  return card;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
