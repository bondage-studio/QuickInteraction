# QiAct v1.3.1 发布说明

> 发布日期：2026-08-04 · 类型：功能清理 + 部署修复

## 本次变更

### 1. 移除「扩展设置」入口
- 删除了 BC 扩展设置界面里注册的「快速动作」按钮及其子页（`src/19-tooltip-hooks.js` 的 `registerSettings()` 与 `src/21-init.js` 的调用）。
- 该子页此前只是一个**不含任何实际功能的空白占位页**（标题 + 两个按钮），真正的所有操作都在聊天室主界面的「动作模式」切换按钮里。移除后**无任何功能损失**，界面也更干净。

### 2. 修复更新检测 / 书签仍指向旧仓库（部署遗留 bug）
- 仓库早已迁入 `bondage-studio/QuickInteraction` 组织，但以下两处仍硬编码旧仓库 `heitaoplay` 地址，导致：
  - 玩家端的「检查更新 / 公告」轮询会去旧仓库找 `version.json`，**永远收不到新版本提示与公告**；
  - 书签安装的加载器会去旧仓库拉 `assets/main.js`，旧仓库被删除后将直接失效。
- 本次统一修正：
  - `src/20-update.js` 的 `VERSION_INFO_URL` → `bondage-studio.github.io/QuickInteraction/version.json`
  - `loader.user.js` 的加载地址 → `bondage-studio.github.io/QuickInteraction/assets/main.js`
  - `build.mjs` 的 `detailsUrl` 兜底地址 → `bondage-studio` 组织（顺手修正，避免未来缺失时回退到旧仓库）

### 3. 版本号
- 三处版本源（`src/01-entry.js` 的 `const VERSION`、构建注入的 `@version`、`version.json`）统一升到 **1.3.1**。

## 验证结果

- `node build.mjs` 构建通过；`node --check` 语法校验通过。
- 全局 grep `PreferenceRegisterExtensionSetting` / `registerSettings` / `设置页面注册` 已无任何残留（仅聊天室主 UI 的「快速动作模式」按钮标题文案属正常功能）。
- 浏览器内存验证：删除 `PreferenceExtensionsSettings['QiAct']` 注册键后确已消失，聊天室主界面不受影响。
- `heitaoplay` 旧地址在源码与构建产物中已全部清除（仅历史 `docs/release-v1.1.x.md` 等旧文档保留当时记录，不改动）。

## 升级提示
- **油猴用户**：刷新 Bondage Club 页面即自动更新；或在脚本端 5 分钟轮询周期内收到更新 / 公告横幅。
- **书签用户**：重新从 README「书签安装」章节创建书签（已指向新仓库地址）。
- **重复加载提醒**：若同时装过完整版 `quick-interaction.user.js`，建议先在油猴里删除其一，避免重复初始化。

## 反馈渠道
- GitHub Issues：https://github.com/bondage-studio/QuickInteraction/issues
- 游戏内或通过书签安装的聊天窗入口反馈
