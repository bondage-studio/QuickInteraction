# 团队 JavaScript / Userscript 代码规范

> 适用范围：BC 相关 Tampermonkey 脚本及团队所有前端 JS 项目。
> 本规范基于 快捷互动 (QiAct) v0.5.9 真实审查结论制定，可直接落地。
> 规范用词：`必须` = 强制；`禁止` = 不允许；`建议` = 推荐。

---

## 1. 命名规范

- **变量/函数**：小驼峰 `camelCase`；布尔用 `is/has/can` 前缀（`isActive`、`hasActivityLabel`）。
- **常量**：全大写下划线 `UPPER_SNAKE`（`MAX_RETRY`、`THEME_ACCENT`）。
- **存储键**：统一前缀 + 语义，如 `xsact_qa_self_mode`；**禁止**零散字符串字面量直接 `localStorage.getItem('xxx')`，必须走 `S_*` 常量。
- **函数名**：动词开头、表意完整（`getActionsForPart` 而非 `getActs`）；事件回调用 `onXxx`（`onMove`、`onUp`）。

## 2. 文件与模块结构

- **单文件上限 600 行**；超过必须按职责拆分（UI / 协议 / 状态 / 存储 / 渲染）。
- **一个脚本一个清晰入口**：IIFE 内先用 `/* ===== 区块 ===== */` 分段，区块顺序固定：常量 → 状态 → 存储 → 业务 → UI → 启动。
- **禁止**把 300 行 CSS 字符串（`injectStyles`）和业务混写；建议抽到独立 `styles.js` 或模板。

## 3. 状态管理

- **禁止**散落 20+ 个全局 `let`。统一用单一 state 对象：
  ```js
  const state = {
    isActive: false, panelMode: 'part',
    allMode: false, favMode: false, selfMode: false,
    selectedTarget: null, selectedPart: null,
  };
  function setMode(key, val) { state[key] = val; renderToggle(key); }
  ```
- 所有 toggle 视觉更新**必须**走统一 `renderToggle(key)`，禁止为每个开关复制一份 `updateXxxVisual`。

## 4. 错误处理（重点）

- **禁止**空 `catch(_){}`。捕获后必须三选一：① 恢复并 `console.error`；② 降级并明确返回失败；③ 上报用户（toast）。
- 存储层失败**必须** `console.error` 且至少提示用户一次，禁止静默。
- 预校验（如动作可用性）失败**必须**告知用户「该动作当前不可用」，禁止默默跳过导致功能悄悄变弱。
- 还原类操作（如临时改 `FocusGroup` 后还原）**必须**放在 `finally`，防止异常路径遗漏还原。

## 5. 日志规范

- 引入 `const DEBUG = false;` + 封装：
  ```js
  function logD(...a){ if (DEBUG) console.log('[QiAct]', ...a); }
  ```
- **生产代码禁止** `console.log` 调试输出；仅保留 `console.warn/error` 用于真实异常。
- 日志统一前缀 `[模块名]`，方便过滤。
- 发布构建**必须**剥离 `console.log`（用 lint 或打包脚本扫 `logD` 已被 DEBUG 关掉）。

## 6. 常量与配置

- 颜色、延迟、魔法字符串**必须**抽到 `THEME` / `CONFIG` 对象，禁止散落字面量：
  ```js
  const THEME = { accent: '#FF5C7A', danger: '#FF5C5C', muted: '#888888' };
  const CONFIG = { broadcastDelay: 120, comboStepDelay: 160 };
  ```
- 字典键前缀（`'ChatSelf-'` / `'ChatOther-'` / `'Label-ChatOther-'`）**必须**定义为常量，禁止多处拼接字符串。

## 7. 重复代码与抽象（DRY）

- 同一判断出现 ≥ 2 次（如 `'[STRING_RETRIEVAL_FAILED]'`、`'MISSING'`、`'XSAct_'` 前缀）**必须**抽成函数/常量。
- 职责重叠的多个函数（如标签查询四件套）**必须**合并为单一模块，内部集中判断逻辑。
- 近同的三个以上函数（如 `updateXxxVisual`）**必须**参数化合并。

## 8. 注释规范

- 注释写「为什么 / 边界 / 坑」，**禁止**写「是什么」（代码自解释）。
- **禁止**补丁式长注释框（`// 方案 A… 方案 B…` 堆在函数里）。多次 hotfix 说明该逻辑需要抽模块，而非加注释。
- 对外 API / 非显然的 BC 内部依赖（如 `FocusGroup` 需手动补位）才写注释说明原因。

## 9. 版本与发布

- **禁止**版本号双维护（`@version` 与 `VERSION` 常量）。单一版本源，构建时注入。
- 发版前**必须** `node --check` 语法校验 + 过一遍 §13 审查清单。

## 10. 工程化与协作

- **目录结构（强制）**：
  ```
  src/       交付源码（进发布）
  dev/       调试探针 / 热注入脚本（不进发布，可丢弃）
  tests/     单元测试
  ```
- **禁止**把 `check_*.js` / `diag_*.js` / `verify_*.js` 丢在工作区根目录。
- **必须**引入 ESLint（规则：no-empty-catch、no-console 在生产、max-len）。
- **建议**一个简单的构建脚本：合并 `src/` → 单文件 userscript + 剥离调试日志 + 注入版本号。

## 11. 提交约定

- 一条提交只做一件事；信息用「动宾 + 原因」：`fix: 发包前补 FocusGroup 以支持 Prank 脱衣`。
- **禁止** `fix bug` / `update` 这类无意义提交信息。
- 提交前自测：核心路径跑通 + 无控制台报错。

## 12. 调试脚本纪律

- 临时探针**必须**放 `dev/`，文件名带日期或场景（`dev/diag_prank_0716.js`）。
- 确认修复后**必须**删除或归档，禁止长期混在交付目录。

## 13. 代码审查清单（PR 必检，资深开发把关）

- [ ] 无空 `catch(_){}`；所有异常可见或可降级
- [ ] 无 `console.log` 调试输出残留（生产）
- [ ] 状态走统一 state 对象，无新增散落全局变量
- [ ] 重复判断已抽常量/函数
- [ ] 魔法字符串/数字已抽 `THEME`/`CONFIG`
- [ ] 单文件未超 600 行（超则拆分）
- [ ] `node --check` 通过
- [ ] 核心逻辑（发包/状态切换）有测试或已真机验证
- [ ] 版本号单一源、与发布一致
- [ ] 调试脚本已归 `dev/` 或清理

---

> 资深开发工程师点评：规范的价值不在「写得多全」，而在「每次发版前真有人按 §13 过一遍」。建议把这份清单固化进团队的发布流程，技术能力才会真正沉淀。
