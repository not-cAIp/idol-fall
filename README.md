# 偶像的陨落

**[▶ 开始游戏](https://not-cAIp.github.io/idol-fall/)**

仿真微博社交平台调查解密游戏。顶流艺人周晏星坠亡，官方通报是"意外"——玩家要在超话帖子、评论区、私信记录，以及几个关联站点的残留数据里挖出真相。

## 玩法

- 逛微博：搜索账号、刷超话、点开帖子和评论区，收集线索
- 关联取证：部分线索藏在外部站点（好友的社交主页、私信应用、智能手环后台、品牌活动页），需要交叉比对时间线才能拼出完整证据链
- 私信「陪你走到最后」是提交推理的入口，会分阶段追问死亡区间、地点等关键事实，答案必须精确——蒙不过去
- 结局取决于你找到了什么证据、又提交了什么样的推理，不止一种收尾

## 技术栈

Vite + 原生 JS，内容数据驱动（`content/*.json`），GitHub Actions 自动部署到 GitHub Pages。

外部关联站点（各自独立仓库，纯静态单页）：
[泡泡](https://not-cAIp.github.io/paopao/) ·
[GALAXY WORKSPACE](https://not-cAIp.github.io/galaxy-workspace/) ·
[ECHO](https://not-cAIp.github.io/echo/) ·
[极光运动 AURORA](https://not-cAIp.github.io/aurora-fit/)

详细设定与实现现状见 [游戏梳理.md](./游戏梳理.md)，可验证的通关路径见 [破案流程.md](./破案流程.md)。
