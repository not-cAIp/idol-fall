import "./style.css";
import { registerView, mountRouter } from "./router.js";
import { renderForum } from "./views/forum.js";
import { renderPostDetail } from "./views/postDetail.js";
import { renderSearch } from "./views/search.js";
import { renderBubble } from "./views/bubble.js";
import { renderDm } from "./views/dm.js";
import { renderReasoning } from "./views/reasoning.js";
import { renderEnding } from "./views/ending.js";

registerView("forum", renderForum);
registerView("postDetail", renderPostDetail);
registerView("search", renderSearch);
registerView("bubble", renderBubble);
registerView("dm", renderDm);
registerView("reasoning", renderReasoning);
registerView("ending", renderEnding);

mountRouter(document.getElementById("view"), "forum");
