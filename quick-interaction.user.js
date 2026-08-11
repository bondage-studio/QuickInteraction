// ==UserScript==
// @name         快捷互动 (QiAct)
// @name:zh      快捷互动
// @namespace    https://github.com/bondage-studio/QuickInteraction
// @version      1.4.0
// @description  Bondage Club - 统一动作操作台。一键进入动作模式，在聊天室场景内直接点人物部位选动作，绕过原生5步嵌套菜单。
// @author       Tao MUSE
// @homepageURL  https://github.com/bondage-studio/QuickInteraction
// @updateURL    https://github.com/bondage-studio/QuickInteraction/raw/main/quick-interaction.user.js
// @downloadURL  https://github.com/bondage-studio/QuickInteraction/raw/main/quick-interaction.user.js
// @include      /^https:\/\/(www\.)?bondage(projects\.elementfx|-(europe|asia))\.com\/.*/
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  "use strict";
  function createRuntimeHost(name = "QuickInteraction") {
    let disposed = false;
    const cleanups = [];
    function addCleanup(cleanup) {
      if (typeof cleanup !== "function") return cleanup;
      if (disposed) {
        try {
          cleanup();
        } catch (error) {
          console.warn(`[${name}] late cleanup failed:`, error);
        }
        return cleanup;
      }
      cleanups.push(cleanup);
      return cleanup;
    }
    function listen(target, type, listener, options) {
      if (!target || typeof target.addEventListener !== "function") return listener;
      target.addEventListener(type, listener, options);
      addCleanup(() => target.removeEventListener(type, listener, options));
      return listener;
    }
    function interval(callback, delay) {
      const id = window.setInterval(() => {
        if (!disposed) callback();
      }, delay);
      addCleanup(() => window.clearInterval(id));
      return id;
    }
    function timeout(callback, delay) {
      const id = window.setTimeout(() => {
        if (!disposed) callback();
      }, delay);
      addCleanup(() => window.clearTimeout(id));
      return id;
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      for (let i = cleanups.length - 1; i >= 0; i -= 1) {
        try {
          cleanups[i]();
        } catch (error) {
          console.warn(`[${name}] cleanup failed:`, error);
        }
      }
      cleanups.length = 0;
    }
    return Object.freeze({
      addCleanup,
      listen,
      interval,
      timeout,
      dispose,
      get disposed() {
        return disposed;
      }
    });
  }
  function disposePreviousRuntime() {
    const previousApi = window.__QiAct;
    if (previousApi && typeof previousApi.dispose === "function") {
      try {
        previousApi.dispose();
      } catch (error) {
        console.warn("[QiAct] previous dispose failed:", error);
      }
    }
    const previousHost = window.__QiActRuntimeHost;
    if (previousHost && typeof previousHost.dispose === "function") {
      try {
        previousHost.dispose();
      } catch (error) {
        console.warn("[QiAct] previous host dispose failed:", error);
      }
    }
  }
  function startLegacyRuntime(runtimeHost2) {
    (function() {
      var LANGS = ["TW", "CN", "EN", "DE", "FR", "RU", "UA"];
      var REQUIRED = ["CN", "EN", "TW"];
      var LANG_META = {
        auto: { code: "A", native: "Auto" },
        TW: { code: "TW", native: "繁體中文" },
        CN: { code: "CN", native: "简体中文" },
        EN: { code: "EN", native: "English" },
        DE: { code: "DE", native: "Deutsch" },
        FR: { code: "FR", native: "Français" },
        RU: { code: "RU", native: "Русский" },
        UA: { code: "UA", native: "Українська" }
      };
      var DICT = {};
      function register(ns, dict) {
        if (!dict || typeof dict !== "object") return;
        for (var k in dict) {
          if (!Object.prototype.hasOwnProperty.call(dict, k)) continue;
          DICT[ns + "." + k] = dict[k];
        }
      }
      function resolveLang() {
        try {
          var ov = null;
          try {
            ov = localStorage.getItem("QiActLang");
          } catch (e) {
          }
          if (ov && ov !== "auto" && LANGS.indexOf(ov) >= 0) return ov;
          var bc = typeof TranslationLanguage !== "undefined" && TranslationLanguage ? String(TranslationLanguage).toUpperCase() : "";
          if (LANGS.indexOf(bc) >= 0) return bc;
          var nav = typeof navigator !== "undefined" && navigator.language ? navigator.language.toUpperCase() : "EN";
          if (nav.indexOf("ZH") === 0) return nav.indexOf("TW") >= 0 ? "TW" : "CN";
          if (nav.indexOf("DE") === 0) return "DE";
          if (nav.indexOf("FR") === 0) return "FR";
          if (nav.indexOf("RU") === 0) return "RU";
          if (nav.indexOf("UK") === 0) return "UA";
          return "EN";
        } catch (e) {
          return "EN";
        }
      }
      function QiActT2(key, vars) {
        try {
          if (key == null) return "";
          var entry = DICT[key];
          if (!entry || typeof entry !== "object") return String(key);
          var lang = resolveLang();
          var val = entry[lang];
          if (val == null) {
            if (lang === "TW" && entry["CN"] != null) val = entry["CN"];
            else val = entry["EN"];
          }
          if (val == null) val = key;
          if (vars && typeof vars === "object") {
            for (var v in vars) {
              if (!Object.prototype.hasOwnProperty.call(vars, v)) continue;
              var rep = vars[v] == null ? "" : String(vars[v]);
              val = String(val).split("{" + v + "}").join(rep);
            }
          }
          return val == null ? String(key) : String(val);
        } catch (e) {
          return key == null ? "" : String(key);
        }
      }
      function setLang(code) {
        try {
          if (!code || code === "auto") {
            try {
              localStorage.removeItem("QiActLang");
            } catch (e) {
            }
          } else localStorage.setItem("QiActLang", code);
        } catch (e) {
        }
      }
      window.QiActI18n = {
        register,
        t: QiActT2,
        getCurrentLang: resolveLang,
        setLang,
        LANGS: LANGS.slice(),
        REQUIRED: REQUIRED.slice(),
        LANG_META
      };
      window.QiActT = QiActT2;
    })();
    (function() {
      if (typeof QiActI18n === "undefined" || !QiActI18n) return;
      QiActI18n.register("ui", {
        "toggle_on": { TW: "開啟快速動作模式", CN: "开启快速动作模式", EN: "Enter Quick Action mode", DE: "Wechseln Sie in den Schnellaktionsmodus", FR: "Passer en mode action rapide", RU: "Войдите в режим быстрого действия", UA: "Увійдіть у режим швидкої дії" },
        "toggle_off": { TW: "退出快速動作模式", CN: "退出快速动作模式", EN: "Exit Quick Action mode", DE: "Verlassen Sie den Schnellaktionsmodus", FR: "Quitter le mode Action rapide", RU: "Выйти из режима быстрого действия", UA: "Вийти з режиму швидкої дії" },
        "toggle_on_active": { TW: "退出快速動作模式 · 已激活", CN: "退出快速动作模式 · 已激活", EN: "Exit Quick Action mode · Active", DE: "Schnellaktionsmodus verlassen · Aktiv", FR: "Quitter le mode Action rapide · Actif", RU: "Выход из режима быстрого действия · Активно", UA: "Вийти з режиму швидкої дії · Активний" },
        "theme_dark": { TW: "深色", CN: "深色", EN: "Dark", DE: "Dunkel", FR: "Sombre", RU: "Темный", UA: "Темний" },
        "theme_light": { TW: "淺色", CN: "浅色", EN: "Light", DE: "Licht", FR: "Lumière", RU: "Свет", UA: "світло" },
        "theme_switched": { TW: "已切換為{theme}主題", CN: "已切换为{theme}主题", EN: "Switched to {theme} theme", DE: "Zum Thema {theme} gewechselt", FR: "Passé au thème {theme}", RU: "Переключился на тему {theme}", UA: "Переключено на тему {theme}" },
        "drag_panel": { TW: "拖曳面板", CN: "拖动面板", EN: "Drag panel", DE: "Panel ziehen", FR: "Faites glisser le panneau", RU: "Перетащите панель", UA: "Панель перетягування" },
        "theme_toggle": { TW: "切換深色/淺色主題", CN: "切换深色/浅色主题", EN: "Toggle dark/light theme", DE: "Schalten Sie das dunkle/helle Thema um", FR: "Basculer le thème sombre/clair", RU: "Переключить темную/светлую тему", UA: "Перемикати темну/світлу тему" },
        "lang_title": { TW: "語言", CN: "语言", EN: "Language", DE: "Sprache", FR: "Langue", RU: "Язык", UA: "Мова" },
        "lang_auto": { TW: "自動", CN: "自动", EN: "Auto", DE: "Auto", FR: "Auto", RU: "Авто", UA: "Авто" },
        "refresh": { TW: "刷新目前部位/人物的動作清單狀態", CN: "刷新当前部位/人物的动作列表状态", EN: "Refresh the current part/character action list", DE: "Aktualisieren Sie die aktuelle Aktionsliste für Teile/Charaktere", FR: "Actualiser la liste actuelle des actions des parties/personnages", RU: "Обновить текущий список действий части/персонажа.", UA: "Оновити поточний список дій частини/персонажа" },
        "exit_mode": { TW: "退出快速動作模式 (Esc)", CN: "退出快速动作模式 (Esc)", EN: "Exit Quick Action mode (Esc)", DE: "Schnellaktionsmodus verlassen (Esc)", FR: "Quitter le mode Action rapide (Esc)", RU: "Выход из режима быстрого действия (Esc)", UA: "Вийти з режиму швидкої дії (Esc)" },
        "mode_part": { TW: "動作", CN: "动作", EN: "Action", DE: "Aktion", FR: "Action", RU: "Действие", UA: "Дія" },
        "mode_part_title": { TW: "單部位動作：點人物部位後直接觸發", CN: "单部位动作：点人物部位后直接触发", EN: "Single-part action: trigger directly after clicking a body part", DE: "Einzelaktion: Direkt nach dem Anklicken eines Körperteils auslösen", FR: "Action en une seule partie : déclenchez-la directement après avoir cliqué sur une partie du corps", RU: "Действие для одной части: срабатывает сразу после щелчка по части тела.", UA: "Однокомпонентна дія: активується безпосередньо після клацання частини тіла" },
        "mode_combo": { TW: "組合動作", CN: "组合动作", EN: "Combo", DE: "Combo", FR: "Combo", RU: "Комбо", UA: "комбо" },
        "mode_combo_title": { TW: "組合動作：手動組裝多部位動作並一鍵執行", CN: "组合动作：手动拼装多部位动作并一键执行", EN: "Combo: assemble multi-part actions and run with one click", DE: "Combo: Mehrteilige Aktionen zusammenstellen und mit einem Klick ausführen", FR: "Combo : assemblez des actions en plusieurs parties et exécutez-les en un seul clic", RU: "Комбо: соберите действия из нескольких частей и запустите их одним щелчком мыши.", UA: "Комбінація: збирайте дії з кількох частин і запускайте їх одним клацанням миші" },
        "mode_custom": { TW: "我的動作", CN: "我的动作", EN: "My Actions", DE: "Meine Aktionen", FR: "Mes actions", RU: "Мои действия", UA: "Мої дії" },
        "mode_custom_title": { TW: "我的動作：建立/管理自訂動作（替代 echo/迴聲）。", CN: "我的动作：创建/管理自定义动作（替代 echo/回声）。当前为测试版(Beta)", EN: "My Actions: create/manage custom actions (replaces echo). Currently Beta", DE: "Meine Aktionen: Benutzerdefinierte Aktionen erstellen/verwalten (ersetzt Echo).", FR: "Mes actions : créer/gérer des actions personnalisées (remplace echo).", RU: "Мои действия: создание и управление пользовательскими действиями (заменяет echo).", UA: "Мої дії: створювати/керувати спеціальними діями (замінює echo)." },
        "beta_badge": { TW: "測試版", CN: "测试版", EN: "Beta", DE: "Beta", FR: "Bêta", RU: "Бета", UA: "Бета" },
        "self": { TW: "自己", CN: "自己", EN: "Self", DE: "Selbst", FR: "Soi", RU: "Себя", UA: "себе" },
        "self_title": { TW: "切換自己模式", CN: "切换自己模式", EN: "Toggle self mode", DE: "Schalten Sie den Selbstmodus um", FR: "Basculer en mode autonome", RU: "Переключить самостоятельный режим", UA: "Увімкнути режим себе" },
        "all": { TW: "全員", CN: "全员", EN: "All", DE: "Alle", FR: "Tous", RU: "Все", UA: "все" },
        "all_title": { TW: "切換全員範圍：開啟後，動作將對房間內所有人執行", CN: "切换全员范围：开启后，动作将对房间内所有人执行", EN: "Toggle all-range: when on, actions run on everyone in the room", DE: "Gesamtbereich umschalten: Wenn diese Option aktiviert ist, werden Aktionen für alle Personen im Raum ausgeführt", FR: "Activer toute la plage : lorsque cette option est activée, les actions s'exécutent sur toutes les personnes présentes dans la pièce", RU: "Переключить весь диапазон: если включено, действия выполняются для всех в комнате.", UA: "Перемкнути весь діапазон: коли ввімкнено, дії виконуються для всіх у кімнаті" },
        "fav": { TW: "收藏", CN: "收藏", EN: "Favorite", DE: "Favorit", FR: "Préféré", RU: "Любимый", UA: "улюблений" },
        "fav_title": { TW: "收藏模式：開啟後點選動作會加入/取消收藏", CN: "收藏模式：开启后点击动作会加入/取消收藏", EN: "Favorite mode: clicking an action adds/removes it from favorites", DE: "Favoritenmodus: Durch Klicken auf eine Aktion wird diese zu den Favoriten hinzugefügt bzw. daraus entfernt", FR: "Mode favori : cliquer sur une action l'ajoute/supprime des favoris", RU: "Режим избранного: нажатие на действие добавляет или удаляет его из избранного.", UA: "Режим вибраного: клацання дії додає або видаляє його з вибраного" },
        "fav_clear": { TW: "清空全部收藏動作", CN: "清空全部收藏动作", EN: "Clear all favorite actions", DE: "Löschen Sie alle bevorzugten Aktionen", FR: "Effacer toutes les actions favorites", RU: "Очистить все избранные действия", UA: "Очистити всі улюблені дії" },
        "x3": { TW: "×3", CN: "×3", EN: "×3", DE: "×3", FR: "×3", RU: "×3", UA: "×3" },
        "x3_title": { TW: "連續3次", CN: "连续3次", EN: "Continuous x3", DE: "Kontinuierlich x3", FR: "Continu x3", RU: "Непрерывный x3", UA: "Безперервний х3" },
        "version": { TW: "目前插件版本", CN: "当前插件版本", EN: "Current plugin version", DE: "Aktuelle Plugin-Version", FR: "Version actuelle du plugin", RU: "Текущая версия плагина", UA: "Поточна версія плагіна" },
        "resize": { TW: "拖曳縮放面板", CN: "拖动缩放面板", EN: "Drag to resize panel", DE: "Ziehen Sie, um die Größe des Bedienfelds zu ändern", FR: "Faites glisser pour redimensionner le panneau", RU: "Перетащите, чтобы изменить размер панели", UA: "Перетягніть, щоб змінити розмір панелі" },
        "popover_back": { TW: "返回人物列表", CN: "返回人物列表", EN: "Back to character list", DE: "Zurück zur Charakterliste", FR: "Retour à la liste des personnages", RU: "Вернуться к списку персонажей", UA: "Назад до списку символів" },
        "popover_close": { TW: "關閉", CN: "关闭", EN: "Close", DE: "Schließen", FR: "Fermer", RU: "Закрывать", UA: "Закрити" },
        "chars": { TW: "人物列表", CN: "人物列表", EN: "Character list", DE: "Charakterliste", FR: "Liste des personnages", RU: "Список персонажей", UA: "Список символів" }
      });
      QiActI18n.register("target", {
        "empty": { TW: "房間無人", CN: "房间无人", EN: "Room is empty", DE: "Der Raum ist leer", FR: "La salle est vide", RU: "Комната пуста", UA: "Кімната порожня" },
        "pick_part": { TW: "點擊身體部位選擇動作", CN: "点击身体部位选择动作", EN: "Click a body part to choose an action", DE: "Klicken Sie auf einen Körperteil, um eine Aktion auszuwählen", FR: "Cliquez sur une partie du corps pour choisir une action", RU: "Нажмите на часть тела, чтобы выбрать действие", UA: "Натисніть частину тіла, щоб вибрати дію" },
        "select_part": { TW: "選擇部位", CN: "选择部位", EN: "Select part", DE: "Teil auswählen", FR: "Sélectionner une pièce", RU: "Выберите часть", UA: "Виберіть частину" }
      });
      QiActI18n.register("common", {
        "self": { TW: "自己", CN: "自己", EN: "Self", DE: "Selbst", FR: "Soi", RU: "Себя", UA: "себе" },
        "other": { TW: "對方", CN: "对方", EN: "Target", DE: "Ziel", FR: "Cible", RU: "Цель", UA: "Цільова" },
        "someone": { TW: "某人", CN: "某人", EN: "Someone", DE: "Jemand", FR: "Quelqu'un", RU: "Кто-то", UA: "Хтось" },
        "enter_mode": { TW: "動作模式已開啟", CN: "动作模式已开启", EN: "Action mode enabled", DE: "Aktionsmodus aktiviert", FR: "Mode action activé", RU: "Режим действий включен", UA: "Режим дії ввімкнено" },
        "exit_mode": { TW: "已退出動作模式", CN: "已退出动作模式", EN: "Exited action mode", DE: "Aktionsmodus verlassen", FR: "Quitter le mode action", RU: "Выход из режима действий", UA: "Вийшов з режиму дії" },
        "all_on": { TW: "全員範圍：開啟", CN: "全员范围：开启", EN: "All-range: ON", DE: "Gesamtbereich: EIN", FR: "Toute la gamme : ON", RU: "Вседиапазонный: ВКЛ.", UA: "Весь діапазон: УВІМК" },
        "all_off": { TW: "全員範圍：關閉", CN: "全员范围：关闭", EN: "All-range: OFF", DE: "Gesamtbereich: AUS", FR: "Toute la gamme : OFF", RU: "Весь диапазон: ВЫКЛ.", UA: "Весь діапазон: ВИМК" },
        "fav_on": { TW: "收藏模式：開啟 · 點選動作加入收藏", CN: "收藏模式：开启 · 点击动作加入收藏", EN: "Favorite mode: ON · click an action to add", DE: "Lieblingsmodus: EIN · Klicken Sie auf eine Aktion, um sie hinzuzufügen", FR: "Mode favori : ON · cliquez sur une action à ajouter", RU: "Режим избранного: ВКЛ. · щелкните действие, чтобы добавить его.", UA: "Улюблений режим: УВІМКНЕНО · натисніть дію, щоб додати" },
        "fav_off": { TW: "收藏模式：關閉", CN: "收藏模式：关闭", EN: "Favorite mode: OFF", DE: "Lieblingsmodus: AUS", FR: "Mode favori : OFF", RU: "Любимый режим: ВЫКЛ.", UA: "Улюблений режим: ВИМК" },
        "fav_add": { TW: "已收藏：{name}", CN: "已收藏：{name}", EN: "Favorited: {name}", DE: "Favorit: {name}", FR: "Favoris : {name}", RU: "Избранное: {name}", UA: "Вибрано: {name}" },
        "fav_remove": { TW: "取消收藏", CN: "取消收藏", EN: "Unfavorited", DE: "Nicht favorisiert", FR: "Défavorisé", RU: "Избранное", UA: "Не додано до вибраного" },
        "self_on": { TW: "自己模式：開啟", CN: "自己模式：开启", EN: "Self mode: ON", DE: "Selbstmodus: EIN", FR: "Mode autonome : activé", RU: "Авторежим: ВКЛ.", UA: "Автономний режим: УВІМК" },
        "self_off": { TW: "自己模式：關閉", CN: "自己模式：关闭", EN: "Self mode: OFF", DE: "Selbstmodus: AUS", FR: "Mode autonome : OFF", RU: "Авторежим: ВЫКЛ.", UA: "Авторежим: ВИМК" },
        "no_fav": { TW: "目前沒有收藏動作", CN: "当前没有收藏动作", EN: "No favorite actions yet", DE: "Noch keine Lieblingsaktionen", FR: "Aucune action favorite pour l'instant", RU: "Избранных действий пока нет", UA: "Ще немає улюблених дій" },
        "clear_fav_title": { TW: "清空全部收藏", CN: "清空全部收藏", EN: "Clear all favorites", DE: "Alle Favoriten löschen", FR: "Effacer tous les favoris", RU: "Очистить все избранное", UA: "Очистити всі вибрані" },
        "clear_fav_body": { TW: "確定清空全部收藏動作嗎？", CN: "确定清空全部收藏动作吗？此操作无法撤销。", EN: "Clear all favorite actions? This cannot be undone.", DE: "Alle bevorzugten Aktionen löschen?", FR: "Effacer toutes les actions favorites ?", RU: "Очистить все избранные действия?", UA: "Очистити всі улюблені дії?" },
        "clear_fav_confirm": { TW: "全部清空", CN: "全部清空", EN: "Clear all", DE: "Alles löschen", FR: "Tout effacer", RU: "Очистить все", UA: "Очистити все" },
        "cleared_fav": { TW: "已清空全部收藏", CN: "已清空全部收藏", EN: "All favorites cleared", DE: "Alle Favoriten gelöscht", FR: "Tous les favoris effacés", RU: "Все избранное удалено", UA: "Усі вибрані видалено" },
        "confirm_title": { TW: "確認操作", CN: "确认操作", EN: "Confirm", DE: "Bestätigen", FR: "Confirmer", RU: "Подтверждать", UA: "Підтвердити" },
        "confirm_ok": { TW: "確定", CN: "确定", EN: "OK", DE: "OK", FR: "D'ACCORD", RU: "ХОРОШО", UA: "добре" },
        "confirm_cancel": { TW: "取消", CN: "取消", EN: "Cancel", DE: "Stornieren", FR: "Annuler", RU: "Отмена", UA: "Скасувати" }
      });
      QiActI18n.register("toast", {
        "need_item": { TW: "該動作需要特定道具", CN: "该动作需要特定道具", EN: "This action requires a specific item", DE: "Für diese Aktion ist ein bestimmtes Element erforderlich", FR: "Cette action nécessite un élément spécifique", RU: "Для этого действия требуется определенный элемент", UA: "Для цієї дії потрібен певний предмет" },
        "unavailable": { TW: "該動作目前不可用或對方禁用該動作", CN: "该动作目前不可用或对方禁用该动作", EN: "This action is unavailable or the target has disabled it", DE: "Diese Aktion ist nicht verfügbar oder wurde vom Ziel deaktiviert", FR: "Cette action est indisponible ou désactivée par la cible", RU: "Действие недоступно или отключено целью", UA: "Дія недоступна або вимкнена ціллю" },
        "temporarily_unavailable": { TW: "該動作目前不可用或對方禁用該動作", CN: "该动作目前不可用或对方禁用该动作", EN: "This action is unavailable or the target has disabled it", DE: "Diese Aktion ist nicht verfügbar oder wurde vom Ziel deaktiviert", FR: "Cette action est indisponible ou désactivée par la cible", RU: "Действие недоступно или отключено целью", UA: "Дія недоступна або вимкнена ціллю" },
        "exec_failed": { TW: "執行失敗: {msg}", CN: "执行失败: {msg}", EN: "Execution failed: {msg}", DE: "Ausführung fehlgeschlagen: {msg}", FR: "Échec de l'exécution : {msg}", RU: "Не удалось выполнить: {msg}", UA: "Помилка виконання: {msg}" },
        "pick_action": { TW: "請先選擇一個動作", CN: "请先选择一个动作", EN: "Please select an action first", DE: "Bitte wählen Sie zunächst eine Aktion aus", FR: "Veuillez d'abord sélectionner une action", RU: "Сначала выберите действие", UA: "Спочатку виберіть дію" },
        "no_others": { TW: "房間內沒有其他人", CN: "房间内没有其他人", EN: "No other members in the room", DE: "Keine anderen Mitglieder im Raum", FR: "Aucun autre membre dans la salle", RU: "В комнате нет других участников", UA: "У кімнаті немає інших учасників" },
        "exec_all": { TW: "開始對所有成員執行：{name}", CN: "开始对所有成员执行：{name}", EN: "Executing on all members: {name}", DE: "Wird auf allen Mitgliedern ausgeführt: {name}", FR: "Exécution sur tous les membres : {name}", RU: "Выполняется на всех участниках: {name}", UA: "Виконується для всіх учасників: {name}" },
        "no_last": { TW: "沒有上次的動作紀錄", CN: "没有上次的动作记录", EN: "No last action recorded", DE: "Keine letzte Aktion aufgezeichnet", FR: "Aucune dernière action enregistrée", RU: "Последнее действие не записано", UA: "Остання дія не записана" },
        "target_not_in_room": { TW: "目標不在房間內", CN: "目标不在房间内", EN: "Target is not in the room", DE: "Ziel ist nicht im Raum", FR: "La cible n'est pas dans la pièce", RU: "Цель не в комнате", UA: "Цілі немає в кімнаті" },
        "repeat": { TW: "重複：{name}", CN: "重复：{name}", EN: "Repeat: {name}", DE: "Wiederholen Sie: {name}", FR: "Répéter : {name}", RU: "Повторите: {name}", UA: "Повтор: {name}" },
        "pick_part": { TW: "請先選擇一個人物部位", CN: "请先选择一个人物部位", EN: "Please select a character part first", DE: "Bitte wählen Sie zuerst einen Charakterteil aus", FR: "Veuillez d'abord sélectionner une partie de personnage", RU: "Пожалуйста, сначала выберите часть персонажа", UA: "Спочатку виберіть частину персонажа" },
        "mode_on_first": { TW: "請先開啟動作模式", CN: "请先开启动作模式", EN: "Please enable action mode first", DE: "Bitte aktivieren Sie zuerst den Aktionsmodus", FR: "Veuillez d'abord activer le mode action", RU: "Пожалуйста, сначала включите режим действия", UA: "Спочатку ввімкніть режим дії" },
        "refreshed_custom": { TW: "我的動作清單已刷新", CN: "我的动作列表已刷新", EN: "My Actions list refreshed", DE: "Meine Aktionsliste wurde aktualisiert", FR: "Ma liste d'actions actualisée", RU: "Список моих действий обновлен.", UA: "Список моїх дій оновлено" },
        "refreshed_combo": { TW: "組合清單已刷新", CN: "组合列表已刷新", EN: "Combo list refreshed", DE: "Kombinationsliste aktualisiert", FR: "Liste combinée actualisée", RU: "Список комбинаций обновлен.", UA: "Комбінований список оновлено" },
        "refreshed_actions": { TW: "動作清單已刷新", CN: "动作列表已刷新", EN: "Action list refreshed", DE: "Aktionsliste aktualisiert", FR: "Liste d'actions actualisée", RU: "Список действий обновлен.", UA: "Список дій оновлено" },
        "pick_char": { TW: "請先在左側選擇人物", CN: "请先在左侧选择人物", EN: "Please select a character on the left first", DE: "Bitte wählen Sie zunächst links ein Zeichen aus", FR: "Veuillez d'abord sélectionner un personnage à gauche", RU: "Пожалуйста, сначала выберите символ слева", UA: "Спочатку виберіть символ ліворуч" },
        "executed": { TW: "已執行：{name}", CN: "已执行：{name}", EN: "Executed: {name}", DE: "Ausgeführt: {name}", FR: "Exécuté : {name}", RU: "Выполнено: {name}", UA: "Виконано: {name}" },
        "added_to_combo": { TW: "已加入「{name}」", CN: "已加入「{name}」", EN: 'Added to "{name}"', DE: "Hinzugefügt zu „{name}“", FR: 'Ajouté à "{name}"', RU: 'Добавлено в "{name}"', UA: 'Додано до "{name}"' },
        "combo_empty": { TW: "組合為空", CN: "组合为空", EN: "Combo is empty", DE: "Combo ist leer", FR: "La combinaison est vide", RU: "Комбо пусто", UA: "Комбо порожнє" },
        "exec_combo": { TW: "執行組合“{name}”· {n} 步", CN: "执行组合「{name}」· {n} 步", EN: 'Executing combo "{name}" · {n} steps', DE: "Kombination „{name}“ · {n} Schritte wird ausgeführt", FR: 'Exécution du combo "{name}" · {n} étapes', RU: 'Выполнение комбо "{name}" · {n} шагов', UA: 'Виконання комбо "{name}" · {n} кроків' },
        "exec_combo_all": { TW: "開始對所有人執行組合“{name}”", CN: "开始对所有人执行组合「{name}」", EN: 'Executing combo "{name}" on everyone', DE: "Die Kombination „{name}“ wird für alle ausgeführt", FR: 'Exécution du combo "{name}" sur tout le monde', RU: 'Выполнение комбо "{name}" для всех', UA: 'Виконання комбо "{name}" для всіх' },
        "sync_failed": { TW: "設定同步到伺服器失敗，已保留在本地", CN: "设置同步到服务器失败，已保留在本地", EN: "Failed to sync settings to server; kept locally", DE: "Die Einstellungen konnten nicht mit dem Server synchronisiert werden.", FR: "Échec de la synchronisation des paramètres avec le serveur ;", RU: "Не удалось синхронизировать настройки с сервером;", UA: "Не вдалося синхронізувати налаштування із сервером;" },
        "combo_saved": { TW: "組合已儲存", CN: "组合已保存", EN: "Combo saved", DE: "Combo gespeichert", FR: "Combinaison enregistrée", RU: "Комбо сохранено.", UA: "Комбінацію збережено" },
        "custom_saved": { TW: "自訂動作已儲存", CN: "自定义动作已保存", EN: "Custom action saved", DE: "Benutzerdefinierte Aktion gespeichert", FR: "Action personnalisée enregistrée", RU: "Специальное действие сохранено.", UA: "Власну дію збережено" },
        "deleted": { TW: "已刪除", CN: "已删除", EN: "Deleted", DE: "Gelöscht", FR: "Supprimé", RU: "Удалено", UA: "Видалено" },
        "fill_name": { TW: "請填寫動作名稱", CN: "请填写动作名称", EN: "Please enter an action name", DE: "Bitte geben Sie einen Aktionsnamen ein", FR: "Veuillez saisir un nom d'action", RU: "Введите название действия", UA: "Введіть назву дії" },
        "fill_dialog": { TW: "請填寫對話文本", CN: "请填写对话文本", EN: "Please enter dialog text", DE: "Bitte geben Sie den Dialogtext ein", FR: "Veuillez saisir le texte de la boîte de dialogue", RU: "Пожалуйста, введите текст диалога", UA: "Будь ласка, введіть текст діалогу" },
        "echo_notfound": { TW: "未找到 echo 數據", CN: "未找到 echo 数据", EN: "echo data not found", DE: "Echodaten nicht gefunden", FR: "données d'écho introuvables", RU: "эхо-данные не найдены", UA: "ехо-дані не знайдені" },
        "echo_cleaned": { TW: "已清理原 echo 資料（{n} 項）", CN: "已清理原 echo 数据（{n} 项）", EN: "Cleared original echo data ({n} items)", DE: "Ursprüngliche Echodaten gelöscht ({n} Elemente)", FR: "Données d'écho d'origine effacées ({n} éléments)", RU: "Исходные эхо-данные удалены (элементов: {n})", UA: "Очищено оригінальні ехо-дані ({n} елементів)" },
        "echo_clean_failed": { TW: "清理失敗：{msg}", CN: "清理失败：{msg}", EN: "Cleanup failed: {msg}", DE: "Bereinigung fehlgeschlagen: {msg}", FR: "Échec du nettoyage : {msg}", RU: "Очистка не удалась: {msg}", UA: "Помилка очищення: {msg}" },
        "import_echo_notfound": { TW: "未找到 echo/迴聲 的動作數據", CN: "未找到 echo/回声 的动作数据", EN: "echo action data not found", DE: "Echo-Aktionsdaten nicht gefunden", FR: "données d'action d'écho introuvables", RU: "данные эхо-действия не найдены", UA: "дані дії echo не знайдено" },
        "imported_echo": { TW: "已從 echo/迴聲 匯入 {n} 個動作", CN: "已从 echo/回声 导入 {n} 个动作", EN: "Imported {n} actions from echo", DE: "{n} Aktionen aus Echo importiert", FR: "{n} actions importées depuis echo", RU: "Импортировано {n} действий из echo.", UA: "Імпортовано {n} дій із echo" },
        "import_failed": { TW: "導入失敗：{msg}", CN: "导入失败：{msg}", EN: "Import failed: {msg}", DE: "Import fehlgeschlagen: {msg}", FR: "Échec de l'importation : {msg}", RU: "Не удалось импортировать: {msg}", UA: "Помилка імпорту: {msg}" },
        "exported": { TW: "已匯出 {n} 個動作", CN: "已导出 {n} 个动作", EN: "Exported {n} actions", DE: "{n} Aktionen exportiert", FR: "{n} actions exportées", RU: "Экспортировано {n} действий.", UA: "Експортовано {n} дій" },
        "export_failed": { TW: "匯出失敗：{msg}", CN: "导出失败：{msg}", EN: "Export failed: {msg}", DE: "Export fehlgeschlagen: {msg}", FR: "Échec de l'exportation : {msg}", RU: "Не удалось экспортировать: {msg}", UA: "Помилка експорту: {msg}" },
        "file_format_err": { TW: "文件格式錯誤：應為動作物件數組", CN: "文件格式错误：应为动作对象数组", EN: "Invalid file format: expected an array of action objects", DE: "Ungültiges Dateiformat: Es wurde ein Array von Aktionsobjekten erwartet", FR: "Format de fichier invalide : un tableau d'objets d'action attendu", RU: "Неверный формат файла: ожидается массив объектов действий.", UA: "Недійсний формат файлу: очікується масив об’єктів дії" },
        "json_parse_failed": { TW: "JSON 解析失敗：{msg}", CN: "JSON 解析失败：{msg}", EN: "JSON parse failed: {msg}", DE: "JSON-Analyse fehlgeschlagen: {msg}", FR: "Échec de l'analyse JSON : {msg}", RU: "Ошибка анализа JSON: {msg}", UA: "Помилка аналізу JSON: {msg}" },
        "read_file_failed": { TW: "讀取文件失敗", CN: "读取文件失败", EN: "Failed to read file", DE: "Datei konnte nicht gelesen werden", FR: "Échec de la lecture du fichier", RU: "Не удалось прочитать файл", UA: "Не вдалося прочитати файл" },
        "exec_custom": { TW: "執行：{name}", CN: "执行：{name}", EN: "Execute: {name}", DE: "Ausführen: {name}", FR: "Exécuter : {name}", RU: "Выполнить: {name}", UA: "Виконати: {name}" },
        "read_ext_failed": { TW: "讀取擴充設定失敗", CN: "读取扩展设置失败", EN: "Failed to read extension settings", DE: "Erweiterungseinstellungen konnten nicht gelesen werden", FR: "Échec de la lecture des paramètres de l'extension", RU: "Не удалось прочитать настройки расширения.", UA: "Не вдалося прочитати налаштування розширення" },
        "import_done": { TW: "導入完成：新增 {n} 個，更新 {m} 個", CN: "导入完成：新增 {n} 个，更新 {m} 个", EN: "Import done: {n} new, {m} updated", DE: "Import abgeschlossen: {n} neu, {m} aktualisiert", FR: "Importation terminée : {n} nouveaux, {m} mis à jour", RU: "Импорт выполнен: новых: {n}, обновленных: {m}.", UA: "Імпорт завершено: {n} нових, {m} оновлено" }
      });
      QiActI18n.register("custom", {
        "title": { TW: "我的動作（測試版）", CN: "我的动作（测试版）", EN: "My Actions (Beta)", DE: "Meine Aktionen (Beta)", FR: "Mes actions (bêta)", RU: "Мои действия (бета)", UA: "Мої дії (бета)" },
        "search_placeholder": { TW: "搜尋動作...", CN: "搜索动作...", EN: "Search actions...", DE: "Suchaktionen...", FR: "Actions de recherche...", RU: "Поиск действий...", UA: "Пошукові дії..." },
        "new": { TW: "新建", CN: "新建", EN: "New", DE: "Neu", FR: "Nouveau", RU: "Новый", UA: "новий" },
        "import": { TW: "導入", CN: "导入", EN: "Import", DE: "Import", FR: "Importer", RU: "Импорт", UA: "Імпорт" },
        "import_tooltip": { TW: "從 echo/迴聲 或本地 JSON 匯入自訂動作", CN: "从 echo/回声 或本地 JSON 导入自定义动作", EN: "Import custom actions from echo or local JSON", DE: "Importieren Sie benutzerdefinierte Aktionen aus Echo oder lokalem JSON", FR: "Importer des actions personnalisées depuis echo ou JSON local", RU: "Импортируйте пользовательские действия из echo или локального JSON.", UA: "Імпорт спеціальних дій із echo або локального JSON" },
        "import_echo": { TW: "從 echo/迴聲 導入", CN: "从 echo/回声 导入", EN: "Import from echo", DE: "Import aus Echo", FR: "Importer depuis echo", RU: "Импорт из эха", UA: "Імпорт з echo" },
        "import_file": { TW: "從本地 JSON 匯入", CN: "从本地 JSON 导入", EN: "Import from local JSON", DE: "Import aus lokalem JSON", FR: "Importer à partir du JSON local", RU: "Импорт из локального JSON", UA: "Імпорт з локального JSON" },
        "export": { TW: "導出為 JSON", CN: "导出为 JSON", EN: "Export as JSON", DE: "Als JSON exportieren", FR: "Exporter au format JSON", RU: "Экспортировать в формате JSON", UA: "Експорт як JSON" },
        "editmode_on": { TW: "完成編輯", CN: "完成编辑", EN: "Finish editing", DE: "Beenden Sie die Bearbeitung", FR: "Terminer la modification", RU: "Завершить редактирование", UA: "Завершити редагування" },
        "editmode_off": { TW: "編輯模式：拖曳排序與批次管理", CN: "编辑模式：拖动排序与批量管理", EN: "Edit mode: drag to reorder & batch manage", DE: "Bearbeitungsmodus: Zum Neuanordnen und Stapelverwalten ziehen", FR: "Mode édition : faites glisser pour réorganiser et gérer les lots", RU: "Режим редактирования: перетащите, чтобы изменить порядок и управлять пакетами", UA: "Режим редагування: перетягніть, щоб змінити порядок і пакетне керування" },
        "toggleall_on": { TW: "目前全部開啟，點選全部關閉", CN: "当前全部开启，点击全部关闭", EN: "All on; click to turn all off", DE: "Alles an;", FR: "Tout est allumé ;", RU: "Все включено;", UA: "Все включено;" },
        "toggleall_off": { TW: "目前全部關閉，點選全部開啟", CN: "当前全部关闭，点击全部开启", EN: "All off; click to turn all on", DE: "Alles aus;", FR: "Tout est éteint ;", RU: "Все выключено;", UA: "Все вимкнено;" },
        "chip_all": { TW: "全部", CN: "全部", EN: "All", DE: "Alle", FR: "Tous", RU: "Все", UA: "все" },
        "chip_xiaosu": { TW: "小酥", CN: "小酥", EN: "XiaoSu", DE: "XiaoSu", FR: "XiaoSu", RU: "СяоСу", UA: "СяоСу" },
        "chip_native": { TW: "我的", CN: "我的", EN: "Mine", DE: "Meins", FR: "Le mien", RU: "Мой", UA: "моя" },
        "select_all": { TW: "全選", CN: "全选", EN: "Select all", DE: "Alles auswählen", FR: "Tout sélectionner", RU: "Выбрать все", UA: "Вибрати все" },
        "selected_count": { TW: "已選 {n} 個", CN: "已选 {n} 个", EN: "{n} selected", DE: "{n} ausgewählt", FR: "{n} sélectionné", RU: "{n} выбрано", UA: "Вибрано {n}" },
        "cancel_select_all": { TW: "取消全選", CN: "取消全选", EN: "Deselect all", DE: "Alle abwählen", FR: "Tout désélectionner", RU: "Отменить выбор всех", UA: "Зняти вибір із усіх" },
        "batch_close": { TW: "大量關閉", CN: "批量关闭", EN: "Batch off", DE: "Batch ab", FR: "Lot", RU: "Пакетное отключение", UA: "Вимкнути партію" },
        "batch_delete": { TW: "大量刪除", CN: "批量删除", EN: "Batch delete", DE: "Stapellöschung", FR: "Suppression par lots", RU: "Пакетное удаление", UA: "Пакетне видалення" },
        "beta_banner": { TW: "自訂動作功能目前為【測試版(Beta)】，仍在開發中，可能存在不穩定或未完善之處，建議謹慎使用並及時回饋問題。", CN: "自定义动作功能当前为【测试版(Beta)】，仍在开发中，可能存在不稳定或未完善之处，建议谨慎使用并及时反馈问题。", EN: "Custom Actions is currently [Beta], still in development; may be unstable. Use with caution and report issues.", DE: "Benutzerdefinierte Aktionen befinden sich derzeit in der [Beta]-Phase und befinden sich noch in der Entwicklung.", FR: "Les actions personnalisées sont actuellement en [bêta], toujours en développement ;", RU: "Пользовательские действия в настоящее время находятся в стадии [бета-версии] и все еще находятся в разработке;", UA: "Спеціальні дії наразі [бета], ще в розробці;" },
        "echo_clean_text": { TW: "偵測到原 echo/迴聲 中仍有 {n} 個自訂動作資料。", CN: "检测到原 echo/回声 中仍有 {n} 个自定义动作数据。迁移完成后建议清理，避免动作重复显示与使用后乱码。", EN: "Detected {n} custom action entries still in original echo. Clean up after migration to avoid duplicates and garbled text.", DE: "Es wurden {n} benutzerdefinierte Aktionseinträge erkannt, die sich immer noch im ursprünglichen Echo befinden.", FR: "{n} entrées d'action personnalisée détectées, toujours dans l'écho d'origine.", RU: "Обнаружено {n} записей специальных действий, которые все еще находятся в исходном эхе.", UA: "Виявлено {n} записів користувацьких дій, які все ще залишаються в оригінальному відлунні." },
        "echo_clean_btn": { TW: "清理原 echo 數據", CN: "清理原 echo 数据", EN: "Clean original echo data", DE: "Bereinigen Sie die ursprünglichen Echodaten", FR: "Nettoyer les données d'écho d'origine", RU: "Очистить исходные эхо-данные", UA: "Очистити оригінальні ехо-дані" },
        "xiaosu_pack_label": { TW: "內建小酥動作包", CN: "内置小酥动作包", EN: "Built-in XiaoSu pack", DE: "Integriertes XiaoSu-Paket", FR: "Pack XiaoSu intégré", RU: "Встроенный пакет XiaoSu.", UA: "Вбудований пакет XiaoSu" },
        "xiaosu_pack_title": { TW: "內建小酥動作包（XiaoSuActivity 全部 51 個動作，預編譯進插件，離線可用，無需原版插件）", CN: "内置小酥动作包（XiaoSuActivity 全部 51 个动作，预编译进插件，离线可用，无需原版插件）", EN: "Built-in XiaoSu pack (all 51 XiaoSuActivity actions, precompiled, works offline, no original plugin needed)", DE: "Integriertes XiaoSu-Paket (alle 51 XiaoSuActivity-Aktionen, vorkompiliert, funktioniert offline, kein Original-Plugin erforderlich)", FR: "Pack XiaoSu intégré (les 51 actions XiaoSuActivity, précompilées, fonctionne hors ligne, aucun plugin d'origine requis)", RU: "Встроенный пакет XiaoSu (все 51 действие XiaoSuActivity предварительно скомпилированы, работают в автономном режиме, оригинальный плагин не требуется)", UA: "Вбудований пакет XiaoSu (всі 51 дія XiaoSuActivity, попередньо скомпільовані, працюють в автономному режимі, оригінальний плагін не потрібен)" },
        "xiaosu_pack_toggle_title": { TW: "開啟後，「我的動作」與 BC 原生動作清單顯示小酥動作拓展的全部動作", CN: "开启后，「我的动作」与 BC 原生动作列表显示小酥动作拓展的全部动作", EN: "When on, My Actions and BC native action list show all XiaoSu extended actions", DE: "Wenn diese Option aktiviert ist, werden in „Meine Aktionen“ und in der BC-nativen Aktionsliste alle erweiterten XiaoSu-Aktionen angezeigt", FR: "Lorsque cette option est activée, Mes actions et la liste d'actions natives BC affichent toutes les actions étendues de XiaoSu.", RU: "Если этот параметр включен, в списке «Мои действия» и собственном списке действий BC отображаются все расширенные действия XiaoSu.", UA: "Коли ввімкнено, Мої дії та рідний список дій BC показують усі розширені дії XiaoSu" },
        "xiaosu_pack_src_title": { TW: "內建小酥動作包（預編譯，無需原版插件）", CN: "内置小酥动作包（预编译，无需原版插件）", EN: "Built-in XiaoSu pack (precompiled, no original plugin needed)", DE: "Integriertes XiaoSu-Paket (vorkompiliert, kein Original-Plugin erforderlich)", FR: "Pack XiaoSu intégré (précompilé, aucun plugin d'origine requis)", RU: "Встроенный пакет XiaoSu (предварительно скомпилированный, оригинальный плагин не требуется)", UA: "Вбудований пакет XiaoSu (попередньо скомпільований, оригінальний плагін не потрібен)" },
        "src_echo_title": { TW: "來自 echo/迴聲 導入", CN: "来自 echo/回声 导入", EN: "Imported from echo", DE: "Von Echo importiert", FR: "Importé depuis echo", RU: "Импортировано из эха", UA: "Імпортовано з echo" },
        "src_qiact_title": { TW: "本插件創建", CN: "本插件创建", EN: "Created by this plugin", DE: "Erstellt von diesem Plugin", FR: "Créé par ce plugin", RU: "Создано этим плагином", UA: "Створено цим плагіном" },
        "empty": { TW: "還沒有自訂動作。", CN: "还没有自定义动作。点「新建」创建，或点「导入」从 echo/回声 迁移。", EN: 'No custom actions yet. Click "New" to create, or "Import" to migrate from echo.', DE: "Noch keine benutzerdefinierten Aktionen.", FR: "Aucune action personnalisée pour l'instant.", RU: "Специальных действий пока нет.", UA: "Спеціальних дій ще немає." },
        "filter_empty": { TW: "目前分類下沒有動作。", CN: "当前分类下没有动作。", EN: "No actions in this category.", DE: "Keine Aktionen in dieser Kategorie.", FR: "Aucune action dans cette catégorie.", RU: "В этой категории нет действий.", UA: "Жодних дій у цій категорії." },
        "scope_self": { TW: "僅自己", CN: "仅自己", EN: "Self only", DE: "Nur ich selbst", FR: "Soi seulement", RU: "Только для себя", UA: "Тільки для себе" },
        "scope_other": { TW: "僅他人", CN: "仅他人", EN: "Others only", DE: "Nur andere", FR: "Autres seulement", RU: "Только другие", UA: "Лише інші" },
        "scope_any": { TW: "皆可", CN: "皆可", EN: "Anyone", DE: "Irgendjemand", FR: "N'importe qui", RU: "Любой", UA: "хто завгодно" },
        "src_xiaosu": { TW: "小酥", CN: "小酥", EN: "XiaoSu", DE: "XiaoSu", FR: "XiaoSu", RU: "СяоСу", UA: "СяоСу" },
        "src_echo": { TW: "echo", CN: "echo", EN: "echo", DE: "Echo", FR: "écho", RU: "эхо", UA: "луна" },
        "src_qiact": { TW: "QiAct", CN: "QiAct", EN: "QiAct", DE: "QiAct", FR: "QiAct", RU: "QiAct", UA: "QiAct" },
        "drag_handle": { TW: "拖曳排序", CN: "拖动排序", EN: "Drag to reorder", DE: "Zum Neuanordnen ziehen", FR: "Faites glisser pour réorganiser", RU: "Перетащите, чтобы изменить порядок", UA: "Перетягніть, щоб змінити порядок" },
        "vis_on": { TW: "顯示中", CN: "显示中", EN: "Visible", DE: "Sichtbar", FR: "Visible", RU: "Видимый", UA: "Видно" },
        "vis_off": { TW: "已隱藏", CN: "已隐藏", EN: "Hidden", DE: "Versteckt", FR: "Caché", RU: "Скрытый", UA: "Прихований" },
        "vis_toggle_title": { TW: "在「動作」面板和 BC 原生動作清單中顯示", CN: "在「动作」面板和 BC 原生动作列表中显示", EN: "Show in Action panel and BC native action list", DE: "Im Aktionsbereich und in der BC-nativen Aktionsliste anzeigen", FR: "Panneau Afficher dans l'action et liste d'actions natives de la Colombie-Britannique", RU: "Показывать на панели действий и в собственном списке действий BC.", UA: "Показати на панелі дій і списку власних дій BC" },
        "vis_label_on": { TW: "顯示", CN: "显示", EN: "Show", DE: "Zeigen", FR: "Montrer", RU: "Показывать", UA: "Показати" },
        "vis_label_off": { TW: "隱藏", CN: "隐藏", EN: "Hide", DE: "Verstecken", FR: "Cacher", RU: "Скрывать", UA: "Сховати" },
        "run_title": { TW: "對目前目標執行", CN: "对当前目标执行", EN: "Execute on current target", DE: "Auf aktuellem Ziel ausführen", FR: "Exécuter sur la cible actuelle", RU: "Выполнить по текущей цели", UA: "Виконати на поточній цілі" },
        "edit_title": { TW: "編輯", CN: "编辑", EN: "Edit", DE: "Bearbeiten", FR: "Modifier", RU: "Редактировать", UA: "Редагувати" },
        "delete_title": { TW: "刪除", CN: "删除", EN: "Delete", DE: "Löschen", FR: "Supprimer", RU: "Удалить", UA: "Видалити" },
        "echo_clean_confirm_title": { TW: "清理原 echo 數據", CN: "清理原 echo 数据", EN: "Clean original echo data", DE: "Bereinigen Sie die ursprünglichen Echodaten", FR: "Nettoyer les données d'écho d'origine", RU: "Очистить исходные эхо-данные", UA: "Очистити оригінальні ехо-дані" },
        "echo_clean_confirm_body": { TW: "確定清理原 echo/迴聲 中的自訂動作資料嗎？", CN: "确定清理原 echo/回声 中的自定义动作数据吗？\n仅删除其「动作数据」，不影响本插件与其他配置（清理后系统更稳定）。", EN: 'Clean custom action data from original echo?\nOnly its "action data" is removed; this plugin and other settings are unaffected (cleaner after).', DE: "Benutzerdefinierte Aktionsdaten vom ursprünglichen Echo bereinigen?", FR: "Nettoyer les données d'action personnalisées de l'écho d'origine ?", RU: "Очистить данные специальных действий из исходного эха?", UA: "Очистити дані користувацьких дій із оригінального відлуння?" },
        "echo_clean_confirm_btn": { TW: "清理", CN: "清理", EN: "Clean", DE: "Sauber", FR: "Faire le ménage", RU: "Чистый", UA: "чистий" },
        "delete_confirm_title": { TW: "刪除動作", CN: "删除动作", EN: "Delete action", DE: "Aktion löschen", FR: "Supprimer l'action", RU: "Удалить действие", UA: "Видалити дію" },
        "delete_confirm_body": { TW: "確定刪除自訂動作“{name}”嗎？", CN: "确定删除自定义动作「{name}」吗？", EN: 'Delete custom action "{name}"?', DE: "Benutzerdefinierte Aktion „{name}“ löschen?", FR: `Supprimer l'action personnalisée "{name}" ?`, RU: 'Удалить специальное действие "{name}"?', UA: 'Видалити спеціальну дію "{name}"?' },
        "delete_confirm_btn": { TW: "刪除", CN: "删除", EN: "Delete", DE: "Löschen", FR: "Supprimer", RU: "Удалить", UA: "Видалити" },
        "toggle_all_on_toast": { TW: "已開啟全部 {n} 個動作", CN: "已开启全部 {n} 个动作", EN: "Enabled all {n} actions", DE: "Alle {n} Aktionen aktiviert", FR: "Activé toutes les {n} actions", RU: "Включены все действия: {n}.", UA: "Увімкнено всі дії ({n})." },
        "toggle_all_off_toast": { TW: "已關閉全部 {n} 個動作", CN: "已关闭全部 {n} 个动作", EN: "Disabled all {n} actions", DE: "Alle {n} Aktionen deaktiviert", FR: "Désactivé toutes les {n} actions", RU: "Отключены все действия: {n}.", UA: "Вимкнено всі дії ({n})." },
        "show_toast": { TW: "已顯示“{name}”", CN: "已显示「{name}」", EN: 'Shown "{name}"', DE: "Angezeigt „{name}“", FR: 'Affiché "{name}"', RU: 'Показано "{name}"', UA: 'Показано "{name}"' },
        "hide_toast": { TW: "已隱藏「{name}」", CN: "已隐藏「{name}」", EN: 'Hidden "{name}"', DE: "Versteckt „{name}“", FR: '"{name}" masqué', RU: 'Скрытый "{name}"', UA: 'Прихований "{name}"' },
        "batch_close_toast": { TW: "已批次關閉 {n} 個動作", CN: "已批量关闭 {n} 个动作", EN: "Batch-disabled {n} actions", DE: "Batch-deaktivierte {n} Aktionen", FR: "{n} actions désactivées par lots", RU: "Пакетное отключение {n} действий", UA: "Пакетно вимкнено {n} дій" },
        "batch_delete_title": { TW: "批次刪除 {n} 個動作", CN: "批量删除 {n} 个动作", EN: "Batch delete {n} actions", DE: "Batch-Löschung von {n} Aktionen", FR: "Suppression par lots de {n} actions", RU: "Пакетное удаление {n} действий", UA: "Групове видалення {n} дій" },
        "batch_delete_body": { TW: "確定大量刪除以下動作嗎？\n{names}", CN: "确定批量删除以下动作吗？\n{names}", EN: "Delete the following actions in batch?\n{names}", DE: "Folgende Aktionen im Batch löschen?\n{names}", FR: "Supprimer les actions suivantes par lots ?\n{names}", RU: "Удалить следующие действия в пакетном режиме?\n{names}", UA: "Видалити наступні дії в пакеті?\n{names}" },
        "batch_delete_btn": { TW: "全部刪除", CN: "全部删除", EN: "Delete all", DE: "Alles löschen", FR: "Supprimer tout", RU: "Удалить все", UA: "Видалити все" },
        "batch_deleted_toast": { TW: "已大量刪除 {n} 個動作", CN: "已批量删除 {n} 个动作", EN: "Batch-deleted {n} actions", DE: "Batch-gelöschte {n} Aktionen", FR: "{n} actions supprimées par lot", RU: "Пакетно удалено {n} действий", UA: "Пакетно видалено {n} дій" }
      });
      QiActI18n.register("editor", {
        "pick_part_hint": { TW: "點選框選身體部位", CN: "点击框选身体部位", EN: "Click to select a body part", DE: "Klicken Sie, um ein Körperteil auszuwählen", FR: "Cliquez pour sélectionner une partie du corps", RU: "Нажмите, чтобы выбрать часть тела", UA: "Натисніть, щоб вибрати частину тіла" },
        "new_title": { TW: "新建：自訂動作", CN: "新建：自定义动作", EN: "New: Custom Action", DE: "Neu: Benutzerdefinierte Aktion", FR: "Nouveau : action personnalisée", RU: "Новое: пользовательское действие", UA: "Нове: спеціальна дія" },
        "edit_title": { TW: "編輯：自訂動作", CN: "编辑：自定义动作", EN: "Edit: Custom Action", DE: "Bearbeiten: Benutzerdefinierte Aktion", FR: "Modifier : Action personnalisée", RU: "Изменить: пользовательское действие", UA: "Редагувати: спеціальна дія" },
        "name_label": { TW: "動作名稱", CN: "动作名称", EN: "Action name", DE: "Aktionsname", FR: "Nom de l'action", RU: "Название действия", UA: "Назва дії" },
        "name_placeholder": { TW: "如：輕輕咬住", CN: "如：轻轻咬住", EN: "e.g. gently bite", DE: "z.B.", FR: "par ex.", RU: "например", UA: "напр." },
        "scope_label": { TW: "誰能使用這個動作", CN: "谁能使用这个动作", EN: "Who can use this action", DE: "Wer kann diese Aktion nutzen?", FR: "Qui peut utiliser cette action", RU: "Кто может использовать это действие", UA: "Хто може скористатися цією дією" },
        "part_label": { TW: "身體部位", CN: "身体部位", EN: "Body part", DE: "Körperteil", FR: "Partie du corps", RU: "Часть тела", UA: "Частина тіла" },
        "part_change": { TW: "點擊下圖重新選擇", CN: "点击下图重新选择", EN: "Click the diagram below to reselect", DE: "Klicken Sie auf das Diagramm unten, um es erneut auszuwählen", FR: "Cliquez sur le diagramme ci-dessous pour resélectionner", RU: "Нажмите на диаграмму ниже, чтобы повторно выбрать", UA: "Натисніть діаграму нижче, щоб повторно вибрати" },
        "dialog_other_label": { TW: "對他人時顯示", CN: "对他人时显示", EN: "Shown to others", DE: "Anderen gezeigt", FR: "Montré aux autres", RU: "Показан другим", UA: "Показано іншим" },
        "dialog_other_ph": { TW: "如：輕輕咬住了 對方 的耳朵", CN: "如：轻轻咬住了 对方 的耳朵", EN: "e.g. gently bit {TargetCharacter}'s ear", DE: "z.B. {TargetCharacter}", FR: "par ex. {TargetCharacter}", RU: "например {TargetCharacter}", UA: "напр. {TargetCharacter}" },
        "dialog_self_label": { TW: "對自己時顯示", CN: "对自己时显示", EN: "Shown to self", DE: "Sich selbst gezeigt", FR: "Montré à soi-même", RU: "Показан самому себе", UA: "Показано самому собі" },
        "dialog_self_ph": { TW: "如：被輕輕咬住了耳朵", CN: "如：被轻轻咬住了耳朵", EN: "e.g. got gently bitten on the ear", DE: "z.B.", FR: "par ex.", RU: "например", UA: "напр." },
        "tokens_title": { TW: "可用佔位符（點擊插入）", CN: "可用占位符（点击插入）", EN: "Available placeholders (click to insert)", DE: "Verfügbare Platzhalter (zum Einfügen klicken)", FR: "Espaces réservés disponibles (cliquez pour insérer)", RU: "Доступные заполнители (нажмите, чтобы вставить)", UA: "Доступні заповнювачі (клацніть, щоб вставити)" },
        "token_self": { TW: "自己", CN: "自己", EN: "Self", DE: "Selbst", FR: "Soi", RU: "Себя", UA: "себе" },
        "token_other": { TW: "對方", CN: "对方", EN: "Target", DE: "Ziel", FR: "Cible", RU: "Цель", UA: "Цільова" },
        "save": { TW: "儲存", CN: "保存", EN: "Save", DE: "Speichern", FR: "Sauvegarder", RU: "Сохранять", UA: "зберегти" },
        "delete": { TW: "刪除", CN: "删除", EN: "Delete", DE: "Löschen", FR: "Supprimer", RU: "Удалить", UA: "Видалити" },
        "cancel": { TW: "返回", CN: "返回", EN: "Back", DE: "Zurück", FR: "Dos", RU: "Назад", UA: "Назад" },
        "token_self_pill": { TW: "自己", CN: "自己", EN: "Self", DE: "Selbst", FR: "Soi", RU: "Себя", UA: "себе" },
        "token_other_pill": { TW: "對方", CN: "对方", EN: "Target", DE: "Ziel", FR: "Cible", RU: "Цель", UA: "Цільова" },
        "default_name": { TW: "動作", CN: "动作", EN: "Action", DE: "Aktion", FR: "Action", RU: "Действие", UA: "Дія" },
        "preview": { TW: "對他人：{a}\n{b}", CN: "对他人：{a}\n对自己：{b}", EN: "To others: {a}\nTo self: {b}", DE: "An andere: {a}\n{b}", FR: "Aux autres : {a}\n{b}", RU: "Другим: {a}\n{b}", UA: "Іншим: {a}\n{b}" }
      });
      QiActI18n.register("combo", {
        "new_name": { TW: "新組合", CN: "新组合", EN: "New combo", DE: "Neue Kombination", FR: "Nouvelle combinaison", RU: "Новое комбо", UA: "Нове комбо" },
        "up": { TW: "上移", CN: "上移", EN: "Move up", DE: "Bewegen Sie sich nach oben", FR: "Monter", RU: "Вверх", UA: "Рухатися вгору" },
        "down": { TW: "下移", CN: "下移", EN: "Move down", DE: "Bewegen Sie sich nach unten", FR: "Descendre", RU: "Двигаться вниз", UA: "Рухатися вниз" },
        "item_del": { TW: "刪除", CN: "删除", EN: "Delete", DE: "Löschen", FR: "Supprimer", RU: "Удалить", UA: "Видалити" },
        "exec": { TW: "執行", CN: "执行", EN: "Execute", DE: "Ausführen", FR: "Exécuter", RU: "Выполнять", UA: "Виконати" },
        "edit": { TW: "編輯", CN: "编辑", EN: "Edit", DE: "Bearbeiten", FR: "Modifier", RU: "Редактировать", UA: "Редагувати" },
        "delete": { TW: "刪除", CN: "删除", EN: "Delete", DE: "Löschen", FR: "Supprimer", RU: "Удалить", UA: "Видалити" },
        "new_btn": { TW: "新組合", CN: "新建组合", EN: "New combo", DE: "Neue Kombination", FR: "Nouvelle combinaison", RU: "Новое комбо", UA: "Нове комбо" },
        "add_title": { TW: "加入目前組合", CN: "加入当前组合", EN: "Add to current combo", DE: "Zur aktuellen Kombination hinzufügen", FR: "Ajouter au combo actuel", RU: "Добавить в текущую комбинацию", UA: "Додати до поточного комбо" },
        "count": { TW: "{n} 步", CN: "{n} 步", EN: "{n} steps", DE: "{n} Schritte", FR: "{n} étapes", RU: "{n} шагов", UA: "{n} кроків" },
        "name_ph": { TW: "組合名稱", CN: "组合名称", EN: "Combo name", DE: "Kombiname", FR: "Nom de la combinaison", RU: "Имя комбинации", UA: "Комбінована назва" },
        "delay_label": { TW: "動作間隔 {n}ms", CN: "动作间隔 {n}ms", EN: "Action interval {n}ms", DE: "Aktionsintervall {n}ms", FR: "Intervalle d'action {n} ms", RU: "Интервал действия {n}мс", UA: "Інтервал дії {n} мс" },
        "add_hint": { TW: "請到「動作」模式，點選動作旁的「加入」按鈕加入", CN: "请到「动作」模式，点击动作旁的「加入」按钮添加", EN: 'Go to Action mode and click "Add" next to an action', DE: "Gehen Sie in den Aktionsmodus und klicken Sie neben einer Aktion auf „Hinzufügen“.", FR: `Allez en mode Action et cliquez sur "Ajouter" à côté d'une action`, RU: "Перейдите в режим действий и нажмите «Добавить» рядом с действием.", UA: "Перейдіть у режим дії та натисніть «Додати» біля дії" },
        "edit_title": { TW: "編輯：{name}", CN: "编辑：{name}", EN: "Edit: {name}", DE: "Bearbeiten: {name}", FR: "Editer : {name}", RU: "Изменить: {name}", UA: "Редагувати: {name}" },
        "delete_confirm_title": { TW: "刪除組合", CN: "删除组合", EN: "Delete combo", DE: "Kombination löschen", FR: "Supprimer la combinaison", RU: "Удалить комбо", UA: "Видалити комбо" },
        "delete_confirm_body": { TW: "確定刪除這個組合嗎？", CN: "确定删除这个组合吗？", EN: "Delete this combo?", DE: "Diese Combo löschen?", FR: "Supprimer cette combinaison ?", RU: "Удалить это комбо?", UA: "Видалити цю комбінацію?" },
        "delete_confirm_btn": { TW: "刪除", CN: "删除", EN: "Delete", DE: "Löschen", FR: "Supprimer", RU: "Удалить", UA: "Видалити" },
        "empty": { TW: "暫無組合。", CN: "暂无组合。点击下方「新建组合」，然后到「动作」模式点击动作旁的「加入」按钮添加动作。", EN: 'No combos yet. Click "New combo" below, then in Action mode click "Add" next to an action.', DE: "Noch keine Combos.", FR: "Pas encore de combo.", RU: "Комбинаций пока нет.", UA: "Комбо ще немає." }
      });
      QiActI18n.register("update", {
        "available_tag": { TW: "更新可用", CN: "更新可用", EN: "Update available", DE: "Update verfügbar", FR: "Mise à jour disponible", RU: "Доступно обновление", UA: "Доступне оновлення" },
        "details": { TW: "看詳情", CN: "查看详情", EN: "View details", DE: "Details anzeigen", FR: "Afficher les détails", RU: "Посмотреть детали", UA: "Переглянути деталі" },
        "later": { TW: "稍後", CN: "稍后", EN: "Later", DE: "Später", FR: "Plus tard", RU: "Позже", UA: "Пізніше" },
        "later_title": { TW: "稍後提醒", CN: "稍后提醒", EN: "Remind me later", DE: "Erinnere mich später daran", FR: "Rappelle-moi plus tard", RU: "Напомни мне позже", UA: "Нагадай мені пізніше" },
        "ignore": { TW: "不再提示此版本", CN: "不再提示此版本", EN: "Don't show this version again", DE: "Diese Version nicht mehr anzeigen", FR: "Ne plus afficher cette version", RU: "Больше не показывать эту версию", UA: "Більше не показувати цю версію" },
        "know": { TW: "知道了", CN: "知道了", EN: "Got it", DE: "Habe es", FR: "J'ai compris", RU: "Понятно", UA: "зрозумів" },
        "announce_tag": { TW: "公告", CN: "公告", EN: "Announcement", DE: "Bekanntmachung", FR: "Annonce", RU: "Объявление", UA: "Оголошення" },
        "important_tag": { TW: "重要", CN: "重要", EN: "Important", DE: "Wichtig", FR: "Important", RU: "Важный", UA: "важливо" },
        "available_tag2": { TW: "可用", CN: "可用", EN: "Available", DE: "Verfügbar", FR: "Disponible", RU: "Доступный", UA: "в наявності" },
        "title": { TW: "已更新到 v{VERSION}", CN: "已更新到 v{VERSION}", EN: "Updated to v{VERSION}", DE: "Aktualisiert auf v{VERSION}", FR: "Mis à jour vers v{VERSION}", RU: "Обновлено до версии {VERSION}.", UA: "Оновлено до версії {VERSION}" },
        "parse_err": { TW: "回應解析失敗", CN: "响应解析失败", EN: "Response parse failed", DE: "Das Parsen der Antwort ist fehlgeschlagen", FR: "Échec de l'analyse de la réponse", RU: "Не удалось разобрать ответ.", UA: "Помилка аналізу відповіді" },
        "net_err": { TW: "網路錯誤", CN: "网络错误", EN: "Network error", DE: "Netzwerkfehler", FR: "Erreur réseau", RU: "Ошибка сети", UA: "Помилка мережі" },
        "json_parse_err": { TW: "JSON 解析失敗: {msg}", CN: "JSON 解析失败: {msg}", EN: "JSON parse failed: {msg}", DE: "JSON-Analyse fehlgeschlagen: {msg}", FR: "Échec de l'analyse JSON : {msg}", RU: "Ошибка анализа JSON: {msg}", UA: "Помилка аналізу JSON: {msg}" }
      });
      QiActI18n.register("part", {
        "ItemHead": { TW: "頭", CN: "头", EN: "Head", DE: "Kopf", FR: "Tête", RU: "Голова", UA: "Голова" },
        "ItemNose": { TW: "鼻", CN: "鼻", EN: "Nose", DE: "Nase", FR: "Nez", RU: "Нос", UA: "ніс" },
        "ItemEars": { TW: "耳", CN: "耳", EN: "Ears", DE: "Ohren", FR: "Oreilles", RU: "Уши", UA: "вуха" },
        "ItemHood": { TW: "頭套", CN: "头套", EN: "Hood", DE: "Haube", FR: "Capot", RU: "Капюшон", UA: "Капюшон" },
        "ItemMouth": { TW: "口", CN: "口", EN: "Mouth", DE: "Mund", FR: "Bouche", RU: "Рот", UA: "Рот" },
        "ItemMouth2": { TW: "口2", CN: "口2", EN: "Mouth2", DE: "Mund2", FR: "Bouche2", RU: "Рот2", UA: "Рот2" },
        "ItemMouth3": { TW: "口3", CN: "口3", EN: "Mouth3", DE: "Mund3", FR: "Bouche3", RU: "Рот3", UA: "Рот3" },
        "ItemNeck": { TW: "頸", CN: "颈", EN: "Neck", DE: "Nacken", FR: "Cou", RU: "Шея", UA: "Шия" },
        "ItemNeckAccessories": { TW: "頸飾", CN: "颈饰", EN: "Neck accessory", DE: "Halsaccessoire", FR: "Accessoire de cou", RU: "Шейный аксессуар", UA: "Шийний аксесуар" },
        "ItemNeckRestraints": { TW: "頸束", CN: "颈束", EN: "Neck restraint", DE: "Nackenstütze", FR: "Retenue du cou", RU: "Ограничение шеи", UA: "Обмежувач для шиї" },
        "ItemNipples": { TW: "乳", CN: "乳", EN: "Nipples", DE: "Brustwarzen", FR: "Mamelons", RU: "Соски", UA: "Соски" },
        "ItemNipplesPiercings": { TW: "乳穿", CN: "乳穿", EN: "Nipple piercing", DE: "Brustwarzenpiercing", FR: "Perçage du mamelon", RU: "Пирсинг сосков", UA: "Пірсинг сосків" },
        "ItemBreast": { TW: "胸", CN: "胸", EN: "Breast", DE: "Brust", FR: "Sein", RU: "Грудь", UA: "Груди" },
        "ItemTorso": { TW: "軀幹", CN: "躯干", EN: "Torso", DE: "Torso", FR: "Torse", RU: "Торс", UA: "тулуб" },
        "ItemTorso2": { TW: "腹", CN: "腹", EN: "Belly", DE: "Bauch", FR: "Ventre", RU: "Живот", UA: "живіт" },
        "ItemArms": { TW: "手臂", CN: "手臂", EN: "Arms", DE: "Waffen", FR: "Bras", RU: "Оружие", UA: "Зброя" },
        "ItemHands": { TW: "手", CN: "手", EN: "Hands", DE: "Hände", FR: "Mains", RU: "Руки", UA: "руки" },
        "ItemPelvis": { TW: "腰臀", CN: "腰臀", EN: "Hips", DE: "Hüften", FR: "Les hanches", RU: "Бедра", UA: "Стегна" },
        "ItemVulva": { TW: "私處", CN: "私处", EN: "Privates", DE: "Privatpersonen", FR: "Privés", RU: "Рядовые", UA: "Рядовий" },
        "ItemVulvaPiercings": { TW: "陰穿", CN: "阴穿", EN: "Vulva piercing", DE: "Vulva-Piercing", FR: "Perçage de la vulve", RU: "Пирсинг вульвы", UA: "Пірсинг вульви" },
        "ItemButt": { TW: "臀部後", CN: "臀后", EN: "Butt", DE: "Hintern", FR: "Bout", RU: "Задница", UA: "прикладом" },
        "ItemLegs": { TW: "腿", CN: "腿", EN: "Legs", DE: "Beine", FR: "Jambes", RU: "Ноги", UA: "ноги" },
        "ItemFeet": { TW: "腳", CN: "脚", EN: "Feet", DE: "Füße", FR: "Pieds", RU: "Ноги", UA: "Ноги" },
        "ItemBoots": { TW: "靴", CN: "靴", EN: "Boots", DE: "Stiefel", FR: "Bottes", RU: "Сапоги", UA: "Чоботи" }
      });
      QiActI18n.register("render", {
        "pick_char_part": { TW: "請先在左側選擇人物和部位", CN: "请先在左侧选择人物和部位", EN: "Select a character and part on the left first", DE: "Wählen Sie zunächst links einen Charakter und einen Teil aus", FR: "Sélectionnez d'abord un personnage et une partie à gauche", RU: "Сначала выберите символ и часть слева", UA: "Спочатку виберіть персонажа та частину зліва" },
        "no_actions": { TW: "該部位暫無可用動作", CN: "该部位暂无可用动作", EN: "No available actions for this part", DE: "Für diesen Teil sind keine Aktionen verfügbar", FR: "Aucune action disponible pour cette partie", RU: "Для этой части нет доступных действий", UA: "Немає доступних дій для цієї частини" },
        "load_err": { TW: "動作清單載入出錯，請刷新或回饋。<br><small>{msg}</small>", CN: "动作列表加载出错，请刷新或反馈。<br><small>{msg}</small>", EN: "Action list failed to load. Refresh or report.<br><small>{msg}</small>", DE: "Die Aktionsliste konnte nicht geladen werden.<br><small>{msg}</small>", FR: "La liste d'actions n'a pas pu être chargée.<br><small>{msg}</small>", RU: "Не удалось загрузить список действий.<br><small>{msg}</small>", UA: "Не вдалося завантажити список дій.<br><small>{msg}</small>" },
        "select_action": { TW: "選擇動作...", CN: "选择动作...", EN: "Select action...", DE: "Aktion auswählen...", FR: "Sélectionnez une action...", RU: "Выберите действие...", UA: "Виберіть дію..." },
        "pick_char_part2": { TW: "點選左側 ◀ 按鈕選擇人物和部位", CN: "点击左侧 ◀ 按钮选择人物和部位", EN: "Click the ◀ button on the left to select a character and part", DE: "Klicken Sie links auf die Schaltfläche ◀, um einen Charakter und einen Teil auszuwählen", FR: "Cliquez sur le bouton ◀ à gauche pour sélectionner un personnage et une partie", RU: "Нажмите кнопку ◀ слева, чтобы выбрать символ и часть.", UA: "Натисніть кнопку ◀ ліворуч, щоб вибрати персонажа та частину" },
        "pick_part_hint": { TW: "請在左側人物浮層選擇身體部位", CN: "请在左侧人物浮层选择身体部位", EN: "Select a body part in the left character popover", DE: "Wählen Sie im linken Zeichen-Popover einen Körperteil aus", FR: "Sélectionnez une partie du corps dans le popover du personnage de gauche", RU: "Выберите часть тела во всплывающем окне левого персонажа.", UA: "Виберіть частину тіла в лівому вікні символів" },
        "combo_title": { TW: "組合動作", CN: "组合动作", EN: "Combo actions", DE: "Kombiaktionen", FR: "Actions combinées", RU: "Комбинированные действия", UA: "Комбіновані дії" }
      });
      QiActI18n.register("ui", {
        "settings": { TW: "設定", CN: "设置", EN: "Settings", DE: "Einstellungen", FR: "Paramètres", RU: "Настройки", UA: "Налаштування" },
        "interaction_grid": { TW: "互動格", CN: "互动格", EN: "Interaction grid", DE: "Interaktionsraster", FR: "Grille interactive", RU: "Сетка взаимодействия", UA: "Сітка взаємодії" },
        "interaction_grid_title": { TW: "顯示或隱藏人物身體互動格", CN: "显示或隐藏人物身体互动格", EN: "Show or hide character interaction grids", DE: "Interaktionsraster ein- oder ausblenden", FR: "Afficher ou masquer les grilles interactives", RU: "Показать или скрыть сетку взаимодействия", UA: "Показати або приховати сітку взаємодії" },
        "mode_favorite": { TW: "收藏", CN: "收藏", EN: "Favorites", DE: "Favoriten", FR: "Favoris", RU: "Избранное", UA: "Вибране" },
        "mode_favorite_title": { TW: "管理與使用所有收藏動作", CN: "管理与使用所有收藏动作", EN: "Manage and use all favorite actions", DE: "Alle Favoriten verwalten und verwenden", FR: "Gérer et utiliser tous les favoris", RU: "Управление всеми избранными действиями", UA: "Керування всіма вибраними діями" }
      });
      QiActI18n.register("settings", {
        "title": { TW: "設定", CN: "设置", EN: "Settings", DE: "Einstellungen", FR: "Paramètres", RU: "Настройки", UA: "Налаштування" },
        "language": { TW: "語系", CN: "语言", EN: "Language", DE: "Sprache", FR: "Langue", RU: "Язык", UA: "Мова" },
        "theme": { TW: "主題", CN: "主题", EN: "Theme", DE: "Thema", FR: "Thème", RU: "Тема", UA: "Тема" },
        "auto": { TW: "自動", CN: "自动", EN: "Auto", DE: "Auto", FR: "Auto", RU: "Авто", UA: "Авто" },
        "chat_button": { TW: "收納到 BC 聊天室按鈕列", CN: "收纳到 BC 聊天室按钮栏", EN: "Dock in the BC chat-room buttons", DE: "In der BC-Chat-Schaltflächenleiste andocken", FR: "Ancrer dans les boutons de chat BC", RU: "Закрепить на панели кнопок BC", UA: "Закріпити на панелі кнопок BC" },
        "enable_xiaosu": { TW: "啟用小酥動作包", CN: "启用小酥动作包", EN: "Enable XiaoSu action pack", DE: "XiaoSu-Aktionspaket aktivieren", FR: "Activer le pack d’actions XiaoSu", RU: "Включить набор действий XiaoSu", UA: "Увімкнути набір дій XiaoSu" }
      });
      QiActI18n.register("editor", {
        "preview_label": { TW: "效果預覽", CN: "效果预览", EN: "Preview", DE: "Vorschau", FR: "Aperçu", RU: "Предпросмотр", UA: "Попередній перегляд" }
      });
      QiActI18n.register("render", {
        "favorite_title": { TW: "收藏動作", CN: "收藏动作", EN: "Favorite actions", DE: "Favoritenaktionen", FR: "Actions favorites", RU: "Избранные действия", UA: "Вибрані дії" }
      });
    })();
    var bcModSdk = (function() {
      const o = "1.2.0";
      function e(o2) {
        alert("Mod ERROR:\n" + o2);
        const e2 = new Error(o2);
        throw console.error(e2), e2;
      }
      const t = new TextEncoder();
      function n(o2) {
        return !!o2 && "object" == typeof o2 && !Array.isArray(o2);
      }
      function r(o2) {
        const e2 = /* @__PURE__ */ new Set();
        return o2.filter(((o3) => !e2.has(o3) && e2.add(o3)));
      }
      const i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
      function c(o2) {
        a.has(o2) || (a.add(o2), console.warn(o2));
      }
      function s(o2) {
        const e2 = [], t2 = /* @__PURE__ */ new Map(), n2 = /* @__PURE__ */ new Set();
        for (const r3 of f.values()) {
          const i3 = r3.patching.get(o2.name);
          if (i3) {
            e2.push(...i3.hooks);
            for (const [e3, a2] of i3.patches.entries()) t2.has(e3) && t2.get(e3) !== a2 && c(`ModSDK: Mod '${r3.name}' is patching function ${o2.name} with same pattern that is already applied by different mod, but with different pattern:
Pattern:
${e3}
Patch1:
${t2.get(e3) || ""}
Patch2:
${a2}`), t2.set(e3, a2), n2.add(r3.name);
          }
        }
        e2.sort(((o3, e3) => e3.priority - o3.priority));
        const r2 = (function(o3, e3) {
          if (0 === e3.size) return o3;
          let t3 = o3.toString().replaceAll("\r\n", "\n");
          for (const [n3, r3] of e3.entries()) t3.includes(n3) || c(`ModSDK: Patching ${o3.name}: Patch ${n3} not applied`), t3 = t3.replaceAll(n3, r3);
          return (0, eval)(`(${t3})`);
        })(o2.original, t2);
        let i2 = function(e3) {
          var t3, i3;
          const a2 = null === (i3 = (t3 = m.errorReporterHooks).hookChainExit) || void 0 === i3 ? void 0 : i3.call(t3, o2.name, n2), c2 = r2.apply(this, e3);
          return null == a2 || a2(), c2;
        };
        for (let t3 = e2.length - 1; t3 >= 0; t3--) {
          const n3 = e2[t3], r3 = i2;
          i2 = function(e3) {
            var t4, i3;
            const a2 = null === (i3 = (t4 = m.errorReporterHooks).hookEnter) || void 0 === i3 ? void 0 : i3.call(t4, o2.name, n3.mod), c2 = n3.hook.apply(this, [e3, (o3) => {
              if (1 !== arguments.length || !Array.isArray(e3)) throw new Error(`Mod ${n3.mod} failed to call next hook: Expected args to be array, got ${typeof o3}`);
              return r3.call(this, o3);
            }]);
            return null == a2 || a2(), c2;
          };
        }
        return { hooks: e2, patches: t2, patchesSources: n2, enter: i2, final: r2 };
      }
      function l(o2, e2 = false) {
        let r2 = i.get(o2);
        if (r2) e2 && (r2.precomputed = s(r2));
        else {
          let e3 = window;
          const a2 = o2.split(".");
          for (let t2 = 0; t2 < a2.length - 1; t2++) if (e3 = e3[a2[t2]], !n(e3)) throw new Error(`ModSDK: Function ${o2} to be patched not found; ${a2.slice(0, t2 + 1).join(".")} is not object`);
          const c2 = e3[a2[a2.length - 1]];
          if ("function" != typeof c2) throw new Error(`ModSDK: Function ${o2} to be patched not found`);
          const l2 = (function(o3) {
            let e4 = -1;
            for (const n2 of t.encode(o3)) {
              let o4 = 255 & (e4 ^ n2);
              for (let e5 = 0; e5 < 8; e5++) o4 = 1 & o4 ? -306674912 ^ o4 >>> 1 : o4 >>> 1;
              e4 = e4 >>> 8 ^ o4;
            }
            return ((-1 ^ e4) >>> 0).toString(16).padStart(8, "0").toUpperCase();
          })(c2.toString().replaceAll("\r\n", "\n")), d2 = { name: o2, original: c2, originalHash: l2 };
          r2 = Object.assign(Object.assign({}, d2), { precomputed: s(d2), router: () => {
          }, context: e3, contextProperty: a2[a2.length - 1] }), r2.router = /* @__PURE__ */ (function(o3) {
            return function(...e4) {
              return o3.precomputed.enter.apply(this, [e4]);
            };
          })(r2), i.set(o2, r2), e3[r2.contextProperty] = r2.router;
        }
        return r2;
      }
      function d() {
        for (const o2 of i.values()) o2.precomputed = s(o2);
      }
      function p() {
        const o2 = /* @__PURE__ */ new Map();
        for (const [e2, t2] of i) o2.set(e2, { name: e2, original: t2.original, originalHash: t2.originalHash, sdkEntrypoint: t2.router, currentEntrypoint: t2.context[t2.contextProperty], hookedByMods: r(t2.precomputed.hooks.map(((o3) => o3.mod))), patchedByMods: Array.from(t2.precomputed.patchesSources) });
        return o2;
      }
      const f = /* @__PURE__ */ new Map();
      function u(o2) {
        f.get(o2.name) !== o2 && e(`Failed to unload mod '${o2.name}': Not registered`), f.delete(o2.name), o2.loaded = false, d();
      }
      function g(o2, t2) {
        o2 && "object" == typeof o2 || e("Failed to register mod: Expected info object, got " + typeof o2), "string" == typeof o2.name && o2.name || e("Failed to register mod: Expected name to be non-empty string, got " + typeof o2.name);
        let r2 = `'${o2.name}'`;
        "string" == typeof o2.fullName && o2.fullName || e(`Failed to register mod ${r2}: Expected fullName to be non-empty string, got ${typeof o2.fullName}`), r2 = `'${o2.fullName} (${o2.name})'`, "string" != typeof o2.version && e(`Failed to register mod ${r2}: Expected version to be string, got ${typeof o2.version}`), o2.repository || (o2.repository = void 0), void 0 !== o2.repository && "string" != typeof o2.repository && e(`Failed to register mod ${r2}: Expected repository to be undefined or string, got ${typeof o2.version}`), null == t2 && (t2 = {}), t2 && "object" == typeof t2 || e(`Failed to register mod ${r2}: Expected options to be undefined or object, got ${typeof t2}`);
        const i2 = true === t2.allowReplace, a2 = f.get(o2.name);
        a2 && (a2.allowReplace && i2 || e(`Refusing to load mod ${r2}: it is already loaded and doesn't allow being replaced.
Was the mod loaded multiple times?`), u(a2));
        const c2 = (o3) => {
          let e2 = g2.patching.get(o3.name);
          return e2 || (e2 = { hooks: [], patches: /* @__PURE__ */ new Map() }, g2.patching.set(o3.name, e2)), e2;
        }, s2 = (o3, t3) => (...n2) => {
          var i3, a3;
          const c3 = null === (a3 = (i3 = m.errorReporterHooks).apiEndpointEnter) || void 0 === a3 ? void 0 : a3.call(i3, o3, g2.name);
          g2.loaded || e(`Mod ${r2} attempted to call SDK function after being unloaded`);
          const s3 = t3(...n2);
          return null == c3 || c3(), s3;
        }, p2 = { unload: s2("unload", (() => u(g2))), hookFunction: s2("hookFunction", ((o3, t3, n2) => {
          "string" == typeof o3 && o3 || e(`Mod ${r2} failed to patch a function: Expected function name string, got ${typeof o3}`);
          const i3 = l(o3), a3 = c2(i3);
          "number" != typeof t3 && e(`Mod ${r2} failed to hook function '${o3}': Expected priority number, got ${typeof t3}`), "function" != typeof n2 && e(`Mod ${r2} failed to hook function '${o3}': Expected hook function, got ${typeof n2}`);
          const s3 = { mod: g2.name, priority: t3, hook: n2 };
          return a3.hooks.push(s3), d(), () => {
            const o4 = a3.hooks.indexOf(s3);
            o4 >= 0 && (a3.hooks.splice(o4, 1), d());
          };
        })), patchFunction: s2("patchFunction", ((o3, t3) => {
          "string" == typeof o3 && o3 || e(`Mod ${r2} failed to patch a function: Expected function name string, got ${typeof o3}`);
          const i3 = l(o3), a3 = c2(i3);
          n(t3) || e(`Mod ${r2} failed to patch function '${o3}': Expected patches object, got ${typeof t3}`);
          for (const [n2, i4] of Object.entries(t3)) "string" == typeof i4 ? a3.patches.set(n2, i4) : null === i4 ? a3.patches.delete(n2) : e(`Mod ${r2} failed to patch function '${o3}': Invalid format of patch '${n2}'`);
          d();
        })), removePatches: s2("removePatches", ((o3) => {
          "string" == typeof o3 && o3 || e(`Mod ${r2} failed to patch a function: Expected function name string, got ${typeof o3}`);
          const t3 = l(o3);
          c2(t3).patches.clear(), d();
        })), callOriginal: s2("callOriginal", ((o3, t3, n2) => {
          "string" == typeof o3 && o3 || e(`Mod ${r2} failed to call a function: Expected function name string, got ${typeof o3}`);
          const i3 = l(o3);
          return Array.isArray(t3) || e(`Mod ${r2} failed to call a function: Expected args array, got ${typeof t3}`), i3.original.apply(null != n2 ? n2 : globalThis, t3);
        })), getOriginalHash: s2("getOriginalHash", ((o3) => {
          "string" == typeof o3 && o3 || e(`Mod ${r2} failed to get hash: Expected function name string, got ${typeof o3}`);
          return l(o3).originalHash;
        })) }, g2 = { name: o2.name, fullName: o2.fullName, version: o2.version, repository: o2.repository, allowReplace: i2, api: p2, loaded: true, patching: /* @__PURE__ */ new Map() };
        return f.set(o2.name, g2), Object.freeze(p2);
      }
      function h() {
        const o2 = [];
        for (const e2 of f.values()) o2.push({ name: e2.name, fullName: e2.fullName, version: e2.version, repository: e2.repository });
        return o2;
      }
      let m;
      const y = void 0 === window.bcModSdk ? window.bcModSdk = (function() {
        const e2 = { version: o, apiVersion: 1, registerMod: g, getModsInfo: h, getPatchingInfo: p, errorReporterHooks: Object.seal({ apiEndpointEnter: null, hookEnter: null, hookChainExit: null }) };
        return m = e2, Object.freeze(e2);
      })() : (n(window.bcModSdk) || e("Failed to init Mod SDK: Name already in use"), 1 !== window.bcModSdk.apiVersion && e(`Failed to init Mod SDK: Different version already loaded ('1.2.0' vs '${window.bcModSdk.version}')`), window.bcModSdk.version !== o && alert(`Mod SDK warning: Loading different but compatible versions ('1.2.0' vs '${window.bcModSdk.version}')
One of mods you are using is using an old version of SDK. It will work for now but please inform author to update`), window.bcModSdk);
      return "undefined" != typeof exports && (Object.defineProperty(exports, "__esModule", { value: true }), exports.default = y), y;
    })();
    (function() {
      window.__QiAct_Loaded__ = true;
      const runtime = runtimeHost2 || window.__QiActRuntimeHost;
      function addRuntimeCleanup(cleanup) {
        return runtime && runtime.addCleanup ? runtime.addCleanup(cleanup) : cleanup;
      }
      function addRuntimeListener(target, type, listener, options) {
        if (runtime && runtime.listen) return runtime.listen(target, type, listener, options);
        target.addEventListener(type, listener, options);
        return listener;
      }
      function logD() {
        return;
      }
      const _hookErrSeen = {};
      function reportHookError(name, e) {
        if (_hookErrSeen[name] >= 3) return;
        _hookErrSeen[name] = (_hookErrSeen[name] || 0) + 1;
        console.warn("[QiAct] hook『" + name + "』异常（已忽略，最多报 3 次）:", e && e.message);
      }
      let _serverSyncWarned = false;
      function warnServerSync(e) {
        console.warn("[QiAct] 服务器设置同步失败，已回退本地存储:", e);
        if (!_serverSyncWarned) {
          _serverSyncWarned = true;
          toast(QiActT("toast.sync_failed"), "#FF5C5C");
        }
      }
      function silent(e, ctx) {
        return;
      }
      const VERSION = "1.4.0";
      const S_ENABLED = "xsact_qa_enabled";
      const S_FAVS = "xsact_qa_favorites";
      const S_PRESETS = "xsact_qa_presets";
      const S_LAST = "xsact_qa_last_action";
      const S_COMBOS = "xsact_qa_combos";
      const S_CUSTOM = "xsact_qa_custom_actions";
      const S_POS = "xsact_qa_panel_pos";
      const S_SIZE = "xsact_qa_panel_size";
      const S_MODE = "xsact_qa_panel_mode";
      const S_SELF = "xsact_qa_self_mode";
      const S_TOGGLE_POS = "xsact_qa_toggle_pos";
      const S_UPDATE_DISMISSED = "xsact_qa_update_dismissed";
      const S_LAST_ANNOUNCE = "xsact_qa_last_announce";
      const S_LAST_ANNOUNCE_VER = "xsact_qa_last_announce_ver";
      const S_LAST_SEEN_VERSION = "xsact_qa_last_seen_version";
      const S_UPDATE_ERROR_LOG = "xsact_qa_update_errlog";
      const S_ECHO_SUPPRESS = "xsact_qa_echo_suppressed";
      const S_XIAOSU_PACK = "xsact_qa_xiaosu_pack";
      const S_CA_FILTER = "xsact_qa_ca_filter";
      const S_CHAT_BUTTON = "xsact_qa_chat_button";
      const S_INTERACTION_GRID = "xsact_qa_interaction_grid";
      const state = {
        disposed: false,
        // 热移除后阻止异步续体重新建立 UI / timer
        modApi: null,
        // bcModSdk 注册句柄
        isActive: false,
        // 动作模式是否激活
        theme: "dark",
        // 当前主题 id（dark | light）
        selectedTarget: null,
        // 当前选中目标 Character
        selectedPart: null,
        // 当前选中部位 ItemGroup
        selectedAction: null,
        // 当前选中动作名
        selectedActionItem: null,
        // 当前选中动作绑定的道具
        panelMode: "part",
        // 'part'=单部位 | 'combo'=自定义组合
        charListOpen: false,
        // 人物列表弹出层是否打开
        popoverView: "chars",
        // 人物浮层当前视图：'chars' 人物列表 | 'parts' 部位选择
        allModeActive: false,
        // 全员范围开关
        favModeActive: false,
        // 收藏模式开关
        selfModeActive: false,
        // 自己模式开关
        combos: [],
        // 自定义组合
        editingComboId: null,
        // 正在编辑的组合 id
        customActions: [],
        // 自定义动作（QiAct 自包含版，替代 echo/回声）
        echoSuppressed: /* @__PURE__ */ new Set(),
        // 已导入的 echo 原始动作名（屏蔽用）
        echoPrefixes: /* @__PURE__ */ new Set(),
        // 已导入 echo 动作的中文显示前缀（安全前缀兜底，仅匹配 echo 命名空间，不误伤 BC 原生动作）
        xiaosuPack: true,
        // 是否启用内置「小酥动作包」（预编译进插件，离线可用，默认开）
        editingCustomId: null,
        // 正在编辑的自定义动作 id
        caEditMode: false,
        // 自定义动作「编辑模式」（拖动排序/批量管理）
        caSelected: [],
        // 编辑模式下选中的自定义动作 id 列表
        caDragId: null,
        // 拖动排序中正在拖拽的 id
        caFilter: "all",
        // 「我的动作」分类 chip 过滤：'all' | 'xiaosu' | 'native' | 'echo'
        favorites: [],
        // 收藏复合键数组：格式 "部位Group|动作名"（如 "ItemMouth|Caress"）
        presets: [],
        // 预留预设
        lastAction: null,
        // 上次执行的动作
        toggleBtnDrawn: false,
        // 浮动开关是否已绘制
        pendingBanner: null,
        // 面板未打开时暂存的公告/更新横幅
        updateTimer: null,
        // 更新检测轮询定时器
        // ── UI / 渲染缓存 ──
        actionPanelEl: null,
        // 右侧面板 DOM
        bodyGrids: /* @__PURE__ */ new Map(),
        // Character -> 身体线框元素
        toggleBtnEl: null,
        // 浮动开关 DOM
        charAnchor: {},
        // 角色真实绘制坐标 {MN:{x,y,zoom,t}}
        cachedRect: null,
        // 画布屏幕矩形缓存
        cachedScaleX: 1,
        cachedScaleY: 1,
        refreshInterval: null,
        // 线框刷新定时器
        lastLayoutCount: 0,
        // 上次布局角色数
        toggleDragged: false,
        // 本次按下闪电按钮是否已拖动
        chatButtonDocked: false,
        favoritePartFilter: "all",
        interactionGridActive: true
      };
      const BODY_PARTS = [
        { group: "ItemHead", label: QiActT("part.ItemHead"), icon: "🗣" },
        { group: "ItemNose", label: QiActT("part.ItemNose"), icon: "👃" },
        { group: "ItemEars", label: QiActT("part.ItemEars"), icon: "👂" },
        { group: "ItemHood", label: QiActT("part.ItemHood"), icon: "🎭" },
        { group: "ItemMouth", label: QiActT("part.ItemMouth"), icon: "👄" },
        { group: "ItemMouth2", label: QiActT("part.ItemMouth2"), icon: "👄" },
        { group: "ItemMouth3", label: QiActT("part.ItemMouth3"), icon: "👄" },
        { group: "ItemNeck", label: QiActT("part.ItemNeck"), icon: "🔗" },
        { group: "ItemNeckAccessories", label: QiActT("part.ItemNeckAccessories"), icon: "🔗" },
        { group: "ItemNeckRestraints", label: QiActT("part.ItemNeckRestraints"), icon: "🔗" },
        { group: "ItemNipples", label: QiActT("part.ItemNipples"), icon: "☁" },
        { group: "ItemNipplesPiercings", label: QiActT("part.ItemNipplesPiercings"), icon: "💎" },
        { group: "ItemBreast", label: QiActT("part.ItemBreast"), icon: "🫂" },
        { group: "ItemTorso", label: QiActT("part.ItemTorso"), icon: "👕" },
        { group: "ItemTorso2", label: QiActT("part.ItemTorso2"), icon: "👕" },
        { group: "ItemArms", label: QiActT("part.ItemArms"), icon: "💪" },
        { group: "ItemHands", label: QiActT("part.ItemHands"), icon: "✋" },
        { group: "ItemPelvis", label: QiActT("part.ItemPelvis"), icon: "〰" },
        { group: "ItemVulva", label: QiActT("part.ItemVulva"), icon: "🌸" },
        { group: "ItemVulvaPiercings", label: QiActT("part.ItemVulvaPiercings"), icon: "💎" },
        { group: "ItemButt", label: QiActT("part.ItemButt"), icon: "🍑" },
        { group: "ItemLegs", label: QiActT("part.ItemLegs"), icon: "🦵" },
        { group: "ItemFeet", label: QiActT("part.ItemFeet"), icon: "👢" },
        { group: "ItemBoots", label: QiActT("part.ItemBoots"), icon: "🥾" }
      ];
      const SUBPART_TO_BASE = {
        "ItemMouth2": "ItemMouth",
        "ItemMouth3": "ItemMouth",
        "ItemNeckAccessories": "ItemNeck",
        "ItemNeckRestraints": "ItemNeck",
        "ItemNipplesPiercings": "ItemNipples",
        "ItemTorso2": "ItemTorso"
      };
      const BODY_AX0 = 0, BODY_AX1 = 500;
      const BODY_AY1 = 1e3;
      const GRID_FIXED_HEIGHT = 1e3;
      var _zoneCache = {};
      function getPartZones(C, groupName) {
        var family = C && C.AssetFamily || typeof Player !== "undefined" && Player.AssetFamily || "Female3DCG";
        var key = family + "|" + groupName;
        if (_zoneCache[key]) return _zoneCache[key];
        var zones = null;
        try {
          if (typeof AssetGroupGet === "function") {
            var grp = AssetGroupGet(family, groupName);
            if (grp && Array.isArray(grp.Zone) && grp.Zone.length) {
              zones = grp.Zone.map(function(z) {
                return [z[0], z[1], z[2], z[3]];
              });
            }
          }
        } catch (e) {
          zones = null;
        }
        if (!zones) {
          var i = -1;
          for (var k = 0; k < BODY_PARTS.length; k++) {
            if (BODY_PARTS[k].group === groupName) {
              i = k;
              break;
            }
          }
          if (i < 0) i = 0;
          zones = [[
            BODY_AX0,
            i / BODY_PARTS.length * BODY_AY1,
            BODY_AX1 - BODY_AX0,
            BODY_AY1 / BODY_PARTS.length
          ]];
        }
        _zoneCache[key] = zones;
        return zones;
      }
      function waitFor(fn, timeout) {
        timeout = timeout || 12e4;
        return new Promise((resolve, reject) => {
          const start = Date.now();
          const check = () => {
            try {
              if (fn()) resolve(true);
              else if (Date.now() - start > timeout) reject(new Error("waitFor timeout"));
              else setTimeout(check, 100);
            } catch (e) {
              if (Date.now() - start > timeout) reject(e);
              else setTimeout(check, 100);
            }
          };
          check();
        });
      }
      function loadStorage(key, fallback) {
        try {
          var v = localStorage.getItem(key);
          return v ? JSON.parse(v) : fallback;
        } catch (e) {
          console.error("[QiAct] 读取存储失败 " + key + ":", e);
          return fallback;
        }
      }
      function safeStringify(val) {
        var seen = /* @__PURE__ */ new WeakSet();
        return JSON.stringify(val, function(key, value) {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular]";
            seen.add(value);
          }
          return value;
        });
      }
      function saveStorage(key, val) {
        try {
          localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
          console.error("[QiAct] 写入存储失败 " + key + ":", e);
          try {
            if (typeof val === "object" && val) {
              console.error("  keys=", Object.keys(val).join(","), "types=", Object.keys(val).map(function(k) {
                return typeof val[k];
              }).join(","));
            }
          } catch (_) {
            console.warn("[QiAct] 诊断存储值结构失败（已忽略）:", _ && _.message);
          }
          try {
            localStorage.setItem(key, safeStringify(val));
            console.warn("[QiAct] 已用安全序列化兜底写入 " + key + "（跳过循环引用）");
          } catch (e2) {
            console.error("[QiAct] 安全兜底仍失败 " + key + ":", e2);
          }
        }
      }
      const S_THEME = "xsact_qa_theme";
      const MOD_NS = "QiAct";
      const THEMES = [
        { id: "dark", name: QiActT("ui.theme_dark"), base: "dark" },
        { id: "light", name: QiActT("ui.theme_light"), base: "light" }
      ];
      function getTheme(id) {
        for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
        return THEMES[0];
      }
      function getServerStore() {
        try {
          if (typeof Player === "undefined" || !Player.OnlineSettings) return null;
          if (!Player.OnlineSettings.ExtensionSettings) Player.OnlineSettings.ExtensionSettings = {};
          if (!Player.OnlineSettings.ExtensionSettings[MOD_NS]) Player.OnlineSettings.ExtensionSettings[MOD_NS] = {};
          return Player.OnlineSettings.ExtensionSettings[MOD_NS];
        } catch (e) {
          return null;
        }
      }
      function saveToServer(key, val) {
        var store = getServerStore();
        if (!store) return;
        store[key] = val;
        try {
          if (typeof ServerAccountUpdate !== "undefined" && ServerAccountUpdate && typeof ServerAccountUpdate.QueueData === "function") {
            ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings });
          }
        } catch (e) {
          warnServerSync(e);
        }
      }
      function loadFromServer(key, fallback) {
        var store = getServerStore();
        if (!store || !(key in store)) return fallback;
        return store[key];
      }
      function persist(key, val) {
        saveStorage(key, val);
        saveToServer(key, val);
      }
      function loadSetting(key, fallback) {
        try {
          var s = loadFromServer(key, void 0);
          if (s !== void 0) return s;
          return loadStorage(key, fallback);
        } catch (e) {
          console.error("[QiAct] 读取设置失败 " + key + ":", e);
          return fallback;
        }
      }
      function migrateFavorites() {
        if (!Array.isArray(state.favorites)) {
          state.favorites = [];
          return;
        }
        var needMigrate = state.favorites.some(function(f) {
          return typeof f === "string" && f.indexOf("|") === -1;
        });
        if (!needMigrate) {
          var normalized = state.favorites.map(function(key) {
            var p = key.indexOf("|");
            return p < 0 ? key : canonicalPartGroup(key.slice(0, p)) + key.slice(p);
          }).filter(function(key, i, arr) {
            return arr.indexOf(key) === i;
          });
          if (JSON.stringify(normalized) !== JSON.stringify(state.favorites)) {
            state.favorites = normalized;
            persist(S_FAVS, state.favorites);
          }
          return;
        }
        var groups = BODY_PARTS.map(function(p) {
          return p.group;
        });
        var out = [];
        state.favorites.forEach(function(f) {
          if (typeof f !== "string") return;
          if (f.indexOf("|") !== -1) {
            out.push(f);
            return;
          }
          var name = f;
          var expanded = false;
          if (typeof ActivityAllowedForGroup === "function" && Player) {
            groups.forEach(function(g) {
              try {
                var acts = ActivityAllowedForGroup(Player, g);
                if (acts.some(function(a) {
                  return a.Activity && a.Activity.Name === name;
                })) {
                  out.push(g + "|" + name);
                  expanded = true;
                }
              } catch (_) {
              }
            });
          }
          if (!expanded) out.push(name);
        });
        state.favorites = out.map(function(key) {
          var p = key.indexOf("|");
          return p < 0 ? key : canonicalPartGroup(key.slice(0, p)) + key.slice(p);
        }).filter(function(key, i, arr) {
          return arr.indexOf(key) === i;
        });
        persist(S_FAVS, state.favorites);
      }
      function applyTheme(themeId) {
        var t = getTheme(themeId);
        state.theme = t.id;
        document.documentElement.setAttribute("data-xsact-theme", t.id);
      }
      function toggleTheme() {
        var next = state.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        persist(S_THEME, next);
        toast(QiActT("ui.theme_switched", { theme: next === "dark" ? QiActT("ui.theme_dark") : QiActT("ui.theme_light") }), accentColor());
      }
      function getActionsForPart(partGroup, targetChar) {
        targetChar = targetChar || state.selectedTarget;
        var actions = [];
        if (targetChar && typeof ActivityAllowedForGroup === "function") {
          try {
            var allowed = ActivityAllowedForGroup(targetChar, partGroup);
            if (Array.isArray(allowed) && allowed.length > 0) {
              actions = allowed.map(function(a) {
                if (!a) return null;
                var name = a.Activity ? a.Activity.Name || "" : a.Name || "";
                return { Name: name, translatedName: getActivityLabelFallback(name, partGroup), Item: a.Item || null };
              }).filter(function(a) {
                return a && a.Name;
              });
            }
          } catch (e) {
            console.warn("[QiAct] ActivityAllowedForGroup 失败，改用全量列表:", e.message);
          }
        }
        if (actions.length === 0 && window.BC_Interactive_Index && window.BC_Interactive_Index.Interactive_Index) {
          actions = window.BC_Interactive_Index.Interactive_Index.filter(function(act) {
            return act.Target_Group === partGroup;
          }).map(function(act) {
            return {
              Name: act.activityName || "",
              translatedName: act.translatedactivity || act.activityName || "",
              Item: null
            };
          });
        }
        if (actions.length === 0 && window.ActivityFemale3DCG) {
          var raw = window.ActivityFemale3DCG.filter(function(a) {
            if (!a.Name || !a.Target) return false;
            var targets = Array.isArray(a.Target) ? a.Target : [a.Target];
            if (targets.indexOf(partGroup) !== -1) return true;
            if (a.TargetSelf === true) return targets.indexOf(partGroup) !== -1;
            var selfT = Array.isArray(a.TargetSelf) ? a.TargetSelf : a.TargetSelf ? [a.TargetSelf] : [];
            return selfT.indexOf(partGroup) !== -1;
          });
          actions = raw.map(function(a) {
            return { Name: a.Name || "", translatedName: getActivityLabelFallback(a.Name, partGroup), Item: null };
          });
        }
        var seen = {};
        return actions.filter(function(a) {
          if (!a.Name || a.Name.indexOf("MISSING") !== -1 || a.translatedName && (a.translatedName.indexOf("[STRING_RETRIEVAL_FAILED]") !== -1 || a.translatedName.indexOf("MISSING TEXT IN") !== -1 || a.translatedName.indexOf("MISSING ACTIVITY") !== -1)) return false;
          if (!shouldKeepAction(a.Name)) return false;
          if (state.echoSuppressed && caIsEchoSuppressed(a.Name)) return false;
          if (a.Name.indexOf(CA_PREFIX) === 0) {
            var ca = caFindByActivityName(a.Name);
            if (ca && ca.visible === false) return false;
          }
          if (seen[a.Name]) return false;
          seen[a.Name] = true;
          return true;
        });
      }
      function getActivityLabel(name, targetGroup) {
        if (!name) return "";
        if (name.translatedName) return name.translatedName;
        return getActivityLabelFallback(name, targetGroup);
      }
      function isMissingLabel(t) {
        if (!t || typeof t !== "string") return true;
        if (t.indexOf("[STRING_RETRIEVAL_FAILED]") !== -1) return true;
        if (t.indexOf("MISSING ACTIVITY") !== -1) return true;
        if (t.indexOf("MISSING TEXT IN") !== -1) return true;
        return false;
      }
      function patchActivityDictionaryText() {
        if (window.__QiAct_ADT_PATCHED) return;
        if (typeof window.ActivityDictionaryText !== "function" || !Array.isArray(window.ActivityDictionary)) return;
        if (state.modApi && typeof state.modApi.hookFunction === "function") {
          state.modApi.hookFunction("ActivityDictionaryText", 0, function(args, next) {
            var r = next(args);
            if (r && !isMissingLabel(r)) return r;
            var key = args[0];
            if (typeof key === "string") {
              var arr = window.ActivityDictionary;
              for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (Array.isArray(e) && e[0] === key && typeof e[1] === "string" && !isMissingLabel(e[1])) {
                  return e[1];
                }
              }
            }
            return r;
          });
          window.__QiAct_ADT_PATCHED = true;
          return;
        }
        console.warn("[QiAct] ModSDK hook 不可用，降级为 ActivityDictionaryText 直接覆盖；建议检查是否重复注入");
        var _orig = window.ActivityDictionaryText;
        window.__QiAct_ADT_ORIGINAL = _orig;
        window.ActivityDictionaryText = function(key) {
          var r = _orig.apply(this, arguments);
          if (r && !isMissingLabel(r)) return r;
          if (typeof key === "string") {
            var arr = window.ActivityDictionary;
            for (var i = 0; i < arr.length; i++) {
              var e = arr[i];
              if (Array.isArray(e) && e[0] === key && typeof e[1] === "string" && !isMissingLabel(e[1])) {
                return e[1];
              }
            }
          }
          return r;
        };
        window.__QiAct_ADT_PATCHED = true;
      }
      function getActivityLabelFallback(name, targetGroup) {
        if (!name) return "";
        if (name.indexOf(CA_PREFIX) === 0) {
          var ca = caFindByActivityName(name);
          if (ca) return ca.name;
          return name.substring(CA_PREFIX.length);
        }
        if (typeof window.ActivityDictionaryText !== "function") {
          if (name.indexOf("XSAct_") === 0) return name.substring(6);
          return name;
        }
        function tryKey(g, prefix) {
          var k = "Label-" + prefix + "-" + g + "-" + name;
          var t = window.ActivityDictionaryText(k);
          if (!isMissingLabel(t)) return t;
          return null;
        }
        function tryGroup(g) {
          return tryKey(g, "ChatOther") || tryKey(g, "ChatSelf");
        }
        var result = tryGroup(targetGroup || "");
        if (result) return result;
        if (targetGroup && SUBPART_TO_BASE[targetGroup]) {
          result = tryGroup(SUBPART_TO_BASE[targetGroup]);
          if (result) return result;
        }
        if (name.indexOf("XSAct_") === 0) return name.substring(6);
        var m = /^([A-Za-z]{2,12})_/.exec(name);
        if (m) return name.substring(m[0].length);
        return name;
      }
      function shouldKeepAction(name, targetGroup) {
        if (!name) return false;
        if (name.indexOf("MISSING") !== -1) return false;
        if (name.indexOf("[STRING_RETRIEVAL_FAILED]") !== -1) return false;
        if (/[一-鿿]/.test(name) || name.indexOf("XSAct_") === 0) return true;
        return true;
      }
      function findBestItemForActivityAsset(targetChar, group) {
        if (!targetChar || !targetChar.Appearance) return null;
        var items = targetChar.Appearance;
        var lowerGroups = ["ItemButt", "ItemPelvis", "ItemLegs", "ItemVulva", "ItemVulvaPiercings"];
        var upperGroups = ["ItemBreast", "ItemNipples", "ItemNipplesPiercings", "ItemTorso", "ItemTorso2", "ItemArms"];
        if (typeof InventoryGet === "function") {
          var direct = InventoryGet(targetChar, group);
          if (direct) return direct;
        }
        if (lowerGroups.indexOf(group) !== -1) {
          var panties = items.find(function(i) {
            return i && i.Asset && i.Asset.Group && /Panties/i.test(i.Asset.Group.Name);
          });
          if (panties) return panties;
          var lower = items.find(function(i) {
            return i && i.Asset && i.Asset.Group && /ClothLower/i.test(i.Asset.Group.Name);
          });
          if (lower) return lower;
          var cloth = items.find(function(i) {
            return i && i.Asset && i.Asset.Group && /Cloth/i.test(i.Asset.Group.Name) && !/Accessory/i.test(i.Asset.Group.Name);
          });
          if (cloth) return cloth;
          var suit = items.find(function(i) {
            return i && i.Asset && i.Asset.Group && /SuitLower/i.test(i.Asset.Group.Name);
          });
          if (suit) return suit;
        }
        if (upperGroups.indexOf(group) !== -1) {
          var top = items.find(function(i) {
            return i && i.Asset && i.Asset.Group && /Cloth/i.test(i.Asset.Group.Name) && !/Accessory/i.test(i.Asset.Group.Name);
          });
          if (top) return top;
          var suitTop = items.find(function(i) {
            return i && i.Asset && i.Asset.Group && /Suit/i.test(i.Asset.Group.Name);
          });
          if (suitTop) return suitTop;
        }
        return null;
      }
      function resolveContentKey(group, name, targetChar) {
        var isSelf = targetChar && Player && targetChar.MemberNumber === Player.MemberNumber;
        function firstExisting(prefix) {
          var order = [group];
          if (SUBPART_TO_BASE[group]) order.push(SUBPART_TO_BASE[group]);
          if (typeof ActivityDictionaryText !== "function") return null;
          for (var i = 0; i < order.length; i++) {
            var k = prefix + "-" + order[i] + "-" + name;
            var t = ActivityDictionaryText(k);
            if (!isMissingLabel(t)) return k;
          }
          return null;
        }
        if (isSelf) {
          var selfKey = firstExisting("ChatSelf");
          var otherKey = firstExisting("ChatOther");
          return selfKey || otherKey || "ChatSelf-" + group + "-" + name;
        }
        var otherKey = firstExisting("ChatOther");
        var selfKey = firstExisting("ChatSelf");
        return otherKey || selfKey || "ChatOther-" + group + "-" + name;
      }
      function makeActivityPacket(targetChar, group, name, activityItem) {
        var targetMN = targetChar && targetChar.MemberNumber;
        var contentKey = resolveContentKey(group, name, targetChar);
        var isSelfAction = contentKey.indexOf("ChatSelf-") === 0;
        var isPlayerTarget = Player && targetChar && targetChar.MemberNumber === Player.MemberNumber;
        var isTargetSelf = isSelfAction && !isPlayerTarget;
        function charTagForAction(c) {
          return {
            Tag: {
              MemberNumber: c && c.MemberNumber || 0,
              Name: c && (c.Name || c.AccountName) || "某人",
              Nickname: c && (c.Nickname || c.Name || c.AccountName) || "某人"
            }
          };
        }
        if (new RegExp("^" + CA_PREFIX).test(name)) {
          var ca = caFindByActivityName(name);
          if (ca) {
            var caSrc = Player && (Player.Nickname || Player.Name || Player.AccountName) || "某人";
            var caTgt = targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || "某人";
            var caDialog;
            if (ca.scope === "self") {
              caDialog = ca.dialogSelf && ca.dialogSelf.trim() ? ca.dialogSelf : ca.dialog;
            } else if (ca.scope === "other") {
              caDialog = ca.dialog;
            } else {
              caDialog = isSelfAction ? ca.dialogSelf && ca.dialogSelf.trim() ? ca.dialogSelf : ca.dialog : ca.dialog;
            }
            if (!caDialog) caDialog = ca.name || "某个动作";
            caDialog = caDialog.replace(/\{SourceCharacter\}/g, caSrc).replace(/\{TargetCharacter\}/g, caTgt).replace(/SourceCharacter/g, caSrc).replace(/TargetCharacter/g, caTgt);
            return {
              Content: "QiAct_ChatFallback",
              Type: "Action",
              Dictionary: [
                charTagForAction(Player),
                { Tag: 'MISSING TEXT IN "Interface.csv": QiAct_ChatFallback', Text: caDialog }
              ]
            };
          }
        }
        var contentText = typeof ActivityDictionaryText === "function" ? ActivityDictionaryText(contentKey) : null;
        var contentKeyMissing = isMissingLabel(contentText);
        var isEchoSuppressed = typeof caIsEchoSuppressed === "function" && caIsEchoSuppressed(name);
        var isForcedActivityMod = /^(LSCG_|Liko_)/.test(name || "") || /^XSAct_/.test(name || "") && !isEchoSuppressed;
        if ((contentKeyMissing || isEchoSuppressed) && !isForcedActivityMod) {
          var actor = isTargetSelf ? targetChar : Player;
          var actorTag = charTagForAction(actor);
          var sentence;
          if (!contentKeyMissing && contentText) {
            sentence = contentText.replace(/\{SourceCharacter\}/g, actorTag.Tag.Nickname).replace(/\{TargetCharacter\}/g, targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || "某人").replace(/SourceCharacter/g, actorTag.Tag.Nickname).replace(/TargetCharacter/g, targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || "某人");
          } else {
            var displayName = getActivityLabelFallback(name, group) || name || "某个动作";
            if (isTargetSelf) {
              sentence = "做了「" + displayName + "」";
            } else {
              sentence = "对" + (targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || "某人") + "做了「" + displayName + "」";
            }
          }
          var fbKey = "QiAct_ChatFallback";
          return {
            Content: fbKey,
            Type: "Action",
            Dictionary: [
              actorTag,
              { Tag: 'MISSING TEXT IN "Interface.csv": ' + fbKey, Text: sentence }
            ]
          };
        }
        var packet = {
          Content: contentKey,
          Type: "Activity",
          Dictionary: [
            { SourceCharacter: isTargetSelf ? targetMN : Player.MemberNumber },
            { TargetCharacter: targetMN },
            { Tag: "FocusAssetGroup", FocusGroupName: group }
          ]
        };
        var item = activityItem || null;
        if (!item && targetChar) {
          item = findBestItemForActivityAsset(targetChar, group);
        }
        if (!item && typeof InventoryGet === "function") {
          var isLscgEatChew = /^LSCG_(Eat|Chew)/i.test(name) || /EatItem$/i.test(name) || /ThrowItem$/i.test(name);
          var isHand = /^ItemHand/i.test(name);
          if (isLscgEatChew) {
            var tc = typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter) ? ChatRoomCharacter.find(function(c) {
              return c.MemberNumber === targetMN;
            }) : null;
            if (tc) item = InventoryGet(tc, "ItemHandheld");
          } else if (isHand) {
            item = InventoryGet(Player, "ItemHandheld");
          }
        }
        if (item && item.Asset) {
          var aa = { Tag: "ActivityAsset", AssetName: item.Asset.Name, GroupName: item.Asset.Group ? item.Asset.Group.Name : "ItemHandheld" };
          if (item.CraftName || item.Craft && item.Craft.Name)
            aa.CraftName = item.CraftName || item.Craft.Name;
          packet.Dictionary.push(aa);
          logD("ActivityAsset 已加入:", aa.AssetName, aa.GroupName, "CraftName:", aa.CraftName || "无");
        } else {
          logD("未生成 ActivityAsset:", name, group, "item存在=", !!item, "Asset存在=", !!(item && item.Asset));
        }
        packet.Dictionary.push({ ActivityName: name });
        return packet;
      }
      function recordLastAction(name, targetMN, part, dict) {
        state.lastAction = { name, targetMN, part, time: Date.now() };
        saveStorage(S_LAST, state.lastAction);
      }
      function findAllowedActivity(char, group, name) {
        if (typeof ActivityAllowedForGroup !== "function") return null;
        try {
          var allowed = ActivityAllowedForGroup(char, group);
          if (!Array.isArray(allowed)) return null;
          return allowed.find(function(a) {
            if (!a) return false;
            var n = a.Activity ? a.Activity.Name : a.Name;
            return n === name;
          }) || null;
        } catch (_) {
          return null;
        }
      }
      function comboDelay(combo) {
        return combo && typeof combo.delay === "number" && combo.delay >= 0 ? combo.delay : 160;
      }
      function orderBySelectedTarget(chars) {
        var ordered = (chars || []).slice();
        if (state.selectedTarget && state.selectedTarget.MemberNumber) {
          var mn = state.selectedTarget.MemberNumber;
          ordered.sort(function(a, b) {
            return a.MemberNumber === mn ? -1 : 0;
          });
        }
        return ordered;
      }
      function executeAction(charObj, activityName, activityItem, groupOverride) {
        if (!charObj || !activityName) return false;
        var name = String(activityName || "");
        var group = String(groupOverride || state.selectedPart || "");
        if (!name || !group) return false;
        try {
          var packet = makeActivityPacket(charObj, group, name, activityItem);
          if (!packet) {
            toast(QiActT("toast.need_item"), "#FF5C5C");
            return false;
          }
          if (!findAllowedActivity(charObj, group, name)) {
            toast(QiActT("toast.unavailable"), "#FF5C5C");
            return false;
          }
          var activityObj = null;
          var targetGroupObj = null;
          if (typeof ActivityRun === "function" && typeof ActivityGetGroupOrMirror === "function" && typeof AssetAllActivities === "function") {
            try {
              targetGroupObj = ActivityGetGroupOrMirror(charObj.AssetFamily, group);
              var allActs = AssetAllActivities(charObj.AssetFamily);
              activityObj = allActs.find(function(a) {
                return a.Name === name;
              });
              if (targetGroupObj && activityObj) {
                ActivityRun(Player, charObj, targetGroupObj, { Activity: activityObj, Item: activityItem }, false);
              }
            } catch (runErr) {
              console.warn("[QiAct] ActivityRun 本地副作用执行失败:", runErr.message);
            }
          }
          var prevFocus = charObj.FocusGroup;
          var focusGroupObj = null;
          if (typeof AssetGroup !== "undefined" && Array.isArray(AssetGroup)) {
            focusGroupObj = AssetGroup.find(function(g) {
              return g && g.Name === group;
            });
          }
          try {
            charObj.FocusGroup = focusGroupObj || { Name: group };
            if (typeof ServerSend === "function") {
              ServerSend("ChatRoomChat", packet);
            } else {
              console.warn("[QiAct] ServerSend 暂不可用，动作未实际发送");
            }
            recordLastAction(name, charObj.MemberNumber, group, packet.Dictionary);
            return true;
          } catch (sendErr) {
            console.warn("[QiAct] ServerSend 失败:", sendErr.message);
          } finally {
            charObj.FocusGroup = prevFocus;
          }
          toast(QiActT("toast.temporarily_unavailable"), "#FF5C5C");
          return false;
        } catch (e) {
          console.error("[QiAct] 执行动作异常:", e);
          toast(QiActT("toast.exec_failed", { msg: e.message }), "#FF5C5C");
          return false;
        }
      }
      function executeActionAll() {
        if (!state.selectedAction || !state.selectedPart) {
          toast(QiActT("toast.pick_action"), "#FF5C5C");
          return;
        }
        var chars = getRoomCharacters();
        if (!Array.isArray(chars) || chars.length === 0) {
          toast(QiActT("toast.no_others"), "#888");
          return;
        }
        var ordered = orderBySelectedTarget(chars);
        var name = String(state.selectedAction);
        var group = String(state.selectedPart);
        var delay = 120;
        var index = 0;
        function next() {
          if (index >= ordered.length || !state.isActive) return;
          var c = ordered[index++];
          var item = null;
          var found = findAllowedActivity(c, group, name);
          if (!found) return next();
          item = found.Item || null;
          if (executeAction(c, name, item || state.selectedActionItem)) ;
          setTimeout(next, delay);
        }
        next();
        toast(QiActT("toast.exec_all", { name: getActivityLabel(name, group) }), "#FF5C7A");
      }
      function generateId() {
        return "cmb_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
      }
      function saveCombos() {
        persist(S_COMBOS, state.combos);
      }
      function getCombo(id) {
        return state.combos.find(function(c) {
          return c.id === id;
        });
      }
      function addCombo(name) {
        var combo = { id: generateId(), name: String(name || QiActT("combo.new_name")), items: [], delay: 160 };
        state.combos.push(combo);
        saveCombos();
        return combo;
      }
      function deleteCombo(id) {
        state.combos = state.combos.filter(function(c) {
          return c.id !== id;
        });
        if (state.editingComboId === id) state.editingComboId = null;
        saveCombos();
      }
      function renameCombo(id, name) {
        var c = getCombo(id);
        if (c) {
          c.name = String(name || c.name);
          saveCombos();
        }
      }
      function addComboItem(comboId, group, action, label, item) {
        var c = getCombo(comboId);
        if (!c) return;
        c.items.push({ group, action, label, item: item || null });
        saveCombos();
      }
      function removeComboItem(comboId, index) {
        var c = getCombo(comboId);
        if (!c) return;
        c.items.splice(index, 1);
        saveCombos();
      }
      function moveComboItem(comboId, fromIndex, toIndex) {
        var c = getCombo(comboId);
        if (!c) return;
        var item = c.items.splice(fromIndex, 1)[0];
        c.items.splice(toIndex, 0, item);
        saveCombos();
      }
      function startEditCombo(id) {
        if (!getCombo(id)) return;
        state.editingComboId = id;
        renderPanel();
      }
      function stopEditCombo() {
        state.editingComboId = null;
        renderPanel();
      }
      function runComboOnTarget(charObj, combo) {
        if (!charObj || !combo || !combo.items.length) return;
        var items = combo.items.slice();
        var i = 0, delay = comboDelay(combo);
        function next() {
          if (i >= items.length || !state.isActive) return;
          var it = items[i++];
          var item = it.item || null;
          var found = findAllowedActivity(charObj, it.group, it.action);
          if (found) item = found.Item || item;
          if (executeAction(charObj, it.action, item, it.group)) ;
          setTimeout(next, delay);
        }
        next();
        toast("执行组合「" + combo.name + "」· " + items.length + " 步", "#FF5C7A");
      }
      function runComboAll(combo) {
        if (!combo || !combo.items.length) {
          toast(QiActT("toast.combo_empty"), "#FF5C5C");
          return;
        }
        var chars = getRoomCharacters();
        if (!Array.isArray(chars) || chars.length === 0) {
          toast(QiActT("toast.no_others"), "#888");
          return;
        }
        var ordered = orderBySelectedTarget(chars);
        var ci = 0;
        function nextChar() {
          if (ci >= ordered.length || !state.isActive) return;
          var c = ordered[ci++];
          runComboOnTarget(c, combo);
          var d = comboDelay(combo);
          setTimeout(nextChar, combo.items.length * d + 300);
        }
        nextChar();
        toast(QiActT("toast.exec_combo_all", { name: combo.name }), "#FF5C7A");
      }
      var CA_PREFIX = "QiAct_";
      function caHash(str) {
        var h = 5381;
        str = String(str || "");
        for (var i = 0; i < str.length; i++) {
          h = (h << 5) + h + str.charCodeAt(i) >>> 0;
        }
        return h.toString(36);
      }
      function caActivityName(act) {
        return CA_PREFIX + caHash(act.name + "|" + act.group + "|" + act.scope);
      }
      function caBuildActivityDef(act) {
        var actName = caActivityName(act);
        var isSelfOnly = act.scope === "self";
        var isOtherOnly = act.scope === "other";
        var actId = parseInt(caHash(actName), 36) % 9e8 + 1e8;
        return {
          Name: actName,
          ActivityID: actId,
          MaxProgress: 0,
          Prerequisite: [],
          Target: isSelfOnly ? [] : [act.group],
          TargetSelf: isOtherOnly ? [] : [act.group]
        };
      }
      function caSetDict(key, value) {
        if (typeof key !== "string" || !key || value == null) return;
        if (typeof patchActivityDictionaryText === "function") {
          try {
            patchActivityDictionaryText();
          } catch (e2) {
          }
        }
        try {
          var loader = window.ActivityDictionaryLoad && window.ActivityDictionaryLoad();
          if (loader && loader.cache && typeof loader.cache === "object") loader.cache[key] = value;
          else if (loader && typeof loader.set === "function") loader.set(key, value);
          else if (loader && typeof loader === "object") loader[key] = value;
        } catch (e2) {
        }
        if (Array.isArray(window.ActivityDictionary)) {
          var found = false;
          for (var i = 0; i < window.ActivityDictionary.length; i++) {
            var e = window.ActivityDictionary[i];
            if (Array.isArray(e) && e[0] === key) {
              e[1] = value;
              found = true;
              break;
            }
          }
          if (!found) window.ActivityDictionary.push([key, value]);
        }
      }
      function caRemoveDict(key) {
        if (typeof key !== "string" || !key) return;
        if (Array.isArray(window.ActivityDictionary)) {
          for (var i = window.ActivityDictionary.length - 1; i >= 0; i--) {
            var e = window.ActivityDictionary[i];
            if (Array.isArray(e) && e[0] === key) window.ActivityDictionary.splice(i, 1);
          }
        }
        try {
          var loader = window.ActivityDictionaryLoad && window.ActivityDictionaryLoad();
          if (loader && loader.cache && typeof loader.cache === "object") delete loader.cache[key];
          else if (loader && typeof loader.delete === "function") loader.delete(key);
          else if (loader && typeof loader === "object") delete loader[key];
        } catch (e2) {
        }
      }
      function caRegisterDictionary(act, nm) {
        try {
          var group = act.group || "ItemMouth";
          var label = act.name || nm;
          var dialogOther = act.dialog || label;
          var dialogSelf = act.dialogSelf || act.dialog || label;
          var groups = [group];
          if (typeof SUBPART_TO_BASE !== "undefined" && SUBPART_TO_BASE[group]) groups.push(SUBPART_TO_BASE[group]);
          groups.forEach(function(g) {
            caSetDict("Label-ChatOther-" + g + "-" + nm, label);
            caSetDict("ChatOther-" + g + "-" + nm, dialogOther);
            caSetDict("Label-ChatSelf-" + g + "-" + nm, label);
            caSetDict("ChatSelf-" + g + "-" + nm, dialogSelf);
          });
        } catch (e) {
          console.warn("[QiAct] 注册自定义动作字典失败:", e.message);
        }
      }
      function caUnregisterDictionary(act, nm) {
        try {
          var group = act.group || "ItemMouth";
          var groups = [group];
          if (typeof SUBPART_TO_BASE !== "undefined" && SUBPART_TO_BASE[group]) groups.push(SUBPART_TO_BASE[group]);
          groups.forEach(function(g) {
            caRemoveDict("Label-ChatOther-" + g + "-" + nm);
            caRemoveDict("ChatOther-" + g + "-" + nm);
            caRemoveDict("Label-ChatSelf-" + g + "-" + nm);
            caRemoveDict("ChatSelf-" + g + "-" + nm);
          });
        } catch (e) {
        }
      }
      function caRegister(act) {
        try {
          if (act.visible === false) {
            caUnregister(act);
            return false;
          }
          var fam = Player && Player.AssetFamily || "Female3DCG";
          var acts = caRawAllActivities(fam);
          if (!Array.isArray(acts)) return false;
          var actName = caActivityName(act);
          if (acts.some(function(a) {
            return a && a.Name === actName;
          })) {
            caRegisterDictionary(act, actName);
            return true;
          }
          acts.push(caBuildActivityDef(act));
          caRegisterDictionary(act, actName);
          if (Array.isArray(ActivityFemale3DCGOrdering) && ActivityFemale3DCGOrdering.indexOf(actName) === -1) {
            ActivityFemale3DCGOrdering.push(actName);
          }
          return true;
        } catch (e) {
          console.warn("[QiAct] 注册自定义动作失败:", act.name, e.message);
          return false;
        }
      }
      function caUnregister(act) {
        try {
          var fam = Player && Player.AssetFamily || "Female3DCG";
          var acts = caRawAllActivities(fam);
          if (!Array.isArray(acts)) return;
          var nm = caActivityName(act);
          for (var i = acts.length - 1; i >= 0; i--) {
            if (acts[i] && acts[i].Name === nm) acts.splice(i, 1);
          }
          caUnregisterDictionary(act, nm);
          if (Array.isArray(ActivityFemale3DCGOrdering)) {
            for (var j = ActivityFemale3DCGOrdering.length - 1; j >= 0; j--) {
              if (ActivityFemale3DCGOrdering[j] === nm) ActivityFemale3DCGOrdering.splice(j, 1);
            }
          }
        } catch (_) {
          console.warn("[QiAct] 反注册活动排序项失败（已忽略）:", _ && _.message);
        }
      }
      function caFindByActivityName(name) {
        for (var i = 0; i < state.customActions.length; i++) {
          if (caActivityName(state.customActions[i]) === name) return state.customActions[i];
        }
        return null;
      }
      function caDetectSource(name) {
        if (!name || typeof name !== "string") return null;
        if (name.indexOf("LSCG_") === 0) return "LSCG";
        if (name.indexOf("Liko_") === 0) return "LIKO";
        if (name.indexOf(CA_PREFIX) === 0) {
          var ca = caFindByActivityName(name);
          if (ca && ca.source === "echo") return "ECHO";
          return "CUSTOM";
        }
        if (name.indexOf("XSAct_") === 0) return "XIAOSU";
        if (state.echoSuppressed && state.echoSuppressed.has(name)) return "ECHO";
        return null;
      }
      function loadCustomActions() {
        state.customActions = loadSetting(S_CUSTOM, []);
        if (!Array.isArray(state.customActions)) state.customActions = [];
        var echoNames = /* @__PURE__ */ new Set();
        try {
          var ext = Player && Player.ExtensionSettings;
          var echoKey = ext && Object.keys(ext).find(function(k) {
            return k.indexOf("ECHO") === 0;
          });
          var echoData = echoKey && ext[echoKey] && ext[echoKey]["动作数据"];
          if (echoData) Object.values(echoData).forEach(function(item) {
            if (item && item.Name) echoNames.add(item.Name);
          });
        } catch (e) {
          console.warn("[QiAct] 读取 echo 动作数据失败（已忽略）:", e && e.message);
        }
        state.customActions.forEach(function(a) {
          if (typeof a.visible !== "boolean") a.visible = true;
          if (!a.source) a.source = echoNames.has(a.name) ? "echo" : "native";
        });
        rebuildEchoSuppressed();
        caRemoveSuppressedEchoActivities();
        setTimeout(function() {
          try {
            rebuildEchoSuppressed();
            caRemoveSuppressedEchoActivities();
          } catch (e) {
          }
        }, 2e3);
      }
      function saveCustomActions() {
        persist(S_CUSTOM, state.customActions);
      }
      function getCustom(id) {
        for (var i = 0; i < state.customActions.length; i++) {
          if (state.customActions[i].id === id) return state.customActions[i];
        }
        return null;
      }
      function upsertCustom(act) {
        var idx = -1;
        for (var i = 0; i < state.customActions.length; i++) {
          if (state.customActions[i].id === act.id) {
            idx = i;
            break;
          }
        }
        caRegister(act);
        if (idx >= 0) state.customActions[idx] = act;
        else state.customActions.push(act);
        saveCustomActions();
      }
      function deleteCustom(id) {
        var act = getCustom(id);
        if (!act) return;
        caUnregister(act);
        state.customActions = state.customActions.filter(function(a) {
          return a.id !== id;
        });
        if (act.source === "echo" && act.name && !state.customActions.some(function(a) {
          return a.name === act.name && a.source === "echo";
        })) {
          state.echoSuppressed.delete(act.name);
          if (act.echoName) state.echoSuppressed.delete(act.echoName);
          saveEchoSuppressed();
        }
        if (act.source === "xiaosu" && act.xiaosuName) {
          state.echoSuppressed.delete(act.xiaosuName);
          saveEchoSuppressed();
        }
        saveCustomActions();
      }
      function loadEchoSuppressed() {
        try {
          var arr = loadSetting(S_ECHO_SUPPRESS, []);
          if (!Array.isArray(arr)) arr = [];
          state.echoSuppressed = new Set(arr.filter(function(n) {
            return typeof n === "string" && n;
          }));
        } catch (e) {
          state.echoSuppressed = /* @__PURE__ */ new Set();
        }
      }
      function saveEchoSuppressed() {
        try {
          persist(S_ECHO_SUPPRESS, Array.from(state.echoSuppressed));
        } catch (e) {
          console.warn("[QiAct] 持久化 echo 屏蔽集合失败（已忽略）:", e && e.message);
        }
      }
      function rebuildEchoSuppressed() {
        loadEchoSuppressed();
        state.echoPrefixes = /* @__PURE__ */ new Set();
        var echoData = caGetEchoData();
        state.customActions.forEach(function(a) {
          if (!a || a.source !== "echo" || !a.name) return;
          if (a.echoName && typeof a.echoName === "string") state.echoSuppressed.add(a.echoName);
          if (Array.isArray(a.echoNames)) a.echoNames.forEach(function(n) {
            if (n) state.echoSuppressed.add(n);
          });
          var _p1 = caExtractChinesePrefix(a.name);
          if (_p1) state.echoPrefixes.add(_p1);
          var _p2 = caExtractChinesePrefix(a.echoName);
          if (_p2) state.echoPrefixes.add(_p2);
          if (echoData) {
            var entry = caFindEchoEntry(echoData, a.name);
            if (!entry && a.echoName) entry = caFindEchoEntry(echoData, a.echoName);
            if (entry) {
              var resolved = caResolveEchoNames(entry.key, entry.item.Name);
              state.echoSuppressed.add(entry.key);
              state.echoSuppressed.add(entry.item.Name);
              state.echoSuppressed.add(resolved.displayName);
              state.echoSuppressed.add(resolved.rawName);
              var found = caFindEchoNamesInRegistry(entry.item, entry.key, a.group);
              found.forEach(function(n) {
                state.echoSuppressed.add(n);
                var _fp = caExtractChinesePrefix(n);
                if (_fp) state.echoPrefixes.add(_fp);
              });
            }
          }
          var found = caFindEchoNamesInRegistry({ Name: a.name }, a.echoName, a.group);
          found.forEach(function(n) {
            state.echoSuppressed.add(n);
          });
        });
        saveEchoSuppressed();
      }
      function caSuppressEchoName(name) {
        if (!name) return;
        state.echoSuppressed.add(name);
        saveEchoSuppressed();
      }
      function caIsEchoSuppressed(name) {
        if (!name) return false;
        var n = String(name);
        if (state.echoSuppressed.has(n)) return true;
        if (state.echoPrefixes && state.echoPrefixes.size) {
          var cp = caExtractChinesePrefix(n);
          if (cp && n.indexOf(CA_PREFIX) !== 0) {
            var it = state.echoPrefixes.values();
            for (var v = it.next(); !v.done; v = it.next()) {
              var p = v.value;
              if (p && cp.indexOf(p) === 0) return true;
            }
          }
        }
        return false;
      }
      function caIsChinese(s) {
        return typeof s === "string" && /[\u4e00-\u9fa5]/.test(s);
      }
      function caLooksLikeRawActivityName(s) {
        if (typeof s !== "string" || !s) return false;
        if (s.indexOf("_") !== -1) return true;
        if (/^[A-Za-z0-9]+$/.test(s)) return true;
        return !caIsChinese(s);
      }
      function caGetEchoData() {
        try {
          var ext = Player && Player.ExtensionSettings;
          var echoKey = ext && Object.keys(ext).find(function(k) {
            return k.indexOf("ECHO") === 0;
          });
          return echoKey && ext[echoKey] && ext[echoKey]["动作数据"];
        } catch (e) {
          return null;
        }
      }
      function caFindEchoEntry(data, name) {
        if (!data || typeof name !== "string" || !name) return null;
        for (var k in data) {
          var item = data[k];
          if (!item) continue;
          if (k === name || item.Name === name) return { key: k, item };
        }
        return null;
      }
      function caResolveEchoNames(k, itemName) {
        function rawScore(s) {
          if (typeof s !== "string" || !s) return 0;
          var score = 0;
          if (s.indexOf("_") !== -1) score += 3;
          if (/^[A-Za-z0-9_]/.test(s)) score += 1;
          if (/^[\u4e00-\u9fa5]+$/.test(s)) score -= 2;
          return score;
        }
        var kScore = rawScore(k);
        var nScore = rawScore(itemName);
        var displayName = k, rawName = itemName;
        if (kScore > nScore) {
          displayName = itemName;
          rawName = k;
        } else if (nScore > kScore) {
          displayName = k;
          rawName = itemName;
        } else if (!caIsChinese(k) && caIsChinese(itemName)) {
          displayName = itemName;
          rawName = k;
        }
        return { displayName: displayName || k, rawName: rawName || itemName };
      }
      function caExtractChinesePrefix(s) {
        if (!s) return "";
        var m = String(s).match(/^[\u4e00-\u9fa5]+/);
        return m ? m[0] : "";
      }
      function caActivityTargets(a) {
        var t = [];
        if (Array.isArray(a.Target)) t = t.concat(a.Target);
        else if (a.Target) t.push(a.Target);
        if (Array.isArray(a.TargetSelf)) t = t.concat(a.TargetSelf);
        else if (a.TargetSelf) t.push(a.TargetSelf);
        return t;
      }
      function caFindEchoNamesInRegistry(item, dataKey, group) {
        var names = /* @__PURE__ */ new Set();
        try {
          var fam = Player && Player.AssetFamily || "Female3DCG";
          var acts = caRawAllActivities(fam);
          if (!Array.isArray(acts)) return names;
          var candidates = [item.Name, dataKey].filter(function(n) {
            return typeof n === "string" && n;
          });
          var ourPrefix = CA_PREFIX;
          candidates.forEach(function(n) {
            acts.forEach(function(a) {
              if (a && a.Name === n && a.Name.indexOf(ourPrefix) !== 0) names.add(a.Name);
            });
          });
          candidates.forEach(function(n) {
            var prefix = caExtractChinesePrefix(n);
            if (!prefix) return;
            acts.forEach(function(a) {
              if (!a || !a.Name) return;
              if (a.Name.indexOf(ourPrefix) === 0) return;
              if (a.Name.indexOf(prefix) !== 0) return;
              if (group && caActivityTargets(a).indexOf(group) === -1) return;
              names.add(a.Name);
            });
          });
        } catch (e) {
          console.warn("[QiAct] 扫描 echo 原始动作名失败:", e.message);
        }
        return names;
      }
      function caRawAllActivities(fam) {
        try {
          if (typeof ActivityFemale3DCG !== "undefined" && Array.isArray(ActivityFemale3DCG)) return ActivityFemale3DCG;
        } catch (e) {
        }
        try {
          if (typeof AssetAllActivities === "function") return AssetAllActivities(fam || "Female3DCG");
        } catch (e) {
        }
        return [];
      }
      function caRemoveSuppressedEchoActivities() {
        try {
          if (!state.echoSuppressed || state.echoSuppressed.size === 0) return;
          var acts = caRawAllActivities(Player && Player.AssetFamily || "Female3DCG");
          if (Array.isArray(acts)) {
            for (var i = acts.length - 1; i >= 0; i--) {
              var nm = acts[i] && acts[i].Name;
              if (nm && caIsEchoSuppressed(nm)) acts.splice(i, 1);
            }
          }
          if (Array.isArray(ActivityFemale3DCGOrdering)) {
            for (var j = ActivityFemale3DCGOrdering.length - 1; j >= 0; j--) {
              if (caIsEchoSuppressed(ActivityFemale3DCGOrdering[j])) ActivityFemale3DCGOrdering.splice(j, 1);
            }
          }
        } catch (e) {
          console.warn("[QiAct] 物理移除 echo 原始动作失败（已忽略）:", e.message);
        }
      }
      function caCleanupEchoData() {
        try {
          var ext = Player && Player.ExtensionSettings;
          var echoKey = ext && Object.keys(ext).find(function(k) {
            return k.indexOf("ECHO") === 0;
          });
          if (!echoKey || !ext[echoKey]) {
            toast(QiActT("toast.echo_notfound"), "#FF5C5C");
            return;
          }
          var echoObj = ext[echoKey];
          var data = echoObj["动作数据"];
          var before = data && typeof data === "object" ? Object.keys(data).length : 0;
          if (data && typeof data === "object") {
            Object.keys(data).forEach(function(k) {
              var item = data[k];
              if (!item) return;
              state.echoSuppressed.add(k);
              if (item.Name) {
                state.echoSuppressed.add(item.Name);
                var resolved = caResolveEchoNames(k, item.Name);
                state.echoSuppressed.add(resolved.displayName);
                state.echoSuppressed.add(resolved.rawName);
              }
              var targets = [];
              if (item.Target) {
                if (Array.isArray(item.Target)) targets = targets.concat(item.Target);
                else targets.push(item.Target);
              }
              if (item.TargetSelf) {
                if (Array.isArray(item.TargetSelf)) targets = targets.concat(item.TargetSelf);
                else targets.push(item.TargetSelf);
              }
              var group = targets[0] || (state.customActions.find(function(a) {
                return a.name === k || a.name === (item && item.Name) || a.echoName === k || a.echoName === (item && item.Name);
              }) || {}).group;
              var found = caFindEchoNamesInRegistry(item, k, group);
              found.forEach(function(n) {
                state.echoSuppressed.add(n);
              });
            });
            saveEchoSuppressed();
          }
          caRemoveSuppressedEchoActivities();
          echoObj["动作数据"] = {};
          try {
            if (typeof PreferenceSetExtensionSettings === "function") {
              PreferenceSetExtensionSettings(echoKey, echoObj);
            } else if (typeof ServerAccountUpdate === "function") {
              ServerAccountUpdate();
            } else if (ServerAccountUpdate && typeof ServerAccountUpdate.QueueData === "function" && typeof ServerAccountUpdate.SyncToServer === "function") {
              ServerAccountUpdate.QueueData("ExtensionSettings", Player.ExtensionSettings);
              ServerAccountUpdate.SyncToServer();
            }
          } catch (e) {
            console.warn("[QiAct] 持久化 echo 设置失败（已忽略）:", e && e.message);
          }
          rebuildEchoSuppressed();
          caRemoveSuppressedEchoActivities();
          setTimeout(function() {
            try {
              rebuildEchoSuppressed();
              caRemoveSuppressedEchoActivities();
            } catch (e) {
              console.warn("[QiAct] 延迟清理 echo 残留失败（已忽略）:", e && e.message);
            }
          }, 1200);
          toast(QiActT("toast.echo_cleaned", { n: before }), "#46E0A0");
          updateCustomActionPanel(state.selectedTarget);
        } catch (e) {
          toast(QiActT("toast.echo_clean_failed", { msg: e.message }), "#FF5C5C");
        }
      }
      function caNewId() {
        return "ca_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
      }
      function updateCustomActionPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector("#xsact-panel-title");
        var listEl = state.actionPanelEl.querySelector("#xsact-action-list");
        if (!titleEl || !listEl) return;
        var allBtn = state.actionPanelEl.querySelector("#xsact-all-btn");
        if (allBtn) allBtn.disabled = true;
        if (state.editingCustomId) {
          var act = getCustom(state.editingCustomId);
          if (!act) {
            state.editingCustomId = null;
            updateCustomActionPanel(charObj);
            return;
          }
          renderCustomEditor(act, charObj, listEl, titleEl);
          return;
        }
        titleEl.textContent = (charObj ? characterDisplayName(charObj) + " → " : "") + QiActT("custom.title");
        var html = "";
        var acts = state.customActions;
        var editMode = state.caEditMode;
        var selSet = {};
        (state.caSelected || []).forEach(function(id) {
          selSet[id] = true;
        });
        var allOn = acts.length > 0 && acts.every(function(a) {
          return a.visible !== false;
        });
        html += '<div class="xsact-ca-view">';
        var _counts = { all: acts.length, xiaosu: 0, native: 0, echo: 0 };
        acts.forEach(function(a) {
          if (a.source === "xiaosu") _counts.xiaosu++;
          else if (a.source === "echo") _counts.echo++;
          else _counts.native++;
        });
        var _chips = [
          { key: "all", label: QiActT("custom.chip_all"), count: _counts.all, color: "all" },
          state.xiaosuPack ? { key: "xiaosu", label: QiActT("custom.chip_xiaosu"), count: _counts.xiaosu, color: "xiaosu" } : null,
          { key: "native", label: QiActT("custom.chip_native"), count: _counts.native, color: "native" },
          { key: "echo", label: "echo", count: _counts.echo, color: "echo" }
        ];
        _chips = _chips.filter(Boolean);
        html += '<div class="xsact-ca-chips" id="xsact-ca-chips">';
        _chips.forEach(function(ch) {
          var active = state.caFilter === ch.key;
          var empty = ch.count === 0 && ch.key !== "all" && ch.key !== "xiaosu";
          var dis = empty ? " is-disabled" : "";
          var act2 = active ? " is-active" : "";
          html += '<button type="button" class="xsact-ca-chip ' + ch.color + act2 + dis + '" data-filter="' + ch.key + '"' + (empty ? " disabled" : "") + '><span class="xsact-ca-chip-label">' + ch.label + '</span><span class="xsact-ca-chip-count">' + ch.count + "</span></button>";
        });
        html += "</div>";
        if (editMode) {
          html += '<div class="xsact-ca-batchbar" id="xsact-ca-batchbar"><button class="xsact-ca-select-all" id="xsact-ca-select-all">' + QiActT("custom.select_all") + '</button><span class="xsact-ca-selected-count" id="xsact-ca-selected-count">' + QiActT("custom.selected_count", { n: 0 }) + '</span><div class="xsact-ca-batch-actions"><button id="xsact-ca-batch-close" disabled>' + QiActT("custom.batch_close") + '</button><button id="xsact-ca-batch-delete" class="xsact-ca-batch-del" disabled>' + QiActT("custom.batch_delete") + "</button></div></div>";
        }
        html += '<div class="xsact-ca-beta">' + QiActT("custom.beta_banner") + "</div>";
        try {
          var _echoData = caGetEchoData();
          var _hasEchoSrc = state.customActions.some(function(a) {
            return a.source === "echo";
          });
          if (_echoData && Object.keys(_echoData).length && _hasEchoSrc) {
            html += '<div class="xsact-ca-echo-clean" id="xsact-ca-echo-clean"><div class="xsact-ca-echo-clean-text">' + QiActT("custom.echo_clean_text", { n: Object.keys(_echoData).length }) + '</div><button class="xsact-ca-echo-clean-btn" id="xsact-ca-echo-clean-btn" type="button">' + QiActT("custom.echo_clean_btn") + "</button></div>";
          }
        } catch (e) {
        }
        if (state.caFilter === "xiaosu") {
          html += '<div class="xsact-ca-xiaosu" id="xsact-ca-xiaosu"><span class="xsact-ca-xiaosu-label" title="' + QiActT("custom.xiaosu_pack_title") + '">' + QiActT("custom.xiaosu_pack_label") + '</span><label class="xsact-ca-toggle xsact-ca-xiaosu-switch" title="' + QiActT("custom.xiaosu_pack_toggle_title") + '"><input type="checkbox" class="xsact-ca-xiaosu-pack"' + (state.xiaosuPack ? " checked" : "") + '><span class="xsact-ca-toggle-track"></span></label></div>';
        }
        if (!acts.length) {
          html += '<div class="xsact-qa-empty xsact-ca-empty">' + QiActT("custom.empty") + "</div>";
        } else {
          var _flt = state.caFilter || "all";
          var _visibleActs = acts.filter(function(a) {
            if (_flt === "all") return true;
            if (_flt === "xiaosu") return a.source === "xiaosu";
            if (_flt === "echo") return a.source === "echo";
            if (_flt === "native") return !a.source || a.source === "native";
            return true;
          });
          if (!_visibleActs.length) {
            html += '<div class="xsact-qa-empty xsact-ca-empty xsact-ca-filter-empty">' + QiActT("custom.filter_empty") + "</div>";
          } else {
            html += '<div class="xsact-ca-list' + (editMode ? " is-editing" : "") + '">';
            _visibleActs.forEach(function(a) {
              var scopeBadge = a.scope === "self" ? '<span class="xsact-ca-badge self">' + QiActT("custom.scope_self") + "</span>" : a.scope === "other" ? '<span class="xsact-ca-badge other">' + QiActT("custom.scope_other") + "</span>" : '<span class="xsact-ca-badge any">' + QiActT("custom.scope_any") + "</span>";
              var sourceBadge = a.source === "xiaosu" ? '<span class="xsact-ca-src xiaosu" title="' + QiActT("custom.xiaosu_pack_src_title") + '">' + QiActT("custom.src_xiaosu") + "</span>" : a.source === "echo" ? '<span class="xsact-ca-src echo" title="' + QiActT("custom.src_echo_title") + '">' + QiActT("custom.src_echo") + "</span>" : '<span class="xsact-ca-src native" title="' + QiActT("custom.src_qiact_title") + '">' + QiActT("custom.src_qiact") + "</span>";
              var partLbl = (BODY_PARTS.find(function(p) {
                return p.group === a.group;
              }) || {}).label || a.group;
              var isVisible = a.visible !== false;
              var isSel = !!selSet[a.id];
              if (editMode) {
                html += '<div class="xsact-ca-card is-edit' + (isSel ? " is-selected" : "") + (isVisible ? "" : " is-hidden") + '" data-id="' + a.id + '" draggable="true"><span class="xsact-ca-handle" title="' + QiActT("custom.drag_handle") + '">' + svgIcon("grip", 14) + '</span><div class="xsact-ca-info"><div class="xsact-ca-title"><span class="xsact-ca-name">' + escapeHtml(a.name) + "</span>" + scopeBadge + sourceBadge + '</div><div class="xsact-ca-meta"><span class="xsact-ca-part">' + escapeHtml(partLbl) + '</span><span class="xsact-ca-vis-dot ' + (isVisible ? "on" : "off") + '">' + (isVisible ? QiActT("custom.vis_on") : QiActT("custom.vis_off")) + '</span></div></div><span class="xsact-ca-check" aria-hidden="true">' + svgIcon("check", 14) + "</span></div>";
              } else {
                html += '<div class="xsact-ca-card' + (isVisible ? "" : " is-hidden") + '" data-id="' + a.id + '"><div class="xsact-ca-info"><div class="xsact-ca-title"><span class="xsact-ca-name">' + escapeHtml(a.name) + "</span>" + scopeBadge + sourceBadge + '</div><div class="xsact-ca-meta"><label class="xsact-ca-toggle" title="' + QiActT("custom.vis_toggle_title") + '"><input type="checkbox" class="xsact-ca-visible" data-id="' + a.id + '"' + (isVisible ? " checked" : "") + '><span class="xsact-ca-toggle-track"></span><span class="xsact-ca-toggle-label">' + (isVisible ? QiActT("custom.vis_label_on") : QiActT("custom.vis_label_off")) + '</span></label><span class="xsact-ca-part">' + escapeHtml(partLbl) + '</span></div></div><div class="xsact-ca-btns"><button class="xsact-ca-run" title="' + QiActT("custom.run_title") + '" data-id="' + a.id + '">' + svgIcon("play", 14) + '</button><button class="xsact-ca-edit" title="' + QiActT("custom.edit_title") + '" data-id="' + a.id + '">' + svgIcon("pencil", 14) + '</button><button class="xsact-ca-delete" title="' + QiActT("custom.delete_title") + '" data-tooltip-type="danger" data-id="' + a.id + '">' + svgIcon("trash", 14) + "</button></div></div>";
              }
            });
            html += "</div>";
          }
        }
        html += '<div class="xsact-ca-toolbar"><input type="text" id="xsact-ca-search" class="xsact-ca-search' + (editMode ? " is-hidden" : "") + '" placeholder="' + QiActT("custom.search_placeholder") + '"><div class="xsact-ca-toolbar-btns"><button class="xsact-ca-new" id="xsact-ca-new" title="' + QiActT("custom.new") + '">' + svgIcon("plus", 14) + "<span>" + QiActT("custom.new") + '</span></button><div class="xsact-ca-import-wrap"><button class="xsact-ca-import" id="xsact-ca-import" title="' + QiActT("custom.import") + '">' + svgIcon("download", 14) + '</button><div class="xsact-ca-import-menu hidden" id="xsact-ca-import-menu"><button data-import="echo">' + QiActT("custom.import_echo") + '</button><button data-import="file">' + QiActT("custom.import_file") + '</button></div><input type="file" id="xsact-ca-file-input" class="xsact-ca-file-input" accept="application/json,.json"></div><button class="xsact-ca-export" id="xsact-ca-export" title="' + QiActT("custom.export") + '">' + svgIcon("upload", 14) + '</button><button class="xsact-ca-editmode' + (editMode ? " is-active" : "") + '" id="xsact-ca-editmode" title="' + (editMode ? QiActT("custom.editmode_on") : QiActT("custom.editmode_off")) + '">' + svgIcon("bulkEdit", 16) + '</button><button class="xsact-ca-toggleall' + (allOn ? " is-on" : "") + '" id="xsact-ca-toggleall" title="' + (allOn ? QiActT("custom.toggleall_on") : QiActT("custom.toggleall_off")) + '">' + svgIcon(allOn ? "toggleOn" : "toggleOff", 16) + "</button></div></div></div>";
        listEl.innerHTML = html;
        var newBtn = listEl.querySelector("#xsact-ca-new");
        if (newBtn) newBtn.addEventListener("click", function() {
          state.editingCustomId = caNewId();
          var draft = { id: state.editingCustomId, name: "", scope: "other", group: "ItemMouth", dialog: "", dialogSelf: "", createdAt: Date.now(), source: "native", visible: true };
          renderCustomEditor(draft, charObj, listEl, titleEl);
        });
        var importBtn = listEl.querySelector("#xsact-ca-import");
        var importMenu = listEl.querySelector("#xsact-ca-import-menu");
        if (importBtn && importMenu) {
          importBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            importMenu.classList.toggle("hidden");
          });
          importMenu.querySelectorAll("button").forEach(function(mb) {
            mb.addEventListener("click", function(e) {
              e.stopPropagation();
              importMenu.classList.add("hidden");
              var mode = mb.dataset.import;
              if (mode === "echo") {
                importCustomFromEcho();
              } else if (mode === "file") {
                listEl.querySelector("#xsact-ca-file-input").click();
              }
            });
          });
          var closeMenu = function(ev) {
            if (!importMenu.contains(ev.target) && !importBtn.contains(ev.target)) importMenu.classList.add("hidden");
          };
          state.actionPanelEl.addEventListener("click", closeMenu);
        }
        var fileInput = listEl.querySelector("#xsact-ca-file-input");
        if (fileInput) fileInput.addEventListener("change", function() {
          var file = fileInput.files && fileInput.files[0];
          if (file) importCustomFromFile(file);
          fileInput.value = "";
        });
        var exportBtn = listEl.querySelector("#xsact-ca-export");
        if (exportBtn) exportBtn.addEventListener("click", exportCustomActions);
        var echoCleanBtn = listEl.querySelector("#xsact-ca-echo-clean-btn");
        if (echoCleanBtn) echoCleanBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          qiactConfirm({
            title: QiActT("custom.echo_clean_confirm_title"),
            body: QiActT("custom.echo_clean_confirm_body"),
            confirmText: QiActT("custom.echo_clean_confirm_btn"),
            danger: true
          }).then(function(ok) {
            if (ok) caCleanupEchoData();
          });
        });
        var packToggle = listEl.querySelector(".xsact-ca-xiaosu-pack");
        if (packToggle) packToggle.addEventListener("change", function() {
          setXiaosuPack(!!packToggle.checked);
          updateCustomActionPanel(charObj);
        });
        listEl.querySelectorAll(".xsact-ca-chip").forEach(function(btn) {
          if (btn.disabled) return;
          btn.addEventListener("click", function() {
            var k = btn.dataset.filter;
            if (!k || state.caFilter === k) return;
            state.caFilter = k;
            persist(S_CA_FILTER, k);
            updateCustomActionPanel(charObj);
          });
        });
        var searchInput = listEl.querySelector("#xsact-ca-search");
        if (searchInput) searchInput.addEventListener("input", function() {
          var q = searchInput.value.trim().toLowerCase();
          listEl.querySelectorAll(".xsact-ca-card").forEach(function(card) {
            var nm = (card.querySelector(".xsact-ca-name") || {}).textContent || "";
            card.style.display = !q || nm.toLowerCase().indexOf(q) !== -1 ? "" : "none";
          });
        });
        var editModeBtn = listEl.querySelector("#xsact-ca-editmode");
        if (editModeBtn) editModeBtn.addEventListener("click", function() {
          state.caEditMode = !state.caEditMode;
          state.caSelected = [];
          updateCustomActionPanel(charObj);
        });
        var toggleAllBtn = listEl.querySelector("#xsact-ca-toggleall");
        if (toggleAllBtn) toggleAllBtn.addEventListener("click", function() {
          var turnOn = !allOn;
          acts.forEach(function(a) {
            a.visible = turnOn;
            caRegister(a);
          });
          saveCustomActions();
          updateCustomActionPanel(charObj);
          toast(turnOn ? QiActT("custom.toggle_all_on_toast", { n: acts.length }) : QiActT("custom.toggle_all_off_toast", { n: acts.length }), turnOn ? "#46E0A0" : "#888");
        });
        listEl.querySelectorAll(".xsact-ca-run").forEach(function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            runCustomAction(btn.dataset.id, charObj);
          });
        });
        listEl.querySelectorAll(".xsact-ca-edit").forEach(function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            state.editingCustomId = btn.dataset.id;
            updateCustomActionPanel(charObj);
          });
        });
        listEl.querySelectorAll(".xsact-ca-delete").forEach(function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            var id = btn.dataset.id;
            var a = getCustom(id);
            if (a) qiactConfirm({ title: QiActT("custom.delete_confirm_title"), body: QiActT("custom.delete_confirm_body", { name: a.name }), confirmText: QiActT("custom.delete_confirm_btn"), danger: true }).then(function(ok) {
              if (!ok) return;
              deleteCustom(id);
              updateCustomActionPanel(charObj);
              toast(QiActT("toast.deleted"), "#888");
            });
          });
        });
        listEl.querySelectorAll(".xsact-ca-visible").forEach(function(chk) {
          chk.addEventListener("change", function() {
            var id = chk.dataset.id;
            var a = getCustom(id);
            if (!a) return;
            a.visible = !!chk.checked;
            saveCustomActions();
            caRegister(a);
            updateCustomActionPanel(charObj);
            toast(a.visible ? QiActT("custom.show_toast", { name: a.name }) : QiActT("custom.hide_toast", { name: a.name }), a.visible ? "#46E0A0" : "#888");
          });
        });
        if (editMode) {
          let syncSel = function() {
            var cards = listEl.querySelectorAll(".xsact-ca-card.is-edit");
            cards.forEach(function(card) {
              var id = card.dataset.id;
              if (state.caSelected.indexOf(id) !== -1) card.classList.add("is-selected");
              else card.classList.remove("is-selected");
            });
            if (selectedCountEl) selectedCountEl.textContent = QiActT("custom.selected_count", { n: state.caSelected.length });
            if (batchCloseBtn) batchCloseBtn.disabled = state.caSelected.length === 0;
            if (batchDeleteBtn) batchDeleteBtn.disabled = state.caSelected.length === 0;
            if (selectAllBtn) selectAllBtn.textContent = state.caSelected.length > 0 && state.caSelected.length === cards.length ? QiActT("custom.cancel_select_all") : QiActT("custom.select_all");
          };
          var selectAllBtn = listEl.querySelector("#xsact-ca-select-all");
          var selectedCountEl = listEl.querySelector("#xsact-ca-selected-count");
          var batchCloseBtn = listEl.querySelector("#xsact-ca-batch-close");
          var batchDeleteBtn = listEl.querySelector("#xsact-ca-batch-delete");
          if (selectAllBtn) selectAllBtn.addEventListener("click", function() {
            var cards = Array.from(listEl.querySelectorAll(".xsact-ca-card.is-edit"));
            var allSelected = state.caSelected.length > 0 && state.caSelected.length === cards.length;
            state.caSelected = allSelected ? [] : cards.map(function(c) {
              return c.dataset.id;
            });
            syncSel();
          });
          listEl.querySelectorAll(".xsact-ca-card.is-edit").forEach(function(card) {
            card.addEventListener("click", function(e) {
              if (e.target.closest(".xsact-ca-handle")) return;
              var id = card.dataset.id;
              var idx = state.caSelected.indexOf(id);
              if (idx === -1) state.caSelected.push(id);
              else state.caSelected.splice(idx, 1);
              syncSel();
            });
          });
          if (batchCloseBtn) batchCloseBtn.addEventListener("click", function() {
            if (!state.caSelected.length) return;
            state.caSelected.slice().forEach(function(id) {
              var a = getCustom(id);
              if (!a) return;
              a.visible = false;
              caRegister(a);
            });
            saveCustomActions();
            updateCustomActionPanel(charObj);
            toast(QiActT("custom.batch_close_toast", { n: state.caSelected.length }), "#888");
          });
          if (batchDeleteBtn) batchDeleteBtn.addEventListener("click", function() {
            if (!state.caSelected.length) return;
            var names = state.caSelected.map(function(id) {
              var a = getCustom(id);
              return a ? a.name : "";
            }).filter(Boolean).join("、");
            var n = state.caSelected.length;
            qiactConfirm({
              title: QiActT("custom.batch_delete_title", { n }),
              body: QiActT("custom.batch_delete_body", { names }),
              confirmText: QiActT("custom.batch_delete_btn"),
              danger: true
            }).then(function(ok) {
              if (!ok) return;
              state.caSelected.slice().forEach(function(id) {
                deleteCustom(id);
              });
              state.caSelected = [];
              updateCustomActionPanel(charObj);
              toast(QiActT("custom.batch_deleted_toast", { n }), "#FF5C5C");
            });
          });
          var dragList = listEl.querySelector(".xsact-ca-list.is-editing");
          if (dragList) {
            var dragEl = null;
            dragList.addEventListener("dragstart", function(e) {
              var card = e.target.closest(".xsact-ca-card.is-edit");
              if (!card) return;
              dragEl = card;
              state.caDragId = card.dataset.id;
              e.dataTransfer.effectAllowed = "move";
              try {
                e.dataTransfer.setData("text/plain", card.dataset.id);
              } catch (err) {
                console.warn("[QiAct] 拖拽 setData 失败（已忽略）:", err && err.message);
              }
              setTimeout(function() {
                if (dragEl) dragEl.classList.add("dragging");
              }, 0);
            });
            dragList.addEventListener("dragover", function(e) {
              if (!dragEl) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              var after = getCaDragAfter(dragList, e.clientY);
              if (after == null) dragList.appendChild(dragEl);
              else dragList.insertBefore(dragEl, after);
            });
            dragList.addEventListener("drop", function(e) {
              if (dragEl) e.preventDefault();
            });
            dragList.addEventListener("dragend", function() {
              if (!dragEl) return;
              dragEl.classList.remove("dragging");
              dragEl = null;
              var ids = Array.from(dragList.querySelectorAll(".xsact-ca-card.is-edit")).map(function(c) {
                return c.dataset.id;
              });
              state.customActions.sort(function(a, b) {
                return ids.indexOf(a.id) - ids.indexOf(b.id);
              });
              saveCustomActions();
              updateCustomActionPanel(charObj);
            });
          }
          syncSel();
        }
      }
      function getCaDragAfter(container, y) {
        var els = Array.from(container.querySelectorAll(".xsact-ca-card.is-edit:not(.dragging)"));
        var closest = { offset: -Infinity, el: null };
        els.forEach(function(child) {
          var box = child.getBoundingClientRect();
          var offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            closest = { offset, el: child };
          }
        });
        return closest.el;
      }
      function renderBodyMapMini(container, selectedGroup, onSelect) {
        var rects = "";
        BODY_PARTS.forEach(function(part) {
          var zones = getPartZones(Player, part.group);
          zones.forEach(function(z) {
            var rx = Math.min(14, Math.min(z[2], z[3]) * 0.35);
            var sel = selectedGroup === part.group ? " selected" : "";
            rects += '<rect class="xsact-body-part-zone' + sel + '" data-group="' + part.group + '" x="' + z[0].toFixed(1) + '" y="' + z[1].toFixed(1) + '" width="' + z[2].toFixed(1) + '" height="' + z[3].toFixed(1) + '" rx="' + rx.toFixed(1) + '" data-label="' + escapeHtml(QiActT("part." + part.group)) + '"/>';
          });
        });
        var svg = '<svg class="xsact-body-mini-svg" viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + rects + "</svg>";
        container.innerHTML = '<div class="xsact-body-mini-hint">' + QiActT("editor.pick_part_hint") + "</div>" + svg;
        var hint = container.querySelector(".xsact-body-mini-hint");
        container.querySelectorAll(".xsact-body-part-zone").forEach(function(zone) {
          zone.addEventListener("mouseenter", function() {
            if (hint) hint.textContent = zone.dataset.label || zone.dataset.group;
            zone.classList.add("hover");
          });
          zone.addEventListener("mouseleave", function() {
            if (hint) hint.textContent = QiActT("editor.pick_part_hint");
            zone.classList.remove("hover");
          });
          zone.addEventListener("click", function(e) {
            e.stopPropagation();
            var group = zone.dataset.group;
            container.querySelectorAll(".xsact-body-part-zone").forEach(function(z) {
              z.classList.toggle("selected", z.dataset.group === group);
            });
            if (onSelect) onSelect(group, zone.dataset.label || group);
          });
        });
      }
      function renderCustomEditor(act, charObj, listEl, titleEl) {
        var isNew = !getCustom(act.id);
        titleEl.textContent = isNew ? QiActT("editor.new_title") : QiActT("editor.edit_title");
        var scope = act.scope || "other";
        var group = act.group || "ItemMouth";
        var partLbl = QiActT("part." + group);
        var html = '<div class="xsact-ca-editor">';
        html += '<div class="xsact-combo-field"><label>' + QiActT("editor.name_label") + '</label><input type="text" id="xsact-ca-name" value="' + escapeHtml(act.name) + '" placeholder="' + QiActT("editor.name_placeholder") + '"></div>';
        html += '<div class="xsact-combo-field"><label>' + QiActT("editor.scope_label") + '</label><div class="xsact-ca-scope" id="xsact-ca-scope"><button data-scope="other" class="' + (scope === "other" ? "active" : "") + '">' + QiActT("custom.scope_other") + '</button><button data-scope="self" class="' + (scope === "self" ? "active" : "") + '">' + QiActT("custom.scope_self") + '</button><button data-scope="any" class="' + (scope === "any" ? "active" : "") + '">' + QiActT("custom.scope_any") + "</button></div></div>";
        html += '<div class="xsact-combo-field"><label>' + QiActT("editor.part_label") + '</label><div class="xsact-ca-part-display" id="xsact-ca-part-display"><span class="xsact-ca-part-label">' + escapeHtml(partLbl) + "（" + group + '）</span><span class="xsact-ca-part-change">' + QiActT("editor.part_change") + '</span></div><div class="xsact-ca-part-map" id="xsact-ca-part-map"></div><input type="hidden" id="xsact-ca-group" value="' + group + '"></div>';
        html += '<div class="xsact-combo-field"><label>' + QiActT("editor.dialog_other_label") + '</label><textarea id="xsact-ca-dialog-raw" class="xsact-ca-raw" rows="2">' + escapeHtml(act.dialog) + '</textarea><div id="xsact-ca-dialog" class="xsact-ca-dialog-rich" contenteditable="true" tabindex="0" data-placeholder="' + QiActT("editor.dialog_other_ph") + '"></div></div>';
        html += '<div class="xsact-ca-hint"><div class="xsact-ca-hint-title">' + QiActT("editor.tokens_title") + '</div><div class="xsact-ca-hint-btns"><button class="xsact-ca-token" data-token="{SourceCharacter}"><span class="xsact-ca-token-dot self"></span>' + QiActT("editor.token_self") + '</button><button class="xsact-ca-token" data-token="{TargetCharacter}"><span class="xsact-ca-token-dot other"></span>' + QiActT("editor.token_other") + "</button></div></div>";
        html += '<div class="xsact-combo-field"><label>' + QiActT("editor.dialog_self_label") + '</label><textarea id="xsact-ca-dialogself-raw" class="xsact-ca-raw" rows="2">' + escapeHtml(act.dialogSelf || "") + '</textarea><div id="xsact-ca-dialogself" class="xsact-ca-dialog-rich" contenteditable="true" tabindex="0" data-placeholder="' + QiActT("editor.dialog_self_ph") + '"></div></div>';
        html += '<div class="xsact-ca-preview" id="xsact-ca-preview"><span class="xsact-ca-preview-label">' + QiActT("editor.preview_label") + '</span><span class="xsact-ca-preview-text"></span></div>';
        html += '<div class="xsact-combo-actions"><button class="xsact-combo-save-btn" id="xsact-ca-save">' + QiActT("editor.save") + "</button>" + (isNew ? "" : '<button class="xsact-ca-del-btn" id="xsact-ca-del">' + QiActT("editor.delete") + "</button>") + '<button class="xsact-combo-cancel-btn" id="xsact-ca-cancel">' + QiActT("editor.cancel") + "</button></div>";
        html += "</div>";
        listEl.innerHTML = html;
        var lastFocusedRich = listEl.querySelector("#xsact-ca-dialog");
        var lastFocusedRaw = listEl.querySelector("#xsact-ca-dialog-raw");
        function trackFocus(el, rawId) {
          if (!el) return;
          el.addEventListener("focus", function() {
            lastFocusedRich = el;
            lastFocusedRaw = listEl.querySelector("#" + rawId);
          });
          el.addEventListener("click", function() {
            lastFocusedRich = el;
            lastFocusedRaw = listEl.querySelector("#" + rawId);
          });
        }
        trackFocus(listEl.querySelector("#xsact-ca-name"), "xsact-ca-name");
        trackFocus(listEl.querySelector("#xsact-ca-dialog"), "xsact-ca-dialog-raw");
        trackFocus(listEl.querySelector("#xsact-ca-dialogself"), "xsact-ca-dialogself-raw");
        ["#xsact-ca-dialog-raw", "#xsact-ca-dialogself-raw"].forEach(function(sel) {
          var rawEl = listEl.querySelector(sel);
          if (!rawEl) return;
          rawEl.addEventListener("focus", function() {
            lastFocusedRaw = rawEl;
            lastFocusedRich = listEl.querySelector("#" + rawEl.id.replace(/-raw$/, ""));
          });
        });
        function renderRichText(raw) {
          return escapeHtml(raw).replace(/\{SourceCharacter\}/g, '<span class="xsact-token-pill" contenteditable="false" data-token="{SourceCharacter}">' + QiActT("editor.token_self_pill") + '<span class="xsact-zwsp">&#8203;</span>').replace(/\{TargetCharacter\}/g, '<span class="xsact-token-pill" contenteditable="false" data-token="{TargetCharacter}">' + QiActT("editor.token_other_pill") + '<span class="xsact-zwsp">&#8203;</span>');
        }
        function extractRawFromRich(el) {
          var raw = "";
          function walk(nodes) {
            Array.from(nodes).forEach(function(node) {
              if (node.nodeType === Node.TEXT_NODE) {
                raw += node.textContent;
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains("xsact-token-pill")) {
                  raw += node.dataset.token;
                } else if (node.classList && node.classList.contains("xsact-zwsp")) ;
                else {
                  walk(node.childNodes);
                }
              }
            });
          }
          walk(el.childNodes);
          return raw.replace(/\u200B/g, "");
        }
        function syncRichToRaw(richEl) {
          var rawEl = listEl.querySelector("#" + richEl.id + "-raw");
          if (!rawEl) return;
          rawEl.value = extractRawFromRich(richEl);
        }
        function syncRawToRich(rawEl) {
          var richEl = listEl.querySelector("#" + rawEl.id.replace(/-raw$/, ""));
          if (!richEl) return;
          richEl.innerHTML = renderRichText(rawEl.value);
        }
        function insertTokenPill(token, richEl) {
          var label = token === "{SourceCharacter}" ? QiActT("editor.token_self_pill") : QiActT("editor.token_other_pill");
          if (!richEl || richEl.contentEditable !== "true") return;
          richEl.focus();
          var sel = window.getSelection();
          var range;
          if (!sel.rangeCount || !richEl.contains(sel.getRangeAt(0).commonAncestorContainer)) {
            range = document.createRange();
            range.selectNodeContents(richEl);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            range = sel.getRangeAt(0);
          }
          range.deleteContents();
          var pill = document.createElement("span");
          pill.className = "xsact-token-pill";
          pill.contentEditable = "false";
          pill.dataset.token = token;
          pill.textContent = label;
          var zwsp = document.createElement("span");
          zwsp.className = "xsact-zwsp";
          zwsp.textContent = "​";
          var space = document.createTextNode(" ");
          var frag = document.createDocumentFragment();
          frag.appendChild(pill);
          frag.appendChild(zwsp);
          frag.appendChild(space);
          range.insertNode(frag);
          range.setStartAfter(space);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          richEl.focus();
          syncRichToRaw(richEl);
          refreshPreview();
        }
        function insertToken(token) {
          var richEl = lastFocusedRich;
          if (!richEl || richEl.contentEditable !== "true") richEl = listEl.querySelector("#xsact-ca-dialog");
          if (!richEl) {
            var rawEl = lastFocusedRaw || listEl.querySelector("#xsact-ca-dialog-raw");
            if (!rawEl) return;
            var start = rawEl.selectionStart || 0;
            var end = rawEl.selectionEnd || 0;
            var before = rawEl.value.substring(0, start);
            var after = rawEl.value.substring(end);
            rawEl.value = before + token + after;
            var pos = start + token.length;
            rawEl.setSelectionRange(pos, pos);
            rawEl.focus();
            rawEl.dispatchEvent(new Event("input", { bubbles: true }));
            return;
          }
          insertTokenPill(token, richEl);
        }
        syncRawToRich(listEl.querySelector("#xsact-ca-dialog-raw"));
        syncRawToRich(listEl.querySelector("#xsact-ca-dialogself-raw"));
        listEl.querySelectorAll(".xsact-ca-token").forEach(function(btn) {
          btn.addEventListener("mousedown", function(e) {
            e.preventDefault();
          });
          btn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            insertToken(btn.dataset.token);
          });
        });
        var partMap = listEl.querySelector("#xsact-ca-part-map");
        var partDisplay = listEl.querySelector("#xsact-ca-part-display");
        var groupInput = listEl.querySelector("#xsact-ca-group");
        function updatePartLabel(g) {
          var label = QiActT("part." + g);
          if (partDisplay) partDisplay.querySelector(".xsact-ca-part-label").textContent = label + "（" + g + "）";
          if (groupInput) groupInput.value = g;
        }
        if (partMap) {
          renderBodyMapMini(partMap, group, function(newGroup, newLabel) {
            updatePartLabel(newGroup);
            refreshPreview();
          });
        }
        function refreshPreview() {
          var nm = (listEl.querySelector("#xsact-ca-name") || {}).value || QiActT("editor.default_name");
          var dlg = (listEl.querySelector("#xsact-ca-dialog-raw") || {}).value || nm;
          var dlgSelf = (listEl.querySelector("#xsact-ca-dialogself-raw") || {}).value || "";
          var sc = (listEl.querySelector("#xsact-ca-scope") || {}).querySelector(".active");
          var scope2 = sc ? sc.dataset.scope : "other";
          var src = Player && (Player.Nickname || Player.Name) || "某人";
          var tgt = charObj && (charObj.Nickname || charObj.Name) || "对方";
          var preview;
          function resolveText(text, source, target) {
            return text.replace(/\{SourceCharacter\}/g, source).replace(/\{TargetCharacter\}/g, target);
          }
          if (scope2 === "self") {
            var textSelf = (dlgSelf.trim() ? dlgSelf : dlg).replace(/\{SourceCharacter\}/g, src).replace(/\{TargetCharacter\}/g, src);
            preview = textSelf;
          } else if (scope2 === "any") {
            var textOther = resolveText(dlg, src, tgt);
            var textSelf = (dlgSelf.trim() ? dlgSelf : dlg).replace(/\{SourceCharacter\}/g, src).replace(/\{TargetCharacter\}/g, tgt);
            preview = QiActT("editor.preview", { a: textOther, b: textSelf });
          } else {
            preview = resolveText(dlg, src, tgt);
          }
          var pv = listEl.querySelector("#xsact-ca-preview");
          if (pv) {
            var pvt = pv.querySelector(".xsact-ca-preview-text");
            if (pvt) pvt.textContent = preview;
          }
        }
        var scopeBox = listEl.querySelector("#xsact-ca-scope");
        if (scopeBox) scopeBox.querySelectorAll("button").forEach(function(b) {
          b.addEventListener("click", function() {
            scopeBox.querySelectorAll("button").forEach(function(x) {
              x.classList.remove("active");
            });
            b.classList.add("active");
            refreshPreview();
          });
        });
        ["#xsact-ca-name", "#xsact-ca-dialog-raw", "#xsact-ca-dialogself-raw"].forEach(function(sel) {
          var el = listEl.querySelector(sel);
          if (el) el.addEventListener("input", refreshPreview);
        });
        ["#xsact-ca-dialog", "#xsact-ca-dialogself"].forEach(function(sel) {
          var el = listEl.querySelector(sel);
          if (el) el.addEventListener("input", function() {
            syncRichToRaw(el);
            refreshPreview();
          });
        });
        refreshPreview();
        var saveBtn = listEl.querySelector("#xsact-ca-save");
        if (saveBtn) saveBtn.addEventListener("click", function() {
          var nm = (listEl.querySelector("#xsact-ca-name") || {}).value || "";
          var dlg = (listEl.querySelector("#xsact-ca-dialog-raw") || {}).value || "";
          var dlgSelf = (listEl.querySelector("#xsact-ca-dialogself-raw") || {}).value || "";
          var sc = (listEl.querySelector("#xsact-ca-scope") || {}).querySelector(".active");
          var gp = (listEl.querySelector("#xsact-ca-group") || {}).value || "ItemMouth";
          if (!nm.trim()) {
            toast(QiActT("toast.fill_name"), "#FF5C5C");
            return;
          }
          if (!dlg.trim()) {
            toast(QiActT("toast.fill_dialog"), "#FF5C5C");
            return;
          }
          var existing = getCustom(act.id);
          if (existing) caUnregister(existing);
          var updated = { id: act.id, name: nm.trim(), scope: sc ? sc.dataset.scope : "other", group: gp, dialog: dlg, dialogSelf: dlgSelf, createdAt: act.createdAt || Date.now(), source: act.source || "native", visible: typeof act.visible === "boolean" ? act.visible : true, echoName: act.echoName || null, echoNames: Array.isArray(act.echoNames) ? act.echoNames.slice() : [] };
          upsertCustom(updated);
          state.editingCustomId = null;
          updateCustomActionPanel(charObj);
          toast(QiActT("toast.custom_saved"), "#46E0A0");
        });
        var cancelBtn = listEl.querySelector("#xsact-ca-cancel");
        if (cancelBtn) cancelBtn.addEventListener("click", function() {
          if (isNew) deleteCustom(act.id);
          state.editingCustomId = null;
          updateCustomActionPanel(charObj);
        });
        var delBtn = listEl.querySelector("#xsact-ca-del");
        if (delBtn) delBtn.addEventListener("click", function() {
          qiactConfirm({ title: QiActT("custom.delete_confirm_title"), body: QiActT("custom.delete_confirm_body", { name: act.name }), confirmText: QiActT("custom.delete_confirm_btn"), danger: true }).then(function(ok) {
            if (!ok) return;
            deleteCustom(act.id);
            state.editingCustomId = null;
            updateCustomActionPanel(charObj);
            toast(QiActT("toast.deleted"), "#888");
          });
        });
      }
      function runCustomAction(id, charObj) {
        var act = getCustom(id);
        if (!act) return;
        if (!charObj) {
          toast(QiActT("toast.pick_char"), "#FF5C5C");
          return;
        }
        var name = caActivityName(act);
        var ok = executeAction(charObj, name, null, act.group);
        if (ok) toast(QiActT("toast.exec_custom", { name: act.name }), "#FF5C7A");
      }
      function importCustomFromEcho() {
        try {
          var ext = Player && Player.ExtensionSettings;
          if (!ext) {
            toast(QiActT("toast.read_ext_failed"), "#FF5C5C");
            return;
          }
          var echoKey = Object.keys(ext).find(function(k) {
            return k.indexOf("ECHO") === 0;
          });
          if (!echoKey || !ext[echoKey] || !ext[echoKey]["动作数据"]) {
            toast(QiActT("toast.import_echo_notfound"), "#FF5C5C");
            return;
          }
          var data = ext[echoKey]["动作数据"];
          var keys = Object.keys(data);
          var imported = 0;
          keys.forEach(function(k) {
            var item = data[k];
            if (!item || !item.Name) return;
            var hasTarget = !!item.Target;
            var hasTargetSelf = !!item.TargetSelf;
            var scope = hasTarget && hasTargetSelf ? "any" : hasTargetSelf ? "self" : "other";
            var group = item.Target || item.TargetSelf || "ItemMouth";
            var dialog = item.Dialog || item.Name || "";
            var dialogSelf = item.DialogSelf || "";
            function normalizeEchoPlaceholder(s) {
              return typeof s === "string" ? s.replace(/SourceCharacter/g, "{SourceCharacter}").replace(/TargetCharacter/g, "{TargetCharacter}") : s;
            }
            var resolved = caResolveEchoNames(k, item.Name);
            var displayName = resolved.displayName;
            var rawName = resolved.rawName;
            var foundRawNames = caFindEchoNamesInRegistry(item, k, group);
            if (caLooksLikeRawActivityName(rawName)) foundRawNames.add(rawName);
            if (caLooksLikeRawActivityName(k) && k !== rawName) foundRawNames.add(k);
            var primaryEchoName = foundRawNames.values().next().value || rawName;
            var existing = state.customActions.find(function(a) {
              return a.name === displayName && a.group === group;
            });
            if (existing) {
              caUnregister(existing);
              existing.scope = scope;
              existing.dialog = normalizeEchoPlaceholder(dialog);
              existing.dialogSelf = normalizeEchoPlaceholder(dialogSelf);
              existing.source = "echo";
              existing.echoName = primaryEchoName;
              existing.echoNames = Array.from(foundRawNames);
              if (typeof existing.visible !== "boolean") existing.visible = true;
              upsertCustom(existing);
            } else {
              var ca = {
                id: caNewId(),
                name: displayName,
                scope,
                group,
                dialog: normalizeEchoPlaceholder(dialog),
                dialogSelf: normalizeEchoPlaceholder(dialogSelf),
                createdAt: Date.now(),
                source: "echo",
                visible: true,
                echoName: primaryEchoName,
                // 记录真实 echo 注册名，用于后续启动时重新屏蔽
                echoNames: Array.from(foundRawNames)
                // 记录所有可能的原始名，防止漏网
              };
              upsertCustom(ca);
            }
            foundRawNames.forEach(caSuppressEchoName);
            var rawPrefix = caExtractChinesePrefix(rawName);
            if (rawPrefix) caSuppressEchoName(rawPrefix);
            var displayPrefix = caExtractChinesePrefix(displayName);
            if (displayPrefix) caSuppressEchoName(displayPrefix);
            caSuppressEchoName(displayName);
            caSuppressEchoName(rawName);
            imported++;
          });
          caRemoveSuppressedEchoActivities();
          updateCustomActionPanel(state.selectedTarget);
          toast(QiActT("toast.imported_echo", { n: imported }), "#46E0A0");
        } catch (e) {
          console.warn("[QiAct] 导入 echo/回声 动作失败:", e.message);
          toast(QiActT("toast.import_failed", { msg: e.message }), "#FF5C5C");
        }
      }
      function syncXiaosuPack() {
        if (!Array.isArray(XIAOSU_PACKED)) return;
        state.customActions = state.customActions.filter(function(a) {
          return !(a && a.source === "xiaosu");
        });
        if (state.xiaosuPack) {
          XIAOSU_PACKED.forEach(function(p) {
            if (!state.customActions.some(function(a) {
              return a.id === p.id;
            })) {
              state.customActions.push(p);
            }
          });
        }
      }
      function setXiaosuPack(enabled) {
        state.xiaosuPack = !!enabled;
        if (!state.xiaosuPack && state.caFilter === "xiaosu") {
          state.caFilter = "all";
          persist(S_CA_FILTER, "all");
        }
        persist(S_XIAOSU_PACK, state.xiaosuPack);
        syncXiaosuPack();
        registerAllCustomActions();
        saveCustomActions();
        if (state.panelMode === "custom") updateCustomActionPanel(state.selectedTarget);
      }
      function exportCustomActions() {
        try {
          var data = JSON.stringify(state.customActions, null, 2);
          var blob = new Blob([data], { type: "application/json" });
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "qiact_custom_actions.json";
          a.click();
          URL.revokeObjectURL(url);
          toast(QiActT("toast.exported", { n: state.customActions.length }), "#46E0A0");
        } catch (e) {
          console.warn("[QiAct] 导出自定义动作失败:", e.message);
          toast(QiActT("toast.export_failed", { msg: e.message }), "#FF5C5C");
        }
      }
      function importCustomFromFile(file) {
        try {
          var reader = new FileReader();
          reader.onload = function(ev) {
            try {
              var json = ev.target.result;
              var arr = JSON.parse(json);
              if (!Array.isArray(arr)) {
                toast(QiActT("toast.file_format_err"), "#FF5C5C");
                return;
              }
              var imported = 0, updated = 0;
              arr.forEach(function(item) {
                if (!item || !item.name || !item.group) return;
                var source = item.source || "native";
                var dialog = typeof item.dialog === "string" ? item.dialog : item.Dialog || "";
                var dialogSelf = typeof item.dialogSelf === "string" ? item.dialogSelf : item.DialogSelf || "";
                var scope = item.scope || "other";
                var visible = typeof item.visible === "boolean" ? item.visible : true;
                var existing = state.customActions.find(function(a) {
                  return a.name === item.name && a.group === item.group;
                });
                if (existing) {
                  caUnregister(existing);
                  existing.scope = scope;
                  existing.dialog = dialog;
                  existing.dialogSelf = dialogSelf;
                  existing.visible = visible;
                  if (item.source) existing.source = item.source;
                  if (item.echoName) existing.echoName = item.echoName;
                  if (Array.isArray(item.echoNames)) existing.echoNames = item.echoNames.slice();
                  upsertCustom(existing);
                  updated++;
                } else {
                  var ca = {
                    id: caNewId(),
                    name: item.name,
                    scope,
                    group: item.group,
                    dialog,
                    dialogSelf,
                    createdAt: item.createdAt || Date.now(),
                    source,
                    visible,
                    echoName: item.echoName || null,
                    echoNames: Array.isArray(item.echoNames) ? item.echoNames.slice() : []
                  };
                  upsertCustom(ca);
                  imported++;
                }
              });
              registerAllCustomActions();
              updateCustomActionPanel(state.selectedTarget);
              toast(QiActT("toast.import_done", { n: imported, m: updated }), "#46E0A0");
            } catch (inner) {
              console.warn("[QiAct] 解析 JSON 失败:", inner.message);
              toast(QiActT("toast.json_parse_failed", { msg: inner.message }), "#FF5C5C");
            }
          };
          reader.onerror = function() {
            toast(QiActT("toast.read_file_failed"), "#FF5C5C");
          };
          reader.readAsText(file);
        } catch (e) {
          console.warn("[QiAct] 导入本地文件失败:", e.message);
          toast(QiActT("toast.import_failed", { msg: e.message }), "#FF5C5C");
        }
      }
      function registerAllCustomActions() {
        try {
          var fam = Player && Player.AssetFamily || "Female3DCG";
          var acts = caRawAllActivities(fam);
          var validNames = /* @__PURE__ */ new Set();
          state.customActions.forEach(function(a2) {
            validNames.add(caActivityName(a2));
          });
          var OLD_PREFIXES = ["XSAct_CA_", "XSQAct_", CA_PREFIX];
          var isStale = function(name) {
            return OLD_PREFIXES.some(function(p) {
              return name.indexOf(p) === 0;
            });
          };
          if (Array.isArray(acts)) {
            for (var i = acts.length - 1; i >= 0; i--) {
              var a = acts[i];
              if (a && a.Name && isStale(a.Name) && !validNames.has(a.Name)) {
                acts.splice(i, 1);
              }
            }
          }
          if (Array.isArray(ActivityFemale3DCGOrdering)) {
            for (var j = ActivityFemale3DCGOrdering.length - 1; j >= 0; j--) {
              var nm = ActivityFemale3DCGOrdering[j];
              if (nm && isStale(nm) && !validNames.has(nm)) {
                ActivityFemale3DCGOrdering.splice(j, 1);
              }
            }
          }
        } catch (e) {
          console.warn("[QiAct] 清理自定义动作残留失败:", e.message);
        }
        state.customActions.forEach(function(act) {
          caRegister(act);
        });
        try {
          caRemoveSuppressedEchoActivities();
        } catch (e) {
        }
      }
      function toggleAllMode() {
        state.allModeActive = !state.allModeActive;
        updateAllButtonVisual();
        toast(
          state.allModeActive ? QiActT("common.all_on") : QiActT("common.all_off"),
          state.allModeActive ? "#E8B339" : "#888"
        );
      }
      function updateAllButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector("#xsact-all-btn");
        if (btn) btn.classList.toggle("on", state.allModeActive);
      }
      function toggleFavMode() {
        state.favModeActive = !state.favModeActive;
        updateFavButtonVisual();
        if (state.actionPanelEl) {
          var body = state.actionPanelEl.querySelector("#xsact-action-list");
          if (body) body.classList.toggle("fav-active", state.favModeActive);
        }
        toast(
          state.favModeActive ? QiActT("common.fav_on") : QiActT("common.fav_off"),
          state.favModeActive ? "#E8B339" : "#888"
        );
      }
      function updateFavButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector("#xsact-fav-btn");
        if (!btn) return;
        btn.classList.toggle("on", state.favModeActive);
        var ico = btn.querySelector(".xsact-ico");
        if (ico) ico.outerHTML = svgIcon(state.favModeActive ? "starFill" : "star", 14);
      }
      function toggleInteractionGrid() {
        state.interactionGridActive = !state.interactionGridActive;
        persist(S_INTERACTION_GRID, state.interactionGridActive);
        updateInteractionGridVisual();
        if (state.interactionGridActive) refreshBodyGrids();
        else clearBodyGrids();
      }
      function updateInteractionGridVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector("#xsact-grid-btn");
        if (btn) btn.classList.toggle("on", state.interactionGridActive);
      }
      function toggleFavoriteAction(partGroup, name, btn) {
        partGroup = canonicalPartGroup(partGroup);
        var key = partGroup + "|" + name;
        var idx = state.favorites.indexOf(key);
        if (idx === -1) {
          state.favorites.push(key);
          toast(QiActT("common.fav_add", { name: getActivityLabel(name, partGroup) }), "#E8B339");
        } else {
          state.favorites.splice(idx, 1);
          toast(QiActT("common.fav_remove"), "#888");
        }
        persist(S_FAVS, state.favorites);
        if (btn) {
          var added = idx === -1;
          btn.classList.toggle("fav", added);
          var star = btn.querySelector(".xsact-action-star");
          if (added) {
            if (!star) {
              star = document.createElement("span");
              star.className = "xsact-action-star";
              star.innerHTML = svgIcon("starFill", 13);
              btn.appendChild(star);
            }
          } else if (star) {
            star.remove();
          }
        } else if (state.selectedTarget && state.selectedPart && state.panelMode === "part") {
          updateActionPanel(state.selectedTarget, state.selectedPart);
        }
      }
      function toggleSelfMode() {
        state.selfModeActive = !state.selfModeActive;
        persist(S_SELF, state.selfModeActive);
        updateSelfButtonVisual();
        if (state.isActive) refreshBodyGrids();
        toast(
          state.selfModeActive ? QiActT("common.self_on") : QiActT("common.self_off"),
          state.selfModeActive ? "#46E0A0" : "#888"
        );
      }
      function updateSelfButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector("#xsact-self-btn");
        if (btn) btn.classList.toggle("on", state.selfModeActive);
      }
      function clearAllFavorites() {
        if (!Array.isArray(state.favorites) || state.favorites.length === 0) {
          toast(QiActT("common.no_fav"), "#888");
          return;
        }
        qiactConfirm({
          title: QiActT("common.clear_fav_title"),
          body: QiActT("common.clear_fav_body"),
          confirmText: QiActT("common.clear_fav_confirm"),
          danger: true
        }).then(function(ok) {
          if (!ok) return;
          state.favorites = [];
          persist(S_FAVS, state.favorites);
          renderPanel();
          toast(QiActT("common.cleared_fav"), "#888");
        });
      }
      function toast(msg, color) {
        color = color || "#FF5C7A";
        try {
          if (window.Liko && window.Liko.__Sys_Toast__) {
            window.Liko.__Sys_Toast__(msg, 2e3, color);
            return;
          }
        } catch (_) {
        }
        var el = document.getElementById("xsact-qa-toast");
        if (!el) {
          el = document.createElement("div");
          el.id = "xsact-qa-toast";
          el.style.cssText = "position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:8px 16px;border-radius:8px;font-size:13px;color:#fff;font-family:-apple-system,sans-serif;pointer-events:none;transition:opacity 0.3s;";
          document.body.appendChild(el);
        }
        el.textContent = msg;
        el.style.background = color;
        el.style.opacity = "1";
        clearTimeout(el._timer);
        el._timer = setTimeout(() => {
          el.style.opacity = "0";
        }, 2e3);
      }
      function qiactConfirm(opts) {
        opts = opts || {};
        return new Promise(function(resolve) {
          var existing = document.getElementById("xsact-confirm");
          if (existing) existing.remove();
          var title = String(opts.title || QiActT("common.confirm_title"));
          var body = opts.body ? String(opts.body) : "";
          var confirmText = String(opts.confirmText || QiActT("common.confirm_ok"));
          var cancelText = String(opts.cancelText || QiActT("common.confirm_cancel"));
          var danger = opts.danger !== false;
          var box = document.createElement("div");
          box.id = "xsact-confirm";
          box.className = "xsact-confirm";
          box.innerHTML = '<div class="xsact-confirm-box" role="dialog" aria-modal="true"><div class="xsact-confirm-title"></div>' + (body ? '<div class="xsact-confirm-body"></div>' : "") + '<div class="xsact-confirm-footer"><button class="xsact-confirm-btn xsact-confirm-cancel" type="button"></button><button class="xsact-confirm-btn xsact-confirm-ok' + (danger ? " is-danger" : "") + '" type="button"></button></div></div>';
          box.querySelector(".xsact-confirm-title").textContent = title;
          if (body) box.querySelector(".xsact-confirm-body").textContent = body;
          box.querySelector(".xsact-confirm-cancel").textContent = cancelText;
          box.querySelector(".xsact-confirm-ok").textContent = confirmText;
          function done(result) {
            document.removeEventListener("keydown", onKey);
            if (box.parentNode) box.parentNode.removeChild(box);
            resolve(result);
          }
          function onKey(e) {
            if (e.key === "Escape") {
              e.preventDefault();
              done(false);
            } else if (e.key === "Enter") {
              e.preventDefault();
              done(true);
            }
          }
          box.addEventListener("keydown", onKey, true);
          document.addEventListener("keydown", onKey, false);
          box.addEventListener("click", function(e) {
            if (e.target === box) done(false);
          });
          box.querySelector(".xsact-confirm-cancel").addEventListener("click", function() {
            done(false);
          });
          box.querySelector(".xsact-confirm-ok").addEventListener("click", function() {
            done(true);
          });
          document.body.appendChild(box);
          setTimeout(function() {
            var ok = box.querySelector(".xsact-confirm-ok");
            if (ok) ok.focus();
          }, 30);
        });
      }
      function createToggleButton() {
        if (state.toggleBtnEl) return;
        state.toggleBtnEl = document.createElement("button");
        state.toggleBtnEl.id = "xsact-toggle-btn";
        state.toggleBtnEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>';
        state.toggleBtnEl.title = state.isActive ? QiActT("ui.toggle_off") : QiActT("ui.toggle_on");
        state.toggleBtnEl.addEventListener("click", function(e) {
          if (state.toggleDragged) {
            e.stopPropagation();
            e.preventDefault();
            state.toggleDragged = false;
            return;
          }
          e.stopPropagation();
          toggleActionMode();
          updateToggleBtnStyle();
        });
        document.body.appendChild(state.toggleBtnEl);
        applyTogglePosition();
        makeToggleDraggable();
        updateToggleBtnStyle();
      }
      function createChatRoomToggleButton() {
        var btn = document.createElement("button");
        btn.id = "xsact-toggle-btn";
        btn.type = "button";
        btn.className = "blank-button button HideOnPopup chat-room-button xsact-chat-toggle";
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>';
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleActionMode();
          updateToggleBtnStyle();
        });
        state.toggleBtnEl = btn;
        updateToggleBtnStyle();
        return btn;
      }
      function registerChatRoomToggle() {
        var L = window.Liko = window.Liko || {};
        var spec = ["quick-interaction", 50, createChatRoomToggleButton, { plain: true }];
        if (L.__Sys_ChatRoomButtons__ && L.__Sys_ChatRoomButtons__.add) L.__Sys_ChatRoomButtons__.add.apply(L.__Sys_ChatRoomButtons__, spec);
        else {
          L.__CRB_pending__ = L.__CRB_pending__ || [];
          if (!L.__CRB_pending__.some(function(x) {
            return x && x[0] === spec[0];
          })) L.__CRB_pending__.push(spec);
          if (!L.__QiActCRBLoading) {
            L.__QiActCRBLoading = fetch("https://cdn.jsdelivr.net/gh/awdrrawd/liko-Plugin-Repository@main/Plugins/expand/BC_ChatRoomButtons.js", { cache: "no-store" }).then(function(r) {
              if (!r.ok) throw new Error("HTTP " + r.status);
              return r.text();
            }).then(function(code) {
              var s = document.createElement("script");
              s.textContent = code;
              document.head.appendChild(s);
            }).catch(function(e) {
              console.warn("[QiAct] BC_ChatRoomButtons:", e && e.message);
            });
          }
        }
      }
      function setChatButtonDocked(on) {
        state.chatButtonDocked = !!on;
        persist(S_CHAT_BUTTON, state.chatButtonDocked);
        if (state.toggleBtnEl && state.toggleBtnEl.parentNode) state.toggleBtnEl.parentNode.removeChild(state.toggleBtnEl);
        state.toggleBtnEl = null;
        var crb = window.Liko && window.Liko.__Sys_ChatRoomButtons__;
        if (state.chatButtonDocked) registerChatRoomToggle();
        else {
          if (crb && crb.remove) crb.remove("quick-interaction");
          var q = window.Liko && window.Liko.__CRB_pending__;
          if (Array.isArray(q)) window.Liko.__CRB_pending__ = q.filter(function(x) {
            return !x || x[0] !== "quick-interaction";
          });
          drawToggleButton();
        }
      }
      function applyTogglePosition() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var pos = loadSetting(S_TOGGLE_POS, null);
        if (pos && typeof pos.left === "number" && typeof pos.top === "number") {
          btn.style.left = pos.left + "px";
          btn.style.top = pos.top + "px";
          btn.style.right = "auto";
          btn.style.bottom = "auto";
        }
      }
      function persistTogglePosition() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var rect = btn.getBoundingClientRect();
        persist(S_TOGGLE_POS, { left: Math.round(rect.left), top: Math.round(rect.top) });
      }
      function makeToggleDraggable() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var startX, startY, startLeft, startTop;
        var DRAG_THRESHOLD = 5;
        function onDown(e) {
          var ev = e.touches ? e.touches[0] : e;
          startX = ev.clientX;
          startY = ev.clientY;
          state.toggleDragged = false;
          var rect = btn.getBoundingClientRect();
          startLeft = rect.left;
          startTop = rect.top;
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          document.addEventListener("touchmove", onMove, { passive: false });
          document.addEventListener("touchend", onUp);
        }
        function onMove(e) {
          var ev = e.touches ? e.touches[0] : e;
          var dx = ev.clientX - startX;
          var dy = ev.clientY - startY;
          if (!state.toggleDragged && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
            state.toggleDragged = true;
          }
          if (state.toggleDragged) {
            e.preventDefault();
            btn.style.left = Math.max(0, Math.min(window.innerWidth - btn.offsetWidth, startLeft + dx)) + "px";
            btn.style.top = Math.max(0, Math.min(window.innerHeight - btn.offsetHeight, startTop + dy)) + "px";
            btn.style.right = "auto";
            btn.style.bottom = "auto";
          }
        }
        function onUp(e) {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          document.removeEventListener("touchmove", onMove);
          document.removeEventListener("touchend", onUp);
          if (state.toggleDragged) {
            e.preventDefault();
            e.stopPropagation();
            persistTogglePosition();
          }
        }
        btn.addEventListener("mousedown", onDown);
        btn.addEventListener("touchstart", onDown, { passive: false });
      }
      function updateToggleBtnStyle() {
        if (!state.toggleBtnEl) return;
        if (state.isActive) {
          state.toggleBtnEl.classList.add("active");
          state.toggleBtnEl.title = QiActT("ui.toggle_on_active");
        } else {
          state.toggleBtnEl.classList.remove("active");
          state.toggleBtnEl.title = QiActT("ui.toggle_on");
        }
      }
      function drawToggleButton() {
        if (state.chatButtonDocked) {
          if (!state.toggleBtnEl || !document.documentElement.contains(state.toggleBtnEl)) registerChatRoomToggle();
          if (state.toggleBtnEl) updateToggleBtnStyle();
          return;
        }
        if (!state.toggleBtnEl || !document.body.contains(state.toggleBtnEl)) {
          state.toggleBtnEl = null;
          createToggleButton();
        }
        if (state.toggleBtnEl) {
          state.toggleBtnEl.style.display = "";
          updateToggleBtnStyle();
        }
      }
      function guardToggleVisibility() {
        if (state.disposed || runtime && runtime.disposed) return;
        if (typeof CurrentScreen === "undefined") return;
        if (CurrentScreen === "ChatRoom") {
          drawToggleButton();
        } else if (state.toggleBtnEl) {
          state.toggleBtnEl.style.display = "none";
        }
      }
      function startVisibilityGuard() {
        if (window.__QiAct_VisGuard) {
          try {
            clearInterval(window.__QiAct_VisGuard);
          } catch (_) {
          }
        }
        window.__QiAct_VisGuard = runtime && runtime.interval ? runtime.interval(guardToggleVisibility, 500) : setInterval(guardToggleVisibility, 500);
      }
      function toggleActionMode() {
        state.isActive = !state.isActive;
        persist(S_ENABLED, state.isActive);
        if (state.isActive) enterActionMode();
        else exitActionMode();
        drawToggleButton();
      }
      function enterActionMode() {
        state.isActive = true;
        persist(S_ENABLED, true);
        document.querySelectorAll("#xsact-qa-overlay").forEach(function(el) {
          el.remove();
        });
        document.querySelectorAll("#xsact-qa-panel").forEach(function(el) {
          el.remove();
        });
        state.actionPanelEl = null;
        if (!state.actionPanelEl) {
          state.actionPanelEl = document.createElement("div");
          state.actionPanelEl.id = "xsact-qa-panel";
          state.actionPanelEl.innerHTML = buildPanelHTML();
          document.body.appendChild(state.actionPanelEl);
          bindPanelEvents(state.actionPanelEl);
          makeDraggable(state.actionPanelEl);
          makeResizable(state.actionPanelEl);
        }
        var savedMode = loadSetting(S_MODE, "part");
        if (!/^(part|favorite|combo|custom)$/.test(savedMode)) savedMode = "part";
        state.panelMode = savedMode;
        state.actionPanelEl.querySelectorAll(".xsact-mode-tab").forEach(function(tab) {
          tab.classList.toggle("active", tab.dataset.mode === state.panelMode);
        });
        state.actionPanelEl.style.display = "";
        applyPanelSize();
        applyPanelPosition();
        renderPanel();
        renderPendingBanner();
        checkUpdate().catch(function(e) {
          console.warn("[QiAct] 更新检查失败（已忽略）:", e && e.message);
        });
        state.selfModeActive = loadSetting(S_SELF, false);
        updateSelfButtonVisual();
        refreshBodyGrids();
        renderCharList();
        updateAllButtonVisual();
        updateFavButtonVisual();
        toast(QiActT("common.enter_mode"), "#FF5C7A");
      }
      function exitActionMode() {
        if (state.actionPanelEl) {
          state.actionPanelEl.style.display = "none";
        }
        clearBodyGrids();
        state.selectedTarget = null;
        state.selectedPart = null;
        state.selectedAction = null;
        state.selectedActionItem = null;
        state.editingComboId = null;
        state.allModeActive = false;
        toast(QiActT("common.exit_mode"), "#888");
      }
      function rebuildPanel() {
        if (!state.actionPanelEl) {
          if (typeof enterActionMode === "function") enterActionMode();
          return;
        }
        if (state.actionPanelEl.parentNode) state.actionPanelEl.parentNode.removeChild(state.actionPanelEl);
        state.actionPanelEl = document.createElement("div");
        state.actionPanelEl.id = "xsact-qa-panel";
        state.actionPanelEl.innerHTML = buildPanelHTML();
        document.body.appendChild(state.actionPanelEl);
        bindPanelEvents(state.actionPanelEl);
        makeDraggable(state.actionPanelEl);
        makeResizable(state.actionPanelEl);
        var savedMode = state.panelMode || "part";
        state.actionPanelEl.querySelectorAll(".xsact-mode-tab").forEach(function(tab) {
          tab.classList.toggle("active", tab.dataset.mode === savedMode);
        });
        state.actionPanelEl.style.display = "";
        applyPanelSize();
        applyPanelPosition();
        renderPanel();
        try {
          if (typeof renderCharList === "function") renderCharList();
        } catch (_) {
        }
      }
      function buildPanelHTML() {
        return '<div class="xsact-qa-panel-inner">  <div class="xsact-qa-panel-header" id="xsact-panel-header">    <span class="xsact-panel-grip" id="xsact-drag-grip" title="' + QiActT("ui.drag_panel") + '">' + svgIcon("grip", 16) + '</span>    <span id="xsact-panel-title">' + QiActT("render.select_action") + '</span>    <span class="xsact-panel-head-actions">      <button class="xsact-qa-mini-btn" id="xsact-refresh-btn" title="' + QiActT("ui.refresh") + '">' + svgIcon("refresh", 15) + '</button>      <button class="xsact-qa-mini-btn xsact-header-icon-btn" id="xsact-settings-btn" title="' + QiActT("ui.settings") + '">' + svgIcon("settings", 15) + '</button>      <button class="xsact-qa-mini-btn" id="xsact-exit-panel-btn" title="' + QiActT("ui.exit_mode") + '">' + svgIcon("close", 15) + '</button>    </span>  </div>  <div class="xsact-update-banner" id="xsact-update-banner" style="display:none;"></div>  <div class="xsact-qa-panel-content">    <div class="xsact-qa-panel-main">      <div class="xsact-qa-mode-tabs">        <button class="xsact-mode-tab active" data-mode="part" title="' + QiActT("ui.mode_part_title") + '">' + svgIcon("target", 14) + "<span>" + QiActT("ui.mode_part") + '</span></button>        <button class="xsact-mode-tab" data-mode="favorite" title="' + QiActT("ui.mode_favorite_title") + '">' + svgIcon("star", 14) + "<span>" + QiActT("ui.mode_favorite") + '</span></button>        <button class="xsact-mode-tab" data-mode="combo" title="' + QiActT("ui.mode_combo_title") + '">' + svgIcon("layers", 14) + "<span>" + QiActT("ui.mode_combo") + '</span></button>        <button class="xsact-mode-tab" data-mode="custom" title="' + QiActT("ui.mode_custom_title") + '"><span class="xsact-custom-tab-main">' + svgIcon("custom", 14) + '<span class="xsact-custom-tab-label">' + QiActT("ui.mode_custom") + '</span></span><span class="xsact-beta-badge">' + QiActT("ui.beta_badge") + '</span></button>      </div>      <div class="xsact-qa-panel-footer">        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-self-btn" title="' + QiActT("ui.self_title") + '">' + svgIcon("user", 14) + "<span>" + QiActT("ui.self") + '</span><span class="xsact-pill-dot"></span></button>        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-all-btn" title="' + QiActT("ui.all_title") + '">' + svgIcon("users", 14) + "<span>" + QiActT("ui.all") + '</span><span class="xsact-pill-dot"></span></button>        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-fav-btn" title="' + QiActT("ui.fav_title") + '">' + svgIcon("star", 14) + "<span>" + QiActT("ui.fav") + '</span><span class="xsact-pill-dot"></span></button>        <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-grid-btn" title="' + QiActT("ui.interaction_grid_title") + '">' + svgIcon("target", 14) + "<span>" + QiActT("ui.interaction_grid") + '</span><span class="xsact-pill-dot"></span></button>        <button class="xsact-qa-mini-btn" id="xsact-x3-btn" title="' + QiActT("ui.x3_title") + '">' + svgIcon("bolt", 14) + "<span>" + QiActT("ui.x3") + '</span></button>      </div>      <div class="xsact-qa-panel-body" id="xsact-action-list">        <div class="xsact-qa-empty">' + QiActT("render.pick_char_part2") + '</div>      </div>    </div>  </div>  <div class="xsact-qa-state.presets-bar" id="xsact-state.presets-bar"></div>  <div class="xsact-resize-handle" id="xsact-resize-handle" title="' + QiActT("ui.resize") + '">' + svgIcon("resize", 14) + '</div></div><div class="xsact-char-popover" id="xsact-char-popover" style="display:none;">  <div class="xsact-char-popover-header">    <button class="xsact-char-popover-back" id="xsact-char-popover-back" title="' + QiActT("ui.popover_back") + '">&#8249;</button>    <span class="xsact-char-popover-title" id="xsact-char-popover-title">' + QiActT("ui.chars") + '</span>    <button class="xsact-char-popover-close" id="xsact-char-popover-close" title="' + QiActT("ui.popover_close") + '" data-tooltip-type="danger">×</button>  </div>  <div class="xsact-char-popover-body" id="xsact-char-popover-body"></div></div><div id="xsact-char-popover-tab" title="' + QiActT("ui.chars") + '">' + svgIcon("triangle-left", 12) + '</div><div id="xsact-popover-connector"></div>';
      }
      function getCharLayout() {
        var layout = [];
        try {
          if (typeof ChatRoomCharacter === "undefined" || !Array.isArray(ChatRoomCharacter)) return layout;
          var memberMNs = {};
          ChatRoomCharacter.forEach(function(c) {
            if (c && c.MemberNumber) memberMNs[c.MemberNumber] = true;
          });
          var now = Date.now();
          var anchorMap = {};
          ChatRoomCharacter.forEach(function(c) {
            if (!c || c.MemberNumber == null) return;
            var a = state.charAnchor[c.MemberNumber];
            if (a && now - a.t < 1e3) anchorMap[c.MemberNumber] = a;
          });
          var loopMap = {};
          if (typeof ChatRoomCharacterViewLoopCharacters === "function") {
            ChatRoomCharacterViewLoopCharacters(function(idx, cx, cy, space, zoom) {
              var cc = typeof ChatRoomCharacterDrawlist !== "undefined" && ChatRoomCharacterDrawlist ? ChatRoomCharacterDrawlist[idx] : null;
              if (cc && cc.MemberNumber != null) loopMap[cc.MemberNumber] = { x: cx, y: cy, zoom };
              return "";
            });
          }
          ChatRoomCharacter.forEach(function(c) {
            if (!c || c.MemberNumber == null || !memberMNs[c.MemberNumber]) return;
            var loop = loopMap[c.MemberNumber];
            var anchor = anchorMap[c.MemberNumber];
            if (!loop && !anchor) return;
            var useX = loop || anchor;
            var useY = loop || anchor;
            layout.push({ char: c, x: useX.x, y: useY.y, zoom: loop ? loop.zoom : anchor ? anchor.zoom : 1, src: loop ? "loop" : "anchor" });
          });
        } catch (e) {
          console.warn("[QiAct] getCharLayout 失败:", e);
        }
        return layout;
      }
      const BC_CANVAS_W = 2e3;
      const BC_CANVAS_H = 1e3;
      function refreshCanvasCache() {
        try {
          var canvas = document.getElementById("MainCanvas") || document.querySelector("canvas");
          if (!canvas) {
            state.cachedRect = null;
            return;
          }
          state.cachedRect = canvas.getBoundingClientRect();
          state.cachedScaleX = state.cachedRect.width / BC_CANVAS_W;
          state.cachedScaleY = state.cachedRect.height / BC_CANVAS_H;
        } catch (e) {
        }
      }
      function bcToScreen(bcX, bcY) {
        if (!state.cachedRect) return { x: window.innerWidth * 0.25, y: window.innerHeight * 0.25, sx: state.cachedScaleX, sy: state.cachedScaleY };
        return {
          x: state.cachedRect.left + bcX * state.cachedScaleX,
          y: state.cachedRect.top + bcY * state.cachedScaleY,
          sx: state.cachedScaleX,
          sy: state.cachedScaleY
        };
      }
      function bodyAssetToBc(ax, ay, C, dp) {
        var ratio = C && typeof C.HeightRatio === "number" ? C.HeightRatio : 1;
        var prop = C && typeof C.HeightRatioProportion === "number" ? C.HeightRatioProportion : 1;
        var hMod = C && typeof C.HeightModifier === "number" ? C.HeightModifier : 0;
        var xOff, yOff;
        if (typeof CharacterAppearanceXOffset === "function") {
          try {
            xOff = CharacterAppearanceXOffset(C, ratio);
          } catch (_) {
            xOff = 500 * (1 - ratio) / 2;
          }
        } else {
          xOff = 500 * (1 - ratio) / 2;
        }
        if (typeof CharacterAppearanceYOffset === "function") {
          try {
            yOff = CharacterAppearanceYOffset(C, ratio);
          } catch (_) {
            yOff = 1e3 * (1 - ratio) * prop - hMod * ratio;
          }
        } else {
          yOff = 1e3 * (1 - ratio) * prop - hMod * ratio;
        }
        var z = dp.zoom;
        return {
          x: dp.x + z * (xOff + ax * ratio),
          y: dp.y + z * (yOff + ay * ratio)
        };
      }
      function createBodyGrid(entry) {
        var charObj = entry.char;
        if (state.bodyGrids.has(charObj)) return state.bodyGrids.get(charObj);
        var grid = document.createElement("div");
        grid.className = "xsact-body-grid" + (charObj.IsPlayer && charObj.IsPlayer() ? " self" : "");
        grid.dataset.mn = charObj.MemberNumber;
        BODY_PARTS.forEach(function(part) {
          var zones = getPartZones(charObj, part.group);
          zones.forEach(function(z) {
            var btn = document.createElement("button");
            btn.className = "xsact-part-btn";
            btn.dataset.group = part.group;
            btn.dataset.targetMn = charObj.MemberNumber;
            btn.style.left = z[0] / 500 * 100 + "%";
            btn.style.top = z[1] / 1e3 * 100 + "%";
            btn.style.width = z[2] / 500 * 100 + "%";
            btn.style.height = z[3] / 1e3 * 100 + "%";
            btn.title = part.label + "（" + part.group + "）";
            btn.addEventListener("click", function(e) {
              e.stopPropagation();
              selectTargetAndPart(charObj, part.group);
              bringGridToFront(grid);
            });
            grid.appendChild(btn);
          });
        });
        grid.addEventListener("click", function(e) {
          if (e.target === grid) bringGridToFront(grid);
        });
        document.body.appendChild(grid);
        state.bodyGrids.set(charObj, grid);
        refreshCanvasCache();
        positionGrid(grid, entry);
        return grid;
      }
      function getGridScreenRect(entry) {
        var C = entry.char;
        var dp = { x: entry.x, y: entry.y, zoom: entry.zoom };
        var sc = bcToScreen(0, 0);
        var left = bodyAssetToBc(BODY_AX0, BODY_AY1, C, dp);
        var right = bodyAssetToBc(BODY_AX1, BODY_AY1, C, dp);
        var sL = bcToScreen(left.x, left.y);
        var sR = bcToScreen(right.x, right.y);
        var width = Math.abs(sR.x - sL.x);
        var centerX = (sL.x + sR.x) / 2;
        var top = bcToScreen(entry.x, entry.y).y;
        var height = entry.zoom * GRID_FIXED_HEIGHT * sc.sy;
        return { left: centerX - width / 2, top, right: centerX + width / 2, bottom: top + height, width, height, centerX };
      }
      function positionGrid(grid, entry) {
        var rect = getGridScreenRect(entry);
        var shift = entry.overlapShift || 0;
        grid.style.width = rect.width + "px";
        grid.style.height = rect.height + "px";
        grid.style.left = rect.left + shift + "px";
        grid.style.top = rect.top + "px";
      }
      function characterDisplayName(charObj) {
        if (!charObj) return "???";
        if (typeof CharacterNickname === "function") return CharacterNickname(charObj);
        return charObj.Nickname || charObj.Name || "???";
      }
      function bringGridToFront(grid) {
        if (!grid) return;
        grid.style.zIndex = "89999";
        state.bodyGrids.forEach(function(g) {
          g.style.zIndex = "89999";
        });
      }
      function refreshBodyGrids() {
        clearBodyGrids();
        if (!state.interactionGridActive) {
          renderCharList();
          return;
        }
        var layout = getCharLayout();
        var shifts = computeOverlapShifts(layout);
        layout.forEach(function(entry) {
          var isPlayer = entry.char.IsPlayer && entry.char.IsPlayer();
          if (isPlayer && !state.selfModeActive) return;
          entry.overlapShift = shifts.get(entry.char.MemberNumber) || 0;
          createBodyGrid(entry);
        });
        renderCharList();
      }
      function computeOverlapShifts(layout) {
        var shifts = /* @__PURE__ */ new Map();
        if (!layout || layout.length < 2) return shifts;
        var rects = layout.map(function(entry) {
          return { entry, rect: getGridScreenRect(entry), mn: entry.char.MemberNumber };
        });
        rects.sort(function(a, b) {
          return a.rect.left - b.rect.left;
        });
        var screenW = window.innerWidth || 1920;
        var overlapThreshold = 0.5;
        var spacing = 16;
        for (var i = 1; i < rects.length; i++) {
          var cur = rects[i];
          var curShift = 0;
          for (var j = 0; j < i; j++) {
            var prev = rects[j];
            var prevShift = shifts.get(prev.mn) || 0;
            if (rectsOverlap(prev.rect, cur.rect, overlapThreshold)) {
              var desired = prev.rect.left + prevShift + prev.rect.width + spacing;
              var need = desired - cur.rect.left;
              if (need > curShift) curShift = need;
            }
          }
          if (curShift > 0) {
            var maxShift = cur.rect.width + spacing;
            curShift = Math.min(curShift, maxShift);
            var maxRight = screenW - 10;
            var desiredRight = cur.rect.left + curShift + cur.rect.width;
            if (desiredRight > maxRight) {
              curShift = Math.max(0, maxRight - cur.rect.left - cur.rect.width);
            }
            if (curShift > 0) shifts.set(cur.mn, curShift);
          }
        }
        return shifts;
      }
      function rectsOverlap(a, b, threshold) {
        var xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        var yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        var aArea = a.width * a.height;
        var bArea = b.width * b.height;
        if (aArea <= 0 || bArea <= 0) return false;
        return xOverlap * yOverlap / Math.min(aArea, bArea) > threshold;
      }
      function clearBodyGrids() {
        state.bodyGrids.forEach(function(grid) {
          if (grid && grid.parentNode) grid.parentNode.removeChild(grid);
        });
        state.bodyGrids.clear();
      }
      function selectTargetAndPart(charObj, partGroup) {
        state.selectedTarget = charObj;
        state.selectedPart = partGroup;
        state.bodyGrids.forEach(function(grid, c) {
          var isSelected = c.MemberNumber === charObj.MemberNumber;
          grid.classList.toggle("selected", isSelected);
          grid.querySelectorAll(".xsact-part-btn").forEach(function(btn) {
            btn.classList.toggle("active", isSelected && btn.dataset.group === partGroup);
          });
        });
        renderCharList();
        renderPanel();
      }
      function getRoomCharacters() {
        var arr = [];
        if (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter)) {
          ChatRoomCharacter.forEach(function(c) {
            if (!c || !c.MemberNumber) return;
            var isSelf = c.IsPlayer && c.IsPlayer();
            if (isSelf && !state.selfModeActive) return;
            arr.push(c);
          });
        }
        return arr;
      }
      function selectCharacterFromList(charObj) {
        state.selectedTarget = charObj;
        state.selectedPart = null;
        state.selectedAction = null;
        state.selectedActionItem = null;
        state.popoverView = "parts";
        state.bodyGrids.forEach(function(grid, c) {
          grid.classList.toggle("selected", c.MemberNumber === charObj.MemberNumber);
          grid.querySelectorAll(".xsact-part-btn").forEach(function(btn) {
            btn.classList.remove("active");
          });
        });
        renderPopover();
        renderPanel();
      }
      function renderCharList() {
        var bodyEl = state.actionPanelEl && state.actionPanelEl.querySelector("#xsact-char-popover-body");
        if (!bodyEl) return;
        var chars = getRoomCharacters();
        var html = "";
        if (chars.length === 0) {
          html = '<div class="xsact-char-popover-empty">' + QiActT("target.empty") + "</div>";
        } else {
          html = '<div class="xsact-char-popover-items">';
          chars.forEach(function(c) {
            var isSelf = c.IsPlayer && c.IsPlayer();
            var selected = state.selectedTarget && state.selectedTarget.MemberNumber === c.MemberNumber;
            html += '<div class="xsact-char-popover-item' + (selected ? " selected" : "") + (isSelf ? " self" : "") + '" data-mn="' + c.MemberNumber + '"><span class="xsact-char-popover-name">' + escapeHtml(characterDisplayName(c)) + "</span>" + (isSelf ? '<span class="xsact-char-popover-self">' + QiActT("common.self") + "</span>" : "") + "</div>";
          });
          html += "</div>";
        }
        bodyEl.innerHTML = html;
        var items = bodyEl.querySelectorAll(".xsact-char-popover-item");
        items.forEach(function(item) {
          item.addEventListener("click", function(e) {
            e.stopPropagation();
            var mn = parseInt(item.dataset.mn, 10);
            var c = chars.find(function(x) {
              return x.MemberNumber === mn;
            });
            if (c) selectCharacterFromList(c);
          });
        });
      }
      function renderPopoverParts(charObj) {
        var bodyEl = state.actionPanelEl && state.actionPanelEl.querySelector("#xsact-char-popover-body");
        if (!bodyEl) return;
        var rects = "";
        BODY_PARTS.forEach(function(part) {
          var zones = getPartZones(charObj, part.group);
          zones.forEach(function(z) {
            var x = z[0], y = z[1], w = z[2], h = z[3];
            var rx = Math.min(16, Math.min(w, h) * 0.4);
            var sel = state.selectedPart === part.group ? " selected" : "";
            rects += '<rect class="xsact-body-part-zone' + sel + '" data-group="' + part.group + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + rx.toFixed(1) + '" data-label="' + part.label + '"/>';
          });
        });
        var svg = '<svg class="xsact-body-svg" viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + rects + '</svg><div class="xsact-body-part-hint">' + QiActT("target.pick_part") + "</div>";
        bodyEl.innerHTML = '<div class="xsact-body-select">' + svg + "</div>";
        var hint = bodyEl.querySelector(".xsact-body-part-hint");
        bodyEl.querySelectorAll(".xsact-body-part-zone").forEach(function(zone) {
          zone.addEventListener("mouseenter", function() {
            var label = zone.dataset.label || zone.dataset.group;
            if (hint) hint.textContent = label;
            zone.classList.add("hover");
          });
          zone.addEventListener("mouseleave", function() {
            if (hint) hint.textContent = QiActT("target.pick_part");
            zone.classList.remove("hover");
          });
          zone.addEventListener("click", function(e) {
            e.stopPropagation();
            state.selectedPart = zone.dataset.group;
            bodyEl.querySelectorAll(".xsact-body-part-zone").forEach(function(z) {
              z.classList.toggle("selected", z.dataset.group === state.selectedPart);
            });
            renderPanel();
          });
        });
      }
      function renderPopover() {
        var popover = state.actionPanelEl && state.actionPanelEl.querySelector("#xsact-char-popover");
        var titleEl = state.actionPanelEl && state.actionPanelEl.querySelector("#xsact-char-popover-title");
        if (!popover) return;
        var view = state.popoverView === "parts" && state.selectedTarget ? "parts" : "chars";
        popover.classList.toggle("show-back", view === "parts");
        if (view === "chars") {
          if (titleEl) titleEl.textContent = QiActT("ui.chars");
          renderCharList();
        } else {
          if (titleEl) titleEl.textContent = (characterDisplayName(state.selectedTarget) || "?") + " → " + QiActT("target.select_part");
          renderPopoverParts(state.selectedTarget);
        }
      }
      function openCharPopover() {
        if (!state.actionPanelEl) return;
        var panel = state.actionPanelEl;
        var popover = panel.querySelector("#xsact-char-popover");
        var tab = panel.querySelector("#xsact-char-popover-tab");
        if (!popover) return;
        state.popoverView = "chars";
        var rect = panel.getBoundingClientRect();
        if (rect.left < 256) {
          popover.classList.add("right");
        } else {
          popover.classList.remove("right");
        }
        popover.style.display = "flex";
        state.charListOpen = true;
        panel.classList.add("popover-open");
        if (tab) tab.classList.add("active");
        renderPopover();
      }
      function closeCharPopover() {
        if (!state.actionPanelEl) return;
        var panel = state.actionPanelEl;
        var popover = panel.querySelector("#xsact-char-popover");
        var tab = panel.querySelector("#xsact-char-popover-tab");
        if (popover) popover.style.display = "none";
        state.charListOpen = false;
        state.popoverView = "chars";
        panel.classList.remove("popover-open");
        if (tab) tab.classList.remove("active");
      }
      function toggleCharPopover() {
        if (state.charListOpen) closeCharPopover();
        else openCharPopover();
      }
      function renderPanel() {
        if (!state.actionPanelEl) return;
        var listEl = state.actionPanelEl.querySelector("#xsact-action-list");
        var titleEl = state.actionPanelEl.querySelector("#xsact-panel-title");
        var footerEl = state.actionPanelEl.querySelector(".xsact-qa-panel-footer");
        if (footerEl) footerEl.style.display = state.panelMode === "settings" ? "none" : "";
        if (state.panelMode !== "favorite") {
          var favFilter = state.actionPanelEl.querySelector("#xsact-favorite-part-filter");
          if (favFilter) favFilter.remove();
        }
        if (listEl) {
          listEl.classList.toggle("xsact-custom-mode", state.panelMode === "custom");
          listEl.classList.toggle("xsact-combo-mode", state.panelMode === "combo");
          listEl.classList.toggle("xsact-favorite-mode", state.panelMode === "favorite");
        }
        updateAllButtonVisual();
        updateFavButtonVisual();
        updateInteractionGridVisual();
        if (state.panelMode === "custom") {
          updateCustomActionPanel(state.selectedTarget);
          return;
        }
        if (state.panelMode === "combo") {
          updateComboPanel(state.selectedTarget);
          return;
        }
        if (state.panelMode === "favorite") {
          updateFavoritesPanel(state.selectedTarget);
          return;
        }
        if (state.panelMode === "settings") {
          updateSettingsPanel();
          return;
        }
        if (!state.selectedTarget) {
          if (titleEl) titleEl.textContent = QiActT("render.select_action");
          if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT("render.pick_char_part2") + "</div>";
          return;
        }
        if (!state.selectedPart) {
          if (titleEl) titleEl.textContent = (characterDisplayName(state.selectedTarget) || "?") + " → " + QiActT("target.select_part");
          if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT("render.pick_part_hint") + "</div>";
          return;
        }
        updateActionPanel(state.selectedTarget, state.selectedPart);
      }
      function setPanelMode(mode) {
        if (!/^(part|favorite|combo|custom|settings)$/.test(mode)) return;
        state.panelMode = mode;
        persist(S_MODE, mode);
        if (state.actionPanelEl) {
          state.actionPanelEl.querySelectorAll(".xsact-mode-tab").forEach(function(tab) {
            tab.classList.toggle("active", tab.dataset.mode === mode);
          });
        }
        renderPanel();
      }
      function refreshPanelState() {
        if (!state.actionPanelEl) {
          toast(QiActT("toast.mode_on_first"), "#888");
          return;
        }
        if (state.panelMode === "custom") {
          updateCustomActionPanel(state.selectedTarget);
          toast(QiActT("toast.refreshed_custom"), "#FF5C7A");
        } else if (state.panelMode === "favorite") {
          updateFavoritesPanel(state.selectedTarget);
          toast(QiActT("toast.refreshed_actions"), "#FF5C7A");
        } else if (state.panelMode === "combo") {
          state.combos = loadSetting(S_COMBOS, []);
          updateComboPanel(state.selectedTarget);
          toast(QiActT("toast.refreshed_combo"), "#FF5C7A");
        } else {
          if (!state.selectedTarget || !state.selectedPart) {
            toast(QiActT("toast.pick_part"), "#888");
            return;
          }
          updateActionPanel(state.selectedTarget, state.selectedPart);
          toast(QiActT("toast.refreshed_actions"), "#FF5C7A");
        }
      }
      function updateComboPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector("#xsact-panel-title");
        var listEl = state.actionPanelEl.querySelector("#xsact-action-list");
        var allBtn = state.actionPanelEl.querySelector("#xsact-all-btn");
        if (!titleEl || !listEl) return;
        if (state.editingComboId) {
          var combo = getCombo(state.editingComboId);
          if (!combo) {
            state.editingComboId = null;
            updateComboPanel(charObj);
            return;
          }
          titleEl.textContent = QiActT("combo.edit_title", { name: combo.name });
          if (allBtn) allBtn.disabled = false;
          var html = '<div class="xsact-combo-editor">';
          html += '<div class="xsact-combo-field"><input type="text" id="xsact-combo-name" value="' + escapeHtml(combo.name) + '" placeholder="' + QiActT("combo.name_ph") + '"></div>';
          var curDelay = comboDelay(combo);
          html += '<div class="xsact-combo-field xsact-combo-delay"><label>' + QiActT("combo.delay_label", { n: curDelay }) + '</label><input type="range" id="xsact-combo-delay" min="50" max="2000" step="50" value="' + curDelay + '"></div>';
          if (!combo.items.length) {
            html += '<div class="xsact-qa-empty">' + QiActT("combo.add_hint") + "</div>";
          } else {
            html += '<div class="xsact-combo-items">';
            combo.items.forEach(function(it, idx) {
              var partLbl = (BODY_PARTS.find(function(p) {
                return p.group === it.group;
              }) || {}).label || it.group;
              html += '<div class="xsact-combo-item" data-idx="' + idx + '"><span class="xsact-combo-item-num">' + (idx + 1) + '</span><span class="xsact-combo-item-part">' + escapeHtml(partLbl) + '</span><span class="xsact-combo-item-action">' + escapeHtml(it.label || it.action) + '</span><button class="xsact-combo-item-up" title="' + QiActT("combo.up") + '">' + svgIcon("up", 13) + '</button><button class="xsact-combo-item-down" title="' + QiActT("combo.down") + '">' + svgIcon("down", 13) + '</button><button class="xsact-combo-item-del" title="' + QiActT("combo.item_del") + '" data-tooltip-type="danger">' + svgIcon("close", 13) + "</button></div>";
            });
            html += "</div>";
          }
          html += '<div class="xsact-combo-actions"><button class="xsact-combo-save-btn">' + QiActT("combo.save") + '</button><button class="xsact-combo-cancel-btn">' + QiActT("combo.cancel") + "</button></div>";
          html += "</div>";
          listEl.innerHTML = html;
          var nameInput = listEl.querySelector("#xsact-combo-name");
          if (nameInput) nameInput.addEventListener("change", function() {
            renameCombo(combo.id, nameInput.value);
            titleEl.textContent = QiActT("combo.edit_title", { name: combo.name });
          });
          var delayInput = listEl.querySelector("#xsact-combo-delay");
          var delayVal = listEl.querySelector("#xsact-delay-val");
          if (delayInput) delayInput.addEventListener("input", function() {
            var v = parseInt(delayInput.value, 10) || 160;
            if (delayVal) delayVal.textContent = v;
            combo.delay = v;
            saveCombos();
          });
          listEl.querySelectorAll(".xsact-combo-item-del").forEach(function(btn) {
            btn.addEventListener("click", function() {
              var idx = parseInt(btn.closest(".xsact-combo-item").dataset.idx, 10);
              removeComboItem(combo.id, idx);
              updateComboPanel(charObj);
            });
          });
          listEl.querySelectorAll(".xsact-combo-item-up").forEach(function(btn) {
            btn.addEventListener("click", function() {
              var idx = parseInt(btn.closest(".xsact-combo-item").dataset.idx, 10);
              if (idx > 0) {
                moveComboItem(combo.id, idx, idx - 1);
                updateComboPanel(charObj);
              }
            });
          });
          listEl.querySelectorAll(".xsact-combo-item-down").forEach(function(btn) {
            btn.addEventListener("click", function() {
              var idx = parseInt(btn.closest(".xsact-combo-item").dataset.idx, 10);
              if (idx < combo.items.length - 1) {
                moveComboItem(combo.id, idx, idx + 1);
                updateComboPanel(charObj);
              }
            });
          });
          var saveBtn = listEl.querySelector(".xsact-combo-save-btn");
          if (saveBtn) saveBtn.addEventListener("click", function() {
            stopEditCombo();
            toast(QiActT("toast.combo_saved"), "#46E0A0");
          });
          var cancelBtn = listEl.querySelector(".xsact-combo-cancel-btn");
          if (cancelBtn) cancelBtn.addEventListener("click", stopEditCombo);
          return;
        }
        titleEl.textContent = (charObj ? characterDisplayName(charObj) + " → " : "") + QiActT("render.combo_title");
        if (allBtn) allBtn.disabled = false;
        var html = "";
        if (!state.combos.length) {
          html = '<div class="xsact-qa-empty">' + QiActT("combo.empty") + "</div>";
        } else {
          state.combos.forEach(function(c) {
            html += '<div class="xsact-combo-card" data-id="' + c.id + '"><div class="xsact-combo-info"><span class="xsact-combo-name">' + escapeHtml(c.name) + '</span><span class="xsact-combo-count">' + c.items.length + QiActT("combo.count", { n: c.items.length }) + '</span></div><div class="xsact-combo-btns"><button class="xsact-combo-run" title="' + QiActT("combo.exec") + '">' + svgIcon("play", 14) + '</button><button class="xsact-combo-edit" title="' + QiActT("combo.edit") + '">' + svgIcon("pencil", 14) + '</button><button class="xsact-combo-delete" title="' + QiActT("combo.item_del") + '" data-tooltip-type="danger">' + svgIcon("trash", 14) + "</button></div></div>";
          });
        }
        html += '<button class="xsact-combo-new-btn" id="xsact-new-combo-btn">' + svgIcon("plus", 15) + " " + QiActT("combo.new_btn") + "</button>";
        listEl.innerHTML = html;
        listEl.querySelectorAll(".xsact-combo-run").forEach(function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            var id = btn.closest(".xsact-combo-card").dataset.id;
            var c = getCombo(id);
            if (!c || !c.items.length) return;
            if (state.allModeActive) {
              runComboAll(c);
              return;
            }
            if (!charObj) {
              toast(QiActT("toast.pick_char"), "#FF5C5C");
              return;
            }
            runComboOnTarget(charObj, c);
          });
        });
        listEl.querySelectorAll(".xsact-combo-edit").forEach(function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            startEditCombo(btn.closest(".xsact-combo-card").dataset.id);
          });
        });
        listEl.querySelectorAll(".xsact-combo-delete").forEach(function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            var id = btn.closest(".xsact-combo-card").dataset.id;
            qiactConfirm({ title: QiActT("combo.delete_confirm_title"), body: QiActT("combo.delete_confirm_body"), confirmText: QiActT("combo.delete_confirm_btn"), danger: true }).then(function(ok) {
              if (!ok) return;
              deleteCombo(id);
              updateComboPanel(charObj);
            });
          });
        });
        var newBtn = listEl.querySelector("#xsact-new-combo-btn");
        if (newBtn) newBtn.addEventListener("click", function() {
          var c = addCombo(QiActT("combo.new_name"));
          startEditCombo(c.id);
        });
      }
      function escapeHtml(s) {
        return String(s || "").replace(/[&<>"']/g, function(m) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
        });
      }
      function svgIcon(name, size) {
        if (name === "custom") {
          return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true"><path d="M727.008 487.232l194.016-184.32a99.2 99.2 0 0 0 0-140.288l-48.416-48.416a99.2 99.2 0 0 0-138.464-1.76L544.64 292.384l-184.064-196.64-1.504-1.568a64.832 64.832 0 0 0-91.712-0.384L129.184 231.968a64.8 64.8 0 0 0-1.12 90.144l181.344 193.728-171.456 162.88a99.264 99.264 0 0 0-28.256 49.28l-28.992 123.744a65.632 65.632 0 0 0 82.4 77.92l119.296-35.136a99.744 99.744 0 0 0 40.32-23.232l169.056-160.608 203.616 217.536 1.504 1.568a64.832 64.832 0 0 0 91.712 0.384l138.176-138.176a64.8 64.8 0 0 0 1.12-90.144l-200.896-214.624zM319.424 786.176l-90.112-90.112a31.488 31.488 0 0 0-9.792-6.496L667.104 264.352l94.272 94.272c1.408 1.408 3.168 2.08 4.768 3.168L319.424 786.176zM778.208 158.784a35.2 35.2 0 0 1 49.12 0.64l48.416 48.416c13.76 13.76 13.76 36.032-0.64 50.4l-64.448 61.216c-1.28-2.08-2.24-4.288-4.064-6.112l-93.12-93.12 64.736-61.44zM288.512 399.904c8-0.128 16-3.168 22.112-9.28l48-48a31.968 31.968 0 1 0-45.248-45.248l-48 48a31.68 31.68 0 0 0-8.928 20.256L174.816 278.4c-0.512-0.512-0.512-1.024-0.352-1.152L312.64 139.04c0.128-0.128 0.672-0.128 1.248 0.416l184.384 196.992-142.432 135.328-67.328-71.872zM145.024 868.288a1.6 1.6 0 0 1-2.016-1.92l28.992-123.744c0.992-4.16 2.944-7.968 5.312-11.488a31.808 31.808 0 0 0 6.752 10.144l88.288 88.288a35.072 35.072 0 0 1-8 3.552l-119.328 35.168z m598.336 16.672c-0.128 0.128-0.672 0.128-1.248-0.416l-125.6-134.176a31.232 31.232 0 0 0 14.08-7.712l48-48a31.968 31.968 0 1 0-45.248-45.248l-48 48a31.68 31.68 0 0 0-7.296 11.904l-39.904-42.656 142.432-135.328 200.576 214.304c0.48 0.512 0.48 1.024 0.352 1.152l-138.144 138.176z"/></svg>';
        }
        if (name === "favRemove") {
          return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true"><path d="M481.408 62.037333a34.133333 34.133333 0 0 1 61.184 0l111.957333 226.773334a34.133333 34.133333 0 0 0 13.781334 14.592 341.418667 341.418667 0 0 0-238.378667 507.733333L272.213333 894.037333a34.133333 34.133333 0 0 1-49.493333-35.968l42.752-249.258666a34.133333 34.133333 0 0 0-9.813333-30.208L74.538667 402.048a34.133333 34.133333 0 0 1 18.901333-58.197333l250.282667-36.394667a34.133333 34.133333 0 0 0 25.685333-18.645333l111.957333-226.773334z"/><path d="M725.333333 896a256 256 0 1 0 0-512 256 256 0 0 0 0 512z m-85.333333-298.666667h170.666667a42.666667 42.666667 0 1 1 0 85.333334h-170.666667a42.666667 42.666667 0 1 1 0-85.333334z"/></svg>';
        }
        if (name === "bulkEdit") {
          return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true"><path d="M957.3 147L860 49.7c-13.6-13.6-35.7-13.7-49.4-0.1L437.5 418.7c-4.8 4.8-8.1 10.8-9.6 17.4l-28.4 130.2a34.92 34.92 0 0 0 10 32.7c6.6 6.3 15.3 9.8 24.2 9.8 3 0 5.9-0.4 8.9-1.1l125.7-32.9c6-1.6 11.4-4.7 15.8-9l373.1-369.1c6.6-6.6 10.4-15.5 10.4-24.8-0.1-9.3-3.7-18.3-10.3-24.9zM541.5 509.4L480 525.5l14-64.3 341-337.3 47.8 47.8-341.3 337.7z"/><path d="M888.3 442.8c-19.3 0-35 15.7-35 35v267H248V203h215.1c19.3 0 35-15.7 35-35s-15.7-35-35-35H213c-19.3 0-35 15.7-35 35v135.1H96.1c-19.3 0-35 15.7-35 35v590.1c0 19.3 15.7 35 35 35h675.4c19.3 0 35-15.7 35-35V814.8h81.9c19.3 0 35-15.7 35-35v-302c-0.1-19.3-15.8-35-35.1-35zM736.4 893.3H131.1V373.2H178v406.6c0 19.3 15.7 35 35 35h523.4v78.5z"/></svg>';
        }
        size = size || 16;
        var P = {
          close: '<path d="M6 6l12 12M18 6L6 18"/>',
          refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
          play: '<path d="M7 4l13 8-13 8z"/>',
          star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
          starFill: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
          plus: '<path d="M12 5v14M5 12h14"/>',
          trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
          pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
          up: '<path d="M6 14l6-6 6 6"/>',
          down: '<path d="M6 10l6 6 6-6"/>',
          grip: '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
          check: '<path d="M5 12l5 5 9-11"/>',
          bolt: '<path d="M13 2 4 14h7l-1 8 10-12h-7z"/>',
          resize: '<path d="M22 2L2 22M16 22h6v-6"/>',
          users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
          target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
          tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
          zap: '<polygon points="13 2 4 14 11 14 10 22 20 10 13 10"/>',
          layers: '<path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 15l10 6 10-6"/>',
          user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
          "triangle-left": '<path d="M18 5L7 12l11 7z" fill="currentColor" stroke="none"/>',
          settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
          download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
          upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
          sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
          moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>',
          edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
          power: '<path d="M12 2v10"/><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>',
          toggleOff: '<path d="M6 4h12a8 8 0 0 1 0 16H6a8 8 0 0 1 0-16z" fill="none"/><circle cx="6" cy="12" r="4" fill="currentColor" stroke="none"/>',
          toggleOn: '<path d="M6 4h12a8 8 0 0 1 0 16H6a8 8 0 0 1 0-16z" fill="none"/><circle cx="18" cy="12" r="4" fill="currentColor" stroke="none"/>'
        };
        var inner = P[name] || "";
        return '<svg class="xsact-ico" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
      }
      function updateActionPanel(charObj, partGroup) {
        try {
          if (state.panelMode !== "part") return;
          if (!state.actionPanelEl) return;
          var titleEl = state.actionPanelEl.querySelector("#xsact-panel-title");
          var listEl = state.actionPanelEl.querySelector("#xsact-action-list");
          var allBtn = state.actionPanelEl.querySelector("#xsact-all-btn");
          if (!titleEl || !listEl) return;
          if (!charObj || !partGroup) {
            listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT("render.pick_char_part") + "</div>";
            return;
          }
          titleEl.textContent = (characterDisplayName(charObj) || "?") + " → " + QiActT("part." + partGroup);
          var actions = getActionsForPart(partGroup, charObj);
          if (!Array.isArray(actions) || actions.length === 0) {
            listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT("render.no_actions") + "</div>";
            if (allBtn) allBtn.disabled = true;
            return;
          }
          if (allBtn) allBtn.disabled = false;
          var html = "";
          var isEditing = !!state.editingComboId;
          actions.forEach(function(act) {
            if (!act || !act.Name) return;
            var lbl = getActivityLabel(act.Name, partGroup);
            var isFav = state.favorites.indexOf(canonicalPartGroup(partGroup) + "|" + act.Name) !== -1;
            html += '<div class="xsact-action-row' + (isEditing ? " editing" : "") + '" data-name="' + escapeHtml(act.Name) + '"><button class="xsact-action-btn' + (isFav ? " fav" : "") + '" data-name="' + escapeHtml(act.Name) + '" title="' + escapeHtml(act.Name) + '"><span class="xsact-action-label">' + escapeHtml(lbl) + "</span>" + (isFav ? '<span class="xsact-action-star">' + svgIcon("starFill", 13) + "</span>" : "") + "</button>";
            if (isEditing) {
              html += '<button class="xsact-add-to-combo" title="' + QiActT("combo.add_title") + '">' + svgIcon("plus", 16) + "</button>";
            }
            html += "</div>";
          });
          listEl.innerHTML = html || '<div class="xsact-qa-empty">' + QiActT("render.no_actions") + "</div>";
          listEl.querySelectorAll(".xsact-action-btn").forEach(function(btn) {
            btn.addEventListener("click", function(e) {
              e.stopPropagation();
              var actName = btn.dataset.name;
              var act = actions.find(function(a) {
                return a && a.Name === actName;
              }) || { Name: actName, Item: null };
              state.selectedAction = actName;
              state.selectedActionItem = act.Item || null;
              listEl.querySelectorAll(".xsact-action-btn").forEach((b) => b.classList.remove("sel"));
              btn.classList.add("sel");
              if (state.favModeActive) {
                toggleFavoriteAction(partGroup, actName, btn);
                return;
              }
              if (state.allModeActive) executeActionAll();
              else {
                var execOk = executeAction(charObj, actName, act.Item || null);
                var srcKey = caDetectSource(actName);
                if (srcKey === "LSCG" || srcKey === "LIKO") {
                  setTimeout(function() {
                    try {
                      updateActionPanel(charObj, partGroup);
                    } catch (_) {
                      console.warn("[QiAct] 延迟刷新动作面板失败（已忽略）:", _ && _.message);
                    }
                  }, 50);
                } else if (execOk !== false) {
                  toast(QiActT("toast.executed", { name: getActivityLabel(actName, partGroup) }), "#46E0A0");
                }
              }
            });
          });
          if (isEditing) {
            listEl.querySelectorAll(".xsact-add-to-combo").forEach(function(btn) {
              btn.addEventListener("click", function(e) {
                e.stopPropagation();
                var actName = btn.parentNode.dataset.name;
                var act = actions.find(function(a) {
                  return a && a.Name === actName;
                }) || { Name: actName, Item: null, translatedName: actName };
                var lbl = act.translatedName || getActivityLabel(act.Name, partGroup);
                addComboItem(state.editingComboId, partGroup, act.Name, lbl, act.Item || null);
                toast(QiActT("toast.added_to_combo", { name: getCombo(state.editingComboId).name }), "#46E0A0");
              });
            });
          }
        } catch (panelErr) {
          console.error("[QiAct] updateActionPanel 渲染失败:", panelErr);
          if (state.actionPanelEl) {
            var listEl = state.actionPanelEl.querySelector("#xsact-action-list");
            if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty" style="color:#FF8FA6">' + QiActT("render.load_err", { msg: escapeHtml(panelErr.message) }) + "</div>";
          }
        }
      }
      function updateFavoritesPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector("#xsact-panel-title");
        var listEl = state.actionPanelEl.querySelector("#xsact-action-list");
        if (!titleEl || !listEl) return;
        titleEl.textContent = QiActT("render.favorite_title");
        renderFavoritePartFilter();
        if (!state.favorites.length) {
          listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT("common.no_fav") + "</div>";
          return;
        }
        var html = "";
        var seen = {};
        state.favorites.forEach(function(key) {
          var sep = key.indexOf("|");
          var group = canonicalPartGroup(sep < 0 ? "" : key.slice(0, sep));
          var name = sep < 0 ? key : key.slice(sep + 1);
          var normalizedKey = group + "|" + name;
          if (seen[normalizedKey] || state.favoritePartFilter !== "all" && state.favoritePartFilter !== group) return;
          seen[normalizedKey] = true;
          html += '<div class="xsact-action-row" data-key="' + escapeHtml(key) + '"><button class="xsact-action-btn fav" data-group="' + escapeHtml(group) + '" data-name="' + escapeHtml(name) + '"><span class="xsact-action-label">' + escapeHtml(getActivityLabel(name, group)) + '</span><span class="xsact-action-star">' + svgIcon("starFill", 13) + "</span></button></div>";
        });
        if (!html) html = '<div class="xsact-qa-empty">' + QiActT("common.no_fav") + "</div>";
        listEl.innerHTML = html;
        listEl.querySelectorAll(".xsact-action-btn").forEach(function(btn) {
          btn.addEventListener("click", function() {
            if (!charObj) {
              toast(QiActT("render.pick_char_part2"), "#888");
              return;
            }
            if (state.favModeActive) {
              toggleFavoriteAction(btn.dataset.group, btn.dataset.name, btn);
              updateFavoritesPanel(charObj);
              return;
            }
            var acts = getActionsForPart(btn.dataset.group, charObj) || [];
            var act = acts.find(function(a) {
              return a && a.Name === btn.dataset.name;
            });
            executeAction(charObj, btn.dataset.name, act && act.Item ? act.Item : null);
          });
        });
      }
      function canonicalPartGroup(group) {
        return SUBPART_TO_BASE[group] || group;
      }
      function renderFavoritePartFilter() {
        if (!state.actionPanelEl) return;
        var old = state.actionPanelEl.querySelector("#xsact-favorite-part-filter");
        if (old) old.remove();
        if (state.panelMode !== "favorite") return;
        var footer = state.actionPanelEl.querySelector(".xsact-qa-panel-footer");
        if (!footer) return;
        var groups = [];
        state.favorites.forEach(function(k) {
          var p = k.indexOf("|");
          var g = canonicalPartGroup(p < 0 ? "" : k.slice(0, p));
          if (g && groups.indexOf(g) < 0) groups.push(g);
        });
        var bar = document.createElement("div");
        bar.id = "xsact-favorite-part-filter";
        bar.className = "xsact-favorite-part-filter";
        bar.innerHTML = '<button data-group="all" class="' + (state.favoritePartFilter === "all" ? "active" : "") + '">' + QiActT("custom.chip_all") + "</button>" + groups.map(function(g) {
          return '<button data-group="' + escapeHtml(g) + '" class="' + (state.favoritePartFilter === g ? "active" : "") + '">' + escapeHtml(QiActT("part." + g)) + "</button>";
        }).join("");
        footer.insertAdjacentElement("afterend", bar);
        bar.querySelectorAll("button").forEach(function(b) {
          b.addEventListener("click", function() {
            state.favoritePartFilter = b.dataset.group;
            updateFavoritesPanel(state.selectedTarget);
          });
        });
      }
      function updateSettingsPanel() {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector("#xsact-panel-title");
        var listEl = state.actionPanelEl.querySelector("#xsact-action-list");
        if (titleEl) titleEl.textContent = QiActT("settings.title");
        var cur = QiActI18n.getCurrentLang ? QiActI18n.getCurrentLang() : "auto";
        var langs = ["auto"].concat(QiActI18n.LANGS || ["TW", "CN", "EN", "DE", "FR", "RU", "UA"]);
        var opts = langs.map(function(l) {
          var m = (QiActI18n.LANG_META || {})[l] || {};
          return '<option value="' + l + '"' + (l === cur ? " selected" : "") + ">" + escapeHtml(m.native || (l === "auto" ? QiActT("settings.auto") : l)) + "</option>";
        }).join("");
        listEl.innerHTML = '<div class="xsact-settings"><label class="xsact-settings-row"><span>' + QiActT("settings.language") + '</span><select id="xsact-settings-lang">' + opts + '</select></label><label class="xsact-settings-row"><span>' + QiActT("settings.theme") + '</span><select id="xsact-settings-theme"><option value="dark"' + (state.theme === "dark" ? " selected" : "") + ">" + QiActT("ui.theme_dark") + '</option><option value="light"' + (state.theme === "light" ? " selected" : "") + ">" + QiActT("ui.theme_light") + '</option></select></label><label class="xsact-settings-row"><span>' + QiActT("settings.chat_button") + '</span><span class="xsact-switch"><input type="checkbox" id="xsact-settings-chat"' + (state.chatButtonDocked ? " checked" : "") + '><span class="xsact-switch-track"></span></span></label><label class="xsact-settings-row"><span>' + QiActT("settings.enable_xiaosu") + '</span><span class="xsact-switch"><input type="checkbox" id="xsact-settings-xiaosu"' + (state.xiaosuPack ? " checked" : "") + '><span class="xsact-switch-track"></span></span></label></div>';
        listEl.querySelector("#xsact-settings-lang").addEventListener("change", function(e) {
          QiActI18n.setLang(e.target.value);
          rebuildPanel();
          setPanelMode("settings");
        });
        listEl.querySelector("#xsact-settings-theme").addEventListener("change", function(e) {
          applyTheme(e.target.value);
          persist(S_THEME, e.target.value);
        });
        listEl.querySelector("#xsact-settings-chat").addEventListener("change", function(e) {
          setChatButtonDocked(e.target.checked);
        });
        listEl.querySelector("#xsact-settings-xiaosu").addEventListener("change", function(e) {
          setXiaosuPack(e.target.checked);
        });
      }
      function applyPanelPosition() {
        if (!state.actionPanelEl) return;
        var saved = loadSetting(S_POS, null);
        if (saved && typeof saved.left === "number" && typeof saved.top === "number") {
          state.actionPanelEl.style.right = "auto";
          state.actionPanelEl.style.bottom = "auto";
          state.actionPanelEl.style.left = saved.left + "px";
          state.actionPanelEl.style.top = saved.top + "px";
        }
      }
      function savePanelPosition() {
        if (!state.actionPanelEl) return;
        var r = state.actionPanelEl.getBoundingClientRect();
        persist(S_POS, { left: Math.round(r.left), top: Math.round(r.top) });
      }
      function applyPanelSize() {
        if (!state.actionPanelEl) return;
        var saved = loadSetting(S_SIZE, null);
        if (saved && typeof saved.width === "number" && typeof saved.height === "number") {
          state.actionPanelEl.style.width = Math.max(220, Math.min(560, saved.width)) + "px";
          state.actionPanelEl.style.height = Math.max(300, Math.min(Math.min(window.innerHeight - 60, 820), saved.height)) + "px";
        }
      }
      function savePanelSize() {
        if (!state.actionPanelEl) return;
        persist(S_SIZE, { width: Math.round(state.actionPanelEl.offsetWidth), height: Math.round(state.actionPanelEl.offsetHeight) });
      }
      function makeResizable(panel) {
        var handle = panel.querySelector("#xsact-resize-handle");
        if (!handle) return;
        var resizing = false, sx = 0, sy = 0, ow = 0, oh = 0;
        function onMove(e) {
          if (!resizing) return;
          var nw = ow + (e.clientX - sx);
          var nh = oh + (e.clientY - sy);
          nw = Math.max(220, Math.min(560, nw));
          nh = Math.max(300, Math.min(Math.min(window.innerHeight - 60, 820), nh));
          panel.style.width = nw + "px";
          panel.style.height = nh + "px";
        }
        function onUp() {
          if (!resizing) return;
          resizing = false;
          handle.classList.remove("resizing");
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          savePanelSize();
        }
        handle.addEventListener("mousedown", function(e) {
          resizing = true;
          sx = e.clientX;
          sy = e.clientY;
          ow = panel.offsetWidth;
          oh = panel.offsetHeight;
          handle.classList.add("resizing");
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          e.preventDefault();
          e.stopPropagation();
        });
      }
      function makeDraggable(panel) {
        var header = panel.querySelector("#xsact-panel-header");
        if (!header) return;
        var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
        function onMove(e) {
          if (!dragging) return;
          var nx = ox + (e.clientX - sx);
          var ny = oy + (e.clientY - sy);
          var w = panel.offsetWidth, h = panel.offsetHeight;
          nx = Math.max(4, Math.min(nx, window.innerWidth - w - 4));
          ny = Math.max(4, Math.min(ny, window.innerHeight - h - 4));
          panel.style.left = nx + "px";
          panel.style.top = ny + "px";
          panel.style.right = "auto";
          panel.style.bottom = "auto";
        }
        function onUp() {
          if (!dragging) return;
          dragging = false;
          header.classList.remove("dragging");
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          savePanelPosition();
        }
        header.addEventListener("mousedown", function(e) {
          if (e.target.closest("button, select, input")) return;
          dragging = true;
          sx = e.clientX;
          sy = e.clientY;
          var r = panel.getBoundingClientRect();
          ox = r.left;
          oy = r.top;
          panel.style.right = "auto";
          panel.style.bottom = "auto";
          header.classList.add("dragging");
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          e.preventDefault();
        });
      }
      var __langGlobalBound = false;
      function bindPanelEvents(panel) {
        var exitBtn = panel.querySelector("#xsact-exit-panel-btn");
        if (exitBtn) exitBtn.addEventListener("click", function() {
          toggleActionMode();
        });
        var refreshBtn = panel.querySelector("#xsact-refresh-btn");
        if (refreshBtn) refreshBtn.addEventListener("click", refreshPanelState);
        var settingsBtn = panel.querySelector("#xsact-settings-btn");
        if (settingsBtn) settingsBtn.addEventListener("click", function() {
          setPanelMode("settings");
        });
        var langWrap = panel.querySelector("#xsact-lang");
        var langTrigger = panel.querySelector("#xsact-lang-trigger");
        var langMenu = panel.querySelector("#xsact-lang-menu");
        if (langWrap && langTrigger && langMenu) {
          var closeLang = function() {
            langWrap.classList.remove("open");
            langTrigger.setAttribute("aria-expanded", "false");
          };
          var openLang = function() {
            langWrap.classList.add("open");
            langTrigger.setAttribute("aria-expanded", "true");
            var act = langMenu.querySelector(".xsact-lang-item.active") || langMenu.querySelector(".xsact-lang-item");
            if (act) act.focus();
          };
          langTrigger.addEventListener("click", function(e) {
            e.stopPropagation();
            if (langWrap.classList.contains("open")) closeLang();
            else openLang();
          });
          langMenu.querySelectorAll(".xsact-lang-item").forEach(function(it) {
            it.addEventListener("click", function(e) {
              e.stopPropagation();
              var code = it.getAttribute("data-lang");
              if (typeof QiActI18n !== "undefined" && QiActI18n.setLang) QiActI18n.setLang(code);
              closeLang();
              if (typeof rebuildPanel === "function") rebuildPanel();
              else if (window.__QiAct && window.__QiAct.rebuild) window.__QiAct.rebuild();
            });
          });
          langMenu.addEventListener("keydown", function(e) {
            var items = Array.prototype.slice.call(langMenu.querySelectorAll(".xsact-lang-item"));
            var idx = items.indexOf(document.activeElement);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              (items[(idx + 1) % items.length] || items[0]).focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              (items[(idx - 1 + items.length) % items.length] || items[0]).focus();
            } else if (e.key === "Escape") {
              e.preventDefault();
              closeLang();
              langTrigger.focus();
            }
          });
          if (!__langGlobalBound) {
            __langGlobalBound = true;
            document.addEventListener("click", function(e) {
              var w = document.getElementById("xsact-lang");
              if (w && !w.contains(e.target)) {
                w.classList.remove("open");
                var t = document.getElementById("xsact-lang-trigger");
                if (t) t.setAttribute("aria-expanded", "false");
              }
            });
            document.addEventListener("keydown", function(e) {
              if (e.key === "Escape") {
                var w = document.getElementById("xsact-lang");
                if (w && w.classList.contains("open")) {
                  w.classList.remove("open");
                  var t = document.getElementById("xsact-lang-trigger");
                  if (t) {
                    t.setAttribute("aria-expanded", "false");
                    t.focus();
                  }
                }
              }
            }, true);
          }
        }
        panel.querySelectorAll(".xsact-mode-tab").forEach(function(tab) {
          tab.addEventListener("click", function() {
            setPanelMode(tab.dataset.mode);
          });
        });
        var charPopoverTab = panel.querySelector("#xsact-char-popover-tab");
        var charPopoverClose = panel.querySelector("#xsact-char-popover-close");
        var charPopoverBack = panel.querySelector("#xsact-char-popover-back");
        if (charPopoverTab) {
          charPopoverTab.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleCharPopover();
          });
        }
        if (charPopoverClose) {
          charPopoverClose.addEventListener("click", function(e) {
            e.stopPropagation();
            closeCharPopover();
          });
        }
        if (charPopoverBack) {
          charPopoverBack.addEventListener("click", function(e) {
            e.stopPropagation();
            state.popoverView = "chars";
            renderPopover();
          });
        }
        panel.addEventListener("click", function(e) {
          var popover = panel.querySelector("#xsact-char-popover");
          if (popover && state.charListOpen && !popover.contains(e.target) && e.target !== charPopoverTab && !(charPopoverTab && charPopoverTab.contains(e.target))) {
            closeCharPopover();
          }
        });
        panel.addEventListener("wheel", function(e) {
          e.stopPropagation();
        }, { passive: true });
        var charPop = panel.querySelector("#xsact-char-popover");
        if (charPop) charPop.addEventListener("wheel", function(e) {
          e.stopPropagation();
        }, { passive: true });
        var actionList = panel.querySelector("#xsact-action-list");
        if (actionList) {
          let onActionListWheel = function(e) {
            e.preventDefault();
            e.stopPropagation();
            actionList.scrollTop += e.deltaY;
          };
          actionList.addEventListener("wheel", onActionListWheel, { passive: false });
          actionList.addEventListener("touchmove", function(e) {
            e.stopPropagation();
          }, { passive: true });
        }
        var allBtn = panel.querySelector("#xsact-all-btn");
        if (allBtn) allBtn.addEventListener("click", toggleAllMode);
        var selfBtn = panel.querySelector("#xsact-self-btn");
        if (selfBtn) selfBtn.addEventListener("click", toggleSelfMode);
        var x3Btn = panel.querySelector("#xsact-x3-btn");
        if (x3Btn) x3Btn.addEventListener("click", function() {
          if (!state.selectedTarget || !state.selectedAction) return;
          var count = 0;
          var doIt = function() {
            if (count < 3 && state.isActive) {
              executeAction(state.selectedTarget, state.selectedAction);
              count++;
              setTimeout(doIt, 300);
            }
          };
          doIt();
        });
        var favBtn = panel.querySelector("#xsact-fav-btn");
        if (favBtn) favBtn.addEventListener("click", toggleFavMode);
        var gridBtn = panel.querySelector("#xsact-grid-btn");
        if (gridBtn) gridBtn.addEventListener("click", toggleInteractionGrid);
        var themeBtn = panel.querySelector("#xsact-theme-btn");
        if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
      }
      function accentColor() {
        try {
          return getComputedStyle(document.documentElement).getPropertyValue("--xs-accent").trim() || "#FF5C7A";
        } catch (e) {
          return "#FF5C7A";
        }
      }
      function buildThemeVarsCSS() {
        var DARK = {
          bg: "rgba(20,23,28,0.98)",
          bg2: "#1C2027",
          border: "rgba(255,255,255,0.08)",
          borderStrong: "rgba(255,255,255,0.18)",
          text: "#E7E9EE",
          textDim: "#9AA1AD",
          textFaint: "#5F6672",
          hover: "#232833",
          shadow: "0 14px 44px rgba(0,0,0,0.55)",
          scroll: "#3A3F49",
          blur: "blur(10px)",
          inputBg: "#10131A",
          btnBg: "rgba(255,255,255,0.05)",
          nameShadow: "rgba(255,92,122,0.45)"
        };
        var LIGHT = {
          bg: "rgba(248,245,251,0.97)",
          bg2: "#E9E6EF",
          border: "rgba(28,22,32,0.14)",
          borderStrong: "rgba(28,22,32,0.32)",
          text: "#1E2430",
          textDim: "#4A5568",
          textFaint: "#7B8494",
          hover: "#DCD9E2",
          shadow: "0 14px 40px rgba(60,40,80,0.16)",
          scroll: "#B8BCC6",
          blur: "blur(14px)",
          inputBg: "#FFFFFF",
          btnBg: "rgba(28,22,32,0.07)",
          nameShadow: "rgba(255,92,122,0.35)"
        };
        var ACCENT = "#FF5C7A", ACCENT_RGB = "255,92,122";
        var ZONES = {
          dark: {
            stroke: "rgba(255,255,255,0.35)",
            strokeHover: "#fff",
            strokeSelected: "var(--xs-accent)",
            fill: "rgba(" + ACCENT_RGB + ",0.08)",
            fillHover: "rgba(" + ACCENT_RGB + ",0.26)",
            fillSelected: "rgba(" + ACCENT_RGB + ",0.32)",
            filter: "drop-shadow(0 0 10px rgba(" + ACCENT_RGB + ",0.06))"
          },
          light: {
            stroke: "rgba(74,68,88,0.70)",
            strokeHover: "var(--xs-accent)",
            strokeSelected: "#B02A4E",
            fill: "rgba(" + ACCENT_RGB + ",0.10)",
            fillHover: "rgba(" + ACCENT_RGB + ",0.22)",
            fillSelected: "rgba(" + ACCENT_RGB + ",0.30)",
            filter: "drop-shadow(0 0 6px rgba(" + ACCENT_RGB + ",0.10))"
          }
        };
        var blocks = [":root{--xs-accent:" + ACCENT + ";--xs-accent-rgb:" + ACCENT_RGB + ";--xs-accent-soft:rgba(" + ACCENT_RGB + ",0.14);--xs-accent-text:#D6336C;--xs-panel-bg:" + DARK.bg + ";--xs-panel-bg-2:" + DARK.bg2 + ";--xs-border:" + DARK.border + ";--xs-border-strong:" + DARK.borderStrong + ";--xs-text:" + DARK.text + ";--xs-text-dim:" + DARK.textDim + ";--xs-text-faint:" + DARK.textFaint + ";--xs-hover:" + DARK.hover + ";--xs-shadow:" + DARK.shadow + ";--xs-scroll:" + DARK.scroll + ";--xs-blur:" + DARK.blur + ";--xs-input-bg:" + DARK.inputBg + ";--xs-btn-bg:" + DARK.btnBg + ";--xs-name-shadow:" + DARK.nameShadow + ";--xs-zone-stroke:" + ZONES.dark.stroke + ";--xs-zone-stroke-hover:" + ZONES.dark.strokeHover + ";--xs-zone-stroke-selected:" + ZONES.dark.strokeSelected + ";--xs-zone-fill:" + ZONES.dark.fill + ";--xs-zone-fill-hover:" + ZONES.dark.fillHover + ";--xs-zone-fill-selected:" + ZONES.dark.fillSelected + ";--xs-zone-filter:" + ZONES.dark.filter + ";}"];
        THEMES.forEach(function(t) {
          var p = t.base === "light" ? LIGHT : DARK;
          var z = t.base === "light" ? ZONES.light : ZONES.dark;
          var accentText = t.base === "light" ? "#B02A4E" : "#FFD6DF";
          blocks.push('[data-xsact-theme="' + t.id + '"]{--xs-accent:' + ACCENT + ";--xs-accent-rgb:" + ACCENT_RGB + ";--xs-accent-soft:rgba(" + ACCENT_RGB + ",0.14);--xs-accent-text:" + accentText + ";--xs-panel-bg:" + p.bg + ";--xs-panel-bg-2:" + p.bg2 + ";--xs-border:" + p.border + ";--xs-border-strong:" + p.borderStrong + ";--xs-text:" + p.text + ";--xs-text-dim:" + p.textDim + ";--xs-text-faint:" + p.textFaint + ";--xs-hover:" + p.hover + ";--xs-shadow:" + p.shadow + ";--xs-scroll:" + p.scroll + ";--xs-blur:" + p.blur + ";--xs-input-bg:" + p.inputBg + ";--xs-btn-bg:" + p.btnBg + ";--xs-name-shadow:" + p.nameShadow + ";--xs-zone-stroke:" + z.stroke + ";--xs-zone-stroke-hover:" + z.strokeHover + ";--xs-zone-stroke-selected:" + z.strokeSelected + ";--xs-zone-fill:" + z.fill + ";--xs-zone-fill-hover:" + z.fillHover + ";--xs-zone-fill-selected:" + z.fillSelected + ";--xs-zone-filter:" + z.filter + ";}");
        });
        return blocks.join("\n");
      }
      function injectStyles() {
        try {
          Array.prototype.forEach.call(document.querySelectorAll("style"), function(s) {
            if (s.id !== "xsact-qa-styles" && s.textContent && s.textContent.indexOf("#xsact-qa-panel") !== -1) {
              s.parentNode && s.parentNode.removeChild(s);
            }
          });
        } catch (_) {
        }
        var css = document.getElementById("xsact-qa-styles");
        if (!css) {
          css = document.createElement("style");
          css.id = "xsact-qa-styles";
          document.head.appendChild(css);
        }
        css.textContent = [
          buildThemeVarsCSS(),
          /* 统一图标基样式 */
          ".xsact-ico{display:block;flex-shrink:0;}",
          /* ===== DOM 切换按钮（固定右下角，永远可见） ===== */
          "#xsact-toggle-btn{",
          "  position:fixed;bottom:72px;right:16px;z-index:100000;",
          "  width:44px;height:44px;border-radius:13px;",
          "  background:rgba(var(--xs-accent-rgb), 0.85);border:2px solid rgba(var(--xs-accent-rgb), 0.5);",
          "  color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;",
          "  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);",
          "  box-shadow:0 4px 16px var(--xs-shadow),0 0 8px rgba(var(--xs-accent-rgb), 0.2);",
          "  transition:all 0.2s ease;outline:none;",
          "}",
          "#xsact-toggle-btn:hover{",
          "  background:rgba(var(--xs-accent-rgb), 1);border-color:var(--xs-accent);",
          "  box-shadow:0 6px 24px var(--xs-shadow),0 0 16px rgba(var(--xs-accent-rgb), 0.4);",
          "  transform:scale(1.08);",
          "}",
          "#xsact-toggle-btn.active{",
          "  background:rgba(70,224,160,0.9);border-color:#46E0A0;",
          "  box-shadow:0 4px 16px rgba(70,224,160,0.3),0 0 12px rgba(70,224,160,0.4);",
          "}",
          "#xsact-toggle-btn.active:hover{",
          "  background:#46E0A0;transform:scale(1.08);",
          "}",
          "#xsact-toggle-btn.xsact-chat-toggle{position:relative;left:auto;right:auto;top:auto;bottom:auto;width:var(--button-size,40px);height:var(--button-size,40px);margin:0;padding:0;border-radius:12px;}",
          /* ===== 右侧面板（暗色战术操作台） ===== */
          "#xsact-qa-panel{",
          "  position:fixed;top:min(48px,4vh);right:12px;width:min(380px,92vw);height:min(680px,88vh);z-index:90000;",
          "  background:var(--xs-panel-bg);border-radius:14px;",
          "  border:1px solid var(--xs-border);",
          "  display:flex;flex-direction:column;box-sizing:border-box;",
          "  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
          "  box-shadow:0 14px 44px var(--xs-shadow);",
          '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;',
          "  min-width:220px;min-height:300px;max-width:min(560px,96vw);max-height:min(88vh,820px);",
          "  transition:border-color .2s ease,box-shadow .2s ease;",
          "}",
          "#xsact-qa-panel.popover-open{",
          "  border-left-color:var(--xs-accent);",
          "  box-shadow:0 0 24px rgba(var(--xs-accent-rgb), 0.15),0 14px 44px var(--xs-shadow);",
          "}",
          ".xsact-qa-panel-inner{",
          "  display:flex;flex-direction:column;height:100%;min-width:0;min-height:0;box-sizing:border-box;container-type:inline-size;container-name:xsact-panel;",
          "  overflow:hidden;border-radius:14px;",
          "}",
          /* 标题栏 = 拖拽手柄 */
          ".xsact-qa-panel-header{",
          "  display:flex;justify-content:space-between;align-items:center;gap:8px;",
          "  padding:11px 12px 9px;border-bottom:1px solid var(--xs-border);",
          "  cursor:grab;user-select:none;-webkit-user-select:none;",
          "}",
          ".xsact-qa-panel-header.dragging{cursor:grabbing;}",
          ".xsact-panel-grip{color:var(--xs-text-faint);display:flex;transition:color .15s;}",
          ".xsact-qa-panel-header.dragging .xsact-panel-grip{color:var(--xs-accent);}",
          "#xsact-panel-title{",
          "  flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--xs-text);",
          "  letter-spacing:0.3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
          "}",
          ".xsact-panel-head-actions{display:flex;gap:5px;flex-shrink:0;}",
          /* 模式切换标签 */
          ".xsact-qa-mode-tabs{",
          "  display:flex;gap:6px;padding:9px 12px 5px;",
          "}",
          ".xsact-mode-tab{",
          "  flex:1;padding:8px 8px;font-size:12px;cursor:pointer;",
          "  background:var(--xs-btn-bg);border:1px solid var(--xs-border);min-width:32px;min-height:32px;box-sizing:border-box;",
          "  border-radius:8px;color:var(--xs-text-dim);transition:all 0.15s ease;",
          "  display:flex;align-items:center;justify-content:center;gap:6px;",
          "}",
          '.xsact-mode-tab[data-mode="custom"]{flex-direction:column;gap:2px;padding-top:5px;padding-bottom:5px;line-height:1.05;}',
          ".xsact-custom-tab-main{display:flex;align-items:center;justify-content:center;gap:5px;}",
          '.xsact-mode-tab[data-mode="custom"] .xsact-beta-badge{position:static;margin:0;font-size:9px;line-height:1;}',
          ".xsact-mode-tab .xsact-ico{width:14px;height:14px;stroke-width:2.2px;}",
          ".xsact-mode-tab:hover{color:var(--xs-text);border-color:var(--xs-border-strong);}",
          ".xsact-mode-tab.active{",
          "  background:rgba(var(--xs-accent-rgb), 0.14);border-color:var(--xs-accent);color:var(--xs-accent-text);font-weight:600;",
          "}",
          /* 类型计数徽标 */
          ".xsact-type-count{",
          "  margin-left:auto;min-width:20px;text-align:center;",
          "  font-size:11px;font-weight:700;color:var(--xs-accent-text);",
          "  background:rgba(var(--xs-accent-rgb), 0.16);border-radius:9px;padding:1px 7px;",
          "}",
          ".xsact-qa-panel-body{",
          "  flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 12px;overscroll-behavior:contain;",
          "  scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;",
          "  display:grid;grid-template-columns:repeat(auto-fill, minmax(108px, 1fr));gap:6px;min-width:0;container-type:inline-size;container-name:xsact-body;",
          "  align-content:start;min-height:0;",
          "}",
          ".xsact-qa-empty{",
          "  color:var(--xs-text-faint);text-align:center;padding:42px 14px;font-size:12px;line-height:1.6;grid-column:1 / -1;",
          "}",
          /* 动作按钮 */
          ".xsact-action-btn{",
          "  position:relative;overflow:hidden;",
          "  display:flex;align-items:center;gap:8px;",
          "  width:100%;padding:10px 11px;",
          "  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);",
          "  border-left:2px solid transparent;",
          "  border-radius:8px;color:var(--xs-text-dim);font-size:12.5px;cursor:pointer;",
          "  transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease;text-align:left;",
          "}",
          ".xsact-action-btn:hover{",
          "  background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);",
          "}",
          ".xsact-action-btn.sel{",
          "  background:rgba(var(--xs-accent-rgb), 0.12);border-color:var(--xs-accent);border-left-color:var(--xs-accent);color:var(--xs-accent-text);",
          "}",
          ".xsact-action-btn.fav{",
          "  background:rgba(232,179,57,0.12);border-color:rgba(232,179,57,0.55);border-left-color:#E8B339;color:#FCEBC0;",
          "  box-shadow:0 0 0 1px rgba(232,179,57,0.08) inset,0 0 12px rgba(232,179,57,0.15);",
          "}",
          ".xsact-action-btn.fav:hover{",
          "  background:rgba(232,179,57,0.20);border-color:rgba(232,179,57,0.75);color:#fff;",
          "}",
          ".xsact-action-label{flex:1;position:relative;z-index:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
          ".xsact-action-star{color:#E8B339;display:flex;position:relative;z-index:1;filter:drop-shadow(0 0 4px rgba(232,179,57,0.7));}",
          /* 动作行 + 加入组合按钮 */
          ".xsact-action-row{",
          "  display:flex;align-items:center;gap:6px;min-width:0;",
          "}",
          ".xsact-action-row .xsact-action-btn{flex:1;margin-bottom:0;width:auto;min-width:0;height:100%;}",
          ".xsact-add-to-combo{",
          "  width:30px;height:30px;flex-shrink:0;",
          "  background:rgba(70,224,160,0.12);border:1px solid rgba(70,224,160,0.4);",
          "  border-radius:8px;color:#46E0A0;cursor:pointer;",
          "  display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;",
          "}",
          ".xsact-add-to-combo:hover{background:rgba(70,224,160,0.24);border-color:#46E0A0;color:#CFFAE8;}",
          /* 自定义组合卡片 */
          ".xsact-combo-card{",
          "  grid-column:1 / -1;",
          "  display:flex;justify-content:space-between;align-items:center;",
          "  padding:11px 12px;margin-bottom:7px;",
          "  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);",
          "  border-radius:9px;color:var(--xs-text-dim);",
          "}",
          ".xsact-combo-info{display:flex;flex-direction:column;gap:2px;min-width:0;}",
          ".xsact-combo-name{font-size:13px;font-weight:600;color:var(--xs-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
          ".xsact-combo-count{font-size:11px;color:var(--xs-text-faint);}",
          ".xsact-combo-btns{display:flex;gap:6px;}",
          ".xsact-combo-btns button{",
          "  width:30px;height:30px;border-radius:7px;cursor:pointer;",
          "  background:var(--xs-btn-bg);border:1px solid var(--xs-border-strong);",
          "  color:var(--xs-text-dim);display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;",
          "}",
          ".xsact-combo-run:hover{background:rgba(var(--xs-accent-rgb), 0.18);border-color:var(--xs-accent);color:var(--xs-accent-text);}",
          ".xsact-combo-edit:hover{background:rgba(70,224,160,0.16);border-color:#46E0A0;color:#CFFAE8;}",
          ".xsact-combo-delete:hover{background:rgba(255,92,92,0.16);border-color:#FF5C5C;color:#FFB3B3;}",
          ".xsact-combo-new-btn{",
          "  grid-column:1 / -1;",
          "  width:100%;padding:10px;margin-top:7px;",
          "  background:rgba(var(--xs-accent-rgb), 0.08);border:1px dashed rgba(var(--xs-accent-rgb), 0.4);",
          "  border-radius:8px;color:var(--xs-accent-text);font-size:12.5px;cursor:pointer;",
          "  display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.15s ease;",
          "}",
          ".xsact-combo-new-btn:hover{background:rgba(var(--xs-accent-rgb), 0.16);color:#fff;}",
          /* 预设栏 */
          ".xsact-combo-editor{grid-column:1 / -1;display:flex;flex-direction:column;gap:11px;}",
          ".xsact-combo-field input{",
          "  width:100%;padding:8px 10px;box-sizing:border-box;",
          "  background:var(--xs-input-bg);border:1px solid var(--xs-border-strong);",
          "  border-radius:7px;color:var(--xs-text);font-size:13px;",
          "}",
          ".xsact-combo-field input:focus{outline:none;border-color:var(--xs-accent);}",
          ".xsact-combo-delay label{display:block;font-size:12px;color:var(--xs-text-dim);margin-bottom:6px;}",
          ".xsact-combo-delay #xsact-delay-val{color:var(--xs-accent);font-weight:700;}",
          ".xsact-combo-delay input[type=range]{width:100%;accent-color:var(--xs-accent);height:4px;cursor:pointer;}",
          ".xsact-combo-items{",
          "  display:flex;flex-direction:column;gap:6px;max-height:230px;overflow-y:auto;",
          "  scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;",
          "}",
          ".xsact-combo-item{",
          "  display:flex;align-items:center;gap:7px;padding:8px;",
          "  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);",
          "  border-radius:7px;font-size:12px;color:var(--xs-text-dim);",
          "}",
          ".xsact-combo-item-num{",
          "  min-width:18px;text-align:center;font-size:10px;font-weight:700;",
          "  color:var(--xs-accent-text);background:rgba(var(--xs-accent-rgb), 0.16);border-radius:5px;padding:1px 0;",
          "}",
          ".xsact-combo-item-part{",
          "  min-width:42px;color:var(--xs-text-faint);font-weight:500;",
          "}",
          ".xsact-combo-item-action{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
          ".xsact-combo-item button{",
          "  width:24px;height:24px;padding:0;border-radius:6px;cursor:pointer;",
          "  background:var(--xs-btn-bg);border:1px solid var(--xs-border-strong);",
          "  color:var(--xs-text-dim);display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;",
          "}",
          ".xsact-combo-item-up:hover,.xsact-combo-item-down:hover{border-color:var(--xs-accent);color:var(--xs-accent-text);}",
          ".xsact-combo-item-del:hover{border-color:#FF5C5C;color:#FFB3B3;}",
          ".xsact-combo-actions{display:flex;gap:8px;}",
          ".xsact-combo-actions button{flex:1;padding:9px;border-radius:7px;cursor:pointer;font-size:13px;border:none;color:var(--xs-text);}",
          ".xsact-combo-save-btn{background:#46E0A0;color:#fff;}",
          ".xsact-combo-save-btn:hover{background:#2FC989;}",
          ".xsact-combo-cancel-btn{background:var(--xs-border);color:var(--xs-text);}",
          ".xsact-combo-cancel-btn:hover{background:var(--xs-border-strong);}",
          /* ===== 自定义动作（我的动作 tab） ===== */
          "#xsact-action-list.xsact-custom-mode{display:flex;flex-direction:column;gap:0;padding:0;overflow:hidden;}",
          "#xsact-action-list.xsact-custom-mode > *{width:100%;min-width:0;}",
          ".xsact-ca-view{display:flex;flex-direction:column;gap:0;width:100%;height:100%;min-width:0;min-height:0;padding:0;border:1px solid var(--xs-border);border-radius:12px;overflow:hidden;background:var(--xs-card-bg);}",
          ".xsact-ca-view,.xsact-ca-view *{box-sizing:border-box;}",
          ".xsact-ca-view>div{padding:10px 12px;border-bottom:1px solid var(--xs-border);flex-shrink:0;}",
          ".xsact-ca-view>div:last-child{border-bottom:0;}",
          ".xsact-ca-toolbar{display:flex;align-items:center;gap:6px;width:100%;min-width:0;padding:8px!important;}",
          ".xsact-ca-search{flex:1 1 0;min-width:0;width:0;padding:7px 9px;border-radius:7px;border:1px solid var(--xs-border);background:var(--xs-input-bg);color:var(--xs-text);font-size:12px;transition:opacity .15s;}",
          ".xsact-ca-search:focus{outline:none;border-color:var(--xs-accent);}",
          ".xsact-ca-search.is-hidden{visibility:hidden;pointer-events:none;opacity:0;}",
          ".xsact-ca-toolbar-btns{display:flex;gap:4px;flex-shrink:0;}",
          ".xsact-ca-toolbar-btns button{display:flex;align-items:center;justify-content:center;gap:3px;width:28px;height:28px;padding:0;border-radius:7px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);cursor:pointer;font-size:11px;transition:background .15s,border-color .15s,color .15s;}",
          ".xsact-ca-toolbar-btns button:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}",
          ".xsact-ca-toolbar-btns button.xsact-ca-new{width:28px;padding:0;background:rgba(255,92,122,0.14);border-color:rgba(255,92,122,0.45);color:#FF8FA6;}",
          ".xsact-ca-toolbar-btns button.xsact-ca-new span{display:none;}",
          ".xsact-ca-toolbar-btns button.xsact-ca-new:hover{background:rgba(255,92,122,0.24);color:#FFB3C6;}",
          ".xsact-ca-import-wrap{position:relative;display:flex;align-items:center;}",
          ".xsact-ca-import-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:100;display:flex;flex-direction:column;gap:4px;min-width:150px;padding:6px;border-radius:8px;background:var(--xs-panel-bg);border:1px solid var(--xs-border);box-shadow:0 8px 24px rgba(0,0,0,0.35);}",
          ".xsact-ca-import-menu.hidden{display:none;}",
          ".xsact-ca-import-menu button{width:100%;justify-content:flex-start;padding:8px 10px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--xs-text);font-size:12px;text-align:left;cursor:pointer;transition:background .15s,border-color .15s;}",
          ".xsact-ca-import-menu button:hover{background:var(--xs-hover);border-color:var(--xs-border);}",
          ".xsact-ca-file-input{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}",
          /* ── 分类 chip 过滤栏：按来源（all/xiaosu/native/echo）单选 ── */
          ".xsact-ca-chips{display:flex;flex-wrap:wrap;gap:6px;width:100%;min-width:0;padding:2px 0 4px;}",
          ".xsact-ca-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,color .15s,box-shadow .15s;}",
          ".xsact-ca-chip:hover:not(.is-disabled):not(.is-active){background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}",
          ".xsact-ca-chip-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 6px;border-radius:9px;background:rgba(255,255,255,0.08);color:var(--xs-text-dim);font-size:10px;font-weight:700;line-height:1;}",
          ".xsact-ca-chip.is-active.xiaosu{background:rgba(255,92,122,0.20);border-color:rgba(255,92,122,0.55);color:#FFB3C6;box-shadow:0 0 0 1px rgba(255,92,122,0.25);}",
          ".xsact-ca-chip.is-active.xiaosu .xsact-ca-chip-count{background:rgba(255,92,122,0.30);color:#FFD6DF;}",
          ".xsact-ca-chip.is-active.native{background:rgba(160,140,255,0.20);border-color:rgba(160,140,255,0.55);color:#C4B8FF;box-shadow:0 0 0 1px rgba(160,140,255,0.25);}",
          ".xsact-ca-chip.is-active.native .xsact-ca-chip-count{background:rgba(160,140,255,0.30);color:#DCD4FF;}",
          ".xsact-ca-chip.is-active.echo{background:rgba(255,200,90,0.20);border-color:rgba(255,200,90,0.55);color:#FFD87A;box-shadow:0 0 0 1px rgba(255,200,90,0.25);}",
          ".xsact-ca-chip.is-active.echo .xsact-ca-chip-count{background:rgba(255,200,90,0.30);color:#FFE9B0;}",
          ".xsact-ca-chip.is-active.all{background:var(--xs-panel-bg-2);border-color:var(--xs-border-strong);color:var(--xs-text);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.05);}",
          ".xsact-ca-chip.is-active.all .xsact-ca-chip-count{background:rgba(255,255,255,0.16);color:var(--xs-text);}",
          ".xsact-ca-chip.is-disabled{opacity:.42;cursor:not-allowed;}",
          ".xsact-ca-filter-empty{padding:24px 12px;text-align:center;}",
          ".xsact-ca-beta{font-size:11px;line-height:1.55;color:var(--xs-accent-text);background:rgba(var(--xs-accent-rgb),0.10);border:1px solid rgba(var(--xs-accent-rgb),0.30);border-left:3px solid var(--xs-accent);border-radius:8px;padding:10px 12px;}",
          ".xsact-ca-echo-clean{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:11px;line-height:1.5;color:var(--xs-text);background:rgba(255,92,122,0.08);border:1px solid rgba(255,92,122,0.32);border-left:3px solid #FF5C7A;border-radius:8px;padding:10px 12px;margin-top:2px;}",
          ".xsact-ca-echo-clean-text{flex:1;min-width:160px;color:var(--xs-text-dim);}",
          ".xsact-ca-echo-clean-text b{color:#FF8FA6;font-weight:700;}",
          ".xsact-ca-echo-clean-btn{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,92,122,0.5);background:rgba(255,92,122,0.16);color:#FFB3C6;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,color .15s;}",
          ".xsact-ca-echo-clean-btn:hover{background:rgba(255,92,122,0.28);border-color:#FF5C7A;color:#FFFFFF;}",
          ".xsact-ca-list{display:flex;flex-direction:column;gap:10px;width:auto;max-width:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;flex:1 1 auto!important;scrollbar-width:thin;}",
          ".xsact-ca-card{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;max-width:100%;padding:12px 14px;border-radius:10px;background:var(--xs-card-bg);border:1px solid var(--xs-border);transition:border-color .15s,background .15s,transform .1s;min-width:0;overflow:hidden;}",
          ".xsact-ca-card:hover{border-color:var(--xs-border-strong);background:var(--xs-hover);transform:translateY(-1px);}",
          ".xsact-ca-info{display:flex;flex-direction:column;gap:5px;min-width:0;overflow:hidden;}",
          ".xsact-ca-title{display:flex;align-items:center;gap:8px;min-width:0;}",
          ".xsact-ca-name{font-size:14px;font-weight:600;color:var(--xs-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
          ".xsact-ca-meta{display:flex;align-items:center;gap:8px;min-width:0;}",
          ".xsact-ca-part{font-size:11px;color:var(--xs-text-dim);opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
          ".xsact-ca-badge{flex-shrink:0;font-size:10px;padding:3px 8px;border-radius:20px;font-weight:600;letter-spacing:0.02em;}",
          ".xsact-ca-badge.other{background:rgba(90,160,255,0.16);color:#8FB8FF;}",
          ".xsact-ca-badge.self{background:rgba(70,224,160,0.16);color:#5FE3B0;}",
          ".xsact-ca-badge.any{background:rgba(255,92,122,0.16);color:#FF8FA6;}",
          ".xsact-ca-src{flex-shrink:0;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;letter-spacing:0.02em;}",
          ".xsact-ca-src.echo{background:rgba(255,200,90,0.16);color:#FFD87A;}",
          ".xsact-ca-src.native{background:rgba(160,140,255,0.16);color:#C4B8FF;}",
          ".xsact-ca-src.xiaosu{background:rgba(255,92,122,0.18);color:#FF8FA6;border:1px solid rgba(255,92,122,0.35);}",
          ".xsact-ca-card.is-hidden{opacity:.55;border-style:dashed;}",
          ".xsact-ca-editmode.is-active{background:rgba(255,92,122,0.22);border-color:rgba(255,92,122,0.55);color:#FFB3C6;}",
          ".xsact-ca-toggleall:hover{background:rgba(255,92,122,0.18);border-color:rgba(255,92,122,0.45);color:#FFB3C6;}",
          ".xsact-ca-toggleall.is-on{background:rgba(255,92,122,0.22);border-color:rgba(255,92,122,0.55);color:#FFB3C6;}",
          ".xsact-ca-toggleall.is-on:hover{background:rgba(255,92,122,0.32);color:#FFD6DF;}",
          ".xsact-ca-card.is-edit{grid-template-columns:auto 1fr auto;cursor:pointer;user-select:none;}",
          ".xsact-ca-card.is-edit:hover{transform:none;background:var(--xs-hover);}",
          ".xsact-ca-handle{display:flex;align-items:center;justify-content:center;width:20px;color:var(--xs-text-dim);cursor:grab;flex-shrink:0;}",
          ".xsact-ca-handle:active{cursor:grabbing;}",
          ".xsact-ca-card.is-selected{border-color:var(--xs-accent);background:rgba(var(--xs-accent-rgb),0.12);box-shadow:0 0 0 1px var(--xs-accent) inset;}",
          ".xsact-ca-check{display:none;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--xs-accent);color:#fff;flex-shrink:0;}",
          ".xsact-ca-card.is-selected .xsact-ca-check{display:flex;}",
          ".xsact-ca-card.dragging{opacity:.45;outline:2px dashed var(--xs-accent);outline-offset:-2px;}",
          ".xsact-ca-vis-dot{font-size:11px;padding:1px 8px;border-radius:999px;background:var(--xs-border-strong);color:var(--xs-text-dim);white-space:nowrap;}",
          ".xsact-ca-vis-dot.on{background:rgba(70,224,160,0.18);color:#46E0A0;}",
          ".xsact-ca-vis-dot.off{background:rgba(255,92,92,0.16);color:#FF9C9C;}",
          ".xsact-ca-select-all{padding:6px 12px;border-radius:6px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text);font-size:12px;cursor:pointer;transition:background .15s,border-color .15s;white-space:nowrap;}",
          ".xsact-ca-select-all:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);}",
          ".xsact-ca-batchbar{display:flex;align-items:center;gap:10px;width:100%;min-width:0;padding:9px 12px;border-radius:8px;background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);}",
          ".xsact-ca-selected-count{font-size:12px;color:var(--xs-text-dim);white-space:nowrap;margin-right:auto;}",
          ".xsact-ca-batch-actions{display:flex;gap:6px;flex-shrink:0;}",
          ".xsact-ca-batch-actions button{padding:6px 12px;border-radius:6px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text);font-size:12px;cursor:pointer;transition:background .15s,border-color .15s,color .15s;}",
          ".xsact-ca-batch-actions button:hover:not(:disabled){background:var(--xs-hover);border-color:var(--xs-border-strong);}",
          ".xsact-ca-batch-actions button:disabled{opacity:.45;cursor:not-allowed;}",
          ".xsact-ca-batch-del{background:rgba(255,92,92,0.12);border-color:rgba(255,92,92,0.35);color:#FF9C9C;}",
          ".xsact-ca-batch-del:hover:not(:disabled){background:rgba(255,92,92,0.22);border-color:rgba(255,92,92,0.5);}",
          ".xsact-ca-toggle{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:11px;color:var(--xs-text-dim);}",
          ".xsact-ca-toggle input{position:absolute;opacity:0;width:0;height:0;}",
          ".xsact-ca-toggle-track{width:34px;height:18px;border-radius:999px;background:var(--xs-border-strong);position:relative;transition:background .2s;}",
          '.xsact-ca-toggle-track::before{content:"";position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .2s;}',
          ".xsact-ca-toggle input:checked + .xsact-ca-toggle-track{background:var(--xs-accent);}",
          ".xsact-ca-toggle input:checked + .xsact-ca-toggle-track::before{transform:translateX(16px);}",
          ".xsact-ca-toggle input:focus + .xsact-ca-toggle-track{box-shadow:0 0 0 2px rgba(var(--xs-accent-rgb),0.35);}",
          ".xsact-beta-badge{font-size:9px;font-weight:700;line-height:1;padding:2px 5px;border-radius:6px;margin-left:5px;color:#FFD27A;background:rgba(255,180,60,0.16);border:1px solid rgba(255,180,60,0.4);vertical-align:middle;white-space:nowrap;}",
          ".xsact-ca-btns{display:flex;gap:6px;flex-shrink:0;}",
          ".xsact-ca-btns button{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);cursor:pointer;transition:background .15s,color .15s,border-color .15s;}",
          ".xsact-ca-btns button:hover{background:var(--xs-hover);color:var(--xs-text);border-color:var(--xs-border-strong);}",
          ".xsact-ca-run:hover{background:rgba(70,224,160,0.16);color:#5FE3B0;border-color:rgba(70,224,160,0.5);}",
          ".xsact-ca-delete:hover{background:rgba(255,92,92,0.16);color:#FF9C9C;border-color:rgba(255,92,92,0.5);}",
          ".xsact-ca-empty{padding:36px 14px;}",
          ".xsact-ca-editor{display:flex;flex-direction:column;gap:14px;width:100%;min-width:0;}",
          ".xsact-ca-editor .xsact-combo-field{display:flex;flex-direction:column;gap:7px;padding:13px 14px;background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);border-radius:10px;}",
          ".xsact-ca-editor .xsact-combo-field label{font-size:11px;font-weight:600;color:var(--xs-accent-text);letter-spacing:0.04em;text-transform:uppercase;}",
          ".xsact-ca-editor .xsact-combo-field input,.xsact-ca-editor .xsact-combo-field textarea,.xsact-ca-editor .xsact-combo-field select,.xsact-ca-editor .xsact-combo-field .xsact-ca-dialog-rich{width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--xs-border-strong);background:var(--xs-input-bg);color:var(--xs-text);font-size:13px;box-sizing:border-box;font-family:inherit;}",
          ".xsact-ca-editor .xsact-combo-field input:focus,.xsact-ca-editor .xsact-combo-field textarea:focus,.xsact-ca-editor .xsact-combo-field select:focus,.xsact-ca-editor .xsact-combo-field .xsact-ca-dialog-rich:focus{outline:none;border-color:var(--xs-accent);}",
          ".xsact-ca-editor textarea{resize:vertical;min-height:54px;line-height:1.5;}",
          ".xsact-ca-scope{display:flex;gap:8px;}",
          ".xsact-ca-scope button{flex:1;padding:9px 10px;border-radius:8px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);cursor:pointer;font-size:12px;font-weight:500;transition:all .15s;}",
          ".xsact-ca-scope button:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}",
          ".xsact-ca-scope button.active{background:rgba(255,92,122,0.18);border-color:rgba(255,92,122,0.55);color:#FFB3C6;font-weight:600;}",
          ".xsact-ca-hint{display:flex;align-items:baseline;justify-content:flex-start;gap:8px;flex-wrap:wrap;padding:10px 14px;border-radius:10px;border:1px solid var(--xs-border-strong);background:var(--xs-panel-bg-2);box-shadow:0 1px 4px rgba(0,0,0,0.08);}",
          ".xsact-ca-hint-title{font-size:12px;font-weight:600;color:var(--xs-accent-text);letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;line-height:1;}",
          ".xsact-ca-hint-btns{display:flex;gap:8px;flex-wrap:wrap;}",
          ".xsact-ca-token{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid var(--xs-border);background:var(--xs-input-bg);color:var(--xs-text);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s ease;white-space:nowrap;user-select:none;-webkit-user-select:none;box-shadow:0 1px 2px rgba(0,0,0,0.08);}",
          ".xsact-ca-token:hover{background:rgba(255,92,122,0.12);border-color:rgba(255,92,122,0.5);color:#FFD6DF;box-shadow:0 2px 8px rgba(255,92,122,0.18);transform:translateY(-1px);}",
          ".xsact-ca-token:active{transform:translateY(0) scale(0.97);box-shadow:0 1px 3px rgba(255,92,122,0.12);}",
          ".xsact-ca-token-dot{width:7px;height:7px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12);}",
          ".xsact-ca-token-dot.self{background:#46E0A0;}",
          ".xsact-ca-token-dot.other{background:#FF5C7A;}",
          ".xsact-ca-part-display{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:8px;border:1px solid var(--xs-border-strong);background:var(--xs-input-bg);cursor:pointer;transition:background .15s,border-color .15s;}",
          ".xsact-ca-part-display:hover{background:var(--xs-hover);border-color:var(--xs-accent);}",
          ".xsact-ca-part-label{font-size:13px;color:var(--xs-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
          ".xsact-ca-part-change{font-size:11px;color:var(--xs-text-dim);white-space:nowrap;flex-shrink:0;}",
          ".xsact-ca-part-map{height:min(240px,42vh);min-height:160px;max-height:300px;border-radius:10px;border:1px solid var(--xs-border);background:var(--xs-panel-bg-2);padding:10px;display:flex;flex-direction:column;align-items:stretch;gap:6px;overflow:hidden;box-sizing:border-box;}",
          ".xsact-body-mini-svg{flex:1;min-height:0;width:100%;height:100%;overflow:visible;filter:var(--xs-zone-filter);}",
          ".xsact-body-mini-hint{font-size:11px;color:var(--xs-text-dim);text-align:center;padding:5px 8px;border-radius:6px;background:var(--xs-panel-bg);border:1px solid var(--xs-border);white-space:nowrap;flex-shrink:0;}",
          ".xsact-ca-part-map .xsact-body-part-zone{fill:var(--xs-zone-fill);stroke:var(--xs-zone-stroke);stroke-width:1.2;cursor:pointer;transition:fill .12s,stroke .12s,stroke-width .12s,filter .12s;pointer-events:all;vector-effect:non-scaling-stroke;}",
          ".xsact-ca-part-map .xsact-body-part-zone:hover,.xsact-ca-part-map .xsact-body-part-zone.hover{fill:var(--xs-zone-fill-hover);stroke:var(--xs-zone-stroke-hover);stroke-width:2.5;filter:drop-shadow(0 0 8px rgba(var(--xs-accent-rgb), 0.6));}",
          ".xsact-ca-part-map .xsact-body-part-zone.selected{fill:var(--xs-zone-fill-selected);stroke:var(--xs-zone-stroke-selected);stroke-width:2.5;filter:drop-shadow(0 0 10px rgba(var(--xs-accent-rgb), 0.55));}",
          ".xsact-ca-preview{padding:12px 14px;border-radius:9px;background:rgba(255,92,122,0.08);border:1px dashed rgba(255,92,122,0.35);color:var(--xs-text);font-size:13px;line-height:1.55;white-space:pre-line;}",
          ".xsact-ca-preview-label{display:block;font-size:10px;font-weight:600;color:var(--xs-accent-text);letter-spacing:0.04em;text-transform:uppercase;margin-bottom:6px;}",
          ".xsact-ca-editor .xsact-combo-actions{display:flex;gap:8px;margin-top:4px;}",
          ".xsact-ca-editor .xsact-combo-actions button{flex:1;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;border:none;color:var(--xs-text);transition:background .15s,transform .1s;}",
          ".xsact-ca-editor .xsact-combo-actions button:hover{transform:translateY(-1px);}",
          ".xsact-ca-editor .xsact-combo-save-btn{background:#46E0A0;color:#0B1F18;}",
          ".xsact-ca-editor .xsact-combo-save-btn:hover{background:#2FC989;}",
          ".xsact-ca-editor .xsact-combo-cancel-btn{background:var(--xs-border);color:var(--xs-text);}",
          ".xsact-ca-editor .xsact-combo-cancel-btn:hover{background:var(--xs-border-strong);}",
          ".xsact-ca-del-btn{background:rgba(255,92,92,0.14);color:#FF9C9C;}",
          ".xsact-ca-del-btn:hover{background:rgba(255,92,92,0.24);transform:translateY(-1px);}",
          ".xsact-ca-raw{display:none;}",
          ".xsact-ca-editor .xsact-ca-dialog-rich{min-height:54px;max-height:160px;line-height:1.5;white-space:pre-wrap;word-break:break-word;overflow:auto;outline:none;}",
          ".xsact-ca-editor .xsact-ca-dialog-rich:empty:before{content:attr(data-placeholder);color:var(--xs-text-dim);pointer-events:none;}",
          ".xsact-token-pill{display:inline-flex;align-items:center;background:rgba(255,92,122,0.18);border:1px solid rgba(255,92,122,0.45);color:#FFD6DF;border-radius:5px;padding:1px 5px;font-size:12px;line-height:1;cursor:default;user-select:none;-webkit-user-select:none;vertical-align:baseline;margin:0 2px;}",
          ".xsact-zwsp{display:inline;font-size:0;line-height:0;}",
          /* 底部操作栏 */
          ".xsact-qa-panel-footer{",
          "  display:flex;align-items:center;flex-wrap:wrap;gap:7px;padding:11px 12px;border-top:1px solid var(--xs-border);min-height:0;",
          "}",
          ".xsact-favorite-part-filter{display:flex;gap:5px;padding:7px 12px;border-top:1px solid var(--xs-border);border-bottom:1px solid var(--xs-border);overflow-x:auto;flex-shrink:0;scrollbar-width:thin;}",
          ".xsact-favorite-part-filter button{flex:0 0 auto;padding:5px 9px;border-radius:999px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);font-size:11px;cursor:pointer;}",
          ".xsact-favorite-part-filter button.active{border-color:var(--xs-accent);background:rgba(var(--xs-accent-rgb),.14);color:var(--xs-accent-text);}",
          ".xsact-qa-mini-btn{",
          "  background:var(--xs-btn-bg);border:1px solid var(--xs-border);",
          "  border-radius:8px;padding:8px 10px;font-size:12px;color:var(--xs-text-dim);cursor:pointer;",
          "  display:flex;align-items:center;justify-content:center;gap:6px;transition:background .15s,border-color .15s,color .15s,box-shadow .15s;",
          "}",
          ".xsact-qa-mini-btn:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}",
          ".xsact-header-icon-btn,#xsact-refresh-btn,#xsact-settings-btn,#xsact-exit-panel-btn{padding:0;width:28px;height:28px;flex:0 0 28px;}",
          ".xsact-settings{grid-column:1/-1;display:flex;flex-direction:column;gap:12px;}",
          ".xsact-settings-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid var(--xs-border);border-radius:9px;background:var(--xs-btn-bg);color:var(--xs-text);font-size:12px;}",
          ".xsact-settings-row select{min-width:120px;background:var(--xs-panel-bg);color:var(--xs-text);border:1px solid var(--xs-border);border-radius:7px;padding:6px 8px;}",
          ".xsact-switch{position:relative;display:inline-flex;width:42px;height:24px;flex:0 0 42px;}",
          ".xsact-switch input{position:absolute;opacity:0;pointer-events:none;}",
          ".xsact-switch-track{width:100%;height:100%;border-radius:999px;background:var(--xs-border-strong);box-shadow:inset 0 0 0 1px var(--xs-border);cursor:pointer;transition:background .18s,box-shadow .18s;}",
          '.xsact-switch-track::after{content:"";display:block;width:18px;height:18px;margin:3px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35);transition:transform .18s;}',
          ".xsact-switch input:checked+.xsact-switch-track{background:var(--xs-accent);box-shadow:inset 0 0 0 1px var(--xs-accent);}",
          ".xsact-switch input:checked+.xsact-switch-track::after{transform:translateX(18px);}",
          "#xsact-x3-btn{padding:8px 10px;min-width:34px;}",
          /* 语言切换下拉（自定义菜单，暗色战术台风格） */
          ".xsact-lang{position:relative;flex-shrink:0;}",
          ".xsact-lang-trigger{",
          "  display:flex;align-items:center;gap:5px;",
          "  background:var(--xs-btn-bg);border:1px solid var(--xs-border);",
          "  border-radius:8px;height:28px;padding:0 8px;cursor:pointer;",
          "  color:var(--xs-text-dim);font-size:11px;font-weight:600;letter-spacing:.03em;",
          "  transition:background .15s,border-color .15s,color .15s,box-shadow .15s;",
          "}",
          ".xsact-lang-trigger:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}",
          ".xsact-lang.open .xsact-lang-trigger,.xsact-lang-trigger:focus{outline:none;border-color:var(--xs-accent);color:var(--xs-text);box-shadow:0 0 0 2px rgba(var(--xs-accent-rgb),.18);}",
          ".xsact-lang-code{",
          "  display:inline-flex;align-items:center;justify-content:center;",
          "  min-width:22px;height:18px;padding:0 5px;border-radius:5px;",
          "  background:rgba(var(--xs-accent-rgb),.14);color:var(--xs-accent);",
          "  font-size:10px;font-weight:700;letter-spacing:.04em;",
          "}",
          ".xsact-lang-caret{font-size:9px;line-height:1;opacity:.7;transition:transform .18s ease;}",
          ".xsact-lang.open .xsact-lang-caret{transform:rotate(180deg);}",
          ".xsact-lang-menu{",
          "  position:absolute;top:calc(100% + 6px);right:0;z-index:120;",
          "  min-width:172px;padding:6px;display:none;flex-direction:column;gap:2px;",
          "  background:var(--xs-panel-bg);border:1px solid var(--xs-border-strong);",
          "  border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.42);",
          "  animation:xsact-lang-in .16s ease-out;",
          "}",
          ".xsact-lang.open .xsact-lang-menu{display:flex;}",
          "@keyframes xsact-lang-in{from{opacity:0;transform:translateY(-6px) scale(.98);}to{opacity:1;transform:none;}}",
          ".xsact-lang-item{",
          "  display:flex;align-items:center;gap:9px;",
          "  padding:7px 9px;border-radius:7px;cursor:pointer;",
          "  background:transparent;border:1px solid transparent;",
          "  color:var(--xs-text-dim);font-size:12px;text-align:left;",
          "  transition:background .12s,color .12s,border-color .12s;",
          "}",
          ".xsact-lang-item:hover{background:var(--xs-hover);color:var(--xs-text);}",
          ".xsact-lang-item .xsact-lang-item-code{",
          "  display:inline-flex;align-items:center;justify-content:center;",
          "  min-width:26px;height:20px;padding:0 5px;border-radius:5px;",
          "  background:var(--xs-btn-bg);border:1px solid var(--xs-border);",
          "  font-size:10px;font-weight:700;color:var(--xs-text-faint);letter-spacing:.03em;flex-shrink:0;",
          "}",
          ".xsact-lang-item .xsact-lang-item-native{flex:1;white-space:nowrap;}",
          ".xsact-lang-item .xsact-lang-check{font-size:11px;color:var(--xs-accent);opacity:0;flex-shrink:0;}",
          ".xsact-lang-item.active{background:rgba(var(--xs-accent-rgb),.10);border-color:rgba(var(--xs-accent-rgb),.3);color:var(--xs-text);}",
          ".xsact-lang-item.active .xsact-lang-item-code{background:rgba(var(--xs-accent-rgb),.18);color:var(--xs-accent);border-color:rgba(var(--xs-accent-rgb),.35);}",
          ".xsact-lang-item.active .xsact-lang-check{opacity:1;}",
          ".xsact-lang-item:focus{outline:none;background:var(--xs-hover);}",
          ".xsact-lang-item.active:focus{background:rgba(var(--xs-accent-rgb),.16);}",
          /* 版本号隐约显示（footer 右下，hover 才清晰） */
          ".xsact-toggle-pill{gap:5px;padding:8px 10px;}",
          ".xsact-toggle-pill .xsact-ico{width:14px;height:14px;stroke-width:2.2px;}",
          ".xsact-pill-dot{width:7px;height:7px;border-radius:50%;background:var(--xs-text-faint);border:1px solid var(--xs-border-strong);transition:background .15s,box-shadow .15s,border-color .15s;}",
          ".xsact-qa-mini-btn.on{color:#E8B339;border-color:rgba(232,179,57,0.6);background:rgba(232,179,57,0.12);box-shadow:0 0 10px rgba(232,179,57,0.12);}",
          ".xsact-toggle-pill.on .xsact-pill-dot{background:#E8B339;border-color:#E8B339;box-shadow:0 0 8px rgba(232,179,57,0.7);}",
          "#xsact-fav-btn.on{color:#E8B339;background:rgba(232,179,57,0.12);border-color:rgba(232,179,57,0.6);}",
          "#xsact-fav-btn.on .xsact-pill-dot{background:#E8B339;border-color:#E8B339;}",
          "#xsact-self-btn.on{color:#46E0A0;border-color:rgba(70,224,160,0.6);background:rgba(70,224,160,0.12);}",
          "#xsact-self-btn.on .xsact-pill-dot{background:#46E0A0;border-color:#46E0A0;box-shadow:0 0 8px rgba(70,224,160,0.7);}",
          ".xsact-qa-panel-content{",
          "  flex:1;position:relative;display:flex;flex-direction:column;min-width:0;",
          "  overflow:hidden;min-height:0;",
          "}",
          ".xsact-qa-panel-main{",
          "  flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;",
          "}",
          /* ===== 人物列表侧边触发按钮（左向小三角）===== */
          "#xsact-char-popover-tab{",
          "  position:absolute;left:-16px;top:50%;transform:translateY(-50%);",
          "  width:16px;height:56px;",
          "  display:flex;align-items:center;justify-content:center;",
          "  background:var(--xs-panel-bg);border:1px solid var(--xs-border);border-right:none;",
          "  border-radius:8px 0 0 8px;",
          "  color:var(--xs-text-dim);cursor:pointer;",
          "  z-index:90001;",
          "  box-shadow:-4px 0 14px rgba(0,0,0,0.22);",
          "  transition:all .15s ease;",
          "}",
          "#xsact-char-popover-tab:hover,",
          "#xsact-char-popover-tab.active{",
          "  color:var(--xs-accent);border-color:var(--xs-accent);",
          "  box-shadow:0 0 12px rgba(var(--xs-accent-rgb), 0.35), -4px 0 14px rgba(0,0,0,0.22);",
          "}",
          "#xsact-char-popover-tab .xsact-ico{width:10px;height:10px;}",
          /* 左右窗口联动桥接 */
          "#xsact-popover-connector{",
          "  display:none;position:absolute;left:-16px;top:50%;",
          "  width:16px;height:80px;transform:translateY(-50%);",
          "  background:linear-gradient(to right, rgba(var(--xs-accent-rgb),0.15), rgba(var(--xs-accent-rgb),0.55));",
          "  border-top:1px solid rgba(var(--xs-accent-rgb),0.55);",
          "  border-bottom:1px solid rgba(var(--xs-accent-rgb),0.55);",
          "  box-shadow:0 0 16px rgba(var(--xs-accent-rgb), 0.35);",
          "  z-index:90000;",
          "}",
          "#xsact-popover-connector::after{",
          '  content:"";position:absolute;left:5px;top:50%;transform:translateY(-50%);',
          "  width:0;height:0;",
          "  border-top:4px solid transparent;",
          "  border-bottom:4px solid transparent;",
          "  border-left:5px solid rgba(var(--xs-accent-rgb),0.85);",
          "}",
          "#xsact-qa-panel.popover-open #xsact-popover-connector{display:block;}",
          /* ===== 人物列表弹出层 ===== */
          ".xsact-char-popover{",
          "  position:absolute;left:-256px;top:46px;",
          "  width:min(260px,85vw);height:calc(100% - 64px);",
          "  display:flex;flex-direction:column;min-height:0;",
          "  background:var(--xs-panel-bg);",
          "  border:1px solid var(--xs-accent);border-radius:12px;",
          "  box-shadow:0 12px 40px rgba(0,0,0,0.45),0 0 0 1px rgba(var(--xs-accent-rgb), 0.08),0 0 24px rgba(var(--xs-accent-rgb), 0.10);",
          "  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);",
          "  z-index:10;overflow:hidden;",
          "  animation:xsact-popover-in .2s cubic-bezier(.16,1,.3,1);",
          "}",
          ".xsact-char-popover.right{",
          "  left:calc(100% + 16px);",
          "}",
          ".xsact-char-popover.show-back .xsact-char-popover-back{display:flex;}",
          ".xsact-char-popover-header{",
          "  display:flex;justify-content:space-between;align-items:center;gap:6px;",
          "  padding:10px 12px;border-bottom:1px solid var(--xs-border);",
          "  background:rgba(var(--xs-accent-rgb), 0.08);",
          "}",
          ".xsact-char-popover-back{",
          "  display:none;width:22px;height:22px;align-items:center;justify-content:center;",
          "  background:transparent;border:1px solid transparent;border-radius:6px;",
          "  color:var(--xs-text-dim);font-size:20px;line-height:1;cursor:pointer;",
          "  transition:all .15s ease;",
          "}",
          ".xsact-char-popover-back:hover{",
          "  background:var(--xs-hover);color:var(--xs-text);",
          "}",
          ".xsact-char-popover-title{",
          "  flex:1;font-size:13px;font-weight:600;color:var(--xs-accent-text);",
          "  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
          "}",
          ".xsact-char-popover-close{",
          "  width:22px;height:22px;display:flex;align-items:center;justify-content:center;",
          "  background:transparent;border:1px solid transparent;border-radius:6px;",
          "  color:var(--xs-text-dim);font-size:17px;line-height:1;cursor:pointer;",
          "  transition:all .15s ease;",
          "}",
          ".xsact-char-popover-close:hover{",
          "  background:rgba(255,92,92,0.12);border-color:rgba(255,92,92,0.4);color:#FFB3B3;",
          "}",
          ".xsact-char-popover-body{",
          "  flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;overscroll-behavior:contain;",
          "  display:flex;flex-direction:column;min-height:0;",
          "}",
          ".xsact-char-popover-body::-webkit-scrollbar{width:4px;}",
          ".xsact-char-popover-body::-webkit-scrollbar-track{background:transparent;}",
          ".xsact-char-popover-body::-webkit-scrollbar-thumb{background:var(--xs-scroll);border-radius:2px;}",
          ".xsact-char-popover-items{",
          "  flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;",
          "  padding:6px;",
          "}",
          ".xsact-char-popover-items::-webkit-scrollbar{width:4px;}",
          ".xsact-char-popover-items::-webkit-scrollbar-track{background:transparent;}",
          ".xsact-char-popover-items::-webkit-scrollbar-thumb{background:var(--xs-scroll);border-radius:2px;}",
          ".xsact-char-popover-empty{",
          "  padding:16px 10px;font-size:12px;color:var(--xs-text-faint);text-align:center;",
          "}",
          ".xsact-char-popover-item{",
          "  display:flex;align-items:center;gap:8px;",
          "  padding:9px 10px;margin-bottom:4px;",
          "  border-radius:8px;cursor:pointer;",
          "  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);",
          "  color:var(--xs-text-dim);font-size:12.5px;",
          "  transition:all .12s ease;",
          "}",
          ".xsact-char-popover-item:last-child{margin-bottom:0;}",
          ".xsact-char-popover-item:hover{",
          "  background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);",
          "  transform:translateX(3px);",
          "}",
          ".xsact-char-popover-item.selected{",
          "  background:rgba(var(--xs-accent-rgb), 0.14);border-color:var(--xs-accent);",
          "  color:var(--xs-accent-text);",
          "}",
          ".xsact-char-popover-item.self{",
          "  color:#46E0A0;border-color:rgba(70,224,160,0.25);",
          "}",
          ".xsact-char-popover-item.self:hover{",
          "  background:rgba(70,224,160,0.08);border-color:rgba(70,224,160,0.5);color:#CFFAE8;",
          "}",
          ".xsact-char-popover-item.self.selected{",
          "  background:rgba(70,224,160,0.14);border-color:#46E0A0;color:#46E0A0;",
          "}",
          ".xsact-char-popover-name{",
          "  flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
          "}",
          ".xsact-char-popover-self{",
          "  flex-shrink:0;font-size:9px;padding:2px 5px;border-radius:4px;",
          "  background:rgba(70,224,160,0.15);color:#46E0A0;",
          "}",
          "@keyframes xsact-popover-in{",
          "  from{opacity:0;transform:translateY(-8px) scale(.96);}",
          "  to{opacity:1;transform:translateY(0) scale(1);}",
          "}",
          /* ===== 人物部位选择（BC 原生矩形 Zone 地图）===== */
          ".xsact-body-select{",
          "  flex:1;display:flex;flex-direction:column;align-items:stretch;min-height:0;",
          "  min-height:0;padding:6px 4px 0;gap:6px;overflow:hidden;",
          "}",
          ".xsact-body-svg{",
          "  flex:1;min-height:0;width:100%;height:100%;",
          "  align-self:center;overflow:visible;",
          "  filter:var(--xs-zone-filter);",
          "}",
          /* 矩形热区：主题感知描边；light 下深灰/玫红，dark 下保持白色霓虹 */
          ".xsact-body-part-zone{",
          "  fill:var(--xs-zone-fill);",
          "  stroke:var(--xs-zone-stroke);stroke-width:1.2;",
          "  cursor:pointer;transition:fill .12s,stroke .12s,stroke-width .12s,filter .12s;",
          "  pointer-events:all;vector-effect:non-scaling-stroke;",
          "}",
          ".xsact-body-part-zone:hover,.xsact-body-part-zone.hover{",
          "  fill:var(--xs-zone-fill-hover);stroke:var(--xs-zone-stroke-hover);stroke-width:2.5;",
          "  filter:drop-shadow(0 0 8px rgba(var(--xs-accent-rgb), 0.6));",
          "}",
          ".xsact-body-part-zone.selected{",
          "  fill:var(--xs-zone-fill-selected);",
          "  stroke:var(--xs-zone-stroke-selected);stroke-width:2.5;",
          "  filter:drop-shadow(0 0 10px rgba(var(--xs-accent-rgb), 0.55));",
          "}",
          ".xsact-body-part-hint{",
          "  font-size:12px;color:var(--xs-text-dim);text-align:center;",
          "  padding:6px 10px;border-radius:6px;background:var(--xs-panel-bg-2);",
          "  border:1px solid var(--xs-border);white-space:nowrap;",
          "}",
          /* 预设栏 */
          ".xsact-qa-panel-body.fav-active .xsact-action-btn:hover{",
          "  border-style:dashed;border-color:rgba(232,179,57,0.7);",
          "}",
          ".xsact-qa-state.presets-bar{grid-column:1 / -1;padding:6px 12px 10px;display:flex;flex-wrap:wrap;gap:4px;}",
          ".xsact-resize-handle{",
          "  position:absolute;right:4px;bottom:4px;width:18px;height:18px;",
          "  display:flex;align-items:flex-end;justify-content:flex-end;",
          "  color:var(--xs-text-faint);cursor:nwse-resize;z-index:10;transition:color .15s;",
          "  pointer-events:auto;",
          "}",
          ".xsact-resize-handle:hover{color:var(--xs-accent);}",
          ".xsact-resize-handle.resizing{color:var(--xs-accent);}",
          ".xsact-resize-handle .xsact-ico{width:14px;height:14px;}",
          /* ===== 浮动身体网格（霓虹线框，按 BC 原生 Zone 定位） ===== */
          ".xsact-body-grid{",
          "  position:absolute;z-index:89999;pointer-events:none;",
          "  background:transparent !important;",
          "}",
          ".xsact-part-btn{",
          "  position:absolute;z-index:1;padding:0;margin:0;",
          "  background:transparent;color:transparent;font-size:0;border:none;",
          "  cursor:pointer;transition:box-shadow 0.12s ease;box-sizing:border-box;",
          "  pointer-events:auto;",
          "  box-shadow:inset 0 0 0 2px rgba(77,248,255,0.55),",
          "             0 0 6px rgba(77,248,255,0.18);",
          "}",
          ".xsact-part-btn:hover{",
          "  box-shadow:inset 0 0 0 3px rgba(77,248,255,1),",
          "             0 0 18px rgba(77,248,255,0.6),0 0 36px rgba(77,248,255,0.2);",
          "}",
          ".xsact-part-btn.active{",
          "  box-shadow:inset 0 0 0 3.5px rgba(255,51,102,1),",
          "             0 0 22px rgba(255,51,102,0.75),0 0 44px rgba(255,51,102,0.35),",
          "             inset 0 0 24px rgba(255,51,102,0.12);",
          "}",
          ".xsact-part-btn.active:hover{",
          "  box-shadow:inset 0 0 0 4.5px #FF3366,",
          "             0 0 30px rgba(255,51,102,1),0 0 60px rgba(255,51,102,0.45);",
          "}",
          /* 自己模式：给玩家自己的身体线框加个绿色边框提示 */
          ".xsact-body-grid.self .xsact-part-btn{",
          "  box-shadow:inset 0 0 0 2px rgba(70,224,160,0.65),",
          "             0 0 6px rgba(70,224,160,0.25);",
          "}",
          ".xsact-body-grid.self .xsact-part-btn:hover{",
          "  box-shadow:inset 0 0 0 3px rgba(70,224,160,1),",
          "             0 0 18px rgba(70,224,160,0.55),0 0 36px rgba(70,224,160,0.25);",
          "}",
          /* ===== 滚动条 ===== */
          ".xsact-qa-panel-body::-webkit-scrollbar{width:6px;}",
          ".xsact-qa-panel-body::-webkit-scrollbar-track{background:transparent;}",
          ".xsact-qa-panel-body::-webkit-scrollbar-thumb{background:var(--xs-scroll);border-radius:3px;}",
          /* ===== 容器查询：面板内容按实际宽度自适应 ===== */
          "@container xsact-body (max-width: 180px){",
          ".xsact-qa-panel-body{grid-template-columns:1fr;}",
          ".xsact-action-btn{padding:10px 9px;font-size:11.5px;}",
          "}",
          "@container xsact-body (min-width: 181px) and (max-width: 280px){",
          ".xsact-qa-panel-body{grid-template-columns:repeat(2,1fr);}",
          "}",
          "@container xsact-body (min-width: 281px){",
          ".xsact-qa-panel-body{grid-template-columns:repeat(auto-fill, minmax(108px, 1fr));}",
          "}",
          "@container xsact-panel (max-width: 280px){",
          ".xsact-qa-panel-footer .xsact-qa-mini-btn span:not(.xsact-pill-dot){display:none;}",
          ".xsact-qa-panel-footer .xsact-qa-mini-btn{flex:0 0 36px;padding:6px;}",
          ".xsact-qa-mode-tabs .xsact-mode-tab>span:not(.xsact-custom-tab-main){display:none;}",
          ".xsact-qa-mode-tabs .xsact-custom-tab-label{display:none;}",
          ".xsact-mode-tab .xsact-ico{width:16px;height:16px;}",
          "}",
          "@container xsact-panel (max-width: 240px){",
          ".xsact-panel-head-actions button:not(#xsact-refresh-btn):not(#xsact-settings-btn):not(#xsact-exit-panel-btn){display:none;}",
          "}",
          /* ===== 主题色切换过渡 ===== */
          "#xsact-qa-panel,#xsact-toggle-btn{",
          "  transition:background-color .3s ease,border-color .3s ease,color .3s ease,box-shadow .3s ease;",
          "}",
          "#xsact-qa-panel{animation:xsact-pop-in .28s cubic-bezier(.16,1,.3,1);}",
          /* ===== 过渡动画 ===== */
          "@keyframes xsact-pop-in{from{opacity:0;transform:translateY(-8px) scale(.98);}to{opacity:1;transform:none;}}",
          "@keyframes xsact-fade-in{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}",
          ".xsact-action-btn,.xsact-combo-card{animation:xsact-fade-in .22s ease both;}",
          /* 主题切换按钮图标显隐 */
          "#xsact-theme-btn .xsact-theme-icon{display:none;}",
          '[data-xsact-theme="dark"] #xsact-theme-btn .sun{display:block;}',
          '[data-xsact-theme="light"] #xsact-theme-btn .moon{display:block;}',
          /* ===== 视口断点适配（手机/平板/笔记本/大屏） ===== */
          "@media (max-width: 480px){",
          "#xsact-qa-panel{",
          "width:92vw;height:88vh;top:6vh;right:4vw;left:auto;bottom:auto;",
          "min-width:200px;min-height:260px;max-width:98vw;max-height:94vh;",
          "}",
          "#xsact-qa-panel.popover-open #xsact-popover-connector{display:none;}",
          "#xsact-char-popover-tab{display:none;}",
          ".xsact-char-popover,",
          ".xsact-char-popover.right{",
          "position:absolute;left:0;top:0;width:100%;height:100%;border-radius:14px;",
          "border-color:var(--xs-accent);animation:xsact-popover-in .2s cubic-bezier(.16,1,.3,1);",
          "}",
          ".xsact-qa-panel-header{padding:12px 14px;}",
          "#xsact-panel-title{font-size:14px;}",
          ".xsact-qa-mode-tabs{padding:10px 14px;}",
          ".xsact-mode-tab{padding:12px 10px;font-size:13px;}",
          ".xsact-qa-panel-body{padding:12px 14px;gap:8px;}",
          ".xsact-action-btn{padding:14px 12px;font-size:14px;}",
          ".xsact-qa-panel-footer{padding:10px 14px;gap:8px;}",
          ".xsact-qa-mini-btn{flex:1 1 0;min-height:44px;padding:10px 8px;font-size:13px;}",
          ".xsact-body-select{padding:8px 6px;}",
          ".xsact-body-part-hint{font-size:13px;}",
          "}",
          "@media (min-width: 481px) and (max-width: 768px){",
          "#xsact-qa-panel{width:min(340px,90vw);height:min(640px,86vh);}",
          ".xsact-action-btn{padding:11px 12px;font-size:13px;}",
          "}",
          "@media (min-width: 769px) and (max-width: 1200px){",
          "#xsact-qa-panel{width:min(360px,40vw);height:min(680px,84vh);}",
          "}",
          "@media (min-width: 1201px){",
          "#xsact-qa-panel{width:min(380px,30vw);height:min(720px,82vh);}",
          "}",
          "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi){",
          ".xsact-qa-panel-header,.xsact-qa-panel-footer,.xsact-action-btn,.xsact-char-popover-item{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}",
          "}",
          /* ===== light 主题下高对比文字修正 ===== */
          '[data-xsact-theme="light"] .xsact-action-btn.fav{ color:#7D5A10; }',
          '[data-xsact-theme="light"] .xsact-action-btn.fav:hover{ color:#5C4508; }',
          '[data-xsact-theme="light"] .xsact-add-to-combo{ color:#1B7A5C; }',
          '[data-xsact-theme="light"] .xsact-add-to-combo:hover{ color:#0F5C44; }',
          '[data-xsact-theme="light"] #xsact-self-btn.on{ color:#1B7A5C; }',
          '[data-xsact-theme="light"] .xsact-char-popover-item.self{ color:#1B7A5C; }',
          '[data-xsact-theme="light"] .xsact-char-popover-item.self:hover{ color:#0F5C44; }',
          '[data-xsact-theme="light"] .xsact-char-popover-item.self.selected{ color:#1B7A5C; }',
          /* ── 更新 / 公告横幅 ── */
          ".xsact-update-banner{",
          "  margin:8px 10px 0;border:1px solid var(--xs-accent, rgba(255,92,122,0.6));border-radius:10px;",
          "  background:linear-gradient(180deg, rgba(255,92,122,0.14), rgba(255,92,122,0.06));",
          "  padding:8px 10px;font-size:12px;color:var(--xs-text);box-shadow:0 4px 14px rgba(0,0,0,0.25);",
          "}",
          ".xsact-update-banner.is-announce{",
          "  border-color:rgba(120,180,255,0.55);background:linear-gradient(180deg, rgba(120,180,255,0.14), rgba(120,180,255,0.05));",
          "}",
          ".xsact-update-banner.is-important{",
          "  border-color:#ffcf5c;background:linear-gradient(180deg, rgba(255,207,92,0.16), rgba(255,207,92,0.06));",
          "}",
          ".xsact-update-banner.is-available{",
          "  border-color:var(--xs-accent, rgba(255,92,122,0.6));background:linear-gradient(180deg, rgba(255,92,122,0.14), rgba(255,92,122,0.06));",
          "}",
          ".xsact-update-banner.is-available .xsact-ub-tag{color:var(--xs-accent, #FF5C7A);}",
          ".xsact-ub-head{display:flex;align-items:center;gap:6px;margin-bottom:4px;}",
          ".xsact-ub-tag{font-weight:700;letter-spacing:.04em;color:var(--xs-accent, #FF5C7A);}",
          ".xsact-update-banner.is-announce .xsact-ub-tag{color:#7ab8ff;}",
          ".xsact-ub-ver{font-weight:700;}",
          ".xsact-ub-title{font-weight:600;}",
          ".xsact-ub-close{margin-left:auto;background:none;border:none;color:var(--xs-text-dim);font-size:16px;line-height:1;cursor:pointer;padding:0 4px;}",
          ".xsact-ub-close:hover{color:var(--xs-text);}",
          ".xsact-ub-sum{margin:2px 0 6px;padding-left:16px;color:var(--xs-text-dim);}",
          ".xsact-ub-sum li{margin:1px 0;}",
          ".xsact-ub-msg{margin:2px 0 6px;color:var(--xs-text-dim);line-height:1.4;white-space:pre-line;}",
          ".xsact-ub-actions{display:flex;gap:6px;flex-wrap:wrap;}",
          ".xsact-ub-btn{background:var(--xs-btn-bg, rgba(255,255,255,0.08));border:1px solid var(--xs-border, rgba(255,255,255,0.12));",
          "  color:var(--xs-text);border-radius:7px;padding:4px 9px;font-size:12px;cursor:pointer;}",
          ".xsact-ub-btn:hover{background:var(--xs-hover, rgba(255,255,255,0.14));}",
          ".xsact-ub-primary{background:var(--xs-accent, #FF5C7A);border-color:transparent;color:#fff;font-weight:600;}",
          ".xsact-ub-primary:hover{filter:brightness(1.08);}",
          "@media (max-width:480px){",
          "  .xsact-update-banner{font-size:11px;}",
          "}",
          /* ===== 自定义 tooltip（替换原生 title：统一风格 / 视口翻转 / 短延迟） ===== */
          ".xsact-tooltip{",
          "  position:fixed;z-index:100001;max-width:240px;",
          "  padding:6px 10px;border-radius:9px;",
          "  background:var(--xs-panel-bg);color:var(--xs-text);",
          "  font-size:12px;line-height:1.45;white-space:normal;",
          "  border:1px solid var(--xs-border-strong);",
          "  box-shadow:0 6px 20px var(--xs-shadow);",
          "  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);",
          "  pointer-events:none;opacity:0;transform:translateY(3px);",
          "  transition:opacity .12s ease,transform .12s ease;",
          "}",
          ".xsact-tooltip.show{opacity:1;transform:translateY(0);}",
          ".xsact-tooltip .xsact-tt-title{font-weight:600;}",
          ".xsact-tooltip .xsact-tt-sub{display:block;margin-top:2px;color:var(--xs-text-dim);font-size:11px;line-height:1.4;}",
          ".xsact-tooltip.is-danger{border-color:#ff6b6b;box-shadow:0 6px 20px var(--xs-shadow),0 0 0 1px rgba(255,107,107,0.25);}",
          ".xsact-tooltip.is-danger .xsact-tt-sub{color:#ffb3b3;}",
          /* ── 小酥动作包：内置动作开关（预编译，无需原版插件） ── */
          ".xsact-ca-xiaosu{margin-top:2px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border-radius:8px;background:var(--xs-card-bg);border:1px solid var(--xs-border);}",
          ".xsact-ca-xiaosu-label{font-size:12px;color:var(--xs-text);font-weight:500;line-height:1;cursor:help;}",
          ".xsact-ca-xiaosu-switch .xsact-ca-toggle-track{width:28px;height:15px;}",
          ".xsact-ca-xiaosu-switch .xsact-ca-toggle-track::before{width:11px;height:11px;}",
          ".xsact-ca-xiaosu-switch input:checked + .xsact-ca-toggle-track::before{transform:translateX(13px);}",
          ".xsact-ca-toggle.is-disabled{opacity:.55;cursor:not-allowed;}",
          /* ── 统一确认模态（暗色玫红，替代浏览器原生 confirm） ── */
          ".xsact-confirm{position:fixed;inset:0;z-index:1000001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:xsact-confirm-fade .15s ease-out;}",
          "@keyframes xsact-confirm-fade{from{opacity:0;}to{opacity:1;}}",
          "@keyframes xsact-confirm-pop{from{opacity:0;transform:translateY(-6px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}",
          ".xsact-confirm-box{width:min(380px,90vw);padding:20px 22px 16px;border-radius:12px;background:var(--xs-panel-bg);border:1px solid rgba(255,92,122,0.35);box-shadow:0 18px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,92,122,0.12);animation:xsact-confirm-pop .18s cubic-bezier(.16,1,.3,1);}",
          ".xsact-confirm-title{font-size:14px;font-weight:600;color:#FFB3C6;margin-bottom:8px;line-height:1.4;}",
          ".xsact-confirm-body{font-size:13px;line-height:1.65;color:var(--xs-text-dim);white-space:pre-wrap;word-break:break-word;}",
          ".xsact-confirm-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:18px;}",
          ".xsact-confirm-btn{padding:7px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:background .15s,border-color .15s,color .15s;}",
          ".xsact-confirm-cancel{background:rgba(255,255,255,0.04);border-color:var(--xs-border);color:var(--xs-text-dim);}",
          ".xsact-confirm-cancel:hover{background:rgba(255,255,255,0.08);color:var(--xs-text);border-color:var(--xs-border-strong);}",
          ".xsact-confirm-ok{background:rgba(255,92,122,0.20);border-color:rgba(255,92,122,0.5);color:#FFB3C6;}",
          ".xsact-confirm-ok:hover{background:rgba(255,92,122,0.32);border-color:#FF5C7A;color:#fff;}",
          ".xsact-confirm-ok.is-danger{background:rgba(255,92,122,0.28);border-color:rgba(255,92,122,0.6);}"
        ].join("\n");
        document.head.appendChild(css);
      }
      var XSACT_ACTIVITY_ICON = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#FF5C7A"/><path d="M13 6l-5 7h4l-1 5 6-8h-4z" fill="#ffffff"/></svg>'
      );
      function initTooltip() {
        if (window.__qiactTooltipReady) return;
        window.__qiactTooltipReady = true;
        var tip = document.createElement("div");
        tip.className = "xsact-tooltip";
        tip.setAttribute("role", "tooltip");
        tip.style.visibility = "hidden";
        document.body.appendChild(tip);
        var currentEl = null;
        var showTimer = null;
        var SHOW_DELAY = 120;
        function isPluginTip(el) {
          return !!(el && el.closest && el.closest("#xsact-qa-panel, #xsact-toggle-btn, .xsact-update-banner"));
        }
        function getText(el) {
          var dt = el.getAttribute("data-tooltip");
          if (dt && dt.trim()) return dt;
          var t = el.getAttribute("title");
          return t && t.trim() ? t : "";
        }
        function render(el) {
          var raw = getText(el);
          if (!raw) {
            tip.innerHTML = "";
            return;
          }
          var type = el.getAttribute("data-tooltip-type");
          tip.className = "xsact-tooltip" + (type ? " is-" + type : "");
          var parts = raw.split("@@");
          var html = '<span class="xsact-tt-title">' + escapeHtml(parts[0]) + "</span>";
          if (parts[1]) html += '<span class="xsact-tt-sub">' + escapeHtml(parts[1]) + "</span>";
          tip.innerHTML = html;
        }
        function position(el) {
          var r = el.getBoundingClientRect();
          var tr = tip.getBoundingClientRect();
          var gap = 8;
          var top = r.top - tr.height - gap;
          var left = r.left + r.width / 2 - tr.width / 2;
          if (top < 4) top = r.bottom + gap;
          if (left < 4) left = 4;
          if (left + tr.width > window.innerWidth - 4) left = window.innerWidth - tr.width - 4;
          if (top + tr.height > window.innerHeight - 4) top = window.innerHeight - tr.height - 4;
          tip.style.top = top + "px";
          tip.style.left = left + "px";
        }
        function show(el) {
          if (!isPluginTip(el)) return;
          var raw = getText(el);
          if (!raw) return;
          render(el);
          if (el.getAttribute("title") && el.getAttribute("title").trim() !== "") {
            el.__xsTitle = el.getAttribute("title");
            el.setAttribute("title", " ");
          }
          position(el);
          tip.style.visibility = "visible";
          void tip.offsetWidth;
          tip.classList.add("show");
          currentEl = el;
        }
        function hide() {
          if (showTimer) {
            clearTimeout(showTimer);
            showTimer = null;
          }
          tip.classList.remove("show");
          tip.style.visibility = "hidden";
          if (currentEl && currentEl.__xsTitle != null) {
            if (!currentEl.getAttribute("title") || currentEl.getAttribute("title").trim() === "") {
              currentEl.setAttribute("title", currentEl.__xsTitle);
            }
            currentEl.__xsTitle = null;
          }
          currentEl = null;
        }
        addRuntimeListener(document, "mouseover", function(e) {
          if (!e.target || !e.target.closest) return;
          var el = e.target.closest("[data-tooltip],[title]");
          if (el && isPluginTip(el)) {
            if (showTimer) {
              clearTimeout(showTimer);
              showTimer = null;
            }
            if (el !== currentEl) {
              if (currentEl) hide();
              showTimer = setTimeout(function() {
                show(el);
              }, SHOW_DELAY);
            }
          } else if (currentEl) {
            hide();
          }
        });
        addRuntimeListener(document, "mouseout", function(e) {
          if (showTimer) {
            clearTimeout(showTimer);
            showTimer = null;
          }
          var to = e.relatedTarget;
          if (!to || !to.closest) {
            hide();
            return;
          }
          var el = to.closest("[data-tooltip],[title]");
          if (!el || !isPluginTip(el)) hide();
        });
        addRuntimeListener(window, "scroll", function() {
          if (currentEl) hide();
        }, true);
        addRuntimeCleanup(function() {
          if (showTimer) clearTimeout(showTimer);
          if (tip && tip.parentNode) tip.parentNode.removeChild(tip);
          delete window.__qiactTooltipReady;
        });
      }
      function setupHooks() {
        if (!state.modApi) return;
        try {
          state.modApi.hookFunction("ActivityAllowedForGroup", 0, function(args, next) {
            var result = next(args);
            if (!state.echoSuppressed || state.echoSuppressed.size === 0 || !Array.isArray(result)) return result;
            return result.filter(function(item) {
              var nm = item && item.Activity && item.Activity.Name || item && item.Name;
              return !caIsEchoSuppressed(nm);
            });
          });
        } catch (e) {
          console.warn("[QiAct] ActivityAllowedForGroup hook 失败:", e.message);
        }
        try {
          state.modApi.hookFunction("AssetAllActivities", 0, function(args, next) {
            var result = next(args);
            if (!state.echoSuppressed || state.echoSuppressed.size === 0 || !Array.isArray(result)) return result;
            try {
              return result.filter(function(a) {
                return !caIsEchoSuppressed(a && a.Name);
              });
            } catch (e) {
              return result;
            }
          });
        } catch (e) {
          console.warn("[QiAct] AssetAllActivities hook 失败:", e.message);
        }
        try {
          state.modApi.hookFunction("DrawCharacter", 1, function(args, next) {
            var r = next(args);
            try {
              var C = args[0], X = args[1], Y = args[2], Zoom = args[3];
              if (C && C.MemberNumber != null && typeof X === "number" && typeof CurrentScreen !== "undefined" && CurrentScreen === "ChatRoom") {
                state.charAnchor[C.MemberNumber] = { x: X, y: Y, zoom: Zoom, t: Date.now() };
              }
            } catch (e) {
              reportHookError("DrawCharacter锚点", e);
            }
            return r;
          });
        } catch (e) {
          console.warn("[QiAct] DrawCharacter 锚点 hook 失败:", e.message);
        }
        state.modApi.hookFunction("DrawProcess", 4, function(args, next) {
          var result = next(args);
          try {
            if (typeof CurrentScreen !== "undefined") {
              if (CurrentScreen === "ChatRoom") {
                drawToggleButton();
              } else if (state.toggleBtnEl) {
                state.toggleBtnEl.style.display = "none";
              }
            }
          } catch (e) {
            reportHookError("DrawProcess", e);
          }
          return result;
        });
        try {
          addRuntimeListener(window, "resize", function() {
            refreshCanvasCache();
          });
        } catch (_) {
        }
        state.modApi.hookFunction("ChatRoomClick", 4, function(args, next) {
          return next(args);
        });
        state.modApi.hookFunction("ActivityRun", 0, function(args, next) {
          try {
            var sourceChar = args[0];
            var targetChar = args[1];
            var group = args[2];
            var itemActivity = args[3] || {};
            var actName = itemActivity.Activity && itemActivity.Activity.Name || "";
            if (targetChar && actName) {
              state.lastAction = {
                name: actName,
                targetMN: targetChar.MemberNumber,
                part: group && group.Name || state.selectedPart || "",
                time: Date.now()
              };
              saveStorage(S_LAST, state.lastAction);
            }
          } catch (e) {
            console.warn("[QiAct] ActivityRun hook 记录失败:", e.message);
          }
          next(args);
        });
        state.modApi.hookFunction("ChatRoomMenuDraw", 0, function(args, next) {
          var result = next(args);
          if (state.isActive) updateGridPositions();
          return result;
        });
        addRuntimeListener(document, "keydown", function(e) {
          if (e.key === "Escape" && state.isActive) {
            e.preventDefault();
            e.stopPropagation();
            toggleActionMode();
          }
        });
        function startRefreshTimer() {
          stopRefreshTimer();
          state.refreshInterval = runtime && runtime.interval ? runtime.interval(function() {
            if (state.isActive) updateGridPositions();
          }, 3e3) : setInterval(function() {
            if (state.isActive) updateGridPositions();
          }, 3e3);
        }
        function stopRefreshTimer() {
          if (state.refreshInterval) {
            clearInterval(state.refreshInterval);
            state.refreshInterval = null;
          }
        }
        state.modApi.hookFunction("ServerSend", 0, function(args, next) {
          var data = args[0];
          if (data && (data.Type === "Action" || data.Type === "Activity")) {
            setTimeout(function() {
              if (state.isActive) refreshBodyGrids();
            }, 500);
          }
          return next(args);
        });
        try {
          state.modApi.hookFunction("ActivityRun", -100, function(args, next) {
            try {
              var _item = args[3] || {};
              var _name = _item.Activity && _item.Activity.Name || "";
              var _send = args[4];
              if (_send !== false && typeof _name === "string" && _name.indexOf(CA_PREFIX) === 0) {
                var _ca = caFindByActivityName(_name);
                if (_ca) {
                  var _acted = args[1];
                  try {
                    args[4] = false;
                    next(args);
                  } catch (e) {
                    console.warn("[QiAct] 原生点击本地副作用失败:", e.message);
                  }
                  var _packet = makeActivityPacket(_acted, _ca.group, _name, _item.Item || null);
                  if (_packet) {
                    var _prev = _acted ? _acted.FocusGroup : void 0;
                    var _fg = typeof AssetGroup !== "undefined" && Array.isArray(AssetGroup) ? AssetGroup.find(function(g) {
                      return g && g.Name === _ca.group;
                    }) : null;
                    try {
                      if (_acted) _acted.FocusGroup = _fg || { Name: _ca.group };
                      if (typeof ServerSend === "function") ServerSend("ChatRoomChat", _packet);
                    } finally {
                      if (_acted) _acted.FocusGroup = _prev;
                    }
                  }
                  return;
                }
              }
            } catch (e) {
              console.warn("[QiAct] 原生点击拦截异常，回退 BC 默认:", e.message);
            }
            return next(args);
          });
        } catch (e) {
          console.warn("[QiAct] ActivityRun 原生点击拦截 hook 失败:", e.message);
        }
        try {
          state.modApi.hookFunction("ElementButton.CreateForActivity", 0, function(args, next) {
            var _ia = args[1] || {};
            var _n = _ia.Activity && _ia.Activity.Name || "";
            if (typeof _n === "string" && _n.indexOf(CA_PREFIX) === 0) {
              if (!args[4] || typeof args[4] !== "object") args[4] = {};
              args[4].image = XSACT_ACTIVITY_ICON;
            }
            return next(args);
          });
        } catch (e) {
          console.warn("[QiAct] ElementButton 图标 hook 失败:", e.message);
        }
        var _baseEnter = enterActionMode;
        enterActionMode = function() {
          _baseEnter();
          startRefreshTimer();
        };
        var _baseExit = exitActionMode;
        exitActionMode = function() {
          _baseExit();
          stopRefreshTimer();
        };
      }
      function updateGridPositions() {
        refreshCanvasCache();
        var layout = getCharLayout();
        if (layout.length !== state.lastLayoutCount) {
          state.lastLayoutCount = layout.length;
          refreshBodyGrids();
          return;
        }
        var shifts = computeOverlapShifts(layout);
        layout.forEach(function(entry) {
          entry.overlapShift = shifts.get(entry.char.MemberNumber) || 0;
          var grid = state.bodyGrids.get(entry.char);
          if (grid) positionGrid(grid, entry);
        });
      }
      const VERSION_INFO_URL = "https://bondage-studio.github.io/QuickInteraction/version.json";
      const VERSION_INFO_FALLBACK = "https://raw.githubusercontent.com/bondage-studio/QuickInteraction/main/version.json";
      const UPDATE_INTERVAL = 5 * 60 * 1e3;
      const UPDATE_FIRST_DELAY = 3e4;
      const UPDATE_MAX_RETRY = 3;
      const UPDATE_FETCH_TIMEOUT = 8e3;
      function compareVersion(a, b) {
        var pa = String(a || "").split(".").map(function(x) {
          return parseInt(x, 10) || 0;
        });
        var pb = String(b || "").split(".").map(function(x) {
          return parseInt(x, 10) || 0;
        });
        var len = Math.max(pa.length, pb.length);
        for (var i = 0; i < len; i++) {
          var va = pa[i] || 0, vb = pb[i] || 0;
          if (va > vb) return 1;
          if (va < vb) return -1;
        }
        return 0;
      }
      function logUpdateError(entry) {
        var where = entry.kind === "http" ? "HTTP " + entry.status : entry.kind === "parse" ? QiActT("update.parse_err") : QiActT("update.net_err");
        console.error("[QiAct] 更新检查失败（第 " + entry.attempt + " 次）[" + where + "] " + (entry.message || "") + (entry.url ? " @ " + entry.url : ""));
        try {
          var log = [];
          try {
            log = JSON.parse(loadSetting(S_UPDATE_ERROR_LOG, "[]")) || [];
          } catch (_) {
            log = [];
          }
          if (!Array.isArray(log)) log = [];
          log.push({
            ts: Date.now(),
            attempt: entry.attempt,
            kind: entry.kind,
            status: entry.status || null,
            url: entry.url || null,
            message: String(entry.message || "").slice(0, 200)
          });
          if (log.length > 10) log = log.slice(-10);
          persist(S_UPDATE_ERROR_LOG, JSON.stringify(log));
        } catch (_) {
        }
      }
      function clearUpdateErrorLog() {
        try {
          persist(S_UPDATE_ERROR_LOG, "[]");
        } catch (_) {
        }
      }
      function getUpdateErrorLog() {
        try {
          var l = JSON.parse(loadSetting(S_UPDATE_ERROR_LOG, "[]"));
          return Array.isArray(l) ? l : [];
        } catch (_) {
          return [];
        }
      }
      async function fetchVersionJson(url, attempt) {
        var ctrl = "AbortController" in window ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function() {
          ctrl.abort();
        }, UPDATE_FETCH_TIMEOUT) : null;
        try {
          var sep = url.indexOf("?") >= 0 ? "&" : "?";
          var res = await fetch(url + sep + "t=" + Date.now(), ctrl ? { cache: "no-store", signal: ctrl.signal } : { cache: "no-store" });
          if (!res.ok) {
            var he = new Error("HTTP " + res.status);
            he.kind = "http";
            he.status = res.status;
            he.url = url;
            he.attempt = attempt;
            throw he;
          }
          var text = await res.text();
          try {
            return JSON.parse(text);
          } catch (pe) {
            var pe2 = new Error(QiActT("update.json_parse_err", { msg: pe.message }));
            pe2.kind = "parse";
            pe2.status = res.status;
            pe2.url = url;
            pe2.attempt = attempt;
            throw pe2;
          }
        } finally {
          if (timer) clearTimeout(timer);
        }
      }
      async function fetchWithFallback(attempt) {
        var sources = [VERSION_INFO_URL, VERSION_INFO_FALLBACK];
        var lastErr = null;
        for (var i = 0; i < sources.length; i++) {
          try {
            return await fetchVersionJson(sources[i], attempt);
          } catch (e) {
            lastErr = e;
            logUpdateError({ kind: e.kind || "network", status: e.status, url: e.url || sources[i], message: e.message, attempt });
          }
        }
        throw lastErr;
      }
      async function checkUpdate() {
        for (var attempt = 1; attempt <= UPDATE_MAX_RETRY; attempt++) {
          try {
            var info = await fetchWithFallback(attempt);
            clearUpdateErrorLog();
            handleVersionInfo(info);
            return true;
          } catch (e) {
            if (attempt < UPDATE_MAX_RETRY) {
              await new Promise(function(r) {
                setTimeout(r, 1e3 * attempt);
              });
              continue;
            }
            console.warn("[QiAct] 更新检查连续 " + UPDATE_MAX_RETRY + " 次失败，错误已记录；下个周期（" + Math.round(UPDATE_INTERVAL / 6e4) + " 分钟）将自动重试");
            return false;
          }
        }
        return false;
      }
      function handleVersionInfo(info) {
        if (!info || !info.version) return;
        if (compareVersion(info.version, VERSION) > 0) {
          var dismissed = loadSetting(S_UPDATE_DISMISSED, "");
          if (dismissed !== info.version) showUpdateBanner(info);
        }
        if (info.announcement && info.announcement.id) {
          var seen = loadSetting(S_LAST_ANNOUNCE, "");
          var seenVer = loadSetting(S_LAST_ANNOUNCE_VER, "");
          var hasNewVersion = compareVersion(info.version, VERSION) > 0;
          if (info.announcement.id !== seen || hasNewVersion && seenVer !== info.version) {
            showAnnounceBanner(info.announcement);
            persist(S_LAST_ANNOUNCE, info.announcement.id);
            persist(S_LAST_ANNOUNCE_VER, info.version);
          }
        }
      }
      function notifyIfUpdated() {
        var last = loadSetting(S_LAST_SEEN_VERSION, "");
        if (!last) {
          persist(S_LAST_SEEN_VERSION, VERSION);
          return;
        }
        if (compareVersion(VERSION, last) !== 0) {
          if (compareVersion(VERSION, last) > 0) {
            try {
              toast("QiAct " + QiActT("update.title", { VERSION }), "#46E0A0");
            } catch (_) {
            }
            fetchVersionJson(VERSION_INFO_URL, 0).then(function(info) {
              if (info && Array.isArray(info.summary) && info.summary.length) {
                showAnnounceBanner({ id: "updated-" + VERSION, title: QiActT("update.title", { VERSION }), severity: "available", message: info.summary.join("\n"), detailsUrl: info.detailsUrl });
              }
            }).catch(function() {
            });
          }
          persist(S_LAST_SEEN_VERSION, VERSION);
        }
      }
      function startUpdateChecker() {
        if (state.updateTimer) return;
        state.updateTimer = runtime && runtime.interval ? runtime.interval(function() {
          checkUpdate().catch(function(e) {
            console.warn("[QiAct] 更新检查失败（已忽略）:", e && e.message);
          });
        }, UPDATE_INTERVAL) : setInterval(function() {
          checkUpdate().catch(function(e) {
            console.warn("[QiAct] 更新检查失败（已忽略）:", e && e.message);
          });
        }, UPDATE_INTERVAL);
        (runtime && runtime.timeout ? runtime.timeout : setTimeout)(function() {
          checkUpdate().catch(function(e) {
            console.warn("[QiAct] 更新检查失败（已忽略）:", e && e.message);
          });
        }, UPDATE_FIRST_DELAY);
      }
      function getUpdateBannerEl() {
        return document.getElementById("xsact-update-banner");
      }
      function hideUpdateBanner() {
        var el = getUpdateBannerEl();
        if (el) {
          el.style.display = "none";
          el.innerHTML = "";
          el.className = "xsact-update-banner";
        }
        state.pendingBanner = null;
      }
      function renderPendingBanner() {
        if (!state.pendingBanner) return;
        if (state.pendingBanner.type === "update") showUpdateBanner(state.pendingBanner.data);
        else showAnnounceBanner(state.pendingBanner.data);
      }
      function showUpdateBanner(info, isRestore) {
        var el = getUpdateBannerEl();
        if (!el) {
          state.pendingBanner = { type: "update", data: info };
          return;
        }
        var summary = info.summary && info.summary.length ? info.summary : [];
        var items = summary.slice(0, 4).map(function(s) {
          return "<li>" + escapeHtml(s) + "</li>";
        }).join("");
        el.className = "xsact-update-banner" + (info.severity === "important" ? " is-important" : "");
        el.innerHTML = '<div class="xsact-ub-head"><span class="xsact-ub-tag">' + QiActT("update.available_tag") + '</span><span class="xsact-ub-ver">v' + escapeHtml(info.version) + '</span><button class="xsact-ub-close" id="xsact-ub-close" title="' + QiActT("update.later_title") + '" data-tooltip-type="danger">×</button></div>' + (items ? '<ul class="xsact-ub-sum">' + items + "</ul>" : "") + '<div class="xsact-ub-actions">' + (info.detailsUrl ? '<button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">' + QiActT("update.details") + "</button>" : "") + '<button class="xsact-ub-btn" id="xsact-ub-later">' + QiActT("update.later") + '</button><button class="xsact-ub-btn" id="xsact-ub-ignore">' + QiActT("update.ignore") + "</button></div>";
        el.style.display = "";
        var close = el.querySelector("#xsact-ub-close");
        var later = el.querySelector("#xsact-ub-later");
        var ignore = el.querySelector("#xsact-ub-ignore");
        var details = el.querySelector("#xsact-ub-details");
        if (close) close.onclick = function() {
          hideUpdateBanner();
        };
        if (later) later.onclick = function() {
          hideUpdateBanner();
          persist(S_UPDATE_DISMISSED, info.version);
        };
        if (ignore) ignore.onclick = function() {
          hideUpdateBanner();
          persist(S_UPDATE_DISMISSED, info.version);
        };
        if (details && info.detailsUrl) details.onclick = function() {
          window.open(info.detailsUrl, "_blank", "noopener");
        };
      }
      function showAnnounceBanner(ann, isRestore) {
        var el = getUpdateBannerEl();
        if (!el) {
          state.pendingBanner = { type: "announce", data: ann };
          return;
        }
        var sev = ann.severity || "info";
        var tagText = QiActT("update.announce_tag");
        var cls = "xsact-update-banner";
        if (sev === "important") {
          cls += " is-important";
          tagText = QiActT("update.important_tag");
        } else if (sev === "available") {
          cls += " is-available";
          tagText = QiActT("update.available_tag");
        } else {
          cls += " is-announce";
          tagText = QiActT("update.announce_tag");
        }
        el.className = cls;
        el.innerHTML = '<div class="xsact-ub-head"><span class="xsact-ub-tag">' + escapeHtml(tagText) + "</span>" + (ann.title ? '<span class="xsact-ub-title">' + escapeHtml(ann.title) + "</span>" : "") + '<button class="xsact-ub-close" id="xsact-ub-close" title="' + QiActT("update.know") + '" data-tooltip-type="danger">×</button></div>' + (ann.message ? '<div class="xsact-ub-msg">' + escapeHtml(ann.message) + "</div>" : "") + (ann.detailsUrl ? '<div class="xsact-ub-actions"><button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">' + QiActT("update.details") + "</button></div>" : "");
        el.style.display = "";
        var close = el.querySelector("#xsact-ub-close");
        var details = el.querySelector("#xsact-ub-details");
        if (close) close.onclick = function() {
          hideUpdateBanner();
        };
        if (details && ann.detailsUrl) details.onclick = function() {
          window.open(ann.detailsUrl, "_blank", "noopener");
        };
      }
      function disposeQuickInteraction() {
        if (state.disposed) return;
        state.disposed = true;
        state.isActive = false;
        try {
          clearBodyGrids();
        } catch (_) {
        }
        try {
          if (window.__QiAct_VisGuard) clearInterval(window.__QiAct_VisGuard);
          delete window.__QiAct_VisGuard;
        } catch (_) {
        }
        try {
          if (state.updateTimer) clearInterval(state.updateTimer);
        } catch (_) {
        }
        try {
          if (state.refreshInterval) clearInterval(state.refreshInterval);
        } catch (_) {
        }
        state.updateTimer = null;
        state.refreshInterval = null;
        try {
          if (Array.isArray(state.customActions)) {
            state.customActions.slice().forEach(function(action) {
              try {
                caUnregister(action);
              } catch (_) {
                silent(_, "dispose.caUnregister");
              }
            });
          }
        } catch (_) {
        }
        try {
          var crb = window.Liko && window.Liko.__Sys_ChatRoomButtons__;
          if (crb && typeof crb.remove === "function") crb.remove("quick-interaction");
          var pending = window.Liko && window.Liko.__CRB_pending__;
          if (Array.isArray(pending)) {
            window.Liko.__CRB_pending__ = pending.filter(function(item) {
              return !item || item[0] !== "quick-interaction";
            });
          }
        } catch (_) {
        }
        try {
          if (state.modApi && typeof state.modApi.unload === "function") state.modApi.unload();
        } catch (_) {
        }
        state.modApi = null;
        try {
          if (window.__QiAct_ADT_ORIGINAL) {
            window.ActivityDictionaryText = window.__QiAct_ADT_ORIGINAL;
            delete window.__QiAct_ADT_ORIGINAL;
          }
          delete window.__QiAct_ADT_PATCHED;
        } catch (_) {
        }
        document.querySelectorAll("#xsact-qa-panel, #xsact-qa-overlay, #xsact-toggle-btn, #xsact-qa-styles, .xsact-tooltip, .xsact-update-banner, .xsact-part-btn").forEach(function(element) {
          try {
            element.remove();
          } catch (_) {
          }
        });
        state.actionPanelEl = null;
        state.toggleBtnEl = null;
        try {
          if (runtime && typeof runtime.dispose === "function") runtime.dispose();
        } catch (_) {
        }
        delete window.__qiactTooltipReady;
        window.__QiAct_Loaded__ = false;
        if (window.__QiAct && window.__QiAct.state === state) delete window.__QiAct;
        if (window.__QiActRuntimeHost === runtime) delete window.__QiActRuntimeHost;
      }
      async function main() {
        await waitFor(function() {
          return typeof bcModSdk !== "undefined";
        });
        if (state.disposed || runtime && runtime.disposed) return;
        try {
          state.modApi = bcModSdk.registerMod({
            name: "快捷互动",
            fullName: "Quick Action Launcher",
            version: VERSION,
            repository: "统一动作操作台"
          }, { allowReplace: true });
          logD("state.modApi 注册完成");
        } catch (regErr) {
          console.warn("[QiAct] registerMod 异常（可能已注册）:", regErr.message);
          try {
            var mods = bcModSdk.getModsInfo ? bcModSdk.getModsInfo() : [];
            for (var mi = 0; mi < mods.length; mi++) {
              if (mods[mi].name === "快捷互动") {
                state.modApi = mods[mi];
                break;
              }
            }
          } catch (_) {
          }
          if (!state.modApi) state.modApi = {};
        }
        await waitFor(function() {
          try {
            return Player && typeof Player.MemberNumber === "number";
          } catch (_) {
            return false;
          }
        });
        if (state.disposed || runtime && runtime.disposed) return;
        logD("玩家已登入:", Player.AccountName || Player.Name);
        try {
          patchActivityDictionaryText();
        } catch (e) {
          console.warn("[QiAct] patchActivityDictionaryText 失败:", e);
        }
        state.isActive = loadSetting(S_ENABLED, false);
        state.selfModeActive = loadSetting(S_SELF, false);
        state.interactionGridActive = loadSetting(S_INTERACTION_GRID, true) !== false;
        state.favorites = loadSetting(S_FAVS, []);
        migrateFavorites();
        state.presets = loadSetting(S_PRESETS, []);
        state.lastAction = loadStorage(S_LAST, null);
        state.combos = loadSetting(S_COMBOS, []);
        loadCustomActions();
        state.xiaosuPack = loadSetting(S_XIAOSU_PACK, true);
        (function() {
          var VALID = { all: 1, xiaosu: 1, native: 1, echo: 1 };
          var v;
          try {
            v = localStorage.getItem(S_CA_FILTER);
            if (v) v = JSON.parse(v);
          } catch (e) {
            v = void 0;
          }
          if (typeof v !== "string" || !VALID[v]) {
            try {
              var sv = loadFromServer(S_CA_FILTER, void 0);
              v = typeof sv === "string" && VALID[sv] ? sv : "all";
            } catch (e) {
              v = "all";
            }
          }
          state.caFilter = v;
        })();
        syncXiaosuPack();
        registerAllCustomActions();
        state.theme = loadSetting(S_THEME, "dark");
        state.chatButtonDocked = loadSetting(S_CHAT_BUTTON, false) === true;
        applyTheme(state.theme);
        try {
          injectStyles();
        } catch (e) {
          console.warn("[QiAct] injectStyles 失败:", e);
        }
        try {
          initTooltip();
        } catch (e) {
          console.warn("[QiAct] initTooltip 失败:", e);
        }
        try {
          setupHooks();
        } catch (e) {
          console.error("[QiAct] setupHooks 失败:", e);
        }
        if (state.isActive && typeof CurrentScreen !== "undefined" && CurrentScreen === "ChatRoom") {
          try {
            enterActionMode();
          } catch (e) {
            console.warn("[QiAct] 自动进入动作模式失败:", e);
          }
        }
        if (typeof CurrentScreen !== "undefined") {
          try {
            startVisibilityGuard();
            guardToggleVisibility();
          } catch (e) {
            console.warn("[QiAct] 启动浮动开关守卫失败:", e);
          }
        }
        try {
          startUpdateChecker();
        } catch (e) {
          console.warn("[QiAct] 启动更新检测失败:", e);
        }
        try {
          notifyIfUpdated();
        } catch (e) {
          console.warn("[QiAct] 更新成功通知失败:", e);
        }
        window.__QiAct = {
          dispose: disposeQuickInteraction,
          toggle: toggleActionMode,
          enter: enterActionMode,
          exit: exitActionMode,
          getLayout: getCharLayout,
          refreshGrids: refreshBodyGrids,
          selectPart: selectTargetAndPart,
          setMode: setPanelMode,
          getCombos: function() {
            return state.combos.slice();
          },
          addCombo,
          deleteCombo,
          addComboItem,
          removeComboItem,
          startEditCombo,
          stopEditCombo,
          runCombo: runComboOnTarget,
          runComboAll,
          isActive: function() {
            return state.isActive;
          },
          get panelMode() {
            return state.panelMode;
          },
          get allModeActive() {
            return state.allModeActive;
          },
          get favModeActive() {
            return state.favModeActive;
          },
          get selfModeActive() {
            return state.selfModeActive;
          },
          toggleAllMode,
          toggleFavMode,
          toggleSelfMode,
          clearAllFavorites,
          get favorites() {
            return state.favorites.slice();
          },
          favKey: function(partGroup, name) {
            return partGroup + "|" + name;
          },
          // ── 自定义动作 / echo 屏蔽调试 ──
          state,
          getCustomActions: function() {
            return state.customActions.slice();
          },
          getEchoData: caGetEchoData,
          getEchoSuppressed: function() {
            return Array.from(state.echoSuppressed);
          },
          importFromEcho: importCustomFromEcho,
          setXiaosuPack,
          getXiaosuPack: function() {
            return !!state.xiaosuPack;
          },
          syncXiaosuPack,
          getCaFilter: function() {
            return state.caFilter;
          },
          setCaFilter: function(k) {
            var v = k === "xiaosu" || k === "native" || k === "echo" || k === "all" ? k : "all";
            state.caFilter = v;
            try {
              persist(S_CA_FILTER, v);
            } catch (_) {
            }
            try {
              if (typeof updateCustomActionPanel === "function" && state && state.actionPanelEl) updateCustomActionPanel(state._lastCharObj || null);
            } catch (_) {
            }
            return v;
          },
          rebuildEchoSuppressed,
          removeSuppressedEchoActivities: caRemoveSuppressedEchoActivities,
          cleanupEchoData: caCleanupEchoData,
          upsertCustom,
          deleteCustom,
          // 测试用：以新数组整体替换 customActions（清旧注册 + 重新注册 + 持久化）
          replaceCustomActions: function(arr) {
            try {
              if (Array.isArray(state.customActions)) state.customActions.slice().forEach(function(a) {
                try {
                  caUnregister(a);
                } catch (_) {
                  silent(_, "caUnregister");
                }
              });
            } catch (_) {
            }
            state.customActions = Array.isArray(arr) ? arr : [];
            registerAllCustomActions();
            saveCustomActions();
            return state.customActions.length;
          },
          getCustomActions: function() {
            return state.customActions.slice();
          },
          caHash,
          caActivityName,
          caFindByActivityName,
          caBuildActivityDef,
          caDetectSource,
          updateActionPanel,
          getActionsForPart,
          isEchoSuppressed: caIsEchoSuppressed,
          // ── 主题切换 ──
          toggleTheme,
          setTheme: function(id) {
            applyTheme(id);
            persist(S_THEME, id);
            return state.theme;
          },
          getTheme: function() {
            return state.theme;
          },
          get editingComboId() {
            return state.editingComboId;
          },
          get selectedTarget() {
            return state.selectedTarget;
          },
          get selectedPart() {
            return state.selectedPart;
          },
          makeActivityPacket,
          findBestItemForActivityAsset,
          // ── 语言切换 ──
          setLanguage: function(code) {
            if (typeof QiActI18n !== "undefined" && QiActI18n.setLang) QiActI18n.setLang(code);
            if (typeof rebuildPanel === "function") rebuildPanel();
            return typeof QiActI18n !== "undefined" && QiActI18n.getCurrentLang ? QiActI18n.getCurrentLang() : null;
          },
          getCurrentLang: function() {
            return typeof QiActI18n !== "undefined" && QiActI18n.getCurrentLang ? QiActI18n.getCurrentLang() : null;
          },
          rebuildPanel,
          version: VERSION,
          // ── 更新 / 公告 ──
          checkUpdate,
          startUpdateChecker,
          notifyIfUpdated,
          getUpdateErrorLog,
          showUpdateBanner,
          showAnnounceBanner,
          hideUpdateBanner
        };
      }
      main().catch(function(err) {
        console.error("[QiAct] 初始化失败:", err);
      });
    })();
    var XIAOSU_PACKED = [
      { "id": "xs_XSAct_眯眼", "name": "眯眼", "scope": "self", "group": "ItemHead", "dialog": "眯眼", "dialogSelf": "{SourceCharacter}眯了眯眼.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_眯眼", "visible": true },
      { "id": "xs_XSAct_眼神飘忽", "name": "眼神飘忽", "scope": "self", "group": "ItemHead", "dialog": "眼神飘忽", "dialogSelf": "{SourceCharacter}眼神飘忽的左看右看.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_眼神飘忽", "visible": true },
      { "id": "xs_XSAct_甩头发", "name": "甩头发", "scope": "self", "group": "ItemHood", "dialog": "甩头发", "dialogSelf": "{SourceCharacter}甩动着头发.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_甩头发", "visible": true },
      { "id": "xs_XSAct_大力甩头发", "name": "大力甩头发", "scope": "self", "group": "ItemHood", "dialog": "大力甩头发", "dialogSelf": "{SourceCharacter}连连摇头，慌乱的甩动着头发.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_大力甩头发", "visible": true },
      { "id": "xs_XSAct_轻抚发梢", "name": "轻抚发梢", "scope": "any", "group": "ItemHood", "dialog": "{SourceCharacter}轻柔抚动着{TargetCharacter}的头发.", "dialogSelf": "{SourceCharacter}轻柔抚动着自己的头发.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_轻抚发梢", "visible": true },
      { "id": "xs_XSAct_叼起头发", "name": "叼起头发", "scope": "any", "group": "ItemHood", "dialog": "{SourceCharacter}轻轻咬起{TargetCharacter}的头发.", "dialogSelf": "{SourceCharacter}轻轻咬起自己的头发.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_叼起头发", "visible": true },
      { "id": "xs_XSAct_嗅头发", "name": "嗅头发", "scope": "any", "group": "ItemHood", "dialog": "{SourceCharacter}在{TargetCharacter}的发间嗅着，鼻息弥漫着{TargetCharacter}的发香.", "dialogSelf": "{SourceCharacter}撩起自己的头发轻轻嗅着.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_嗅头发", "visible": true },
      { "id": "xs_XSAct_绕头发", "name": "绕头发", "scope": "any", "group": "ItemHood", "dialog": "{SourceCharacter}勾起一缕{TargetCharacter}的发丝，在指尖绕来绕去.", "dialogSelf": "{SourceCharacter}勾起自己的一缕头发在指尖绕来绕去.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_绕头发", "visible": true },
      { "id": "xs_XSAct_皱鼻子", "name": "皱鼻子", "scope": "self", "group": "ItemNose", "dialog": "皱鼻子", "dialogSelf": "{SourceCharacter}皱了皱自己的鼻头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_皱鼻子", "visible": true },
      { "id": "xs_XSAct_打喷嚏", "name": "打喷嚏", "scope": "self", "group": "ItemNose", "dialog": "打喷嚏", "dialogSelf": "{SourceCharacter}打了个喷嚏.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_打喷嚏", "visible": true },
      { "id": "xs_XSAct_深呼吸", "name": "深呼吸", "scope": "self", "group": "ItemNose", "dialog": "深呼吸", "dialogSelf": "{SourceCharacter}深深的吸了口气.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_深呼吸", "visible": true },
      { "id": "xs_XSAct_低头", "name": "低头", "scope": "self", "group": "ItemHood", "dialog": "低头", "dialogSelf": "{SourceCharacter}红润着脸蛋低头逃避.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_低头", "visible": true },
      { "id": "xs_XSAct_恳求的摇头", "name": "恳求的摇头", "scope": "other", "group": "ItemHead", "dialog": "{SourceCharacter}对着{TargetCharacter}的方向恳求的摇头.", "dialogSelf": "{SourceCharacter}对着{TargetCharacter}的方向恳求的摇头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_恳求的摇头", "visible": true },
      { "id": "xs_XSAct_恳求的看", "name": "恳求的看", "scope": "other", "group": "ItemHead", "dialog": "{SourceCharacter}汪着眼睛恳求的看着{TargetCharacter}.", "dialogSelf": "{SourceCharacter}汪着眼睛恳求的看着{TargetCharacter}.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_恳求的看", "visible": true },
      { "id": "xs_XSAct_内八夹腿", "name": "内八夹腿", "scope": "self", "group": "ItemLegs", "dialog": "内八夹腿", "dialogSelf": "{SourceCharacter}通红的脸蛋忍耐着快感，大腿紧紧夹起来，摆出着内八的姿势，身体微微颤抖.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_内八夹腿", "visible": true },
      { "id": "xs_XSAct_噘嘴", "name": "噘嘴", "scope": "self", "group": "ItemMouth", "dialog": "噘嘴", "dialogSelf": "{SourceCharacter}有些不满的噘起嘴巴.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_噘嘴", "visible": true },
      { "id": "xs_XSAct_抿住嘴巴", "name": "抿住嘴巴", "scope": "self", "group": "ItemMouth", "dialog": "抿住嘴巴", "dialogSelf": "{SourceCharacter}抿住嘴巴.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_抿住嘴巴", "visible": true },
      { "id": "xs_XSAct_瘪嘴", "name": "瘪嘴", "scope": "self", "group": "ItemMouth", "dialog": "瘪嘴", "dialogSelf": "{SourceCharacter}瘪着嘴巴，一副委屈的样子.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_瘪嘴", "visible": true },
      { "id": "xs_XSAct_坐直身体", "name": "坐直身体", "scope": "self", "group": "ItemTorso", "dialog": "坐直身体", "dialogSelf": "{SourceCharacter}挺直了腰，坐直了身体.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_坐直身体", "visible": true },
      { "id": "xs_XSAct_挺胸收腹", "name": "挺胸收腹", "scope": "self", "group": "ItemBreast", "dialog": "挺胸收腹", "dialogSelf": "{SourceCharacter}挺起胸部，微收下巴，腹部用力收腰.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_挺胸收腹", "visible": true },
      { "id": "xs_XSAct_站直身体", "name": "站直身体", "scope": "self", "group": "ItemTorso", "dialog": "站直身体", "dialogSelf": "{SourceCharacter}挺胸收腹，努力绷紧小腿，站直了身体.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_站直身体", "visible": true },
      { "id": "xs_XSAct_身体一颤", "name": "身体一颤", "scope": "self", "group": "ItemTorso", "dialog": "身体一颤", "dialogSelf": "{SourceCharacter}的身体猛然颤抖了一下.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_身体一颤", "visible": true },
      { "id": "xs_XSAct_活动大腿", "name": "活动大腿", "scope": "self", "group": "ItemLegs", "dialog": "活动大腿", "dialogSelf": "{SourceCharacter}尝试活动了一下腿部.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_活动大腿", "visible": true },
      { "id": "xs_XSAct_活动手臂", "name": "活动手臂", "scope": "self", "group": "ItemArms", "dialog": "活动手臂", "dialogSelf": "{SourceCharacter}一边按摩一边活动着手臂.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_活动手臂", "visible": true },
      { "id": "xs_XSAct_绷紧膝盖", "name": "绷紧膝盖", "scope": "self", "group": "ItemLegs", "dialog": "绷紧膝盖", "dialogSelf": "{SourceCharacter}努力的绷紧膝盖，尽可能站的更直.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_绷紧膝盖", "visible": true },
      { "id": "xs_XSAct_绷直脚踝", "name": "绷直脚踝", "scope": "self", "group": "ItemBoots", "dialog": "绷直脚踝", "dialogSelf": "{SourceCharacter}不自觉的用力绷直脚踝，释放涌来的快感.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_绷直脚踝", "visible": true },
      { "id": "xs_XSAct_蜷缩脚趾", "name": "蜷缩脚趾", "scope": "self", "group": "ItemBoots", "dialog": "蜷缩脚趾", "dialogSelf": "{SourceCharacter}脚趾互相纠结，又时而蜷缩，忍耐着快感袭来.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_蜷缩脚趾", "visible": true },
      { "id": "xs_XSAct_踮脚", "name": "踮脚", "scope": "self", "group": "ItemBoots", "dialog": "踮脚", "dialogSelf": "{SourceCharacter}努力的踮起脚.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_踮脚", "visible": true },
      { "id": "xs_XSAct_兴奋的伸出舌头", "name": "兴奋的伸出舌头", "scope": "self", "group": "ItemMouth", "dialog": "兴奋的伸出舌头", "dialogSelf": "{SourceCharacter}兴奋的伸出舌头.}", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_兴奋的伸出舌头", "visible": true },
      { "id": "xs_XSAct_兴奋的扭动", "name": "兴奋的扭动", "scope": "self", "group": "ItemTorso", "dialog": "兴奋的扭动", "dialogSelf": "{SourceCharacter}兴奋的扭动着身体.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_兴奋的扭动", "visible": true },
      { "id": "xs_XSAct_呼吸平复", "name": "呼吸平复", "scope": "self", "group": "ItemNose", "dialog": "呼吸平复", "dialogSelf": "{SourceCharacter}的呼吸渐渐平复.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_呼吸平复", "visible": true },
      { "id": "xs_XSAct_呼吸紊乱", "name": "呼吸紊乱", "scope": "self", "group": "ItemNose", "dialog": "呼吸紊乱", "dialogSelf": "{SourceCharacter}的呼吸渐渐紊乱起来，发出软软的鼻音.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_呼吸紊乱", "visible": true },
      { "id": "xs_XSAct_嘟囔着想说什么", "name": "嘟囔着想说什么", "scope": "self", "group": "ItemMouth", "dialog": "嘟囔着想说什么", "dialogSelf": "{SourceCharacter}嘟囔着想说什么.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_嘟囔着想说什么", "visible": true },
      { "id": "xs_XSAct_失神的伸出舌头", "name": "失神的伸出舌头", "scope": "self", "group": "ItemMouth", "dialog": "失神的伸出舌头", "dialogSelf": "{SourceCharacter}失神的伸出自己的舌头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_失神的伸出舌头", "visible": true },
      { "id": "xs_XSAct_慢慢伸出舌头", "name": "慢慢伸出舌头", "scope": "self", "group": "ItemMouth", "dialog": "慢慢伸出舌头", "dialogSelf": "{SourceCharacter}慢慢的伸出了自己的舌头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_慢慢伸出舌头", "visible": true },
      { "id": "xs_XSAct_微微摇头", "name": "微微摇头", "scope": "self", "group": "ItemHead", "dialog": "微微摇头", "dialogSelf": "{SourceCharacter}微微的摇了摇头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_微微摇头", "visible": true },
      { "id": "xs_XSAct_微微点头", "name": "微微点头", "scope": "self", "group": "ItemHead", "dialog": "微微点头", "dialogSelf": "{SourceCharacter}微微的点了点头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_微微点头", "visible": true },
      { "id": "xs_XSAct_身体颤抖的摇头", "name": "身体颤抖的摇头", "scope": "self", "group": "ItemHead", "dialog": "身体颤抖的摇头", "dialogSelf": "{SourceCharacter}浑身颤抖的摇了摇头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_身体颤抖的摇头", "visible": true },
      { "id": "xs_XSAct_身体颤抖的点头", "name": "身体颤抖的点头", "scope": "self", "group": "ItemHead", "dialog": "身体颤抖的点头", "dialogSelf": "{SourceCharacter}浑身颤抖的点了点头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_身体颤抖的点头", "visible": true },
      { "id": "xs_XSAct_歪头疑惑", "name": "歪头疑惑", "scope": "self", "group": "ItemNeck", "dialog": "歪头疑惑", "dialogSelf": "{SourceCharacter}歪着脑袋一副疑惑的样子.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_歪头疑惑", "visible": true },
      { "id": "xs_XSAct_扭动身体", "name": "扭动身体", "scope": "self", "group": "ItemTorso", "dialog": "扭动身体", "dialogSelf": "{SourceCharacter}扭动着身体.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_扭动身体", "visible": true },
      { "id": "xs_XSAct_活动四肢", "name": "活动四肢", "scope": "other", "group": "ItemArms", "dialog": "活动四肢", "dialogSelf": "{SourceCharacter}活动了下自己的四肢.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_活动四肢", "visible": true },
      { "id": "xs_XSAct_看他", "name": "看他", "scope": "other", "group": "ItemHead", "dialog": "{SourceCharacter}看向了{TargetCharacter}.", "dialogSelf": "{SourceCharacter}看向了{TargetCharacter}.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_看他", "visible": true },
      { "id": "xs_XSAct_缩脖子", "name": "缩脖子", "scope": "self", "group": "ItemNeck", "dialog": "缩脖子", "dialogSelf": "{SourceCharacter}缩了下自己的脖子.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_缩脖子", "visible": true },
      { "id": "xs_XSAct_脸红喘气", "name": "脸红喘气", "scope": "self", "group": "ItemMouth", "dialog": "脸红喘气", "dialogSelf": "{SourceCharacter}面色潮红的喘着气.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_脸红喘气", "visible": true },
      { "id": "xs_XSAct_轻声喘气", "name": "轻声喘气", "scope": "self", "group": "ItemMouth", "dialog": "轻声喘气", "dialogSelf": "{SourceCharacter}轻声喘着气.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_轻声喘气", "visible": true },
      { "id": "xs_XSAct_跺脚", "name": "跺脚", "scope": "self", "group": "ItemBoots", "dialog": "跺脚", "dialogSelf": "{SourceCharacter}跺了跺脚.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_跺脚", "visible": true },
      { "id": "xs_XSAct_头蹭", "name": "头蹭", "scope": "other", "group": "ItemHead", "dialog": "{SourceCharacter}用自己的脑袋蹭了蹭{TargetCharacter}的头.", "dialogSelf": "{SourceCharacter}用自己的脑袋蹭了蹭{TargetCharacter}的头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_头蹭", "visible": true },
      { "id": "xs_XSAct_脸蹭", "name": "脸蹭", "scope": "other", "group": "ItemHead", "dialog": "{SourceCharacter}用自己的脸颊蹭了蹭{TargetCharacter}的头.", "dialogSelf": "{SourceCharacter}用自己的脸颊蹭了蹭{TargetCharacter}的头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_脸蹭", "visible": true },
      { "id": "xs_XSAct_鼻子蹭", "name": "鼻子蹭", "scope": "other", "group": "ItemHead", "dialog": "{SourceCharacter}用自己的鼻子蹭了蹭{TargetCharacter}的头.", "dialogSelf": "{SourceCharacter}用自己的鼻子蹭了蹭{TargetCharacter}的头.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_鼻子蹭", "visible": true },
      { "id": "xs_XSAct_埋怀里", "name": "埋怀里", "scope": "other", "group": "ItemBreast", "dialog": "{SourceCharacter}把脑袋埋在{TargetCharacter}的怀里.", "dialogSelf": "{SourceCharacter}把脑袋埋在{TargetCharacter}的怀里.", "createdAt": 0, "source": "xiaosu", "builtin": true, "xiaosuName": "XSAct_埋怀里", "visible": true }
    ];
  }
  disposePreviousRuntime();
  const runtimeHost = createRuntimeHost("QiAct");
  window.__QiActRuntimeHost = runtimeHost;
  if (typeof window.__bcSandboxOnClear === "function") {
    window.__bcSandboxOnClear(() => {
      const api = window.__QiAct;
      if (api && api.state && api.state.disposed === false && typeof api.dispose === "function") api.dispose();
      else runtimeHost.dispose();
    });
  }
  try {
    startLegacyRuntime(runtimeHost);
  } catch (error) {
    runtimeHost.dispose();
    if (window.__QiActRuntimeHost === runtimeHost) delete window.__QiActRuntimeHost;
    throw error;
  }
})();
