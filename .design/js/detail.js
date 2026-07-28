/* ===== DETAIL PAGE — React 19 组件：热力图 / 图表 Tab / 统计动画 / Tooltip / 导航 =====
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   加载方式：HTML 页面通过 <script type="text/babel"> 引入

   职责：管理项目详情页的热力图生成、图表 Tab 切换、
         统计数字动画、tooltip 事件、面包屑导航。
   注意：页面静态结构已由 detail.html 提供，本组件不重复渲染内容，
        仅通过 useEffect 绑定到已有 DOM 元素控制动画与交互。
   ═════════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useCallback, useRef } = React;

  /* ═══════════════════════════════════════════════════════════════
     静态数据 —— 图表数据（7D / 1Y 两个时间窗口）
     供 StarCurveChart 组件消费
     ═══════════════════════════════════════════════════════════════ */

  var STAR_CHART_DATA = {
    '7d': {
      label: '7-day window',
      yMax: 231000, yStep: 300,
      // 使用星期标签（周日 ~ 周六），与7天时间窗口语义一致
      xLabels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      points: [229200, 229500, 229800, 230100, 230250, 230350, 230412],
      tooltipLabels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      tooltipValues: ['229,200','229,500','229,800','230,100','230,250','230,350','230,412'],
      summary: { avg: '+173', peak: '+350', peakDate: '(Wed)', total: '+1,212', totalLabel: '7-day total' }
    },
    '1y': {
      label: '1-year window',
      yMax: 240000, yStep: 15000,
      xLabels: ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'],
      points: [165000, 172000, 181000, 192000, 205000, 216000, 224000, 228000, 230412],
      tooltipLabels: ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'],
      tooltipValues: ['165,000','172,000','181,000','192,000','205,000','216,000','224,000','228,000','230,412'],
      summary: { avg: '+179', peak: '+4,500', peakDate: '(Mar 15)', total: '+65,412', totalLabel: '1-year total' }
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     静态数据 —— Commits over Time 整体趋势
     2013 Q4 ~ 2026 Q2 的季度提交数据 + 时段标签
     供 CommitTrendChart 组件消费
     ═══════════════════════════════════════════════════════════════ */
  var COMMIT_TREND_DATA = [
    120,180,280,420,   // 2013
    520,610,580,650,   // 2014
    580,520,480,510,   // 2015
    490,450,420,390,   // 2016
    370,350,320,300,   // 2017
    280,260,240,220,   // 2018
    210,200,190,180,   // 2019
    170,165,160,155,   // 2020
    150,155,170,200,   // 2021
    250,320,400,480,   // 2022
    530,580,620,650,   // 2023
    640,610,580,550,   // 2024
    480,420,350,280,   // 2025
    200,130            // 2026 (数据截止到当前)
  ];
  var COMMIT_TREND_LABELS = (function () {
    // 自动生成 "YYYY QN" 标签
    var labels = [];
    var year = 2013, q = 4;
    for (var i = 0; i < COMMIT_TREND_DATA.length; i++) {
      labels.push(year + ' Q' + q);
      q++;
      if (q > 4) { q = 1; year++; }
    }
    return labels;
  })();

  /* ═══════════════════════════════════════════════════════════════
     热力图工具函数
     ═══════════════════════════════════════════════════════════════ */
  var DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var COMMIT_LEVELS = { '': 'No commits', 'l1': '1-4 commits', 'l2': '5-9 commits', 'l3': '10-19 commits', 'l4': '20+ commits' };

  /* ═══════════════════════════════════════════════════════════════
     DetailPage 组件
     ─────────────────────────────────────────────────────────────
     不渲染任何内容（静态 HTML 已提供），仅用多个 useEffect
     管理不同职责的副作用：入场动画、热力图、图表 React 挂载、
     统计动画、tooltip、面包屑导航。
     ═══════════════════════════════════════════════════════════════ */
  function DetailPage() {

    /* ── 1. 热力图网格生成 ──
       在 #heatmapGrid 中填充 20 周 x 7 天的伪随机热力格子 */
    useEffect(function () {
      var grid = document.getElementById('heatmapGrid');
      if (!grid) return;

      var weeks = 20;
      var days = 7;
      var total = weeks * days;
      var seed = 42;

      function pseudoRandom() {
        seed = (seed * 16807 + 0) % 2147483647;
        return seed / 2147483647;
      }

      for (var i = 0; i < total; i++) {
        var cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        var r = pseudoRandom();
        if (r < 0.12) { /* 空：无提交 */ }
        else if (r < 0.30) cell.classList.add('l1');
        else if (r < 0.52) cell.classList.add('l2');
        else if (r < 0.75) cell.classList.add('l3');
        else cell.classList.add('l4');
        grid.appendChild(cell);
      }
    }, []);

    /* ── 2b. 挂载 React 图表组件（StarCurveChart + CommitTrendChart） ──
       将 #starChartRoot 和 #commitTrendRoot 交给 React 组件管理，
       组件内部负责 Tab 切换、入场动画、hover tooltip */
    useEffect(function () {
      if (!global.RCCharts) {
        console.error('[GHRANK/Detail] RCCharts 组件库未加载');
        return;
      }

      var roots = [];

      // Star 增长曲线图
      var starRoot = document.getElementById('starChartRoot');
      if (starRoot) {
        var root1 = ReactDOM.createRoot(starRoot);
        root1.render(
          React.createElement(global.RCCharts.StarCurveChart, { data: STAR_CHART_DATA })
        );
        roots.push(root1);
      }

      // Commits over Time 整体趋势条形图
      var trendRoot = document.getElementById('commitTrendRoot');
      if (trendRoot) {
        var root2 = ReactDOM.createRoot(trendRoot);
        root2.render(
          React.createElement(global.RCCharts.CommitTrendChart, {
            data: COMMIT_TREND_DATA,
            periodLabels: COMMIT_TREND_LABELS
          })
        );
        roots.push(root2);
      }

      return function cleanup() {
        roots.forEach(function (r) { r.unmount(); });
      };
    }, []);

    /* ── 4. 统计数字计数动画 ──
       .mini-stat-value 中的数字从 0 递增到目标值 */
    useEffect(function () {
      var timers = [];
      var animFrameIds = [];

      function schedule(fn, delay) {
        var id = setTimeout(fn, delay);
        timers.push(id);
        return id;
      }

      var statEls = document.querySelectorAll('.mini-stat-value');
      statEls.forEach(function (el) {
        var text = el.textContent.trim();
        var match = text.match(/^([+#]?)([\d,.]+)(.*)/);
        if (!match) return;

        var prefix = match[1], numStr = match[2], suffix = match[3];
        var target = parseFloat(numStr.replace(/,/g, ''));
        var hasComma = numStr.includes(',');
        var duration = 1200;

        schedule(function () {
          var start = performance.now();
          function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            var current = Math.round(target * eased);
            var display = hasComma ? current.toLocaleString() : current.toString();
            el.textContent = prefix + display + suffix;
            if (progress < 1) {
              var rafId = requestAnimationFrame(tick);
              animFrameIds.push(rafId);
            }
          }
          var rafId = requestAnimationFrame(tick);
          animFrameIds.push(rafId);
        }, 700);
      });

      return function cleanup() {
        timers.forEach(function (id) { clearTimeout(id); });
        animFrameIds.forEach(function (id) { cancelAnimationFrame(id); });
      };
    }, []);

    /* ── 5. 热力图 Tooltip ──
       创建 body 级浮层 tooltip，响应 #heatmapGrid 的 mouseover/leave */
    useEffect(function () {
      var grid = document.getElementById('heatmapGrid');
      if (!grid) return;

      var tooltip = document.createElement('div');
      tooltip.className = 'heatmap-tooltip';
      document.body.appendChild(tooltip);

      function handleMouseOver(e) {
        var cell = e.target.closest('.heatmap-cell');
        if (!cell) return;
        var cells = Array.from(grid.children);
        var idx = cells.indexOf(cell);
        var day = idx % 7;
        var week = Math.floor(idx / 7);
        var level = ['','l1','l2','l3','l4'].find(function (l) { return cell.classList.contains(l); }) || '';
        tooltip.textContent = DAY_NAMES[day] + ', Week ' + (week + 1) + ' \u2014 ' + COMMIT_LEVELS[level];
        tooltip.classList.add('visible');
        var rect = cell.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - 32) + 'px';
      }

      function handleMouseLeave() {
        tooltip.classList.remove('visible');
      }

      grid.addEventListener('mouseover', handleMouseOver);
      grid.addEventListener('mouseleave', handleMouseLeave);

      return function cleanup() {
        grid.removeEventListener('mouseover', handleMouseOver);
        grid.removeEventListener('mouseleave', handleMouseLeave);
        // 移除 tooltip DOM 节点
        if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
      };
    }, []);

    /* ── 6. 面包屑导航 ──
       .breadcrumb-back 的点击返回上一页或首页 */
    useEffect(function () {
      var backBtn = document.querySelector('.breadcrumb-back');
      if (!backBtn) return;

      function handleClick(e) {
        e.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = 'index.html';
        }
      }

      backBtn.addEventListener('click', handleClick);

      return function cleanup() {
        backBtn.removeEventListener('click', handleClick);
      };
    }, []);

    /* ── 8. 仓库链接复制 ──
       copyRepoLink 保留在全局作用域供 HTML onclick 调用 */
    useEffect(function () {
      var timers = [];

      var checkSvg = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var starSvg = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><polygon points="8,1 10,6 15,6.5 11.5,10 12.5,15 8,12 3.5,15 4.5,10 1,6.5 6,6" fill="currentColor"/></svg>';

      // 挂载到全局供 HTML 内联 onclick 调用
      global.copyRepoLink = function (btn, url) {
        navigator.clipboard.writeText(url).then(function () {
          btn.classList.add('copied');
          var original = btn.innerHTML;
          btn.innerHTML = checkSvg;
          var id = setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = original;
          }, 1500);
          timers.push(id);
        }).catch(function () {
          // fallback：通过临时 textarea 执行复制
          var textarea = document.createElement('textarea');
          textarea.value = url;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            btn.classList.add('copied');
            var original = btn.innerHTML;
            btn.innerHTML = checkSvg;
            var id = setTimeout(function () {
              btn.classList.remove('copied');
              btn.innerHTML = original;
            }, 1500);
            timers.push(id);
          } catch (err) { /* 复制失败，静默处理 */ }
          document.body.removeChild(textarea);
        });
      };

      return function cleanup() {
        timers.forEach(function (id) { clearTimeout(id); });
        delete global.copyRepoLink;
      };
    }, []);

    // 静态内容由 detail.html 提供，组件本身不渲染内容
    return null;
  }

  // 导出组件供外部使用
  global.DetailPage = DetailPage;

  /* ── 自动挂载到 GHRANK chrome 层 ──
     需在 core.js 加载后执行（HTML 中 core.js 先于 detail.js 引入） */
  if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
    global.GHRANK.mountChrome('detail', DetailPage);
  } else {
    console.error('[GHRANK/Detail] GHRANK.mountChrome 未找到，请确保 core.js 先于 detail.js 加载');
  }

  /* ── 骨架屏调试模式 + README 骨架屏揭示 ──
     骨架屏揭示由纯 CSS animation 驱动（见 detail.css），JS 仅处理调试：
     URL 带 ?skel-debug=1 时为所有面板添加 skel-debug 类，冻结骨架屏。
     README 面板特殊处理：加载时容器高度匹配骨架屏（较短），
     延迟后由 JS 添加 skel-revealed 类，内容回归文档流，
     容器高度平滑过渡到 README 实际高度。 */
  (function initSkelDebug() {
    var isSkelDebug = new URLSearchParams(window.location.search).get('skel-debug') === '1';
    if (isSkelDebug) {
      document.querySelectorAll('.skel-wrap').forEach(function (node) {
        node.classList.add('skel-debug');
      });
      return; // 调试模式下不执行揭示逻辑
    }

    // README 骨架屏揭示：延迟 3.2s 后添加 skel-revealed 类
    var readmePanel = document.querySelector('.skel-wrap[data-skel="readme"]');
    if (readmePanel) {
      setTimeout(function () {
        readmePanel.classList.add('skel-revealed');
      }, 3200);
    }
  })();

})(window);
