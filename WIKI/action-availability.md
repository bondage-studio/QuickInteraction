# 动作可用性过滤

## 问题

被束缚 / 部位被封锁 / 对方在设置里禁用某活动 / 缺少所需道具时，动作面板仍显示这些动作；点击后报「該動作目前不可用或對方禁用該動作」。即**显示了却不能用**。

## 根因

显示端（`getActionsForPart`）曾用 `方案 A（ActivityAllowedForGroup）→ 方案 B/C（原始数组兜底）` 的取数逻辑；当 A 返回空（如 echo 自定义部位组）时落到 B/C，而 B/C 是**不过滤**的原始枚举。执行端（`executeAction → resolveAllowedActivity → findAllowedActivity → ActivityAllowedForGroup`）却是严格判定。两端不同源 → 显示 ≠ 可执行。

试图在显示端逐条复刻 BC 的判定（前置条件 / 权限 / 自我对他方向 / 源头封锁）会不断漏项——最后栽在 `Needs-道具` 类动作（如 `TickleItem`）。

## 实现方法

**显示端与执行端同源**：在 `getActionsForPart` 的最终过滤里用 `actionExecutable(name, group)` 门控，逻辑与执行端 `findAllowedActivity` 完全一致——动作必须出现在其部位族（`getPartGroupFamily`）某个候选组的 `ActivityAllowedForGroup(targetChar, g)` 结果里。

`ActivityAllowedForGroup` 内部已包含**全部**判定：前置条件（束缚 `UseHands`/`UseMouth`/`UseFeet` 等）、权限（`ActivityCheckPermissions`）、自我 / 对他方向（`ActivityHasValidTarget`）、`Needs-道具`展开、源头封锁（`ActivityPossibleOnGroup`：封闭 / 唤起禁用 / 房间封锁 / 区域因子 0）。因此**不要再各自复刻任何一条**。

护栏：`ActivityAllowedForGroup` 不可用（旧版 BC）或对自定义组返回非数组时放行，退回原数据源，避免面板整块空白。

- 代码：`src/features/actions/action-catalog.js`（`actionExecutable` / `allowedNamesFor`）。
- 关键点：**凡是「决定能做什么」的列表，都从「强制执行能做什么」的那个函数派生，别重新推导规则。**

## 强制可用白名单（例外）

个别 echo 动作（如「流出液體 / 失禁 / 鑽進懷裡 / 抱入懷中 / 躺上去 / 拉上床」）不符合 BC 的可用性判定，但希望始终显示且强制执行。完整实现见 [强制可用 / 强制执行](force-execute.md)。
