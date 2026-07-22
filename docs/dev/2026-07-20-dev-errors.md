# 开发错误总结与可复用知识点（2026-07-20）

> 范围：XSAct-QA（QuickInteraction）v1.0.7 → v1.0.8 开发周期中遇到的全部错误、根因与修复，并提炼可复用于其他 BC 插件/用户脚本场景的通用知识点。
> 当前状态：源码改动均已在本地 `quick-interaction.user.js`，**未提交、未发布**（v1.0.8 已发，fav 图标替换待定 v1.0.9）。

---

## 一、今日错误总结

### 1. CDP 反复注入 "already loaded" → modApi 降级空对象 → 面板不渲染（NO_LIST）

| 项 | 内容 |
|---|---|
| **现象** | 通过 CDP 反复 `addScriptTag` 注入脚本后，`bcModSdk` 报 "already loaded"，返回的 `modApi` 是空对象，插件面板完全不渲染。 |
| **根本原因** | `bcModSdk.registerMod({...})` 未传 `{ allowReplace: true }`。bcModSdk 源码逻辑：重复注册时只有 `a.allowReplace && i` 为真才允许替换并卸载旧实例（`u(a)`）。缺该标志 → 重复注册被拒 → 降级。 |
| **解决方式** | 改为 `bcModSdk.registerMod({ allowReplace: true })`。 |
| **验证** | 真实 BC 亚服页重注入后 `modApi` 正常、面板渲染。 |

---

### 2. `executeAction` 的 `ServerSend` 在 BC 未定义时抛错

| 项 | 内容 |
|---|---|
| **现象** | 某些时序下（如注入早期、`ServerSend` 尚未就绪）调用 `executeAction` 抛出 `ServerSend is not a function`。 |
| **根本原因** | 直接调用 `ServerSend(...)` 缺 `typeof` 守卫，BC 运行时未就绪即崩。 |
| **解决方式** | `ServerSend` 调用处加 `typeof ServerSend === 'function'` 守卫。 |
| **验证** | 注入早期冒烟不再抛错。 |

---

### 3. echo 导入动作「闻闻～」隐藏后仍显示

| 项 | 内容 |
|---|---|
| **现象** | 在「我的动作」里隐藏某 echo 动作后，该动作仍出现在右侧动作列表中。 |
| **根本原因** | echo 插件会**延迟注册**同一中文名的多个后缀变体（如 `笨蛋笨Luzi_uc09b0`）。导入时只按扫描到的**精确名**写入 `echoSuppressed`，迟到的变体名字不在集合内 → 漏网；且隐藏开关的 `change` 事件没有即时刷新当前打开的动作面板。 |
| **解决方式** | ① `caIsEchoSuppressed` 从精确匹配改为「精确名 + **中文前缀**」双兜底（名字以某条中文前缀开头即视为被屏蔽）；② 导入时把 `caExtractChinesePrefix(rawName/displayName)` 也写入 `echoSuppressed`；③ 隐藏开关 `change` 事件里在 `updateCustomActionPanel` 之后调用 `updateActionPanel(...)` 即时刷新。 |
| **验证** | `verify_echo_fix.js`：`isEchoSuppressed('笨蛋笨Luzi_uc09b0') → true`；实时页「闻闻～」已隐藏、列表无 `笨蛋笨Luzi_...` 原始名。 |

---

### 4. ⚠️ v1.0.7 动作显示混乱（最严重的一次回归）

| 项 | 内容 |
|---|---|
| **现象** | 用户反馈 "错误更严重了，动作显示完全混乱"——BC 原生动作菜单 + 插件面板都残缺/错乱。 |
| **根本原因（两个致命点）** | ① **物理改写 BC 全局数组**：`caRemoveSuppressedEchoActivities` 对 `AssetAllActivities(fam)` / `ActivityFemale3DCGOrdering` 直接 `splice`，把动作从 BC 注册表物理删除。② **过激前缀匹配**：`caIsEchoSuppressed` 的前缀匹配范围是整个 `echoSuppressed` 集合（含非前缀条目），`n.indexOf(s)===0` 会把任何以短中文前缀（如「笨蛋」）开头的动作都删掉，且同时作用在 `ActivityAllowedForGroup` hook 与 `getActionsForPart` 两处 → BC 原生英文/正常动作被过度过滤。 |
| **解决方式** | ① `caRemoveSuppressedEchoActivities` 改为**空函数（no-op）**，屏蔽改为纯内存过滤（`ActivityAllowedForGroup` hook + `getActionsForPart` 双重兜底，绝不碰全局数组）；② `caIsEchoSuppressed` 改为**「安全作用域前缀」**：仅当 `name` 的中文前缀以 `state.echoPrefixes`（只收集已导入 echo 动作的中文显示名前缀）中某条开头、且 `name` 非 `XSQAct_` 时才屏蔽；BC 原生动作 Name 多为英文 → `caExtractChinesePrefix` 返回空 → 不误伤；③ `getActionsForPart` 由 `state.echoSuppressed.has(a.Name)` 改为 `caIsEchoSuppressed(a.Name)`，与 hook 一致。 |
| **验证** | 干净页注入后：`globalActCountAfter: 435`（基线 406，**只增不减**，+29 来自自定义动作注册，无任何正常动作被误删）；`suppress_bcNative('Kiss'/'Slap'): false`；`hiddenLeakGroups: []`（隐藏不再泄漏）；`domWatermark: 0`。 |

> **教训（高优先级）**：BC 这类全局单页应用的「全局活动数组 / 字典 / 渲染循环」属于共享基础设施，**任何插件都不应 splice/改写**，一律用 hook 或内存过滤做"视图层屏蔽"。

---

### 5. 我的动作开关切换后跳转动作面板 + 按钮尺寸异常

| 项 | 内容 |
|---|---|
| **现象** | 在「我的动作」开关界面切换某个动作显示/隐藏后，面板自动跳到「动作」界面，且动作按钮尺寸异常（纵向全宽、变形）。 |
| **根本原因** | `updateCustomActionPanel` 的开关 `change` 事件里，为了"即时刷新右侧动作面板"额外调用了 `updateActionPanel`，而当时 `state.panelMode === 'custom'`，`updateActionPanel` 把动作按钮渲染进了带 `xsact-custom-mode` 的 flex 容器 → 覆盖掉自定义列表，造成"跳转"和"按钮变形"。 |
| **解决方式** | ① 移除开关事件里的 `updateActionPanel` 调用，只 `updateCustomActionPanel(charObj)` 重渲染当前列表；② `updateActionPanel` 入口加守卫 `if (state.panelMode !== 'part') return;`；③ `importCustomFromEcho` 改 `updateCustomActionPanel(state.selectedTarget)`；④ `refreshPanelState` 增加 `custom` 分支；⑤ `toggleFavoriteAction` 兜底只在 `part` 模式重绘。 |
| **验证** | `verify_toggle3.js`：切换开关前后 `panelMode` 均为 `custom`、标题不变、`hasCaView: true`、`actionBtnCount: 0`；切回「动作」tab 后 `actionBtnCount: 12` 正常。 |

> **教训**：面板存在 `custom / combo / part` 三种模式，应各自治、互不跨调。`updateActionPanel` 必须对自己的调用方模式负责（入口守卫）。

---

### 6. 组合/我的动作 标签点击需前置依赖人物/部位

| 项 | 内容 |
|---|---|
| **现象** | 点击「组合动作」「我的动作」标签不展开内容，必须先在人物浮层选人（通常还要选部位）才显示。 |
| **根本原因** | `renderPanel()` 在 `if (!state.selectedTarget) return`，combo/custom 也被这个 early-return 挡住；且初始化模式白名单 `^(part\|combo)$` 漏了 `custom`，恢复「我的动作」模式会被强制回退到「动作」。 |
| **解决方式** | ① `renderPanel()` 重构：custom/combo 模式优先于 `!selectedTarget` 判定，直接 `updateCustomActionPanel/updateComboPanel`（charObj 可为 null）；「动作」模式才保留阻塞空态；② 无目标时标题显示干净文本；③ `refreshPanelState` 移除 custom/combo 对 selectedTarget 的硬依赖；④ 初始化白名单补 `custom`；⑤ 组合执行按钮无目标时给友好提示。 |
| **验证** | `xsact_tab_independent_test.js`：custom/combo 无选中目标也能正常展开，part（对照）仍正确显示阻塞空态。 |

---

### 7. echo 导入动作 `XSAct_埋怀里` 接收方显示 MISSING TEXT

| 项 | 内容 |
|---|---|
| **现象** | 点击使用 echo 导入的「埋怀里」后，发送方本地正常（`"…把脑袋埋在𝐓𝐀𝐎 𝑀𝒰𝒮𝔼的怀里."`），接收方显示 `(MISSING TEXT IN "ActivityDictionary.csv": ChatOther-ItemBreast-XSAct_埋怀里)`。 |
| **根本原因** | ① 用户实际点击的是 **echo 原始 Activity `XSAct_埋怀里`**（被 suppress 后仍可能出现在 BC 原生动作列表/第三方面板），不是本插件生成的 `XSQAct_` 自定义动作。② 原 `makeActivityPacket` 把 `XSAct_` 前缀统一强制走标准 `Activity` 包——发送方本地有 echo 字典故正常，接收方没有 → MISSING。③ `caResolveEchoNames` 对「含英文前缀+中文」的名字（如 `XSAct_埋怀里`）原判断「含中文即显示名」会误判 rawName/displayName，影响 echo 原始名的屏蔽持久化。 |
| **解决方式** | ① `makeActivityPacket` 增加 `isEchoSuppressed` 判断：已被 suppress 的 echo 原始动作视为需 Action 兜底，不再发标准 `Activity` 包；`isForcedActivityMod` 改为 `LSCG_\|Liko_` 或 `XSAct_` 且**未被 suppress**，避免误伤小酥/LSCG/Liko 的真实 hook 依赖；② Action 兜底 sentence 替换同时处理 `{SourceCharacter}`/`{TargetCharacter}` 花括号与裸占位符，兼容 echo 模板；③ `caResolveEchoNames` 改用「原始 Activity Name 度」评分（含下划线/英文开头加分，纯中文减分），正确区分 rawName/displayName。 |
| **验证** | `xsact_echo_packet_test.js` 5/5、`xsact_echo_resolve_test.js` 4/4、实时冒烟通过。 |

> **教训**：跨客户端发包是 BC 插件的高频雷区。原则见下方知识点 B.5。

---

### 8. tooltip 测试 CDP 早期 2 FAIL / 实时冒烟 [5] 偶发 FAIL

| 项 | 内容 |
|---|---|
| **现象** | tooltip 隔离单测早前 2 FAIL；实时冒烟第 5 项（hover 显示双行 tooltip）偶发 FAIL。 |
| **根本原因** | **纯属测试设施问题，非产品回归**：① CDP 新建的 `about:blank` 页被 Chrome 视为**隐藏页**，`setTimeout`（120ms tooltip 延迟）被节流到 ≥1s，固定 `sleep` 测不到；② 合成 DOM 事件 + 固定 sleep 不可靠；③ 真实 BC 页重注入被"已加载跳过" guard 挡住；④ 面板重渲染 / 坐标漂移 / 注入时序导致偶发失焦。 |
| **解决方式** | tooltip 隔离单测改为**直接同步调用内部 `show/hide`**（字符串注入暴露 `window.__tt`），消除定时器依赖；实时冒烟改「前台页派发 `mouseover` + 轮询可见性 + 重试 3 次」。 |
| **验证** | 确定性单测 6/6（证明逻辑正确），实时冒烟稳定 3/3。 |

> **关键学习**：依赖 `setTimeout` 的 UI 行为在单测中必须用「直接调内部函数」或「前台页 + 轮询」验证，固定 sleep 不可靠。

---

### 9. probe 脚本运算符优先级 bug

| 项 | 内容 |
|---|---|
| **现象** | 探测脚本里 `if (!!window.__QiAct.state)` 始终得到错误结果。 |
| **根本原因** | `!!`（逻辑非）优先级高于 `&&`（逻辑与），`!!window.__QiAct.state` 实际被解析为 `(!!window.__QiAct).state` 而非 `!!(window.__QiAct && window.__QiAct.state)`，当 `__QiAct` 存在但 `state` 未就绪时误判。 |
| **解决方式** | 显式加括号：`!!(window.__QiAct && window.__QiAct.state)`。 |
| **验证** | 探测返回正确真值。 |

> **通用坑**：JS 中 `!`/`!!` 优先级高于 `&&`/`||`，凡是「存在性判断 + 属性访问」务必加括号。

---

### 10. CDP 重注入被"已加载跳过" guard 挡住

| 项 | 内容 |
|---|---|
| **现象** | 修改源码后通过 CDP 重新注入真实 BC 页，新改动完全不生效，像是没注入。 |
| **根本原因** | 脚本头部有 `if (window.__QiAct_Loaded__) { return; }` 这类重载 guard，整段脚本在已加载状态下直接 return，新源码不会执行。 |
| **解决方式** | 重注入前必须同时重置三个 guard：`delete window.__QiAct; window.__qiactTooltipReady = false; window.__QiAct_Loaded__ = false;`（tooltip 另有 `__qiactTooltipReady` 守卫）。 |
| **验证** | 重置后重注入，新改动（如 fav 图标）正确生效。 |

---

## 二、可复用知识点

### A. BC 插件 / 用户脚本开发通用

**A.1 mod 重载必须显式允许替换**
调用 `bcModSdk.registerMod` 时务必传 `{ allowReplace: true }`，否则在调试热重载 / CDP 反复注入场景下会被拒，导致 `modApi` 降级、面板不渲染。

**A.2 绝不物理改写 BC 全局共享数据结构**
`AssetAllActivities(fam)`、`ActivityFemale3DCGOrdering`、`ActivityDictionary`、渲染循环变量等都是全局单例。任何"屏蔽/过滤"都应做成 **hook 拦截 + 内存视图过滤**，绝不用 `splice` 改写全局数组。一旦物理删除，BC 原生菜单和所有依赖方都会残缺（见错误 4）。

**A.3 面板模式状态机要"各自治、互不跨调"**
多模式 UI（如 `custom / combo / part`）渲染函数必须：
- 入口守卫自身模式（`if (state.panelMode !== 'part') return;`），防止被其他模式误调用而覆盖界面；
- 任意刷新入口（开关 `change`、导入、刷新按钮、收藏 toggle）按 `state.panelMode` 分派到对应 `updateXxx` 函数，不要无差别调 `updateActionPanel`。

**A.4 echo 变体会延迟注册 → 用"中文前缀"兜底屏蔽**
echo 插件在导入后**异步**补全同一中文名的多个后缀变体（如 `笨蛋笨Luzi_uc09b0`）。只按精确名屏蔽会漏网。方案：屏蔽集合同时收录「中文显示名前缀」，判断时用"名字以某中文前缀开头"作为第二道网。注意前缀集合必须**仅来自已导入的 echo 动作中文名**，否则会误伤 BC 原生英文动作。

**A.5 跨客户端动作发包策略（高频雷区）**
- **标准 BC 活动**：保持 `Type:'Activity'`、`Content:'ChatOther-Group-Name'`，依赖 BC 全局字典。
- **mod / 第三方自定义动作**（名字含下划线，如 `LSCG_`/`Liko_`/`XSAct_`/`BCC_`/`XSQAct_`）或本地字典缺失时：改 `Type:'Chat'`，内容优先复用原翻译句子（替换 `{SourceCharacter}`/`{TargetCharacter}` 占位符），无翻译时回退可读名。**否则接收方没装对应 mod 就会看到 `MISSING TEXT`**（见错误 7）。
- 强制发 `Activity` 的判定要排除"已被 suppress 的 echo 原始动作"，避免误走标准包。

**A.6 自定义动作 / 原始动作前缀约定**
本插件：`XSQAct_` = 本插件自定义动作（走 Action 内嵌文本）；`XSAct_` = 小酥 / echo 原始拓展（可能需 suppress + Action 兜底）；`LSCG_`/`Liko_` 等第三方 hook 依赖标准 `Activity` 包，不要误改成 Chat。新增 Activity 一律加前缀避免撞名。

---

### B. 测试 / 调试方法论（CDP + puppeteer-core）

**B.1 about:blank / 隐藏页会被 Chrome 节流定时器**
CDP 新建或后台的页面，Chrome 会按"隐藏页"处理，`setTimeout` 被节流到 ≥1s。依赖定时的 UI（tooltip 延迟、动画）在隔离单测里**不要靠 `sleep`**，改为直接同步调用内部函数；真实页验证则先 `bringToFront` 或派发事件 + 轮询可见性。

**B.2 重注入前必须重置全部重载 guard**
真实页热重载调试时，同时清除 `window.__QiAct` / `window.__qiactTooltipReady` / `window.__QiAct_Loaded__`（名称随插件而异），否则新代码因"已加载跳过"整段不执行。

**B.3 运算符优先级：存在性 + 属性访问务必加括号**
`!!a.b`（解析为 `(!!a).b`）与 `!!(a && a.b)` 语义不同。凡是"对象可能存在 + 取属性"的判断，统一写成 `!!(obj && obj.prop)`。

**B.4 确定性单测优先于 UI 端到端测试**
对纯逻辑（发包类型判定、名字解析、屏蔽匹配、模式分派），写成"直接调内部函数 + 断言返回值"的确定性单测，速度更快、结论更硬；UI 行为（渲染、hover）用真实页冒烟做补充，且要容忍环境抖动（重试 + 轮询）。

**B.5 调试 API 要可探测**
把内部状态/函数暴露到 `window.__QiAct`（如 `isEchoSuppressed` / `state` / `caDetectSource` / `getCustomActions`），测试与实时排错直接调用，避免反复解析 DOM。

---

### C. 工程与发布纪律

**C.1 版本检测 ≠ 公告**
- `version.json` 的版本号变化 → 脚本端轮询（每 5 分钟）弹「更新可用」横幅，这是**版本检测**，任何发版都会触发，用户点一下即更新。
- `version.json` 里的 `announcement` 字段 → 独立「公告」横幅，版本号不变也能推。
- 用户说"不要公告"= 省略 `announcement` 字段，但"更新可用"横幅照常（属版本检测，非公告）。

**C.2 发布前必须全回归（4 层）**
依赖/破坏性分析 → 隔离单测（逻辑）→ 真实页冒烟（集成）→ 代码审查。**任何发现先暂停报告，确认无影响再 push**。本周期 4 层全绿才发 v1.0.8。

**C.3 发版纪律**
- 用户「确认发布」前**不 push** 公开仓库、不触发 Pages、不建 GitHub Release。
- 单一版本源：`@version` 与 `VERSION` 常量同步。
- `assets/` 本地被 `.gitignore` 忽略；Pages 由 `.github/workflows/deploy.yml` 在 push 到 `main` 时 `node build.mjs` 重建发布，日常只需提交 `quick-interaction.user.js`。
- GitHub Release 属公告类产物，用户"不要公告"时可跳过。

**C.4 调试代码必须清理**
所有 `console.log` / 调试探针在验证通过后移除或收口，遵守"生产代码禁止 `console.log`、禁止空 `catch`"的质量红线。

---

## 三、一句话速查（给未来的自己）

- mod 注册加 `allowReplace`；热重载先清三个 guard。
- 全局数组只 hook 不 splice；屏蔽用内存过滤 + 安全前缀。
- 面板三模式各自治，`updateActionPanel` 入口判 `panelMode`。
- 第三方动作跨客户端用 `Type:'Chat'` + 内嵌翻译，别发裸 `Activity`。
- 定时器 UI 别靠 `sleep` 测，直接调内部函数。
- `!!a.b` 是坑，写 `!!(a && a.b)`。
- 发版前 4 层回归全绿，确认发布才 push。
