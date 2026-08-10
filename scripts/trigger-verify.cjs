'use strict';
/*
 * 触发路径回归验证 (Trigger-path regression harness)
 * 加载「修改前」(git HEAD) 与「修改后」(当前) 两个构建产物，
 * 在 mock BC 环境下分别执行 executeAction，断言动作触发链路
 * (makeActivityPacket -> ActivityRun 本地副作用 -> ServerSend 发包)
 * 产出完全一致的包结构，从而证明 i18n 改造未影响触发逻辑。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const NEW_FILE = path.join(ROOT, 'quick-interaction.user.js');
const OLD_FILE = 'quick-interaction.user.js'; // git HEAD (repo root = QuickInteraction/)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 构造一份 mock BC 全局环境（每次加载用全新 sandbox，互不污染）
function makeSandbox(allowedActs, assetActs) {
  const calls = { ServerSend: [], ActivityRun: [], toast: [], other: [] };

  function fakeEl() {
    return new Proxy({
      style: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){return false;} },
      children: [], dataset: {},
      appendChild(){}, removeChild(){}, remove(){}, setAttribute(){}, getAttribute(){return null;},
      addEventListener(){}, removeEventListener(){}, querySelector(){return null;}, querySelectorAll(){return [];},
      focus(){}, blur(){}, click(){},
      set innerHTML(v){}, get innerHTML(){return '';},
      set textContent(v){}, get textContent(){return '';},
    }, { get(t, p){ if (p in t) return t[p]; return undefined; }, set(t,p,v){ t[p]=v; return true; } });
  }

  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.console = console;
  sandbox.alert = function(){};
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  sandbox.setInterval = (fn, ms) => setInterval(fn, ms || 1000);
  sandbox.clearInterval = clearInterval;
  sandbox.TextEncoder = TextEncoder;
  sandbox.eval = eval;
  sandbox.navigator = { language: 'zh-CN' };

  // BC 玩家 / 环境
  sandbox.Player = { MemberNumber: 12345, Name: 'TestPlayer', AccountName: 'TestPlayer', Nickname: 'Tester', AssetFamily: 'Female3DCG' };
  sandbox.CurrentScreen = 'ChatRoom';
  sandbox.ChatRoomCharacter = [];

  // 存储
  sandbox.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
  sandbox.loadSetting = (k, d) => d;
  sandbox.loadStorage = (k, d) => d;
  sandbox.loadFromServer = (k, d) => d;

  // 触发链路相关 BC API（捕获调用）
  sandbox.ServerSend = function(type, packet) { calls.ServerSend.push({ type, packet: JSON.parse(JSON.stringify(packet)) }); };
  sandbox.ActivityRun = function() { calls.ActivityRun.push(Array.from(arguments).map(a => a && a.Name ? a.Name : (a && typeof a === 'object' ? '[obj]' : a))); };
  sandbox.toast = function(m, c) { calls.toast.push({ m: (m && m.key) ? ('[{' + m.key + '}]') : String(m), c }); };
  sandbox.ActivityAllowedForGroup = function() { return allowedActs; };
  sandbox.AssetAllActivities = function() { return assetActs; };
  sandbox.ActivityGetGroupOrMirror = function(fam, group) { return { Name: group }; };
  sandbox.ActivityDictionaryText = function(key) {
    // 对非真实动作名（XyzMissing）返回 BC 的 MISSING 标记，以触发 Action 兜底分支（红线内容句）
    if (key.indexOf('XyzMissing') !== -1) return 'MISSING TEXT IN "Interface.csv": ' + key;
    return 'text:' + key; // 非 MISSING -> 走标准 Activity 分支
  };
  sandbox.InventoryGet = function() { return null; };
  sandbox.AssetGroup = [{ Name: 'ItemMouth' }, { Name: 'ItemArms' }];
  sandbox.CharacterGet = function() { return null; };
  // 被 setupHooks 打补丁的 BC 函数（提供 no-op 以便 hook 成功安装）
  sandbox.DrawCharacter = function(){};
  sandbox.DrawProcess = function(){};
  sandbox.ChatRoomClick = function(){};
  sandbox.ChatRoomMenuDraw = function(){};
  sandbox.ActivityGet = function(){};

  sandbox.document = {
    createElement: () => fakeEl(),
    getElementById: () => fakeEl(),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener(){}, removeEventListener(){},
    body: fakeEl(),
    documentElement: fakeEl(),
  };
  sandbox.window.addEventListener = function(){};
  sandbox.window.removeEventListener = function(){};

  sandbox.__calls = calls;
  return { sandbox, calls };
}

async function loadPlugin(code) {
  // 每次独立 sandbox；allowedActs / assetActs 保持一致以做差分对比
  const allowedActs = [{ Activity: { Name: 'Kiss' } }, { Activity: { Name: 'Kneel' } }, { Activity: { Name: 'Liko_Wave' } }, { Activity: { Name: 'XyzMissing' } }];
  const assetActs = [{ Name: 'Kiss' }, { Name: 'Kneel' }, { Name: 'Liko_Wave' }, { Name: 'XyzMissing' }];
  const { sandbox, calls } = makeSandbox(allowedActs, assetActs);
  const ctx = vm.createContext(sandbox);
  try {
    vm.runInContext(code, ctx, { filename: 'qiact.js' });
  } catch (e) {
    return { error: 'load: ' + e.message, sandbox, calls };
  }
  // 等待 main() 异步完成并暴露 window.__QiAct
  for (let i = 0; i < 100; i++) {
    if (sandbox.window && sandbox.window.__QiAct) break;
    await sleep(20);
  }
  return { sandbox, calls, api: sandbox.window ? sandbox.window.__QiAct : null };
}

// 在 api 上执行一组触发场景（经由公开的 runCombo -> executeAction 真实链路）
// 返回每个场景的 (返回值, ServerSend包, ActivityRun调用, toast)
function runScenarios(api, calls) {
  api.state.isActive = true; // runComboOnTarget 要求动作模式处于激活态
  const target = { MemberNumber: 999, Name: 'Victim', Nickname: 'Vic', AssetFamily: 'Female3DCG' };
  const scenarios = ['Kiss', 'Kneel', 'Liko_Wave', 'XyzMissing'];
  const out = {};
  for (const name of scenarios) {
    calls.ServerSend.length = 0; calls.ActivityRun.length = 0; calls.toast.length = 0;
    let ret;
    try {
      // 构造单步组合，经 runCombo -> executeAction 触发真实发包链路
      api.runCombo(target, { name: 'c-' + name, items: [{ group: 'ItemMouth', action: name }] });
      ret = 'ok';
    } catch (e) { ret = 'THROW:' + e.message; }
    out[name] = {
      ret,
      serverSend: calls.ServerSend.slice(),
      activityRun: calls.ActivityRun.slice(),
      toasts: calls.toast.slice(),
    };
  }
  return out;
}

function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

(async () => {
  const oldCode = execSync(`git show HEAD:${OLD_FILE}`, { cwd: ROOT }).toString();
  const newCode = fs.readFileSync(NEW_FILE, 'utf8');

  console.log('── 加载「修改前」(git HEAD) 构建产物 ──');
  const oldR = await loadPlugin(oldCode);
  console.log('── 加载「修改后」(当前) 构建产物 ──');
  const newR = await loadPlugin(newCode);

  const results = [];
  function check(label, cond, detail) { results.push({ label, ok: !!cond, detail }); }

  check('修改前: 插件 API 暴露成功 (window.__QiAct)', !!oldR.api, oldR.error || '');
  check('修改后: 插件 API 暴露成功 (window.__QiAct)', !!newR.api, newR.error || '');

  if (!oldR.api || !newR.api) {
    console.log('\n❌ 无法获取插件 API，跳过触发对比。错误:');
    console.log('  OLD:', oldR.error || 'no api');
    console.log('  NEW:', newR.error || 'no api');
    process.exit(1);
  }

  // 触发链路核心断言：setupHooks 是否成功打补丁（ActivityRun 被 hook 包裹后仍可调）
  // 通过验证 ActivityRun 在 executeAction 中被调用（本地副作用）来间接确认
  const oldS = runScenarios(oldR.api, oldR.calls);
  const newS = runScenarios(newR.api, newR.calls);

  // 诊断：打印一次 Kiss 场景的细节，确认触发是否真正走到发包
  console.log('\n── 诊断(Kiss): OLD ret=' + JSON.stringify(oldS.Kiss.ret) +
    ' toasts=' + JSON.stringify(oldS.Kiss.toasts) +
    ' | NEW ret=' + JSON.stringify(newS.Kiss.ret) +
    ' toasts=' + JSON.stringify(newS.Kiss.toasts));

  const names = ['Kiss', 'Kneel', 'Liko_Wave', 'XyzMissing'];
  for (const n of names) {
    const o = oldS[n], w = newS[n];
    check(`[${n}] 返回值一致`, deepEqual(o.ret, w.ret), `old=${o.ret} new=${w.ret}`);
    check(`[${n}] ServerSend 发包数量一致 (${o.serverSend.length})`, o.serverSend.length === w.serverSend.length && o.serverSend.length >= 1,
      `old=${o.serverSend.length} new=${w.serverSend.length}`);
    if (o.serverSend.length && w.serverSend.length) {
      check(`[${n}] ServerSend 类型一致`, o.serverSend[0].type === w.serverSend[0].type, `old=${o.serverSend[0].type} new=${w.serverSend[0].type}`);
      check(`[${n}] ServerSend 包结构(byte级)一致`, deepEqual(o.serverSend[0].packet, w.serverSend[0].packet),
        `\n   OLD=${JSON.stringify(o.serverSend[0].packet)}\n   NEW=${JSON.stringify(w.serverSend[0].packet)}`);
    }
    check(`[${n}] ActivityRun 本地副作用调用一致`, deepEqual(o.activityRun, w.activityRun),
      `old=${JSON.stringify(o.activityRun)} new=${JSON.stringify(w.activityRun)}`);
  }

  // 红线专项：Liko_ 必须走标准 Activity 包（Type:'Activity'），绝不能退化为 Action 兜底
  check('[Liko_Wave] 发包类型为 Activity (红线: 不破坏 Liko 原生 hook)',
    newS.Liko_Wave.serverSend[0] && newS.Liko_Wave.serverSend[0].packet.Type === 'Activity',
    JSON.stringify(newS.Liko_Wave.serverSend[0] && newS.Liko_Wave.serverSend[0].packet.Type));

  // 红线专项：动作内容句不被 i18n 改写（XyzMissing 走 Action 兜底，Text 含中文「做了「X」」）
  const fb = newS.XyzMissing.serverSend[0];
  if (fb && fb.packet.Dictionary && fb.packet.Dictionary[1] && fb.packet.Dictionary[1].Text) {
    const txt = fb.packet.Dictionary[1].Text;
    check('[XyzMissing] 动作内容句保留「做了「X」」中文红线', txt.indexOf('做了') !== -1, txt);
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.length - passed;
  console.log('\n══════════ 触发路径回归结果 ══════════');
  results.forEach(r => console.log(`  ${r.ok ? '✅' : '❌'} ${r.label}${r.ok ? '' : '  → ' + r.detail}`));
  console.log(`\n总计: ${passed} 通过 / ${failed} 失败`);
  process.exit(failed === 0 ? 0 : 1);
})();
