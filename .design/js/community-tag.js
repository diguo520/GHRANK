/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // React 19 COMMUNITY TAG — 标签帖子列表页
   ────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   职责：
   1. 读取 URL ?tag=xxx 参数，渲染标签 Hero 与面包屑
   2. 根据标签过滤帖子列表（每条帖子从 TIEBA_CATALOG 映射 tags）
   3. 骨架屏 → 真实帖子 → IntersectionObserver 无限滚动（分页分块 PAGE_SIZE）
   4. 左侧 Hot Tags / 右侧 Hot Tiebas 复用 community.js 渲染函数
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useCallback, useRef } = React;

  // 帖子标题池，按标签分类，用于生成该标签下的合成帖子
  var TAG_TITLE_POOL = {
    'AI-Agents': [
      'Designing agent orchestration with explicit tool boundaries',
      'Multi-agent planning: centralized vs swarm topology',
      'Tool use failure modes in production agent systems',
      'Building a state machine for long-running agent workflows',
      'Evaluating agent reasoning with deterministic replay'
    ],
    'RAG': [
      'Chunking strategies for technical documentation RAG',
      'Embedding model selection for multi-lingual corpora',
      'Hybrid retrieval: dense + sparse in production',
      'RAG evaluation metrics beyond nDCG',
      'Handling stale knowledge in retrieval pipelines'
    ],
    'LLM-Finetune': [
      'QLoRA memory profiling for 70B models',
      'Dataset curation for instruction fine-tuning',
      'Learning rate schedules for LoRA adapters',
      'Evaluating catastrophic forgetting during continual pretraining',
      'Fine-tuning reward models for domain-specific RLHF'
    ],
    'Vector-DB': [
      'pgvector vs Qdrant: latency under concurrent load',
      'Index tuning for HNSW with high-dimensional embeddings',
      'Metadata filtering strategies in vector stores',
      'Multi-tenant vector isolation patterns',
      'Benchmarking recall across vector databases'
    ],
    'Open-Source': [
      'Open-core pricing without alienating contributors',
      'License compatibility across ML dependencies',
      'Maintainer burnout and sustainable governance',
      'Building a CLA-bot that actually works',
      'Community health metrics that predict project longevity'
    ],
    'CLI-Tools': [
      'Progressive enhancement in terminal UI frameworks',
      'Shell completion generation from Go structs',
      'Testing CLI apps with golden file patterns',
      'Error message design for power users',
      'Distributing binaries across package managers'
    ],
    'GHRANK-API': [
      'Rate-limiting patterns for public scoring APIs',
      'Webhook signatures and replay attack prevention',
      'Versioning strategy for breaking API changes',
      'OpenAPI generation from TypeScript controllers',
      'Caching TTL strategies for repo metadata'
    ],
    'Scoring-Model': [
      'Time-decay functions compared: exponential vs power-law',
      'Signal weighting with community feedback loops',
      'Detecting gaming attempts in repo scoring',
      'Temporal staleness in aggregate rankings',
      'A/B testing ranking changes without bias'
    ],
    'DevOps': [
      'GitHub Actions matrix strategies for ML pipelines',
      'Observability for GPU training clusters',
      'Immutable infrastructure for inference endpoints',
      'Cost attribution across shared Kubernetes namespaces',
      'Disaster recovery for stateful model registries'
    ],
    'Tutorial': [
      'Ship your first RAG CLI end-to-end',
      'Build a reproducible fine-tuning notebook',
      'From zero to vector search with pgvector',
      'Writing custom GitHub Actions for model evaluation',
      'Containerize and deploy a FastAPI inference service'
    ]
  };

  // 兜底标题池
  var FALLBACK_TITLES = [
    'Deep dive: scaling patterns for community-driven platforms',
    'Question: best practices for caching derived signals',
    'Show & Tell: a minimal scoring dashboard',
    'Discussion: how do you measure open source impact',
    'Tutorial: shipping faster with deterministic CI'
  ];

  // 模拟作者池
  var AUTHOR_POOL = [
    { name: 'AlexShader', avatar: '../styles/images/demo/prompt_1.jpg' },
    { name: 'kairos', avatar: '../styles/images/demo/prompt_2.jpg' },
    { name: 'nexusdev', avatar: '../styles/images/demo/prompt_3.jpg' },
    { name: 'mlcraft', avatar: '../styles/images/demo/prompt_4.jpg' },
    { name: 'voidrunner', avatar: '../styles/images/demo/prompt_5.jpg' },
    { name: 'shellweird', avatar: '../styles/images/demo/prompt_6.jpg' },
    { name: 'newton_r', avatar: '../styles/images/demo/prompt_7.jpg' },
    { name: 'mirakade', avatar: '../styles/images/demo/prompt_8.jpg' },
    { name: 'jintao', avatar: '../styles/images/demo/prompt_3.jpg' },
    { name: 'pixelshift', avatar: '../styles/images/demo/prompt_1.jpg' },
    { name: 'dataforge', avatar: '../styles/images/demo/prompt_5.jpg' }
  ];

  // 分区映射
  var SECTIONS = ['Discussions', 'Show & Tell', 'Questions', 'Tutorials', 'News & Updates', 'Off-Topic', 'Dev Logs'];

  // 标签 → 贴吧 ID 映射（用于帖子链接携带 bar 参数）
  var TAG_TO_BAR = {
    'AI-Agents': 'ai-agents',
    'LLM': 'ai-agents',
    'RAG': 'rag-builders',
    'Vector-DB': 'vector-db',
    'LLM-Finetune': 'llm-train',
    'CLI-Tools': 'cli-craft',
    'Open-Source': 'open-src',
    'Scoring-Model': 'scoring',
    'GHRANK-API': 'scoring',
    'DevOps': 'devops',
    'Tutorial': 'ai-agents'
  };

  // 根据标签获取对应贴吧 ID，未命中时回退到第一个贴吧
  function tagToBarId(tag) {
    return TAG_TO_BAR[tag] || 'ai-agents';
  }

  // 常量
  var PAGE_SIZE = 6;
  var HEART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  // 从 community.js 继承的热门贴吧与标签排名（运行时 window 中已有）
  var HOT_TIEBAS = [
    { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', members: '12.4K', posts: '3.2K' },
    { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', members: '8.7K', posts: '2.1K' },
    { id: 'llm-train', name: 'LLM Training', icon: 'LL', members: '6.3K', posts: '1.8K' },
    { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', members: '4.9K', posts: '1.2K' },
    { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', members: '3.5K', posts: '890' }
  ];

  var TAG_RANKINGS = [
    { tag: 'AI-Agents', rank: 1, trend: 'up', change: 2 },
    { tag: 'RAG', rank: 2, trend: 'up', change: 1 },
    { tag: 'LLM-Finetune', rank: 3, trend: 'down', change: 1 },
    { tag: 'Vector-DB', rank: 4, trend: 'flat', change: 0 },
    { tag: 'Open-Source', rank: 5, trend: 'up', change: 3 },
    { tag: 'CLI-Tools', rank: 6, trend: 'down', change: 2 },
    { tag: 'GHRANK-API', rank: 7, trend: 'up', change: 1 },
    { tag: 'Scoring-Model', rank: 8, trend: 'flat', change: 0 },
    { tag: 'DevOps', rank: 9, trend: 'down', change: 1 },
    { tag: 'Tutorial', rank: 10, trend: 'up', change: 4 }
  ];

  var TREND_SVGS = {
    up: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 2L8 6H2z" fill="currentColor"/></svg>',
    down: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8L2 4H8z" fill="currentColor"/></svg>',
    flat: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 5h6"/></svg>'
  };

  // 工具函数
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtCount(n) {
    return n.toLocaleString();
  }

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

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // 构建随机回复者头像堆叠
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
        '<span class="thread-replier thread-replier-lazy">' +
          '<img src="' + r.avatar + '" alt="' + escapeHtml(r.name) + '" loading="lazy" decoding="async">' +
        '</span>';
    }
    if (overflow > 0) {
      html += '<span class="thread-repliers-more">+' + overflow + '</span>';
    }
    html += '</div>';
    return html;
  }

  // 合成一条属于某标签的帖子
  var nextThreadId = 5000;
  function synthesizeTagThread(tag) {
    nextThreadId++;
    var titlePool = TAG_TITLE_POOL[tag] || FALLBACK_TITLES;
    var author = pickOne(AUTHOR_POOL);
    var title = pickOne(titlePool);
    var section = pickOne(SECTIONS);
    var replies = randomInt(2, 120);
    var views = randomInt(200, 6000);
    var minsAgo = randomInt(5, 2880);
    var timeAgo = minsAgo < 60 ? minsAgo + 'm' : (minsAgo < 1440 ? Math.floor(minsAgo / 60) + 'h' : Math.floor(minsAgo / 1440) + 'd');
    var likes = randomInt(0, 220);
    return {
      id: nextThreadId,
      title: title,
      author: author.name,
      avatar: author.avatar,
      section: section,
      tag: tag,
      replies: replies,
      views: views,
      timeAgo: timeAgo,
      isHot: likes > 80 || replies > 80,
      isNew: minsAgo < 60 * 24,
      likes: likes,
      liked: false,
      repliers: buildRepliers(replies),
      isOnline: Math.random() < 0.55
    };
  }

  // 生成该标签下的种子帖子池（42条）
  function buildTagPool(tag) {
    var pool = [];
    for (var i = 0; i < 42; i++) {
      pool.push(synthesizeTagThread(tag));
    }
    return pool;
  }

  // 渲染标签排名
  function renderTagRankList(container, activeTag) {
    if (!container) return;
    var html = '';
    for (var i = 0; i < TAG_RANKINGS.length; i++) {
      var item = TAG_RANKINGS[i];
      var trendClass = 'is-' + item.trend;
      var trendSvg = TREND_SVGS[item.trend] || TREND_SVGS.flat;
      var changeText = item.change > 0 ? String(item.change) : '';
      var activeClass = item.tag === activeTag ? ' is-active' : '';
      html +=
        '<a class="tag-rank-item' + activeClass + '" href="community-tag.html?tag=' + encodeURIComponent(item.tag) + '" data-tag="' + escapeHtml(item.tag) + '">' +
          '<span class="tag-rank-num">' + item.rank + '</span>' +
          '<span class="tag-rank-name">' + escapeHtml(item.tag) + '</span>' +
          '<span class="tag-rank-trend ' + trendClass + '">' +
            trendSvg +
            (changeText ? '<span class="tag-rank-change">' + changeText + '</span>' : '') +
          '</span>' +
        '</a>';
    }
    container.innerHTML = html;
  }

  // 渲染热门贴吧
  function renderHotBarsList(container) {
    if (!container) return;
    var html = '';
    for (var i = 0; i < HOT_TIEBAS.length; i++) {
      var bar = HOT_TIEBAS[i];
      html +=
        '<a class="hot-bar-item" href="community-tiebas.html?bar=' + encodeURIComponent(bar.id) + '">' +
          '<span class="hot-bar-icon">' + escapeHtml(bar.icon) + '</span>' +
          '<div class="hot-bar-info">' +
            '<div class="hot-bar-name">' + escapeHtml(bar.name) + '</div>' +
            '<div class="hot-bar-meta">' + bar.members + ' members · ' + bar.posts + ' posts</div>' +
          '</div>' +
        '</a>';
    }
    container.innerHTML = html;
  }

  // 处理懒加载头像
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

  function wireLazyAvatars(threadList) {
    if (!threadList) return;
    var wraps = threadList.querySelectorAll('.thread-avatar-lazy');
    for (var i = 0; i < wraps.length; i++) {
      var wrap = wraps[i];
      if (wrap._lazyWired) continue;
      wrap._lazyWired = true;
      revealAvatar(wrap, wrap.querySelector('img'));
    }
  }

  function wireReplierAvatars(threadList) {
    if (!threadList) return;
    var wraps = threadList.querySelectorAll('.thread-replier-lazy');
    for (var i = 0; i < wraps.length; i++) {
      var wrap = wraps[i];
      if (wrap._lazyWired) continue;
      wrap._lazyWired = true;
      revealAvatar(wrap, wrap.querySelector('img'));
    }
  }

  // CommunityTagPage React 组件
  function CommunityTagPage() {
    var [currentTab, setCurrentTab] = useState('All');
    var [onlineCount, setOnlineCount] = useState(1247);
    var [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    var [isLoadingMore, setIsLoadingMore] = useState(false);
    var [hasMore, setHasMore] = useState(true);

    var allThreadsRef = useRef([]);
    var ioObserverRef = useRef(null);
    var toastTimerRef = useRef(null);
    var onlineIntervalRef = useRef(null);

    var threadListRef = useRef(null);
    var tabsContainerRef = useRef(null);
    var onlineElRef = useRef(null);
    var toastElRef = useRef(null);
    var loaderElRef = useRef(null);
    var exhaustedRef = useRef(false);
    var firstRenderDoneRef = useRef(false);

    var currentTabRef = useRef(currentTab);
    var visibleCountRef = useRef(visibleCount);
    var isLoadingMoreRef = useRef(isLoadingMore);
    var hasMoreRef = useRef(hasMore);

    currentTabRef.current = currentTab;
    visibleCountRef.current = visibleCount;
    isLoadingMoreRef.current = isLoadingMore;
    hasMoreRef.current = hasMore;

    var currentTagRef = useRef('');

    // 过滤与排序
    var getFilteredThreads = useCallback(function () {
      var list = allThreadsRef.current.slice();
      var tab = currentTabRef.current;
      switch (tab) {
        case 'New':
          list = list.filter(function (t) { return t.isNew; });
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
        case 'Hot':
          list = list.filter(function (t) { return t.isHot; });
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
        case 'Top':
          list.sort(function (a, b) { return b.replies - a.replies; });
          break;
        case 'All':
        default:
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
      }
      return list;
    }, []);

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

    var updateLoaderState = useCallback(function () {
      var loader = loaderElRef.current;
      if (!loader) return;
      var filteredLen = getFilteredThreads().length;
      if (visibleCountRef.current >= filteredLen || !hasMoreRef.current) {
        loader.classList.remove('loading');
        loader.innerHTML = '<div class="scroll-loader" style="opacity:0.3">// End of feed</div>';
        if (ioObserverRef.current) ioObserverRef.current.disconnect();
      }
    }, [getFilteredThreads]);

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

    var renderThreads = useCallback(function (append, appendStart) {
      var threadList = threadListRef.current;
      if (!threadList) return;
      var threads = getFilteredThreads();
      var currentVisible = visibleCountRef.current;
      var startIdx = append ? (appendStart || 0) : 0;
      var endIdx = Math.min(currentVisible, threads.length);
      var slice = threads.slice(startIdx, endIdx);

      var html = '';
      for (var i = 0; i < slice.length; i++) {
        var t = slice[i];
        var entranceClass = append ? 'thread-fade-in' : '';
        // 作者在线标识随机显示
        var isOnline = Math.random() < 0.55;
        html +=
          '<a class="thread-item ' + entranceClass + (isOnline ? ' is-author-online' : '') + '" href="community-detail.html?id=' + t.id + '&bar=' + encodeURIComponent(tagToBarId(t.tag)) + '" data-thread-id="' + t.id + '">' +
            '<div class="thread-avatar thread-avatar-lazy' + (isOnline ? ' is-online' : '') + '">' +
              '<img src="' + t.avatar + '" alt="' + t.author + '" loading="lazy" decoding="async">' +
              (isOnline ? '<span class="thread-avatar-online" aria-label="online"></span>' : '') +
            '</div>' +
            '<div class="thread-body">' +
              '<div class="thread-title">' + escapeHtml(t.title) +
                (t.isHot ? ' <span class="thread-hot-badge">HOT</span>' : '') +
                (t.isNew ? ' <span class="thread-new-badge">NEW</span>' : '') +
                ' <span class="thread-like' + (t.liked ? ' is-liked' : '') + '" data-like-id="' + t.id + '" title="' + (t.liked ? 'Liked' : 'Like') + '">' + HEART_SVG + '<span class="thread-like-count">' + t.likes + '</span></span>' +
              '</div>' +
              '<div class="thread-meta">' +
                '<span class="thread-author">@' + t.author + '</span>' +
                '<span class="thread-bar-tag">' + escapeHtml(t.tag) + '</span>' +
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

      wireLazyAvatars(threadList);
      wireReplierAvatars(threadList);
      updateLoaderState();
      wireLikeButtons();

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
    }, [getFilteredThreads, wireLikeButtons, updateLoaderState]);

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

      setTimeout(function () {
        renderThreads(false);
      }, 0);
    }, [getFilteredThreads, renderThreads]);

    useEffect(function () {
      var timers = [];
      var boundTabs = null, boundTabHandler = null;
      var boundNewPostBtn = null, boundNewPostHandler = null;
      var boundLoadMoreBtn = null, boundLoadMoreHandler = null;

      function schedule(fn, delay) {
        var id = setTimeout(fn, delay);
        timers.push(id);
        return id;
      }

      // 读取 URL tag 参数
      var params = new URLSearchParams(window.location.search);
      var tag = params.get('tag') || 'AI-Agents';
      currentTagRef.current = tag;

      // DOM 引用
      threadListRef.current = document.getElementById('threadList');
      tabsContainerRef.current = document.getElementById('communityTabs');
      onlineElRef.current = document.getElementById('communityOnline');
      toastElRef.current = document.getElementById('communityToast');
      loaderElRef.current = document.getElementById('threadLoader');

      if (!threadListRef.current) return;

      // 渲染标签 Hero
      var tagTitleEl = document.getElementById('tagTitle');
      var tagCrumbEl = document.getElementById('tagCrumb');
      var tagCountEl = document.getElementById('tagCount');
      if (tagTitleEl) tagTitleEl.textContent = escapeHtml(tag);
      if (tagCrumbEl) tagCrumbEl.textContent = escapeHtml(tag);
      if (tagCountEl) tagCountEl.textContent = 'Posts tagged with #' + escapeHtml(tag);
      document.title = 'GHRANK // Community — #' + tag;

      // 渲染侧边栏
      var tagRankListEl = document.getElementById('tagRankList');
      if (tagRankListEl) renderTagRankList(tagRankListEl, tag);

      var hotBarsListEl = document.getElementById('hotBarsList');
      if (hotBarsListEl) renderHotBarsList(hotBarsListEl);

      // 创建贴吧按钮
      var createBarBtn = document.getElementById('createBarBtn');
      if (createBarBtn) {
        createBarBtn.addEventListener('click', function () {
          var toast = toastElRef.current;
          if (toast) {
            toast.textContent = 'Create Tieba — coming soon';
            toast.classList.add('is-visible');
            setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
          }
        });
      }

      // 构建该标签的帖子池
      allThreadsRef.current = buildTagPool(tag);

      // 设置首 Tab 激活
      var tabsContainer = tabsContainerRef.current;
      if (tabsContainer) {
        var firstTab = tabsContainer.querySelector('.community-tab');
        if (firstTab) firstTab.classList.add('is-active');
      }

      // 首次渲染（600ms 骨架屏后）
      schedule(function () {
        renderThreads(false);
        firstRenderDoneRef.current = true;
        if (ioObserverRef.current && loaderElRef.current && hasMoreRef.current && !exhaustedRef.current) {
          ioObserverRef.current.observe(loaderElRef.current);
        }
      }, 600);

      // Tab 切换
      if (tabsContainer) {
        var tabs = tabsContainer.querySelectorAll('.community-tab');
        boundTabs = tabs;
        boundTabHandler = function () {
          var tab = this;
          var tabName = tab.getAttribute('data-tab') || tab.textContent;
          setCurrentTab(tabName);
          currentTabRef.current = tabName;
          for (var j = 0; j < tabs.length; j++) {
            tabs[j].classList.toggle('is-active', tabs[j] === tab);
          }
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
          setTimeout(function () {
            renderThreads(false);
          }, 0);
        };
        for (var ti = 0; ti < tabs.length; ti++) {
          tabs[ti].addEventListener('click', boundTabHandler);
        }
      }

      // 发帖按钮
      var newPostBtn = document.querySelector('.sidebar-new-post-btn');
      if (newPostBtn) {
        boundNewPostBtn = newPostBtn;
        boundNewPostHandler = function (e) {
          e.preventDefault();
          window.location.href = 'community-new.html';
        };
        newPostBtn.addEventListener('click', boundNewPostHandler);
      }

      // 在线人数波动
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

      // 无限滚动
      var loaderEl = loaderElRef.current;
      var threadList = threadListRef.current;

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

      function loadMoreThreads(sched) {
        if (!firstRenderDoneRef.current) return;
        if (isLoadingMoreRef.current || !hasMoreRef.current || exhaustedRef.current) return;
        setIsLoadingMore(true);
        loaderEl.classList.add('loading');

        sched(function () {
          var skeletons = threadList.querySelectorAll('.skeleton-card.thread-card');
          skeletons.forEach(function (sk) { sk.remove(); });

          // 数据池不足时补充新帖（按当前标签合成）
          if (allThreadsRef.current.length <= 80) {
            var needed = PAGE_SIZE;
            for (var i = 0; i < needed; i++) {
              allThreadsRef.current.push(synthesizeTagThread(currentTagRef.current));
            }
          }

          var filteredNow = getFilteredThreads();
          var prevVisible = visibleCountRef.current;
          var newVisible = prevVisible + PAGE_SIZE;

          if (newVisible >= filteredNow.length && allThreadsRef.current.length > 80) {
            exhaustedRef.current = true;
            setHasMore(false);
            hasMoreRef.current = false;
            setIsLoadingMore(false);
            isLoadingMoreRef.current = false;
            loaderEl.classList.remove('loading');
            loaderEl.innerHTML = '<div class="scroll-loader" style="opacity:0.4;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;">// END OF FEED</div>';
            if (ioObserverRef.current) ioObserverRef.current.unobserve(loaderEl);
            visibleCountRef.current = newVisible;
            setVisibleCount(newVisible);
            renderThreads(true, prevVisible);
            return;
          }

          setHasMore(true);
          hasMoreRef.current = true;
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
          loaderEl.classList.remove('loading');
          visibleCountRef.current = newVisible;
          setVisibleCount(newVisible);
          renderThreads(true, prevVisible);

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
              if (!firstRenderDoneRef.current) break;
              if (entry.isIntersecting && !isLoadingMoreRef.current && hasMoreRef.current && !exhaustedRef.current) {
                var frag = document.createDocumentFragment();
                for (var s = 0; s < PAGE_SIZE; s++) frag.appendChild(createThreadSkeleton());
                threadList.appendChild(frag);
                loadMoreThreads(schedule);
                break;
              }
            }
          }, { root: null, rootMargin: '200px', threshold: 0 });
        }
      }

      return function cleanup() {
        timers.forEach(function (id) { clearTimeout(id); });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        if (onlineIntervalRef.current) clearInterval(onlineIntervalRef.current);
        if (ioObserverRef.current) ioObserverRef.current.disconnect();
        if (boundTabs) boundTabs.forEach(function (tab) { tab.removeEventListener('click', boundTabHandler); });
        if (boundNewPostBtn) boundNewPostBtn.removeEventListener('click', boundNewPostHandler);
        if (boundLoadMoreBtn) boundLoadMoreBtn.removeEventListener('click', boundLoadMoreHandler);
      };
    }, [renderThreads, getFilteredThreads]);

    return null;
  }

  global.CommunityTagPage = CommunityTagPage;

  if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
    global.GHRANK.mountChrome(null, CommunityTagPage);
  } else {
    console.error('[GHRANK/CommunityTag] GHRANK.mountChrome 未找到，请确保 core.js 先于 community-tag.js 加载');
  }
})(window);
