const STORAGE_KEY = "tafang-anjuan-save";

export const CLUE_TOTAL = 34;

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

// requires 是一个线索 id 数组：全部已经在 foundClues 里才算解锁。
// 空数组 / 未定义 = 一直可见。用来决定一个帖子、一段主页内容是否已经解锁——
// 判断时用的是「这次渲染开始前」的 foundClues 快照，所以同一次访问里新标记的
// 线索不会立刻解锁同一批内容的下一层，必须等玩家下次重新打开这个页面（回访）
// 才会看到——这正是「回访揭示新内容」机制的实现方式，不需要额外的状态字段。
export function isUnlocked(requires) {
  if (!requires || !requires.length) return true;
  return requires.every((id) => state.foundClues.includes(id));
}
