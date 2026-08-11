    /* ===== 主面板 UI（HTML 结构） ===== */
    // 语言切换下拉（自定义菜单）：自动(auto) + 7 语；标记当前语言为选中
    function langMenuHTML() {
        var cur = (typeof QiActI18n !== 'undefined' && QiActI18n.getCurrentLang) ? QiActI18n.getCurrentLang() : 'auto';
        var meta = (typeof QiActI18n !== 'undefined' && QiActI18n.LANG_META) ? QiActI18n.LANG_META : {};
        var list = (typeof QiActI18n !== 'undefined' && QiActI18n.LANGS) ? QiActI18n.LANGS : ['TW', 'CN', 'EN', 'JA', 'KO', 'VI', 'DE', 'FR', 'ES', 'RU', 'UA'];
        var order = ['auto'].concat(list);
        var curCode = (meta[cur] && meta[cur].code) ? meta[cur].code : (cur === 'auto' ? 'A' : cur);
        var items = '';
        for (var i = 0; i < order.length; i++) {
            var L = order[i];
            var m = meta[L] || { code: L, native: L };
            var active = (L === cur) ? ' active' : '';
            items += '<button type="button" class="xsact-lang-item' + active + '" data-lang="' + L + '" role="option" aria-selected="' + (L === cur) + '">' +
                '<span class="xsact-lang-item-code">' + m.code + '</span>' +
                '<span class="xsact-lang-item-native">' + m.native + '</span>' +
                '<span class="xsact-lang-check">✓</span>' +
                '</button>';
        }
        return '<div class="xsact-lang' + (cur !== 'auto' ? ' has-lang' : '') + '" id="xsact-lang">' +
            '<button type="button" class="xsact-lang-trigger" id="xsact-lang-trigger" aria-haspopup="listbox" aria-expanded="false" title="' + (typeof QiActT === 'function' ? QiActT('ui.lang_title') : 'Language') + '">' +
            '<span class="xsact-lang-code" id="xsact-lang-code">' + curCode + '</span>' +
            '<span class="xsact-lang-caret">▾</span>' +
            '</button>' +
            '<div class="xsact-lang-menu" id="xsact-lang-menu" role="listbox" aria-label="Language">' + items + '</div>' +
            '</div>';
    }
    function buildPanelHTML() {
        return '\
<div class="xsact-qa-panel-inner">\
  <div class="xsact-qa-panel-header" id="xsact-panel-header">\
    <span class="xsact-panel-grip" id="xsact-drag-grip" title="' + QiActT('ui.drag_panel') + '">' + svgIcon('grip', 16) + '</span>\
    <span id="xsact-panel-title">' + QiActT('render.select_action') + '</span>\
    <span class="xsact-panel-head-actions">\
      <button class="xsact-qa-mini-btn" id="xsact-refresh-btn" title="' + QiActT('ui.refresh') + '">' + svgIcon('refresh', 15) + '</button>\
      <button class="xsact-qa-mini-btn xsact-header-icon-btn" id="xsact-settings-btn" title="' + QiActT('ui.settings') + '">' + svgIcon('settings', 15) + '</button>\
      <button class="xsact-qa-mini-btn xsact-header-icon-btn" id="xsact-announcement-btn" title="' + QiActT('ui.announcement') + '">ⓘ</button>\
      <button class="xsact-qa-mini-btn" id="xsact-exit-panel-btn" title="' + QiActT('ui.exit_mode') + '">' + svgIcon('close', 15) + '</button>\
    </span>\
  </div>\
  <div class="xsact-update-banner" id="xsact-update-banner" style="display:none;"></div>\
  <div class="xsact-qa-panel-content">\
    <div class="xsact-qa-panel-main">\
      <div class="xsact-qa-mode-tabs">\
        <button class="xsact-mode-tab active" data-mode="part" title="' + QiActT('ui.mode_part_title') + '">' + svgIcon('target', 14) + '<span>' + QiActT('ui.mode_part') + '</span></button>\
        <button class="xsact-mode-tab" data-mode="favorite" title="' + QiActT('ui.mode_favorite_title') + '">' + svgIcon('star', 14) + '<span>' + QiActT('ui.mode_favorite') + '</span></button>\
        <button class="xsact-mode-tab" data-mode="combo" title="' + QiActT('ui.mode_combo_title') + '">' + svgIcon('layers', 14) + '<span>' + QiActT('ui.mode_combo') + '</span></button>\
        <button class="xsact-mode-tab" data-mode="custom" title="' + QiActT('ui.mode_custom_title') + '"><span class="xsact-custom-tab-main">' + svgIcon('custom', 14) + '<span class="xsact-custom-tab-label">' + QiActT('ui.mode_custom') + '</span></span><span class="xsact-beta-badge">' + QiActT('ui.beta_badge') + '</span></button>\
      </div>\
      <div class="xsact-qa-panel-body" id="xsact-action-list">\
        <div class="xsact-qa-empty">' + QiActT('render.pick_char_part2') + '</div>\
      </div>\
      <div class="xsact-qa-panel-footer">\
        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-self-btn" title="' + QiActT('ui.self_title') + '">' + svgIcon('user', 14) + '<span>' + QiActT('ui.self') + '</span><span class="xsact-pill-dot"></span></button>\
        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-all-btn" title="' + QiActT('ui.all_title') + '">' + svgIcon('users', 14) + '<span>' + QiActT('ui.all') + '</span><span class="xsact-pill-dot"></span></button>\
        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-fav-btn" title="' + QiActT('ui.fav_title') + '">' + svgIcon('star', 14) + '<span>' + QiActT('ui.fav') + '</span><span class="xsact-pill-dot"></span></button>\
        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-grid-btn" title="' + QiActT('ui.interaction_grid_title') + '">' + svgIcon('target', 14) + '<span>' + QiActT('ui.interaction_grid') + '</span><span class="xsact-pill-dot"></span></button>\
      </div>\
    </div>\
  </div>\
  <div class="xsact-qa-state.presets-bar" id="xsact-state.presets-bar"></div>\
  <div class="xsact-resize-handle" id="xsact-resize-handle" title="' + QiActT('ui.resize') + '">' + svgIcon('resize', 14) + '</div>\
</div>\
<div class="xsact-char-popover" id="xsact-char-popover" style="display:none;">\
  <div class="xsact-char-popover-header">\
    <button class="xsact-char-popover-back" id="xsact-char-popover-back" title="' + QiActT('ui.popover_back') + '">&#8249;</button>\
    <span class="xsact-char-popover-title" id="xsact-char-popover-title">' + QiActT('ui.chars') + '</span>\
    <button class="xsact-char-popover-close" id="xsact-char-popover-close" title="' + QiActT('ui.popover_close') + '" data-tooltip-type="danger">×</button>\
  </div>\
  <div class="xsact-char-popover-body" id="xsact-char-popover-body"></div>\
</div>\
<div id="xsact-char-popover-tab" title="' + QiActT('ui.chars') + '">' + svgIcon('triangle-left', 12) + '</div>\
<div id="xsact-popover-connector"></div>';
    }

    // ════════════════════════════════════════════════════════════════════════
    // 身体部位浮动网格
    // ════════════════════════════════════════════════════════════════════════

    /**
     * 获取房间内"真实成员"的绘制布局（逻辑坐标）
     * 使用 ChatRoomCharacter（权威成员列表）交叉校验，避免 Drawlist 含离场/NPC 角色
     */
