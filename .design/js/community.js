/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // React 19 COMMUNITY — 社区论坛页面组件
   ────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   加载方式：HTML 页面通过 <script type="text/babel"> 引入

   职责：
   1. 线程列表渲染（含无限滚动、分页）
   2. Tab 切换（All / New / Hot / Latest / Top）
   3. 侧边栏导航（跳转到分类页面）
   4. 点赞交互、Toast 提示
   5. HUD 入场动画
   6. 在线人数波动
   7. 分类横幅（community-list.html）

   注意：页面静态结构已由 HTML 提供，本组件 return null，
        仅通过 useEffect 管理所有 DOM 交互。
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useCallback, useRef, useMemo } = React;

  /* ═══════════════════════════════════════════════════════════════
     1. MOCK DATA — 纯数据常量（与原版完全一致）
     ═══════════════════════════════════════════════════════════════ */

  // Each thread carries likes, liked, repliers, isOnline
  var BASE_THREADS = [
    { id: 1, title: 'GHRANK scoring v4 proposal: community-weighted signals', author: 'AlexShader', avatar: '../styles/images/demo/prompt_1.jpg', section: 'Discussions', replies: 87, views: 3420, timeAgo: '2h', isHot: true, isNew: true, likes: 124, liked: false, isOnline: true, repliers: null },
    { id: 2, title: 'Show & Tell: Built a real-time repo monitor with GHRANK API', author: 'kairos', avatar: '../styles/images/demo/prompt_2.jpg', section: 'Show & Tell', replies: 34, views: 1280, timeAgo: '3h', isHot: false, isNew: true, likes: 38, liked: false, isOnline: false, repliers: null },
    { id: 3, title: 'Best vector database for production agent pipelines?', author: 'nexusdev', avatar: '../styles/images/demo/prompt_3.jpg', section: 'Questions', replies: 56, views: 2100, timeAgo: '4h', isHot: true, isNew: false, likes: 67, liked: false, isOnline: true, repliers: null },
    { id: 4, title: 'Tutorial: Fine-tune Llama 4 locally with QLoRA in 30 minutes', author: 'mlcraft', avatar: '../styles/images/demo/prompt_4.jpg', section: 'Tutorials', replies: 23, views: 1890, timeAgo: '5h', isHot: false, isNew: false, likes: 91, liked: false, isOnline: false, repliers: null },
    { id: 5, title: 'The real cost of running open-source AI in production', author: 'voidrunner', avatar: '../styles/images/demo/prompt_5.jpg', section: 'Discussions', replies: 112, views: 5640, timeAgo: '6h', isHot: true, isNew: false, likes: 203, liked: false, isOnline: true, repliers: null },
    { id: 6, title: 'Announcing GHRANK API v3 -- breaking changes and migration guide', author: 'AlexShader', avatar: '../styles/images/demo/prompt_1.jpg', section: 'News & Updates', replies: 41, views: 3200, timeAgo: '8h', isHot: false, isNew: false, likes: 156, liked: false, isOnline: false, repliers: null },
    { id: 7, title: 'How I built a CLI tool that ranks my dotfiles', author: 'shellweird', avatar: '../styles/images/demo/prompt_6.jpg', section: 'Show & Tell', replies: 18, views: 720, timeAgo: '10h', isHot: false, isNew: false, likes: 22, liked: false, isOnline: true, repliers: null },
    { id: 8, title: 'Why does time-decay weighting use 180 days as the threshold?', author: 'newton_r', avatar: '../styles/images/demo/prompt_7.jpg', section: 'Questions', replies: 29, views: 1100, timeAgo: '12h', isHot: false, isNew: false, likes: 45, liked: false, isOnline: false, repliers: null },
    { id: 9, title: 'Dev Log: Building a community-driven scoring model', author: 'mirakade', avatar: '../styles/images/demo/prompt_8.jpg', section: 'Dev Logs', replies: 15, views: 480, timeAgo: '1d', isHot: false, isNew: false, likes: 18, liked: false, isOnline: true, repliers: null },
    { id: 10, title: 'Off-Topic: What IDE theme are you using in 2026?', author: 'pixelshift', avatar: '../styles/images/demo/prompt_1.jpg', section: 'Off-Topic', replies: 64, views: 890, timeAgo: '1d', isHot: true, isNew: false, likes: 73, liked: false, isOnline: false, repliers: null },
    { id: 11, title: 'How to contribute to GHRANK -- comprehensive onboarding guide', author: 'jintao', avatar: '../styles/images/demo/prompt_3.jpg', section: 'Tutorials', replies: 8, views: 340, timeAgo: '2d', isHot: false, isNew: false, likes: 12, liked: false, isOnline: true, repliers: null },
    { id: 12, title: 'Comparing RAG frameworks: LlamaIndex vs LangChain vs Haystack', author: 'dataforge', avatar: '../styles/images/demo/prompt_5.jpg', section: 'Discussions', replies: 73, views: 4100, timeAgo: '2d', isHot: true, isNew: false, likes: 188, liked: false, isOnline: false, repliers: null }
  ];

  // Author pool for synthesizing replier avatar stacks and extra threads
  var AUTHOR_POOL = [
    { name: 'AlexShader',  avatar: '../styles/images/demo/prompt_1.jpg' },
    { name: 'kairos',      avatar: '../styles/images/demo/prompt_2.jpg' },
    { name: 'nexusdev',    avatar: '../styles/images/demo/prompt_3.jpg' },
    { name: 'mlcraft',     avatar: '../styles/images/demo/prompt_4.jpg' },
    { name: 'voidrunner',  avatar: '../styles/images/demo/prompt_5.jpg' },
    { name: 'shellweird',  avatar: '../styles/images/demo/prompt_6.jpg' },
    { name: 'newton_r',    avatar: '../styles/images/demo/prompt_7.jpg' },
    { name: 'mirakade',    avatar: '../styles/images/demo/prompt_8.jpg' },
    { name: 'jintao',      avatar: '../styles/images/demo/prompt_3.jpg' },
    { name: 'pixelshift',  avatar: '../styles/images/demo/prompt_1.jpg' },
    { name: 'dataforge',   avatar: '../styles/images/demo/prompt_5.jpg' },
    { name: 'cyclonix',    avatar: '../styles/images/demo/prompt_2.jpg' }
  ];

  // Extra pool for infinite scroll synthesis
  var EXTRA_POOL = [
    { title: 'Deep dive: GHRANK signal aggregation pipeline internals', author: 'mirakade', avatar: '../styles/images/demo/prompt_8.jpg', section: 'Dev Logs', isHot: false, likes: 14 },
    { title: 'Show & Tell: Terminal dashboard for tracking trending repos', author: 'kairos', avatar: '../styles/images/demo/prompt_2.jpg', section: 'Show & Tell', isHot: false, likes: 29 },
    { title: 'Question: How to handle auth in edge-run serverless agents?', author: 'nexusdev', avatar: '../styles/images/demo/prompt_3.jpg', section: 'Questions', isHot: false, likes: 8 },
    { title: 'Tutorial: Ship a RAG-powered CLI in under 100 lines', author: 'mlcraft', avatar: '../styles/images/demo/prompt_4.jpg', section: 'Tutorials', isHot: true, likes: 76 },
    { title: 'Discussion: Are leaderboards good for open source culture?', author: 'voidrunner', avatar: '../styles/images/demo/prompt_5.jpg', section: 'Discussions', isHot: true, likes: 142 },
    { title: 'News: GHRANK CLI v2.1 ships with streaming scoring mode', author: 'AlexShader', avatar: '../styles/images/demo/prompt_1.jpg', section: 'News & Updates', isHot: false, likes: 64 },
    { title: 'Off-Topic: Best mechanical keyboards for long coding sessions', author: 'pixelshift', avatar: '../styles/images/demo/prompt_1.jpg', section: 'Off-Topic', isHot: false, likes: 31 },
    { title: 'Question: What is the ideal refresh interval for scoring?', author: 'newton_r', avatar: '../styles/images/demo/prompt_7.jpg', section: 'Questions', isHot: false, likes: 19 },
    { title: 'Dev Log: Refactoring the time-decay module for clarity', author: 'mirakade', avatar: '../styles/images/demo/prompt_8.jpg', section: 'Dev Logs', isHot: false, likes: 7 },
    { title: 'Show & Tell: Built a GitHub Arctic Code Vault explorer', author: 'shellweird', avatar: '../styles/images/demo/prompt_6.jpg', section: 'Show & Tell', isHot: false, likes: 25 },
    { title: 'Tutorial: End-to-end observability for agent pipelines', author: 'jintao', avatar: '../styles/images/demo/prompt_3.jpg', section: 'Tutorials', isHot: false, likes: 58 },
    { title: 'Discussion: Monetizing open source without losing trust', author: 'dataforge', avatar: '../styles/images/demo/prompt_5.jpg', section: 'Discussions', isHot: true, likes: 97 },
    { title: 'Benchmarking vector stores: pgvector vs Pinecone vs Weaviate', author: 'dataforge', avatar: '../styles/images/demo/prompt_5.jpg', section: 'Discussions', isHot: false, likes: 41 },
    { title: 'How we cut CI build times by 70% with remote caching', author: 'mlcraft', avatar: '../styles/images/demo/prompt_4.jpg', section: 'Show & Tell', isHot: true, likes: 88 },
    { title: 'Question: Best practices for streaming LLM responses to the browser', author: 'nexusdev', avatar: '../styles/images/demo/prompt_3.jpg', section: 'Questions', isHot: false, likes: 12 },
    { title: 'Dev Log: Shipping the new community-weighted signal weights UI', author: 'mirakade', avatar: '../styles/images/demo/prompt_8.jpg', section: 'Dev Logs', isHot: false, likes: 23 },
    { title: 'Tutorial: Build a GitHub bot with Probot and TypeScript', author: 'jintao', avatar: '../styles/images/demo/prompt_3.jpg', section: 'Tutorials', isHot: false, likes: 35 },
    { title: 'News: GHRANK now indexes Hugging Face Spaces and models', author: 'AlexShader', avatar: '../styles/images/demo/prompt_1.jpg', section: 'News & Updates', isHot: true, likes: 112 },
    { title: 'Off-Topic: Favorite terminal emulators and font pairings', author: 'pixelshift', avatar: '../styles/images/demo/prompt_1.jpg', section: 'Off-Topic', isHot: false, likes: 44 },
    { title: 'Discussion: Should we adopt Bun for the scoring pipeline?', author: 'voidrunner', avatar: '../styles/images/demo/prompt_5.jpg', section: 'Discussions', isHot: true, likes: 67 },
    { title: 'Show & Tell: A noise-map generator for procedural game worlds', author: 'shellweird', avatar: '../styles/images/demo/prompt_6.jpg', section: 'Show & Tell', isHot: false, likes: 19 },
    { title: 'Question: How does GHRANK handle deleted or renamed repos?', author: 'newton_r', avatar: '../styles/images/demo/prompt_7.jpg', section: 'Questions', isHot: false, likes: 6 },
    { title: 'Tutorial: Deploy a multi-agent system on Cloudflare Workers', author: 'kairos', avatar: '../styles/images/demo/prompt_2.jpg', section: 'Tutorials', isHot: false, likes: 52 },
    { title: 'Dev Log: Migrating the scoring scheduler to durable objects', author: 'mirakade', avatar: '../styles/images/demo/prompt_8.jpg', section: 'Dev Logs', isHot: false, likes: 31 },
    { title: 'Discussion: Open-core vs fully-open monetization models in 2026', author: 'dataforge', avatar: '../styles/images/demo/prompt_5.jpg', section: 'Discussions', isHot: false, likes: 79 }
  ];

  // Section key mapping (used for sidebar and filtering)
  var SECTION_KEY_MAP = {
    'Hot Topics': 'hot', 'Show & Tell': 'show', 'Questions': 'questions',
    'Discussions': 'discussions', 'Tutorials': 'tutorials',
    'News & Updates': 'news', 'Off-Topic': 'offtopic', 'Dev Logs': 'devlogs'
  };

  var KEY_TO_SECTION = {
    hot: 'Hot Topics', show: 'Show & Tell', questions: 'Questions',
    discussions: 'Discussions', tutorials: 'Tutorials',
    news: 'News & Updates', offtopic: 'Off-Topic', devlogs: 'Dev Logs'
  };

  // Base counts for sidebar display
  var SECTION_COUNTS = {
    hot: 1284, show: 642, questions: 1089, discussions: 876,
    tutorials: 234, news: 198, offtopic: 156, devlogs: 89
  };

  // Title suffixes for synthesized threads (prevents repetition)
  var TITLE_SUFFIXES = [
    ' (part 2)', ' \u2014 follow-up', ' (continued)', ' #2',
    ' (update)', ' \u2014 revisited', ' (part 3)', ' #3',
    ' (round 2)', ' \u2014 deep dive', ' (part 4)', ' #4',
    ' (revisited)', ' \u2014 addendum', ' (part 5)', ' #5',
    ' (round 3)', ' \u2014 part 6', ' (part 7)', ' #6',
    ' (sequel)', ' \u2014 part 8', ' (part 9)', ' #7',
    ' (round 4)', ' \u2014 part 10', ' (part 11)', ' #8',
    ' (epilogue)', ' \u2014 part 12', ' (part 13)', ' #9'
  ];

  // Heart SVG for like buttons
  var HEART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  /* ═══════════════════════════════════════════════════════════════
     2. PURE HELPER FUNCTIONS — 不依赖组件状态，可定义在组件外部
     ═══════════════════════════════════════════════════════════════ */

  var PAGE_SIZE = 6;

  // Build randomized replier avatar list (GitHub-style participant stack)
  function buildRepliers(replyCount) {
    var n = Math.min(5, Math.max(2, Math.floor(replyCount / 8) + 1));
    var pool = AUTHOR_POOL.slice();
    var result = [];
    for (var i = 0; i < n; i++) {
      var idx = Math.floor(Math.random() * pool.length);
      result.push(pool[idx]);
      pool.splice(idx, 1);
      if (pool.length === 0) pool = AUTHOR_POOL.slice();
    }
    return result;
  }

  // Backfill base threads with replier stacks (runs once)
  for (var bi = 0; bi < BASE_THREADS.length; bi++) {
    BASE_THREADS[bi].repliers = buildRepliers(BASE_THREADS[bi].replies);
  }

  // Format number for display (124 -> 124, 3420 -> 3.4K)
  function fmtNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  // Format count with locale separators
  function fmtCount(n) {
    return n.toLocaleString();
  }

  // HTML escape helper
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Parse timeAgo string to minutes (for sorting)
  function parseTimeAgoToMinutes(str) {
    if (!str) return Number.MAX_SAFE_INTEGER;
    var m = String(str).match(/^(\d+)\s*(m|h|d)$/i);
    if (!m) return Number.MAX_SAFE_INTEGER;
    var n = parseInt(m[1], 10);
    var unit = m[2].toLowerCase();
    if (unit === 'm') return n;
    if (unit === 'h') return n * 60;
    if (unit === 'd') return n * 60 * 24;
    return Number.MAX_SAFE_INTEGER;
  }

  // Round-robin cursor for EXTRA_POOL
  var extraCursor = 0;
  function nextExtraBase() {
    var base = EXTRA_POOL[extraCursor % EXTRA_POOL.length];
    extraCursor++;
    return base;
  }

  // Synthesize a new thread from an extra pool base
  var nextThreadId = 1000;
  function synthesizeThread(base) {
    nextThreadId++;
    var replies = Math.floor(Math.random() * 90) + 4;
    var views = Math.floor(Math.random() * 5000) + 200;
    var minsAgo = Math.floor(Math.random() * 240) + 5;
    var timeAgo = minsAgo < 60 ? minsAgo + 'm' : (Math.floor(minsAgo / 60) + 'h');
    var suffix = '';
    var cycle = Math.floor(extraCursor / EXTRA_POOL.length);
    if (cycle > 0) {
      var sIdx = (cycle - 1) * EXTRA_POOL.length + (extraCursor % EXTRA_POOL.length) - 1;
      suffix = TITLE_SUFFIXES[sIdx % TITLE_SUFFIXES.length] || '';
    }
    return {
      id: nextThreadId,
      title: base.title + suffix,
      author: base.author,
      avatar: base.avatar,
      section: base.section,
      replies: replies,
      views: views,
      timeAgo: timeAgo,
      isHot: base.isHot,
      isNew: true,
      likes: base.likes,
      liked: false,
      repliers: buildRepliers(replies),
      isOnline: Math.random() < 0.55
    };
  }

  // Ensure the thread pool has at least targetLen items
  function ensurePool(pool, targetLen) {
    while (pool.length < targetLen) {
      pool.push(synthesizeThread(nextExtraBase()));
    }
  }

  // Compute section counts from thread pool
  function computeSectionCounts(pool) {
    var counts = { hot: 0, show: 0, questions: 0, discussions: 0, tutorials: 0, news: 0, offtopic: 0, devlogs: 0 };
    for (var i = 0; i < pool.length; i++) {
      var t = pool[i];
      if (t.isHot) counts.hot++;
      var key = SECTION_KEY_MAP[t.section];
      if (key) counts[key]++;
    }
    return counts;
  }

  // Build repliers HTML (GitHub-style avatar stack)
  function buildRepliersHTML(t) {
    var repliers = t.repliers || [];
    if (repliers.length === 0 && t.replies <= 0) {
      return '<span class="thread-repliers-empty">no replies</span>';
    }
    var shown = repliers.slice(0, 5);
    var overflow = t.replies - shown.length;
    var html = '<div class="thread-repliers" title="' + t.replies + ' replies">';
    for (var i = 0; i < shown.length; i++) {
      var r = shown[i];
      html +=
        '<span class="thread-replier thread-replier-lazy" data-replier-avatar="' + r.avatar + '" data-replier-name="' + escapeHtml(r.name) + '">' +
          '<img src="' + r.avatar + '" alt="' + escapeHtml(r.name) + '" loading="lazy" decoding="async">' +
        '</span>';
    }
    if (overflow > 0) {
      html += '<span class="thread-repliers-more">+' + overflow + '</span>';
    }
    html += '</div>';
    return html;
  }

  // Avatar skeleton + reveal (handles cached images and loading states)
  function revealAvatar(wrap, img) {
    if (!img) return;
    if (img._avatarWired) return;
    img._avatarWired = true;
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-avatar-loaded');
      if (wrap) wrap.classList.remove('is-avatar-loading');
      return;
    }
    if (wrap) wrap.classList.add('is-avatar-loading');
    img.addEventListener('load', function () {
      if (wrap) wrap.classList.remove('is-avatar-loading');
      img.classList.add('is-avatar-loaded');
    }, { once: true });
    img.addEventListener('error', function () {
      if (wrap) wrap.classList.remove('is-avatar-loading');
      img.classList.add('is-avatar-loaded');
    }, { once: true });
  }

  /* ═══════════════════════════════════════════════════════════════
     3. CommunityPage React 组件
        return null — 静态 HTML 已由页面提供
        所有 DOM 交互通过 useEffect 管理
     ═══════════════════════════════════════════════════════════════ */
  function CommunityPage() {
    // ── 组件内部状态（原全局变量）──
    var [currentTab, setCurrentTab] = useState('All');
    var [currentSection, setCurrentSection] = useState(null);
    var [onlineCount, setOnlineCount] = useState(1247);
    var [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    var [isLoadingMore, setIsLoadingMore] = useState(false);
    var [hasMore, setHasMore] = useState(true);

    // ── Refs：线程池（可变数据源，无需触发重渲染）──
    var allThreadsRef = useRef(BASE_THREADS.slice());
    var ioObserverRef = useRef(null);
    var toastTimerRef = useRef(null);
    var onlineIntervalRef = useRef(null);

    // ── DOM refs ──
    var threadListRef = useRef(null);
    var tabsContainerRef = useRef(null);
    var onlineElRef = useRef(null);
    var toastElRef = useRef(null);
    var navTreeRef = useRef(null);
    var loaderElRef = useRef(null);
    var exhaustedRef = useRef(false);
    var firstRenderDoneRef = useRef(false);

    // ── 可变计数器（不需要 state，因为变化不触发渲染）──
    var nextThreadIdRef = useRef(1000);

    // ── State 镜像 Refs（解决 useEffect([]) 闭包陷阱）──
    // IntersectionObserver / loadMoreThreads 在 useEffect 中只创建一次，
    // 但需要读取最新的 visibleCount / isLoadingMore / hasMore / currentTab / currentSection。
    // 通过 ref 镜像，回调始终读到最新值，避免闭包捕获旧 state。
    var currentTabRef = useRef(currentTab);
    var currentSectionRef = useRef(currentSection);
    var visibleCountRef = useRef(visibleCount);
    var isLoadingMoreRef = useRef(isLoadingMore);
    var hasMoreRef = useRef(hasMore);

    // 同步 state → ref 镜像（每次渲染后执行）
    currentTabRef.current = currentTab;
    currentSectionRef.current = currentSection;
    visibleCountRef.current = visibleCount;
    isLoadingMoreRef.current = isLoadingMore;
    hasMoreRef.current = hasMore;

    /* ── getFilteredThreads：依赖 currentTab / currentSection / allThreads ──
       使用 ref 镜像读取最新 tab/section，避免闭包陷阱。
       无需 useCallback 依赖，因为 ref.current 始终是最新值。 */
    var getFilteredThreads = useCallback(function () {
      var list = allThreadsRef.current.slice();
      var sec = currentSectionRef.current;
      var tab = currentTabRef.current;
      if (sec) {
        var secName = KEY_TO_SECTION[sec] || sec;
        list = list.filter(function (t) { return t.section === secName; });
      }
      switch (tab) {
        case 'All':
          list.sort(function (a, b) {
            return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo);
          });
          break;
        case 'New':
          list = list.filter(function (t) { return t.isNew; });
          list.sort(function (a, b) {
            return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo);
          });
          break;
        case 'Hot':
          list = list.filter(function (t) { return t.isHot; });
          list.sort(function (a, b) {
            return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo);
          });
          break;
        case 'Latest':
          list.sort(function (a, b) {
            return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo);
          });
          break;
        case 'Top':
          list.sort(function (a, b) { return b.replies - a.replies; });
          break;
      }
      return list;
    }, []);

    /* ── showToast：显示提示消息 ── */
    var showToast = useCallback(function (msg) {
      var toastEl = toastElRef.current;
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('is-visible');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(function () {
        toastEl.classList.remove('is-visible');
      }, 2200);
    }, []);

    /* ── updateSidebarCounts：同步侧边栏计数 ── */
    var updateSidebarCounts = useCallback(function () {
      var navTree = navTreeRef.current;
      if (!navTree) return;
      var counts = computeSectionCounts(allThreadsRef.current);
      var countEls = navTree.querySelectorAll('.sidebar-nav-count');
      for (var i = 0; i < countEls.length; i++) {
        var key = countEls[i].getAttribute('data-count-key');
        if (!key) continue;
        var n = counts[key] || 0;
        var base = SECTION_COUNTS[key] || 0;
        var display = base + n;
        countEls[i].textContent = fmtCount(display);
      }
    }, []);

    /* ── wireLazyAvatars / wireReplierAvatars ── */
    var wireLazyAvatars = useCallback(function () {
      var threadList = threadListRef.current;
      if (!threadList) return;
      var wraps = threadList.querySelectorAll('.thread-avatar-lazy');
      for (var i = 0; i < wraps.length; i++) {
        var wrap = wraps[i];
        if (wrap._lazyWired) continue;
        wrap._lazyWired = true;
        revealAvatar(wrap, wrap.querySelector('img'));
      }
    }, []);

    var wireReplierAvatars = useCallback(function () {
      var threadList = threadListRef.current;
      if (!threadList) return;
      var wraps = threadList.querySelectorAll('.thread-replier-lazy');
      for (var i = 0; i < wraps.length; i++) {
        var wrap = wraps[i];
        if (wrap._lazyWired) continue;
        wrap._lazyWired = true;
        revealAvatar(wrap, wrap.querySelector('img'));
      }
    }, []);

    /* ── wireLikeButtons：绑定点赞按钮 ── */
    var wireLikeButtons = useCallback(function () {
      var threadList = threadListRef.current;
      if (!threadList) return;
      var btns = threadList.querySelectorAll('.thread-like:not([data-wired])');
      for (var i = 0; i < btns.length; i++) {
        (function (btn) {
          btn.setAttribute('data-wired', '1');
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var id = parseInt(btn.getAttribute('data-like-id'), 10);
            var thread = null;
            for (var j = 0; j < allThreadsRef.current.length; j++) {
              if (allThreadsRef.current[j].id === id) { thread = allThreadsRef.current[j]; break; }
            }
            if (!thread) return;
            if (thread.liked) {
              thread.liked = false;
              thread.likes = Math.max(0, thread.likes - 1);
              btn.classList.remove('is-liked');
              btn.title = 'Like';
            } else {
              thread.liked = true;
              thread.likes += 1;
              btn.classList.add('is-liked');
              btn.title = 'Liked';
              showToast('Liked ' + thread.author + "'s post");
            }
            var countEl = btn.querySelector('.thread-like-count');
            if (countEl) countEl.textContent = thread.likes;
          });
        })(btns[i]);
      }
    }, [showToast]);

    /* ── updateLoaderState：更新加载哨兵状态 ── */
    var updateLoaderState = useCallback(function (totalFiltered) {
      var loader = loaderElRef.current;
      if (!loader) return;
      var filteredLen = getFilteredThreads().length;
      // 使用 ref 镜像读取最新 visibleCount 和 hasMore，避免闭包陷阱
      if (visibleCountRef.current >= filteredLen || !hasMoreRef.current) {
        loader.classList.remove('loading');
        loader.innerHTML = '<div class="scroll-loader" style="opacity:0.3">// End of feed</div>';
        if (ioObserverRef.current) ioObserverRef.current.disconnect();
      }
    }, [getFilteredThreads]);

    /* ── renderThreads：渲染线程列表到 DOM ── */
    var renderThreads = useCallback(function (append, appendStart) {
      var threadList = threadListRef.current;
      if (!threadList) return;
      var threads = getFilteredThreads();
      // 使用 ref 镜像读取最新 visibleCount，避免闭包陷阱导致只渲染初始 6 条
      var currentVisible = visibleCountRef.current;
      var startIdx = append ? (appendStart || 0) : 0;
      var endIdx = Math.min(currentVisible, threads.length);
      var slice = threads.slice(startIdx, endIdx);

      var html = '';
      for (var i = 0; i < slice.length; i++) {
        var t = slice[i];
        var entranceClass = append ? 'thread-fade-in' : '';
        var styleAttr = '';
        html +=
          '<a class="thread-item ' + entranceClass + (t.isOnline ? ' is-author-online' : '') + '" href="community-detail.html?id=' + t.id + '" data-thread-id="' + t.id + '">' +
            '<div class="thread-avatar thread-avatar-lazy' + (t.isOnline ? ' is-online' : '') + '" data-avatar="' + t.avatar + '" data-author="' + t.author + '">' +
              '<img src="' + t.avatar + '" alt="' + t.author + '" loading="lazy" decoding="async">' +
              (t.isOnline ? '<span class="thread-avatar-online" aria-label="online"></span>' : '') +
            '</div>' +
            '<div class="thread-body">' +
              '<div class="thread-title">' + escapeHtml(t.title) +
                (t.isHot ? ' <span class="thread-hot-badge">HOT</span>' : '') +
                (t.isNew ? ' <span class="thread-new-badge">NEW</span>' : '') +
                ' <span class="thread-like' + (t.liked ? ' is-liked' : '') + '" data-like-id="' + t.id + '" title="' + (t.liked ? 'Liked' : 'Like') + '">' + HEART_SVG + '<span class="thread-like-count">' + t.likes + '</span></span>' +
              '</div>' +
              '<div class="thread-meta">' +
                '<span class="thread-author">@' + t.author + '</span>' +
                '<span class="thread-section-tag">' + t.section + '</span>' +
                '<span class="thread-time">' + t.timeAgo + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="thread-stats">' +
              buildRepliersHTML(t) +
            '</div>' +
          '</a>';
      }

      if (append) {
        var tpl = document.createElement('template');
        tpl.innerHTML = html;
        threadList.appendChild(tpl.content);
      } else {
        threadList.innerHTML = html;
      }

      wireLazyAvatars();
      wireReplierAvatars();

      updateLoaderState(threads.length);
      wireLikeButtons();

      // 触发入场动画：下一帧逐个添加 is-entered 类，
      // 让 CSS 从 opacity:0 过渡到 opacity:1
      var newItems = append
        ? threadList.querySelectorAll('.thread-item:not(.is-entered)')
        : threadList.querySelectorAll('.thread-item');
      requestAnimationFrame(function () {
        for (var ni = 0; ni < newItems.length; ni++) {
          (function (item, idx) {
            setTimeout(function () {
              item.classList.add('is-entered');
            }, idx * 40);
          })(newItems[ni], ni);
        }
      });
    }, [getFilteredThreads, wireLazyAvatars, wireReplierAvatars, wireLikeButtons, updateLoaderState]);

    /* ── resetAndRender：切换 Tab / Section 后重置并重新渲染 ── */
    var resetAndRender = useCallback(function () {
      setVisibleCount(PAGE_SIZE);
      visibleCountRef.current = PAGE_SIZE;
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
      exhaustedRef.current = false;

      var filtered = getFilteredThreads();
      var newHasMore = PAGE_SIZE < filtered.length;
      setHasMore(newHasMore);
      hasMoreRef.current = newHasMore;

      var loader = loaderElRef.current;
      if (loader) {
        loader.classList.remove('loading');
        if (newHasMore) {
          loader.innerHTML = '<div class="scroll-loader"><div class="scroll-loader-spinner"></div></div>';
        }
      }
      if (ioObserverRef.current) {
        ioObserverRef.current.disconnect();
        if (newHasMore) ioObserverRef.current.observe(loader);
      }

      // 使用 setTimeout 确保 state 更新后再渲染
      // renderThreads 通过 ref 镜像读取最新 visibleCount
      setTimeout(function () {
        renderThreads(false);
        updateSidebarCounts();
      }, 0);
    }, [getFilteredThreads, renderThreads, updateSidebarCounts]);

    /* ═══════════════════════════════════════════════════════════════
       4. 主 useEffect：初始化所有 DOM 交互
          在组件挂载后执行一次，返回清理函数
       ═══════════════════════════════════════════════════════════════ */
    useEffect(function () {
      var timers = [];
      // 事件绑定跟踪，cleanup 时移除
      var boundTabs = null, boundTabHandler = null;
      var boundNavItems = null, boundNavHandler = null;
      var boundNewPostBtn = null, boundNewPostHandler = null;
      var boundLoadMoreBtn = null, boundLoadMoreHandler = null;

      function schedule(fn, delay) {
        var id = setTimeout(fn, delay);
        timers.push(id);
        return id;
      }

      // ── 获取 DOM 引用 ──
      threadListRef.current = document.getElementById('threadList');
      tabsContainerRef.current = document.getElementById('communityTabs');
      onlineElRef.current = document.getElementById('communityOnline');
      toastElRef.current = document.getElementById('communityToast');
      navTreeRef.current = document.getElementById('communityNavTree');
      loaderElRef.current = document.getElementById('threadLoader');

      if (!threadListRef.current) return;

      // ── 种子线程池（12 base + 50 = 62 total）──
      ensurePool(allThreadsRef.current, 62);

      // ── 读取 URL 参数确定 currentSection ──
      var querySection = null;
      try {
        var params = new URLSearchParams(window.location.search);
        querySection = params.get('section');
      } catch (e) { querySection = null; }
      if (querySection && KEY_TO_SECTION[querySection]) {
        setCurrentSection(querySection);
        // 同步 ref 镜像，让首次 renderThreads 立即读到 section
        currentSectionRef.current = querySection;
        var navTree = navTreeRef.current;
        if (navTree) {
          var matchItem = navTree.querySelector('.sidebar-nav-item[data-section="' + querySection + '"]');
          if (matchItem) matchItem.classList.add('is-active');
        }
      }

      // ── 分类横幅（community-list.html）──
      applySectionBanner(querySection);

      // ── 设置首 Tab 激活 ──
      var tabsContainer = tabsContainerRef.current;
      if (tabsContainer) {
        var firstTab = tabsContainer.querySelector('.community-tab');
        if (firstTab) firstTab.classList.add('is-active');
      }

      // ── 首次渲染线程列表 ──
      // HTML 已提供静态骨架帖子（.skel-thread-item），立即可见。
      // 延迟 600ms 后用真实帖子 innerHTML 替换骨架，确保骨架屏被用户感知。
      // 首次渲染完成后才启动 IntersectionObserver，避免无限滚动在骨架屏阶段提前触发。
      schedule(function () {
        renderThreads(false);
        updateSidebarCounts();
        firstRenderDoneRef.current = true;
        // 首次渲染完成后再 observe sentinel，避免 IntersectionObserver 在骨架屏阶段触发 loadMore
        if (ioObserverRef.current && loaderElRef.current && hasMoreRef.current && !exhaustedRef.current) {
          ioObserverRef.current.observe(loaderElRef.current);
        }
      }, 600);

      // ── Tab 切换 ──
      if (tabsContainer) {
        var tabs = tabsContainer.querySelectorAll('.community-tab');
        var isCategoryPage = !!document.getElementById('sectionHero');
        boundTabs = tabs;
        boundTabHandler = function () {
          var tab = this;
          var tabName = tab.getAttribute('data-tab') || tab.textContent;
          setCurrentTab(tabName);
          // 同步 ref 镜像，让后续 getFilteredThreads 立即读到新 tab
          currentTabRef.current = tabName;
          for (var j = 0; j < tabs.length; j++) {
            tabs[j].classList.toggle('is-active', tabs[j] === tab);
          }
          if (tabName === 'All' && currentSectionRef.current && !isCategoryPage) {
            setCurrentSection(null);
            currentSectionRef.current = null;
            var nav = navTreeRef.current;
            if (nav) {
              var items = nav.querySelectorAll('.sidebar-nav-item');
              for (var k = 0; k < items.length; k++) {
                items[k].classList.remove('is-active');
              }
            }
          }
          setVisibleCount(PAGE_SIZE);
          // 同步 ref 镜像，避免 renderThreads 闭包读到旧值
          visibleCountRef.current = PAGE_SIZE;
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
          exhaustedRef.current = false;
          var filtered = getFilteredThreads();
          var newHasMore = PAGE_SIZE < filtered.length;
          setHasMore(newHasMore);
          hasMoreRef.current = newHasMore;
          var loader = loaderElRef.current;
          if (loader) {
            loader.classList.remove('loading');
            if (newHasMore) {
              loader.innerHTML = '<div class="scroll-loader"><div class="scroll-loader-spinner"></div></div>';
            }
          }
          if (ioObserverRef.current) {
            ioObserverRef.current.disconnect();
            if (newHasMore) ioObserverRef.current.observe(loader);
          }
          setTimeout(function () {
            renderThreads(false);
            updateSidebarCounts();
          }, 0);
        };
        for (var ti = 0; ti < tabs.length; ti++) {
          tabs[ti].addEventListener('click', boundTabHandler);
        }
      }

      // ── 侧边栏导航 ──
      var navTree = navTreeRef.current;
      if (navTree) {
        var navItems = navTree.querySelectorAll('.sidebar-nav-item');
        boundNavItems = navItems;
        boundNavHandler = function (e) {
          var item = this;
          var href = item.getAttribute('href') || '';
          if (href === '#' || href === '') {
            e.preventDefault();
            var section = item.getAttribute('data-section');
            window.location.href = 'community-list.html?section=' + encodeURIComponent(section);
          }
        };
        for (var ni = 0; ni < navItems.length; ni++) {
          navItems[ni].addEventListener('click', boundNavHandler);
        }
      }

      // ── 新帖按钮 ──
      var newPostBtn = document.querySelector('.btn-new-post, .sidebar-new-post-btn');
      if (newPostBtn) {
        boundNewPostBtn = newPostBtn;
        boundNewPostHandler = function (e) {
          e.preventDefault();
          window.location.href = 'community-new.html';
        };
        newPostBtn.addEventListener('click', boundNewPostHandler);
      }

      // ── 在线人数波动 ──
      var onlineEl = onlineElRef.current;
      if (onlineEl) {
        var currentOnline = 1247;
        function updateOnline() {
          var delta = Math.floor(Math.random() * 5) + 1;
          if (Math.random() < 0.5) delta = -delta;
          currentOnline = Math.max(800, currentOnline + delta);
          onlineEl.textContent = currentOnline.toLocaleString();
          setOnlineCount(currentOnline);
        }
        var onlineDelay = (Math.floor(Math.random() * 4) + 5) * 1000;
        onlineIntervalRef.current = setInterval(updateOnline, onlineDelay);
      }

      // ── 无限滚动（骨架屏 + Observer 重新触发 + 数据耗尽停止） ──
      var loaderEl = loaderElRef.current;
      // 骨架屏卡片生成器（社区帖子样式）
      function createThreadSkeleton() {
        var skel = document.createElement('div');
        skel.className = 'skeleton-card thread-card';
        skel.innerHTML =
          '<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">' +
            '<div class="skeleton-avatar" style="width:36px;height:36px;border-radius:50%;flex-shrink:0;"></div>' +
            '<div style="flex:1;display:flex;flex-direction:column;gap:6px;">' +
              '<div class="skeleton-line" style="width:30%;height:12px;"></div>' +
              '<div class="skeleton-line short" style="width:65%;height:14px;"></div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:16px;margin-top:8px;">' +
            '<div class="skeleton-line" style="width:50px;height:11px;"></div>' +
            '<div class="skeleton-line" style="width:70px;height:11px;"></div>' +
            '<div class="skeleton-line" style="width:45px;height:11px;"></div>' +
          '</div>';
        return skel;
      }

      var scrollContainer = document.querySelector('.thread-list') || document.querySelector('.community-main-content');
      var threadList = document.querySelector('.thread-list');

      // ── loadMore：无限滚动加载更多（骨架屏 + 数据耗尽停止） ──
      // 使用 ref 镜像读取最新 state，避免 useEffect([]) 闭包陷阱
      function loadMoreThreads(sched) {
        // 首次渲染完成前不执行加载更多，避免骨架屏阶段提前加载
        if (!firstRenderDoneRef.current) return;
        if (isLoadingMoreRef.current || !hasMoreRef.current || exhaustedRef.current) return;
        setIsLoadingMore(true);
        loaderEl.classList.add('loading');

        sched(function () {
          // 清除骨架屏占位
          if (threadList) {
            var skeletons = threadList.querySelectorAll('.skeleton-card.thread-card');
            skeletons.forEach(function (sk) { sk.remove(); });
          }

          // 数据池不足时补充新帖
          if (allThreadsRef.current.length <= 80) {
            var needed = PAGE_SIZE;
            for (var i = 0; i < needed; i++) {
              var base = nextExtraBase();
              var sec = currentSectionRef.current;
              if (sec && sec !== 'hot' && KEY_TO_SECTION[sec]) {
                base = {
                  title: base.title,
                  author: base.author,
                  avatar: base.avatar,
                  section: KEY_TO_SECTION[sec],
                  isHot: sec === 'hot',
                  likes: base.likes
                };
              }
              allThreadsRef.current.push(synthesizeThread(base));
            }
          }

          var filteredNow = getFilteredThreads();
          var prevVisible = visibleCountRef.current;
          var newVisible = prevVisible + PAGE_SIZE;

          // 判断是否还有更多数据
          if (newVisible >= filteredNow.length && allThreadsRef.current.length > 80) {
            exhaustedRef.current = true;
            setHasMore(false);
            hasMoreRef.current = false;
            setIsLoadingMore(false);
            isLoadingMoreRef.current = false;
            loaderEl.classList.remove('loading');
            loaderEl.innerHTML = '<div class="scroll-loader" style="opacity:0.4;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;">// END OF FEED</div>';
            if (ioObserverRef.current) ioObserverRef.current.unobserve(loaderEl);
            // 先同步 ref 镜像，再调用 renderThreads，避免闭包读到旧 visibleCount
            visibleCountRef.current = newVisible;
            setVisibleCount(newVisible);
            renderThreads(true, prevVisible);
            updateSidebarCounts();
            return;
          }

          setHasMore(true);
          hasMoreRef.current = true;
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
          loaderEl.classList.remove('loading');
          // 先同步 ref 镜像，再调用 renderThreads，避免闭包读到旧 visibleCount
          // 否则 renderThreads 会用旧值计算 endIdx，导致新帖子无法渲染（闪烁）
          visibleCountRef.current = newVisible;
          setVisibleCount(newVisible);
          renderThreads(true, prevVisible);
          updateSidebarCounts();

          // 重新 observe sentinel 让 IntersectionObserver 再次触发
          if (ioObserverRef.current && !exhaustedRef.current) {
            ioObserverRef.current.unobserve(loaderEl);
            setTimeout(function () {
              if (ioObserverRef.current && !exhaustedRef.current) {
                ioObserverRef.current.observe(loaderEl);
              }
            }, 50);
          }
        }, 400);
      }

      if (loaderEl) {
        if (!('IntersectionObserver' in window)) {
          loaderEl.innerHTML = '<button class="thread-load-more-btn" type="button">Load more threads</button>';
          var loadBtn = loaderEl.querySelector('.thread-load-more-btn');
          if (loadBtn) {
            boundLoadMoreBtn = loadBtn;
            boundLoadMoreHandler = function () { loadMoreThreads(schedule); };
            loadBtn.addEventListener('click', boundLoadMoreHandler);
          }
        } else {
          ioObserverRef.current = new IntersectionObserver(function (entries) {
            for (var ei = 0; ei < entries.length; ei++) {
              var entry = entries[ei];
              // 首次渲染完成前不触发无限滚动，避免骨架屏阶段提前加载
              if (!firstRenderDoneRef.current) break;
              // 使用 ref 镜像读取最新 loading/hasMore 状态，避免闭包陷阱
              if (entry.isIntersecting && !isLoadingMoreRef.current && hasMoreRef.current && !exhaustedRef.current) {
                // 插入骨架屏占位
                if (threadList) {
                  var frag = document.createDocumentFragment();
                  for (var s = 0; s < PAGE_SIZE; s++) frag.appendChild(createThreadSkeleton());
                  threadList.appendChild(frag);
                }
                loadMoreThreads(schedule);
                break;
              }
            }
          }, { root: null, rootMargin: '200px', threshold: 0 });
          // 注意：observe 延迟到首次 renderThreads 完成后执行（见 schedule 回调），
          // 避免 IntersectionObserver 在骨架屏阶段提前触发 loadMoreThreads。
        }
      }

      // ── 分类横幅辅助函数 ──
      function applySectionBanner(sectionKey) {
        var titleEl = document.getElementById('sectionTitle');
        var countEl = document.getElementById('sectionCount');
        var crumbEl = document.getElementById('sectionCrumb');
        var heroEl = document.getElementById('sectionHero');
        if (!heroEl) return;
        var sectionName = KEY_TO_SECTION[sectionKey];
        if (!sectionName) {
          if (titleEl) titleEl.textContent = 'All Threads';
          if (crumbEl) crumbEl.textContent = 'All';
          if (countEl) countEl.textContent = '';
          return;
        }
        if (titleEl) titleEl.textContent = sectionName;
        if (crumbEl) crumbEl.textContent = sectionName;
        if (countEl) {
          var counts = computeSectionCounts(allThreadsRef.current);
          var total = (SECTION_COUNTS[sectionKey] || 0) + (counts[sectionKey] || 0);
          countEl.textContent = fmtCount(total) + ' threads';
        }
      }

      // ── 清理函数 ──
      return function cleanup() {
        timers.forEach(function (id) { clearTimeout(id); });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        if (onlineIntervalRef.current) clearInterval(onlineIntervalRef.current);
        if (ioObserverRef.current) ioObserverRef.current.disconnect();
        // 移除通过 event delegation 注册的事件监听器
        if (boundTabs) boundTabs.forEach(function (tab) { tab.removeEventListener('click', boundTabHandler); });
        if (boundNavItems) boundNavItems.forEach(function (item) { item.removeEventListener('click', boundNavHandler); });
        if (boundNewPostBtn) boundNewPostBtn.removeEventListener('click', boundNewPostHandler);
        if (boundLoadMoreBtn) boundLoadMoreBtn.removeEventListener('click', boundLoadMoreHandler);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 静态内容由 HTML 提供，组件不渲染内容
    return null;
  }

  // 导出组件
  global.CommunityPage = CommunityPage;

  /* ── 自动挂载到 GHRANK chrome 层 ── */
  // 使用 auto-detect：mountChrome() 会根据 URL 自动识别 'community' 或 'community-list'
  if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
    global.GHRANK.mountChrome(null, CommunityPage);
  } else {
    console.error('[GHRANK/Community] GHRANK.mountChrome 未找到，请确保 core.js 先于 community.js 加载');
  }
})(window);
