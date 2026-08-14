# QiAct v1.1.3 发布说明

> 发布日期：2026-07-21 · 严重性：普通

## 本次修复

### 1. 扩展组件设置页卡死（用户反馈：设置 - 扩展组件 - 快速动作 点进去网页直接死掉）
- **根因**：`registerSettings()` 注册的 `run()` 在 BC 主渲染循环里每帧被调用，但**没有任何错误保护**。一旦 `run()` 内部抛错（DrawButton 回调参数错位导致按钮无效、以及 `T.back` 等细节），异常会冒泡杀掉 BC 整个 `requestAnimationFrame` 渲染循环 → 画面冻结 = "网页死掉"。
- **修复**：
  - `run()` 整体包 `try/catch`：绘制异常被隔离，**绝不会再冻住整个游戏画面**（这条单独就能消除卡死症状）。
  - 修正 `DrawButton` 点击回调位置：从错误的 Tooltip 位（第8参）纠正到第9参，使"已开启/默认开启"切换与"返回"按钮真正可点。
  - 撤掉每帧 `MouseIn` 退出探测，改由按钮回调触发 `PreferenceExit`。

### 2. 蓝色公告横幅从未弹出（用户反馈：更新检查报错 S_LAST_ANNOUNCE_VER is not defined）
- **根因**：`20-update.js` 引用了常量 `S_LAST_ANNOUNCE_VER`，但 `01-entry.js` 的常量表**漏定义**该常量（只有 `S_LAST_ANNOUNCE`）。每次轮询 `checkUpdate()` 跑到该行即抛 `ReferenceError`，被一条措辞误导的 catch（`网络失败（离线/跨域）`）吞掉，导致**公告显示逻辑（含 `showAnnounceBanner`）永远执行不到**。
- **影响**：此前几次"已推送公告"，实则只把 `version.json` 部署到服务器，客户端蓝色公告横幅**从未真正弹出**（红色"版本更新"横幅不受影响，因其使用已正确定义的 `S_UPDATE_DISMISSED`）。
- **修复**：
  - 补定义 `const S_LAST_ANNOUNCE_VER = 'xsact_qa_last_announce_ver';`。
  - 修正 catch 文案，不再把脚本内部错误伪装成"网络失败"，便于排查。

### 3. 自定义动作 MISSING（此前已就绪，随本次一并发布）
- 注册 Activity 时同步写入 `Label-ChatOther / Label-ChatSelf / ChatOther / ChatSelf` 字典翻译，覆盖 R130+ 的 `ActivityDictionaryLoad().cache` 并补丁 `ActivityDictionaryText`，消除原生活动面板的 MISSING TEXT。

## 升级提示
- 油猴用户：刷新 BC 页面即自动更新（或等 5 分钟轮询弹更新横幅）。
- 书签/控制台用户：按 README 重新创建书签（带加载反馈）。
- 请勿同时安装完整版 `quick-interaction.user.js` 与书签版，避免重复加载。

## 反馈渠道
GitHub Issues：https://github.com/heitaoplay/QuickInteraction/issues
