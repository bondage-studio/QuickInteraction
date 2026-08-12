# BC 插件 / 用户脚本通用坑

按「问题 → 根因 → 实现方法」记录，适用于所有 BC 相关 Tampermonkey 脚本。

## 1. mod 重复注册被拒 → modApi 降级 → 面板不渲染

- **问题**：热重载 / 反复注入后 `bcModSdk` 报 "already loaded"，`modApi` 变空对象，界面完全不渲染。
- **根因**：`registerMod` 未传 `allowReplace`，bcModSdk 只有 `allowReplace && 已存在` 时才卸载旧实例并替换。
- **实现**：`bcModSdk.registerMod({ allowReplace: true })`。热重载调试时还须先清全部重载 guard（`delete window.__QiAct; window.__qiactTooltipReady = false; window.__QiAct_Loaded__ = false;`），否则脚本头部 `if (loaded) return` 会让新代码整段不执行。

## 2. 绝不物理改写 BC 全局共享数据

- **问题**：对 echo 原始动作做「屏蔽」时 `splice` 了 `AssetAllActivities(fam)` / `ActivityFemale3DCGOrdering`，导致 BC 原生菜单和所有依赖方动作残缺、错乱。
- **根因**：这些全局数组是单页应用的共享基础设施，任何插件物理删除都会波及全体。
- **实现**：屏蔽一律做成**视图层过滤**——`hookFunction('ActivityAllowedForGroup'/'AssetAllActivities', 0, ...)` 返回过滤后的**副本**，绝不改原数组。插件内部需要枚举/注册时走 `caRawAllActivities`（读未过滤的原始数组），避免读到自己 hook 后的副本导致 push/splice 落空。

## 3. 屏蔽用「安全作用域前缀」，别用宽前缀

- **问题**：echo 会**异步**补注册同一中文名的多个后缀变体（`笨蛋笨Luzi_uc09b0`），只按精确名屏蔽会漏网；但改成宽前缀匹配又会把 BC 原生动作（`Kiss`/`Slap`）误删。
- **实现**：屏蔽集合只收录**已导入 echo 动作的中文显示名前缀**；判断时「名字以某中文前缀开头 且 非本插件 `QiAct_` 前缀」才屏蔽。BC 原生动作名多为英文 → 提取中文前缀为空 → 不误伤。

## 4. 面板多模式「各自治、互不跨调」

- **问题**：`custom` 模式下切换开关后误调 `updateActionPanel`，把动作按钮渲染进自定义容器 → 跳转 + 按钮变形；combo/custom 标签被 `if (!selectedTarget) return` 挡住不展开。
- **实现**：`part / combo / custom` 各有 `updateXxx`；`updateActionPanel` 入口守卫 `if (state.panelMode !== 'part') return;`；任意刷新入口（开关 change / 导入 / 刷新 / 收藏 toggle）按 `panelMode` 分派；`renderPanel` 让 custom/combo 优先于 `!selectedTarget` 判定（charObj 可为 null）。

## 5. 跨客户端发包策略（高频雷区）

- **问题**：使用第三方 / echo 动作后，发送方本地正常，接收方显示 `MISSING TEXT IN "ActivityDictionary.csv"`。
- **根因**：发了标准 `Type:'Activity'` 包，依赖 BC 全局字典；接收方没装对应 mod 就查不到词条。
- **实现**：
  - 标准 BC 活动 → 保持 `Type:'Activity'` + `Content:'ChatOther-Group-Name'`。
  - mod / 自定义动作（名字含下划线：`LSCG_`/`Liko_`/`XSAct_`/`QiAct_` 等）或本地字典缺失 → 改 `Type:'Chat'`，复用原翻译句子并替换 `{SourceCharacter}`/`{TargetCharacter}`（同时兼容裸占位符），无翻译回退可读名。
  - 「强制发 Activity」的判定要排除**已被 suppress 的 echo 原始动作**。

## 6. 前缀约定

- `QiAct_` = 本插件自定义动作（走 Action 内嵌文本）。
- `XSAct_` = 小酥 / echo 原始拓展（可能需 suppress + Action 兜底）。
- `LSCG_`/`Liko_` = 第三方 hook 依赖，必须走标准 `Activity` 包，别改 Chat。
- 新增 Activity 一律加前缀，避免撞名。

## 7. JS 运算符优先级坑

- `!!a.b` 会被解析成 `(!!a).b`，与 `!!(a && a.b)` 语义不同。凡「对象可能不存在 + 取属性」一律写 `!!(obj && obj.prop)`。
