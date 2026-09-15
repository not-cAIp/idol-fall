import { state, CLUE_TOTAL } from "../state.js";
import { goTo } from "../router.js";
import { icon } from "./icons.js";

export function renderTopNav(root) {
  document.body.classList.add("desktop-mode");

  const coreDone = state.foundClues.length >= CLUE_TOTAL;

  const nav = document.createElement("header");
  nav.className = "wtop";
  nav.innerHTML = `
    <div class="wsearch-icon" id="wtop-search">${icon("search", { size: 16 })}</div>
    <div class="wordmark" id="wtop-home">
      <span class="wmark">微</span>
      <b>微博</b>
      <span class="wsub">weibo.com</span>
    </div>
    <div class="wnav">
      <button class="active" title="首页">${icon("home", { size: 18 })}</button>
      <button title="热门">${icon("fire", { size: 18 })}</button>
      <button title="视频">${icon("video", { size: 18 })}</button>
    </div>
    <div class="wspacer"></div>
    <div class="wright">
      <button class="wmsg-btn" id="wtop-dm" title="私信">${icon("mail", { size: 18 })}${coreDone ? '<span class="wb-dot">1</span>' : ""}</button>
      <span class="wicon">${icon("gear", { size: 17 })}</span>
      <span class="wicon">${icon("moon", { size: 16 })}</span>
      <div class="wavatar"></div>
      <button class="wcompose" title="发微博">${icon("pencil", { size: 15 })}</button>
      <span class="wa11y">无障碍</span>
    </div>
  `;
  root.appendChild(nav);
  nav.querySelector("#wtop-search").addEventListener("click", () => goTo("search"));
  nav.querySelector("#wtop-home").addEventListener("click", () => goTo("forum"));
  nav.querySelector("#wtop-dm").addEventListener("click", () => goTo("dm"));
  return nav;
}

export function renderLeftNav(active) {
  const nav = document.createElement("nav");
  nav.className = "wleftnav";
  const items = [
    ["home", "首页", "forum"],
    ["clipboard", "全部关注", null],
    ["star", "最新微博", null],
    ["heart", "特别关注", null],
    ["people", "好友圈", null],
  ];
  nav.innerHTML = items
    .map(
      ([ic, label, view]) =>
        `<div class="wln-item${view === active ? " active" : ""}" data-view="${view || ""}"><span class="ic">${icon(ic, { size: 16 })}</span>${label}</div>`
    )
    .join("") +
    `<h4>自定义分组</h4>` +
    ["音乐", "电影", "动漫", "娱乐明星", "案件相关"]
      .map((g) => `<div class="wln-item"><span class="ic">·</span>${g}</div>`)
      .join("");
  nav.querySelectorAll(".wln-item[data-view]").forEach((el) => {
    const view = el.dataset.view;
    if (view) el.addEventListener("click", () => goTo(view));
  });
  return nav;
}

export function renderRightbar() {
  const aside = document.createElement("aside");
  aside.className = "wrightbar";
  aside.innerHTML = `
    <div class="wwidget">
      <h5>相关推荐 <span class="refresh">${icon("refresh", { size: 12 })} 换一换</span></h5>
      <div class="witem" id="w-luyan"><div class="wicon-box">${icon("mic", { size: 18 })}</div><div class="wtxt"><div class="t1">星安理得超话</div><div class="t2">CP 超话</div></div></div>
      <div class="witem" id="w-chenyu"><div class="wicon-box">${icon("building", { size: 18 })}</div><div class="wtxt"><div class="t1">银河星途</div><div class="t2">经纪公司</div></div></div>
      <div class="witem"><div class="wicon-box">${icon("chat", { size: 18 })}</div><div class="wtxt"><div class="t1">塌房 超话</div><div class="t2">791万阅读</div></div></div>
    </div>
    <div class="wfooter">
      帮助中心 · 意见反馈 · 关于星潮<br />
      星潮工作室 出品 · 本页面内容均为虚构
    </div>
  `;
  aside.querySelector("#w-luyan").addEventListener("click", () => goTo("search"));
  aside.querySelector("#w-chenyu").addEventListener("click", () => goTo("search"));
  return aside;
}
