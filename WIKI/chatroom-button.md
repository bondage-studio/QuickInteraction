# 聊天室按钮显隐

QiAct 的闪电切换按钮在**收纳（docked）**进 BC `#chat-room-buttons` 时，显隐完全由共享协调器 `BC_ChatRoomButtons`（位于 `liko-Plugin-Repository/Plugins/expand/BC_ChatRoomButtons.js`）通过 `[hidden]` + 收合动画管理。**插件不得插手 docked 按钮的 `hidden` / `display` / `visibility`。**

其它插件（MAT / Kaomoji 等）没这问题，是因为它们是纯工厂：把「顺位 + 工厂函数」交给协调器后完全撒手；QiAct 因为额外维护 `state.toggleBtnEl` 引用和守卫循环，才会跟协调器打架。

## 坑 1：`HideOnPopup` 类

- **问题**：给 docked 按钮加了 `HideOnPopup` 想让它跟随收合列收合；结果打开任意 BC 对话框 / 主页面时按钮被藏，关闭后常无法复原。
- **根因**：`HideOnPopup` 是 BC 的**弹窗隐藏**机制，与收合列无关。
- **实现**：去掉 `HideOnPopup`。想「跟随收合列收合」应通过协调器 `add()` 的 opts **不带 `collapse:false`**（即默认跟随），而非 `HideOnPopup`。
- 代码：`src/ui/toggle-button.js` `createChatRoomToggleButton`。

## 坑 2：每帧 inline `display:none`

- **问题**：离开聊天室后再回来，docked 按钮卡在隐藏；缩放动画时能看到它一闪。
- **根因**：`DrawProcess` hook 每帧在 `CurrentScreen !== 'ChatRoom'` 时给 `state.toggleBtnEl` 盖 `style.display='none'`，**对 docked 按钮也照盖**；而 docked 回场路径不会清除这个 inline display → 卡死隐藏（一闪是协调器动画短暂覆盖的那帧）。
- **实现**：只有**浮动按钮**才在离开聊天室时隐藏——判定加 `&& !state.chatButtonDocked`。docked 按钮什么都不设。
- 代码：`src/integrations/bc-hooks.js` `DrawProcess` hook。

## 原则

docked 按钮：QiAct 对 `hidden` / `display` / `visibility` **一律不写**，全交给协调器。跟随收合＝协调器 opts；离场隐藏＝BC 会整体销毁 / 隐藏容器，无需插件干预。
