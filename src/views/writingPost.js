import { state } from "../state.js";
import { goTo } from "../router.js";

// PT2 选了"实名公开指认"或"写报道不点名"之后，不直接跳结局页，先过
// 这一段：黑屏停一下 → 慢慢变亮（单次淡出，不反复闪烁）→ 写微博界面 → 逐条选项把长微博
// 一段段续写出来 → 点发送 → 淡出到结局页。私下交给陪你走到最后/
// 什么都不做这两种不涉及公开发帖，dm.js 里还是直接 goTo("ending")，
// 不会经过这里。
//
// 这一版不再是"一句通用文案"，是按 finalSuspect × finalAction 12 种
// 组合各自写好的一整篇调查长微博，玩家每点一个"> ..."选项，就会把
// 对应的一段追加打进微博里——读起来像玩家自己一步步写出这篇东西，
// 不是作者直接喂一段成品。选项只显示"下一个能点的"，不会一次性
// 摆出一整排任你挑，跟之前"看着像选择、其实只有一个"的设计精神
// 是一回事，只是现在每一步都是真内容，不是纯装饰。
const POST_SCRIPTS = {
  hexun: {
    public_name: [
      {
        prompt: "> 从真正的死亡时间开始。",
        text: `我重新整理了周晏星死亡当晚能够被确认的记录。公司最初公布的死亡时间并不成立：23:52，他的 Bubble 账号仍留下最后活跃；00:20，AURORA 已经无法从设备读取生命数据。真正发生一切的时间，只可能在 **23:52之后、00:20之前**。`,
      },
      {
        prompt: "> 写下那晚的员工出入记录。",
        text: `而就在这个时间窗口里，一组与周年项目有关的员工权限出现在周晏星住所。23:46进入，00:11从地下车库离开。更异常的是，这段本应留在系统里的原始记录后来遭到删除。02:14，有人试图让这一晚留下的痕迹变得不再完整。`,
      },
      {
        prompt: "> 把新_PROD和HX_404连起来。",
        text: `我沿着周年项目里的"新_PROD"继续往前查，最后翻到了一个早已注销的账号：HX_404。H-X-04，贺寻。很多年前，他曾经是那个出道企划里的第五个人；后来他的名字从名单里消失。很多年以后，他换了一个身份，以制作人员的名义重新回到了F4ever身边。`,
      },
      {
        prompt: "> 写下他为什么会回来。",
        text: `旧资料里还有另一件事。贺寻当年因为"私人关系风险"失去了出道机会，但公司面对周晏星身上的类似风险时，却做出了完全不同的处理。相关资料被修改，旧事被压下，周晏星最终留下并顺利出道。直到周年项目重新整理旧档案，那些本来应该永远留在过去的记录又被翻了出来。`,
      },
      {
        prompt: "> 但门禁卡还不能证明是他。",
        text: `仅凭一组员工权限，我不会公开指认任何人。门禁可以借，账号可以共用，工作人员的黑色外套也不能证明穿着它的人是谁。但00:02留下的现场画面里，设备上出现了一个很不起眼的银色交叉胶带标记。相同的处理方式，曾经出现在HX_404的旧照片里，后来又出现在新_PROD的工作照片里。`,
      },
      {
        prompt: "> 写下他的名字。",
        text: `所以我决定把这个名字写出来。

**贺寻。**

23:46至00:11的员工权限、00:02留下的个人使用习惯、HX_404与新_PROD跨越多年的身份关联，以及02:14遭到删除的原始记录，最终落在了同一个人身上。

我知道在公开平台上写下一个真实姓名意味着什么。所以我也把自己为什么写下它的依据一起留下。如果这些证据存在另一种解释，就去查清楚。

但不要再拿那份错误的死亡时间线告诉所有人，这件事已经结束了。`,
      },
    ],
    report_noname: [
      {
        prompt: "> 从那二十八分钟开始。",
        text: `如果要重新讲周晏星死亡的那个晚上，也许应该先把公司公告里的时间放到一边。23:52，他的Bubble账号留下最后一次活跃；00:20，AURORA再次尝试读取设备数据时，已经无法得到有效回应。真正需要被解释的，是中间消失的二十八分钟。`,
      },
      {
        prompt: "> 再往前一点。",
        text: `那个晚上其实留下了很多彼此分散的碎片。19:26之后的记录，20:32和20:41留下的微博痕迹，约22:20之后的行程，22:44的便利店记录，22:50至23:58的宠物医院记录。它们没有还原任何一段不存在的私聊，却一点一点把真实发生过的事情从后来形成的叙述里剥离出来。`,
      },
      {
        prompt: "> 把23点之后留下的东西排在一起。",
        text: `22:34，Bubble广播。23:17，又一次。

23:31。23:39。23:43。23:46。23:47。

有人在附近，有人留下了无法忽略的网络痕迹，也有一组工作人员权限进入了住所。但这些东西单独拿出来，没有任何一条足以回答"是谁"。`,
      },
      {
        prompt: "> 写下23:52。",
        text: `**23:52。**

Bubble留下最后活跃。

几乎在同一时间，weather0721出现在一条沉了很多年的旧微博下面，只留下了一句话：

"L，如果你还看得到的话。"

这是目前还能找到的、属于周晏星本人的最后痕迹之一。`,
      },
      {
        prompt: "> 接着往后写。",
        text: `00:11，案发窗口内进入住所的员工权限离开。

00:20，设备已经无法读取生命数据。

02:14，本应继续存在于系统里的原始记录遭到删除。

如果调查停在这里，我们得到的仍然只是一个没有脸的工作人员。`,
      },
      {
        prompt: "> 写那个曾经消失过的人。",
        text: `周年项目的资料里出现了"新_PROD"。继续往前翻，会找到HX_404，会找到H-X-04，也会找到很多年前一份五个人的名单。

曾经有第五个人站在他们旁边。后来，他因为一项风险从名单里消失。

很多年以后，他又以工作人员的身份回到了这个项目。`,
      },
      {
        prompt: "> 不写名字。写留下来的东西。",
        text: `门禁权限不能证明使用者，工作服不能证明身份。真正让不同时期的资料开始重叠的，反而是一些几乎不会被当成证据的小习惯：旧照片里的设备处理方式、后来工作照里相同的银色交叉胶带，以及00:02现场画面里留下的同一种标记。

名字可以换。账号可以注销。一个人甚至可以从五个人的合照里消失。

习惯没有。`,
      },
      {
        prompt: "> 到这里就够了。",
        text: `我不会公开那段多年前私人关系另一方的身份，也不会替任何不存在的聊天记录补上对白。

能够确认的事实已经足够：周晏星的死亡时间需要重新调查；案发窗口内进入住所的工作人员需要重新调查；02:14被删除的原始记录需要重新调查。

至于那个曾经从五个人里被删除、后来又重新回到他们身边的人——

如果真的有人继续查下去，这一次，他应该不会再从记录里消失了。`,
      },
    ],
  },
  shenxi: {
    public_name: [
      {
        prompt: "> 写她为什么会进入你的视线。",
        text: `我最开始注意到沈溪，是因为她留下的时间。

周晏星真正的死亡窗口在23:52至00:20之间，而就在那天晚上，23:31和23:43，沈溪留下了两条很难忽略的微博。她不是后来才知道那里发生了什么——她当时就在附近。`,
      },
      {
        prompt: "> 她自己也承认了。",
        text: `被怀疑之后，她没有否认自己在场。她说："我确实在场，但不是我。"

她甚至主动留下了一个入口：想问什么，可以私信她。`,
      },
      {
        prompt: "> 写你从她那里拿到的照片。",
        text: `我问她看到了什么。她能够提供案发当晚的现场信息，也拿出了一张只有真正到过那里才可能拍下的照片。照片里的保温杯后来又牵出了更多关于周晏星私人生活的旧痕迹。

她知道得比一个普通粉丝应该知道的更多，也离那个晚上比绝大多数人更近。`,
      },
      {
        prompt: "> 写下你的判断。",
        text: `所以我无法把23:31、23:43、她亲口承认的"在场"，以及她手里的现场照片全部解释成巧合。

**我认为沈溪需要为周晏星死亡当晚发生的事情接受重新调查。**

她说"不是我"。

那就让23:52之后真正的出入记录和现场证据证明这句话。`,
      },
    ],
    report_noname: [
      {
        prompt: "> 从那个在场的人开始。",
        text: `周晏星死亡的那个晚上，有一名长期关注他私人行程的粉丝留下了非常具体的时间痕迹。23:31和23:43，她发布的内容说明她当时就在住所附近，而不是事后才从新闻里知道那里发生了什么。`,
      },
      {
        prompt: "> 她后来承认了。",
        text: `面对外界的怀疑，她没有否认自己在场。她只强调："不是我。"在后续交流中，她还提供了一张案发当晚拍摄的照片，其中出现了后来调查中非常重要的物品。`,
      },
      {
        prompt: "> 把问题留下来。",
        text: `一个能够准确描述现场、能够提供现场照片、又在关键时间出现在附近的人，至少掌握着尚未被公开的信息。

这并不能自动回答她做了什么。

但如果最初的死亡时间已经被证明有问题，那么她究竟在什么时候到达、什么时候离开、期间看到了谁，应该重新被放回那二十八分钟里核查。`,
      },
    ],
  },
  linan: {
    public_name: [
      {
        prompt: "> 写那场争执。",
        text: `在周晏星死亡之前，他和林安之间发生过一次真实存在的争执。这不是粉丝剪辑出来的"不和"，也不是靠表情和站位猜出来的关系变化，而是一段被留下来的录音。`,
      },
      {
        prompt: "> 写他们之间已经存在的问题。",
        text: `越往旧资料里查，越能看见F4ever并不是后来公开叙事里那个永远没有裂缝的四人整体。林安知道更早的练习生时期，也知道那个项目最初并不只有后来出道的四个人。有些事情在出道以后消失了，但没有真正从成员之间消失。`,
      },
      {
        prompt: "> 把案发当晚放回来。",
        text: `而偏偏是在周晏星死亡的那个晚上，这些长期存在的问题再次以争执的形式出现。死亡时间又被证明晚于公司最初公布的时间。

这意味着那场争执不能只被当成一段普通的团内矛盾略过去。`,
      },
      {
        prompt: "> 写下林安。",
        text: `**我认为林安应该被重新调查。**

不是因为"队友不和"四个字，也不是因为饭圈里任何关于他们关系的猜测，而是因为在一个错误的官方时间线下面，案发前真实发生过的冲突从来没有被完整解释。

如果那场争执真的与死亡无关，就应该由完整的时间线证明，而不是继续被一份已经站不住脚的公告带过去。`,
      },
    ],
    report_noname: [
      {
        prompt: "> 写F4ever并不一直只有四个人。",
        text: `F4ever后来以四个人的形式被所有人认识，但旧资料留下了另一个版本。这个项目曾经有过第五个人，而今天仍在团体中的成员，至少有人知道那段历史并没有像公开资料一样彻底消失。`,
      },
      {
        prompt: "> 写案发前的争执。",
        text: `周晏星死亡之前，他与一名团体成员发生过真实的争执。录音能够证明冲突存在，但不能告诉我们冲突之后发生了什么。`,
      },
      {
        prompt: "> 不替录音补上结局。",
        text: `这也是这条线索最危险的地方。

知道两个人吵过架，很容易让人替后面的空白写出一个故事。但争执不是死亡证明，关系破裂也不是现场证据。

如果要重新调查，这段录音应该被放回真实死亡窗口里核查，而不是被剪成一句"成员不和"之后直接替任何人定罪。`,
      },
    ],
  },
  chenyu: {
    public_name: [
      {
        prompt: "> 从2019年的文件开始。",
        text: `我查到的很多东西最后都会绕回陈屿。

2019年的内部风险资料存在修改痕迹。公司知道周晏星身上存在可能影响出道和商业价值的私人关系风险，但后来留下来的版本，与更早的历史记录并不完全一样。`,
      },
      {
        prompt: "> 他不是第一次知道这些秘密。",
        text: `作为长期负责周晏星事务的经纪人，陈屿不是一个案发后才突然接触这些资料的人。他知道公司过去处理过什么，也知道哪些东西从公开叙事里消失了。

多年后，周年项目又把那些旧资料重新带了回来。`,
      },
      {
        prompt: "> 写公司后来做了什么。",
        text: `周晏星死亡以后，公司给出了后来被其他记录推翻的死亡时间。与此同时，与案发时间有关的员工出入信息也遭到处理。

这意味着至少有人在真实情况和公众最终看到的版本之间做出了选择。`,
      },
      {
        prompt: "> 写下那个最接近这些选择的人。",
        text: `陈屿同时出现在旧资料的处理链和案发后的公司处置链里。

他知道过去发生过什么，也处在能够接触和影响信息流向的位置。`,
      },
      {
        prompt: "> 写下陈屿。",
        text: `所以我认为应该被重新调查的人是——**陈屿。**

如果一个人参与过旧资料的处理，又身处死亡事件发生后的信息控制中心，那么他至少需要解释：为什么公众得到的是错误的死亡时间？为什么关键员工记录会被处理？公司到底是在保护周晏星，还是在保护某个仍然活着的人？`,
      },
    ],
    report_noname: [
      {
        prompt: "> 写第一次被修改的记录。",
        text: `这起事件里最让我无法忽略的，不只是一个错误的死亡时间，而是两次发生在不同年份、却非常相似的信息处理。

第一次在2019年。一份与艺人私人关系风险有关的内部记录留下了不同版本。`,
      },
      {
        prompt: "> 写第二次。",
        text: `第二次发生在周晏星死亡之后。

真实活动记录与最初的公开时间无法对应；案发窗口内又存在员工出入异常；随后，与这些信息有关的记录遭到处理。`,
      },
      {
        prompt: "> 写那个一直在信息中间的人。",
        text: `连接这两个时期的，是长期负责艺人事务的管理人员。

他知道2019年发生过什么，也处在死亡事件发生后公司内部信息流转的位置。`,
      },
      {
        prompt: `> 不把"掩盖"直接写成"杀人"。`,
        text: `但这里必须区分两件事。

修改记录、控制信息、制造错误的公开叙事，能够证明有人试图决定公众最终看见什么；它本身不能证明这个人制造了死亡。

真正需要回答的是：公司究竟在隐藏自己的责任，还是在替案发现场的某个人隐藏责任？`,
      },
    ],
  },
  suzhao: {
    public_name: [
      {
        prompt: "> 写weather0721。",
        text: `23:52，周晏星留下了一个很难解释成普通网络活动的痕迹。

weather0721出现在一条很多年前的微博下面，只留下了一句话：

"L，如果你还看得到的话。"`,
      },
      {
        prompt: "> 把时间往前翻。",
        text: `继续往前查，会找到2018，会找到0622，会找到一个后来几乎从周晏星公开人生里彻底消失的人。

陆昭。

她曾经以"拾光の猫"的名字存在于那段没有被公开承认的关系里。`,
      },
      {
        prompt: "> 写2019年的处理。",
        text: `2019年的公司内部资料说明，这段关系并不是只有两个人知道。它曾经进入公司的风险判断，后来又被处理、修改，最终从周晏星出道后的公开人生里消失。

但23:52，他又回到了她很多年前留下的那条微博下面。`,
      },
      {
        prompt: "> 写下她的名字。",
        text: `所以我认为，**陆昭**与周晏星死亡前最后留下的私人痕迹之间存在无法忽略的联系。

一段被公司处理过的旧关系，在死亡当晚重新出现，而周晏星最后留下的话又明确指向她。

我认为她需要解释，那天晚上他们之间究竟发生了什么。`,
      },
    ],
    report_noname: [
      {
        prompt: "> 不写她是谁。",
        text: `周晏星死亡前留下的最后痕迹之一，指向一个已经沉寂很多年的普通人。

23:52，weather0721在一条旧微博下面写：

"L，如果你还看得到的话。"`,
      },
      {
        prompt: "> 写那段被藏起来的过去。",
        text: `旧资料能够证明，周晏星出道前曾经存在一段没有被公开承认的长期私人关系。这件事后来进入公司的风险判断，也留下了被修改和处理过的记录。

多年以后，那段关系几乎已经从公众能够搜索到的周晏星人生里消失。`,
      },
      {
        prompt: "> 但那晚它又出现了。",
        text: `直到死亡当晚。

一个多年没有被公开提起的人，再次出现在周晏星最后留下的文字里。

这当然会让人想问：为什么偏偏是那一天？为什么偏偏是23:52？`,
      },
      {
        prompt: "> 不写她的名字。",
        text: `我不会公开这个普通人的姓名、账号或照片。

如果这段过去与案件有关，调查者应该去确认；如果无关，那么一个已经离开公众视野多年的人，也不应该因为死者最后的一句话再次被拖回所有人的目光里。`,
      },
    ],
  },
  company: {
    public_name: [
      {
        prompt: "> 先写他们说错了什么。",
        text: `银河星途关于周晏星死亡的公开说法，从最基础的时间上就无法成立。

23:52，他仍然留下活动痕迹；00:20，设备已经无法读取生命数据。真实死亡窗口与公司最初给出的版本并不一致。`,
      },
      {
        prompt: "> 这不只是一个时间写错了。",
        text: `如果只有这一处异常，我可以相信那是混乱中的错误。

但案发窗口内还存在员工权限进入住所的记录，而相关信息后来遭到处理；02:14，原始记录进一步被删除。

有人不希望后来的人看到完整的那一晚。`,
      },
      {
        prompt: "> 写2019。",
        text: `而这也不是第一次出现"原始记录"和"后来留下的版本"不一致。

2019年的风险档案同样存在修改痕迹。面对可能影响艺人和项目价值的信息，公司曾经选择过什么应该留下、什么不应该留下。`,
      },
      {
        prompt: "> 写下银河星途。",
        text: `所以我认为，**银河星途必须为周晏星死亡事件中发生的信息处理承担解释责任。**

错误的死亡时间、被处理的员工出入信息、遭到删除的原始记录，都发生在一个本应完整保存证据的案件里。

如果公司只是为了控制舆情，那就公开完整记录。

如果不是——那他们究竟在替谁隐藏那二十八分钟？`,
      },
    ],
    report_noname: [
      {
        prompt: "> 从一份不成立的公告开始。",
        text: `一个人的死亡时间，本来应该是这起事件里最不需要猜的东西。

但周晏星所属经纪公司最初公布的时间，与后来能够确认的数字记录无法对应：23:52仍有活动，00:20设备已经无法返回生命数据。`,
      },
      {
        prompt: "> 写那些后来消失的记录。",
        text: `与此同时，真实死亡窗口内存在工作人员权限进入住所的记录。相关信息随后遭到处理，02:14，原始记录进一步被删除。

问题因此不再只是"公告为什么写错"。

而是谁决定了什么能够被留下。`,
      },
      {
        prompt: "> 把时间拉回2019。",
        text: `数年前，同一套管理体系内部也曾出现过被修改的风险资料。涉及艺人商业价值和私人关系的信息，在不同版本之间发生变化。

多年以后，一场死亡事件里再次出现了"原始记录"和"最终版本"的区别。`,
      },
      {
        prompt: "> 把问题留给他们。",
        text: `这些材料能够证明公司处理过信息，却不能仅凭这一点证明公司制造了死亡。

但至少有几个问题必须得到回答：

真实死亡时间为什么没有出现在最初的公告里？

案发窗口内的员工记录为什么需要被处理？

02:14，又是谁删除了原始记录？

如果这些问题没有答案，那么所谓"官方版本"，就还不能成为这起事件的最后一页。`,
      },
    ],
  },
};

export function renderWritingPost(root) {
  root.className = "weibo-scope";

  const vignette = document.createElement("div");
  vignette.className = "wpost-vignette";
  root.appendChild(vignette);

  const layout = document.createElement("div");
  layout.className = "wlayout no-leftnav";
  layout.style.gridTemplateColumns = "minmax(0, 1fr)";
  layout.style.maxWidth = "640px";
  root.appendChild(layout);

  const main = document.createElement("main");
  layout.appendChild(main);

  const panel = document.createElement("div");
  panel.className = "wfeed-card wpost-card";
  panel.innerHTML = `
    <div class="wpost-head">发微博</div>
    <div class="wpost-textarea" id="wpost-textarea"><span class="wpost-placeholder" id="wpost-placeholder">有什么新鲜事想告诉大家？</span></div>
    <div class="wpost-suggest-row" id="wpost-suggest-row"></div>
    <div class="wpost-actions">
      <button class="wpost-send-btn" id="wpost-send-btn" disabled>发送</button>
    </div>
  `;
  main.appendChild(panel);

  const blackout = document.createElement("div");
  blackout.className = "wpost-blackout";
  root.appendChild(blackout);
  blackout.addEventListener("animationend", () => blackout.remove());
  setTimeout(() => blackout.classList.add("wpost-blink"), 650);

  const script =
    POST_SCRIPTS[state.finalSuspect]?.[state.finalAction] ||
    POST_SCRIPTS.hexun.report_noname;

  const textEl = panel.querySelector("#wpost-textarea");
  const suggestRow = panel.querySelector("#wpost-suggest-row");
  const sendBtn = panel.querySelector("#wpost-send-btn");

  let accumulated = []; // 已经完整打出来的富文本字符数组，跨步骤累积
  let stepIndex = 0;

  function renderNextOption() {
    if (stepIndex >= script.length) {
      suggestRow.innerHTML = "";
      sendBtn.disabled = false;
      return;
    }
    const step = script[stepIndex];
    suggestRow.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "wpost-suggest-chip";
    btn.textContent = step.prompt;
    btn.addEventListener("click", () => {
      btn.disabled = true;
      btn.classList.add("used");
      const sep = accumulated.length ? [{ nl: true }, { nl: true }] : [];
      const stepChars = sep.concat(explodeRich(step.text));
      typeRich(textEl, accumulated, stepChars, (finalChars) => {
        accumulated = finalChars;
        stepIndex += 1;
        renderNextOption();
      });
    });
    suggestRow.appendChild(btn);
  }

  renderNextOption();

  sendBtn.addEventListener("click", () => {
    sendBtn.disabled = true;
    sendBtn.textContent = "已发送";
    const fadeOut = document.createElement("div");
    fadeOut.className = "wpost-blackout wpost-fadein";
    root.appendChild(fadeOut);
    setTimeout(() => goTo("ending"), 700);
  });
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 把 **粗体** 标记展开成逐字符数组（{ch,bold} 或 {nl:true}），方便
// 打字机效果按字符推进时也知道当前这一个字要不要包在 <strong> 里，
// 不需要在动画中途解析半截的 markdown。
function explodeRich(text) {
  const chars = [];
  const parts = text.split(/\*\*(.+?)\*\*/g);
  parts.forEach((part, i) => {
    const bold = i % 2 === 1;
    for (const ch of part) {
      if (ch === "\n") {
        chars.push({ nl: true });
      } else {
        chars.push({ ch, bold });
      }
    }
  });
  return chars;
}

function richToHtml(chars) {
  let html = "";
  let inBold = false;
  chars.forEach((c) => {
    if (c.nl) {
      html += "<br>";
      return;
    }
    if (c.bold && !inBold) {
      html += "<strong>";
      inBold = true;
    }
    if (!c.bold && inBold) {
      html += "</strong>";
      inBold = false;
    }
    html += escapeHtml(c.ch);
  });
  if (inBold) html += "</strong>";
  return html;
}

// 把 base（已经打完、静止不动的部分）和 addChars（这一步要新打出来
// 的部分）拼起来，只对新增部分播放逐字打字机动画——已经写好的段落
// 不会跟着重新抖动一次。
function typeRich(el, base, addChars, onDone) {
  el.classList.add("typing");
  el.querySelector(".wpost-placeholder")?.remove();
  let i = 0;
  const STEP = 2;
  const timer = setInterval(() => {
    i = Math.min(i + STEP, addChars.length);
    el.innerHTML = richToHtml(base.concat(addChars.slice(0, i)));
    el.scrollTop = el.scrollHeight;
    if (i >= addChars.length) {
      clearInterval(timer);
      el.classList.remove("typing");
      onDone?.(base.concat(addChars));
    }
  }, 16);
}
