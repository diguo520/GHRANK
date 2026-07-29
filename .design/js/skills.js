/* ═══════════════════════════════════════════════════════════════════════
   skills.js — GHRANK Skills Market 页面交互层
   职责：
     · skills.html：榜单筛选、搜索、分类、无限滚动
     · skills-detail.html：Skill 元信息、README 渲染、安装命令复制
     · skills-owner.html：作者主页与技能列表
   依赖：skills-data.js 暴露的 window.SkillsData
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DATA = global.SkillsData;
  if (!DATA || !Array.isArray(DATA.skills)) {
    console.error('[Skills] SkillsData 未找到，页面交互无法初始化');
    return;
  }

  /* ── 通用工具函数 ── */
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getParam(key) {
    var params = new URLSearchParams(window.location.search);
    return params.get(key) || '';
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // 简单的 Markdown → HTML（标题、代码块、行内代码、加粗/斜体、段落）
  function simpleMarkdown(md) {
    if (!md) return '';
    // 移除 YAML frontmatter（位于文档开头的 ---...--- 块）
    md = md.replace(/^---\n[\s\S]*?\n---\n?/, '');
    var html = escapeHtml(md);

    // 代码块（提取可选语言标识，避免把 bash/js 渲染进代码正文）
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function (_, lang, code) {
      var body = code.replace(/^\n|\n$/g, '');
      var langAttr = lang ? ' data-lang="' + escapeHtml(lang) + '"' : '';
      var langLabel = lang ? '<div class="skills-code-lang">' + escapeHtml(lang) + '</div>' : '';
      return '<pre' + langAttr + '>' + langLabel + '<code>' + body + '</code></pre>';
    });

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 标题
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    // 加粗 / 斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // 段落
    var blocks = html.split(/\n\n+/);
    return blocks.map(function (block) {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|pre|ul|ol|blockquote)/.test(block)) return block;
      return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  // 趋势标签：根据 trendingRank 给出升降箭头 + 数值
  function trendHtml(skill) {
    var rank = skill.trendingRank || 250;
    var cls = 'flat';
    var arrow = '\u2014';
    var value = '';
    if (rank <= 200) { cls = 'up'; arrow = '\u25B2'; value = rank; }
    else if (rank >= 300) { cls = 'down'; arrow = '\u25BC'; value = (500 - rank); }
    return '<span class="skills-card-trend ' + cls + '">' +
             '<span class="trend-arrow">' + arrow + '</span>' +
             (value ? '<span class="trend-value">' + value + '</span>' : '') +
           '</span>';
  }

  // Sparkline 柱状图
  function sparklineHtml(points) {
    var bars = points.map(function (p) {
      return '<div class="skills-card-sparkline-bar" style="height:' + p + '%"></div>';
    }).join('');
    return '<div class="skills-card-sparkline">' + bars + '</div>';
  }

  // 分类标签
  function tagsHtml(skill) {
    var tags = [];
    if (skill.category) tags = tags.concat(skill.category);
    if (skill.tags) tags = tags.concat(skill.tags);
    // 去重
    var seen = {};
    var unique = [];
    tags.forEach(function (t) {
      if (t && !seen[t]) { seen[t] = true; unique.push(t); }
    });
    return '<div class="skills-card-tags">' +
      unique.slice(0, 5).map(function (t) {
        return '<span class="skills-card-tag">' + escapeHtml(t) + '</span>';
      }).join('') +
      '</div>';
  }

  // 单个 Skill 卡片 HTML —— 行式列表布局
  function skillCardHtml(skill, rank, sortMode) {
    var href = 'skills-detail.html?id=' + encodeURIComponent(skill.id);
    var statValue = sortMode === 'hot' ? skill.activity8w : skill.installsFormatted;
    // 安装量列头已标明 "Installs"，无需重复显示单位；仅 Hot 模式保留 /8W 区分指标
    var statUnit = sortMode === 'hot' ? ' / 8W' : '';

    return (
      '<article class="skills-card card-fade-in" data-id="' + escapeHtml(skill.id) + '">' +
        '<span class="skills-card-rank">#' + rank + '</span>' +
        trendHtml(skill) +
        '<div class="skills-card-info">' +
          '<h3 class="skills-card-title">' +
            '<a href="' + href + '" class="skills-card-name">' + escapeHtml(skill.name) + '</a>' +
            '<span class="skills-card-repo">' + escapeHtml(skill.repo) + '</span>' +
          '</h3>' +
        '</div>' +
        tagsHtml(skill) +
        '<span class="skills-card-stat"><strong>' + statValue + '</strong>' + statUnit + '</span>' +
        sparklineHtml(skill.sparkline || [30, 40, 35, 50, 45, 60, 55, 70]) +
      '</article>'
    );
  }

  // 复制图标按钮的成功反馈：用对勾图标临时替换，避免覆盖 SVG
  function flashCopyButton(btn, duration) {
    duration = duration || 1200;
    var original = btn.innerHTML;
    btn.classList.add('is-flashed');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8l4 4 8-8"/></svg>';
    setTimeout(function () {
      btn.innerHTML = original;
      btn.classList.remove('is-flashed');
    }, duration);
  }

  // 复制到剪贴板
  function copyToClipboard(text, btn) {
    function onSuccess() { flashCopyButton(btn); }
    function onFail() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onSuccess();
      } catch (e) {
        flashCopyButton(btn);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(onFail);
    } else {
      onFail();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     skills.html — 市场列表页
     ═══════════════════════════════════════════════════════════════ */
  var listState = {
    all: DATA.skills,
    filtered: [],
    sort: 'allTime',
    occupation: 'all',
    domain: 'all',
    subcategory: 'all',
    query: '',
    page: 0,
    pageSize: 6,
    loading: false,
    observer: null
  };

  function sortSkills(skills, mode) {
    var sorted = skills.slice();
    if (mode === 'allTime') {
      sorted.sort(function (a, b) { return b.installs - a.installs; });
    } else if (mode === 'trending') {
      sorted.sort(function (a, b) { return a.trendingRank - b.trendingRank; });
    } else if (mode === 'hot') {
      sorted.sort(function (a, b) { return b.activity8w - a.activity8w; });
    }
    return sorted;
  }

  function applyFilters() {
    var q = listState.query.toLowerCase().trim();
    var occ = listState.occupation;
    var dom = listState.domain;
    var subcat = listState.subcategory;

    var filtered = listState.all.filter(function (skill) {
      // 职业筛选
      if (occ !== 'all' && skill.occupation !== occ) return false;
      // 领域筛选
      if (dom !== 'all' && skill.domain !== dom) return false;
      // 子分类筛选
      if (subcat !== 'all' && skill.subcategory !== subcat) return false;
      // 关键词搜索
      if (!q) return true;
      var hay = (skill.name + ' ' + skill.repo + ' ' + skill.description + ' ' +
                 skill.category.join(' ') + ' ' + skill.tags.join(' ')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    listState.filtered = sortSkills(filtered, listState.sort);
    listState.page = 0;
  }

  function getGrid() {
    return document.getElementById('skillsGrid');
  }

  function getSentinel() {
    return document.getElementById('skillsSentinel');
  }

  function removeSkeletons() {
    var grid = getGrid();
    if (!grid) return;
    // 统一骨架屏类名，与 index/prompt/community 页面保持一致
    var skeletons = grid.querySelectorAll('.skeleton-card.skills-card');
    skeletons.forEach(function (el) { el.remove(); });
  }

  function clearCards() {
    var grid = getGrid();
    if (!grid) return;
    var cards = grid.querySelectorAll('.skills-card');
    cards.forEach(function (el) { el.remove(); });
  }

  // 判断是否还有未加载的数据：当前页起始索引 < 总数据量
  function hasMore() {
    return listState.page * listState.pageSize < listState.filtered.length;
  }

  // 将 sentinel 内容替换为底部结束说明（与 index/prompt/community 页面统一）
  function showEndOfFeed() {
    var sentinel = getSentinel();
    if (!sentinel) return;
    sentinel.classList.remove('loading');
    sentinel.innerHTML = '<div class="scroll-loader" style="opacity:0.4;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;">// END OF FEED</div>';
  }

  // 重置 sentinel 为加载中状态（切换筛选/搜索后数据可能增多，需恢复 spinner）
  function resetSentinel() {
    var sentinel = getSentinel();
    if (!sentinel) return;
    sentinel.classList.add('loading');
    sentinel.innerHTML =
      '<div class="scroll-loader">' +
        '<div class="scroll-loader-spinner"></div>' +
      '</div>';
  }

  // 生成单行骨架屏 HTML —— 列结构匹配 skills-card 的 grid 布局
  function skeletonCardHtml() {
    return '<div class="skeleton-card skills-card">' +
      '<div class="skeleton-line" style="width:28px;height:18px;margin:0 auto"></div>' +
      '<div class="skeleton-line" style="width:20px;height:18px;margin:0 auto"></div>' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div class="skeleton-line medium" style="height:14px;width:130px"></div>' +
        '<div class="skeleton-line short" style="height:12px;width:110px"></div>' +
      '</div>' +
      '<div class="skeleton-line" style="width:60px;height:16px"></div>' +
      '<div class="skeleton-line" style="width:90px;height:14px;margin-left:auto"></div>' +
      '<div class="skeleton-line" style="width:60px;height:24px;margin-left:auto"></div>' +
    '</div>';
  }

  function renderNextBatch() {
    if (listState.loading) return;
    listState.loading = true;

    var grid = getGrid();
    var sentinel = getSentinel();
    if (!grid) { listState.loading = false; return; }

    // 清理残留骨架屏
    removeSkeletons();

    var start = listState.page * listState.pageSize;
    var end = start + listState.pageSize;
    var batch = listState.filtered.slice(start, end);

    // 无数据：直接结束
    if (batch.length === 0) {
      listState.loading = false;
      showEndOfFeed();
      return;
    }

    // 先插入骨架屏占位，提供滚动加载的视觉过渡
    var skelHtml = '';
    for (var i = 0; i < batch.length; i++) {
      skelHtml += skeletonCardHtml();
    }
    if (sentinel) {
      sentinel.insertAdjacentHTML('beforebegin', skelHtml);
    } else {
      grid.insertAdjacentHTML('beforeend', skelHtml);
    }

    // 延迟后用真实卡片替换骨架屏（模拟异步加载，700ms 确保用户能感知骨架屏）
    setTimeout(function () {
      var skeletons = grid.querySelectorAll('.skeleton-card.skills-card');
      batch.forEach(function (skill, idx) {
        var rank = start + idx + 1;
        var html = skillCardHtml(skill, rank, listState.sort);
        if (skeletons[idx]) {
          var temp = document.createElement('div');
          temp.innerHTML = html;
          skeletons[idx].replaceWith(temp.firstElementChild);
        } else if (sentinel) {
          sentinel.insertAdjacentHTML('beforebegin', html);
        }
      });

      listState.page += 1;
      listState.loading = false;

      // 加载完毕：显示底部结束说明
      if (!hasMore()) {
        showEndOfFeed();
      } else {
        if (sentinel) sentinel.classList.remove('loading');
        if (listState.observer) {
          listState.observer.unobserve(sentinel);
          setTimeout(function () {
            if (listState.observer && hasMore()) listState.observer.observe(sentinel);
          }, 50);
        }
      }
    }, 700);
  }

  function refreshList() {
    applyFilters();
    clearCards();
    resetSentinel();
    renderNextBatch();
    // 有更多数据时重建观察器（旧观察器可能因 sentinel 一直在视口内而不触发）
    if (hasMore()) {
      initInfiniteScroll();
    } else if (listState.observer) {
      // 无更多数据：断开旧观察器，避免无谓回调
      listState.observer.disconnect();
      listState.observer = null;
    }
  }

  function initInfiniteScroll() {
    var sentinel = getSentinel();
    if (!sentinel) return;

    if (listState.observer) listState.observer.disconnect();

    listState.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && hasMore() && !listState.loading) {
          sentinel.classList.add('loading');
          // renderNextBatch 内部异步管理 loading 状态：
          // 骨架屏替换完成后自动移除 loading 类或显示 END OF FEED
          renderNextBatch();
        }
      });
    }, { rootMargin: '200px' });

    listState.observer.observe(sentinel);
  }

  /* 骨架屏逐块替换 —— 与 index/prompt 页面统一的 IntersectionObserver 模式
     流程：观察每个 .skeleton-card[data-skeleton-idx] → 进入视口时用真实卡片替换
     → 全部替换完后启动 sentinel 无限滚动 */
  function initSkeletonReplace() {
    var grid = getGrid();
    if (!grid) return;

    var skeletons = grid.querySelectorAll('.skeleton-card.skills-card[data-skeleton-idx]');
    if (skeletons.length === 0 || !('IntersectionObserver' in window)) {
      // 无骨架屏或不支持 Observer，回退到直接渲染
      renderNextBatch();
      if (hasMore()) initInfiniteScroll();
      else showEndOfFeed();
      return;
    }

    var revealedSet = new Set();
    var total = Math.min(listState.filtered.length, skeletons.length);

    var skelObserver = new IntersectionObserver(function (entries) {
      // 收集当前可见且未替换的骨架屏索引
      var batchIndices = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = parseInt(entry.target.getAttribute('data-skeleton-idx'), 10);
          if (!isNaN(idx) && !revealedSet.has(idx)) {
            batchIndices.push(idx);
          }
        }
      });
      if (batchIndices.length === 0) return;

      // 按索引排序后逐个替换为真实卡片
      batchIndices.sort(function (a, b) { return a - b; });
      batchIndices.forEach(function (idx) {
        if (idx >= listState.filtered.length) return;
        var skel = grid.querySelector('.skeleton-card.skills-card[data-skeleton-idx="' + idx + '"]');
        if (!skel || revealedSet.has(idx)) return;
        revealedSet.add(idx);

        var skill = listState.filtered[idx];
        var rank = idx + 1;
        var temp = document.createElement('div');
        temp.innerHTML = skillCardHtml(skill, rank, listState.sort);
        var realCard = temp.firstElementChild;
        skel.replaceWith(realCard);
        skelObserver.unobserve(skel);
      });

      // 全部骨架屏替换完毕：清理残余、更新分页
      if (revealedSet.size >= total) {
        skelObserver.disconnect();
        // 移除未被替换的残余骨架屏（数据不足时）
        var remaining = grid.querySelectorAll('.skeleton-card.skills-card[data-skeleton-idx]');
        remaining.forEach(function (sk) { sk.remove(); });
        listState.page = 1;
        // 数据已全部展示：直接显示结束说明；否则启动无限滚动
        if (!hasMore()) {
          showEndOfFeed();
        } else {
          initInfiniteScroll();
        }
      }
    }, { rootMargin: '200px 0px' });

    skeletons.forEach(function (skel) { skelObserver.observe(skel); });
  }

  function initHeroStats() {
    var totalSkills = DATA.skills.length;
    var totalOwners = DATA.owners.length;
    var totalCategories = DATA.categories.length;
    var totalInstalls = DATA.skills.reduce(function (sum, s) { return sum + (s.installs || 0); }, 0);

    setText('statTotalSkills', DATA.formatNumber(totalSkills));
    setText('statTotalOwners', DATA.formatNumber(totalOwners));
    setText('statTotalCategories', DATA.formatNumber(totalCategories));
    setText('statTotalInstalls', DATA.formatNumber(totalInstalls));
  }

  /* ── 获取当前可用的子分类列表（根据已选 domain 联动）── */
  function getSubcategoryOptions() {
    var tree = DATA.categoryTree || [];
    var dom = listState.domain;
    // 若已选 domain，只返回该 domain 下的子分类；否则返回全部
    var domains = dom !== 'all' ? tree.filter(function (d) { return d.id === dom; }) : tree;
    var result = [];
    domains.forEach(function (d) {
      (d.children || []).forEach(function (c) {
        result.push({ id: c.id, name: c.nameEn || c.name, count: c.count });
      });
    });
    return result;
  }

  /* ── 渲染单个下拉筛选组 ── */
  function renderDropdown(label, filterKey, allLabel, options) {
    var currentVal = listState[filterKey];
    // 查找当前选中项以显示其名称
    var currentOpt = null;
    for (var i = 0; i < options.length; i++) {
      if (options[i].id === currentVal) { currentOpt = options[i]; break; }
    }
    var currentText = currentOpt ? currentOpt.name : allLabel;

    var html = '<div class="skills-filter-group">' +
      '<div class="skills-filter-label">' + escapeHtml(label) + '</div>' +
      '<div class="skills-dropdown" data-filter="' + escapeHtml(filterKey) + '">' +
        '<button class="skills-dropdown-trigger" type="button">' +
          '<span class="skills-dropdown-value">' + escapeHtml(currentText) + '</span>' +
          '<span class="skills-dropdown-chevron">&#9660;</span>' +
        '</button>' +
        '<div class="skills-dropdown-menu">' +
          '<div class="skills-dropdown-option' + (currentVal === 'all' ? ' active' : '') + '" data-value="all">' +
            '<span class="skills-dropdown-option-name">' + escapeHtml(allLabel) + '</span>' +
          '</div>';

    options.forEach(function (opt) {
      html += '<div class="skills-dropdown-option' + (currentVal === opt.id ? ' active' : '') + '" data-value="' + escapeHtml(opt.id) + '">' +
        '<span class="skills-dropdown-option-name">' + escapeHtml(opt.name) + '</span>' +
      '</div>';
    });

    html += '</div></div></div>';
    return html;
  }

  /* ── 渲染整个筛选面板（Occupation / Domain / Category 三维下拉 + Sort 按钮组）── */
  function renderFilters() {
    var body = document.getElementById('skillsFilterBody');
    if (!body) return;

    // Occupation 选项（SOC 职业分类）
    var occOptions = (DATA.occupations || []).map(function (o) {
      return { id: o.id, name: o.nameEn, count: o.count };
    });

    // Domain 选项（顶级领域，来自 CATEGORY_TREE）
    var domOptions = (DATA.categoryTree || []).map(function (d) {
      return { id: d.id, name: d.nameEn, count: d.count };
    });

    // Category 选项（子分类，根据已选 domain 联动）
    var subcatOptions = getSubcategoryOptions();

    // Sort 按钮组
    var sortBtns = '<div class="skills-filter-group">' +
      '<div class="skills-filter-label">Sort</div>' +
      '<div class="skills-filter-btns" data-filter="sort">' +
        '<button class="skills-filter-btn' + (listState.sort === 'allTime' ? ' active' : '') + '" data-value="allTime">All Time</button>' +
        '<button class="skills-filter-btn' + (listState.sort === 'trending' ? ' active' : '') + '" data-value="trending">Trending</button>' +
        '<button class="skills-filter-btn' + (listState.sort === 'hot' ? ' active' : '') + '" data-value="hot">Hot</button>' +
      '</div>' +
    '</div>';

    body.innerHTML =
      renderDropdown('Occupation', 'occupation', 'All Occupations', occOptions) +
      renderDropdown('Domain', 'domain', 'All Domains', domOptions) +
      renderDropdown('Category', 'subcategory', 'All Categories', subcatOptions) +
      sortBtns;
  }

  /* ── 筛选面板交互：下拉展开/选中 + 按钮组 + Clear All ── */
  function initFilterHandlers() {
    var body = document.getElementById('skillsFilterBody');
    if (!body) return;

    // 面板内点击统一委托处理
    body.addEventListener('click', function (e) {
      // 下拉触发器：展开/收起
      var trigger = e.target.closest('.skills-dropdown-trigger');
      if (trigger) {
        var dropdown = trigger.closest('.skills-dropdown');
        body.querySelectorAll('.skills-dropdown.open').forEach(function (d) {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
        return;
      }

      // 下拉选项：选中并刷新列表
      var option = e.target.closest('.skills-dropdown-option');
      if (option) {
        var dd = option.closest('.skills-dropdown');
        var key = dd.getAttribute('data-filter');
        var val = option.getAttribute('data-value');
        listState[key] = val;

        // 同步触发器显示文本
        var nameEl = option.querySelector('.skills-dropdown-option-name');
        var valueEl = dd.querySelector('.skills-dropdown-value');
        if (nameEl && valueEl) valueEl.textContent = nameEl.textContent;

        // 更新选项激活态
        dd.querySelectorAll('.skills-dropdown-option').forEach(function (o) {
          o.classList.toggle('active', o === option);
        });
        dd.classList.remove('open');

        // Domain 变化时重置 subcategory 并重新渲染 Category 下拉
        if (key === 'domain') {
          listState.subcategory = 'all';
          renderFilters();
        }
        refreshList();
        return;
      }

      // 按钮组：切换排序模式
      var btn = e.target.closest('.skills-filter-btn');
      if (btn) {
        var btns = btn.closest('.skills-filter-btns');
        btns.querySelectorAll('.skills-filter-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        listState.sort = btn.getAttribute('data-value');
        refreshList();
        return;
      }
    });

    // 点击面板外部时关闭所有下拉
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.skills-filter-panel')) {
        body.querySelectorAll('.skills-dropdown.open').forEach(function (d) {
          d.classList.remove('open');
        });
      }
    });

    // Clear All：重置全部筛选条件
    var clearBtn = document.getElementById('filterClearAll');
    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        listState.occupation = 'all';
        listState.domain = 'all';
        listState.subcategory = 'all';
        listState.sort = 'allTime';
        listState.query = '';
        var searchInput = document.getElementById('skillSearchInput');
        if (searchInput) searchInput.value = '';
        renderFilters();
        refreshList();
      });
    }
  }

  function initSearchHandler() {
    var input = document.getElementById('skillSearchInput');
    if (!input) return;

    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        listState.query = input.value;
        refreshList();
      }, 200);
    });
  }

  function initListPage() {
    initHeroStats();
    renderFilters();
    initFilterHandlers();
    initSearchHandler();

    // 读取 URL 参数 — 支持从外部跳转后自动筛选
    var urlCategory = getParam('category');
    if (urlCategory) {
      // 尝试匹配 domain 或 subcategory
      var tree = DATA.categoryTree || [];
      var matchedDomain = tree.some(function (d) { return d.id === urlCategory; });
      if (matchedDomain) {
        listState.domain = urlCategory;
        renderFilters();
      } else {
        var searchInput = document.getElementById('skillSearchInput');
        if (searchInput) {
          searchInput.value = urlCategory;
          listState.query = urlCategory;
        }
      }
    }

    applyFilters();
    // 首屏：骨架屏逐块替换，替换完后自动启动 sentinel 无限滚动
    initSkeletonReplace();
  }

  /* ═══════════════════════════════════════════════════════════════
     skills-detail.html — Skill 详情页（参考 skillsmp.com 布局重构）
     ═══════════════════════════════════════════════════════════════ */

  // 从 README 中提取引用文件路径，构建文件浏览器列表
  // 支持 reference/xxx.md、./xxx.md 以及同目录 xxx.md 等相对链接
  function extractFileList(readme) {
    var files = [{ name: 'SKILL.md', path: 'SKILL.md', isMain: true }];
    var re = /\((?:\.\/|reference\/)?([^)\s]+\.md)\)/g;
    var match;
    var seen = {};
    while ((match = re.exec(readme || '')) !== null) {
      var fileName = match[1].split('/').pop();
      if (fileName && fileName.toLowerCase() !== 'skill.md' && !seen[fileName]) {
        seen[fileName] = true;
        files.push({ name: fileName, path: fileName, isMain: false });
      }
    }
    console.log('[Skills] extractFileList:', files.length, files);
    return files;
  }

  // 查找职业名称：优先英文，回退中文
  function findOccupationName(occId) {
    var occ = (DATA.occupations || []).find(function (o) { return o.id === occId; });
    if (!occ) return 'N/A';
    return occ.nameEn || occ.name || occId;
  }

  /* ── 详情页辅助函数 ── */
  function showDetailSkeleton(show) {
    var skeleton = document.getElementById('detailSkeleton');
    var real = document.getElementById('detailReal');
    if (skeleton) skeleton.style.display = show ? 'block' : 'none';
    if (real) real.style.display = show ? 'none' : 'block';
  }

  function renderDetailSparkline(points) {
    var bars = (points || [30, 40, 35, 50, 45, 60, 55, 70]).map(function (p) {
      return '<div class="skills-detail-sparkline-bar" style="height:' + p + '%"></div>';
    }).join('');
    return '<div class="skills-detail-sparkline">' + bars + '</div>';
  }

  function extractSummary(readme, skill) {
    var body = (readme || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
    var lead = skill.description || '';
    // 当 description 过长时，改用 SKILL.md 正文首段作为摘要引导，避免大段文字堆积
    if (lead.length > 200) {
      var bodyWithoutTitle = body.replace(/^#\s+.*\n+/, '');
      var paras = bodyWithoutTitle.split(/\n\n+/);
      for (var i = 0; i < paras.length; i++) {
        var p = paras[i].trim();
        if (p && !/^#{1,6}\s/.test(p)) {
          lead = p.replace(/\n/g, ' ').trim();
          break;
        }
      }
    }
    var bullets = [];
    // 匹配 Markdown 表格：三列，支持表头前后带空格
    var tableMatch = body.match(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|\s*\n\|[-:\s|]+\|\s*\n([\s\S]*?)(?=\n\n|\n##|$)/);
    if (tableMatch) {
      var rows = tableMatch[4].trim().split('\n').slice(0, 5);
      bullets = rows.map(function (row) {
        // Markdown 表格行以 | 开头，分割后首个非空单元格才是第一列
        var cols = row.split('|').map(function (c) { return c.trim(); }).filter(Boolean);
        return cols[0] ? cols[0].replace(/\*\*/g, '') : '';
      }).filter(Boolean);
    }
    if (bullets.length === 0 && skill.tags) {
      bullets = skill.tags.slice(0, 4).map(function (t) {
        return '适用于 ' + t + ' 场景';
      });
    }
    return { lead: lead, bullets: bullets };
  }

  function findRelatedSkills(skill, limit) {
    limit = limit || 4;
    return DATA.skills.filter(function (s) {
      return s.id !== skill.id && (s.domain === skill.domain || s.category.some(function (c) { return skill.category.indexOf(c) !== -1; }));
    }).sort(function (a, b) { return b.installs - a.installs; }).slice(0, limit);
  }

  function initDetailPage() {
    var id = getParam('id');
    var skill = id ? DATA.getSkill(id) : null;

    if (!skill) {
      var name = getParam('name');
      if (name) skill = DATA.getSkillByName(name);
    }

    if (!skill) {
      showDetailSkeleton(false);
      setText('detailName', 'Skill Not Found');
      setText('detailCrumbName', 'Not Found');
      setHtml('detailReadme', '<p>Please check the URL or return to <a href="skills.html">Skills Market</a>.</p>');
      return;
    }

    var owner = DATA.getOwner(skill.owner) || { name: skill.owner, avatar: skill.owner[0].toUpperCase(), totalInstalls: 0, skills: [] };

    document.title = 'GHRANK // ' + skill.name.toUpperCase();

    // 面包屑
    var crumbOwner = document.getElementById('detailCrumbOwner');
    if (crumbOwner) {
      crumbOwner.textContent = owner.name;
      crumbOwner.href = 'skills-owner.html?owner=' + encodeURIComponent(skill.owner);
    }
    setText('detailCrumbName', skill.name);

    // 标题与分类
    setText('detailName', skill.name);
    var cat = DATA.getCategory(skill.category[0]);
    setText('detailCategory', (cat ? cat.name : skill.category[0]).toUpperCase());

    // Command / Prompt 安装命令切换
    var installCmd = skill.installCmd;
    var promptText = 'Use the ' + skill.name + ' skill to ' + (skill.description || '').toLowerCase().replace(/\.$/, '') + '.';
    var installMode = 'command';
    var installCmdEl = document.getElementById('detailInstallCmd');
    var installToggle = document.getElementById('detailInstallToggle');

    function updateInstallMode(mode) {
      installMode = mode;
      if (installCmdEl) installCmdEl.textContent = mode === 'command' ? installCmd : promptText;
      if (installToggle) {
        installToggle.querySelectorAll('.toggle-btn').forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
      }
    }

    if (installToggle) {
      installToggle.addEventListener('click', function (e) {
        var btn = e.target.closest('.toggle-btn');
        if (!btn) return;
        updateInstallMode(btn.getAttribute('data-mode'));
      });
    }
    updateInstallMode('command');

    // 复制按钮
    var copyBtn = document.getElementById('detailCopyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyToClipboard(installMode === 'command' ? installCmd : promptText, copyBtn);
      });
    }

    // 摘要
    var summary = extractSummary(skill.readme, skill);
    setText('detailSummaryLead', summary.lead);
    var summaryList = document.getElementById('detailSummaryList');
    if (summaryList) {
      summaryList.innerHTML = summary.bullets.map(function (b) {
        return '<li>' + escapeHtml(b) + '</li>';
      }).join('');
    }

    // 侧边栏统计
    setText('detailInstalls', skill.installsFormatted);
    setHtml('detailSparkline', renderDetailSparkline(skill.sparkline));
    setText('detailRepo', skill.repo);
    var heroGithubLink = document.getElementById('detailHeroGithubLink');
    if (heroGithubLink) heroGithubLink.href = 'https://github.com/' + skill.repo;
    setText('detailStars', DATA.formatNumber(Math.floor(skill.installs * 0.012)));
    setText('detailFirstSeen', '2026-01-15');

    // 来源
    var ownerEl = document.getElementById('detailOwner');
    if (ownerEl) {
      ownerEl.innerHTML =
        '<a href="skills-owner.html?owner=' + encodeURIComponent(skill.owner) + '" class="skills-detail-avatar">' +
          escapeHtml(owner.avatar || owner.name[0]) +
        '</a>' +
        '<div>' +
          '<a href="skills-owner.html?owner=' + encodeURIComponent(skill.owner) + '" class="skills-detail-owner-name">' + escapeHtml(owner.name) + '</a>' +
          '<div class="skills-detail-owner-stats">' + DATA.formatNumber(owner.totalInstalls) + ' installs \u00b7 ' + owner.skills.length + ' skills</div>' +
        '</div>';
    }
    var ownerName = document.getElementById('detailOwnerName');
    var ownerStats = document.getElementById('detailOwnerStats');
    if (ownerName) {
      ownerName.textContent = owner.name;
      ownerName.href = 'skills-owner.html?owner=' + encodeURIComponent(skill.owner);
    }
    if (ownerStats) ownerStats.textContent = DATA.formatNumber(owner.totalInstalls) + ' installs \u00b7 ' + owner.skills.length + ' skills';
    var ownerLink = document.getElementById('detailOwnerLink');
    if (ownerLink) ownerLink.href = 'skills-owner.html?owner=' + encodeURIComponent(skill.owner);

    // 相关职业 SOC
    var occEl = document.getElementById('detailOccupation');
    if (occEl) {
      occEl.innerHTML = '<span class="occupation-name">' + escapeHtml(findOccupationName(skill.occupation)) + '</span>';
    }

    // 相关技能
    var related = findRelatedSkills(skill, 4);
    var relatedCat = DATA.getCategory(skill.category[0]);
    setText('detailRelatedCat', relatedCat ? relatedCat.name : skill.category[0]);
    var relatedList = document.getElementById('detailRelatedList');
    if (relatedList) {
      if (related.length === 0) {
        relatedList.innerHTML = '<p class="skills-detail-related-sub">No related skills found.</p>';
      } else {
        relatedList.innerHTML = related.map(function (s) {
          return '<a class="skills-detail-related-item" href="skills-detail.html?id=' + encodeURIComponent(s.id) + '">' +
            '<div class="related-info">' +
              '<div class="related-name">' + escapeHtml(s.name) + '</div>' +
              '<div class="related-desc">' + escapeHtml(s.description || '') + '</div>' +
            '</div>' +
            '<div class="related-repo">' + escapeHtml(s.repo) + '</div>' +
          '</a>';
        }).join('');
      }
    }

    // 实际文件目录基础路径：.agents 与 github-leaderboard 同级，
    // 页面位于 /.design/pages/，因此通过 /../ 回到 workspace root 再进入 .agents
    var skillBasePath = '/../.agents/skills/' + skill.name + '/';
    var fileListEl = document.getElementById('detailFileList');

    // 渲染文件列表
    function renderFileList(files) {
      var fileCountEl = document.getElementById('detailFileCount');
      if (fileCountEl) fileCountEl.textContent = files.length + ' file' + (files.length !== 1 ? 's' : '');
      if (fileListEl) {
        fileListEl.innerHTML = files.map(function (f, idx) {
          var sizeKb = f.isMain ? (2 + Math.floor((skill.description || '').length / 200)) : (1 + Math.floor(Math.random() * 3));
          return '<div class="file-item' + (idx === 0 ? ' active' : '') + '" data-file="' + escapeHtml(f.path) + '" data-main="' + (f.isMain ? '1' : '0') + '">' +
            '<span class="file-icon">\u{1F4C4}</span>' +
            '<span class="file-name">' + escapeHtml(f.name) + '</span>' +
            '<span class="file-size">' + sizeKb + '.' + Math.floor(Math.random() * 9) + ' KB</span>' +
          '</div>';
        }).join('');
      }
    }

    function loadReadmeContent(text) {
      skill.readme = text;
      var fileList = extractFileList(skill.readme);
      renderFileList(fileList);
      setText('detailContentFilename', 'SKILL.md');
      setHtml('detailReadme', simpleMarkdown(skill.readme));
      var realSummary = extractSummary(skill.readme, skill);
      if (realSummary.bullets.length > 0) {
        setText('detailSummaryLead', realSummary.lead);
        if (summaryList) {
          summaryList.innerHTML = realSummary.bullets.map(function (b) {
            return '<li>' + escapeHtml(b) + '</li>';
          }).join('');
        }
      }
      showDetailSkeleton(false);
    }

    // 初始渲染生成 README
    var fileList = extractFileList(skill.readme);
    renderFileList(fileList);
    setText('detailContentFilename', 'SKILL.md');
    setHtml('detailReadme', simpleMarkdown(skill.readme));

    // 尝试加载真实 SKILL.md
    fetch(skillBasePath + 'SKILL.md')
      .then(function (res) {
        if (!res.ok) throw new Error('SKILL.md not found');
        return res.text();
      })
      .then(loadReadmeContent)
      .catch(function (err) {
        console.log('[Skills] 未找到真实 SKILL.md，使用生成内容:', err.message);
        showDetailSkeleton(false);
      });

    // 文件列表点击
    if (fileListEl) {
      fileListEl.addEventListener('click', function (e) {
        var item = e.target.closest('.file-item');
        if (!item) return;
        fileListEl.querySelectorAll('.file-item').forEach(function (el) {
          el.classList.remove('active');
        });
        item.classList.add('active');

        var fname = item.querySelector('.file-name');
        if (fname) setText('detailContentFilename', fname.textContent);

        var isMain = item.getAttribute('data-main') === '1';
        if (isMain) {
          setHtml('detailReadme', simpleMarkdown(skill.readme));
          return;
        }

        var path = item.getAttribute('data-file');
        fetch(skillBasePath + path)
          .then(function (res) {
            if (!res.ok) throw new Error('File not found');
            return res.text();
          })
          .then(function (text) {
            setHtml('detailReadme', simpleMarkdown(text));
          })
          .catch(function () {
            setHtml('detailReadme', '<p>Failed to load file: ' + escapeHtml(path) + '</p>');
          });
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     skills-owner.html — 作者主页
     ═══════════════════════════════════════════════════════════════ */
  function initOwnerPage() {
    var ownerId = getParam('owner');
    var owner = ownerId ? DATA.getOwner(ownerId) : null;

    if (!owner) {
      document.body.insertAdjacentHTML('afterbegin',
        '<div class="skills-hero"><h1 class="skills-hero-title">Owner Not Found</h1>' +
        '<p class="skills-hero-sub"><a href="skills.html">Return to Skills Market</a></p></div>');
      return;
    }

    var main = document.querySelector('.main-content');
    if (!main) return;

    var ownerSkills = DATA.skills.filter(function (s) { return s.owner === owner.id; });

    var heroHtml =
      '<section class="skills-hero">' +
        '<div class="skills-hero-badge">&#9670; SKILL CREATOR &#9670;</div>' +
        '<h1 class="skills-hero-title"><span class="gold-glow">' + escapeHtml(owner.name) + '</span></h1>' +
        '<p class="skills-hero-sub">' + DATA.formatNumber(owner.totalInstalls) + ' total installs · ' + ownerSkills.length + ' skills published</p>' +
      '</section>';

    var gridHtml = '<div class="skills-grid" id="ownerSkillsGrid">';
    ownerSkills.forEach(function (skill, i) {
      gridHtml += skillCardHtml(skill, i + 1, 'allTime');
    });
    gridHtml += '</div>';

    main.innerHTML = heroHtml + gridHtml;
  }

  /* ═══════════════════════════════════════════════════════════════
     skills-categories.html — 分类排行页
     每个分类展示 Top 10 技能排行，趋势箭头替代统计数字
     统一骨架屏 + IntersectionObserver + 数据分块加载
     ═══════════════════════════════════════════════════════════════ */

  // 分类页状态
  var catState = {
    sections: [],      // 预计算：[{ cat, topSkills }] 各分类 Top 10
    page: 0,           // 已渲染的分类数
    pageSize: 2,       // 后续每批加载 2 个分类
    loading: false,
    observer: null
  };

  function getCatList() { return document.getElementById('categoryList'); }
  function getCatSentinel() { return document.getElementById('catSentinel'); }

  // 骨架屏区块 —— 与首屏硬编码骨架屏结构一致，用于后续批次
  function catSkeletonHtml() {
    var rows = '';
    for (var i = 0; i < 5; i++) {
      rows += '<div class="skeleton-line" style="height:32px"></div>';
    }
    return (
      '<div class="skeleton-card skills-cat-section">' +
        '<div class="skills-cat-section-header">' +
          '<div class="skeleton-line" style="width:44px;height:44px;flex-shrink:0"></div>' +
          '<div style="flex:1">' +
            '<div class="skeleton-line" style="height:18px;width:140px"></div>' +
            '<div class="skeleton-line" style="height:12px;width:90px;margin-top:6px"></div>' +
          '</div>' +
        '</div>' +
        '<div class="skills-cat-section-body">' + rows + '</div>' +
      '</div>'
    );
  }

  // 分类排行行 —— 排名 + 名称 + 仓库 + 趋势箭头（无 Tag）
  function catSkillRowHtml(skill, rank) {
    var href = 'skills-detail.html?id=' + encodeURIComponent(skill.id);
    return (
      '<article class="skills-cat-row card-fade-in">' +
        '<span class="skills-cat-row-rank">#' + rank + '</span>' +
        '<div class="skills-cat-row-info">' +
          '<a href="' + href + '" class="skills-cat-row-name">' + escapeHtml(skill.name) + '</a>' +
          '<span class="skills-cat-row-repo">' + escapeHtml(skill.repo) + '</span>' +
        '</div>' +
        trendHtml(skill) +
      '</article>'
    );
  }

  // 分类区块 —— 头部（Domain 英文名 + 图标）+ Top 10 排行列表
  function categorySectionHtml(cat, topSkills) {
    var catHref = 'skills.html?category=' + encodeURIComponent(cat.id);
    var rowsHtml = topSkills.map(function (skill, i) {
      return catSkillRowHtml(skill, i + 1);
    }).join('');

    // 图标使用 categoryTree 中预定义的 icon 字段
    var iconText = escapeHtml(cat.icon || cat.nameEn.slice(0, 3).toUpperCase());

    return (
      '<section class="skills-cat-section" data-id="' + escapeHtml(cat.id) + '">' +
        '<div class="skills-cat-section-header">' +
          '<div class="skills-cat-section-icon ' + escapeHtml(cat.color) + '">' + iconText + '</div>' +
          '<div class="skills-cat-section-info">' +
            '<h2 class="skills-cat-section-title">' + escapeHtml(cat.nameEn) + '</h2>' +
            '<span class="skills-cat-section-count">' + topSkills.length + ' of ' + DATA.formatNumber(cat.count) + ' skills</span>' +
          '</div>' +
          '<a href="' + catHref + '" class="skills-cat-section-link">View All &#8594;</a>' +
        '</div>' +
        '<div class="skills-cat-section-body">' + rowsHtml + '</div>' +
      '</section>'
    );
  }

  // 预计算各 Domain Top 10（按安装量降序），与技能首页 Domain 筛选一致
  function buildCatSections() {
    var tree = DATA.categoryTree || [];
    catState.sections = tree.map(function (cat) {
      var top = DATA.skills.filter(function (s) {
        return s.domain === cat.id;
      }).sort(function (a, b) { return b.installs - a.installs; })
        .slice(0, 10);
      return { cat: cat, topSkills: top };
    }).filter(function (s) { return s.topSkills.length > 0; });
  }

  function showCatEndOfFeed() {
    var sentinel = getCatSentinel();
    if (!sentinel) return;
    sentinel.classList.remove('loading');
    sentinel.innerHTML = '<div class="scroll-loader" style="opacity:0.4;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;">// END OF FEED</div>';
  }

  // 渲染下一批分类（sentinel 触发）—— 插入骨架屏 → 700ms 后替换为真实区块
  function renderCatNextBatch() {
    if (catState.loading) return;
    catState.loading = true;

    var list = getCatList();
    var sentinel = getCatSentinel();
    if (!list) { catState.loading = false; return; }

    var start = catState.page;
    var end = start + catState.pageSize;
    var batch = catState.sections.slice(start, end);

    if (batch.length === 0) {
      catState.loading = false;
      showCatEndOfFeed();
      return;
    }

    // 插入骨架屏占位
    var skelHtml = '';
    for (var i = 0; i < batch.length; i++) skelHtml += catSkeletonHtml();
    if (sentinel) sentinel.insertAdjacentHTML('beforebegin', skelHtml);
    else list.insertAdjacentHTML('beforeend', skelHtml);

    // 延迟替换为真实内容
    setTimeout(function () {
      var skeletons = list.querySelectorAll('.skeleton-card.skills-cat-section');
      // 仅替换本批次插入的骨架屏（末尾 batch.length 个）
      var skelStart = skeletons.length - batch.length;
      batch.forEach(function (section, idx) {
        var html = categorySectionHtml(section.cat, section.topSkills);
        var skel = skeletons[skelStart + idx];
        if (skel) {
          var temp = document.createElement('div');
          temp.innerHTML = html;
          skel.replaceWith(temp.firstElementChild);
        } else if (sentinel) {
          sentinel.insertAdjacentHTML('beforebegin', html);
        }
      });

      catState.page += batch.length;
      catState.loading = false;

      if (catState.page >= catState.sections.length) {
        showCatEndOfFeed();
      } else {
        if (sentinel) sentinel.classList.remove('loading');
        if (catState.observer) {
          catState.observer.unobserve(sentinel);
          setTimeout(function () {
            if (catState.observer && catState.page < catState.sections.length) {
              catState.observer.observe(sentinel);
            }
          }, 50);
        }
      }
    }, 700);
  }

  // 首屏骨架屏逐块替换 —— 与 skills.html 统一的 IntersectionObserver 模式
  function initCatSkeletonReplace() {
    var list = getCatList();
    if (!list) return;

    var skeletons = list.querySelectorAll('.skeleton-card.skills-cat-section[data-skeleton-idx]');
    if (skeletons.length === 0 || !('IntersectionObserver' in window)) {
      // 回退：直接渲染首批
      catState.page = 0;
      renderCatNextBatch();
      return;
    }

    var revealedSet = new Set();
    var total = Math.min(catState.sections.length, skeletons.length);

    var skelObserver = new IntersectionObserver(function (entries) {
      var batchIndices = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = parseInt(entry.target.getAttribute('data-skeleton-idx'), 10);
          if (!isNaN(idx) && !revealedSet.has(idx)) {
            batchIndices.push(idx);
          }
        }
      });
      if (batchIndices.length === 0) return;

      batchIndices.sort(function (a, b) { return a - b; });
      batchIndices.forEach(function (idx) {
        if (idx >= catState.sections.length) return;
        var skel = list.querySelector('.skeleton-card.skills-cat-section[data-skeleton-idx="' + idx + '"]');
        if (!skel || revealedSet.has(idx)) return;
        revealedSet.add(idx);

        var section = catState.sections[idx];
        var temp = document.createElement('div');
        temp.innerHTML = categorySectionHtml(section.cat, section.topSkills);
        skel.replaceWith(temp.firstElementChild);
        skelObserver.unobserve(skel);
      });

      // 首屏骨架屏全部替换完毕
      if (revealedSet.size >= total) {
        skelObserver.disconnect();
        // 移除残余骨架屏（数据不足时）
        list.querySelectorAll('.skeleton-card.skills-cat-section[data-skeleton-idx]').forEach(function (sk) { sk.remove(); });
        catState.page = total;
        // 还有更多分类：启动 sentinel 无限滚动
        if (catState.page < catState.sections.length) {
          initCatInfiniteScroll();
        } else {
          showCatEndOfFeed();
        }
      }
    }, { rootMargin: '200px 0px' });

    skeletons.forEach(function (skel) { skelObserver.observe(skel); });
  }

  // sentinel 无限滚动
  function initCatInfiniteScroll() {
    var sentinel = getCatSentinel();
    if (!sentinel) return;

    if (catState.observer) catState.observer.disconnect();

    catState.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && catState.page < catState.sections.length && !catState.loading) {
          sentinel.classList.add('loading');
          renderCatNextBatch();
        }
      });
    }, { rootMargin: '200px' });

    catState.observer.observe(sentinel);
  }

  // Hero 统计：Domain 数、子分类数、总技能数、最大 Domain 名（英文）
  function initCategoriesStats() {
    var tree = DATA.categoryTree || [];
    var topCount = tree.length;
    var subCount = 0;
    tree.forEach(function (cat) { subCount += (cat.children || []).length; });
    var totalSkills = DATA.skills.length;

    // 最大 Domain：按实际技能数统计
    var largest = { name: '-', count: 0 };
    tree.forEach(function (cat) {
      var count = DATA.skills.filter(function (s) {
        return s.domain === cat.id;
      }).length;
      if (count > largest.count) {
        largest = { name: cat.nameEn, count: count };
      }
    });

    setText('catStatTop', String(topCount));
    setText('catStatSub', String(subCount));
    setText('catStatSkills', DATA.formatNumber(totalSkills));
    setText('catStatLargest', largest.name);
  }

  // 分类页入口
  function initCategoriesPage() {
    initCategoriesStats();
    buildCatSections();
    initCatSkeletonReplace();
  }

  /* ── 路由 ── */
  function detectPageFile() {
    var path = window.location.pathname;
    var file = path.split('/').pop().replace('.html', '') || 'skills';
    return file;
  }

  var page = detectPageFile();
  if (page === 'skills') initListPage();
  else if (page === 'skills-detail') initDetailPage();
  else if (page === 'skills-owner') initOwnerPage();
  else if (page === 'skills-categories') initCategoriesPage();

  /* ── 挂载 Chrome 层（复用 core.js） ──
     skills.js 为普通脚本，先于 babel 编译的 core.js 执行；
     通过轮询等待 GHRANK.mountChrome 就绪，避免 load 事件一次性触发的时序竞态
     导致页眉/页脚/边栏缺失 */
  function mountWhenReady() {
    if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
      global.GHRANK.mountChrome();
    } else {
      setTimeout(mountWhenReady, 50);
    }
  }
  mountWhenReady();
})(window);
