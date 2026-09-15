const STORAGE_KEY = "tafang-anjuan-save";

export const CLUE_TOTAL = 41;

// PT1（死亡时间推理）通过条件：玩家必须提交『23:43 之后仍然活着』这个
// 判断，并且手上真的有证据支撑——c35（流出的手环同步记录，23:47 仍在
// 活动）是决定性证据，c23/c24（沈溪 23:31/23:43 仍在附近的帖子）证明
// 案发地点当时仍有活动迹象。三项凑齐才算真的推翻了官方 23:20 死亡口径，
// 不是瞎蒙对了选项就算数。
export function canUnlockPt2(s) {
  return (
    s.deathTimeAnswer === "after_2343" &&
    s.foundClues.includes("c35") &&
    (s.foundClues.includes("c23") || s.foundClues.includes("c24"))
  );
}

// PT2 最终指认贺寻成立的条件：身份链接（ECHO 站点 HX_404=贺寻=HX_PROD）、
// 风险评估文件（出道前恋情 + 公司知情选择性保护）、Bubble 导出日志历史
// 版本（贺寻先看到复合消息、再查旧存档）、门禁记录历史版本（23:46 进 /
// 00:11 出，后来被他自己删掉）、假不在场证明被拆穿（场馆照片没有脸）——
// 五项缺一不可。即使玩家提前选中贺寻，证据不全也只会得到『还没能证明』
// 的中间结局，不会直接给出完整真相，见 src/views/dm.js。
export function canConvictHeXun(s) {
  return (
    s.foundClues.includes("c36") &&
    s.foundClues.includes("c37") &&
    s.foundClues.includes("c38") &&
    s.foundClues.includes("c39") &&
    s.foundClues.includes("c40")
  );
}

const defaultState = () => ({
  expandedReplies: [],
  foundProfiles: [],
  foundClues: [],
  deathTimeAnswer: null,
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
