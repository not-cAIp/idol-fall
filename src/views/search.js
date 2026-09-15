import { findProfile, isBlockedQuery } from "../data.js";
import { markProfileFound, markClueFound } from "../state.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { renderTopNav, renderLeftNav, renderRightbar } from "../components/weiboChrome.js";
import { icon } from "../components/icons.js";

export function renderSearch(root) {
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

    markProfileFound(profile.id);
    if (profile.clueOnFound) markClueFound(profile.clueOnFound);

    const allBlocks = profile.blocks || [];
    const infoLines = allBlocks.filter((b) => b.info);
    const postBlocks = allBlocks.filter((b) => !b.info);

    resultEl.innerHTML = `
      <div class="wbanner" style="min-height:170px;background:linear-gradient(135deg,#2b3242,#171b22);">
        <div class="wbanner-top">
          <button class="wbanner-btn primary">＋关注</button>
          <button class="wbanner-btn">留言</button>
          <button class="wbanner-btn">•••</button>
        </div>
        <div class="wbanner-id" style="padding-top:60px;">
          <div class="wbanner-avatar round"></div>
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
        ${infoLines.length ? `<div class="plist">${infoLines.map((b) => `<div>· ${b.text}</div>`).join("")}</div>` : ""}
        ${profile.locked ? `<div class="locked-note" style="margin-top:10px;display:flex;align-items:center;gap:5px;">${icon("lock", { size: 13 })} ${profile.lockedNote || "部分内容仅粉丝可见"}</div>` : ""}
      </div>
      <div class="wfeed" id="profile-feed" style="margin-top:12px;"></div>
    `;

    infoLines.forEach((b) => { if (b.clueId) markClueFound(b.clueId); });

    const feedEl = resultEl.querySelector("#profile-feed");
    postBlocks.forEach((b) => {
      feedEl.appendChild(profilePostCard(profile, b));
      if (b.clueId) markClueFound(b.clueId);
    });
  }

  main.querySelector("#search-btn").addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}

function profilePostCard(profile, block) {
  const card = document.createElement("article");
  card.className = "wfeed-card";
  card.style.cursor = "default";
  card.innerHTML = `
    <div class="frow1">
      <div class="favatar"></div>
      <div>
        <div class="fname">${profile.name}${block.tag ? `<span class="ftag-status">${block.tag}</span>` : ""}</div>
        <div class="fmeta">${block.time ? `${block.time} · ` : ""}来自 iPhone客户端</div>
      </div>
    </div>
    <div class="fbody">${block.text}</div>
    <div class="fthumb-slot"></div>
  `;
  if (block.imagePrompt || block.image) {
    const slot = card.querySelector(".fthumb-slot");
    slot.className = "fthumb";
    slot.appendChild(createPhotoThumb({ src: block.image, imagePrompt: block.imagePrompt, imageCaption: block.imageCaption }));
  }
  return card;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
