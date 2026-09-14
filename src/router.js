const views = {};
let root = null;
let current = "forum";
let currentParams = {};

export function registerView(name, renderFn) {
  views[name] = renderFn;
}

export function mountRouter(rootEl, startView = "forum") {
  root = rootEl;
  current = startView;
  render();
}

export function goTo(name, params = {}) {
  current = name;
  currentParams = params;
  render();
  root.scrollTop = 0;
  window.scrollTo(0, 0);
}

export function getParams() {
  return currentParams;
}

function render() {
  root.innerHTML = "";
  views[current](root, currentParams);
}
