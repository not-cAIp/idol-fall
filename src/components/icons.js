// 手写的极简线性图标集（无外部图标库依赖），全部用 currentColor 继承文字色，
// 方便在浅色 weibo-scope 和默认深色主题之间自动适配，替代原来的 emoji 占位图标。

const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><line x1="20" y1="20" x2="15.5" y2="15.5"/>',
  home: '<path d="M4 12 12 5l8 7"/><path d="M6.5 10.5V19a1 1 0 0 0 1 1H10v-5h4v5h2.5a1 1 0 0 0 1-1v-8.5"/>',
  fire: '<path d="M12 21c3.6-.8 5.5-3.4 5.5-6.6 0-1.8-.8-3.1-1.7-4 .2 1.3-.2 2.2-1 2.7.4-2.7-.8-5.3-3.4-7 .3 1.8-.5 3-1.7 4.2C8.5 11.4 7.7 13 7.7 15c0 3.2 1.7 5.2 4.3 6Z"/>',
  video: '<rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="M16 11.2l4.5-2.6v7.8L16 13.8Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
  gear: '<circle cx="12" cy="12" r="2.8"/><path d="M12 3.5v2.3M12 18.2v2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3.5 12h2.3M18.2 12h2.3M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>',
  moon: '<path d="M20 14.2A8.3 8.3 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z"/>',
  pencil: '<path d="M4.5 19.5l.8-3.4L15.8 5.6l2.6 2.6L8 18.7l-3.5.8Z"/><path d="M14 7.4l2.6 2.6"/>',
  clipboard: '<rect x="5.5" y="4.5" width="13" height="16" rx="1.8"/><rect x="9" y="3" width="6" height="2.8" rx="0.8"/>',
  star: '<path d="M12 3.3l2.4 5 5.5.6-4.1 3.7 1.1 5.4-4.9-2.9-4.9 2.9 1.1-5.4-4.1-3.7 5.5-.6Z"/>',
  heart: '<path d="M12 19.5s-6.4-4-8.5-8.1C2.2 8.5 3.3 5.9 6 5.5c2.1-.3 3.9.9 6 3.1 2.1-2.2 3.9-3.4 6-3.1 2.7.4 3.8 3 2.5 5.9-2.1 4.1-8.5 8.1-8.5 8.1Z"/>',
  people: '<circle cx="8.5" cy="8.2" r="2.8"/><circle cx="16" cy="9.2" r="2.3"/><path d="M3.3 19.5c0-2.8 2.3-4.8 5.2-4.8s5.2 2 5.2 4.8"/><path d="M14.8 15c2.2.4 3.8 2.1 4.1 4.5"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2l-1.8 5.6-5.6 1.8 1.8-5.6Z"/>',
  mic: '<rect x="9.3" y="3.5" width="5.4" height="10" rx="2.7"/><path d="M5.8 11a6.2 6.2 0 0 0 12.4 0"/><line x1="12" y1="17.2" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/>',
  building: '<rect x="4.5" y="3.5" width="15" height="17" rx="1.2"/><line x1="8" y1="7.5" x2="10" y2="7.5"/><line x1="14" y1="7.5" x2="16" y2="7.5"/><line x1="8" y1="11.5" x2="10" y2="11.5"/><line x1="14" y1="11.5" x2="16" y2="11.5"/><line x1="8" y1="15.5" x2="10" y2="15.5"/><line x1="14" y1="15.5" x2="16" y2="15.5"/><line x1="10" y1="20.5" x2="10" y2="17.5"/><line x1="14" y1="20.5" x2="14" y2="17.5"/>',
  chat: '<path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4 3.5V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"/>',
  repost: '<path d="M6 8.2h9.5l-2.4-2.4"/><path d="M18 15.8H8.5l2.4 2.4"/><path d="M6 8.2V13a2 2 0 0 0 2 2h.7"/><path d="M18 15.8v-4.8a2 2 0 0 0-2-2h-.7"/>',
  like: '<path d="M8 20V10.5l4.6-6.3c.5-.7 1.6-.5 1.9.3l.5 1.6c.3.9-.1 2.1-1 3.2H18a2 2 0 0 1 2 2.3l-1 6.5a2 2 0 0 1-2 1.7H8Z"/><path d="M8 10.5H5.5a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1H8"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.6"/><circle cx="8.3" cy="9.3" r="1.6"/><path d="M4.2 17.5l5-5.3 3.4 3 3-3.6 4.2 5.9"/>',
  close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  refresh: '<path d="M4.5 12a7.5 7.5 0 0 1 12.6-5.4"/><path d="M19.5 12a7.5 7.5 0 0 1-12.6 5.4"/><path d="M17.5 4.5v3.5H14"/><path d="M6.5 19.5V16H10"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="1.6"/><path d="M8.3 10.5V8a3.7 3.7 0 0 1 7.4 0v2.5"/>',
};

const STROKE_ATTRS = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';

export function icon(name, { size = 18, className = "", style = "" } = {}) {
  const body = ICONS[name];
  if (!body) return "";
  return `<svg class="wicon-svg icon-${name} ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" ${STROKE_ATTRS} style="${style}">${body}</svg>`;
}

// 微博/推特式的认证徽章：实心圆 + 白色对勾，替代原来的 ✓ 字符
export function verifiedBadge({ size = 14, style = "" } = {}) {
  return `<svg class="wicon-svg icon-verified" width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:-2px;${style}"><circle cx="12" cy="12" r="11" fill="var(--accent)"/><path d="M7.3 12.4l3 2.9 6.3-6.9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
