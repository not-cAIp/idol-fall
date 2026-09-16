import posts from "../content/posts.json";
import profiles from "../content/profiles.json";
import clues from "../content/clues.json";
import endings from "../content/endings.json";

export { posts, profiles, clues, endings };

export function findProfile(query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    profiles.profiles.find((p) =>
      p.searchKeywords.some((k) => k.toLowerCase() === q)
    ) ||
    profiles.profiles.find((p) =>
      p.searchKeywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))
    ) ||
    null
  );
}

export function postById(id) {
  return posts.posts.find((p) => p.id === id);
}

export function resolveSrc(src) {
  if (/^(https?:)?\/\//.test(src)) return src;
  return import.meta.env.BASE_URL + src.replace(/^\//, "");
}

// 帖子时间格式不统一——大多数是"MM-DD HH:MM"，但苏昭主页那几条怀念/
// 周年帖用的是"MM-DD（去年）"/"MM-DD（前年）"这种相对年份写法，直接按
// 字符串比较（localeCompare）排不出真实的新旧顺序（"（去年）"这种后缀会
// 打乱月日本身的比较）。这里统一转成一个可比较的数字：年份差是最主要
// 的排序依据（今年 > 去年 > 前年），同一年份差内再按月日、时间比。没有
// 具体时间的（比如只有"MM-DD"或者相对年份帖）当成当天最早。
export function timeSortKey(t) {
  if (!t) return -Infinity;
  const yearOffset = t.includes("前年") ? -2 : t.includes("去年") ? -1 : 0;
  const m = t.match(/(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return yearOffset * 1e8;
  const [, mm, dd, hh, min] = m;
  const monthDay = Number(mm) * 100 + Number(dd);
  const minutes = hh ? Number(hh) * 60 + Number(min) : 0;
  return yearOffset * 1e8 + monthDay * 1e4 + minutes;
}

export function isBlockedQuery(query) {
  const q = query.trim();
  if (!q) return false;
  if (/\d{15,18}/.test(q)) return true;
  if (q.includes("身份证") || q.includes("户籍") || q.includes("家庭住址")) return true;
  return false;
}

// 主要角色/官方号按 handle 精确匹配到真图；剩下几百个一次性水贴/吃瓜
// 小号没有单独配图，从 6 张通用饭圈头像里按账号名做确定性哈希分配——
// 同一个小号每次刷新看到的头像都一样，不是每次随机。
const KNOWN_AVATARS = {
  "@zhouyanxing_studio": "/images/avatar-yanxing-studio.jpg",
  "@galaxy_agency": "/images/avatar-galaxy-agency.jpg",
  "@晏星今天早点睡": "/images/avatar-shenxi-sunflower.jpg",
  "@shiguang_neko": "/images/avatar-shiguang-cat.jpg",
  "@linan_ryan": "/images/avatar-linan-official.jpg",
  "@chenyu_official": "/images/avatar-chenyu-manager.jpg",
  "@aurora_fit": "/images/avatar-aurora-brand.jpg",
  "@stay_with_yx": "/images/avatar-companion-admin.jpg",
  "@深夜蹲守代拍": "/images/avatar-daipai-landscape.jpg",
  "@Manibeeo": "/images/avatar-manibeeo.png",
  "@msgleisa": "/images/avatar-msgleisa.png",
  // 只留一个真正的营销号身份——内娱教母（仿现实的"内娱教父"），专门
  // 用来发公关群那条爆料（c22）。其余原本借用营销号命名手法的账号已经
  // 改回粉丝号人设（乍看是普通微博用户，主页一看全是他），头像也相应
  // 改成从粉丝头像池里普通分配，不再单独占用"营销号同款"头像。
  "@内娱教母": "/images/avatar-marketing-neiyujiaomu.jpg",
  "@真的吗？我不信": "/images/avatars/marketing/marketing-01.jpg",
  "@小编今日份沙雕": "/images/avatars/marketing/marketing-08.jpg",
  // "周-大粉"——用周晏星本人的照片当自己头像的铁杆大粉/组织号，只有
  // 这几个指定账号能用，不进入下面的通用粉丝头像池（真实饭圈里只有
  // 真的很上头的大粉/数据站/后援会才会直接拿本人照片当头像，普通路人
  // 粉丝不会这么用）。
  "@StarryNight_周晏星": "/images/fan-avatar-yanxing-rainy-night.jpg",
  "@ZHOUYANXING_FOCUS": "/images/fan-avatar-yanxing-stage-dance.jpg",
  "@Daniel周晏星数据站": "/images/fan-avatar-yanxing-encore-talk.jpg",
  "@周晏星全国后援会": "/images/fan-avatar-yanxing-backstage-back.jpg",
  "@周晏星吧官博": "/images/fan-avatar-yanxing-airport.jpg",
};

// 通用粉丝头像池——超话里其他普通人优先用年轻女孩风格（这类偶像的
// 粉丝群体本来就以年轻女孩为主），ordinary（生活随手拍/宠物/风景）
// 放在后面当补充，池子里已经不包含周晏星本人的照片（那些保留给上面
// 明确指定的大粉账号专用）。
const FAN_AVATARS = [
  "/images/avatars/young-girls/girl-01.jpg",
  "/images/avatars/young-girls/girl-02.jpg",
  "/images/avatars/young-girls/girl-03.jpg",
  "/images/avatars/young-girls/girl-04.jpg",
  "/images/avatars/young-girls/girl-05.jpg",
  "/images/avatars/young-girls/girl-06.jpg",
  "/images/avatars/young-girls/girl-07.jpg",
  "/images/avatars/young-girls/girl-08.jpg",
  "/images/avatars/young-girls/girl-09.jpg",
  "/images/avatars/young-girls/girl-10.jpg",
  "/images/avatars/young-girls/girl-11.jpg",
  "/images/avatars/young-girls/girl-12.jpg",
  "/images/avatars/young-girls/girl-13.jpg",
  "/images/avatars/young-girls/girl-14.jpg",
  "/images/avatars/young-girls/girl-15.jpg",
  "/images/avatars/young-girls/girl-16.jpg",
  "/images/avatars/young-girls/girl-17.jpg",
  "/images/avatars/young-girls/girl-18.jpg",
  "/images/avatars/young-girls/girl-19.jpg",
  "/images/avatars/young-girls/girl-20.jpg",
  "/images/avatars/young-girls/girl-21.jpg",
  "/images/avatars/young-girls/girl-22.jpg",
  "/images/avatars/young-girls/girl-23.jpg",
  "/images/avatars/young-girls/girl-24.jpg",
  "/images/avatars/young-girls/girl-25.jpg",
  "/images/avatars/young-girls/girl-26.jpg",
  "/images/avatars/young-girls/girl-27.jpg",
  "/images/avatars/young-girls/girl-28.jpg",
  "/images/avatars/young-girls/girl-29.jpg",
  "/images/avatars/young-girls/girl-30.jpg",
  "/images/avatars/ordinary/ordinary-01.jpg",
  "/images/avatars/ordinary/ordinary-02.jpg",
  "/images/avatars/ordinary/ordinary-03.jpg",
  "/images/avatars/ordinary/ordinary-04.jpg",
  "/images/avatars/ordinary/ordinary-05.jpg",
  "/images/avatars/ordinary/ordinary-06.jpg",
  "/images/avatars/ordinary/ordinary-07.jpg",
  "/images/avatars/ordinary/ordinary-08.jpg",
  "/images/avatars/ordinary/ordinary-09.jpg",
  "/images/avatars/ordinary/ordinary-10.jpg",
  "/images/avatars/ordinary/ordinary-11.jpg",
  "/images/avatars/ordinary/ordinary-12.jpg",
  "/images/avatars/ordinary/ordinary-13.jpg",
  "/images/avatars/ordinary/ordinary-14.jpg",
  "/images/avatars/ordinary/ordinary-15.jpg",
  "/images/avatars/ordinary/ordinary-16.jpg",
  "/images/avatars/ordinary/ordinary-17.jpg",
  "/images/avatars/ordinary/ordinary-18.jpg",
  "/images/avatars/ordinary/ordinary-19.jpg",
  "/images/avatars/ordinary/ordinary-20.jpg",
];

// 死讯是 09-14 凌晨发布的——真实饭圈惯例：消息传出后，普通粉丝账号会
// 把头像换成黑色哀悼，09-14 之前发的帖子还是用偶像本人照片当头像（很
// 多粉丝确实这么用）。只影响没有专属配图的匿名小号，主要角色/官方号
// 一直用自己的真实头像，不受这条惯例影响。
const MOURNING_DATE = "09-14";
const MOURNING_BG = "linear-gradient(135deg, #1a1a1a, #050505)";

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  return h;
}

// 不同账号不能撞同一张头像——光靠哈希取模在账号数接近头像池大小时
// 很容易撞车。这里在模块加载时把 posts.json 里出现过的、不在
// KNOWN_AVATARS 里的账号 key 全部收集起来、排序（保证每次结果一致），
// 按顺序从头像池里一人发一张，只要池子够大就不会有两个不同账号拿到
// 同一张。池子不够大时才退回旧的哈希取模（允许撞车，但至少不报错）。
const _fanKeys = Array.from(
  new Set(
    posts.posts
      .filter((p) => !(p.handle && KNOWN_AVATARS[p.handle]) && p.time && p.time < MOURNING_DATE)
      .map((p) => p.author || p.handle)
      .filter(Boolean)
  )
).sort();
const _assignedFanAvatar = {};
_fanKeys.forEach((k, i) => {
  _assignedFanAvatar[k] = FAN_AVATARS[i < FAN_AVATARS.length ? i : hashStr(k) % FAN_AVATARS.length];
});

// 返回一个可以直接赋给 el.style.background 的 CSS 值——可能是
// `url(...) center/cover`，也可能是哀悼用的纯色渐变。
export function avatarFor({ handle, author, time } = {}) {
  if (handle && KNOWN_AVATARS[handle]) return `url(${resolveSrc(KNOWN_AVATARS[handle])}) center/cover`;
  if (time && time >= MOURNING_DATE) return MOURNING_BG;
  const key = author || handle || "?";
  const src = _assignedFanAvatar[key] || FAN_AVATARS[hashStr(key) % FAN_AVATARS.length];
  return `url(${resolveSrc(src)}) center/cover`;
}
