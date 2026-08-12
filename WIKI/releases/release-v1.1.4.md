# QiAct v1.1.4 发布说明

**日期**：2026-07-21
**类型**：兼容性修复（BCX 告警消除）

## 本次修复

### 1. 消除 BCX 兼容性检查器误报
- **问题**：BCX（Bondage Club Extended）的兼容性检查器弹出 `Unknown mod not using ModSDK`，提示 `Overwritten functions: ActivityDictionaryText`。
- **原因**：自定义动作注册时直接赋值覆盖了 BC 全局函数 `window.ActivityDictionaryText`，被 BCX 扫描为「未通过 ModSDK 的未知 mod」。
- **修复**：移除直接 monkey patch，改为复用 `src/02-action-a.js` 中既有的 `patchActivityDictionaryText()`（内部优先使用 `state.modApi.hookFunction('ActivityDictionaryText', 0, ...)`）。自定义动作仅写入 R130+ 字典 cache 与全局 `ActivityDictionary` 数组，由 SDK 钩子统一兜底。BCX 不再误报，且对其他依赖该函数的 mod 更友好。

### 2. 自定义动作 MISSING TEXT（随版合入）
- 自定义动作注册 Activity 时同步写入 `Label-ChatOther / Label-ChatSelf / ChatOther / ChatSelf` 字典翻译（含 R130+ `loader.cache` 与 SDK 钩子兜底），杜绝原生活动面板显示 `MISSING TEXT`。

## 影响范围
- 仅改动自定义动作字典注册路径，未触及面板渲染、动作执行、发包逻辑等核心功能。
- v1.1.1 已实机验收的核心代码路径保持不变。
- 书签与油猴两种安装方式均受益（共用同一份 `assets/main.js`）。

## 验证
- `node build.mjs` 构建通过；`node --check` 语法检查通过。
- 构建产物中 `window.ActivityDictionaryText = function(...)` 仅剩 1 处（位于 `ModSDK hook 完全不可用` 的降级路径，正常用户不会触发）。

## 升级建议
所有 v1.1.3 及更早版本用户建议更新。更新后 BCX 兼容性弹窗消失，自定义动作在原生面板不再 MISSING。
