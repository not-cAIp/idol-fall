const STORAGE_KEY = "tafang-anjuan-save";

export const CLUE_TOTAL = 34;
// 私信里出现回复选项的最低门槛——不再要求集满 34/34。降到一个小数字
// 是刻意的：玩家可以带着远不完整的信息就跑去回答，选错、或者选中
// 但手上没有对应证据，都会实打实地降级成结局 D，这样"选哪句话"才是
// 一个真正有风险的决定，而不是走完全部内容后的例行公事。
export const MIN_TO_TALK = 5;

const defaultState = () => ({
  expandedReplies: [],
  foundProfiles: [],
  foundClues: [],
  finalReply: null,
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
