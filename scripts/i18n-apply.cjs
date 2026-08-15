// One-pass i18n wiring for QuickInteraction.
// Reads each file, applies all [from, to] replacements in memory, writes once.
// Reports any `from` not found so nothing is silently corrupted.
const fs = require('fs');
const path = require('path');

const BASE = '/Users/amoy_johnny/WorkBuddy/2026-06-03-14-48-07/QuickInteraction/src';

const MAP = {
  '05-custom-a.js': [
    ["toast('未找到 echo 数据', '#FF5C5C')", "toast(QiActT('toast.echo_notfound'), '#FF5C5C')"],
    ["toast('已清理原 echo 数据（' + before + ' 项）', '#46E0A0')", "toast(QiActT('toast.echo_cleaned', { n: before }), '#46E0A0')"],
    ["toast('清理失败：' + e.message, '#FF5C5C')", "toast(QiActT('toast.echo_clean_failed', { msg: e.message }), '#FF5C5C')"],
  ],

  '06-custom-b.js': [
    ["placeholder=\"搜索动作...\"", "placeholder=\"' + QiActT('custom.search_placeholder') + '\""],
    ["title=\"新建\"", "title=\"' + QiActT('custom.new') + '\""],
    ["<span>新建</span>", "<span>' + QiActT('custom.new') + '</span>"],
    ["title=\"导入\"", "title=\"' + QiActT('custom.import') + '\""],
    ["data-tooltip=\"导入@@从 echo/回声 或本地 JSON 导入自定义动作\"", "data-tooltip=\"' + QiActT('custom.import_tooltip') + '\""],
    ["<button data-import=\"echo\">从 echo/回声 导入</button>", "<button data-import=\"echo\">' + QiActT('custom.import_echo') + '</button>"],
    ["<button data-import=\"file\">从本地 JSON 导入</button>", "<button data-import=\"file\">' + QiActT('custom.import_file') + '</button>"],
    ["title=\"导出为 JSON\"", "title=\"' + QiActT('custom.export') + '\""],
    ["title=\"' + (editMode ? '完成编辑' : '编辑模式：拖动排序与批量管理') + '\"", "title=\"' + (editMode ? QiActT('custom.editmode_on') : QiActT('custom.editmode_off')) + '\""],
    ["title=\"' + (allOn ? '当前全部开启，点击全部关闭' : '当前全部关闭，点击全部开启') + '\"", "title=\"' + (allOn ? QiActT('custom.toggleall_on') : QiActT('custom.toggleall_off')) + '\""],
    ["label: '全部'", "label: QiActT('custom.chip_all')"],
    ["label: '小酥'", "label: QiActT('custom.chip_xiaosu')"],
    ["label: '我的'", "label: QiActT('custom.chip_native')"],
    [">全选</button>", ">' + QiActT('custom.select_all') + '</button>'"],
    [">已选 0 个</span>", ">' + QiActT('custom.selected_count', { n: 0 }) + '</span>'"],
    [">批量关闭</button>", ">' + QiActT('custom.batch_close') + '</button>'"],
    [">批量删除</button>", ">' + QiActT('custom.batch_delete') + '</button>'"],
    ["'<div class=\"xsact-ca-echo-clean-text\">检测到原 echo/回声 中仍有 <b>' + Object.keys(_echoData).length + '</b> 个自定义动作数据。迁移完成后建议清理，避免动作重复显示与使用后乱码。</div>'", "'<div class=\"xsact-ca-echo-clean-text\">' + QiActT('custom.echo_clean_text', { n: Object.keys(_echoData).length }) + '</div>'"],
    ["<button class=\"xsact-ca-echo-clean-btn\" type=\"button\">清理原 echo 数据</button>", "<button class=\"xsact-ca-echo-clean-btn\" type=\"button\">' + QiActT('custom.echo_clean_btn') + '</button>'"],
    ["<span class=\"xsact-ca-xiaosu-label\" title=\"内置小酥动作包（XiaoSuActivity 全部 51 个动作，预编译进插件，离线可用，无需原版插件）\">内置小酥动作包</span>", "<span class=\"xsact-ca-xiaosu-label\" title=\"' + QiActT('custom.xiaosu_pack_title') + '\">' + QiActT('custom.xiaosu_pack_label') + '</span>"],
    ["title=\"开启后，「我的动作」与 BC 原生动作列表显示小酥动作拓展的全部动作\"", "title=\"' + QiActT('custom.xiaosu_pack_toggle_title') + '\""],
    ["'<div class=\"xsact-qa-empty xsact-ca-empty\">还没有自定义动作。点「新建」创建，或点「导入」从 echo/回声 迁移。</div>'", "'<div class=\"xsact-qa-empty xsact-ca-empty\">' + QiActT('custom.empty') + '</div>'"],
    ["'<div class=\"xsact-qa-empty xsact-ca-empty xsact-ca-filter-empty\">当前分类下没有动作。</div>'", "'<div class=\"xsact-qa-empty xsact-ca-empty xsact-ca-filter-empty\">' + QiActT('custom.filter_empty') + '</div>'"],
    ["'<span class=\"xsact-ca-badge self\">仅自己</span>'", "'<span class=\"xsact-ca-badge self\">' + QiActT('custom.scope_self') + '</span>'"],
    ["'<span class=\"xsact-ca-badge other\">仅他人</span>'", "'<span class=\"xsact-ca-badge other\">' + QiActT('custom.scope_other') + '</span>'"],
    ["'<span class=\"xsact-ca-badge any\">皆可</span>'", "'<span class=\"xsact-ca-badge any\">' + QiActT('custom.scope_any') + '</span>'"],
    ["'<span class=\"xsact-ca-src xiaosu\" title=\"内置小酥动作包（预编译，无需原版插件）\">小酥</span>'", "'<span class=\"xsact-ca-src xiaosu\" title=\"' + QiActT('custom.xiaosu_pack_src_title') + '\">' + QiActT('custom.src_xiaosu') + '</span>'"],
    ["'<span class=\"xsact-ca-src echo\" title=\"来自 echo/回声 导入\">echo</span>'", "'<span class=\"xsact-ca-src echo\" title=\"' + QiActT('custom.src_echo_title') + '\">' + QiActT('custom.src_echo') + '</span>'"],
    ["'<span class=\"xsact-ca-src native\" title=\"本插件创建\">QiAct</span>'", "'<span class=\"xsact-ca-src native\" title=\"' + QiActT('custom.src_qiact_title') + '\">' + QiActT('custom.src_qiact') + '</span>'"],
    ["title=\"拖动排序\"", "title=\"' + QiActT('custom.drag_handle') + '\""],
    ["(isVisible ? '显示中' : '已隐藏')", "(isVisible ? QiActT('custom.vis_on') : QiActT('custom.vis_off'))"],
    ["title=\"在「动作」面板和 BC 原生动作列表中显示\"", "title=\"' + QiActT('custom.vis_toggle_title') + '\""],
    ["(isVisible ? '显示' : '隐藏')", "(isVisible ? QiActT('custom.vis_label_on') : QiActT('custom.vis_label_off'))"],
    ["title=\"对当前目标执行\"", "title=\"' + QiActT('custom.run_title') + '\""],
    ["title=\"编辑\"", "title=\"' + QiActT('custom.edit_title') + '\""],
    ["title=\"删除\"", "title=\"' + QiActT('custom.delete_title') + '\""],
    ["title: '清理原 echo 数据',", "title: QiActT('custom.echo_clean_confirm_title'),"],
    ["body: '确定清理原 echo/回声 中的自定义动作数据吗？\\n仅删除其「动作数据」，不影响本插件与其他配置（清理后系统更稳定）。'", "body: QiActT('custom.echo_clean_confirm_body'),"],
    ["confirmText: '清理',", "confirmText: QiActT('custom.echo_clean_confirm_btn'),"],
    ["turnOn ? '已开启全部 ' + acts.length + ' 个动作' : '已关闭全部 ' + acts.length + ' 个动作'", "turnOn ? QiActT('custom.toggle_all_on_toast', { n: acts.length }) : QiActT('custom.toggle_all_off_toast', { n: acts.length })"],
    ["title: '删除动作',", "title: QiActT('custom.delete_confirm_title'),"],
    ["body: '确定删除自定义动作「' + a.name + '」吗？',", "body: QiActT('custom.delete_confirm_body', { name: a.name }),"],
    ["confirmText: '删除',", "confirmText: QiActT('custom.delete_confirm_btn'),"],
    ["toast('已删除', '#888')", "toast(QiActT('toast.deleted'), '#888')"],
    ["a.visible ? '已显示「' + a.name + '」' : '已隐藏「' + a.name + '」'", "a.visible ? QiActT('custom.show_toast', { name: a.name }) : QiActT('custom.hide_toast', { name: a.name })"],
    ["selectedCountEl.textContent = '已选 ' + state.caSelected.length + ' 个';", "selectedCountEl.textContent = QiActT('custom.selected_count', { n: state.caSelected.length });"],
    ["'取消全选' : '全选'", "QiActT('custom.cancel_select_all') : QiActT('custom.select_all')"],
    ["toast('已批量关闭 ' + state.caSelected.length + ' 个动作', '#888');", "toast(QiActT('custom.batch_close_toast', { n: state.caSelected.length }), '#888');"],
    ["title: '批量删除 ' + n + ' 个动作',", "title: QiActT('custom.batch_delete_title', { n: n }),"],
    ["body: '确定批量删除以下动作吗？\\n' + names,", "body: QiActT('custom.batch_delete_body', { names: names }),"],
    ["confirmText: '全部删除',", "confirmText: QiActT('custom.batch_delete_btn'),"],
    ["toast('已批量删除 ' + n + ' 个动作', '#FF5C5C');", "toast(QiActT('custom.batch_deleted_toast', { n: n }), '#FF5C5C');"],
  ],

  '07-custom-c.js': [
    ["'<div class=\"xsact-body-mini-hint\">点击框选身体部位</div>'", "'<div class=\"xsact-body-mini-hint\">' + QiActT('editor.pick_part_hint') + '</div>'"],
    ["hint.textContent = '点击框选身体部位'", "hint.textContent = QiActT('editor.pick_part_hint')"],
    ["(isNew ? '新建' : '编辑') + '：自定义动作'", "(isNew ? QiActT('editor.new_title') : QiActT('editor.edit_title'))"],
    ["<label>动作名称</label>", "<label>' + QiActT('editor.name_label') + '</label>'"],
    ["=\"如：轻轻咬住\"", "=\"' + QiActT('editor.name_placeholder') + '\""],
    ["<label>谁能使用这个动作</label>", "<label>' + QiActT('editor.scope_label') + '</label>'"],
    [">仅他人</button>", ">' + QiActT('custom.scope_other') + '</button>'"],
    [">仅自己</button>", ">' + QiActT('custom.scope_self') + '</button>'"],
    [">皆可</button>", ">' + QiActT('custom.scope_any') + '</button>'"],
    ["<label>身体部位</label>", "<label>' + QiActT('editor.part_label') + '</label>'"],
    ["<span class=\"xsact-ca-part-change\">点击下图重新选择</span>", "<span class=\"xsact-ca-part-change\">' + QiActT('editor.part_change') + '</span>'"],
    ["<label>对他人时显示</label>", "<label>' + QiActT('editor.dialog_other_label') + '</label>'"],
    ["data-placeholder=\"如：轻轻咬住了 对方 的耳朵\"", "data-placeholder=\"' + QiActT('editor.dialog_other_ph') + '\""],
    ["<div class=\"xsact-ca-hint-title\">可用占位符（点击插入）</div>", "<div class=\"xsact-ca-hint-title\">' + QiActT('editor.tokens_title') + '</div>'"],
    [">自己</button>", ">' + QiActT('editor.token_self') + '</button>'"],
    [">对方</button>", ">' + QiActT('editor.token_other') + '</button>'"],
    ["<label>对自己时显示</label>", "<label>' + QiActT('editor.dialog_self_label') + '</label>'"],
    ["data-placeholder=\"如：被轻轻咬住了耳朵\"", "data-placeholder=\"' + QiActT('editor.dialog_self_ph') + '\""],
    [">保存</button>", ">' + QiActT('editor.save') + '</button>'"],
    [">删除</button>", ">' + QiActT('editor.delete') + '</button>'"],
    [">返回</button>", ">' + QiActT('editor.cancel') + '</button>'"],
    [">自己</span><span class=\"xsact-zwsp\">", ">' + QiActT('editor.token_self_pill') + '<span class=\"xsact-zwsp\">"],
    [">对方</span><span class=\"xsact-zwsp\">", ">' + QiActT('editor.token_other_pill') + '<span class=\"xsact-zwsp\">"],
    ["token === '{SourceCharacter}' ? '自己' : '对方'", "token === '{SourceCharacter}' ? QiActT('editor.token_self_pill') : QiActT('editor.token_other_pill')"],
    ["|| '动作'", "|| QiActT('editor.default_name')"],
    ["preview = '对他人：' + textOther + '\\n对自己：' + textSelf", "preview = QiActT('editor.preview', { a: textOther, b: textSelf })"],
    ["toast('请填写动作名称', '#FF5C5C')", "toast(QiActT('toast.fill_name'), '#FF5C5C')"],
    ["toast('请填写对话文本', '#FF5C5C')", "toast(QiActT('toast.fill_dialog'), '#FF5C5C')"],
    ["toast('自定义动作已保存', '#46E0A0')", "toast(QiActT('toast.custom_saved'), '#46E0A0')"],
    ["title: '删除动作',", "title: QiActT('custom.delete_confirm_title'),"],
    ["body: '确定删除该自定义动作吗？',", "body: QiActT('custom.delete_confirm_body', { name: act.name }),"],
    ["confirmText: '删除',", "confirmText: QiActT('custom.delete_confirm_btn'),"],
    ["toast('已删除', '#888')", "toast(QiActT('toast.deleted'), '#888')"],
  ],

  '08-custom-d.js': [
    ["toast('请先在左侧选择人物', '#FF5C5C')", "toast(QiActT('toast.pick_char'), '#FF5C5C')"],
    ["toast('执行：' + act.name, '#FF5C7A')", "toast(QiActT('toast.exec_custom', { name: act.name }), '#FF5C7A')"],
    ["toast('读取扩展设置失败', '#FF5C5C')", "toast(QiActT('toast.read_ext_failed'), '#FF5C5C')"],
    ["toast('未找到 echo/回声 的动作数据', '#FF5C5C')", "toast(QiActT('toast.import_echo_notfound'), '#FF5C5C')"],
    ["toast('已从 echo/回声 导入 ' + imported + ' 个动作', '#46E0A0')", "toast(QiActT('toast.imported_echo', { n: imported }), '#46E0A0')"],
    ["toast('导入失败：' + e.message, '#FF5C5C')", "toast(QiActT('toast.import_failed', { msg: e.message }), '#FF5C5C')"],
    ["toast('已导出 ' + state.customActions.length + ' 个动作', '#46E0A0')", "toast(QiActT('toast.exported', { n: state.customActions.length }), '#46E0A0')"],
    ["toast('导出失败：' + e.message, '#FF5C5C')", "toast(QiActT('toast.export_failed', { msg: e.message }), '#FF5C5C')"],
    ["toast('文件格式错误：应为动作对象数组', '#FF5C5C')", "toast(QiActT('toast.file_format_err'), '#FF5C5C')"],
    ["toast('导入完成：新增 ' + imported + ' 个，更新 ' + updated + ' 个', '#46E0A0')", "toast(QiActT('toast.import_done', { n: imported, m: updated }), '#46E0A0')"],
    ["toast('JSON 解析失败：' + inner.message, '#FF5C5C')", "toast(QiActT('toast.json_parse_failed', { msg: inner.message }), '#FF5C5C')"],
    ["reader.onerror = function() { toast('读取文件失败', '#FF5C5C'); }", "reader.onerror = function() { toast(QiActT('toast.read_file_failed'), '#FF5C5C'); }"],
    ["toast('导入失败：' + e.message, '#FF5C5C')", "toast(QiActT('toast.import_failed', { msg: e.message }), '#FF5C5C')"],
  ],

  '15-render-a.js': [
    ["titleEl.textContent = '选择动作...'", "titleEl.textContent = QiActT('render.select_action')"],
    ["innerHTML = '<div class=\"xsact-qa-empty\">点击左侧 ◀ 按钮选择人物和部位</div>'", "innerHTML = '<div class=\"xsact-qa-empty\">' + QiActT('render.pick_char_part2') + '</div>'"],
    ["' → 选择部位'", "' → ' + QiActT('target.select_part')"],
    ["innerHTML = '<div class=\"xsact-qa-empty\">请在左侧人物浮层选择身体部位</div>'", "innerHTML = '<div class=\"xsact-qa-empty\">' + QiActT('render.pick_part_hint') + '</div>'"],
    ["toast('请先开启动作模式', '#888')", "toast(QiActT('toast.mode_on_first'), '#888')"],
    ["toast('我的动作列表已刷新', '#FF5C7A')", "toast(QiActT('toast.refreshed_custom'), '#FF5C7A')"],
    ["toast('组合列表已刷新', '#FF5C7A')", "toast(QiActT('toast.refreshed_combo'), '#FF5C7A')"],
    ["toast('请先选择一个人物部位', '#888')", "toast(QiActT('toast.pick_part'), '#888')"],
    ["toast('动作列表已刷新', '#FF5C7A')", "toast(QiActT('toast.refreshed_actions'), '#FF5C7A')"],
    ["titleEl.textContent = '编辑：' + combo.name;", "titleEl.textContent = QiActT('combo.edit_title', { name: combo.name });"],
    ["placeholder=\"组合名称\"", "placeholder=\"' + QiActT('combo.name_ph') + '\"", ],
    ["<label>动作间隔 <span id=\"xsact-delay-val\">' + curDelay + '</span>ms</label>", "<label>' + QiActT('combo.delay_label', { n: curDelay }) + '</label>'"],
    ["<div class=\"xsact-qa-empty\">请到「动作」模式，点击动作旁的「加入」按钮添加</div>", "<div class=\"xsact-qa-empty\">' + QiActT('combo.add_hint') + '</div>'"],
    ["title=\"上移\"", "title=\"' + QiActT('combo.up') + '\"", ],
    ["title=\"下移\"", "title=\"' + QiActT('combo.down') + '\"", ],
    ["title=\"删除\"", "title=\"' + QiActT('combo.item_del') + '\"", ],
    [">保存</button>", ">' + QiActT('combo.save') + '</button>'"],
    [">返回</button>", ">' + QiActT('combo.cancel') + '</button>'"],
    ["toast('组合已保存', '#46E0A0')", "toast(QiActT('toast.combo_saved'), '#46E0A0')"],
    ["' → ' : '') + '组合动作'", "' → ' : '') + QiActT('render.combo_title')"],
    ["<div class=\"xsact-qa-empty\">暂无组合。点击下方「新建组合」，然后到「动作」模式点击动作旁的「加入」按钮添加动作。</div>", "<div class=\"xsact-qa-empty\">' + QiActT('combo.empty') + '</div>'"],
    [" + ' 步</span>'", " + QiActT('combo.count', { n: c.items.length }) + '</span>'"],
    ["title=\"执行\"", "title=\"' + QiActT('combo.exec') + '\"", ],
    ["title=\"编辑\"", "title=\"' + QiActT('combo.edit') + '\"", ],
    ["title=\"删除\"", "title=\"' + QiActT('combo.item_del') + '\"", ],
    ["'新建组合</button>'", "' + QiActT('combo.new_btn') + '</button>'"],
    ["toast('请先在左侧选择人物', '#FF5C5C')", "toast(QiActT('toast.pick_char'), '#FF5C5C')"],
    ["title: '删除组合',", "title: QiActT('combo.delete_confirm_title'),"],
    ["body: '确定删除这个组合吗？',", "body: QiActT('combo.delete_confirm_body'),"],
    ["confirmText: '删除',", "confirmText: QiActT('combo.delete_confirm_btn'),"],
    ["addCombo('新组合')", "addCombo(QiActT('combo.new_name'))"],
  ],

  '16-render-b.js': [
    ["innerHTML = '<div class=\"xsact-qa-empty\">请先在左侧选择人物和部位</div>'", "innerHTML = '<div class=\"xsact-qa-empty\">' + QiActT('render.pick_char_part') + '</div>'"],
    ["innerHTML = '<div class=\"xsact-qa-empty\">该部位暂无可用动作</div>'", "innerHTML = '<div class=\"xsact-qa-empty\">' + QiActT('render.no_actions') + '</div>'"],
    ["title=\"加入当前组合\"", "title=\"' + QiActT('combo.add_title') + '\"", ],
    ["toast('已执行：' + getActivityLabel(actName, partGroup), '#46E0A0')", "toast(QiActT('toast.executed', { name: getActivityLabel(actName, partGroup) }), '#46E0A0')"],
    ["toast('已加入「' + getCombo(state.editingComboId).name + '」', '#46E0A0')", "toast(QiActT('toast.added_to_combo', { name: getCombo(state.editingComboId).name }), '#46E0A0')"],
    ["动作列表加载出错，请刷新或反馈。<br><small>' + escapeHtml(panelErr.message) + '</small></div>", "QiActT('render.load_err', { msg: escapeHtml(panelErr.message) }) + '</div>'"],
  ],

  '20-update.js': [
    ["entry.kind === 'parse' ? '响应解析失败' : '网络错误'", "entry.kind === 'parse' ? QiActT('update.parse_err') : QiActT('update.net_err')"],
    ["new Error('JSON 解析失败: ' + pe.message)", "new Error(QiActT('update.json_parse_err', { msg: pe.message }))"],
    ["toast('QiAct 已更新到 v' + VERSION, '#46E0A0')", "toast('QiAct ' + QiActT('update.title', { VERSION: VERSION }), '#46E0A0')"],
    ["title: '已更新到 v' + VERSION,", "title: QiActT('update.title', { VERSION: VERSION }),"],
    [">更新可用</span>", ">' + QiActT('update.available_tag') + '</span>'"],
    ["title=\"稍后提醒\"", "title=\"' + QiActT('update.later_title') + '\"", ],
    [">查看详情</button>", ">' + QiActT('update.details') + '</button>'"],
    [">稍后</button>", ">' + QiActT('update.later') + '</button>'"],
    [">不再提示此版本</button>", ">' + QiActT('update.ignore') + '</button>'"],
    ["var tagText = '公告';", "var tagText = QiActT('update.announce_tag');"],
    ["tagText = '重要';", "tagText = QiActT('update.important_tag');"],
    ["tagText = '可用';", "tagText = QiActT('update.available_tag');"],
    ["tagText = '公告';", "tagText = QiActT('update.announce_tag');"],
    ["title=\"知道了\"", "title=\"' + QiActT('update.know') + '\"", ],
  ],
};

let missing = [];
for (const [file, reps] of Object.entries(MAP)) {
  const fp = path.join(BASE, file);
  let content = fs.readFileSync(fp, 'utf8');
  let applied = 0;
  for (const [from, to] of reps) {
    if (content.indexOf(from) === -1) { missing.push(file + ' :: ' + from); continue; }
    content = content.split(from).join(to);
    applied++;
  }
  fs.writeFileSync(fp, content);
  console.log(file + ': applied ' + applied + '/' + reps.length);
}
if (missing.length) {
  console.log('\nMISSING (' + missing.length + '):');
  missing.forEach(m => console.log('  ' + JSON.stringify(m)));
} else {
  console.log('\nAll replacements applied successfully.');
}
