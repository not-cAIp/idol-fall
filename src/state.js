const STORAGE_KEY = "tafang-anjuan-save";

export const CLUE_TOTAL = 41;

// PT1（死亡时间线）相关的线索子集，用来在私信里单独显示"PT1 进度"，
// 跟总的 41 条区分开——玩家在推理死亡时间/地点阶段，看到的不该是
// 一个混进了 CP 糖点、公司内部风险评估这些 PT2 内容的总数。
export const PT1_CLUE_IDS = [
  "c01", "c02", "c03", "c04", "c05", "c06",
  "c17", "c18", "c20", "c21", "c22",
  "c23", "c24", "c30", "c35", "c41",
];

// PT1 分三步问，答案都要玩家自己填精确时间点，不是选择题：①『几点
// 之前去世的』——正确答案『00:20』，靠 AURORA『尝试读取心率，未找到设备』这条
// 记录撑住，是死亡区间的上界；②『几点之后去世的』——正确答案
// 『23:52』，只靠泡泡最后一条消息+『对方已下线』状态撑住，是死亡
// 区间的下界。两问
// 答对以后，私信会把这两个点拼成一个区间"23:52-00:20"讲给玩家听；
// ③再问『哪里』，正确答案『自己住所』。这一版不要求玩家手上必须先
// "点开"过某几条具体线索才算数——纯粹看这三步推理答没答对，找没找到
// 支撑证据是玩家自己判断该不该确信这个答案的事，不是代码强制的门槛。
// 沈溪主页（23:31/23:43仍有动静）、AURORA 手环记录、泡泡的最后消息
// 都还在，是帮玩家推理出正确答案的线索来源，只是不再被 canUnlockPt2
// 逐条打卡。
export function canUnlockPt2(s) {
  return (
    s.deathBeforeAnswer === "before_0020" &&
    s.deathAfterAnswer === "after_2352" &&
    s.deathLocationAnswer === "residence"
  );
}

// PT2 指认贺寻：GW 的四份文件（c37-c40）和 ECHO 的身份链接（c36）
// 都已经去掉了"返回超话"这个跨站同步环节（GW/ECHO 和主站是三个独立
// 域名的静态站点，没有共享存储），所以现在没有任何一条是硬性要求——
// 玩家自己去 GW/ECHO 看没看这些证据、信不信这个结论，不再由代码逐条
// 打卡判定。hexun_unproven（『找到了但还证不了』）这个中间结局因此在
// 正常玩法下已经进不去了，代码保留但是死代码，见 src/views/dm.js。
export function canConvictHeXun() {
  return true;
}

const defaultState = () => ({
  foundProfiles: [],
  foundClues: [],
  deathBeforeAnswer: null,
  deathBeforeAnswerRaw: null,
  deathAfterAnswer: null,
  deathAfterAnswerRaw: null,
  deathLocationAnswer: null,
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

// "继续调查"——只清掉 PT2 的指认结果（嫌疑人/处理方式/结局），线索、
// 主页发现记录、PT1 的三个答案全部保留，玩家可以直接回私信换一个
// 嫌疑人/处理方式再试，不用把已经拼出来的东西全部推倒重来。
export function continueInvestigating() {
  state.finalSuspect = null;
  state.finalAction = null;
  state.finalEnding = null;
  save();
}
