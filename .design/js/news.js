/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // NewsPage — React 19 组件
   ────────────────────────────────────────────────────────────────────────
   职责：
   1. 实时 "Updated" 计时器（每分钟递增）
   2. 模拟实时数据推送（随机从未用标题池中抽取，插入 Today 组）
   3. 时间线导航（scroll tracking + click smooth scroll）
   4. 注入 tl-ping 关键帧样式

   挂载方式：GHRANK.mountChrome('news', NewsPage)
   加载方式：HTML 页面通过 <script type="text/babel" src="../js/news.js">
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var { useState, useEffect, useCallback, useRef } = React;

  // ── 常量：新闻源域名映射 ──
  var SOURCES = {
    ANTHROPIC: 'anthropic.com',
    OPENAI: 'openai.com',
    GOOGLE: 'blog.google',
    META: 'ai.meta.com',
    MICROSOFT: 'blogs.microsoft.com',
    NVIDIA: 'nvidia.com',
    STABILITY: 'stability.ai',
    MISTRAL: 'mistral.ai',
    HUGGINGFACE: 'huggingface.co',
    FIGURE: 'figure.ai',
    APPLE: 'machinelearning.apple.com',
    XAI: 'x.ai',
    GITHUB: 'github.com',
    AMD: 'amd.com',
    TESLA: 'tesla.com',
    PERPLEXITY: 'perplexity.ai',
    SAMSUNG: 'samsung.com',
    MIDJOURNEY: 'midjourney.com'
  };

  // ── 常量：标题池 ──
  var HEADLINES = [
    { src: 'ANTHROPIC', title: 'Claude 4 Achieves 92% on HumanEval — First Model to Surpass Human Baseline in Code Generation' },
    { src: 'OPENAI', title: 'GPT-5 Turbo Now Available via API — 2x Speed at Half the Cost of GPT-4' },
    { src: 'GOOGLE', title: 'Google DeepMind\'s AlphaFold 3 Predicts Protein Interactions at Atomic Resolution' },
    { src: 'META', title: 'Meta Releases SeamlessM4T v2: Real-Time Speech-to-Speech Translation for 100+ Languages' },
    { src: 'MICROSOFT', title: 'Azure AI Launches Copilot Studio — No-Code Agent Builder for Enterprise Workflows' },
    { src: 'NVIDIA', title: 'NVIDIA NeMo 2.0: Open-Source Framework for Custom LLM Fine-Tuning at Scale' },
    { src: 'STABILITY', title: 'Stability AI Unveils Stable Diffusion 4.0 with Real-Time Video Generation' },
    { src: 'MISTRAL', title: 'Mistral AI Releases Mixtral 8x22B: Sparse MoE Model Outperforms GPT-3.5' },
    { src: 'HUGGINGFACE', title: 'HuggingFace Hub Surpasses 1 Million Models — Largest Open ML Repository' },
    { src: 'FIGURE', title: 'Figure 02 Begins Pilot Deployment at BMW Manufacturing Facility' },
    { src: 'APPLE', title: 'Apple Open-Sources MLX 4.0: Unified Framework for On-Device AI Training' },
    { src: 'XAI', title: 'xAI Grok 3 Now Open Source — Released Under Apache 2.0 License' },
    { src: 'GITHUB', title: 'GitHub Copilot Workspace Launches: AI-Powered PR Generation from Issue Descriptions' },
    { src: 'AMD', title: 'AMD Instinct MI400 Accelerator Delivers 2.5x Performance per Watt vs Competition' },
    { src: 'TESLA', title: 'Tesla Optimus Gen 3 Demonstrates Autonomous Fine Manipulation in Factory Trial' },
    { src: 'PERPLEXITY', title: 'Perplexity AI Raises $500M Series D at $8B Valuation for Enterprise Search' },
    { src: 'SAMSUNG', title: 'Samsung Gauss 2: On-Device LLM Achieves GPT-4 Parity on Mobile Benchmarks' },
    { src: 'MIDJOURNEY', title: 'Midjourney 7.0 Adds Video Generation: Text-to-Clip with Consistent Characters' },
    { src: 'ANTHROPIC', title: 'Claude API Now Supports 200K Token Context Window for Enterprise Customers' },
    { src: 'OPENAI', title: 'OpenAI Launches GPT Store Payouts: Creators Earn 70% of Subscription Revenue' },
    { src: 'GOOGLE', title: 'Google Gemini Pro 2.0 Beats GPT-4 on MMLU-Pro with 96.7% Accuracy' },
    { src: 'META', title: 'Meta AI Researchers Introduce Self-Rewarding LLMs That Improve Through Self-Play' },
    { src: 'MICROSOFT', title: 'Microsoft Phi-4 14B: Small Language Model Outperforms 70B-Class Models on Coding Tasks' },
    { src: 'NVIDIA', title: 'NVIDIA Digital Twin Platform Powers Full Autonomous Factory Simulation' }
  ];

  // ── 工具函数 ──

  // 格式化当前时间为 HH:MM
  function getCurrentTimeStr() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  // 从标题池中随机选取一个未使用的标题（迭代实现，避免递归栈溢出）
  function fetchNextHeadline(usedRef) {
    // 所有标题已用完时，清空已用列表以便重新循环使用
    if (usedRef.current.length >= HEADLINES.length) {
      usedRef.current = [];
    }
    var available = [];
    for (var i = 0; i < HEADLINES.length; i++) {
      if (usedRef.current.indexOf(i) === -1) available.push(i);
    }
    var pick = available[Math.floor(Math.random() * available.length)];
    usedRef.current.push(pick);
    return HEADLINES[pick];
  }

  // 创建单个 tl-item DOM 元素并插入到 todayGroup 中
  function createNewsItem(headline, todayGroup, minuteCounterRef, lastUpdatedEl, todayMarker) {
    var srcKey = headline.src;
    var domain = SOURCES[srcKey] || 'news.ycombinator.com';
    var domainInitial = domain.charAt(0).toUpperCase();
    var faviconUrl = 'https://ico.la4.cn/ico.php?url=' + domain;

    var item = document.createElement('a');
    item.className = 'tl-item news-flash';
    item.href = '#';
    item.target = '_blank';
    item.rel = 'noopener';

    item.setAttribute('data-category', 'release');

    item.innerHTML =
      '<span class="tl-time">' + getCurrentTimeStr() + '</span>' +
      '<span class="tl-source">' +
        '<img class="tl-source-img" src="' + faviconUrl + '" alt="" width="14" height="14" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="tl-source-fallback">' + domainInitial + '</span>' +
        '<span class="tl-source-label">' + srcKey + '</span>' +
      '</span>' +
      '<span class="tl-title">' + headline.title + '</span>' +
      '<span class="tl-arrow">&#x27A4;</span>';

    // 插入动画：先隐藏，再渐入
    item.style.opacity = '0';
    item.style.transform = 'translateY(-12px)';
    todayGroup.insertBefore(item, todayGroup.firstChild);

    requestAnimationFrame(function () {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });

    // 动画结束后清理内联样式
    setTimeout(function () {
      item.style.transition = '';
      item.style.transform = '';
      item.style.opacity = '';
    }, 600);

    // 闪烁更新时间文字
    if (lastUpdatedEl) {
      minuteCounterRef.current = 0;
      lastUpdatedEl.textContent = 'Updated just now';
      lastUpdatedEl.style.color = 'var(--gold)';
      lastUpdatedEl.style.transition = 'color 0.3s';
      setTimeout(function () {
        lastUpdatedEl.style.color = '';
      }, 2000);
    }

    // 脉冲标记点动画
    if (todayMarker) {
      var dot = todayMarker.querySelector('.tl-day-dot');
      if (dot) {
        dot.style.animation = 'none';
        dot.offsetHeight; // 强制重排以重新触发动画
        dot.style.animation = 'tlPulse 1.5s ease 2';
      }
    }
  }

  // ── NewsPage 组件 ──
  function NewsPage() {
    var usedIndicesRef = useRef([]);
    var minuteCounterRef = useRef(0);

    // 1. 实时 "Updated" 计时器：每分钟递增，更新 #lastUpdated 文本
    useEffect(function () {
      var el = document.getElementById('lastUpdated');
      if (!el) return;

      var timer = setInterval(function () {
        minuteCounterRef.current++;
        var m = minuteCounterRef.current;
        if (m < 60) {
          el.textContent = 'Updated ' + m + ' min ago';
        } else {
          el.textContent = 'Updated ' + Math.floor(m / 60) + 'h ' + (m % 60) + 'm ago';
        }
      }, 60000);

      return function () { clearInterval(timer); };
    }, []);

    // 2. 模拟实时数据推送：入场动画完成后(~4.5s)首次推送，之后每18-35秒推送一条
    useEffect(function () {
      var todayGroup = document.querySelector('.tl-day-group[data-day="today"] .tl-items');
      var lastUpdatedEl = document.getElementById('lastUpdated');
      var todayMarker = document.querySelector('.tl-day-group[data-day="today"] .tl-day-marker');

      if (!todayGroup) return;

      // 定时推送逻辑
      function scheduleNext() {
        var delay = 18000 + Math.random() * 17000;
        return setTimeout(function () {
          var headline = fetchNextHeadline(usedIndicesRef);
          createNewsItem(headline, todayGroup, minuteCounterRef, lastUpdatedEl, todayMarker);
          timerId = scheduleNext();
        }, delay);
      }

      // 首次推送延迟（等待入场动画完成）
      var initialTimer = setTimeout(function () {
        var headline = fetchNextHeadline(usedIndicesRef);
        createNewsItem(headline, todayGroup, minuteCounterRef, lastUpdatedEl, todayMarker);
        timerId = scheduleNext();
      }, 4500);

      var timerId = null;

      return function () {
        clearTimeout(initialTimer);
        if (timerId) clearTimeout(timerId);
      };
    }, []);

    // 3. 注入 tl-ping 关键帧样式（仅一次）
    useEffect(function () {
      if (document.getElementById('tl-ping-style')) return;
      var style = document.createElement('style');
      style.id = 'tl-ping-style';
      style.textContent =
        '@keyframes tlPulse {' +
          '0%, 100% { box-shadow: 0 0 0 0 rgba(245,197,24,0.6); }' +
          '50% { box-shadow: 0 0 0 8px rgba(245,197,24,0); }' +
        '}' +
        '.tl-day-dot {' +
          'transition: box-shadow 0.3s ease;' +
        '}';
      document.head.appendChild(style);
    }, []);

    // 4. 时间线导航：scroll tracking + click smooth scroll
    useEffect(function () {
      var nav = document.getElementById('tlNav');
      var sidebar = document.getElementById('tlSidebar');
      if (!nav) return;

      var items = nav.querySelectorAll('.tl-sidebar-item');
      var groups = document.querySelectorAll('.tl-day-group');
      if (!groups.length) return;

      // 侧边栏滚动显示/隐藏
      function updateSidebarVisibility() {
        if (!sidebar) return;
        if (window.scrollY > 200) {
          sidebar.classList.add('is-ready');
        } else {
          sidebar.classList.remove('is-ready');
        }
      }

      // 点击导航项平滑滚动到对应日期组
      function onClick(e) {
        e.preventDefault();
        var target = this.getAttribute('data-target');
        var el = document.querySelector('.tl-day-group[data-day="' + target + '"]');
        if (el) {
          var offset = 100;
          var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }

      items.forEach(function (item) {
        item.addEventListener('click', onClick);
      });

      // 根据滚动位置标记当前活跃的导航项
      function updateActive() {
        var activeIndex = -1;
        for (var i = groups.length - 1; i >= 0; i--) {
          var rect = groups[i].getBoundingClientRect();
          if (rect.top <= 140) {
            activeIndex = i;
            break;
          }
        }
        if (activeIndex === -1) activeIndex = 0;

        items.forEach(function (item) { item.classList.remove('active'); });
        if (items[activeIndex]) items[activeIndex].classList.add('active');
      }

      // 节流滚动监听
      var ticking = false;
      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(function () {
            updateActive();
            updateSidebarVisibility();
            ticking = false;
          });
          ticking = true;
        }
      }
      // 使用 passive: true 提升滚动性能（client-passive-event-listeners 规则）
      window.addEventListener('scroll', onScroll, { passive: true });

      // 初始更新
      updateActive();
      updateSidebarVisibility();

      return function () {
        items.forEach(function (item) {
          item.removeEventListener('click', onClick);
        });
        window.removeEventListener('scroll', onScroll);
      };
    }, []);

    // 组件无 DOM 输出——所有副作用通过 DOM 操作作用于已有的 HTML 结构
    return null;
  }

  // ── 注册到 GHRANK ──
  // 如果 GHRANK 已加载（core.js 先于本文件），立即注册
  // 否则等待 core.js 加载后再注册
  function register() {
    if (window.GHRANK && GHRANK.mountChrome) {
      GHRANK.mountChrome('news', NewsPage);
    } else {
      // core.js 尚未加载，轮询等待
      var check = setInterval(function () {
        if (window.GHRANK && GHRANK.mountChrome) {
          clearInterval(check);
          GHRANK.mountChrome('news', NewsPage);
        }
      }, 50);
      // 安全超时：10秒后停止轮询
      setTimeout(function () { clearInterval(check); }, 10000);
    }
  }

  // DOM 就绪后注册
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', register);
  } else {
    register();
  }
})();
