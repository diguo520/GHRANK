/* ═══════════════════════════════════════════════════════════════
   SEARCH RESULTS PAGE — React 19 组件模式
   ────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   加载方式：HTML 页面通过 <script type="text/babel" src="../js/search.js"> 引入

   职责：管理搜索结果页的入场动画、搜索交互、过滤、分页、相关搜索等。
   注意：页面静态结构已由 search.html 提供，本组件不重复渲染内容，
        仅通过 useEffect 绑定到已有 DOM 元素控制动画与交互。
   
   搜索覆盖层逻辑已由 core.js 的 React SearchOverlay 组件接管，
   本页不再重复实现。
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useCallback, useRef, useMemo } = React;

  /* ═══════════════════════════════════════════════════════════════
     搜索数据（组件外部，避免每次渲染重新创建）
     ═══════════════════════════════════════════════════════════════ */
  var allData = {
    repos: [
      { name: 'facebook/react', desc: 'The library for web and native user interfaces. A declarative, efficient, and flexible JavaScript library.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '230K', forks: '46.8K', lang: 'JS', growth: '+8.2%', time: '2h ago', url: 'detail.html', sparkline: [12,10,11,7,8,4,3] },
      { name: 'nextjs/next.js', desc: 'The React Framework for the Web. Full-stack web applications used by some of the world\'s largest companies.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '128K', forks: '27.3K', lang: 'TS', growth: '+11.6%', time: '1h ago', url: 'detail.html', sparkline: [12,10,9,8,6,5,3] },
      { name: 'vercel/next.js', desc: 'The React Framework for the Web — maintained by Vercel with first-class DX and deployment.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '128K', forks: '27.3K', lang: 'TS', growth: '+10.8%', time: '3h ago', url: 'detail.html', sparkline: [13,11,10,8,7,5,3] },
      { name: 'mui/material-ui', desc: 'Ready-to-use Material Design components for React. Accessible, customizable, and open source.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '95.8K', forks: '43.2K', lang: 'TS', growth: '+7.4%', time: '5h ago', url: 'detail.html', sparkline: [10,9,10,8,7,6,5] },
      { name: 'vuejs/core', desc: 'The Progressive JavaScript Framework. Approachable, performant and versatile for building web UIs.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '48.2K', forks: '9.8K', lang: 'TS', growth: '+12.7%', time: '1h ago', url: 'detail.html', sparkline: [13,11,9,7,5,3,2] },
      { name: 'shadcn-ui/ui', desc: 'Beautifully designed components built with Radix UI and Tailwind CSS. Accessible and customizable.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '81.4K', forks: '4.6K', lang: 'TS', growth: '+22.4%', time: '20m ago', url: 'detail.html', sparkline: [15,13,10,8,5,3,1] },
      { name: 'langchain-ai/langchain', desc: 'Build context-aware reasoning applications. Framework for apps powered by language models.', type: 'repo', tag: 'AI/ML', tagClass: 'tag-ai', stars: '96.7K', forks: '14.2K', lang: 'Py', growth: '+18.1%', time: '30m ago', url: 'detail.html', sparkline: [14,12,10,7,5,3,1] },
      { name: 'openai/whisper', desc: 'Robust Speech Recognition via Large-Scale Weak Supervision by OpenAI.', type: 'repo', tag: 'AI/ML', tagClass: 'tag-ai', stars: '72.8K', forks: '8.4K', lang: 'Py', growth: '+15.3%', time: '3h ago', url: 'detail.html', sparkline: [14,12,10,8,5,4,2] },
      { name: 'torvalds/linux', desc: 'Linux kernel source tree. The core of the Linux operating system.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '182K', forks: '38.2K', lang: 'C', growth: '+3.1%', time: '4h ago', url: 'detail.html', sparkline: [8,9,7,10,9,8,7] },
      { name: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '99.8K', forks: '16.1K', lang: 'Rust', growth: '+6.3%', time: '3h ago', url: 'detail.html', sparkline: [10,9,11,9,8,7,6] },
      { name: 'docker/engine', desc: 'Docker Engine — open source containerization technology.', type: 'repo', tag: 'DevOps', tagClass: 'tag-devops', stars: '69.4K', forks: '18.9K', lang: 'Go', growth: '+5.6%', time: '6h ago', url: 'detail.html', sparkline: [10,9,10,8,7,6,5] },
      { name: 'godotengine/godot', desc: 'Godot Engine — Multi-platform 2D and 3D game engine.', type: 'repo', tag: 'Games', tagClass: 'tag-games', stars: '95.3K', forks: '21.4K', lang: 'GDScript', growth: '+9.4%', time: '1h ago', url: 'detail.html', sparkline: [12,10,11,8,6,5,3] },
      { name: 'tiangolo/fastapi', desc: 'FastAPI framework, high performance, easy to learn, fast to code.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '82.1K', forks: '6.7K', lang: 'Py', growth: '+7.8%', time: '45m ago', url: 'detail.html', sparkline: [10,9,8,9,7,6,5] },
      { name: 'denoland/deno', desc: 'A modern runtime for JavaScript and TypeScript. Secure by default.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '98.2K', forks: '5.4K', lang: 'TS', growth: '+8.9%', time: '2h ago', url: 'detail.html', sparkline: [10,9,8,7,6,5,5] },
      { name: 'flutter/flutter', desc: "Google's UI toolkit for building natively compiled applications.", type: 'repo', tag: 'Mobile', tagClass: 'tag-mobile', stars: '164K', forks: '27.8K', lang: 'Dart', growth: '+4.7%', time: '1h ago', url: 'detail.html', sparkline: [9,10,9,8,8,7,7] },
      { name: 'kubernetes/kubernetes', desc: 'Production-Grade Container Scheduling and Management.', type: 'repo', tag: 'DevOps', tagClass: 'tag-devops', stars: '112K', forks: '39.4K', lang: 'Go', growth: '+6.8%', time: '2h ago', url: 'detail.html', sparkline: [10,10,9,9,8,7,6] }
    ],
    prompts: [
      { name: 'React Component Generator', desc: 'Generate production-ready React components with TypeScript, hooks, and Tailwind CSS styling.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$9.99', rating: '4.8', uses: '3.2K', time: '2h ago', url: 'prompt-detail.html' },
      { name: 'React Testing Master', desc: 'Create comprehensive test suites for React components using Jest and React Testing Library.', type: 'prompt', model: 'Claude', modelClass: 'tag-claude', price: '$7.49', rating: '4.9', uses: '1.8K', time: '5h ago', url: 'prompt-detail.html' },
      { name: 'Next.js API Route Builder', desc: 'Build production-grade API routes with authentication, validation, and error handling.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$12.99', rating: '4.7', uses: '2.4K', time: '1h ago', url: 'prompt-detail.html' },
      { name: 'UI Component Library Generator', desc: 'Generate a complete design system with React components and Storybook stories.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$14.99', rating: '4.6', uses: '856', time: '8h ago', url: 'prompt-detail.html' },
      { name: 'React Performance Optimizer', desc: 'Analyze and optimize React app performance — memoization, code splitting, lazy loading.', type: 'prompt', model: 'Claude', modelClass: 'tag-claude', price: '$6.99', rating: '4.8', uses: '1.2K', time: '3h ago', url: 'prompt-detail.html' },
      { name: 'Redux State Architect', desc: 'Design scalable Redux/RTK state management with best practices and type safety.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$8.49', rating: '4.5', uses: '943', time: '12h ago', url: 'prompt-detail.html' },
      { name: 'Cinematic Portrait Generator', desc: 'Generate photorealistic cinematic portraits with dramatic lighting, film grain, and bokeh.', type: 'prompt', model: 'Midjourney', modelClass: 'tag-midjourney', price: '$4.99', rating: '4.9', uses: '8.1K', time: '30m ago', url: 'prompt-detail.html' },
      { name: 'Code Review Assistant v3', desc: 'Advanced code review — quality, security, performance analysis with fixes.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$9.99', rating: '4.7', uses: '5.6K', time: '1h ago', url: 'prompt-detail.html' },
      { name: 'API Documentation Generator', desc: 'Auto-generate OpenAPI specs and endpoint docs from code.', type: 'prompt', model: 'Custom', modelClass: 'tag-custom', price: '$7.99', rating: '4.6', uses: '1.6K', time: '4h ago', url: 'prompt-detail.html' },
      { name: 'SEO Blog Writer Pro', desc: 'SEO-optimized blog posts with keyword integration.', type: 'prompt', model: 'Claude', modelClass: 'tag-claude', price: '$8.49', rating: '4.8', uses: '2.1K', time: '2h ago', url: 'prompt-detail.html' },
      { name: 'Logo Concept Generator', desc: 'Generate unique logo concepts with brand identity.', type: 'prompt', model: 'DALL-E 3', modelClass: 'tag-dalle', price: '$6.49', rating: '4.5', uses: '1.4K', time: '6h ago', url: 'prompt-detail.html' },
      { name: 'Regex Pattern Builder', desc: 'Generate and explain complex regex patterns.', type: 'prompt', model: 'Llama 3', modelClass: 'tag-llama', price: '$2.49', rating: '4.4', uses: '678', time: '1d ago', url: 'prompt-detail.html' }
    ],
    community: [
      { name: 'React Best Practices — 2026 Edition', desc: 'Community-curated guide to React patterns, anti-patterns, and best practices for modern development.', type: 'community', members: '12.4K', replies: '847', time: '2h ago', url: '#' },
      { name: 'State Management Comparison Thread', desc: 'In-depth comparison of Redux, Zustand, Jotai, and Valtio for React state management.', type: 'community', members: '5.8K', replies: '1,243', time: '1d ago', url: '#' },
      { name: 'React Performance Optimization Tips', desc: 'Community tips and tricks for optimizing React application performance.', type: 'community', members: '8.2K', replies: '634', time: '3d ago', url: '#' }
    ]
  };

  /* ═══════════════════════════════════════════════════════════════
     工具函数 —— 保持与原版相同的函数签名
     ═══════════════════════════════════════════════════════════════ */
  function highlight(text, query) {
    if (!query) return text;
    var safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('(' + safe + ')', 'gi');
    return text.replace(regex, '<span class="sr-highlight">$1</span>');
  }

  function sparklineSVG(data) {
    var max = Math.max.apply(null, data);
    var min = Math.min.apply(null, data);
    var range = max - min || 1;
    var points = data.map(function(v, i) {
      var x = (i / (data.length - 1)) * 48;
      var y = 16 - ((v - min) / range) * 14;
      return x + ',' + y;
    }).join(' ');
    return '<svg class="sr-card-sparkline" width="48" height="16" viewBox="0 0 48 16">' +
      '<polyline fill="none" stroke="var(--green)" stroke-width="1.5" points="' + points + '"/>' +
      '</svg>';
  }

  function renderRepoCard(item, query) {
    var initial = item.name.charAt(0).toUpperCase();
    return '<a href="' + item.url + '" class="sr-card">' +
      '<div class="sr-card-glow"></div>' +
      '<div class="sr-card-inner">' +
        '<div class="sr-card-top">' +
          '<div class="sr-card-avatar">' + initial + '</div>' +
          '<div class="sr-card-info">' +
            '<span class="sr-card-type-badge type-repo">REPO</span>' +
            '<div class="sr-card-title">' + highlight(item.name, query) + '</div>' +
            '<div class="sr-card-desc">' + item.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="sr-card-tags"><span class="tag ' + item.tagClass + '">' + item.tag + '</span></div>' +
        '<div class="sr-card-meta">' +
          '<div class="sr-card-meta-left">' +
            '<span class="sr-card-meta-stat"><span class="icon">&#9733;</span> ' + item.stars + '</span>' +
            '<span class="sr-card-meta-stat"><span class="icon">&#9881;</span> ' + item.forks + '</span>' +
            '<span class="sr-card-meta-stat"><span class="lang-dot" style="background:#555;display:inline-block;width:8px;height:8px;border-radius:50;"></span> ' + item.lang + '</span>' +
          '</div>' +
          '<div class="sr-card-meta-right">' +
            '<span class="sr-card-growth-badge">' + item.growth + '</span>' +
            sparklineSVG(item.sparkline) +
          '</div>' +
        '</div>' +
        '<div class="sr-card-time">Updated ' + item.time + '</div>' +
      '</div>' +
    '</a>';
  }

  function renderPromptCard(item, query) {
    var initial = item.name.charAt(0).toUpperCase();
    return '<a href="' + item.url + '" class="sr-card">' +
      '<div class="sr-card-glow"></div>' +
      '<div class="sr-card-inner">' +
        '<div class="sr-card-top">' +
          '<div class="sr-card-avatar type-prompt">' + initial + '</div>' +
          '<div class="sr-card-info">' +
            '<span class="sr-card-type-badge type-prompt">PROMPT</span>' +
            '<div class="sr-card-title">' + highlight(item.name, query) + '</div>' +
            '<div class="sr-card-desc">' + item.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="sr-card-tags"><span class="search-result-model-tag ' + item.modelClass + '">' + item.model + '</span></div>' +
        '<div class="sr-card-meta">' +
          '<div class="sr-card-meta-left">' +
            '<span class="sr-card-meta-stat"><span class="icon">&#9733;</span> ' + item.rating + '</span>' +
            '<span class="sr-card-meta-stat"><span class="icon">&#9655;</span> ' + item.uses + ' uses</span>' +
          '</div>' +
          '<div class="sr-card-meta-right">' +
            '<span style="font-family:var(--font-display);font-size:18px;font-weight:700;color:var(--gold);">' + item.price + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="sr-card-time">Updated ' + item.time + '</div>' +
      '</div>' +
    '</a>';
  }

  function renderCommunityCard(item, query) {
    var initial = item.name.charAt(0).toUpperCase();
    return '<a href="' + item.url + '" class="sr-card">' +
      '<div class="sr-card-glow"></div>' +
      '<div class="sr-card-inner">' +
        '<div class="sr-card-top">' +
          '<div class="sr-card-avatar type-news" style="background:rgba(88,166,255,0.1);border-color:rgba(88,166,255,0.3);color:var(--blue);">' + initial + '</div>' +
          '<div class="sr-card-info">' +
            '<span class="sr-card-type-badge type-community">COMMUNITY</span>' +
            '<div class="sr-card-title">' + highlight(item.name, query) + '</div>' +
            '<div class="sr-card-desc">' + item.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="sr-card-meta">' +
          '<div class="sr-card-meta-left">' +
            '<span class="sr-card-meta-stat"><span class="icon">&#128101;</span> ' + item.members + ' members</span>' +
            '<span class="sr-card-meta-stat"><span class="icon">&#128172;</span> ' + item.replies + ' replies</span>' +
          '</div>' +
        '</div>' +
        '<div class="sr-card-time">Last active ' + item.time + '</div>' +
      '</div>' +
    '</a>';
  }

  /* ═══════════════════════════════════════════════════════════════
     SearchPage 组件
     ═══════════════════════════════════════════════════════════════ */
  function SearchPage() {
    var [currentType, setCurrentType] = useState('repos');
    var [currentSortIdx, setCurrentSortIdx] = useState(0);

    var sortOptions = ['Relevance', 'Stars', 'Recently Updated', 'Name A-Z'];

    /* ── 1. 搜索结果渲染函数 ── */
    var renderResults = useCallback(function () {
      var grid = document.getElementById('searchResultsGrid');
      var input = document.getElementById('searchPageInput');
      var statusQuery = document.getElementById('searchStatusQuery');
      var statusCount = document.getElementById('searchStatusCount');
      var noResults = document.getElementById('searchNoResults');
      var pagination = document.getElementById('searchPagination');

      if (!grid || !input) return;

      var query = input.value.trim().toLowerCase();
      var data = allData[currentType] || [];
      var results = query ? data.filter(function(item) {
        return item.name.toLowerCase().indexOf(query) !== -1 ||
               item.desc.toLowerCase().indexOf(query) !== -1 ||
               (item.tag && item.tag.toLowerCase().indexOf(query) !== -1) ||
               (item.model && item.model.toLowerCase().indexOf(query) !== -1) ||
               (item.category && item.category.toLowerCase().indexOf(query) !== -1);
      }) : data;

      // 更新状态栏
      if (statusQuery) statusQuery.textContent = '"' + (input.value.trim() || '*') + '"';
      if (statusCount) statusCount.textContent = 'Showing ' + results.length + ' results';

      if (results.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        if (pagination) pagination.style.display = 'none';
        return;
      }

      if (noResults) noResults.style.display = 'none';
      grid.style.display = '';
      if (pagination) pagination.style.display = '';

      var html = '';
      results.forEach(function(item) {
        switch (item.type) {
          case 'repo': html += renderRepoCard(item, input.value.trim()); break;
          case 'prompt': html += renderPromptCard(item, input.value.trim()); break;
          case 'community': html += renderCommunityCard(item, input.value.trim()); break;
        }
      });
      grid.innerHTML = html;

      // 鼠标悬停光晕效果通过 CSS 自定义属性 + 事件委托实现
      // 不再为每张卡片单独绑定 mousemove（避免内存泄漏）
    }, [currentType]);

    /* ── 3. 搜索输入与按钮事件 ── */
    useEffect(function () {
      var input = document.getElementById('searchPageInput');
      var clearBtn = document.getElementById('searchClear');
      var submitBtn = document.getElementById('searchSubmit');

      if (!input) return;

      // 初始渲染
      renderResults();

      // 实时搜索输入
      function handleInput() {
        renderResults();
      }

      // 提交按钮
      function handleSubmit() {
        renderResults();
      }

      // 清除按钮
      function handleClear() {
        input.value = '';
        input.focus();
        renderResults();
      }

      // 回车键触发搜索
      function handleKeydown(e) {
        if (e.key === 'Enter') {
          renderResults();
        }
      }

      input.addEventListener('input', handleInput);
      if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
      if (clearBtn) clearBtn.addEventListener('click', handleClear);
      input.addEventListener('keydown', handleKeydown);

      return function cleanup() {
        input.removeEventListener('input', handleInput);
        if (submitBtn) submitBtn.removeEventListener('click', handleSubmit);
        if (clearBtn) clearBtn.removeEventListener('click', handleClear);
        input.removeEventListener('keydown', handleKeydown);
      };
    }, [renderResults]);

    /* ── 4. 类型过滤（Filter Chips）── */
    useEffect(function () {
      var filterChips = document.querySelectorAll('.search-filter-chip');

      function handleClick(e) {
        var chip = e.currentTarget;
        filterChips.forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');

        var newType = chip.getAttribute('data-type');
        setCurrentType(newType);
      }

      filterChips.forEach(function(chip) {
        chip.addEventListener('click', handleClick);
      });

      return function cleanup() {
        filterChips.forEach(function(chip) {
          chip.removeEventListener('click', handleClick);
        });
      };
    }, []);

    // 当类型变化时重新渲染结果
    useEffect(function () {
      renderResults();
    }, [currentType, renderResults]);

    /* ── 5. 排序下拉菜单 ── */
    useEffect(function () {
      var sortBtn = document.getElementById('searchSortBtn');
      var sortLabel = document.getElementById('searchSortLabel');

      if (!sortBtn || !sortLabel) return;

      function handleSortClick(e) {
        e.stopPropagation();
        var existing = document.querySelector('.search-sort-dropdown');
        if (existing) {
          existing.remove();
          return;
        }

        var dropdown = document.createElement('div');
        dropdown.className = 'search-sort-dropdown open';
        sortOptions.forEach(function(opt, idx) {
          var btn = document.createElement('button');
          btn.className = 'search-sort-option' + (idx === currentSortIdx ? ' active' : '');
          btn.textContent = opt;
          btn.addEventListener('click', function(evt) {
            evt.stopPropagation();
            setCurrentSortIdx(idx);
            sortLabel.textContent = opt;
            dropdown.remove();
            renderResults();
          });
          dropdown.appendChild(btn);
        });
        sortBtn.style.position = 'relative';
        sortBtn.appendChild(dropdown);
      }

      function handleOutsideClick() {
        var dropdown = document.querySelector('.search-sort-dropdown');
        if (dropdown) dropdown.remove();
      }

      sortBtn.addEventListener('click', handleSortClick);
      document.addEventListener('click', handleOutsideClick);

      return function cleanup() {
        sortBtn.removeEventListener('click', handleSortClick);
        document.removeEventListener('click', handleOutsideClick);
      };
    }, [currentSortIdx, renderResults]);

    /* ── 6. 相关搜索标签 ── */
    useEffect(function () {
      var relatedTags = document.querySelectorAll('.related-search-tag');

      function handleClick(e) {
        e.preventDefault();
        var input = document.getElementById('searchPageInput');
        if (!input) return;
        input.value = e.currentTarget.textContent;
        renderResults();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      relatedTags.forEach(function(tag) {
        tag.addEventListener('click', handleClick);
      });

      return function cleanup() {
        relatedTags.forEach(function(tag) {
          tag.removeEventListener('click', handleClick);
        });
      };
    }, [renderResults]);

    /* ── 7. 分页按钮 ── */
    useEffect(function () {
      var pageBtns = document.querySelectorAll('#searchPagination .page-btn');

      function handleClick(e) {
        document.querySelectorAll('#searchPagination .page-btn').forEach(function(b) { b.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      pageBtns.forEach(function(btn) {
        btn.addEventListener('click', handleClick);
      });

      return function cleanup() {
        pageBtns.forEach(function(btn) {
          btn.removeEventListener('click', handleClick);
        });
      };
    }, []);

    /* ── 8. 搜索结果鼠标光晕（事件委托，仅绑定一次） ── */
    useEffect(function () {
      var grid = document.getElementById('searchResultsGrid');
      if (!grid) return;

      // 事件委托：在 grid 上监听一次，动态卡片无需单独绑定
      function handleMouseMove(e) {
        var card = e.target.closest('.sr-card');
        if (!card) return;
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      }

      grid.addEventListener('mousemove', handleMouseMove);

      return function cleanup() {
        grid.removeEventListener('mousemove', handleMouseMove);
      };
    }, []);

    // 静态内容由 search.html 提供，组件本身不渲染内容
    return null;
  }

  /* ═══════════════════════════════════════════════════════════════
     自动挂载 —— 等待 GHRANK 就绪后挂载 SearchPage
     原因：text/babel 脚本按文档顺序执行，search.js 可能在 core.js 之前
     ═══════════════════════════════════════════════════════════════ */
  function mountWhenReady() {
    if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
      global.GHRANK.mountChrome('search', SearchPage);
    } else {
      setTimeout(mountWhenReady, 50);
    }
  }

  mountWhenReady();
})(window);