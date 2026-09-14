import "./style.css";
import { registerView, mountRouter } from "./router.js";
import { renderForum } from "./views/forum.js";
import { renderSearch } from "./views/search.js";
import { renderBubble } from "./views/bubble.js";
import { renderReasoning } from "./views/reasoning.js";
import { renderEnding } from "./views/ending.js";

registerView("forum", renderForum);
registerView("search", renderSearch);
registerView("bubble", renderBubble);
registerView("reasoning", renderReasoning);
registerView("ending", renderEnding);

mountRouter(document.getElementById("view"), "forum");
