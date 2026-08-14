# Echo 动作整合

用户可把 echo（回声 / echo-activity-ext）的自定义动作导入本插件，导入后以 `QiAct_` 前缀内建，并屏蔽 echo 原始同名动作，避免重复与跨客户端乱码。

## 1. 原始动作屏蔽会「漏网」

- **问题**：导入后隐藏某 echo 动作，它仍出现在动作列表。
- **根因**：echo **异步**补注册同一中文名的多个后缀变体（`XSAct_埋怀里` / `笨蛋笨Luzi_uc09b0`），只按精确名写入 `echoSuppressed` 会漏掉迟到的变体。
- **实现**：`caIsEchoSuppressed` 用「精确名 + 中文前缀」双兜底；导入时把中文显示名前缀也写入屏蔽集合；屏蔽只做**内存视图过滤**（`ActivityAllowedForGroup` / `AssetAllActivities` 双 hook），绝不 splice 全局数组。详见 [BC 插件通用坑 §2、§3](bc-plugin-pitfalls.md)。

## 2. 导入丢失前置条件 → 被束缚时该限制的动作照样显示

- **问题**：echo 的接触类动作（如「阴蒂」系列）被束缚时仍全部可用。
- **根因**：echo 原始动作是真正的 BC Activity、带 `UseHands` 等前置条件；但导入路径只读了 `Name/Target/Dialog`，`caBuildActivityDef` 又把 `Prerequisite` 硬编码成 `[]` → BC 判定「无前置条件 = 永远允许」。
- **实现**：
  - 导入时保留前置条件：`caResolveEchoPrerequisite(item, foundRawNames)` 优先取 echo 存档里的 `Prerequisite`，缺失则按真实注册名从现存活动定义查回，存进自定义动作的 `prerequisite`。
  - `caBuildActivityDef` 用 `act.prerequisite`（有则沿用，无则 `[]`）。
  - 代码：`src/features/custom-actions/import-export.js`、`registry.js`。
- **注意**：已导入的旧动作不带 `prerequisite`（默认 `[]`），需**重新导入**才恢复限制。

> 表情 / 姿态类（小酥包）动作本就无前置条件，`[]` 是正确的——别给它们强加束缚门槛。

## 3. 显示端最终仍以执行端为准

即便前置条件补齐，动作列表的最终门控仍走 `ActivityAllowedForGroup`（见 [动作可用性过滤](action-availability.md)）。前置条件保留只是让 `ActivityAllowedForGroup` 对导入动作的判定正确，两者互补。

## 4. 强制可用白名单

个别 echo 动作要无视判定始终可用，见 [动作可用性过滤 §强制可用白名单](action-availability.md)。
