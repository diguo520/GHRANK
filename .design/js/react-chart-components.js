/* ═══════════════════════════════════════════════════════════════════════════
   react-chart-components.js — 可复用 React 图表组件
   ────────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD/CJS shim)、Babel Standalone
   加载方式：HTML 页面通过 <script type="text/babel" data-presets="react"> 引入

   组件清单：
     1. StarCurveChart   — Star 增长曲线图（Tab 切换 + 入场动画 + hover tooltip）
     2. CommitTrendChart — 整体提交趋势条形图（生长动画 + hover tooltip）

   设计原则：
     - 纯 SVG 绘制，无第三方图表库依赖
     - 入场动画通过 CSS @keyframes + stroke-dashoffset 实现
     - hover tooltip 通过 React state + mouse 事件实现
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useRef, useCallback, useMemo } = React;

  /* ═══════════════════════════════════════════════════════════════
     工具函数
     ═══════════════════════════════════════════════════════════════ */

  // 数字格式化：1000 -> 1K, 230000 -> 230K
  function formatK(v) {
    if (v >= 1000) return Math.round(v / 1000) + 'K';
    return String(v);
  }

  // 千分位格式化
  function formatComma(v) {
    return v.toLocaleString();
  }

  /* ═══════════════════════════════════════════════════════════════
     StarCurveChart — Star 增长曲线图
     ─────────────────────────────────────────────────────────────
     Props:
       data: { '7d': {...}, '1y': {...} }  各时间窗口数据
     特性：
       - Tab 切换（7D / 1Y）
       - 曲线 + 填充区域入场动画（stroke-dashoffset）
       - 数据点 hover 显示 tooltip（日期 + star 数）
     ═══════════════════════════════════════════════════════════════ */
  function StarCurveChart(props) {
    var data = props.data || {};

    var _useState = useState('1y'),
        activeRange = _useState[0],
        setActiveRange = _useState[1];

    var _useState2 = useState(null),
        hoverIdx = _useState2[0],
        setHoverIdx = _useState2[1];

    var _useState3 = useState(false),
        animated = _useState3[0],
        setAnimated = _useState3[1];

    // SVG 画布参数
    var W = 600, H = 200;
    var padL = 40, padR = 20, padT = 20, padB = 24;
    var chartW = W - padL - padR;
    var chartH = H - padT - padB;

    var current = data[activeRange] || data['1y'];

    // 入场动画：组件挂载或切换 Tab 时触发
    useEffect(function () {
      setAnimated(false);
      var t = setTimeout(function () { setAnimated(true); }, 50);
      return function () { clearTimeout(t); };
    }, [activeRange]);

    // 计算坐标点
    var points = useMemo(function () {
      if (!current) return [];
      var pts = current.points;
      var yMin = current.yMax - current.yStep * 5;
      var n = pts.length;
      return pts.map(function (v, i) {
        var x = padL + (n === 1 ? 0 : (i / (n - 1)) * chartW);
        var y = padT + chartH - ((v - yMin) / (current.yStep * 5)) * chartH;
        return { x: x, y: y, value: v, label: current.tooltipLabels[i], display: current.tooltipValues[i] };
      });
    }, [current]);

    if (!current) return null;

    // 构建路径字符串
    var linePath = points.map(function (p, i) {
      return (i === 0 ? 'M' : ' L') + p.x + ',' + p.y;
    }).join('');
    var fillPath = linePath + ' L' + points[points.length - 1].x + ',' + (padT + chartH) + ' L' + points[0].x + ',' + (padT + chartH) + ' Z';

    // Y 轴标签（5 档）
    var yLabels = [];
    for (var i = 0; i <= 5; i++) {
      var yVal = current.yMax - i * current.yStep;
      var yPos = padT + (i / 5) * chartH;
      yLabels.push({ val: formatK(yVal), y: yPos });
    }

    // Tab 配置
    var tabs = [
      { range: '7d', label: '7D' },
      { range: '1y', label: '1Y' }
    ];

    // tooltip 定位
    var tooltipStyle = {};
    if (hoverIdx !== null && points[hoverIdx]) {
      var hp = points[hoverIdx];
      tooltipStyle = {
        left: (hp.x / W * 100) + '%',
        top: (hp.y / H * 100 - 10) + '%'
      };
    }

    return React.createElement('div', { className: 'rc-chart-wrap' },
      // Tab 切换
      React.createElement('div', { className: 'chart-tabs' },
        tabs.map(function (t) {
          return React.createElement('button', {
            key: t.range,
            className: 'chart-tab' + (activeRange === t.range ? ' active' : ''),
            onClick: function () { setActiveRange(t.range); }
          }, t.label);
        })
      ),
      // 图表容器
      React.createElement('div', {
        className: 'chart-container rc-chart-svg-wrap',
        onMouseLeave: function () { setHoverIdx(null); }
      },
        React.createElement('svg', {
          className: 'chart-svg' + (animated ? ' rc-animated' : ''),
          viewBox: '0 0 ' + W + ' ' + H,
          preserveAspectRatio: 'none'
        },
          // 渐变定义
          React.createElement('defs', null,
            React.createElement('linearGradient', {
              id: 'rcStarGrad', x1: '0', y1: '0', x2: '0', y2: '1'
            },
              React.createElement('stop', { offset: '0%', stopColor: '#f5c518', stopOpacity: '0.3' }),
              React.createElement('stop', { offset: '100%', stopColor: '#f5c518', stopOpacity: '0.02' })
            )
          ),
          // 水平网格线
          yLabels.map(function (yl, i) {
            return React.createElement('line', {
              key: 'grid' + i,
              x1: padL, y1: yl.y, x2: W - padR, y2: yl.y,
              className: 'chart-grid-line'
            });
          }),
          // Y 轴标签
          yLabels.map(function (yl, i) {
            return React.createElement('text', {
              key: 'ylabel' + i,
              x: padL - 6, y: yl.y + 3,
              className: 'chart-axis-label', textAnchor: 'end'
            }, yl.val);
          }),
          // X 轴标签
          current.xLabels.map(function (xl, i) {
            var xp = padL + (i / (current.xLabels.length - 1)) * chartW;
            return React.createElement('text', {
              key: 'xlabel' + i,
              x: xp, y: H - 4,
              className: 'chart-month-label', textAnchor: 'middle'
            }, xl);
          }),
          // 填充区域
          React.createElement('path', {
            d: fillPath,
            className: 'chart-area-fill rc-fill'
          }),
          // 曲线（入场动画通过 stroke-dashoffset）
          React.createElement('path', {
            d: linePath,
            className: 'chart-line rc-line'
          }),
          // 数据点 + 交互区域
          points.map(function (p, i) {
            return React.createElement('g', { key: 'dot' + i },
              // 透明交互圆（增大命中区域）
              React.createElement('circle', {
                cx: p.x, cy: p.y, r: 10,
                fill: 'transparent',
                className: 'rc-hit-area',
                onMouseEnter: function () { setHoverIdx(i); }
              }),
              // 可见数据点
              React.createElement('circle', {
                cx: p.x, cy: p.y,
                className: 'chart-dot rc-dot' + (hoverIdx === i ? ' rc-dot-active' : '')
              })
            );
          })
        ),
        // Hover tooltip
        hoverIdx !== null && points[hoverIdx] ? React.createElement('div', {
          className: 'rc-tooltip',
          style: tooltipStyle
        },
          React.createElement('span', { className: 'rc-tooltip-date' }, points[hoverIdx].label),
          React.createElement('span', { className: 'rc-tooltip-value' }, points[hoverIdx].display + ' stars')
        ) : null
      ),
      // 汇总统计
      React.createElement('div', { className: 'chart-summary' },
        React.createElement('span', { className: 'chart-summary-item' },
          'Avg daily: ', React.createElement('strong', null, current.summary.avg)
        ),
        React.createElement('span', { className: 'chart-summary-sep' }, '|'),
        React.createElement('span', { className: 'chart-summary-item' },
          'Peak: ', React.createElement('strong', null, current.summary.peak),
          ' ', React.createElement('span', null, current.summary.peakDate)
        ),
        React.createElement('span', { className: 'chart-summary-sep' }, '|'),
        React.createElement('span', { className: 'chart-summary-item' },
          React.createElement('span', null, current.summary.totalLabel),
          ': ', React.createElement('strong', null, current.summary.total)
        )
      )
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     CommitTrendChart — 整体提交趋势条形图
     ─────────────────────────────────────────────────────────────
     Props:
       data: number[]  季度提交数据
       periodLabels: string[]  每个数据点的时段标签（如 "2017 Q2"）
     特性：
       - 条形从底部生长入场动画（CSS transform: scaleY）
       - hover 每根竖条显示 tooltip（时段 + 提交数）
     ═══════════════════════════════════════════════════════════════ */
  function CommitTrendChart(props) {
    var quarterlyData = props.data || [];
    var periodLabels = props.periodLabels || [];

    var _useState4 = useState(null),
        hoverIdx = _useState4[0],
        setHoverIdx = _useState4[1];

    var _useState5 = useState(false),
        animated = _useState5[0],
        setAnimated = _useState5[1];

    // SVG 画布参数
    var W = 800, H = 160;
    var padL = 6, padR = 40, padT = 10, padB = 24;
    var chartW = W - padL - padR;
    var chartH = H - padT - padB;
    var n = quarterlyData.length;
    var gap = 2;
    var barW = Math.max(2, chartW / n - gap);
    var yMax = Math.ceil(Math.max.apply(null, quarterlyData) / 100) * 100 + 100;

    // 入场动画
    useEffect(function () {
      setAnimated(false);
      var t = setTimeout(function () { setAnimated(true); }, 100);
      return function () { clearTimeout(t); };
    }, []);

    // Y 轴刻度
    var ySteps = [];
    var step = Math.ceil(yMax / 4 / 50) * 50;
    for (var s = 0; s <= yMax; s += step) {
      ySteps.push(s);
      if (ySteps.length >= 6) break;
    }

    // X 轴年份标签
    // 策略：从首个数据点开始，每隔约 8 个条形（≈2 年）显示一个年份标签，
    // 避免年份过多时标签拥挤重叠；同时用 Q1 对齐尽量落在年初。
    var yearMarks = [];
    var lastMarkedIdx = -Infinity;
    var minGap = 8; // 两个年份标签之间至少间隔的条形数
    for (var yi = 0; yi < n; yi++) {
      var label = periodLabels[yi] || '';
      var year = label.split(' ')[0];
      var isQ1 = label.indexOf('Q1') !== -1;
      var isFirst = yi === 0;
      var isLast = yi === n - 1;
      // 首尾强制标注；中间位置满足最小间距且为 Q1 时标注
      if (year && (isFirst || isLast || (isQ1 && yi - lastMarkedIdx >= minGap))) {
        yearMarks.push({ idx: yi, text: year });
        lastMarkedIdx = yi;
      }
    }

    // 汇总统计
    var total = quarterlyData.reduce(function (a, b) { return a + b; }, 0);
    var peak = Math.max.apply(null, quarterlyData);
    var avg = Math.round(total / n);

    // tooltip 定位
    var tooltipStyle = {};
    if (hoverIdx !== null) {
      var bx = padL + hoverIdx * (barW + gap) + barW / 2;
      var by = padT + chartH - (quarterlyData[hoverIdx] / yMax) * chartH;
      tooltipStyle = {
        left: (bx / W * 100) + '%',
        top: (by / H * 100 - 15) + '%'
      };
    }

    return React.createElement('div', { className: 'rc-chart-wrap rc-trend-wrap' },
      React.createElement('div', {
        className: 'commit-trend-svg-wrap',
        onMouseLeave: function () { setHoverIdx(null); }
      },
        React.createElement('svg', {
          className: 'commit-trend-svg' + (animated ? ' rc-animated' : ''),
          viewBox: '0 0 ' + W + ' ' + H,
          preserveAspectRatio: 'xMidYMid meet'
        },
          // 渐变定义
          React.createElement('defs', null,
            React.createElement('linearGradient', {
              id: 'rcTrendBarGrad', x1: '0', y1: '0', x2: '0', y2: '1'
            },
              React.createElement('stop', { offset: '0%', stopColor: 'rgba(245,197,24,0.95)' }),
              React.createElement('stop', { offset: '100%', stopColor: 'rgba(245,197,24,0.35)' })
            )
          ),
          // Y 轴网格线 + 标签
          ySteps.map(function (ys, i) {
            var yPos = padT + chartH - (ys / yMax) * chartH;
            return React.createElement('g', { key: 'ygrid' + i },
              React.createElement('line', {
                x1: padL, y1: yPos, x2: W - padR, y2: yPos,
                className: 'trend-grid-line'
              }),
              React.createElement('text', {
                x: W - padR + 6, y: yPos + 3,
                className: 'trend-y-label'
              }, ys)
            );
          }),
          // 竖条
          quarterlyData.map(function (val, i) {
            var barH = Math.max(1, (val / yMax) * chartH);
            var bx = padL + i * (barW + gap);
            var by = padT + chartH - barH;
            return React.createElement('rect', {
              key: 'bar' + i,
              x: bx, y: by,
              width: barW, height: barH,
              rx: 1,
              fill: 'url(#rcTrendBarGrad)',
              className: 'trend-bar rc-bar' + (hoverIdx === i ? ' rc-bar-active' : ''),
              style: { animationDelay: animated ? (i * 20) + 'ms' : '0ms' },
              onMouseEnter: function () { setHoverIdx(i); }
            });
          }),
          // X 轴年份标签
          yearMarks.map(function (ym, i) {
            var lx = padL + ym.idx * (barW + gap) + barW / 2;
            return React.createElement('text', {
              key: 'xyear' + i,
              x: lx, y: H - 4,
              className: 'trend-x-label', textAnchor: 'middle'
            }, ym.text);
          }),
          // Y 轴标题
          React.createElement('text', {
            x: W - 4, y: padT + chartH / 2,
            className: 'trend-y-title',
            transform: 'rotate(-90,' + (W - 4) + ',' + (padT + chartH / 2) + ')'
          }, 'Contributions')
        ),
        // Hover tooltip
        hoverIdx !== null ? React.createElement('div', {
          className: 'rc-tooltip rc-trend-tooltip',
          style: tooltipStyle
        },
          React.createElement('span', { className: 'rc-tooltip-date' }, periodLabels[hoverIdx] || ''),
          React.createElement('span', { className: 'rc-tooltip-value' }, formatComma(quarterlyData[hoverIdx]) + ' commits')
        ) : null
      ),
      // 底部汇总
      React.createElement('div', { className: 'commit-trend-summary' },
        React.createElement('span', null, 'Total: ', React.createElement('strong', null, formatComma(total))),
        React.createElement('span', { className: 'trend-sep' }, '|'),
        React.createElement('span', null, 'Peak: ', React.createElement('strong', null, peak)),
        React.createElement('span', { className: 'trend-sep' }, '|'),
        React.createElement('span', null, 'Avg/Qtr: ', React.createElement('strong', null, avg)),
        React.createElement('span', { className: 'trend-sep' }, '|'),
        React.createElement('span', null, 'Period: ', React.createElement('strong', null, '2013 Q4 — 2026 Q2'))
      )
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     导出组件到全局
     ═══════════════════════════════════════════════════════════════ */
  global.RCCharts = {
    StarCurveChart: StarCurveChart,
    CommitTrendChart: CommitTrendChart
  };
})(window);
