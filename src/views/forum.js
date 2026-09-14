import { posts } from "../data.js";
import { state, computeAct } from "../state.js";
import { goTo } from "../router.js";
import { createPhotoThumb } from "../components/photoViewer.js";
import { renderTopNav, renderRightbar } from "../components/weiboChrome.js";

export function renderForum(root) {
  root.className = "weibo-scope";
  const act = computeAct(state);
  const visible = posts.posts
    .filter((p) => p.act <= act)
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1) || a.time.localeCompare(b.time));

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
          <div class="n">晏星本人超话 <span class="badge">超话</span></div>
          <div class="stats">11.2万 帖子 ｜ 89.4万 粉丝</div>
        </div>
      </div>
      <div class="wbanner-chips"><span>娱乐超话 No.3</span><span>今日发帖 8400</span></div>
    </div>
    <div class="wtabs">
      <span class="active">热门</span>
      <span>最新</span>
      <span>精华</span>
      <span>公告</span>
    </div>
    <div class="wfeed" id="wfeed"></div>
  `;

  const feed = main.querySelector("#wfeed");
  visible.forEach((p) => {
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
      <span class="ftag"># 晏星本人超话 #</span>
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
    feed.appendChild(card);
  });

  layout.appendChild(renderRightbar());
}
