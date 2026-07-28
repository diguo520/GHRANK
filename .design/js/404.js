/* ===== 404 PAGE — React 19 组件：Glitch & 诊断打字 =====
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   加载方式：HTML 页面通过 <script type="text/babel"> 引入

   职责：管理 404 页面静态内容的 glitch 效果与诊断打字时序。
   注意：页面静态结构已由 404.html 提供，本组件不重复渲染内容，
        仅通过 useEffect 绑定到已有 DOM 元素控制动画。
   ───────────────────────────────────────────────────────────────── */
(function (global) {
  'use strict';

  var { useEffect } = React;

  /* ── 动画时序常量（毫秒）── */
  var GLITCH_DELAY = 900;          // 页面加载后触发 glitch 的延迟
  var GLITCH_DURATION = 500;       // glitch 序列持续时长
  var DIAGNOSTICS_DELAY = 1500;    // 诊断打字效果开始延迟
  var DIAG_LINE_INTERVAL = 180;    // 每行诊断揭示间隔
  var DIAG_LAST_EXTRA_DELAY = 100; // 最后一行相对普通行的额外延迟

  /* ── ErrorPage404 组件 ──
     不渲染任何内容（静态 HTML 已提供），仅用 useEffect
     管理 glitch 效果与诊断打字时序 */
  function ErrorPage404() {
    useEffect(function () {
      // 收集所有定时器，便于卸载时统一清理，避免内存泄漏与重复触发
      var timers = [];

      // 统一的定时器调度入口：注册回调并记录 id
      function schedule(fn, delay) {
        var id = setTimeout(fn, delay);
        timers.push(id);
        return id;
      }

      // 尊重 prefers-reduced-motion：跳过 glitch 与打字动画
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        document.querySelectorAll('.diag-line').forEach(function (line) {
          line.style.opacity = '1';
        });
      } else {
        // error-code glitch 效果：触发后序列结束移除
        schedule(function () {
          var code = document.querySelector('.error-code');
          if (!code) return;
          code.classList.add('glitch-active');
          schedule(function () {
            code.classList.remove('glitch-active');
          }, GLITCH_DURATION);
        }, GLITCH_DELAY);

        // 诊断面板打字效果
        schedule(runDiagnosticsTyping, DIAGNOSTICS_DELAY);
      }

      // 清理函数：组件卸载时清除所有挂起的定时器
      return function cleanup() {
        timers.forEach(function (id) { clearTimeout(id); });
      };

      /* ── 诊断打字效果：逐行揭示 .diag-line ──
         最后一行（带闪烁光标）单独处理，在普通行全部揭示后再显示 */
      function runDiagnosticsTyping() {
        var container = document.getElementById('errorDiagnostics');
        if (!container) return;

        var lines = container.querySelectorAll('.diag-line');
        if (lines.length === 0) return;

        var normalLines = Array.prototype.slice.call(lines, 0, -1);
        var lastLine = lines[lines.length - 1];

        // 先隐藏所有普通行
        normalLines.forEach(function (line) {
          line.style.opacity = '0';
        });

        // 逐行揭示普通行
        normalLines.forEach(function (line, index) {
          schedule(function () {
            line.style.transition = 'opacity 0.15s ease';
            line.style.opacity = '1';
          }, index * DIAG_LINE_INTERVAL);
        });

        // 所有普通行揭示后，再揭示最后一行
        schedule(function () {
          if (!lastLine) return;
          lastLine.style.transition = 'opacity 0.15s ease';
          lastLine.style.opacity = '1';
        }, normalLines.length * DIAG_LINE_INTERVAL + DIAG_LAST_EXTRA_DELAY);
      }
    }, []);

    // 静态内容由 404.html 提供，组件本身不渲染内容
    return null;
  }

  // 导出组件供外部使用
  global.ErrorPage404 = ErrorPage404;

  /* ── 自动挂载到 GHRANK chrome 层 ──
     需在 core.js 加载后执行（HTML 中 core.js 先于 404.js 引入） */
  if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
    global.GHRANK.mountChrome('404', ErrorPage404);
  } else {
    console.error('[GHRANK/404] GHRANK.mountChrome 未找到，请确保 core.js 先于 404.js 加载');
  }
})(window);
