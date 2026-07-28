/* ═══════════════════════════════════════════════════════════════
   react-cjs-shim.js — 将 React 19 CJS 产物挂载到全局 window
   ────────────────────────────────────────────────────────────────
   背景：React 19 不再发布 UMD 产物，仅提供 CJS。
   本脚本通过模拟 CommonJS 环境（module/exports/require）加载本地
   vendor 下的 CJS 文件，将 React、ReactDOM 挂到 window 全局，
   使 Babel Standalone 编译的 JSX 代码能正常引用全局 React。

   加载顺序：scheduler → react → react-dom
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // 极简 CJS 模块加载器：执行 factory 并返回 exports
  function loadCJS(srcUrl, requireMap) {
    var xhr = new XMLHttpRequest();
    // 同步加载（本脚本在 head 中先于 babel 执行）
    xhr.open('GET', srcUrl, false);
    xhr.send();
    if (xhr.status !== 200 && xhr.status !== 0) {
      throw new Error('[react-cjs-shim] 加载失败: ' + srcUrl + ' (' + xhr.status + ')');
    }
    var code = xhr.responseText;

    // 构造 CJS 沙箱
    var moduleObj = { exports: {} };
    var fakeRequire = function (name) {
      if (requireMap && requireMap[name]) return requireMap[name];
      throw new Error('[react-cjs-shim] 未注册的依赖: ' + name);
    };

    // 使用 Function 构造器在受控作用域执行
    var factory = new Function('module', 'exports', 'require', code);
    factory(moduleObj, moduleObj.exports, fakeRequire);
    return moduleObj.exports;
  }

  try {
    // 计算脚本自身 URL，推导出 vendor 目录的绝对路径
    // shim 位于 <root>/js/vendor/react-cjs-shim.js，页面位于 <root>/pages/*.html
    var scripts = document.getElementsByTagName('script');
    var shimPath = '';
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('react-cjs-shim.js') !== -1) {
        shimPath = scripts[i].src;
        break;
      }
    }
    var baseDir = shimPath.replace(/react-cjs-shim\.js.*$/, '');

    // 1. 加载 scheduler（react-dom 依赖）
    var Scheduler = loadCJS(baseDir + 'scheduler.cjs.js', {});

    // 2. 加载 react（无外部依赖）
    var React = loadCJS(baseDir + 'react.cjs.js', {});

    // 3. 加载 react-dom（依赖 react 和 scheduler）—— 提供 createPortal/flushSync
    var ReactDOM = loadCJS(baseDir + 'react-dom.cjs.js', {
      'react': React,
      'scheduler': Scheduler
    });

    // 4. 加载 react-dom/client（依赖 react 和 scheduler）—— 提供 createRoot/hydrateRoot
    var ReactDOMClient = loadCJS(baseDir + 'react-dom-client.cjs.js', {
      'react': React,
      'react-dom': ReactDOM,
      'scheduler': Scheduler
    });

    // 5. 挂载到全局，兼容 UMD 用法
    window.React = React;
    // 合并 react-dom 与 react-dom/client 的导出，使 createRoot 可直接通过 ReactDOM.createRoot 访问
    var CombinedReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);
    window.ReactDOM = CombinedReactDOM;

    // 标记加载完成，供后续脚本检测
    window.__REACT_CJS_SHIM_READY__ = true;
  } catch (err) {
    console.error('[react-cjs-shim] 初始化失败:', err);
    window.__REACT_CJS_SHIM_ERROR__ = err.message;
  }
})();
