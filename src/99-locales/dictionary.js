// ─────────────────────────────────────────────────────────────────────────────
// QiAct 多语言字典（构建期内联进单文件）
// 命名空间：ui / target / common / toast / custom / editor / combo / update / part / render
// 每键至少提供 CN（简体）+ EN；TW 缺失由引擎回退 CN，DE/FR/RU/UA 由引擎回退 EN。
// 仅承载用户界面显示文本；逻辑键 / 协议串 / 动作内容数据一律不在此处。
// ─────────────────────────────────────────────────────────────────────────────
(function () {
    if (typeof QiActI18n === 'undefined' || !QiActI18n) return; // 引擎未就绪则跳过（防御，运行时不会触发）

    // ⚠️ 机器翻译草稿（Google 免费端点自动生成，DE/FR/RU/UA/TW）。术语与情色语境措辞需人工校对后再正式发布。

    // ui 命名空间
    QiActI18n.register('ui', {
        'toggle_on'        :        { TW: '開啟快速動作模式', CN: '开启快速动作模式', EN: 'Enter Quick Action mode', DE: 'Wechseln Sie in den Schnellaktionsmodus', FR: 'Passer en mode action rapide', RU: 'Войдите в режим быстрого действия', UA: 'Увійдіть у режим швидкої дії' },
        'toggle_off'       :        { TW: '退出快速動作模式', CN: '退出快速动作模式', EN: 'Exit Quick Action mode', DE: 'Verlassen Sie den Schnellaktionsmodus', FR: 'Quitter le mode Action rapide', RU: 'Выйти из режима быстрого действия', UA: 'Вийти з режиму швидкої дії' },
        'toggle_on_active' :        { TW: '退出快速動作模式 · 已激活', CN: '退出快速动作模式 · 已激活', EN: 'Exit Quick Action mode · Active', DE: 'Schnellaktionsmodus verlassen · Aktiv', FR: 'Quitter le mode Action rapide · Actif', RU: 'Выход из режима быстрого действия · Активно', UA: 'Вийти з режиму швидкої дії · Активний' },
        'theme_dark'       :        { TW: '深色', CN: '深色', EN: 'Dark', DE: 'Dunkel', FR: 'Sombre', RU: 'Темный', UA: 'Темний' },
        'theme_light'      :        { TW: '淺色', CN: '浅色', EN: 'Light', DE: 'Licht', FR: 'Lumière', RU: 'Свет', UA: 'світло' },
        'theme_switched'   :        { TW: '已切換為{theme}主題', CN: '已切换为{theme}主题', EN: 'Switched to {theme} theme', DE: 'Zum Thema {theme} gewechselt', FR: 'Passé au thème {theme}', RU: 'Переключился на тему {theme}', UA: 'Переключено на тему {theme}' },
        'drag_panel'       :        { TW: '拖曳面板', CN: '拖动面板', EN: 'Drag panel', DE: 'Panel ziehen', FR: 'Faites glisser le panneau', RU: 'Перетащите панель', UA: 'Панель перетягування' },
        'theme_toggle'     :        { TW: '切換深色/淺色主題', CN: '切换深色/浅色主题', EN: 'Toggle dark/light theme', DE: 'Schalten Sie das dunkle/helle Thema um', FR: 'Basculer le thème sombre/clair', RU: 'Переключить темную/светлую тему', UA: 'Перемикати темну/світлу тему' },
        'lang_title'       :        { TW: '語言', CN: '语言', EN: 'Language', DE: 'Sprache', FR: 'Langue', RU: 'Язык', UA: 'Мова' },
        'lang_auto'        :        { TW: '自動', CN: '自动', EN: 'Auto', DE: 'Auto', FR: 'Auto', RU: 'Авто', UA: 'Авто' },
        'refresh'          :        { TW: '刷新目前部位/人物的動作清單狀態', CN: '刷新当前部位/人物的动作列表状态', EN: 'Refresh the current part/character action list', DE: 'Aktualisieren Sie die aktuelle Aktionsliste für Teile/Charaktere', FR: 'Actualiser la liste actuelle des actions des parties/personnages', RU: 'Обновить текущий список действий части/персонажа.', UA: 'Оновити поточний список дій частини/персонажа' },
        'exit_mode'        :        { TW: '退出快速動作模式 (Esc)', CN: '退出快速动作模式 (Esc)', EN: 'Exit Quick Action mode (Esc)', DE: 'Schnellaktionsmodus verlassen (Esc)', FR: 'Quitter le mode Action rapide (Esc)', RU: 'Выход из режима быстрого действия (Esc)', UA: 'Вийти з режиму швидкої дії (Esc)' },
        'mode_part'        :        { TW: '動作', CN: '动作', EN: 'Action', DE: 'Aktion', FR: 'Action', RU: 'Действие', UA: 'Дія' },
        'mode_part_title'  :        { TW: '單部位動作：點人物部位後直接觸發', CN: '单部位动作：点人物部位后直接触发', EN: 'Single-part action: trigger directly after clicking a body part', DE: 'Einzelaktion: Direkt nach dem Anklicken eines Körperteils auslösen', FR: 'Action en une seule partie : déclenchez-la directement après avoir cliqué sur une partie du corps', RU: 'Действие для одной части: срабатывает сразу после щелчка по части тела.', UA: 'Однокомпонентна дія: активується безпосередньо після клацання частини тіла' },
        'mode_combo'       :        { TW: '組合動作', CN: '组合动作', EN: 'Combo', DE: 'Combo', FR: 'Combo', RU: 'Комбо', UA: 'комбо' },
        'mode_combo_title' :        { TW: '組合動作：手動組裝多部位動作並一鍵執行', CN: '组合动作：手动拼装多部位动作并一键执行', EN: 'Combo: assemble multi-part actions and run with one click', DE: 'Combo: Mehrteilige Aktionen zusammenstellen und mit einem Klick ausführen', FR: 'Combo : assemblez des actions en plusieurs parties et exécutez-les en un seul clic', RU: 'Комбо: соберите действия из нескольких частей и запустите их одним щелчком мыши.', UA: 'Комбінація: збирайте дії з кількох частин і запускайте їх одним клацанням миші' },
        'mode_custom'      :        { TW: '我的動作', CN: '我的动作', EN: 'My Actions', DE: 'Meine Aktionen', FR: 'Mes actions', RU: 'Мои действия', UA: 'Мої дії' },
        'mode_custom_title':        { TW: '我的動作：建立/管理自訂動作（替代 echo/迴聲）。', CN: '我的动作：创建/管理自定义动作（替代 echo/回声）。当前为测试版(Beta)', EN: 'My Actions: create/manage custom actions (replaces echo). Currently Beta', DE: 'Meine Aktionen: Benutzerdefinierte Aktionen erstellen/verwalten (ersetzt Echo).', FR: 'Mes actions : créer/gérer des actions personnalisées (remplace echo).', RU: 'Мои действия: создание и управление пользовательскими действиями (заменяет echo).', UA: 'Мої дії: створювати/керувати спеціальними діями (замінює echo).' },
        'beta_badge'       :        { TW: '測試版', CN: '测试版', EN: 'Beta', DE: 'Beta', FR: 'Bêta', RU: 'Бета', UA: 'Бета' },
        'self'             :        { TW: '自己', CN: '自己', EN: 'Self', DE: 'Selbst', FR: 'Soi', RU: 'Себя', UA: 'себе' },
        'self_title'       :        { TW: '切換自己模式', CN: '切换自己模式', EN: 'Toggle self mode', DE: 'Schalten Sie den Selbstmodus um', FR: 'Basculer en mode autonome', RU: 'Переключить самостоятельный режим', UA: 'Увімкнути режим себе' },
        'all'              :        { TW: '全員', CN: '全员', EN: 'All', DE: 'Alle', FR: 'Tous', RU: 'Все', UA: 'все' },
        'all_title'        :        { TW: '切換全員範圍：開啟後，動作將對房間內所有人執行', CN: '切换全员范围：开启后，动作将对房间内所有人执行', EN: 'Toggle all-range: when on, actions run on everyone in the room', DE: 'Gesamtbereich umschalten: Wenn diese Option aktiviert ist, werden Aktionen für alle Personen im Raum ausgeführt', FR: 'Activer toute la plage : lorsque cette option est activée, les actions s\'exécutent sur toutes les personnes présentes dans la pièce', RU: 'Переключить весь диапазон: если включено, действия выполняются для всех в комнате.', UA: 'Перемкнути весь діапазон: коли ввімкнено, дії виконуються для всіх у кімнаті' },
        'fav'              :        { TW: '收藏', CN: '收藏', EN: 'Favorite', DE: 'Favorit', FR: 'Préféré', RU: 'Любимый', UA: 'улюблений' },
        'fav_title'        :        { TW: '收藏模式：開啟後點選動作會加入/取消收藏', CN: '收藏模式：开启后点击动作会加入/取消收藏', EN: 'Favorite mode: clicking an action adds/removes it from favorites', DE: 'Favoritenmodus: Durch Klicken auf eine Aktion wird diese zu den Favoriten hinzugefügt bzw. daraus entfernt', FR: 'Mode favori : cliquer sur une action l\'ajoute/supprime des favoris', RU: 'Режим избранного: нажатие на действие добавляет или удаляет его из избранного.', UA: 'Режим вибраного: клацання дії додає або видаляє його з вибраного' },
        'fav_clear'        :        { TW: '清空全部收藏動作', CN: '清空全部收藏动作', EN: 'Clear all favorite actions', DE: 'Löschen Sie alle bevorzugten Aktionen', FR: 'Effacer toutes les actions favorites', RU: 'Очистить все избранные действия', UA: 'Очистити всі улюблені дії' },
        'x3'               :        { TW: '×3', CN: '×3', EN: '×3', DE: '×3', FR: '×3', RU: '×3', UA: '×3' },
        'x3_title'         :        { TW: '連續3次', CN: '连续3次', EN: 'Continuous x3', DE: 'Kontinuierlich x3', FR: 'Continu x3', RU: 'Непрерывный x3', UA: 'Безперервний х3' },
        'version'          :        { TW: '目前插件版本', CN: '当前插件版本', EN: 'Current plugin version', DE: 'Aktuelle Plugin-Version', FR: 'Version actuelle du plugin', RU: 'Текущая версия плагина', UA: 'Поточна версія плагіна' },
        'resize'           :        { TW: '拖曳縮放面板', CN: '拖动缩放面板', EN: 'Drag to resize panel', DE: 'Ziehen Sie, um die Größe des Bedienfelds zu ändern', FR: 'Faites glisser pour redimensionner le panneau', RU: 'Перетащите, чтобы изменить размер панели', UA: 'Перетягніть, щоб змінити розмір панелі' },
        'popover_back'     :        { TW: '返回人物列表', CN: '返回人物列表', EN: 'Back to character list', DE: 'Zurück zur Charakterliste', FR: 'Retour à la liste des personnages', RU: 'Вернуться к списку персонажей', UA: 'Назад до списку символів' },
        'popover_close'    :        { TW: '關閉', CN: '关闭', EN: 'Close', DE: 'Schließen', FR: 'Fermer', RU: 'Закрывать', UA: 'Закрити' },
        'chars'            :        { TW: '人物列表', CN: '人物列表', EN: 'Character list', DE: 'Charakterliste', FR: 'Liste des personnages', RU: 'Список персонажей', UA: 'Список символів' }
    });

    // target 命名空间
    QiActI18n.register('target', {
        'empty'      :        { TW: '房間無人', CN: '房间无人', EN: 'Room is empty', DE: 'Der Raum ist leer', FR: 'La salle est vide', RU: 'Комната пуста', UA: 'Кімната порожня' },
        'pick_part'  :        { TW: '點擊身體部位選擇動作', CN: '点击身体部位选择动作', EN: 'Click a body part to choose an action', DE: 'Klicken Sie auf einen Körperteil, um eine Aktion auszuwählen', FR: 'Cliquez sur une partie du corps pour choisir une action', RU: 'Нажмите на часть тела, чтобы выбрать действие', UA: 'Натисніть частину тіла, щоб вибрати дію' },
        'select_part':        { TW: '選擇部位', CN: '选择部位', EN: 'Select part', DE: 'Teil auswählen', FR: 'Sélectionner une pièce', RU: 'Выберите часть', UA: 'Виберіть частину' }
    });

    // common 命名空间
    QiActI18n.register('common', {
        'self'             :        { TW: '自己', CN: '自己', EN: 'Self', DE: 'Selbst', FR: 'Soi', RU: 'Себя', UA: 'себе' },
        'other'            :        { TW: '對方', CN: '对方', EN: 'Target', DE: 'Ziel', FR: 'Cible', RU: 'Цель', UA: 'Цільова' },
        'someone'          :        { TW: '某人', CN: '某人', EN: 'Someone', DE: 'Jemand', FR: 'Quelqu\'un', RU: 'Кто-то', UA: 'Хтось' },
        'enter_mode'       :        { TW: '動作模式已開啟', CN: '动作模式已开启', EN: 'Action mode enabled', DE: 'Aktionsmodus aktiviert', FR: 'Mode action activé', RU: 'Режим действий включен', UA: 'Режим дії ввімкнено' },
        'exit_mode'        :        { TW: '已退出動作模式', CN: '已退出动作模式', EN: 'Exited action mode', DE: 'Aktionsmodus verlassen', FR: 'Quitter le mode action', RU: 'Выход из режима действий', UA: 'Вийшов з режиму дії' },
        'all_on'           :        { TW: '全員範圍：開啟', CN: '全员范围：开启', EN: 'All-range: ON', DE: 'Gesamtbereich: EIN', FR: 'Toute la gamme : ON', RU: 'Вседиапазонный: ВКЛ.', UA: 'Весь діапазон: УВІМК' },
        'all_off'          :        { TW: '全員範圍：關閉', CN: '全员范围：关闭', EN: 'All-range: OFF', DE: 'Gesamtbereich: AUS', FR: 'Toute la gamme : OFF', RU: 'Весь диапазон: ВЫКЛ.', UA: 'Весь діапазон: ВИМК' },
        'fav_on'           :        { TW: '收藏模式：開啟 · 點選動作加入收藏', CN: '收藏模式：开启 · 点击动作加入收藏', EN: 'Favorite mode: ON · click an action to add', DE: 'Lieblingsmodus: EIN · Klicken Sie auf eine Aktion, um sie hinzuzufügen', FR: 'Mode favori : ON · cliquez sur une action à ajouter', RU: 'Режим избранного: ВКЛ. · щелкните действие, чтобы добавить его.', UA: 'Улюблений режим: УВІМКНЕНО · натисніть дію, щоб додати' },
        'fav_off'          :        { TW: '收藏模式：關閉', CN: '收藏模式：关闭', EN: 'Favorite mode: OFF', DE: 'Lieblingsmodus: AUS', FR: 'Mode favori : OFF', RU: 'Любимый режим: ВЫКЛ.', UA: 'Улюблений режим: ВИМК' },
        'fav_add'          :        { TW: '已收藏：{name}', CN: '已收藏：{name}', EN: 'Favorited: {name}', DE: 'Favorit: {name}', FR: 'Favoris : {name}', RU: 'Избранное: {name}', UA: 'Вибрано: {name}' },
        'fav_remove'       :        { TW: '取消收藏', CN: '取消收藏', EN: 'Unfavorited', DE: 'Nicht favorisiert', FR: 'Défavorisé', RU: 'Избранное', UA: 'Не додано до вибраного' },
        'self_on'          :        { TW: '自己模式：開啟', CN: '自己模式：开启', EN: 'Self mode: ON', DE: 'Selbstmodus: EIN', FR: 'Mode autonome : activé', RU: 'Авторежим: ВКЛ.', UA: 'Автономний режим: УВІМК' },
        'self_off'         :        { TW: '自己模式：關閉', CN: '自己模式：关闭', EN: 'Self mode: OFF', DE: 'Selbstmodus: AUS', FR: 'Mode autonome : OFF', RU: 'Авторежим: ВЫКЛ.', UA: 'Авторежим: ВИМК' },
        'no_fav'           :        { TW: '目前沒有收藏動作', CN: '当前没有收藏动作', EN: 'No favorite actions yet', DE: 'Noch keine Lieblingsaktionen', FR: 'Aucune action favorite pour l\'instant', RU: 'Избранных действий пока нет', UA: 'Ще немає улюблених дій' },
        'clear_fav_title'  :        { TW: '清空全部收藏', CN: '清空全部收藏', EN: 'Clear all favorites', DE: 'Alle Favoriten löschen', FR: 'Effacer tous les favoris', RU: 'Очистить все избранное', UA: 'Очистити всі вибрані' },
        'clear_fav_body'   :        { TW: '確定清空全部收藏動作嗎？', CN: '确定清空全部收藏动作吗？此操作无法撤销。', EN: 'Clear all favorite actions? This cannot be undone.', DE: 'Alle bevorzugten Aktionen löschen?', FR: 'Effacer toutes les actions favorites ?', RU: 'Очистить все избранные действия?', UA: 'Очистити всі улюблені дії?' },
        'clear_fav_confirm':        { TW: '全部清空', CN: '全部清空', EN: 'Clear all', DE: 'Alles löschen', FR: 'Tout effacer', RU: 'Очистить все', UA: 'Очистити все' },
        'cleared_fav'      :        { TW: '已清空全部收藏', CN: '已清空全部收藏', EN: 'All favorites cleared', DE: 'Alle Favoriten gelöscht', FR: 'Tous les favoris effacés', RU: 'Все избранное удалено', UA: 'Усі вибрані видалено' },
        'confirm_title'    :        { TW: '確認操作', CN: '确认操作', EN: 'Confirm', DE: 'Bestätigen', FR: 'Confirmer', RU: 'Подтверждать', UA: 'Підтвердити' },
        'confirm_ok'       :        { TW: '確定', CN: '确定', EN: 'OK', DE: 'OK', FR: 'D\'ACCORD', RU: 'ХОРОШО', UA: 'добре' },
        'confirm_cancel'   :        { TW: '取消', CN: '取消', EN: 'Cancel', DE: 'Stornieren', FR: 'Annuler', RU: 'Отмена', UA: 'Скасувати' }
    });

    // toast 命名空间
    QiActI18n.register('toast', {
        'need_item'              :        { TW: '該動作需要特定道具', CN: '该动作需要特定道具', EN: 'This action requires a specific item', DE: 'Für diese Aktion ist ein bestimmtes Element erforderlich', FR: 'Cette action nécessite un élément spécifique', RU: 'Для этого действия требуется определенный элемент', UA: 'Для цієї дії потрібен певний предмет' },
        'unavailable'            :        { TW: '該動作目前不可用', CN: '该动作当前不可用', EN: 'This action is currently unavailable', DE: 'Diese Aktion ist derzeit nicht verfügbar', FR: 'Cette action est actuellement indisponible', RU: 'Это действие в настоящее время недоступно', UA: 'Ця дія зараз недоступна' },
        'temporarily_unavailable':        { TW: '該動作暫不可用', CN: '该动作暂不可用', EN: 'This action is temporarily unavailable', DE: 'Diese Aktion ist vorübergehend nicht verfügbar', FR: 'Cette action est temporairement indisponible', RU: 'Это действие временно недоступно', UA: 'Ця дія тимчасово недоступна' },
        'exec_failed'            :        { TW: '執行失敗: {msg}', CN: '执行失败: {msg}', EN: 'Execution failed: {msg}', DE: 'Ausführung fehlgeschlagen: {msg}', FR: 'Échec de l\'exécution : {msg}', RU: 'Не удалось выполнить: {msg}', UA: 'Помилка виконання: {msg}' },
        'pick_action'            :        { TW: '請先選擇一個動作', CN: '请先选择一个动作', EN: 'Please select an action first', DE: 'Bitte wählen Sie zunächst eine Aktion aus', FR: 'Veuillez d\'abord sélectionner une action', RU: 'Сначала выберите действие', UA: 'Спочатку виберіть дію' },
        'no_others'              :        { TW: '房間內沒有其他人', CN: '房间内没有其他人', EN: 'No other members in the room', DE: 'Keine anderen Mitglieder im Raum', FR: 'Aucun autre membre dans la salle', RU: 'В комнате нет других участников', UA: 'У кімнаті немає інших учасників' },
        'exec_all'               :        { TW: '開始對所有成員執行：{name}', CN: '开始对所有成员执行：{name}', EN: 'Executing on all members: {name}', DE: 'Wird auf allen Mitgliedern ausgeführt: {name}', FR: 'Exécution sur tous les membres : {name}', RU: 'Выполняется на всех участниках: {name}', UA: 'Виконується для всіх учасників: {name}' },
        'no_last'                :        { TW: '沒有上次的動作紀錄', CN: '没有上次的动作记录', EN: 'No last action recorded', DE: 'Keine letzte Aktion aufgezeichnet', FR: 'Aucune dernière action enregistrée', RU: 'Последнее действие не записано', UA: 'Остання дія не записана' },
        'target_not_in_room'     :        { TW: '目標不在房間內', CN: '目标不在房间内', EN: 'Target is not in the room', DE: 'Ziel ist nicht im Raum', FR: 'La cible n\'est pas dans la pièce', RU: 'Цель не в комнате', UA: 'Цілі немає в кімнаті' },
        'repeat'                 :        { TW: '重複：{name}', CN: '重复：{name}', EN: 'Repeat: {name}', DE: 'Wiederholen Sie: {name}', FR: 'Répéter : {name}', RU: 'Повторите: {name}', UA: 'Повтор: {name}' },
        'pick_part'              :        { TW: '請先選擇一個人物部位', CN: '请先选择一个人物部位', EN: 'Please select a character part first', DE: 'Bitte wählen Sie zuerst einen Charakterteil aus', FR: 'Veuillez d\'abord sélectionner une partie de personnage', RU: 'Пожалуйста, сначала выберите часть персонажа', UA: 'Спочатку виберіть частину персонажа' },
        'mode_on_first'          :        { TW: '請先開啟動作模式', CN: '请先开启动作模式', EN: 'Please enable action mode first', DE: 'Bitte aktivieren Sie zuerst den Aktionsmodus', FR: 'Veuillez d\'abord activer le mode action', RU: 'Пожалуйста, сначала включите режим действия', UA: 'Спочатку ввімкніть режим дії' },
        'refreshed_custom'       :        { TW: '我的動作清單已刷新', CN: '我的动作列表已刷新', EN: 'My Actions list refreshed', DE: 'Meine Aktionsliste wurde aktualisiert', FR: 'Ma liste d\'actions actualisée', RU: 'Список моих действий обновлен.', UA: 'Список моїх дій оновлено' },
        'refreshed_combo'        :        { TW: '組合清單已刷新', CN: '组合列表已刷新', EN: 'Combo list refreshed', DE: 'Kombinationsliste aktualisiert', FR: 'Liste combinée actualisée', RU: 'Список комбинаций обновлен.', UA: 'Комбінований список оновлено' },
        'refreshed_actions'      :        { TW: '動作清單已刷新', CN: '动作列表已刷新', EN: 'Action list refreshed', DE: 'Aktionsliste aktualisiert', FR: 'Liste d\'actions actualisée', RU: 'Список действий обновлен.', UA: 'Список дій оновлено' },
        'pick_char'              :        { TW: '請先在左側選擇人物', CN: '请先在左侧选择人物', EN: 'Please select a character on the left first', DE: 'Bitte wählen Sie zunächst links ein Zeichen aus', FR: 'Veuillez d\'abord sélectionner un personnage à gauche', RU: 'Пожалуйста, сначала выберите символ слева', UA: 'Спочатку виберіть символ ліворуч' },
        'executed'               :        { TW: '已執行：{name}', CN: '已执行：{name}', EN: 'Executed: {name}', DE: 'Ausgeführt: {name}', FR: 'Exécuté : {name}', RU: 'Выполнено: {name}', UA: 'Виконано: {name}' },
        'added_to_combo'         :        { TW: '已加入「{name}」', CN: '已加入「{name}」', EN: 'Added to "{name}"', DE: 'Hinzugefügt zu „{name}“', FR: 'Ajouté à "{name}"', RU: 'Добавлено в "{name}"', UA: 'Додано до "{name}"' },
        'combo_empty'            :        { TW: '組合為空', CN: '组合为空', EN: 'Combo is empty', DE: 'Combo ist leer', FR: 'La combinaison est vide', RU: 'Комбо пусто', UA: 'Комбо порожнє' },
        'exec_combo'             :        { TW: '執行組合“{name}”· {n} 步', CN: '执行组合「{name}」· {n} 步', EN: 'Executing combo "{name}" · {n} steps', DE: 'Kombination „{name}“ · {n} Schritte wird ausgeführt', FR: 'Exécution du combo "{name}" · {n} étapes', RU: 'Выполнение комбо "{name}" · {n} шагов', UA: 'Виконання комбо "{name}" · {n} кроків' },
        'exec_combo_all'         :        { TW: '開始對所有人執行組合“{name}”', CN: '开始对所有人执行组合「{name}」', EN: 'Executing combo "{name}" on everyone', DE: 'Die Kombination „{name}“ wird für alle ausgeführt', FR: 'Exécution du combo "{name}" sur tout le monde', RU: 'Выполнение комбо "{name}" для всех', UA: 'Виконання комбо "{name}" для всіх' },
        'sync_failed'            :        { TW: '設定同步到伺服器失敗，已保留在本地', CN: '设置同步到服务器失败，已保留在本地', EN: 'Failed to sync settings to server; kept locally', DE: 'Die Einstellungen konnten nicht mit dem Server synchronisiert werden.', FR: 'Échec de la synchronisation des paramètres avec le serveur ;', RU: 'Не удалось синхронизировать настройки с сервером;', UA: 'Не вдалося синхронізувати налаштування із сервером;' },
        'combo_saved'            :        { TW: '組合已儲存', CN: '组合已保存', EN: 'Combo saved', DE: 'Combo gespeichert', FR: 'Combinaison enregistrée', RU: 'Комбо сохранено.', UA: 'Комбінацію збережено' },
        'custom_saved'           :        { TW: '自訂動作已儲存', CN: '自定义动作已保存', EN: 'Custom action saved', DE: 'Benutzerdefinierte Aktion gespeichert', FR: 'Action personnalisée enregistrée', RU: 'Специальное действие сохранено.', UA: 'Власну дію збережено' },
        'deleted'                :        { TW: '已刪除', CN: '已删除', EN: 'Deleted', DE: 'Gelöscht', FR: 'Supprimé', RU: 'Удалено', UA: 'Видалено' },
        'fill_name'              :        { TW: '請填寫動作名稱', CN: '请填写动作名称', EN: 'Please enter an action name', DE: 'Bitte geben Sie einen Aktionsnamen ein', FR: 'Veuillez saisir un nom d\'action', RU: 'Введите название действия', UA: 'Введіть назву дії' },
        'fill_dialog'            :        { TW: '請填寫對話文本', CN: '请填写对话文本', EN: 'Please enter dialog text', DE: 'Bitte geben Sie den Dialogtext ein', FR: 'Veuillez saisir le texte de la boîte de dialogue', RU: 'Пожалуйста, введите текст диалога', UA: 'Будь ласка, введіть текст діалогу' },
        'echo_notfound'          :        { TW: '未找到 echo 數據', CN: '未找到 echo 数据', EN: 'echo data not found', DE: 'Echodaten nicht gefunden', FR: 'données d\'écho introuvables', RU: 'эхо-данные не найдены', UA: 'ехо-дані не знайдені' },
        'echo_cleaned'           :        { TW: '已清理原 echo 資料（{n} 項）', CN: '已清理原 echo 数据（{n} 项）', EN: 'Cleared original echo data ({n} items)', DE: 'Ursprüngliche Echodaten gelöscht ({n} Elemente)', FR: 'Données d\'écho d\'origine effacées ({n} éléments)', RU: 'Исходные эхо-данные удалены (элементов: {n})', UA: 'Очищено оригінальні ехо-дані ({n} елементів)' },
        'echo_clean_failed'      :        { TW: '清理失敗：{msg}', CN: '清理失败：{msg}', EN: 'Cleanup failed: {msg}', DE: 'Bereinigung fehlgeschlagen: {msg}', FR: 'Échec du nettoyage : {msg}', RU: 'Очистка не удалась: {msg}', UA: 'Помилка очищення: {msg}' },
        'import_echo_notfound'   :        { TW: '未找到 echo/迴聲 的動作數據', CN: '未找到 echo/回声 的动作数据', EN: 'echo action data not found', DE: 'Echo-Aktionsdaten nicht gefunden', FR: 'données d\'action d\'écho introuvables', RU: 'данные эхо-действия не найдены', UA: 'дані дії echo не знайдено' },
        'imported_echo'          :        { TW: '已從 echo/迴聲 匯入 {n} 個動作', CN: '已从 echo/回声 导入 {n} 个动作', EN: 'Imported {n} actions from echo', DE: '{n} Aktionen aus Echo importiert', FR: '{n} actions importées depuis echo', RU: 'Импортировано {n} действий из echo.', UA: 'Імпортовано {n} дій із echo' },
        'import_failed'          :        { TW: '導入失敗：{msg}', CN: '导入失败：{msg}', EN: 'Import failed: {msg}', DE: 'Import fehlgeschlagen: {msg}', FR: 'Échec de l\'importation : {msg}', RU: 'Не удалось импортировать: {msg}', UA: 'Помилка імпорту: {msg}' },
        'exported'               :        { TW: '已匯出 {n} 個動作', CN: '已导出 {n} 个动作', EN: 'Exported {n} actions', DE: '{n} Aktionen exportiert', FR: '{n} actions exportées', RU: 'Экспортировано {n} действий.', UA: 'Експортовано {n} дій' },
        'export_failed'          :        { TW: '匯出失敗：{msg}', CN: '导出失败：{msg}', EN: 'Export failed: {msg}', DE: 'Export fehlgeschlagen: {msg}', FR: 'Échec de l\'exportation : {msg}', RU: 'Не удалось экспортировать: {msg}', UA: 'Помилка експорту: {msg}' },
        'file_format_err'        :        { TW: '文件格式錯誤：應為動作物件數組', CN: '文件格式错误：应为动作对象数组', EN: 'Invalid file format: expected an array of action objects', DE: 'Ungültiges Dateiformat: Es wurde ein Array von Aktionsobjekten erwartet', FR: 'Format de fichier invalide : un tableau d\'objets d\'action attendu', RU: 'Неверный формат файла: ожидается массив объектов действий.', UA: 'Недійсний формат файлу: очікується масив об’єктів дії' },
        'json_parse_failed'      :        { TW: 'JSON 解析失敗：{msg}', CN: 'JSON 解析失败：{msg}', EN: 'JSON parse failed: {msg}', DE: 'JSON-Analyse fehlgeschlagen: {msg}', FR: 'Échec de l\'analyse JSON : {msg}', RU: 'Ошибка анализа JSON: {msg}', UA: 'Помилка аналізу JSON: {msg}' },
        'read_file_failed'       :        { TW: '讀取文件失敗', CN: '读取文件失败', EN: 'Failed to read file', DE: 'Datei konnte nicht gelesen werden', FR: 'Échec de la lecture du fichier', RU: 'Не удалось прочитать файл', UA: 'Не вдалося прочитати файл' },
        'exec_custom'            :        { TW: '執行：{name}', CN: '执行：{name}', EN: 'Execute: {name}', DE: 'Ausführen: {name}', FR: 'Exécuter : {name}', RU: 'Выполнить: {name}', UA: 'Виконати: {name}' },
        'read_ext_failed'        :        { TW: '讀取擴充設定失敗', CN: '读取扩展设置失败', EN: 'Failed to read extension settings', DE: 'Erweiterungseinstellungen konnten nicht gelesen werden', FR: 'Échec de la lecture des paramètres de l\'extension', RU: 'Не удалось прочитать настройки расширения.', UA: 'Не вдалося прочитати налаштування розширення' },
        'import_done'            :        { TW: '導入完成：新增 {n} 個，更新 {m} 個', CN: '导入完成：新增 {n} 个，更新 {m} 个', EN: 'Import done: {n} new, {m} updated', DE: 'Import abgeschlossen: {n} neu, {m} aktualisiert', FR: 'Importation terminée : {n} nouveaux, {m} mis à jour', RU: 'Импорт выполнен: новых: {n}, обновленных: {m}.', UA: 'Імпорт завершено: {n} нових, {m} оновлено' }
    });

    // custom 命名空间
    QiActI18n.register('custom', {
        'title'                   :        { TW: '我的動作（測試版）', CN: '我的动作（测试版）', EN: 'My Actions (Beta)', DE: 'Meine Aktionen (Beta)', FR: 'Mes actions (bêta)', RU: 'Мои действия (бета)', UA: 'Мої дії (бета)' },
        'search_placeholder'      :        { TW: '搜尋動作...', CN: '搜索动作...', EN: 'Search actions...', DE: 'Suchaktionen...', FR: 'Actions de recherche...', RU: 'Поиск действий...', UA: 'Пошукові дії...' },
        'new'                     :        { TW: '新建', CN: '新建', EN: 'New', DE: 'Neu', FR: 'Nouveau', RU: 'Новый', UA: 'новий' },
        'import'                  :        { TW: '導入', CN: '导入', EN: 'Import', DE: 'Import', FR: 'Importer', RU: 'Импорт', UA: 'Імпорт' },
        'import_tooltip'          :        { TW: '從 echo/迴聲 或本地 JSON 匯入自訂動作', CN: '从 echo/回声 或本地 JSON 导入自定义动作', EN: 'Import custom actions from echo or local JSON', DE: 'Importieren Sie benutzerdefinierte Aktionen aus Echo oder lokalem JSON', FR: 'Importer des actions personnalisées depuis echo ou JSON local', RU: 'Импортируйте пользовательские действия из echo или локального JSON.', UA: 'Імпорт спеціальних дій із echo або локального JSON' },
        'import_echo'             :        { TW: '從 echo/迴聲 導入', CN: '从 echo/回声 导入', EN: 'Import from echo', DE: 'Import aus Echo', FR: 'Importer depuis echo', RU: 'Импорт из эха', UA: 'Імпорт з echo' },
        'import_file'             :        { TW: '從本地 JSON 匯入', CN: '从本地 JSON 导入', EN: 'Import from local JSON', DE: 'Import aus lokalem JSON', FR: 'Importer à partir du JSON local', RU: 'Импорт из локального JSON', UA: 'Імпорт з локального JSON' },
        'export'                  :        { TW: '導出為 JSON', CN: '导出为 JSON', EN: 'Export as JSON', DE: 'Als JSON exportieren', FR: 'Exporter au format JSON', RU: 'Экспортировать в формате JSON', UA: 'Експорт як JSON' },
        'editmode_on'             :        { TW: '完成編輯', CN: '完成编辑', EN: 'Finish editing', DE: 'Beenden Sie die Bearbeitung', FR: 'Terminer la modification', RU: 'Завершить редактирование', UA: 'Завершити редагування' },
        'editmode_off'            :        { TW: '編輯模式：拖曳排序與批次管理', CN: '编辑模式：拖动排序与批量管理', EN: 'Edit mode: drag to reorder & batch manage', DE: 'Bearbeitungsmodus: Zum Neuanordnen und Stapelverwalten ziehen', FR: 'Mode édition : faites glisser pour réorganiser et gérer les lots', RU: 'Режим редактирования: перетащите, чтобы изменить порядок и управлять пакетами', UA: 'Режим редагування: перетягніть, щоб змінити порядок і пакетне керування' },
        'toggleall_on'            :        { TW: '目前全部開啟，點選全部關閉', CN: '当前全部开启，点击全部关闭', EN: 'All on; click to turn all off', DE: 'Alles an;', FR: 'Tout est allumé ;', RU: 'Все включено;', UA: 'Все включено;' },
        'toggleall_off'           :        { TW: '目前全部關閉，點選全部開啟', CN: '当前全部关闭，点击全部开启', EN: 'All off; click to turn all on', DE: 'Alles aus;', FR: 'Tout est éteint ;', RU: 'Все выключено;', UA: 'Все вимкнено;' },
        'chip_all'                :        { TW: '全部', CN: '全部', EN: 'All', DE: 'Alle', FR: 'Tous', RU: 'Все', UA: 'все' },
        'chip_xiaosu'             :        { TW: '小酥', CN: '小酥', EN: 'XiaoSu', DE: 'XiaoSu', FR: 'XiaoSu', RU: 'СяоСу', UA: 'СяоСу' },
        'chip_native'             :        { TW: '我的', CN: '我的', EN: 'Mine', DE: 'Meins', FR: 'Le mien', RU: 'Мой', UA: 'моя' },
        'select_all'              :        { TW: '全選', CN: '全选', EN: 'Select all', DE: 'Alles auswählen', FR: 'Tout sélectionner', RU: 'Выбрать все', UA: 'Вибрати все' },
        'selected_count'          :        { TW: '已選 {n} 個', CN: '已选 {n} 个', EN: '{n} selected', DE: '{n} ausgewählt', FR: '{n} sélectionné', RU: '{n} выбрано', UA: 'Вибрано {n}' },
        'cancel_select_all'       :        { TW: '取消全選', CN: '取消全选', EN: 'Deselect all', DE: 'Alle abwählen', FR: 'Tout désélectionner', RU: 'Отменить выбор всех', UA: 'Зняти вибір із усіх' },
        'batch_close'             :        { TW: '大量關閉', CN: '批量关闭', EN: 'Batch off', DE: 'Batch ab', FR: 'Lot', RU: 'Пакетное отключение', UA: 'Вимкнути партію' },
        'batch_delete'            :        { TW: '大量刪除', CN: '批量删除', EN: 'Batch delete', DE: 'Stapellöschung', FR: 'Suppression par lots', RU: 'Пакетное удаление', UA: 'Пакетне видалення' },
        'beta_banner'             :        { TW: '自訂動作功能目前為【測試版(Beta)】，仍在開發中，可能存在不穩定或未完善之處，建議謹慎使用並及時回饋問題。', CN: '自定义动作功能当前为【测试版(Beta)】，仍在开发中，可能存在不稳定或未完善之处，建议谨慎使用并及时反馈问题。', EN: 'Custom Actions is currently [Beta], still in development; may be unstable. Use with caution and report issues.', DE: 'Benutzerdefinierte Aktionen befinden sich derzeit in der [Beta]-Phase und befinden sich noch in der Entwicklung.', FR: 'Les actions personnalisées sont actuellement en [bêta], toujours en développement ;', RU: 'Пользовательские действия в настоящее время находятся в стадии [бета-версии] и все еще находятся в разработке;', UA: 'Спеціальні дії наразі [бета], ще в розробці;' },
        'echo_clean_text'         :        { TW: '偵測到原 echo/迴聲 中仍有 {n} 個自訂動作資料。', CN: '检测到原 echo/回声 中仍有 {n} 个自定义动作数据。迁移完成后建议清理，避免动作重复显示与使用后乱码。', EN: 'Detected {n} custom action entries still in original echo. Clean up after migration to avoid duplicates and garbled text.', DE: 'Es wurden {n} benutzerdefinierte Aktionseinträge erkannt, die sich immer noch im ursprünglichen Echo befinden.', FR: '{n} entrées d\'action personnalisée détectées, toujours dans l\'écho d\'origine.', RU: 'Обнаружено {n} записей специальных действий, которые все еще находятся в исходном эхе.', UA: 'Виявлено {n} записів користувацьких дій, які все ще залишаються в оригінальному відлунні.' },
        'echo_clean_btn'          :        { TW: '清理原 echo 數據', CN: '清理原 echo 数据', EN: 'Clean original echo data', DE: 'Bereinigen Sie die ursprünglichen Echodaten', FR: 'Nettoyer les données d\'écho d\'origine', RU: 'Очистить исходные эхо-данные', UA: 'Очистити оригінальні ехо-дані' },
        'xiaosu_pack_label'       :        { TW: '內建小酥動作包', CN: '内置小酥动作包', EN: 'Built-in XiaoSu pack', DE: 'Integriertes XiaoSu-Paket', FR: 'Pack XiaoSu intégré', RU: 'Встроенный пакет XiaoSu.', UA: 'Вбудований пакет XiaoSu' },
        'xiaosu_pack_title'       :        { TW: '內建小酥動作包（XiaoSuActivity 全部 51 個動作，預編譯進插件，離線可用，無需原版插件）', CN: '内置小酥动作包（XiaoSuActivity 全部 51 个动作，预编译进插件，离线可用，无需原版插件）', EN: 'Built-in XiaoSu pack (all 51 XiaoSuActivity actions, precompiled, works offline, no original plugin needed)', DE: 'Integriertes XiaoSu-Paket (alle 51 XiaoSuActivity-Aktionen, vorkompiliert, funktioniert offline, kein Original-Plugin erforderlich)', FR: 'Pack XiaoSu intégré (les 51 actions XiaoSuActivity, précompilées, fonctionne hors ligne, aucun plugin d\'origine requis)', RU: 'Встроенный пакет XiaoSu (все 51 действие XiaoSuActivity предварительно скомпилированы, работают в автономном режиме, оригинальный плагин не требуется)', UA: 'Вбудований пакет XiaoSu (всі 51 дія XiaoSuActivity, попередньо скомпільовані, працюють в автономному режимі, оригінальний плагін не потрібен)' },
        'xiaosu_pack_toggle_title':        { TW: '開啟後，「我的動作」與 BC 原生動作清單顯示小酥動作拓展的全部動作', CN: '开启后，「我的动作」与 BC 原生动作列表显示小酥动作拓展的全部动作', EN: 'When on, My Actions and BC native action list show all XiaoSu extended actions', DE: 'Wenn diese Option aktiviert ist, werden in „Meine Aktionen“ und in der BC-nativen Aktionsliste alle erweiterten XiaoSu-Aktionen angezeigt', FR: 'Lorsque cette option est activée, Mes actions et la liste d\'actions natives BC affichent toutes les actions étendues de XiaoSu.', RU: 'Если этот параметр включен, в списке «Мои действия» и собственном списке действий BC отображаются все расширенные действия XiaoSu.', UA: 'Коли ввімкнено, Мої дії та рідний список дій BC показують усі розширені дії XiaoSu' },
        'xiaosu_pack_src_title'   :        { TW: '內建小酥動作包（預編譯，無需原版插件）', CN: '内置小酥动作包（预编译，无需原版插件）', EN: 'Built-in XiaoSu pack (precompiled, no original plugin needed)', DE: 'Integriertes XiaoSu-Paket (vorkompiliert, kein Original-Plugin erforderlich)', FR: 'Pack XiaoSu intégré (précompilé, aucun plugin d\'origine requis)', RU: 'Встроенный пакет XiaoSu (предварительно скомпилированный, оригинальный плагин не требуется)', UA: 'Вбудований пакет XiaoSu (попередньо скомпільований, оригінальний плагін не потрібен)' },
        'src_echo_title'          :        { TW: '來自 echo/迴聲 導入', CN: '来自 echo/回声 导入', EN: 'Imported from echo', DE: 'Von Echo importiert', FR: 'Importé depuis echo', RU: 'Импортировано из эха', UA: 'Імпортовано з echo' },
        'src_qiact_title'         :        { TW: '本插件創建', CN: '本插件创建', EN: 'Created by this plugin', DE: 'Erstellt von diesem Plugin', FR: 'Créé par ce plugin', RU: 'Создано этим плагином', UA: 'Створено цим плагіном' },
        'empty'                   :        { TW: '還沒有自訂動作。', CN: '还没有自定义动作。点「新建」创建，或点「导入」从 echo/回声 迁移。', EN: 'No custom actions yet. Click "New" to create, or "Import" to migrate from echo.', DE: 'Noch keine benutzerdefinierten Aktionen.', FR: 'Aucune action personnalisée pour l\'instant.', RU: 'Специальных действий пока нет.', UA: 'Спеціальних дій ще немає.' },
        'filter_empty'            :        { TW: '目前分類下沒有動作。', CN: '当前分类下没有动作。', EN: 'No actions in this category.', DE: 'Keine Aktionen in dieser Kategorie.', FR: 'Aucune action dans cette catégorie.', RU: 'В этой категории нет действий.', UA: 'Жодних дій у цій категорії.' },
        'scope_self'              :        { TW: '僅自己', CN: '仅自己', EN: 'Self only', DE: 'Nur ich selbst', FR: 'Soi seulement', RU: 'Только для себя', UA: 'Тільки для себе' },
        'scope_other'             :        { TW: '僅他人', CN: '仅他人', EN: 'Others only', DE: 'Nur andere', FR: 'Autres seulement', RU: 'Только другие', UA: 'Лише інші' },
        'scope_any'               :        { TW: '皆可', CN: '皆可', EN: 'Anyone', DE: 'Irgendjemand', FR: 'N\'importe qui', RU: 'Любой', UA: 'хто завгодно' },
        'src_xiaosu'              :        { TW: '小酥', CN: '小酥', EN: 'XiaoSu', DE: 'XiaoSu', FR: 'XiaoSu', RU: 'СяоСу', UA: 'СяоСу' },
        'src_echo'                :        { TW: 'echo', CN: 'echo', EN: 'echo', DE: 'Echo', FR: 'écho', RU: 'эхо', UA: 'луна' },
        'src_qiact'               :        { TW: 'QiAct', CN: 'QiAct', EN: 'QiAct', DE: 'QiAct', FR: 'QiAct', RU: 'QiAct', UA: 'QiAct' },
        'drag_handle'             :        { TW: '拖曳排序', CN: '拖动排序', EN: 'Drag to reorder', DE: 'Zum Neuanordnen ziehen', FR: 'Faites glisser pour réorganiser', RU: 'Перетащите, чтобы изменить порядок', UA: 'Перетягніть, щоб змінити порядок' },
        'vis_on'                  :        { TW: '顯示中', CN: '显示中', EN: 'Visible', DE: 'Sichtbar', FR: 'Visible', RU: 'Видимый', UA: 'Видно' },
        'vis_off'                 :        { TW: '已隱藏', CN: '已隐藏', EN: 'Hidden', DE: 'Versteckt', FR: 'Caché', RU: 'Скрытый', UA: 'Прихований' },
        'vis_toggle_title'        :        { TW: '在「動作」面板和 BC 原生動作清單中顯示', CN: '在「动作」面板和 BC 原生动作列表中显示', EN: 'Show in Action panel and BC native action list', DE: 'Im Aktionsbereich und in der BC-nativen Aktionsliste anzeigen', FR: 'Panneau Afficher dans l\'action et liste d\'actions natives de la Colombie-Britannique', RU: 'Показывать на панели действий и в собственном списке действий BC.', UA: 'Показати на панелі дій і списку власних дій BC' },
        'vis_label_on'            :        { TW: '顯示', CN: '显示', EN: 'Show', DE: 'Zeigen', FR: 'Montrer', RU: 'Показывать', UA: 'Показати' },
        'vis_label_off'           :        { TW: '隱藏', CN: '隐藏', EN: 'Hide', DE: 'Verstecken', FR: 'Cacher', RU: 'Скрывать', UA: 'Сховати' },
        'run_title'               :        { TW: '對目前目標執行', CN: '对当前目标执行', EN: 'Execute on current target', DE: 'Auf aktuellem Ziel ausführen', FR: 'Exécuter sur la cible actuelle', RU: 'Выполнить по текущей цели', UA: 'Виконати на поточній цілі' },
        'edit_title'              :        { TW: '編輯', CN: '编辑', EN: 'Edit', DE: 'Bearbeiten', FR: 'Modifier', RU: 'Редактировать', UA: 'Редагувати' },
        'delete_title'            :        { TW: '刪除', CN: '删除', EN: 'Delete', DE: 'Löschen', FR: 'Supprimer', RU: 'Удалить', UA: 'Видалити' },
        'echo_clean_confirm_title':        { TW: '清理原 echo 數據', CN: '清理原 echo 数据', EN: 'Clean original echo data', DE: 'Bereinigen Sie die ursprünglichen Echodaten', FR: 'Nettoyer les données d\'écho d\'origine', RU: 'Очистить исходные эхо-данные', UA: 'Очистити оригінальні ехо-дані' },
        'echo_clean_confirm_body' :        { TW: '確定清理原 echo/迴聲 中的自訂動作資料嗎？', CN: '确定清理原 echo/回声 中的自定义动作数据吗？\n仅删除其「动作数据」，不影响本插件与其他配置（清理后系统更稳定）。', EN: 'Clean custom action data from original echo?\nOnly its "action data" is removed; this plugin and other settings are unaffected (cleaner after).', DE: 'Benutzerdefinierte Aktionsdaten vom ursprünglichen Echo bereinigen?', FR: 'Nettoyer les données d\'action personnalisées de l\'écho d\'origine ?', RU: 'Очистить данные специальных действий из исходного эха?', UA: 'Очистити дані користувацьких дій із оригінального відлуння?' },
        'echo_clean_confirm_btn'  :        { TW: '清理', CN: '清理', EN: 'Clean', DE: 'Sauber', FR: 'Faire le ménage', RU: 'Чистый', UA: 'чистий' },
        'delete_confirm_title'    :        { TW: '刪除動作', CN: '删除动作', EN: 'Delete action', DE: 'Aktion löschen', FR: 'Supprimer l\'action', RU: 'Удалить действие', UA: 'Видалити дію' },
        'delete_confirm_body'     :        { TW: '確定刪除自訂動作“{name}”嗎？', CN: '确定删除自定义动作「{name}」吗？', EN: 'Delete custom action "{name}"?', DE: 'Benutzerdefinierte Aktion „{name}“ löschen?', FR: 'Supprimer l\'action personnalisée "{name}" ?', RU: 'Удалить специальное действие "{name}"?', UA: 'Видалити спеціальну дію "{name}"?' },
        'delete_confirm_btn'      :        { TW: '刪除', CN: '删除', EN: 'Delete', DE: 'Löschen', FR: 'Supprimer', RU: 'Удалить', UA: 'Видалити' },
        'toggle_all_on_toast'     :        { TW: '已開啟全部 {n} 個動作', CN: '已开启全部 {n} 个动作', EN: 'Enabled all {n} actions', DE: 'Alle {n} Aktionen aktiviert', FR: 'Activé toutes les {n} actions', RU: 'Включены все действия: {n}.', UA: 'Увімкнено всі дії ({n}).' },
        'toggle_all_off_toast'    :        { TW: '已關閉全部 {n} 個動作', CN: '已关闭全部 {n} 个动作', EN: 'Disabled all {n} actions', DE: 'Alle {n} Aktionen deaktiviert', FR: 'Désactivé toutes les {n} actions', RU: 'Отключены все действия: {n}.', UA: 'Вимкнено всі дії ({n}).' },
        'show_toast'              :        { TW: '已顯示“{name}”', CN: '已显示「{name}」', EN: 'Shown "{name}"', DE: 'Angezeigt „{name}“', FR: 'Affiché "{name}"', RU: 'Показано "{name}"', UA: 'Показано "{name}"' },
        'hide_toast'              :        { TW: '已隱藏「{name}」', CN: '已隐藏「{name}」', EN: 'Hidden "{name}"', DE: 'Versteckt „{name}“', FR: '"{name}" masqué', RU: 'Скрытый "{name}"', UA: 'Прихований "{name}"' },
        'batch_close_toast'       :        { TW: '已批次關閉 {n} 個動作', CN: '已批量关闭 {n} 个动作', EN: 'Batch-disabled {n} actions', DE: 'Batch-deaktivierte {n} Aktionen', FR: '{n} actions désactivées par lots', RU: 'Пакетное отключение {n} действий', UA: 'Пакетно вимкнено {n} дій' },
        'batch_delete_title'      :        { TW: '批次刪除 {n} 個動作', CN: '批量删除 {n} 个动作', EN: 'Batch delete {n} actions', DE: 'Batch-Löschung von {n} Aktionen', FR: 'Suppression par lots de {n} actions', RU: 'Пакетное удаление {n} действий', UA: 'Групове видалення {n} дій' },
        'batch_delete_body'       :        { TW: '確定大量刪除以下動作嗎？\n{names}', CN: '确定批量删除以下动作吗？\n{names}', EN: 'Delete the following actions in batch?\n{names}', DE: 'Folgende Aktionen im Batch löschen?\n{names}', FR: 'Supprimer les actions suivantes par lots ?\n{names}', RU: 'Удалить следующие действия в пакетном режиме?\n{names}', UA: 'Видалити наступні дії в пакеті?\n{names}' },
        'batch_delete_btn'        :        { TW: '全部刪除', CN: '全部删除', EN: 'Delete all', DE: 'Alles löschen', FR: 'Supprimer tout', RU: 'Удалить все', UA: 'Видалити все' },
        'batch_deleted_toast'     :        { TW: '已大量刪除 {n} 個動作', CN: '已批量删除 {n} 个动作', EN: 'Batch-deleted {n} actions', DE: 'Batch-gelöschte {n} Aktionen', FR: '{n} actions supprimées par lot', RU: 'Пакетно удалено {n} действий', UA: 'Пакетно видалено {n} дій' }
    });

    // editor 命名空间
    QiActI18n.register('editor', {
        'pick_part_hint'    :        { TW: '點選框選身體部位', CN: '点击框选身体部位', EN: 'Click to select a body part', DE: 'Klicken Sie, um ein Körperteil auszuwählen', FR: 'Cliquez pour sélectionner une partie du corps', RU: 'Нажмите, чтобы выбрать часть тела', UA: 'Натисніть, щоб вибрати частину тіла' },
        'new_title'         :        { TW: '新建：自訂動作', CN: '新建：自定义动作', EN: 'New: Custom Action', DE: 'Neu: Benutzerdefinierte Aktion', FR: 'Nouveau : action personnalisée', RU: 'Новое: пользовательское действие', UA: 'Нове: спеціальна дія' },
        'edit_title'        :        { TW: '編輯：自訂動作', CN: '编辑：自定义动作', EN: 'Edit: Custom Action', DE: 'Bearbeiten: Benutzerdefinierte Aktion', FR: 'Modifier : Action personnalisée', RU: 'Изменить: пользовательское действие', UA: 'Редагувати: спеціальна дія' },
        'name_label'        :        { TW: '動作名稱', CN: '动作名称', EN: 'Action name', DE: 'Aktionsname', FR: 'Nom de l\'action', RU: 'Название действия', UA: 'Назва дії' },
        'name_placeholder'  :        { TW: '如：輕輕咬住', CN: '如：轻轻咬住', EN: 'e.g. gently bite', DE: 'z.B.', FR: 'par ex.', RU: 'например', UA: 'напр.' },
        'scope_label'       :        { TW: '誰能使用這個動作', CN: '谁能使用这个动作', EN: 'Who can use this action', DE: 'Wer kann diese Aktion nutzen?', FR: 'Qui peut utiliser cette action', RU: 'Кто может использовать это действие', UA: 'Хто може скористатися цією дією' },
        'part_label'        :        { TW: '身體部位', CN: '身体部位', EN: 'Body part', DE: 'Körperteil', FR: 'Partie du corps', RU: 'Часть тела', UA: 'Частина тіла' },
        'part_change'       :        { TW: '點擊下圖重新選擇', CN: '点击下图重新选择', EN: 'Click the diagram below to reselect', DE: 'Klicken Sie auf das Diagramm unten, um es erneut auszuwählen', FR: 'Cliquez sur le diagramme ci-dessous pour resélectionner', RU: 'Нажмите на диаграмму ниже, чтобы повторно выбрать', UA: 'Натисніть діаграму нижче, щоб повторно вибрати' },
        'dialog_other_label':        { TW: '對他人時顯示', CN: '对他人时显示', EN: 'Shown to others', DE: 'Anderen gezeigt', FR: 'Montré aux autres', RU: 'Показан другим', UA: 'Показано іншим' },
        'dialog_other_ph'   :        { TW: '如：輕輕咬住了 對方 的耳朵', CN: '如：轻轻咬住了 对方 的耳朵', EN: 'e.g. gently bit {TargetCharacter}\'s ear', DE: 'z.B. {TargetCharacter}', FR: 'par ex. {TargetCharacter}', RU: 'например {TargetCharacter}', UA: 'напр. {TargetCharacter}' },
        'dialog_self_label' :        { TW: '對自己時顯示', CN: '对自己时显示', EN: 'Shown to self', DE: 'Sich selbst gezeigt', FR: 'Montré à soi-même', RU: 'Показан самому себе', UA: 'Показано самому собі' },
        'dialog_self_ph'    :        { TW: '如：被輕輕咬住了耳朵', CN: '如：被轻轻咬住了耳朵', EN: 'e.g. got gently bitten on the ear', DE: 'z.B.', FR: 'par ex.', RU: 'например', UA: 'напр.' },
        'tokens_title'      :        { TW: '可用佔位符（點擊插入）', CN: '可用占位符（点击插入）', EN: 'Available placeholders (click to insert)', DE: 'Verfügbare Platzhalter (zum Einfügen klicken)', FR: 'Espaces réservés disponibles (cliquez pour insérer)', RU: 'Доступные заполнители (нажмите, чтобы вставить)', UA: 'Доступні заповнювачі (клацніть, щоб вставити)' },
        'token_self'        :        { TW: '自己', CN: '自己', EN: 'Self', DE: 'Selbst', FR: 'Soi', RU: 'Себя', UA: 'себе' },
        'token_other'       :        { TW: '對方', CN: '对方', EN: 'Target', DE: 'Ziel', FR: 'Cible', RU: 'Цель', UA: 'Цільова' },
        'save'              :        { TW: '儲存', CN: '保存', EN: 'Save', DE: 'Speichern', FR: 'Sauvegarder', RU: 'Сохранять', UA: 'зберегти' },
        'delete'            :        { TW: '刪除', CN: '删除', EN: 'Delete', DE: 'Löschen', FR: 'Supprimer', RU: 'Удалить', UA: 'Видалити' },
        'cancel'            :        { TW: '返回', CN: '返回', EN: 'Back', DE: 'Zurück', FR: 'Dos', RU: 'Назад', UA: 'Назад' },
        'token_self_pill'   :        { TW: '自己', CN: '自己', EN: 'Self', DE: 'Selbst', FR: 'Soi', RU: 'Себя', UA: 'себе' },
        'token_other_pill'  :        { TW: '對方', CN: '对方', EN: 'Target', DE: 'Ziel', FR: 'Cible', RU: 'Цель', UA: 'Цільова' },
        'default_name'      :        { TW: '動作', CN: '动作', EN: 'Action', DE: 'Aktion', FR: 'Action', RU: 'Действие', UA: 'Дія' },
        'preview'           :        { TW: '對他人：{a}\n{b}', CN: '对他人：{a}\n对自己：{b}', EN: 'To others: {a}\nTo self: {b}', DE: 'An andere: {a}\n{b}', FR: 'Aux autres : {a}\n{b}', RU: 'Другим: {a}\n{b}', UA: 'Іншим: {a}\n{b}' }
    });

    // combo 命名空间
    QiActI18n.register('combo', {
        'new_name'            :        { TW: '新組合', CN: '新组合', EN: 'New combo', DE: 'Neue Kombination', FR: 'Nouvelle combinaison', RU: 'Новое комбо', UA: 'Нове комбо' },
        'up'                  :        { TW: '上移', CN: '上移', EN: 'Move up', DE: 'Bewegen Sie sich nach oben', FR: 'Monter', RU: 'Вверх', UA: 'Рухатися вгору' },
        'down'                :        { TW: '下移', CN: '下移', EN: 'Move down', DE: 'Bewegen Sie sich nach unten', FR: 'Descendre', RU: 'Двигаться вниз', UA: 'Рухатися вниз' },
        'item_del'            :        { TW: '刪除', CN: '删除', EN: 'Delete', DE: 'Löschen', FR: 'Supprimer', RU: 'Удалить', UA: 'Видалити' },
        'exec'                :        { TW: '執行', CN: '执行', EN: 'Execute', DE: 'Ausführen', FR: 'Exécuter', RU: 'Выполнять', UA: 'Виконати' },
        'edit'                :        { TW: '編輯', CN: '编辑', EN: 'Edit', DE: 'Bearbeiten', FR: 'Modifier', RU: 'Редактировать', UA: 'Редагувати' },
        'delete'              :        { TW: '刪除', CN: '删除', EN: 'Delete', DE: 'Löschen', FR: 'Supprimer', RU: 'Удалить', UA: 'Видалити' },
        'new_btn'             :        { TW: '新組合', CN: '新建组合', EN: 'New combo', DE: 'Neue Kombination', FR: 'Nouvelle combinaison', RU: 'Новое комбо', UA: 'Нове комбо' },
        'add_title'           :        { TW: '加入目前組合', CN: '加入当前组合', EN: 'Add to current combo', DE: 'Zur aktuellen Kombination hinzufügen', FR: 'Ajouter au combo actuel', RU: 'Добавить в текущую комбинацию', UA: 'Додати до поточного комбо' },
        'count'               :        { TW: '{n} 步', CN: '{n} 步', EN: '{n} steps', DE: '{n} Schritte', FR: '{n} étapes', RU: '{n} шагов', UA: '{n} кроків' },
        'name_ph'             :        { TW: '組合名稱', CN: '组合名称', EN: 'Combo name', DE: 'Kombiname', FR: 'Nom de la combinaison', RU: 'Имя комбинации', UA: 'Комбінована назва' },
        'delay_label'         :        { TW: '動作間隔 {n}ms', CN: '动作间隔 {n}ms', EN: 'Action interval {n}ms', DE: 'Aktionsintervall {n}ms', FR: 'Intervalle d\'action {n} ms', RU: 'Интервал действия {n}мс', UA: 'Інтервал дії {n} мс' },
        'add_hint'            :        { TW: '請到「動作」模式，點選動作旁的「加入」按鈕加入', CN: '请到「动作」模式，点击动作旁的「加入」按钮添加', EN: 'Go to Action mode and click "Add" next to an action', DE: 'Gehen Sie in den Aktionsmodus und klicken Sie neben einer Aktion auf „Hinzufügen“.', FR: 'Allez en mode Action et cliquez sur "Ajouter" à côté d\'une action', RU: 'Перейдите в режим действий и нажмите «Добавить» рядом с действием.', UA: 'Перейдіть у режим дії та натисніть «Додати» біля дії' },
        'edit_title'          :        { TW: '編輯：{name}', CN: '编辑：{name}', EN: 'Edit: {name}', DE: 'Bearbeiten: {name}', FR: 'Editer : {name}', RU: 'Изменить: {name}', UA: 'Редагувати: {name}' },
        'delete_confirm_title':        { TW: '刪除組合', CN: '删除组合', EN: 'Delete combo', DE: 'Kombination löschen', FR: 'Supprimer la combinaison', RU: 'Удалить комбо', UA: 'Видалити комбо' },
        'delete_confirm_body' :        { TW: '確定刪除這個組合嗎？', CN: '确定删除这个组合吗？', EN: 'Delete this combo?', DE: 'Diese Combo löschen?', FR: 'Supprimer cette combinaison ?', RU: 'Удалить это комбо?', UA: 'Видалити цю комбінацію?' },
        'delete_confirm_btn'  :        { TW: '刪除', CN: '删除', EN: 'Delete', DE: 'Löschen', FR: 'Supprimer', RU: 'Удалить', UA: 'Видалити' },
        'empty'               :        { TW: '暫無組合。', CN: '暂无组合。点击下方「新建组合」，然后到「动作」模式点击动作旁的「加入」按钮添加动作。', EN: 'No combos yet. Click "New combo" below, then in Action mode click "Add" next to an action.', DE: 'Noch keine Combos.', FR: 'Pas encore de combo.', RU: 'Комбинаций пока нет.', UA: 'Комбо ще немає.' }
    });

    // update 命名空间
    QiActI18n.register('update', {
        'available_tag' :        { TW: '更新可用', CN: '更新可用', EN: 'Update available', DE: 'Update verfügbar', FR: 'Mise à jour disponible', RU: 'Доступно обновление', UA: 'Доступне оновлення' },
        'details'       :        { TW: '看詳情', CN: '查看详情', EN: 'View details', DE: 'Details anzeigen', FR: 'Afficher les détails', RU: 'Посмотреть детали', UA: 'Переглянути деталі' },
        'later'         :        { TW: '稍後', CN: '稍后', EN: 'Later', DE: 'Später', FR: 'Plus tard', RU: 'Позже', UA: 'Пізніше' },
        'later_title'   :        { TW: '稍後提醒', CN: '稍后提醒', EN: 'Remind me later', DE: 'Erinnere mich später daran', FR: 'Rappelle-moi plus tard', RU: 'Напомни мне позже', UA: 'Нагадай мені пізніше' },
        'ignore'        :        { TW: '不再提示此版本', CN: '不再提示此版本', EN: 'Don\'t show this version again', DE: 'Diese Version nicht mehr anzeigen', FR: 'Ne plus afficher cette version', RU: 'Больше не показывать эту версию', UA: 'Більше не показувати цю версію' },
        'know'          :        { TW: '知道了', CN: '知道了', EN: 'Got it', DE: 'Habe es', FR: 'J\'ai compris', RU: 'Понятно', UA: 'зрозумів' },
        'announce_tag'  :        { TW: '公告', CN: '公告', EN: 'Announcement', DE: 'Bekanntmachung', FR: 'Annonce', RU: 'Объявление', UA: 'Оголошення' },
        'important_tag' :        { TW: '重要', CN: '重要', EN: 'Important', DE: 'Wichtig', FR: 'Important', RU: 'Важный', UA: 'важливо' },
        'available_tag2':        { TW: '可用', CN: '可用', EN: 'Available', DE: 'Verfügbar', FR: 'Disponible', RU: 'Доступный', UA: 'в наявності' },
        'title'         :        { TW: '已更新到 v{VERSION}', CN: '已更新到 v{VERSION}', EN: 'Updated to v{VERSION}', DE: 'Aktualisiert auf v{VERSION}', FR: 'Mis à jour vers v{VERSION}', RU: 'Обновлено до версии {VERSION}.', UA: 'Оновлено до версії {VERSION}' },
        'parse_err'     :        { TW: '回應解析失敗', CN: '响应解析失败', EN: 'Response parse failed', DE: 'Das Parsen der Antwort ist fehlgeschlagen', FR: 'Échec de l\'analyse de la réponse', RU: 'Не удалось разобрать ответ.', UA: 'Помилка аналізу відповіді' },
        'net_err'       :        { TW: '網路錯誤', CN: '网络错误', EN: 'Network error', DE: 'Netzwerkfehler', FR: 'Erreur réseau', RU: 'Ошибка сети', UA: 'Помилка мережі' },
        'json_parse_err':        { TW: 'JSON 解析失敗: {msg}', CN: 'JSON 解析失败: {msg}', EN: 'JSON parse failed: {msg}', DE: 'JSON-Analyse fehlgeschlagen: {msg}', FR: 'Échec de l\'analyse JSON : {msg}', RU: 'Ошибка анализа JSON: {msg}', UA: 'Помилка аналізу JSON: {msg}' }
    });

    // part 命名空间
    QiActI18n.register('part', {
        'ItemHead'            :        { TW: '頭', CN: '头', EN: 'Head', DE: 'Kopf', FR: 'Tête', RU: 'Голова', UA: 'Голова' },
        'ItemNose'            :        { TW: '鼻', CN: '鼻', EN: 'Nose', DE: 'Nase', FR: 'Nez', RU: 'Нос', UA: 'ніс' },
        'ItemEars'            :        { TW: '耳', CN: '耳', EN: 'Ears', DE: 'Ohren', FR: 'Oreilles', RU: 'Уши', UA: 'вуха' },
        'ItemHood'            :        { TW: '頭套', CN: '头套', EN: 'Hood', DE: 'Haube', FR: 'Capot', RU: 'Капюшон', UA: 'Капюшон' },
        'ItemMouth'           :        { TW: '口', CN: '口', EN: 'Mouth', DE: 'Mund', FR: 'Bouche', RU: 'Рот', UA: 'Рот' },
        'ItemMouth2'          :        { TW: '口2', CN: '口2', EN: 'Mouth2', DE: 'Mund2', FR: 'Bouche2', RU: 'Рот2', UA: 'Рот2' },
        'ItemMouth3'          :        { TW: '口3', CN: '口3', EN: 'Mouth3', DE: 'Mund3', FR: 'Bouche3', RU: 'Рот3', UA: 'Рот3' },
        'ItemNeck'            :        { TW: '頸', CN: '颈', EN: 'Neck', DE: 'Nacken', FR: 'Cou', RU: 'Шея', UA: 'Шия' },
        'ItemNeckAccessories' :        { TW: '頸飾', CN: '颈饰', EN: 'Neck accessory', DE: 'Halsaccessoire', FR: 'Accessoire de cou', RU: 'Шейный аксессуар', UA: 'Шийний аксесуар' },
        'ItemNeckRestraints'  :        { TW: '頸束', CN: '颈束', EN: 'Neck restraint', DE: 'Nackenstütze', FR: 'Retenue du cou', RU: 'Ограничение шеи', UA: 'Обмежувач для шиї' },
        'ItemNipples'         :        { TW: '乳', CN: '乳', EN: 'Nipples', DE: 'Brustwarzen', FR: 'Mamelons', RU: 'Соски', UA: 'Соски' },
        'ItemNipplesPiercings':        { TW: '乳穿', CN: '乳穿', EN: 'Nipple piercing', DE: 'Brustwarzenpiercing', FR: 'Perçage du mamelon', RU: 'Пирсинг сосков', UA: 'Пірсинг сосків' },
        'ItemBreast'          :        { TW: '胸', CN: '胸', EN: 'Breast', DE: 'Brust', FR: 'Sein', RU: 'Грудь', UA: 'Груди' },
        'ItemTorso'           :        { TW: '軀幹', CN: '躯干', EN: 'Torso', DE: 'Torso', FR: 'Torse', RU: 'Торс', UA: 'тулуб' },
        'ItemTorso2'          :        { TW: '腹', CN: '腹', EN: 'Belly', DE: 'Bauch', FR: 'Ventre', RU: 'Живот', UA: 'живіт' },
        'ItemArms'            :        { TW: '手臂', CN: '手臂', EN: 'Arms', DE: 'Waffen', FR: 'Bras', RU: 'Оружие', UA: 'Зброя' },
        'ItemHands'           :        { TW: '手', CN: '手', EN: 'Hands', DE: 'Hände', FR: 'Mains', RU: 'Руки', UA: 'руки' },
        'ItemPelvis'          :        { TW: '腰臀', CN: '腰臀', EN: 'Hips', DE: 'Hüften', FR: 'Les hanches', RU: 'Бедра', UA: 'Стегна' },
        'ItemVulva'           :        { TW: '私處', CN: '私处', EN: 'Privates', DE: 'Privatpersonen', FR: 'Privés', RU: 'Рядовые', UA: 'Рядовий' },
        'ItemVulvaPiercings'  :        { TW: '陰穿', CN: '阴穿', EN: 'Vulva piercing', DE: 'Vulva-Piercing', FR: 'Perçage de la vulve', RU: 'Пирсинг вульвы', UA: 'Пірсинг вульви' },
        'ItemButt'            :        { TW: '臀部後', CN: '臀后', EN: 'Butt', DE: 'Hintern', FR: 'Bout', RU: 'Задница', UA: 'прикладом' },
        'ItemLegs'            :        { TW: '腿', CN: '腿', EN: 'Legs', DE: 'Beine', FR: 'Jambes', RU: 'Ноги', UA: 'ноги' },
        'ItemFeet'            :        { TW: '腳', CN: '脚', EN: 'Feet', DE: 'Füße', FR: 'Pieds', RU: 'Ноги', UA: 'Ноги' },
        'ItemBoots'           :        { TW: '靴', CN: '靴', EN: 'Boots', DE: 'Stiefel', FR: 'Bottes', RU: 'Сапоги', UA: 'Чоботи' }
    });

    // render 命名空间
    QiActI18n.register('render', {
        'pick_char_part' :        { TW: '請先在左側選擇人物和部位', CN: '请先在左侧选择人物和部位', EN: 'Select a character and part on the left first', DE: 'Wählen Sie zunächst links einen Charakter und einen Teil aus', FR: 'Sélectionnez d\'abord un personnage et une partie à gauche', RU: 'Сначала выберите символ и часть слева', UA: 'Спочатку виберіть персонажа та частину зліва' },
        'no_actions'     :        { TW: '該部位暫無可用動作', CN: '该部位暂无可用动作', EN: 'No available actions for this part', DE: 'Für diesen Teil sind keine Aktionen verfügbar', FR: 'Aucune action disponible pour cette partie', RU: 'Для этой части нет доступных действий', UA: 'Немає доступних дій для цієї частини' },
        'load_err'       :        { TW: '動作清單載入出錯，請刷新或回饋。<br><small>{msg}</small>', CN: '动作列表加载出错，请刷新或反馈。<br><small>{msg}</small>', EN: 'Action list failed to load. Refresh or report.<br><small>{msg}</small>', DE: 'Die Aktionsliste konnte nicht geladen werden.<br><small>{msg}</small>', FR: 'La liste d\'actions n\'a pas pu être chargée.<br><small>{msg}</small>', RU: 'Не удалось загрузить список действий.<br><small>{msg}</small>', UA: 'Не вдалося завантажити список дій.<br><small>{msg}</small>' },
        'select_action'  :        { TW: '選擇動作...', CN: '选择动作...', EN: 'Select action...', DE: 'Aktion auswählen...', FR: 'Sélectionnez une action...', RU: 'Выберите действие...', UA: 'Виберіть дію...' },
        'pick_char_part2':        { TW: '點選左側 ◀ 按鈕選擇人物和部位', CN: '点击左侧 ◀ 按钮选择人物和部位', EN: 'Click the ◀ button on the left to select a character and part', DE: 'Klicken Sie links auf die Schaltfläche ◀, um einen Charakter und einen Teil auszuwählen', FR: 'Cliquez sur le bouton ◀ à gauche pour sélectionner un personnage et une partie', RU: 'Нажмите кнопку ◀ слева, чтобы выбрать символ и часть.', UA: 'Натисніть кнопку ◀ ліворуч, щоб вибрати персонажа та частину' },
        'pick_part_hint' :        { TW: '請在左側人物浮層選擇身體部位', CN: '请在左侧人物浮层选择身体部位', EN: 'Select a body part in the left character popover', DE: 'Wählen Sie im linken Zeichen-Popover einen Körperteil aus', FR: 'Sélectionnez une partie du corps dans le popover du personnage de gauche', RU: 'Выберите часть тела во всплывающем окне левого персонажа.', UA: 'Виберіть частину тіла в лівому вікні символів' },
        'combo_title'    :        { TW: '組合動作', CN: '组合动作', EN: 'Combo actions', DE: 'Kombiaktionen', FR: 'Actions combinées', RU: 'Комбинированные действия', UA: 'Комбіновані дії' }
    });

    QiActI18n.register('ui', {
        'settings': { TW:'設定', CN:'设置', EN:'Settings', DE:'Einstellungen', FR:'Paramètres', RU:'Настройки', UA:'Налаштування' },
        'mode_favorite': { TW:'收藏', CN:'收藏', EN:'Favorites', DE:'Favoriten', FR:'Favoris', RU:'Избранное', UA:'Вибране' },
        'mode_favorite_title': { TW:'管理與使用所有收藏動作', CN:'管理与使用所有收藏动作', EN:'Manage and use all favorite actions', DE:'Alle Favoriten verwalten und verwenden', FR:'Gérer et utiliser tous les favoris', RU:'Управление всеми избранными действиями', UA:'Керування всіма вибраними діями' }
    });
    QiActI18n.register('settings', {
        'title': { TW:'設定', CN:'设置', EN:'Settings', DE:'Einstellungen', FR:'Paramètres', RU:'Настройки', UA:'Налаштування' },
        'language': { TW:'語系', CN:'语言', EN:'Language', DE:'Sprache', FR:'Langue', RU:'Язык', UA:'Мова' },
        'theme': { TW:'主題', CN:'主题', EN:'Theme', DE:'Thema', FR:'Thème', RU:'Тема', UA:'Тема' },
        'auto': { TW:'自動', CN:'自动', EN:'Auto', DE:'Auto', FR:'Auto', RU:'Авто', UA:'Авто' },
        'chat_button': { TW:'收納到 BC 聊天室按鈕列', CN:'收纳到 BC 聊天室按钮栏', EN:'Dock in the BC chat-room buttons', DE:'In der BC-Chat-Schaltflächenleiste andocken', FR:'Ancrer dans les boutons de chat BC', RU:'Закрепить на панели кнопок BC', UA:'Закріпити на панелі кнопок BC' }
    });
    QiActI18n.register('editor', {
        'preview_label': { TW:'效果預覽', CN:'效果预览', EN:'Preview', DE:'Vorschau', FR:'Aperçu', RU:'Предпросмотр', UA:'Попередній перегляд' }
    });
    QiActI18n.register('render', {
        'favorite_title': { TW:'收藏動作', CN:'收藏动作', EN:'Favorite actions', DE:'Favoritenaktionen', FR:'Actions favorites', RU:'Избранные действия', UA:'Вибрані дії' }
    });
})();
