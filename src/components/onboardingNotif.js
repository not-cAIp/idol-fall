import { state, save } from "../state.js";
import { goTo } from "../router.js";
import { icon } from "./icons.js";

// 进页面第一件事：模拟一条手机系统通知，来自"陪你走到最后"，内容是
// "姐妹快去看超话"——这条私信联系人这一版一直到 PT1 通关才会在顶栏
// 露出未读红点，玩家提前完全不知道有这个功能存在。这条通知只是氛围
// /预告，不是强制导航——点开会跳进私信线程本身（notif 的发送方=点开
// 后进入的会话，跟真实系统通知行为一致），不点会在几秒后自动收起。
// 只在玩家第一次进页面时出现，state 里记一个标记，不会每次刷新都弹。
export function renderOnboardingNotif() {
  if (state.hasSeenOnboardingNotif) return;
  const phone = document.getElementById("phone");
  if (!phone) return;

  const banner = document.createElement("div");
  banner.className = "onb-notif";
  banner.innerHTML = `
    <div class="onb-notif-icon">${icon("mail", { size: 15 })}</div>
    <div class="onb-notif-body">
      <div class="onb-notif-top">
        <span class="onb-notif-app">陪你走到最后</span>
        <span class="onb-notif-time">现在</span>
      </div>
      <div class="onb-notif-msg">姐妹快去看超话</div>
    </div>
  `;
  phone.appendChild(banner);

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(timer);
    banner.classList.remove("onb-notif-in");
    banner.classList.add("onb-notif-out");
    setTimeout(() => banner.remove(), 260);
  }

  banner.addEventListener("click", () => {
    dismiss();
    goTo("dm");
  });

  const timer = setTimeout(dismiss, 4500);

  state.hasSeenOnboardingNotif = true;
  save();

  requestAnimationFrame(() => banner.classList.add("onb-notif-in"));
}
