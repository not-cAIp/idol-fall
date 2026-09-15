import "./style.css";
import { registerView, mountRouter } from "./router.js";
import { renderForum } from "./views/forum.js";
import { renderPostDetail } from "./views/postDetail.js";
import { renderSearch } from "./views/search.js";
import { renderDm } from "./views/dm.js";
import { renderReasoning } from "./views/reasoning.js";
import { renderEnding } from "./views/ending.js";
import { markClueFound } from "./state.js";

registerView("forum", renderForum);
registerView("postDetail", renderPostDetail);
registerView("search", renderSearch);
registerView("dm", renderDm);
registerView("reasoning", renderReasoning);
registerView("ending", renderEnding);

// 泡泡是一个独立站点（saraliuxt-coder.github.io/paopao/），登进专属消息后
// 会带着 ?clue=t04 跳回这里——这是唯一需要跨站点同步的信号。
const returnedClue = new URLSearchParams(location.search).get("clue");
if (returnedClue) {
  markClueFound(returnedClue);
  history.replaceState(null, "", location.pathname);
}

mountRouter(document.getElementById("view"), "forum");
