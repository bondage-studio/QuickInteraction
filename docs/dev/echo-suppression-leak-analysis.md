# Echo 原始动作屏蔽"漏网" + 自定义动作显示内部 ID 问题诊断

> 状态：基于用户截图（QQ_1784612715252 / QQ_1784612720501）分析，未实机验证。

---

## 1. 截图反映的界面是 BC 原生动作面板

截图特征：
- 顶部是一排动作 tab/按钮（如"捏脸"、"揉脸"、"手指抬下巴"、"笨蛋笨Luzi_mtkj72"、"XSQAct_gkrlub"）
- 下方是动作网格

这不是本插件 QuickInteraction 的自定义 UI（我们的"动作"面板用 `#xsact-action-list` 渲染，列表项调用 `getActivityLabel` 做过翻译回退）。截图更像是 **BC 原生动作选择浮层/面板**。

这意味着：本插件的 `ActivityAllowedForGroup` hook（19-tooltip-hooks.js:111）可能**没有覆盖到 BC 原生面板的读取路径**，导致 echo 原始 Activity 和未翻译的自定义动作名直接暴露。

---

## 2. 问题一：echo 原始动作"笨蛋笨Luzi_mtkj72"仍显示

### 2.1 当前屏蔽机制

屏蔽依赖三层：
1. `caRemoveSuppressedEchoActivities()`（05-custom-a.js:407）：**当前是空函数**。注释说"不再物理改写 BC 全局活动数组，改为纯内存过滤"。
2. `ActivityAllowedForGroup` hook（19-tooltip-hooks.js:111）：对返回值过滤 `caIsEchoSuppressed`。
3. `getActionsForPart` fallback 过滤（02-action-a.js:59）：同样过滤 `caIsEchoSuppressed`。

### 2.2 为什么漏网？

第 2、3 层都是"内存过滤"，只对经过 `ActivityAllowedForGroup` 或 `getActionsForPart` 的调用生效。**如果 BC 原生动作面板直接从 `AssetAllActivities()` 或 `ActivityFemale3DCGOrdering` 数组读取并渲染**，这两层过滤就绕过去了。

 echo 原始 Activity（如 `笨蛋笨Luzi_mtkj72`）是 echo 插件在启动时注册进 `AssetAllActivities` 的真实 Activity 对象。只要它还在数组里，BC 原生面板就可能把它列出来。

### 2.3 为什么之前"看起来正常"？

旧实现会**物理 splice `AssetAllActivities` / `ActivityFemale3DCGOrdering`**（注释 05-custom-a.js:408 提到），所以 BC 原生面板也看不到。后来为了避免"前缀过宽误删正常动作"的风险，改成了纯内存过滤，副作用就是 BC 原生面板可能漏网。

---

## 3. 问题二：自定义动作显示为 "XSQAct_gkrlub"

本插件自定义动作的真实 Activity.Name 是 `XSQAct_` + hash（如 `XSQAct_gkrlub`）。BC 原生面板显示动作名时，通常会查字典：
```
Label-ChatOther-<Group>-XSQAct_gkrlub
Label-ChatSelf-<Group>-XSQAct_gkrlub
```

我们在 `caRegisterDictionary()`（05-custom-a.js:87）里确实注册了这些 key。截图显示内部 ID，说明字典查询**在 BC 原生面板这个路径上没有命中**，可能原因：

- **group 不匹配**：注册时用的 `act.group` 和 BC 原生面板查询时用的 group 不一致（例如子部位 vs 主部位）。
- **字典写入未生效**：`caSetDict` 写入 cache/hook 的时机或路径与 BC 原生面板的查询路径不一致。
- **v1.1.4 之前的问题**：如果截图来自旧版本，`caSetDict` 直接覆盖 `window.ActivityDictionaryText` 在 R130+ 已失效。v1.1.4 已改为 SDK hook + cache 写入，需要确认是否仍复现。

注意：本插件自己的"动作"面板调用 `getActivityLabelFallback()`，会显式用 `caFindByActivityName()` 把 `XSQAct_xxx` 解析回中文名，所以本插件面板里不会显示内部 ID。但 BC 原生面板不会走我们的 `getActivityLabelFallback`。

---

## 4. 修复方案（推荐）

### 4.1 恢复精确的物理移除（修复问题一）

把 `caRemoveSuppressedEchoActivities()` 从空函数改回实际删除，但**只删除 `echoSuppressed` 集合中精确匹配的名字**，不再用前缀匹配，避免误伤。

```js
function caRemoveSuppressedEchoActivities() {
    if (!state.echoSuppressed || state.echoSuppressed.size === 0) return;
    var suppressed = state.echoSuppressed;
    try {
        var fam = (Player && Player.AssetFamily) || 'Female3DCG';
        var acts = AssetAllActivities(fam);
        if (Array.isArray(acts)) {
            for (var i = acts.length - 1; i >= 0; i--) {
                var a = acts[i];
                if (a && a.Name && suppressed.has(a.Name)) acts.splice(i, 1);
            }
        }
    } catch (e) { console.warn('[QiAct] 从 AssetAllActivities 移除 echo 原始动作失败:', e.message); }
    try {
        if (Array.isArray(ActivityFemale3DCGOrdering)) {
            for (var j = ActivityFemale3DCGOrdering.length - 1; j >= 0; j--) {
                var nm = ActivityFemale3DCGOrdering[j];
                if (nm && suppressed.has(nm)) ActivityFemale3DCGOrdering.splice(j, 1);
            }
        }
    } catch (e) { console.warn('[QiAct] 从 ActivityFemale3DCGOrdering 移除 echo 原始动作失败:', e.message); }
}
```

这比"删除原 echo 数据"更直接：即使 echo 插件还在、还在注册原始 Activity，我们启动时也会把它们从 BC 全局数组里清掉，BC 原生面板就看不到。

### 4.2 额外 hook `AssetAllActivities`（动态兜底）

物理移除只在启动/导入时执行一次。如果 echo 插件在运行期间动态注册新变体，物理移除会滞后。可以加一个 SDK hook：

```js
state.modApi.hookFunction('AssetAllActivities', 0, function(args, next) {
    var result = next(args);
    if (!state.echoSuppressed || state.echoSuppressed.size === 0 || !Array.isArray(result)) return result;
    return result.filter(function(a) { return !(a && a.Name && state.echoSuppressed.has(a.Name)); });
});
```

这样任何调用 `AssetAllActivities()` 的地方（包括 BC 原生面板、第三方插件）都会自动过滤，双重保险。

### 4.3 修复自定义动作在 BC 原生面板的显示名（问题二）

需要实机确认 BC 原生面板查询用的具体 key。最可能的修复：

- 在 `caSetDict` 注册时，除了 `act.group`，再为主部位（`SUBPART_TO_BASE[act.group]`）也注册一份 Label/Chat 字典。
- 确保 `patchActivityDictionaryText()` 的 SDK hook 已安装后再调用 `caSetDict`（v1.1.4 已做）。
- 如果 BC 原生面板显示名前不查字典而是直接用 `Activity.Name`，那只能在 echo 清理方案上做文章（让 echo 原始动作消失，减少用户看到内部 ID 的机会），但这不是根本解决。

### 4.4 清理原 echo 数据作为辅助方案

在导入/迁移后，若原 echo 数据仍存在，弹建议提示并提供"一键清理原 echo 数据"按钮（只清 `Player.ExtensionSettings[ECHO]['动作数据']`）。这能从根本上减少 echo 原始 Activity 的源头，但问题一/二仍需上述修复兜底。

---

## 5. 与用户原提议的关系

用户原提议"删除原 echo 自定义动作数据"确实能**绕过**问题一（echo 原始 Activity 不再被注册），但：
- 它无法保证问题二（XSQAct_ 内部 ID 显示）被解决；
- 它要求用户手动操作或我们改外部插件数据；
- 如果其他用户没删 echo 数据，问题仍会复现。

因此更优路径是：**先修本插件的屏蔽和显示机制（4.1 + 4.2 + 4.3），再提供可选的 echo 数据清理（4.4）**。这样既治标又治本。

---

## 6. 建议立即执行的操作

1. 实现 4.1（精确物理移除）+ 4.2（hook AssetAllActivities）
2. 实现 4.3 中"为主部位也注册 Label"的修复
3. 构建并在调试 Chrome 中实机验证：导入 echo 后，BC 原生动作面板是否还显示 `笨蛋笨Luzi_mtkj72` 和 `XSQAct_gkrlub`
4. 若验证通过，bump v1.1.5 发布
