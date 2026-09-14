import { findProfile, isBlockedQuery } from "../data.js";
import { markProfileFound, markClueFound } from "../state.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";

export function renderSearch(root) {
  const header = document.createElement("header");
  header.className = "view-header";
  header.innerHTML = `
    <div class="vh-left">
      <button class="icon-btn back" id="btn-back">‹</button>
      <span class="vh-title">搜索</span>
    </div>
  `;
  root.appendChild(header);
  header.querySelector("#btn-back").addEventListener("click", () => goTo("forum"));

  const body = document.createElement("div");
  body.className = "view-body";
  body.innerHTML = `
    <p class="intro">搜姓名、绰号或暗号，能找到对应的账号主页。不是所有人都搜得到——有些账号要先从别处拼出该搜什么词。</p>
    <div class="search-row">
      <input id="search-input" type="text" placeholder="搜索账号 / 昵称 / 关键词" />
      <button id="search-btn">搜索</button>
    </div>
    <div id="search-result"></div>
  `;
  root.appendChild(body);

  const input = body.querySelector("#search-input");
  const resultEl = body.querySelector("#search-result");

  function runSearch() {
    const q = input.value;
    resultEl.innerHTML = "";
    if (!q.trim()) return;

    if (isBlockedQuery(q)) {
      resultEl.innerHTML = `<div class="search-blocked">搜索结果存在风险，已隐藏。</div>`;
      return;
    }

    const profile = findProfile(q);
    if (!profile) {
      resultEl.innerHTML = `<div class="search-empty">没有找到"${escapeHtml(q)}"相关的账号。</div>`;
      return;
    }

    markProfileFound(profile.id);
    if (profile.id === "shenxi_sunflower") markClueFound("t03");

    resultEl.innerHTML = `
      <div class="profile-card">
        <div class="avatar"></div>
        <div>
          <div class="name">${profile.name}${profile.verified ? " ✓" : ""}</div>
          <div class="handle">${profile.handle}</div>
          <div class="bio">${profile.bio}</div>
          <div class="stats">${profile.stats.map((s) => `<span>${s}</span>`).join("")}</div>
          ${profile.locked ? `<div class="locked-note">🔒 ${profile.lockedNote || "部分内容仅粉丝可见"}</div>` : ""}
          <div class="plist">${profile.posts.map((p) => `<div>· ${p}</div>`).join("")}</div>
          ${profile.images?.length ? `<div class="photo-gallery"></div>` : ""}
        </div>
      </div>
    `;

    const galleryEl = resultEl.querySelector(".photo-gallery");
    if (galleryEl) {
      profile.images.forEach((img) => galleryEl.appendChild(createPhotoThumb(img)));
    }
  }

  body.querySelector("#search-btn").addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
