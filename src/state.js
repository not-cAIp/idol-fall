const STORAGE_KEY = "tafang-anjuan-save";

const defaultState = () => ({
  expandedReplies: [],
  foundProfiles: [],
  foundClues: [],
  bubbleDiscovered: false,
  bubbleUnlocked: false,
  bubbleAttempts: 0,
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

export function computeAct(s) {
  if (s.bubbleUnlocked) return 3;
  if (s.foundClues.includes("t01") || s.foundClues.includes("t03")) return 2;
  return 1;
}
