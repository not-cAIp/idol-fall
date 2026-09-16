import { icon } from "./icons.js";
import { resolveSrc } from "../data.js";

function photoInnerHtml({ src, imagePrompt, imageFit }) {
  if (src) {
    const style = imageFit ? ` style="object-fit:${imageFit};background:#05070a;"` : "";
    return `<img src="${resolveSrc(src)}" alt=""${style} />`;
  }
  return `
    <div class="photo-placeholder">
      <div class="ph-icon">${icon("image", { size: 22 })}</div>
      <p class="ph-prompt">${imagePrompt || "（暂无图片描述）"}</p>
      <span class="ph-tag">AI 生成图片 · 待补充</span>
    </div>
  `;
}

// imageFit：默认帖子图走 object-fit:cover 铺满 16:10 缩略图，适合大多数
// 横向构图的证据图。少数图本身是竖版海报（比如带完整标题文案的宣传
// 长图），cover 裁切会把关键信息（标题/按钮）直接切掉——这类帖子在
// posts.json 里加 imageFit:"contain"，缩略图和详情大图都改成不裁切、
// 留边显示全部内容，不影响其他帖子的默认铺满效果。
export function createPhotoThumb({ src, imagePrompt, imageCaption, imageFit }) {
  const thumb = document.createElement("div");
  thumb.className = "photo-thumb" + (src ? "" : " is-placeholder");
  thumb.innerHTML = photoInnerHtml({ src, imagePrompt, imageFit });
  thumb.addEventListener("click", () => openPhotoViewer({ src, imagePrompt, caption: imageCaption, imageFit }));
  return thumb;
}

export function openPhotoViewer({ src, imagePrompt, caption, imageFit }) {
  const overlay = document.createElement("div");
  overlay.className = "photo-overlay";
  overlay.innerHTML = `
    <div class="photo-panel">
      <div class="photo-panel-head">
        <span class="vh-title">证据照片</span>
        <button class="icon-btn" id="photo-close">${icon("close", { size: 16 })}</button>
      </div>
      <div class="photo-frame">${photoInnerHtml({ src, imagePrompt, imageFit })}</div>
      ${caption ? `<p class="photo-caption">${caption}</p>` : ""}
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  overlay.querySelector("#photo-close").addEventListener("click", () => overlay.remove());
}
