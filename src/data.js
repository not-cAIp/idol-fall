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
  // 营销号/娱记style账号——名字是现实里真实存在的娱乐营销号改一两个字
  // 仿的（会火→能火、内娱教父→内娱教母、老爹站重生版→老妈站重生版、
  // 脱粉回踩救钱包→脱粉回踩救救我，其余几个也是同样手法），头像风格
  // 应该统一用"营销号同款"那种（logo文字水印/网图拼贴风，不是真人
  // 头像）——这 8 张目前还没有对应图片，先占位。
  "@老妈站重生版": "/images/avatar-marketing-laomazhan.jpg",
  "@内娱教母": "/images/avatar-marketing-neiyujiaomu.jpg",
  "@脱粉回踩救救我": "/images/avatar-marketing-tuofenhuicai.jpg",
  "@能火": "/images/avatar-marketing-nenghuo.jpg",
  "@桃秘": "/images/avatar-marketing-taomi.jpg",
  "@关九": "/images/avatar-marketing-guanjiu.jpg",
  "@星帆": "/images/avatar-marketing-xingfan.jpg",
  "@深九君": "/images/avatar-marketing-shenjiujun.jpg",
};

const FAN_AVATARS = [
  "/images/fan-avatar-yanxing-airport.jpg",
  "/images/fan-avatar-yanxing-backstage-back.jpg",
  "/images/fan-avatar-yanxing-encore-talk.jpg",
  "/images/fan-avatar-yanxing-rainy-night.jpg",
  "/images/fan-avatar-yanxing-stage-dance.jpg",
  "/images/fan-avatar-yanxing-variety.jpg",
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

// 返回一个可以直接赋给 el.style.background 的 CSS 值——可能是
// `url(...) center/cover`，也可能是哀悼用的纯色渐变。
export function avatarFor({ handle, author, time } = {}) {
  if (handle && KNOWN_AVATARS[handle]) return `url(${resolveSrc(KNOWN_AVATARS[handle])}) center/cover`;
  if (time && time >= MOURNING_DATE) return MOURNING_BG;
  const key = author || handle || "?";
  return `url(${resolveSrc(FAN_AVATARS[hashStr(key) % FAN_AVATARS.length])}) center/cover`;
}
