function resolveSrc(src) {
  if (/^(https?:)?\/\//.test(src)) return src;
  return import.meta.env.BASE_URL + src.replace(/^\//, "");
}

function photoInnerHtml({ src, imagePrompt }) {
  if (src) {
    return `<img src="${resolveSrc(src)}" alt="" />`;
  }
  return `
    <div class="photo-placeholder">
      <div class="ph-icon">🖼</div>
      <p class="ph-prompt">${imagePrompt || "（暂无图片描述）"}</p>
      <span class="ph-tag">AI 生成图片 · 待补充</span>
    </div>
  `;
}

export function createPhotoThumb({ src, imagePrompt, imageCaption }) {
  const thumb = document.createElement("div");
  thumb.className = "photo-thumb" + (src ? "" : " is-placeholder");
  thumb.innerHTML = photoInnerHtml({ src, imagePrompt });
  thumb.addEventListener("click", () => openPhotoViewer({ src, imagePrompt, caption: imageCaption }));
  return thumb;
}

export function openPhotoViewer({ src, imagePrompt, caption }) {
  const overlay = document.createElement("div");
  overlay.className = "photo-overlay";
  overlay.innerHTML = `
    <div class="photo-panel">
      <div class="photo-panel-head">
        <span class="vh-title">证据照片</span>
        <button class="icon-btn" id="photo-close">✕</button>
      </div>
      <div class="photo-frame">${photoInnerHtml({ src, imagePrompt })}</div>
      ${caption ? `<p class="photo-caption">${caption}</p>` : ""}
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  overlay.querySelector("#photo-close").addEventListener("click", () => overlay.remove());
}
