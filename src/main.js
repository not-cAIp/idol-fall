import "./style.css";
import { registerView, mountRouter } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderForum } from "./views/forum.js";
import { renderPostDetail } from "./views/postDetail.js";
import { renderSearch } from "./views/search.js";
import { renderDm } from "./views/dm.js";
import { renderShenxiDm } from "./views/shenxiDm.js";
import { renderEnding } from "./views/ending.js";
import { markClueFound } from "./state.js";
import { renderOnboardingNotif } from "./components/onboardingNotif.js";

registerView("home", renderHome);
registerView("forum", renderForum);
registerView("postDetail", renderPostDetail);
registerView("search", renderSearch);
registerView("dm", renderDm);
registerView("shenxiDm", renderShenxiDm);
registerView("ending", renderEnding);

// 泡泡是一个独立站点（not-cAIp.github.io/paopao/），读完专属消息后
// 会带着 ?clue=c11,c12,c13,c14,c31 这样的逗号分隔列表跳回这里——
// 这是唯一需要跨站点同步的信号。
const returnedClue = new URLSearchParams(location.search).get("clue");
if (returnedClue) {
  returnedClue.split(",").map((s) => s.trim()).filter(Boolean).forEach(markClueFound);
  history.replaceState(null, "", location.pathname);
}

mountRouter(document.getElementById("view"), "forum");
renderOnboardingNotif();
