const STORAGE_KEY = "tafang-anjuan-save";

export const CLUE_TOTAL = 34;
// 私信里出现「结案」选项的最低门槛——不再要求集满 34/34。降到一个小
// 数字是刻意的：玩家可以带着远不完整的信息就去指认凶手，选错人、或者
// 选对了人但处理方式不当，都会得到不一样（通常更差）的结局，这样
// "选谁、怎么处理"才是一个真正有风险的决定，不是走完全部内容后的
// 例行公事。
export const MIN_TO_TALK = 5;

const defaultState = () => ({
  expandedReplies: [],
  foundProfiles: [],
  foundClues: [],
  finalSuspect: null,
  finalAction: null,
  finalEnding: null,
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export const state = load();

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 存档失败时静默忽略，不影响当前会话 */
  }
}

export function markClueFound(id) {
  if (!id) return;
  if (!state.foundClues.includes(id)) {
    state.foundClues.push(id);
    save();
  }
}

export function markProfileFound(id) {
  if (!state.foundProfiles.includes(id)) {
    state.foundProfiles.push(id);
    save();
  }
}

export function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
