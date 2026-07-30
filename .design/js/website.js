// ═══════════════════════════════════════════════════════════════
//   WEBSITE DIRECTORY PAGE — React 19 component
//   分类筛选 + 实时搜索 + 排序 + 骨架屏 + 无限滚动 + 点击 toast
//   通过 text/babel 加载，IIFE 包裹，自动挂载到 GHRANK
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var useState    = React.useState;
  var useEffect   = React.useEffect;
  var useCallback = React.useCallback;
  var useRef      = React.useRef;

  /* ── 每页加载条数（分块渲染，避免一次性铺满长列表） ── */
  var PAGE_SIZE = 8;

  /* ── 分类显示名映射 ── */
  var CATEGORY_LABELS = {
    'all':          'All Sites',
    'ai-tools':     'AI Tools',
    'developer':    'Developer',
    'design':       'Design',
    'productivity': 'Productivity',
    'learning':     'Learning',
    'news':         'News & Media',
    'open-source':  'Open Source'
  };

  /* ── 分类 → 标签 CSS 类 & 标签文案映射（沿用现有 CSS 类名） ── */
  var CATEGORY_TAG = {
    'ai-tools':     { cls: 'tag-ai',       text: 'AI Tools' },
    'developer':    { cls: 'tag-tools',    text: 'Developer' },
    'design':       { cls: 'tag-design',   text: 'Design' },
    'productivity': { cls: 'tag-frontend', text: 'Productivity' },
    'learning':     { cls: 'tag-data',     text: 'Learning' },
    'news':         { cls: 'tag-security', text: 'News & Media' },
    'open-source':  { cls: 'tag-backend',  text: 'Open Source' }
  };

  /* ── 网站数据（24 条，由 JS 动态渲染卡片，HTML 不再硬编码） ── */
  var SITES = [
    { category: 'ai-tools',     name: 'OpenAI',                    url: 'openai.com',              desc: 'Creator of GPT models, ChatGPT, DALL-E, and the API platform powering the modern AI ecosystem.',          visits: 4800000, favicon: 'O' },
    { category: 'ai-tools',     name: 'Hugging Face',              url: 'huggingface.co',          desc: 'The platform where the ML community collaborates on models, datasets, and applications.',                  visits: 3200000, favicon: 'H' },
    { category: 'ai-tools',     name: 'Replicate',                url: 'replicate.com',           desc: 'Run open-source models in the cloud with a simple API, or deploy your own custom models.',                 visits: 980000,  favicon: 'R' },
    { category: 'ai-tools',     name: 'Anthropic',                url: 'anthropic.com',           desc: 'AI safety company building Claude, the assistant for reliable and interpretable AI systems.',              visits: 4100000, favicon: 'A' },
    { category: 'ai-tools',     name: 'Cohere',                   url: 'cohere.com',              desc: 'Enterprise-grade LLMs and retrieval APIs for search, summarization, and RAG workflows.',                    visits: 720000,  favicon: 'C' },
    { category: 'ai-tools',     name: 'Stability AI',             url: 'stability.ai',            desc: 'Open generative AI research lab behind Stable Diffusion and a suite of multimodal models.',                 visits: 640000,  favicon: 'S' },
    { category: 'developer',    name: 'GitHub',                   url: 'github.com',              desc: 'The complete developer platform to build, scale, and deliver secure software.',                            visits: 3200000, favicon: 'G' },
    { category: 'developer',    name: 'Stack Overflow',           url: 'stackoverflow.com',       desc: 'The largest online community for programmers to learn, share knowledge, and advance careers.',            visits: 2800000, favicon: 'S' },
    { category: 'developer',    name: 'MDN Web Docs',             url: 'developer.mozilla.org',   desc: "Mozilla's open-source documentation for web platform standards, APIs, and browser features.",              visits: 1900000, favicon: 'M' },
    { category: 'developer',    name: 'Vercel',                   url: 'vercel.com',              desc: 'The platform for frontend developers, providing the speed and reliability of serverless infrastructure.',  visits: 860000,  favicon: 'V' },
    { category: 'developer',    name: 'Cloudflare',               url: 'cloudflare.com',          desc: 'Connect, protect, and build on the internet with a global edge network and developer platform.',           visits: 2400000, favicon: 'C' },
    { category: 'design',       name: 'Figma',                    url: 'figma.com',               desc: 'The collaborative interface design tool for teams to create, prototype, and ship products together.',       visits: 5200000, favicon: 'F' },
    { category: 'design',       name: 'Dribbble',                 url: 'dribbble.com',            desc: 'The community for designers to share work, get inspired, and find their next opportunity.',                 visits: 1400000, favicon: 'D' },
    { category: 'design',       name: 'Behance',                  url: 'behance.net',             desc: "Adobe's platform for creatives to showcase and discover leading creative portfolios worldwide.",           visits: 1800000, favicon: 'B' },
    { category: 'design',       name: 'Coolors',                  url: 'coolors.co',              desc: 'Generate, explore, and export beautiful color palettes in seconds for any design project.',                visits: 510000,  favicon: 'C' },
    { category: 'productivity', name: 'Notion',                   url: 'notion.so',               desc: 'The connected workspace for docs, wikis, and projects that helps teams move faster together.',             visits: 6100000, favicon: 'N' },
    { category: 'productivity', name: 'Linear',                   url: 'linear.app',              desc: 'The issue tracking tool built for high-performance software teams with speed and focus.',                   visits: 990000,  favicon: 'L' },
    { category: 'productivity', name: 'Obsidian',                 url: 'obsidian.md',             desc: 'A knowledge base that works on local Markdown files, giving you full control over your notes.',             visits: 470000,  favicon: 'O' },
    { category: 'learning',     name: 'freeCodeCamp',             url: 'freecodecamp.org',        desc: 'Learn to code for free with thousands of interactive challenges and full certifications.',                   visits: 1300000, favicon: 'f' },
    { category: 'learning',     name: 'Coursera',                 url: 'coursera.org',            desc: 'Online courses, certificates, and degrees from world-class universities and companies.',                    visits: 2200000, favicon: 'C' },
    { category: 'news',         name: 'Hacker News',              url: 'news.ycombinator.com',     desc: 'A social news website focusing on computer science, startups, and the tech industry.',                      visits: 1100000, favicon: 'Y' },
    { category: 'news',         name: 'TechCrunch',               url: 'techcrunch.com',          desc: 'Breaking technology news, startup funding rounds, and analysis of the tech industry.',                      visits: 1700000, favicon: 'T' },
    { category: 'open-source',  name: 'Linux Foundation',          url: 'linuxfoundation.org',     desc: 'The nonprofit consortium enabling the open source ecosystem for projects like Linux and Kubernetes.',       visits: 380000,  favicon: 'L' },
    { category: 'open-source',  name: 'Apache Software Foundation', url: 'apache.org',           desc: 'A decentralized open source community developing 350+ projects including Kafka, Spark, and HTTP Server.', visits: 290000,  favicon: 'A' }
  ];

  /* ── HTML 转义：属性值（防止 & " < > 破坏属性） ── */
  function escAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ── HTML 转义：文本内容（防止 & < > 破坏文档结构） ── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ── 构造单张卡片 HTML（含跳转图标，替代原访问量展示） ── */
  function buildCardHTML(site, tag) {
    return '<div class="website-card website-card-entered" data-category="' + site.category + '" '
      + 'data-name="' + escAttr(site.name) + '" data-url="' + escAttr(site.url) + '" '
      + 'data-desc="' + escAttr(site.desc) + '" data-visits="' + site.visits + '" '
      + 'onclick="window.open(\'https://' + site.url + '\',\'_blank\')">'
      + '<div class="website-card-favicon cat-' + site.category + '">' + site.favicon + '</div>'
      + '<div class="website-card-body">'
      +   '<div class="website-card-name">' + escHtml(site.name) + '</div>'
      +   '<div class="website-card-url">' + escHtml(site.url) + '</div>'
      +   '<div class="website-card-desc">' + escHtml(site.desc) + '</div>'
      +   '<div class="website-card-footer">'
      +     '<span class="website-card-tag ' + tag.cls + '">' + tag.text + '</span>'
      +     '<span class="website-card-jump">'
      +       '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
      +         '<path d="M6 3H3v10h10v-3"/>'
      +         '<path d="M9 3h4v4"/>'
      +         '<path d="M13 3L7 9"/>'
      +       '</svg>'
      +     '</span>'
      +   '</div>'
      + '</div>'
      + '</div>';
  }

  /* ── 构造单张骨架屏卡片 HTML（加载占位，匹配卡片布局） ── */
  function buildSkeletonHTML() {
    return '<div class="website-skeleton-card">'
      + '<div class="website-skeleton-favicon"></div>'
      + '<div class="website-skeleton-body">'
      +   '<div class="website-skeleton-line short"></div>'
      +   '<div class="website-skeleton-line medium"></div>'
      +   '<div class="website-skeleton-line long"></div>'
      +   '<div class="website-skeleton-line long"></div>'
      +   '<div class="website-skeleton-footer">'
      +     '<div class="website-skeleton-line website-skeleton-tag"></div>'
      +     '<div class="website-skeleton-line website-skeleton-jump"></div>'
      +   '</div>'
      + '</div>'
      + '</div>';
  }

  /* ── 主组件 ──
   *  HTML 中已有静态结构，组件 return null，
   *  通过 useEffect 绑定 DOM 交互逻辑并动态渲染卡片。
   */
  function WebsitePage() {
    /* ── 状态 ── */
    var _catState = useState('all');
    var currentCategory = _catState[0];
    var setCategory = _catState[1];

    var _queryState = useState('');
    var currentQuery = _queryState[0];
    var setQuery = _queryState[1];

    var _sortState = useState('popular');
    var currentSort = _sortState[0];
    var setSort = _sortState[1];

    /* visibleCount：当前已渲染的卡片数（分块加载） */
    var _visState = useState(PAGE_SIZE);
    var visibleCount = _visState[0];
    var setVisibleCount = _visState[1];

    /* ── 稳定引用 ── */
    var gridRef = useRef(null);
    var toastTimer = useRef(null);
    /* currentCategory 的实时引用，解决 useEffect([]) 中闭包过期问题 */
    var currentCategoryRef = useRef('all');
    /* visibleCount 的实时引用，供 IntersectionObserver 回调同步读取 */
    var visibleCountRef = useRef(PAGE_SIZE);
    /* IntersectionObserver 实例引用，便于卸载/重置时断开 */
    var ioObserverRef = useRef(null);
    /* 底部加载器 DOM 引用 */
    var loaderElRef = useRef(null);

    /* ── Toast 提示 ── */
    var showToast = useCallback(function (url) {
      var toast = document.getElementById('websiteToast');
      if (!toast) return;

      toast.innerHTML =
        '<span class="website-toast-icon">'
        + '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">'
        + '<path d="M3 8h10M9 4l4 4-4 4"/>'
        + '</svg>'
        + '</span>'
        + '<span>Opening external link</span>'
        + '<span class="website-toast-url">' + url + '</span>';

      toast.classList.add('is-visible');
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(function () {
        toast.classList.remove('is-visible');
      }, 2200);
    }, []);

    /* ── 断开当前 IntersectionObserver ── */
    function disconnectObserver() {
      if (ioObserverRef.current) {
        ioObserverRef.current.disconnect();
        ioObserverRef.current = null;
      }
    }

    /* ── 渲染骨架屏（6 张占位卡片） ── */
    function renderSkeletons(grid) {
      grid.innerHTML = '';
      var html = '';
      for (var i = 0; i < 6; i++) {
        html += buildSkeletonHTML();
      }
      grid.innerHTML = html;
    }

    /* ── 追加卡片到 grid（可选在 loader 之前插入，保持加载器始终在底部） ── */
    function appendCards(filtered, start, end, grid, loaderEl) {
      var frag = document.createDocumentFragment();
      for (var i = start; i < end && i < filtered.length; i++) {
        var site = filtered[i];
        var tag = CATEGORY_TAG[site.category] || { cls: 'tag-ai', text: site.category };
        var tmp = document.createElement('div');
        tmp.innerHTML = buildCardHTML(site, tag);
        var card = tmp.firstElementChild;
        if (card) {
          /* 每批卡片错峰入场，制造渐进出现的视觉效果 */
          card.style.animationDelay = ((i - start) * 35) + 'ms';
          frag.appendChild(card);
        }
      }
      if (loaderEl) {
        grid.insertBefore(frag, loaderEl);
      } else {
        grid.appendChild(frag);
      }
    }

    /* ── 将底部 loader 替换为"已加载完毕"标记 ── */
    function replaceLoaderWithEnd(grid) {
      var loader = loaderElRef.current;
      if (loader && loader.parentNode === grid) {
        grid.removeChild(loader);
      }
      loaderElRef.current = null;
      var end = document.createElement('div');
      end.className = 'website-scroll-end';
      end.textContent = '— End of results —';
      grid.appendChild(end);
    }

    /* ── 更新结果元信息 & 空状态 ── */
    function updateMeta(total) {
      var resultCat = document.getElementById('websiteResultCat');
      var resultCount = document.getElementById('websiteResultCount');
      var searchCount = document.getElementById('websiteSearchCount');
      var emptyState = document.getElementById('websiteEmpty');

      if (resultCat)   resultCat.textContent = CATEGORY_LABELS[currentCategory] || 'All Sites';
      if (resultCount) resultCount.textContent = total + (total === 1 ? ' result' : ' results');
      if (searchCount) searchCount.textContent = total + (total === 1 ? ' site' : ' sites');
      if (emptyState)  emptyState.hidden = (total > 0);
    }

    /* ── 绑定 DOM 事件（仅在 mount 时执行一次） ── */
    useEffect(function () {
      var grid = document.getElementById('websiteGrid');
      gridRef.current = grid;

      var navItems    = document.querySelectorAll('.website-nav-item[data-category]');
      var searchInput = document.getElementById('websiteSearch');
      var sortSelect  = document.getElementById('websiteSort');

      /* hash 路由初始化 */
      var hash = location.hash.replace('#', '');
      if (hash && CATEGORY_LABELS[hash]) {
        setCategory(hash);
        navItems.forEach(function (n) {
          n.classList.toggle('is-active', n.getAttribute('data-category') === hash);
        });
      }

      /* 分类侧边栏点击 —— toggle 模式：
         · 点击新分类 → 筛选该分类
         · 再次点击已激活分类 → 回到 All Sites（显示全部） */
      function handleNavClick(e) {
        e.preventDefault();
        var cat = this.getAttribute('data-category');
        if (!cat) return;

        /* toggle：当前已激活则取消，切换回 all */
        var nextCat = (cat === currentCategoryRef.current) ? 'all' : cat;

        navItems.forEach(function (n) { n.classList.remove('is-active'); });
        if (nextCat !== 'all') {
          this.classList.add('is-active');
        }
        setCategory(nextCat);

        if (nextCat === 'all') {
          history.replaceState(null, '', location.pathname + location.search);
        } else if (location.hash !== '#' + nextCat) {
          history.replaceState(null, '', '#' + nextCat);
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

      /* 卡片点击 → toast（事件委托：覆盖动态渲染的卡片，无需逐张绑定） */
      function handleGridClick(e) {
        var card = e.target.closest('.website-card');
        if (!card || !grid.contains(card)) return;
        var url = card.getAttribute('data-url') || '';
        if (url) showToast(url);
      }
      if (grid) {
        grid.addEventListener('click', handleGridClick);
      }

      /* hash 变化同步（浏览器前进/后退，支持空 hash 回到 all） */
      function onHashChange() {
        var h = location.hash.replace('#', '');
        /* 空 hash → 回到 All Sites */
        if (!h) {
          if (currentCategoryRef.current !== 'all') {
            setCategory('all');
            navItems.forEach(function (n) { n.classList.remove('is-active'); });
          }
          return;
        }
        if (CATEGORY_LABELS[h] && h !== currentCategoryRef.current) {
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
        disconnectObserver();
        window.removeEventListener('hashchange', onHashChange);
        navItems.forEach(function (item) { item.removeEventListener('click', handleNavClick); });
        if (searchInput) searchInput.removeEventListener('input', handleSearchInput);
        if (sortSelect) sortSelect.removeEventListener('change', handleSortChange);
        if (grid) grid.removeEventListener('click', handleGridClick);
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── 筛选 + 排序 + 骨架屏 + 无限滚动主流程 ── */
    useEffect(function () {
      currentCategoryRef.current = currentCategory;
      /* 每次筛选条件变化都重置可见数，从头分块加载 */
      visibleCountRef.current = PAGE_SIZE;
      setVisibleCount(PAGE_SIZE);

      var grid = gridRef.current;
      if (!grid) return;

      /* 计算筛选 + 排序后的列表 */
      var q = currentQuery.trim().toLowerCase();
      var filtered = SITES.filter(function (site) {
        var catMatch = (currentCategory === 'all') || (site.category === currentCategory);
        var queryMatch = !q
          || site.name.toLowerCase().indexOf(q) !== -1
          || site.url.toLowerCase().indexOf(q) !== -1
          || site.desc.toLowerCase().indexOf(q) !== -1;
        return catMatch && queryMatch;
      });

      if (currentSort === 'alphabetical') {
        filtered.sort(function (a, b) {
          var na = a.name.toLowerCase();
          var nb = b.name.toLowerCase();
          if (na < nb) return -1;
          if (na > nb) return 1;
          return 0;
        });
      } else if (currentSort === 'newest') {
        /* 反转原始顺序：后录入的排前面 */
        filtered.reverse();
      } else {
        /* popular：访问量降序 */
        filtered.sort(function (a, b) {
          return b.visits - a.visits;
        });
      }

      /* 1. 清空网格，先展示骨架屏（模拟数据加载） */
      disconnectObserver();
      renderSkeletons(grid);
      updateMeta(filtered.length);

      /* 2. 模拟加载延迟后渲染首批卡片 */
      var loadTimer = setTimeout(function () {
        grid.innerHTML = '';

        /* 无结果：仅保留空状态 */
        if (filtered.length === 0) {
          updateMeta(0);
          return;
        }

        var firstEnd = Math.min(PAGE_SIZE, filtered.length);
        appendCards(filtered, 0, firstEnd, grid, null);

        /* 3. 还有更多卡片：插入底部加载器并启动 IntersectionObserver */
        if (filtered.length > PAGE_SIZE) {
          var loader = document.createElement('div');
          loader.className = 'website-scroll-loader';
          loader.innerHTML =
            '<span class="website-scroll-loader-dot"></span>'
            + '<span class="website-scroll-loader-dot"></span>'
            + '<span class="website-scroll-loader-dot"></span>'
            + '<span>Loading more</span>';
          grid.appendChild(loader);
          loaderElRef.current = loader;

          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              var prev = visibleCountRef.current;
              var next = Math.min(prev + PAGE_SIZE, filtered.length);
              if (next <= prev) return;
              /* 追加新一批卡片（插在 loader 之前，保持加载器在底部） */
              appendCards(filtered, prev, next, grid, loader);
              visibleCountRef.current = next;
              setVisibleCount(next);
              /* 全部加载完毕：断开观察并显示结束标记 */
              if (next >= filtered.length) {
                disconnectObserver();
                replaceLoaderWithEnd(grid);
              }
            });
          }, { rootMargin: '120px' });
          observer.observe(loader);
          ioObserverRef.current = observer;
        } else {
          /* 不足一页：直接显示结束标记 */
          var end = document.createElement('div');
          end.className = 'website-scroll-end';
          end.textContent = '— End of results —';
          grid.appendChild(end);
        }
      }, 600);

      return function () {
        clearTimeout(loadTimer);
        disconnectObserver();
      };
    }, [currentCategory, currentQuery, currentSort]); // eslint-disable-line react-hooks/exhaustive-deps

    /* HTML 已有静态结构，组件不需要渲染任何东西 */
    return null;
  }

  /* ── 自动挂载到 GHRANK ──
     babel 外部脚本执行顺序不保证，core.js 可能尚未编译完成；
     通过轮询等待 GHRANK.mountChrome 就绪后再挂载，避免竞态导致 chrome 缺失 */
  function mountWhenReady() {
    if (typeof GHRANK !== 'undefined' && typeof GHRANK.mountChrome === 'function') {
      GHRANK.mountChrome('website', WebsitePage);
    } else {
      setTimeout(mountWhenReady, 50);
    }
  }
  mountWhenReady();
})();
