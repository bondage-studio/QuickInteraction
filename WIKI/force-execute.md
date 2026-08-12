# 强制可用 / 强制执行动作

## 需求

个别 echo 动作（`echo-activity-ext`）带**运行期前置条件**——需要先有道具、或必须处于 / 不处于某状态（如「贴贴」）才允许。BC 判定不满足 → 动作既不显示、点了也报「該動作目前不可用或對方禁用該動作」。

需求是让这些动作**总是显示、且总能发出**，无视前置条件。当前白名单：

| 动作 | 方向 | echo 条件 |
|---|---|---|
| 流出液體 / 失禁 | 对自己 | 需道具 |
| 鑽進懷裡 / 抱入懷中 | 对他人 | 需「贴贴」道具资产存在 |
| 躺上去 | 对他人 | 需床类道具 |

## 为什么单纯过滤挡不住

- **显示端**默认门控走 `ActivityAllowedForGroup`（见 [动作可用性过滤](action-availability.md)），它内部已按 `Prerequisite` 把这些动作剔除；一旦 `方案 A` 非空，`方案 B/C` 兜底不执行，动作**根本进不了候选列表**——在过滤器里加例外没用，因为过滤器压根看不到它。
- **执行端** `executeAction → resolveAllowedActivity` 同样基于 `ActivityAllowedForGroup`，返回 `null` 即报「不可用」。
- echo/sugarch 原始动作名可能是纯中文（`躺上去`）或带前后缀，**没有** `QiAct_` 自定义记录，靠 `caFindByActivityName` 解析不到显示名。

## 实现方法（三处）

### 1. 白名单 + 名称解析　`src/features/custom-actions/registry.js`

```js
var FORCE_AVAILABLE_ACTION_NAMES = ['流出液體','流出液体','失禁','鑽進懷裡','钻进怀里','抱入懷中','抱入怀中','躺上去'];
```

`isForceAvailableActivity(activityName, displayName)`：多来源解析显示名——传入的 `displayName`、导入自定义动作的 `name`、字典标签 `getActivityLabelFallback`、原始活动名（可能内嵌中文）——任一**子串命中**白名单即判为强制可用。收录简繁两种写法（echo 用简体）。

> 新增动作：把显示名（简体即可，繁体可选）追加进 `FORCE_AVAILABLE_ACTION_NAMES`。名字以 echo 源码 `Name:` 字段为准（`echo-activity-ext/src/components/**`）。

### 2. 注入候选（显示端）　`src/features/actions/action-catalog.js`

`getActionsForPart` 在取数后，扫描 `caRawAllActivities()`（含 echo 原始 + 已导入 `QiAct_` 副本），对命中白名单、且**方向匹配**（对自己看 `TargetSelf`、对他人看 `Target`）、部位属当前部位族的动作，直接 `actions.push(...)` 注入候选。随后过滤器里 `isForceAvailableActivity(...) || actionExecutable(...)` 放行。

### 3. 强制执行（执行端）　`src/features/actions/activity-execution.js`

```js
var resolved = resolveAllowedActivity(charObj, group, name);
if (!resolved) {
    var _disp = getActivityLabelFallback(name, group);
    if (!isForceAvailableActivity(name, _disp)) { toast('unavailable'); return false; }
} // else 用 resolved 的 group/Item
// 继续 makeActivityPacket → ActivityRun 本地副作用 → ServerSend
```

`resolveAllowedActivity` 返回 `null` 时，若命中白名单则**跳过**「不可用」提示，按当前部位强制发包。`makeActivityPacket` 不会返回 `null`（无字典就走 Action 文本兜底），故一定能发出。

## 边界

强制只保证 **QiAct 侧不再拦截、且把动作发上线**。echo 自己的 `run` 处理器仍会做**它自己**的运行期检查（`躺上去` 查床、`钻进怀里`/`抱入懷中` 查「贴贴」资产）。若 echo 的 `run` 因真实道具/状态缺失而空转，消息照发但 echo 的视觉效果可能不生效——那属于 echo 服务端 hook 的逻辑，QiAct 不去侵入覆盖（否则脆弱且易随 echo 更新失效）。
