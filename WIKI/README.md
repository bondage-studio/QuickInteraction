# QiAct WIKI

快捷互动（QuickInteraction）的问题与实现方法索引。只记录**可能遇到的问题 + 落地实现**，不保留试错过程。

## 目录

| 页面 | 内容 |
|---|---|
| [BC 插件通用坑](bc-plugin-pitfalls.md) | mod 重载、全局数组、面板模式、跨客户端发包等 BC 用户脚本通用雷区与解法 |
| [动作可用性过滤](action-availability.md) | 动作列表必须与执行端同源；被束缚/禁用/缺道具时不显示不可用动作 |
| [强制可用 / 强制执行](force-execute.md) | 让指定 echo 动作无视前置条件始终显示且强制发出（白名单 + 注入 + 跳过校验） |
| [聊天室按钮显隐](chatroom-button.md) | 收纳（docked）按钮的显隐归 BC_ChatRoomButtons 协调器管，插件不得插手 |
| [Echo 动作整合](echo-integration.md) | echo 导入、原始动作屏蔽、前置条件保留、强制可用白名单 |
| [代码规范](code-standards.md) | 团队 JS / Userscript 代码规范 |
| [历史发版说明](releases/) | 各版本 release notes |

## 一句话速查

- mod 注册加 `allowReplace: true`；热重载先清全部 `__QiAct*` guard。
- BC 全局数组（`ActivityFemale3DCG` 等）只 hook 不 splice；屏蔽用内存过滤。
- 面板三模式（`part / combo / custom`）各自治，`updateActionPanel` 入口判 `panelMode`。
- 动作显示端与执行端同源判定（`ActivityAllowedForGroup`），别各自复刻规则。
- 第三方动作跨客户端用 `Type:'Chat'` + 内嵌翻译，别发裸 `Activity`（否则接收方 MISSING TEXT）。
- docked 按钮的 `hidden`/`display` 一律不碰，交给协调器。
