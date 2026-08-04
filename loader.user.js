// ==UserScript==
// @name         QiAct Loader (QuickInteraction Loader)
// @name:zh      QiAct Loader
// @namespace    https://github.com/bondage-studio/QuickInteraction
// @version      1.3.2
// @description  为 Bondage Club 提供快捷互动操作台。点击角色身体部位即可快速选择动作，支持全员动作、连招、收藏和动作模式切换。安装后刷新 BC 页面即自动更新到最新版。
// @author       Tao MUSE
// @homepageURL  https://github.com/bondage-studio/QuickInteraction
// @updateURL    https://raw.githubusercontent.com/bondage-studio/QuickInteraction/main/loader.user.js
// @downloadURL  https://raw.githubusercontent.com/bondage-studio/QuickInteraction/main/loader.user.js
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        https://bondageprojects.com/*
// @match        https://www.bondageprojects.com/*
// @match        https://bondage-asia.com/*
// @match        https://www.bondage-asia.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

/*
 * QiAct Loader
 * 本脚本只负责加载主脚本。刷新 BC 页面时自动拉取最新版本。
 */
import('https://bondage-studio.github.io/QuickInteraction/assets/main.js?v=' + Date.now());
