/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // React 19 COMMUNITY TIEBAS — 贴吧帖子列表页
   ────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   职责：
   1. 读取 URL ?bar=xxx 参数，渲染贴吧信息卡、Hero、面包屑
   2. 骨架屏 → 真实帖子列表 → IntersectionObserver 无限滚动（PAGE_SIZE 分块）
   3. Tab 过滤（All / Hot / Latest / Vote / Question）
   4. 左侧相关贴吧/热门贴吧/广告，右侧贴吧信息/规则/版主/版权
   5. Join 按钮反馈与 New Post 入口
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useCallback, useRef } = React;

  /* ── 常量 ── */
  var PAGE_SIZE = 6;
  var HEART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var MEMBERS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var POSTS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';

  /* ── 贴吧目录 ── */
  var TIEBA_CATALOG = [
    { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', desc: 'Discuss autonomous AI agents, tool use, and multi-agent orchestration patterns.', members: 12400, posts: 3200, tags: ['AI-Agents', 'LLM'] },
    { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', desc: 'Build retrieval-augmented generation pipelines, share embedding strategies and chunking tips.', members: 8700, posts: 2100, tags: ['RAG', 'Vector-DB'] },
    { id: 'llm-train', name: 'LLM Training', icon: 'LL', desc: 'Fine-tuning, QLoRA, LoRA, dataset prep, and training infrastructure discussions.', members: 6300, posts: 1800, tags: ['LLM-Finetune'] },
    { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', desc: 'Compare and optimize vector stores: pgvector, Pinecone, Weaviate, Qdrant and more.', members: 4900, posts: 1200, tags: ['Vector-DB'] },
    { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', desc: 'Share your favorite CLI tools, shell scripts, terminal workflows and dotfiles.', members: 3500, posts: 890, tags: ['CLI-Tools'] },
    { id: 'open-src', name: 'Open Source Guild', icon: 'OS', desc: 'Open source governance, licensing, monetization, and community management.', members: 5200, posts: 1450, tags: ['Open-Source'] },
    { id: 'scoring', name: 'Scoring Model Lab', icon: 'SC', desc: 'Deep dives into GHRANK scoring algorithms, signal weighting, and time-decay models.', members: 2800, posts: 670, tags: ['Scoring-Model', 'GHRANK-API'] },
    { id: 'devops', name: 'DevOps Den', icon: 'DO', desc: 'CI/CD, container orchestration, observability, and infrastructure-as-code for AI workloads.', members: 4100, posts: 980, tags: ['DevOps'] }
  ];

  /* ── 热门贴吧（右栏紧凑列表） ── */
  var HOT_TIEBAS = [
    { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', members: '12.4K', posts: '3.2K' },
    { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', members: '8.7K', posts: '2.1K' },
    { id: 'llm-train', name: 'LLM Training', icon: 'LL', members: '6.3K', posts: '1.8K' },
    { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', members: '4.9K', posts: '1.2K' },
    { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', members: '3.5K', posts: '890' }
  ];

  /* ── 版主池 ── */
  var MODERATORS = [
    { name: 'AlexShader', avatar: '../styles/images/demo/prompt_1.jpg' },
    { name: 'nexusdev', avatar: '../styles/images/demo/prompt_3.jpg' },
    { name: 'voidrunner', avatar: '../styles/images/demo/prompt_5.jpg' }
  ];

  /* ── 作者池 ── */
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

  /* ── 帖子标题池（按标签分类，贴吧取其 tags 中一个生成帖子） ── */
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
    'LLM': [
      'Benchmarking frontier LLMs on reasoning tasks',
      'Context window utilization for long-form generation',
      'Prompt injection mitigation techniques',
      'Structured output generation with constrained decoding',
      'Model distillation trade-offs in production'
    ]
  };

  var FALLBACK_TITLES = [
    'Deep dive: scaling patterns for community-driven platforms',
    'Question: best practices for caching derived signals',
    'Show & Tell: a minimal scoring dashboard',
    'Discussion: how do you measure open source impact',
    'Tutorial: shipping faster with deterministic CI'
  ];

  var VOTE_TITLES = [
    'Vote: Which agent framework should we standardize on?',
    'Vote: [Vote] Best vector database for production RAG',
    'Vote: [Vote] Preferred LoRA target module',
    'Vote: [Vote] CLI vs GUI for agent tooling',
    'Vote: [Vote] Should we add a weekly ranking thread?'
  ];

  var QUESTION_TITLES = [
    'Question: How do you handle agent state persistence?',
    'Question: What is the best embedding model for code search?',
    'Question: Is QLoRA enough for domain adaptation?',
    'Question: How do you version vector indexes?',
    'Question: Best practices for multi-agent error recovery?'
  ];

  var SECTIONS = ['Discussions', 'Show & Tell', 'Questions', 'Tutorials', 'News & Updates', 'Off-Topic', 'Dev Logs'];

  /* ── 工具函数 ── */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtCount(n) {
    return n.toLocaleString();
  }

  function fmtNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
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

  function findBar(id) {
    for (var i = 0; i < TIEBA_CATALOG.length; i++) {
      if (TIEBA_CATALOG[i].id === id) return TIEBA_CATALOG[i];
    }
    return TIEBA_CATALOG[0];
  }

  /* ── 加入状态（localStorage 模拟） ── */
  function joinedBarKey(barId) {
    return 'ghrank_joined_bar_' + barId;
  }

  function isBarJoined(barId) {
    try {
      return window.localStorage.getItem(joinedBarKey(barId)) === '1';
    } catch (e) {
      return false;
    }
  }

  function setBarJoined(barId, joined) {
    try {
      window.localStorage.setItem(joinedBarKey(barId), joined ? '1' : '0');
    } catch (e) {
      // 忽略隐私模式写入失败
    }
  }

  function createNewPostBtn() {
    var btn = document.createElement('a');
    btn.className = 'tieba-new-post-btn';
    btn.id = 'tiebaNewPostBtn';
    btn.href = 'community-new.html';
    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10"/></svg> New Post';
    return btn;
  }

  function updateJoinBtnState(joinBtn, bar) {
    if (!joinBtn) return;
    var card = joinBtn.parentNode;
    var joined = isBarJoined(bar.id);
    if (joined) {
      joinBtn.style.display = 'none';
      if (!document.getElementById('tiebaNewPostBtn')) {
        card.insertBefore(createNewPostBtn(), joinBtn.nextSibling);
      }
    } else {
      joinBtn.style.display = '';
      var existing = document.getElementById('tiebaNewPostBtn');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }
  }

  /* ── 回复者头像堆叠 ── */
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

  /* ── 头像懒加载 ── */
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

  /* ── 合成贴吧帖子 ── */
  var nextThreadId = 3000;
  function synthesizeBarThread(bar) {
    nextThreadId++;
    var tag = pickOne(bar.tags);
    var titlePool = TAG_TITLE_POOL[tag] || FALLBACK_TITLES;
    var author = pickOne(AUTHOR_POOL);
    var title = pickOne(titlePool);
    var section = pickOne(SECTIONS);
    // 合成部分投票/提问帖，确保 Vote / Question Tab 有内容
    var kindRoll = Math.random();
    if (kindRoll < 0.12) {
      title = pickOne(VOTE_TITLES);
      tag = 'Vote';
      section = 'Questions';
    } else if (kindRoll < 0.24) {
      title = pickOne(QUESTION_TITLES);
      section = 'Questions';
    }
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
      repliers: buildRepliers(replies),
      isOnline: Math.random() < 0.55
    };
  }

  function buildBarPool(bar) {
    var pool = [];
    for (var i = 0; i < 42; i++) {
      pool.push(synthesizeBarThread(bar));
    }
    return pool;
  }

  /* ── 渲染侧边栏相关贴吧 ── */
  function renderRelatedBars(container, currentId) {
    if (!container) return;
    var html = '';
    for (var i = 0; i < TIEBA_CATALOG.length; i++) {
      var bar = TIEBA_CATALOG[i];
      if (bar.id === currentId) continue;
      html +=
        '<a class="hot-bar-item" href="community-tiebas.html?bar=' + encodeURIComponent(bar.id) + '">' +
          '<span class="hot-bar-icon">' + escapeHtml(bar.icon) + '</span>' +
          '<div class="hot-bar-info">' +
            '<div class="hot-bar-name">' + escapeHtml(bar.name) + '</div>' +
            '<div class="hot-bar-meta">' + fmtNum(bar.members) + ' members · ' + fmtNum(bar.posts) + ' posts</div>' +
          '</div>' +
        '</a>';
    }
    container.innerHTML = html;
  }

  /* ── 渲染热门贴吧 ── */
  function renderHotBars(container) {
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

  /* ── 贴吧信息卡渲染 ── */
  function updateTiebaInfo(bar) {
    var iconEls = document.querySelectorAll('.tieba-info-icon, .tieba-hero-icon');
    for (var i = 0; i < iconEls.length; i++) iconEls[i].textContent = escapeHtml(bar.icon);

    var nameEls = document.querySelectorAll('.tieba-info-name, .community-hero-title');
    for (var i = 0; i < nameEls.length; i++) nameEls[i].textContent = escapeHtml(bar.name);

    var metaEls = document.querySelectorAll('.tieba-info-meta');
    for (var i = 0; i < metaEls.length; i++) {
      metaEls[i].innerHTML =
        '<span class="tieba-meta-stat">' + MEMBERS_SVG + ' ' + fmtNum(bar.members) + '</span>' +
        '<span class="tieba-meta-stat">' + POSTS_SVG + ' ' + fmtNum(bar.posts) + '</span>';
    }

    var descEls = document.querySelectorAll('.tieba-info-desc, .community-hero-sub');
    for (var i = 0; i < descEls.length; i++) descEls[i].textContent = escapeHtml(bar.desc);

    var crumbCurrent = document.querySelector('.section-breadcrumb .crumb-current');
    if (crumbCurrent) crumbCurrent.textContent = escapeHtml(bar.name);

    document.title = 'GHRANK // Community — ' + bar.name;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CommunityTiebasPage React 组件
     ═══════════════════════════════════════════════════════════════════════ */
  function CommunityTiebasPage() {
    var [currentTab, setCurrentTab] = useState('All');
    var [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    var [isLoadingMore, setIsLoadingMore] = useState(false);
    var [hasMore, setHasMore] = useState(true);

    var allThreadsRef = useRef([]);
    var ioObserverRef = useRef(null);
    var toastTimerRef = useRef(null);

    var threadListRef = useRef(null);
    var tabsContainerRef = useRef(null);
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

    var currentBarRef = useRef(null);

    /* ── 过滤与排序 ── */
    var getFilteredThreads = useCallback(function () {
      var list = allThreadsRef.current.slice();
      var tab = currentTabRef.current;
      switch (tab) {
        case 'Hot':
          list = list.filter(function (t) { return t.isHot; });
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
        case 'Latest':
          list = list.filter(function (t) { return t.isNew; });
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
        case 'Vote':
          list = list.filter(function (t) {
            var title = (t.title || '').toLowerCase();
            return title.indexOf('vote:') === 0 || title.indexOf('[vote]') !== -1 || t.tag === 'Vote';
          });
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
        case 'Question':
          list = list.filter(function (t) {
            var title = t.title || '';
            var lower = title.toLowerCase();
            var isVote = lower.indexOf('vote:') === 0 || lower.indexOf('[vote]') !== -1 || t.tag === 'Vote';
            return !isVote && (title.charAt(title.length - 1) === '?' || lower.indexOf('question:') === 0);
          });
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
        case 'All':
        default:
          list.sort(function (a, b) { return parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo); });
          break;
      }
      return list;
    }, []);

    /* ── Toast ── */
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

    /* ── 加载器状态 ── */
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

    /* ── 渲染帖子 ── */
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
        var isOnline = Math.random() < 0.55;
        html +=
          '<a class="thread-item ' + entranceClass + (isOnline ? ' is-author-online' : '') + '" href="community-detail.html?id=' + t.id + '" data-thread-id="' + t.id + '">' +
            '<div class="thread-avatar thread-avatar-lazy' + (isOnline ? ' is-online' : '') + '">' +
              '<img src="' + t.avatar + '" alt="' + t.author + '" loading="lazy" decoding="async">' +
              (isOnline ? '<span class="thread-avatar-online" aria-label="online"></span>' : '') +
            '</div>' +
            '<div class="thread-body">' +
              '<div class="thread-title">' + escapeHtml(t.title) +
                (t.isHot ? ' <span class="thread-hot-badge">HOT</span>' : '') +
                (t.isNew ? ' <span class="thread-new-badge">NEW</span>' : '') +
                ' <span class="thread-like">' + HEART_SVG + '<span class="thread-like-count">' + t.likes + '</span></span>' +
              '</div>' +
              '<div class="thread-meta">' +
                '<span class="thread-author">@' + t.author + '</span>' +
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
    }, [getFilteredThreads, updateLoaderState]);

    /* ── 切换 Tab 后重置并渲染 ── */
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
      var boundJoinBtn = null, boundJoinHandler = null;
      var boundLoadMoreBtn = null, boundLoadMoreHandler = null;

      function schedule(fn, delay) {
        var id = setTimeout(fn, delay);
        timers.push(id);
        return id;
      }

      // 读取贴吧参数并更新静态信息
      var params = new URLSearchParams(window.location.search);
      var barId = params.get('bar') || 'ai-agents';
      var bar = findBar(barId);
      currentBarRef.current = bar;
      updateTiebaInfo(bar);

      // DOM 引用
      threadListRef.current = document.getElementById('threadList');
      tabsContainerRef.current = document.getElementById('tiebaTabs');
      toastElRef.current = document.getElementById('communityToast');
      loaderElRef.current = document.getElementById('threadLoader');

      if (!threadListRef.current) return;

      // 渲染侧边栏
      var relatedBarsListEl = document.getElementById('relatedBarsList');
      if (relatedBarsListEl) renderRelatedBars(relatedBarsListEl, bar.id);

      var hotBarsListEl = document.getElementById('hotBarsList');
      if (hotBarsListEl) renderHotBars(hotBarsListEl);

      // 构建帖子池
      allThreadsRef.current = buildBarPool(bar);

      // 首次渲染（600ms 骨架屏后）
      schedule(function () {
        renderThreads(false);
        firstRenderDoneRef.current = true;
        if (ioObserverRef.current && loaderElRef.current && hasMoreRef.current && !exhaustedRef.current) {
          ioObserverRef.current.observe(loaderElRef.current);
        }
      }, 600);

      // Tab 切换
      var tabsContainer = tabsContainerRef.current;
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
          resetAndRender();
        };
        for (var ti = 0; ti < tabs.length; ti++) {
          tabs[ti].addEventListener('click', boundTabHandler);
        }
      }

      // Join 按钮 + New Post 入口
      var joinBtn = document.getElementById('tiebaJoinBtn');
      if (joinBtn) {
        // 根据持久化状态初始化：已加入则隐藏 Join，显示 New Post
        updateJoinBtnState(joinBtn, bar);

        boundJoinBtn = joinBtn;
        boundJoinHandler = function () {
          // 未加入用户点击后：Join 按钮消失，出现 New Post
          setBarJoined(bar.id, true);
          updateJoinBtnState(joinBtn, bar);
          showToast('Joined ' + bar.name);
        };
        joinBtn.addEventListener('click', boundJoinHandler);
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

          // 数据池不足时补充新帖
          if (allThreadsRef.current.length <= 80) {
            var needed = PAGE_SIZE;
            for (var i = 0; i < needed; i++) {
              allThreadsRef.current.push(synthesizeBarThread(currentBarRef.current));
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
        if (ioObserverRef.current) ioObserverRef.current.disconnect();
        if (boundTabs) boundTabs.forEach(function (tab) { tab.removeEventListener('click', boundTabHandler); });
        if (boundJoinBtn) boundJoinBtn.removeEventListener('click', boundJoinHandler);
        if (boundLoadMoreBtn) boundLoadMoreBtn.removeEventListener('click', boundLoadMoreHandler);
      };
    }, [renderThreads, getFilteredThreads, resetAndRender]);

    return null;
  }

  global.CommunityTiebasPage = CommunityTiebasPage;

  if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
    global.GHRANK.mountChrome(null, CommunityTiebasPage);
  } else {
    console.error('[GHRANK/CommunityTiebas] GHRANK.mountChrome 未找到，请确保 core.js 先于 community-tiebas.js 加载');
  }
})(window);
