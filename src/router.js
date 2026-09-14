const views = {};
let root = null;
let current = "forum";

export function registerView(name, renderFn) {
  views[name] = renderFn;
}

export function mountRouter(rootEl, startView = "forum") {
  root = rootEl;
  current = startView;
  render();
}

export function goTo(name) {
  current = name;
  render();
  root.scrollTop = 0;
}

function render() {
  root.innerHTML = "";
  views[current](root);
}
