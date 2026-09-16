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

// PT1 分三步问：①『公司公布的死亡时间是否成立』，选『不成立，23:43
// 之后仍然活着』才会往下走；②『几点』，正确答案是玩家自己填的时间
// 『23:52之后』；③『哪里』，正确答案『自己住所』。这一版不再要求玩家
// 手上必须先"点开"过某几条具体线索（c23/c24/c35 之类）才算数——纯粹
// 看这三步推理答没答对，找没找到支撑证据是玩家自己判断该不该确信
// 这个答案的事，不是代码强制的门槛。沈溪主页（23:31/23:43仍有动静）、
// AURORA 手环记录（23:47仍在同步、23:52中断）都还在，是帮玩家推理出
// 正确答案的线索来源，只是不再被 canUnlockPt2 逐条打卡。
export function canUnlockPt2(s) {
  return (
    s.officialTimeAnswer === "after_2343" &&
    s.deathTimeAnswer === "after_2352" &&
    s.deathLocationAnswer === "residence"
  );
}

// PT2 指认贺寻：GALAXY WORKSPACE 那四份文件（风险评估/权限交接/门禁
// 记录/场馆照片，对应 c37-c40）已经去掉了"返回超话"这个同步环节
// （GW 和主站是两个独立域名的静态站点，没有共享存储），所以这四条
// 不再是硬性要求，只剩 ECHO 的身份链接（c36：HX_404=贺寻=HX_PROD）
// 还挂着——玩家自己去 GW 看没看这些文件、信不信这个结论，不再由代码
// 逐条打卡判定。选中贺寻但没做身份链接确认，会得到『还没能证明』的
// 中间结局，见 src/views/dm.js。
export function canConvictHeXun(s) {
  return s.foundClues.includes("c36");
}

const defaultState = () => ({
  foundProfiles: [],
  foundClues: [],
  officialTimeAnswer: null,
  deathTimeAnswer: null,
  deathTimeAnswerRaw: null,
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
