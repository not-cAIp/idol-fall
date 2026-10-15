import { icon } from "./icons.js";
import { resolveSrc } from "../data.js";

function photoInnerHtml({ src, imagePrompt }) {
  if (src) {
    return `<img src="${resolveSrc(src)}" alt="" />`;
  }
  return `
    <div class="photo-placeholder">
      <div class="ph-icon">${icon("image", { size: 22 })}</div>
      <p class="ph-prompt">${imagePrompt || "（暂无图片描述）"}</p>
      <span class="ph-tag">AI 生成图片 · 待补充</span>
    </div>
  `;
}

export function createPhotoThumb({ src, imagePrompt }) {
  const thumb = document.createElement("div");
  thumb.className = "photo-thumb" + (src ? "" : " is-placeholder");
  thumb.innerHTML = photoInnerHtml({ src, imagePrompt });
  thumb.addEventListener("click", () => openPhotoViewer({ src, imagePrompt }));
  return thumb;
}

export function openPhotoViewer({ src, imagePrompt }) {
  const overlay = document.createElement("div");
  overlay.className = "photo-overlay";
  overlay.innerHTML = `
    <div class="photo-panel">
      <div class="photo-panel-head">
        <button class="icon-btn" id="photo-close">${icon("close", { size: 16 })}</button>
      </div>
      <div class="photo-frame">${photoInnerHtml({ src, imagePrompt })}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  overlay.querySelector("#photo-close").addEventListener("click", () => overlay.remove());
}
