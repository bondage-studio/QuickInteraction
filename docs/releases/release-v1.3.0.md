# QiAct v1.3.0 发布说明

> 发布日期：2026-07-22 · 类型：功能新增 + 体验优化 + 技术债清理

## 本次变更

### 1. 内置「小酥动作包」（方案 B：预编译进插件）
- **做法**：把 XiaoSuActivity（小酥动作拓展）全部 **51 个动作** 预编译进 QiAct 内部（生成器 `tools/build-xiaosu-pack.mjs` → `src/20-xiaosu-pack.js` 的 `XIAOSU_PACKED`），随插件一起加载，**离线可用、无需安装原版小酥插件**。
- **收益**：对原版小酥插件停更、Web Worker 加载故障、CDP 慢热注册等上游问题**完全免疫**——无论对方装没装原版，动作都能正常显示与执行。
- **一键开关**：「我的动作」面板提供极简开关，默认开启；关闭后从列表与 BC 原生动作菜单中彻底移除。开关状态跨刷新持久化（`S_XIAOSU_PACK`）。
- **取消旧功能**：移除此前规划的「从小酥克隆」「拓展动作导入」相关界面与逻辑（克隆/导入/检测功能全部删除）。

### 2. 「我的动作」分类筛选 chip
- 面板顶部新增 **全部 / 小酥 / 我的 / echo** 四个分类按钮，一键按来源过滤动作列表，**编辑模式同样可用**。
- 每个按钮实时显示该分类数量；**空分类自动置灰且不可点**。
- 选择持久化（`S_CA_FILTER`），刷新后保持。
- 渲染按 filter 过滤，**不改动 `customActions` 内部顺序**。

### 3. 来源徽章改色 + 极简开关门控
- 「小酥」动作来源徽章改为 **玫红色**（此前是 QiAct 紫色），与「我的」（紫）/「echo」（黄）一眼可辨。
- 「内置小酥动作包」开关改为 **单行极简**（仅标题 + 紧凑开关，长描述走 `title` 悬停提示），并 **仅在「小酥」chip 下显示**——其他分类隐藏，避免视觉干扰与「我的」tab 下开关位置漂移。

### 4. 统一删除确认模态
- 新增 `qiactConfirm({title, body, confirmText, cancelText, danger}) → Promise<bool>`，统一 **暗色 + 玫红描边 + 毛玻璃遮罩** 风格。
- 替换原先散落的 6 处原生 `confirm()`（单删 / 批删 / echo 清理 / 收藏清空等），并捕获阶段监听 `Esc` / `Enter` 绕开 BC 的 keydown 拦截，体验一致。

### 5. 技术债收口：空 catch 不再静默吞错
- 新增 debug 态节流日志的 `silent(e, ctx)` 辅助（位于 `src/01-entry.js`，与 `logD` / `reportHookError` 同族）。
- 将 v1.1.1 之后开发期新渗回的 **10 处空 `catch (e) {}` / `catch (_) {}`**（涉及自定义动作字典读写、echo 残留清理、caFilter 持久化与重渲染、replaceCustomActions 反注册等）统一替换为 `silent()` 调用。
- **效果**：满足「禁空 catch / 禁静默吞错」红线，且生产环境 `DEBUG=false` 时零 console 输出，不污染用户控制台；排障时临时 `DEBUG=true` 即可恢复上下文日志（单会话每上下文最多 3 条，节流）。

## 验证结果

- `node build.mjs` 构建通过；`node --check` 语法校验通过。
- 构建产物 `quick-interaction.user.js` ≈ 363 KB，模块数 23。
- 实机 CDP 三测试 **66/66 通过**（不 reload 保登录态、自给数据 + 收尾清理）：
  - `qiact_pack_test` 22/22（含 5 个 chip→toggle 显隐用例：仅「小酥」tab 显示开关）
  - `qiact_chip_test` 17/17
  - `qiact_modal_test` 27/27

## 升级提示
- **油猴用户**：刷新 Bondage Club 页面即自动更新；或在脚本端 5 分钟轮询周期内收到更新/公告横幅。
- **书签 / 控制台用户**：按 README「书签安装」章节重新创建（已带加载反馈与前提说明）。
- **重复加载提醒**：若同时装过完整版 `quick-interaction.user.js`，建议先在油猴里删除其一，避免重复初始化。
- **小酥包说明**：默认开启；如不需要，进「我的动作」切到「小酥」分类，关掉顶部开关即可。

## 反馈渠道
- GitHub Issues：https://github.com/bondage-studio/QuickInteraction/issues
- 游戏内或通过书签安装的聊天窗入口反馈
