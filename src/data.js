import posts from "../content/posts.json";
import profiles from "../content/profiles.json";
import bubble from "../content/bubble.json";
import clues from "../content/clues.json";
import endings from "../content/endings.json";

export { posts, profiles, bubble, clues, endings };

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

export function isBlockedQuery(query) {
  const q = query.trim();
  if (!q) return false;
  if (/\d{15,18}/.test(q)) return true;
  if (q.includes("身份证") || q.includes("户籍") || q.includes("家庭住址")) return true;
  return false;
}
