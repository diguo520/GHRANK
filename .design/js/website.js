// ═══════════════════════════════════════════════════════════════
//   WEBSITE DIRECTORY PAGE — React 19 component
//   分类筛选 + 实时搜索 + 排序 + 卡片入场动画 + 点击 toast
//   通过 text/babel 加载，IIFE 包裹，自动挂载到 GHRANK
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var useState    = React.useState;
  var useEffect   = React.useEffect;
  var useCallback = React.useCallback;
  var useRef      = React.useRef;

  /* ── 分类显示名映射 ── */
  var CATEGORY_LABELS = {
    'all':         'All Sites',
    'ai-tools':    'AI Tools',
    'developer':   'Developer',
    'design':      'Design',
    'productivity': 'Productivity',
    'learning':    'Learning',
    'news':        'News & Media',
    'open-source': 'Open Source'
  };

  /* ── 数字格式化：1,200,000 → 1.2M ── */
  function formatVisits(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  /* ── 工具：将 NodeList 转数组 ── */
  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  /* ── 主组件 ──
   *  HTML 中已有完整静态结构，组件 return null，
   *  通过 useEffect 绑定 DOM 交互逻辑。
   */
  function WebsitePage() {
    /* ── 状态 ── */
    var _catState   = useState('all');
    var currentCategory = _catState[0];
    var setCategory     = _catState[1];

    var _queryState  = useState('');
    var currentQuery = _queryState[0];
    var setQuery     = _queryState[1];

    var _sortState   = useState('popular');
    var currentSort  = _sortState[0];
    var setSort      = _sortState[1];

    /* ── 稳定引用：避免闭包中引用过期的 DOM 缓存 ── */
    var gridRef    = useRef(null);
    var cardsRef   = useRef([]);
    var toastTimer = useRef(null);

    /* ── 筛选 + 排序 + 动画主流程 ── */
    var applyFilters = useCallback(function (animate) {
      var grid  = gridRef.current;
      if (!grid) return;

      var cards = grid.querySelectorAll('.website-card');
      cardsRef.current = toArray(cards);

      var allCards = cardsRef.current;
      var q = currentQuery.trim().toLowerCase();
      var visible = [];

      // 筛选匹配的卡片
      allCards.forEach(function (card) {
        var cat  = card.getAttribute('data-category') || '';
        var name = (card.getAttribute('data-name') || '').toLowerCase();
        var url  = (card.getAttribute('data-url') || '').toLowerCase();
        var desc = (card.getAttribute('data-desc') || '').toLowerCase();

        var catMatch   = (currentCategory === 'all') || (cat === currentCategory);
        var queryMatch = !q || name.indexOf(q) !== -1 || url.indexOf(q) !== -1 || desc.indexOf(q) !== -1;

        if (catMatch && queryMatch) {
          visible.push(card);
          card.classList.remove('website-card-hidden');
        } else {
          card.classList.add('website-card-hidden');
        }
      });

      // 排序
      visible.sort(function (a, b) {
        if (currentSort === 'alphabetical') {
          var na = (a.getAttribute('data-name') || '').toLowerCase();
          var nb = (b.getAttribute('data-name') || '').toLowerCase();
          if (na < nb) return -1;
          if (na > nb) return 1;
          return 0;
        }
        if (currentSort === 'newest') {
          var ia = allCards.indexOf(a);
          var ib = allCards.indexOf(b);
          return ib - ia;
        }
        // popular: visits 降序
        var va = parseInt(a.getAttribute('data-visits') || '0', 10);
        var vb = parseInt(b.getAttribute('data-visits') || '0', 10);
        return vb - va;
      });

      // 按 sort 顺序重排 DOM
      visible.forEach(function (card) {
        grid.appendChild(card);
      });

      // 入场动画
      visible.forEach(function (card, idx) {
        if (animate) {
          card.classList.remove('website-card-entered');
          void card.offsetWidth; // 强制重排以重启动画
        }
        card.style.animationDelay = (idx * 35) + 'ms';
        card.classList.add('website-card-entered');
      });

      // 清除隐藏卡片动画延迟残留
      allCards.forEach(function (card) {
        if (card.classList.contains('website-card-hidden')) {
          card.style.animationDelay = '';
        }
      });

      // 更新元信息
      var resultCat   = document.getElementById('websiteResultCat');
      var resultCount = document.getElementById('websiteResultCount');
      var searchCount = document.getElementById('websiteSearchCount');

      if (resultCat)   resultCat.textContent = CATEGORY_LABELS[currentCategory] || 'All Sites';
      if (resultCount) resultCount.textContent = visible.length + (visible.length === 1 ? ' result' : ' results');
      if (searchCount) searchCount.textContent = visible.length + (visible.length === 1 ? ' site' : ' sites');

      // 空状态
      var emptyState = document.getElementById('websiteEmpty');
      if (emptyState) emptyState.hidden = (visible.length > 0);
    }, [currentCategory, currentQuery, currentSort]);

    /* ── Toast 提示 ── */
    var showToast = useCallback(function (url) {
      var toast = document.getElementById('websiteToast');
      if (!toast) return;

      toast.innerHTML =
        '<span class="website-toast-icon">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">' +
            '<path d="M3 8h10M9 4l4 4-4 4"/>' +
          '</svg>' +
        '</span>' +
        '<span>Opening external link</span>' +
        '<span class="website-toast-url">' + url + '</span>';

      toast.classList.add('is-visible');
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(function () {
        toast.classList.remove('is-visible');
      }, 2200);
    }, []);

    /* ── 渲染卡片访问数 ── */
    var renderAllVisits = useCallback(function () {
      var grid = gridRef.current;
      if (!grid) return;
      var cards = grid.querySelectorAll('.website-card');
      cards.forEach(function (card) {
        var raw = card.getAttribute('data-visits');
        var visitsEl = card.querySelector('.website-card-visits');
        if (!raw || !visitsEl) return;
        var n = parseInt(raw, 10);
        if (isNaN(n)) return;
        visitsEl.innerHTML = '\u25C8 ' + formatVisits(n) + ' visits';
      });
    }, []);

    /* ── 绑定 DOM 事件（仅在 mount 时执行一次） ── */
    useEffect(function () {
      var grid = document.getElementById('websiteGrid');
      gridRef.current = grid;

      var navItems    = document.querySelectorAll('.website-nav-item[data-category]');
      var searchInput = document.getElementById('websiteSearch');
      var sortSelect  = document.getElementById('websiteSort');
      var cards       = grid ? grid.querySelectorAll('.website-card') : [];

      /* 渲染访问数 */
      renderAllVisits();

      /* hash 路由初始化 */
      var hash = location.hash.replace('#', '');
      if (hash && CATEGORY_LABELS[hash]) {
        setCategory(hash);
        navItems.forEach(function (n) {
          n.classList.toggle('is-active', n.getAttribute('data-category') === hash);
        });
      }

      /* 分类侧边栏点击（提取为命名函数以便 cleanup） */
      function handleNavClick(e) {
        e.preventDefault();
        var cat = this.getAttribute('data-category');
        if (!cat || cat === currentCategory) return;

        navItems.forEach(function (n) { n.classList.remove('is-active'); });
        this.classList.add('is-active');
        setCategory(cat);

        if (location.hash !== '#' + cat) {
          history.replaceState(null, '', '#' + cat);
        }
      }
      navItems.forEach(function (item) {
        item.addEventListener('click', handleNavClick);
      });

      /* 搜索框实时过滤（防抖 120ms） */
      var debounceTimer = null;
      function handleSearchInput() {
        var val = searchInput.value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          setQuery(val);
        }, 120);
      }
      if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
      }

      /* 排序下拉 */
      function handleSortChange() {
        setSort(sortSelect.value);
      }
      if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
      }

      /* 卡片点击 → toast（提取为命名函数以便 cleanup） */
      function handleCardClick() {
        var url = this.getAttribute('data-url') || '';
        if (url) showToast(url);
      }
      cards.forEach(function (card) {
        card.addEventListener('click', handleCardClick);
      });

      /* hash 变化同步（浏览器前进/后退） */
      function onHashChange() {
        var h = location.hash.replace('#', '');
        if (h && CATEGORY_LABELS[h] && h !== currentCategory) {
          setCategory(h);
          navItems.forEach(function (n) {
            n.classList.toggle('is-active', n.getAttribute('data-category') === h);
          });
        }
      }
      window.addEventListener('hashchange', onHashChange);

      return function () {
        clearTimeout(debounceTimer);
        clearTimeout(toastTimer.current);
        window.removeEventListener('hashchange', onHashChange);
        // 移除分类导航、搜索框、排序、卡片点击事件监听器
        navItems.forEach(function (item) { item.removeEventListener('click', handleNavClick); });
        if (searchInput) searchInput.removeEventListener('input', handleSearchInput);
        if (sortSelect) sortSelect.removeEventListener('change', handleSortChange);
        cards.forEach(function (card) { card.removeEventListener('click', handleCardClick); });
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── 状态变化时执行筛选 + 动画 ── */
    useEffect(function () {
      // 首次加载走入场动画
      applyFilters(true);
    }, [applyFilters]);

    /* HTML 已有静态结构，组件不需要渲染任何东西 */
    return null;
  }

  /* ── 自动挂载到 GHRANK ── */
  GHRANK.mountChrome('website', WebsitePage);
})();
