/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // React 19 COMMUNITY DETAIL — 帖子详情页
   ────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   职责：
   1. 读取 URL ?id=xxx&bar=yyy 参数，填充 About this Tieba 卡片
   2. 渲染左侧 Hot Tiebas 列表
   3. 帖子操作按钮交互（Like/Bookmark/Share/Reply）+ Toast
   4. 回复列表：骨架屏 → 首屏 6 条 → IntersectionObserver 无限滚动
   5. 投票组件交互
   6. 回复排序（Oldest / Newest / Best）
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useEffect, useCallback, useRef } = React;

  /* ── 常量 ── */
  var PAGE_SIZE = 6;
  var TOTAL_REPLIES = 24;

  /* ── 贴吧目录 ── */
  var TIEBA_CATALOG = [
    { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', desc: 'Discuss autonomous AI agents, tool use, and multi-agent orchestration patterns.', members: 12400, posts: 3200 },
    { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', desc: 'Build retrieval-augmented generation pipelines, share embedding strategies and chunking tips.', members: 8700, posts: 2100 },
    { id: 'llm-train', name: 'LLM Training', icon: 'LL', desc: 'Fine-tuning, QLoRA, LoRA, dataset prep, and training infrastructure discussions.', members: 6300, posts: 1800 },
    { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', desc: 'Compare and optimize vector stores: pgvector, Pinecone, Weaviate, Qdrant and more.', members: 4900, posts: 1200 },
    { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', desc: 'Share your favorite CLI tools, shell scripts, terminal workflows and dotfiles.', members: 3500, posts: 890 },
    { id: 'open-src', name: 'Open Source Guild', icon: 'OS', desc: 'Open source governance, licensing, monetization, and community management.', members: 5200, posts: 1450 },
    { id: 'scoring', name: 'Scoring Model Lab', icon: 'SC', desc: 'Deep dives into GHRANK scoring algorithms, signal weighting, and time-decay models.', members: 2800, posts: 670 },
    { id: 'devops', name: 'DevOps Den', icon: 'DO', desc: 'CI/CD, container orchestration, observability, and infrastructure-as-code for AI workloads.', members: 4100, posts: 980 }
  ];

  /* ── 热门贴吧（左栏紧凑列表） ── */
  var HOT_TIEBAS = [
    { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', members: '12.4K', posts: '3.2K' },
    { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', members: '8.7K', posts: '2.1K' },
    { id: 'llm-train', name: 'LLM Training', icon: 'LL', members: '6.3K', posts: '1.8K' },
    { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', members: '4.9K', posts: '1.2K' },
    { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', members: '3.5K', posts: '890' }
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
    { name: 'dataforge', avatar: '../styles/images/demo/prompt_5.jpg' },
    { name: 'cyclonix', avatar: '../styles/images/demo/prompt_2.jpg' },
    { name: 'nova_codes', avatar: '../styles/images/demo/prompt_9.jpg' },
    { name: 'kira_dev', avatar: '../styles/images/demo/prompt_8.jpg' },
    { name: 'sam_arch', avatar: '../styles/images/demo/prompt_6.jpg' }
  ];

  /* ── SVG 图标 ── */
  var HEART_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var REPLY_ICON_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>';

  /* ── 回复内容池 ── */
  var REPLY_SENTENCES = [
    'Feature-based folders have been a game changer for our team onboarding.',
    'We still use type-based folders for shared UI primitives, but features for everything else.',
    'The public API via index.ts is the single most important rule.',
    'Has anyone tried combining feature folders with Next.js App Router colocation?',
    'React Query is great until you need optimistic updates across multiple features.',
    'Zustand plus TanStack Query covers 90% of our state needs.',
    'Server state is not your state — I keep this printed above my monitor.',
    'The biggest win was splitting our mega Button into smaller composable pieces.',
    'We enforce import boundaries with a custom ESLint rule and it saved us repeatedly.',
    'Data libraries handle caching, but you still need to think about stale-while-revalidate UX.',
    'Composition beats configuration almost every time at scale.',
    'Colocation in app/ routes fights with feature folders; we solved it with re-exports.',
    'For real-time data, a separate subscription store calling invalidateQueries works well.',
    'We migrated a 150k LOC app and the navigation anxiety disappeared immediately.',
    'Barrel files can slow down TypeScript if you over-export; keep them lean.',
    'Nested features should expose only an aggregate index.ts to the rest of the app.',
    'Test files live next to the code they test; no separate __tests__ tree.',
    'CI checks import boundaries so code review does not have to.',
    'Routing by feature helped our backend team understand the frontend structure.',
    'The hardest part was not technical — it was agreeing on feature boundaries.'
  ];

  /* ── 工具函数 ── */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
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

  /* ── 加入状态（localStorage 模拟，与 community-tiebas.js 共用键名） ── */
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

  // 登录状态检查（与 community-tiebas.js 保持一致，读取 localStorage 标记）
  function isLoggedIn() {
    try { return window.localStorage.getItem('ghrank_logged_in') === '1'; }
    catch (e) { return false; }
  }

  function showToast(toastEl, msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastEl._toastTimer) clearTimeout(toastEl._toastTimer);
    toastEl._toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2200);
  }

  /* ── 合成回复池 ── */
  function generateReplies() {
    var replies = [];
    for (var i = 0; i < TOTAL_REPLIES; i++) {
      var author = pickOne(AUTHOR_POOL);
      var content = [pickOne(REPLY_SENTENCES)];
      if (Math.random() > 0.55) content.push(pickOne(REPLY_SENTENCES));
      var likes = randomInt(0, 120);
      var minsAgo = randomInt(5, 2880);
      var timeAgo = minsAgo < 60 ? minsAgo + 'm' : (minsAgo < 1440 ? Math.floor(minsAgo / 60) + 'h' : Math.floor(minsAgo / 1440) + 'd');
      replies.push({
        id: i + 1,
        author: author.name,
        avatar: author.avatar,
        content: content,
        likes: likes,
        liked: false,
        timeAgo: timeAgo,
        isOp: author.name === 'raven_vex' || Math.random() < 0.08
      });
    }
    return replies;
  }

  function renderReply(reply) {
    var badge = '';
    if (reply.isOp) badge = '<span class="reply-badge">OP</span>';
    else if (reply.likes > 50) badge = '<span class="reply-badge">Top Contributor</span>';

    var contentHtml = '';
    for (var i = 0; i < reply.content.length; i++) {
      contentHtml += '<p>' + escapeHtml(reply.content[i]) + '</p>';
    }

    return (
      '<div class="reply-item' + (reply.isOp ? ' is-op' : '') + '" data-reply-id="' + reply.id + '">' +
        '<div class="reply-avatar">' +
          '<img src="' + reply.avatar + '" alt="' + escapeHtml(reply.author) + '" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="reply-body">' +
          '<div class="reply-head">' +
            '<span class="reply-author">@' + escapeHtml(reply.author) + '</span>' +
            badge +
            '<span class="reply-time">' + escapeHtml(reply.timeAgo) + '</span>' +
          '</div>' +
          '<div class="reply-content">' + contentHtml + '</div>' +
          '<div class="reply-actions">' +
            '<button class="reply-action-btn action-like' + (reply.liked ? ' is-active' : '') + '" data-action="like" data-reply-id="' + reply.id + '">' +
              HEART_SVG +
              '<span class="action-count">' + reply.likes + '</span>' +
            '</button>' +
            '<button class="reply-action-btn action-reply" data-action="reply" data-reply-id="' + reply.id + '">' +
              REPLY_ICON_SVG +
              'Reply' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
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

  /* ═══════════════════════════════════════════════════════════════════════
     CommunityDetailPage React 组件
     ═══════════════════════════════════════════════════════════════════════ */
  function CommunityDetailPage() {
    var repliesRef = useRef([]);
    var visibleCountRef = useRef(PAGE_SIZE);
    var isExhaustedRef = useRef(false);
    var hasMoreRef = useRef(true);
    var ioObserverRef = useRef(null);
    var sortOrderRef = useRef('newest');

    var getSortedReplies = useCallback(function () {
      var list = repliesRef.current.slice();
      switch (sortOrderRef.current) {
        case 'oldest':
          return list.sort(function (a, b) { return a.id - b.id; });
        case 'best':
          return list.sort(function (a, b) { return b.likes - a.likes; });
        case 'newest':
        default:
          return list.sort(function (a, b) { return b.id - a.id; });
      }
    }, []);

    var renderVisibleReplies = useCallback(function () {
      var container = document.getElementById('repliesList');
      if (!container) return;
      var sorted = getSortedReplies();
      var endIdx = Math.min(visibleCountRef.current, sorted.length);
      var slice = sorted.slice(0, endIdx);
      var html = '';
      for (var i = 0; i < slice.length; i++) html += renderReply(slice[i]);
      container.innerHTML = html;
      wireReplyButtons(container);
    }, [getSortedReplies]);

    var wireReplyButtons = useCallback(function (container) {
      if (!container) return;
      var btns = container.querySelectorAll('.reply-action-btn[data-action="like"]:not([data-wired])');
      for (var i = 0; i < btns.length; i++) {
        (function (btn) {
          btn.setAttribute('data-wired', '1');
          btn.addEventListener('click', function () {
            var id = parseInt(btn.getAttribute('data-reply-id'), 10);
            var reply = null;
            for (var j = 0; j < repliesRef.current.length; j++) {
              if (repliesRef.current[j].id === id) { reply = repliesRef.current[j]; break; }
            }
            if (!reply) return;
            reply.liked = !reply.liked;
            reply.likes += reply.liked ? 1 : -1;
            btn.classList.toggle('is-active', reply.liked);
            var countEl = btn.querySelector('.action-count');
            if (countEl) countEl.textContent = reply.likes;
          });
        })(btns[i]);
      }
    }, []);

    useEffect(function () {
      var params = new URLSearchParams(window.location.search);
      var postId = params.get('id') || '1';
      var barId = params.get('bar') || 'ai-agents';
      var bar = findBar(barId);

      /* ── 填充 About this Tieba 卡片 ── */
      var aboutIcon = document.getElementById('aboutTiebaIcon');
      var aboutNameLink = document.getElementById('aboutTiebaNameLink');
      var aboutMeta = document.getElementById('aboutTiebaMeta');
      var aboutDesc = document.getElementById('aboutTiebaDesc');
      if (aboutIcon) aboutIcon.textContent = bar.icon;
      if (aboutNameLink) {
        aboutNameLink.textContent = bar.name;
        aboutNameLink.href = 'community-tiebas.html?bar=' + encodeURIComponent(bar.id);
      }
      if (aboutMeta) aboutMeta.textContent = fmtNum(bar.members) + ' members · ' + fmtNum(bar.posts) + ' posts';
      if (aboutDesc) aboutDesc.textContent = bar.desc;

      /* ── 更新面包屑贴吧链接和名称 ── */
      var crumbTiebaLink = document.getElementById('crumbTiebaLink');
      if (crumbTiebaLink) {
        crumbTiebaLink.textContent = bar.name;
        crumbTiebaLink.href = 'community-tiebas.html?bar=' + encodeURIComponent(bar.id);
      }

      var toastEl = document.getElementById('communityToast');

      /* ── 渲染左侧 Hot Tiebas ── */
      var hotBarsList = document.getElementById('hotBarsList');
      renderHotBars(hotBarsList);

      /* ── Join Tieba 按钮 ── */
      var joinBtn = document.getElementById('detailJoinBtn');
      var newPostBtn = document.querySelector('.detail-new-post-btn');
      // 已加入且已登录才显示 New Post；否则显示 Join Tieba
      var joined = isBarJoined(bar.id);
      var loggedIn = isLoggedIn();
      if (joinBtn) {
        if (joined && loggedIn) {
          joinBtn.style.display = 'none';
          if (newPostBtn) newPostBtn.style.display = '';
        } else {
          joinBtn.style.display = '';
          if (newPostBtn) newPostBtn.style.display = 'none';
        }
        joinBtn.addEventListener('click', function () {
          // 未登录时提示用户先登录
          if (!isLoggedIn()) {
            showToast(toastEl, 'Please log in to join this tieba');
            return;
          }
          // 已登录：标记为已加入，切换按钮状态
          setBarJoined(bar.id, true);
          joinBtn.style.display = 'none';
          if (newPostBtn) newPostBtn.style.display = '';
          showToast(toastEl, 'Joined ' + bar.name);
        });
      }

      /* ── 帖子操作按钮 ── */
      var postActions = document.querySelector('.post-actions');
      if (postActions) {
        postActions.addEventListener('click', function (e) {
          var btn = e.target.closest('.post-action-btn');
          if (!btn) return;
          var action = btn.getAttribute('data-action');
          switch (action) {
            case 'like':
              var active = btn.classList.toggle('is-active');
              var countEl = btn.querySelector('.action-count');
              var count = parseInt(countEl ? countEl.textContent : '124', 10) || 124;
              if (countEl) countEl.textContent = active ? count + 1 : Math.max(0, count - 1);
              showToast(toastEl, active ? 'Liked this post' : 'Unliked this post');
              break;
            case 'bookmark':
              var bookmarked = btn.classList.toggle('is-active');
              showToast(toastEl, bookmarked ? 'Bookmarked' : 'Removed bookmark');
              break;
            case 'share':
              showToast(toastEl, 'Link copied to clipboard');
              break;
            case 'reply':
              showToast(toastEl, 'Reply editor focused');
              break;
          }
        });
      }

      /* ── 生成回复池 ── */
      repliesRef.current = generateReplies();

      /* ── 排序按钮 ── */
      var sortBtns = document.querySelectorAll('.sort-btn');
      var sortHandler = function () {
        var btn = this;
        var sort = btn.getAttribute('data-sort');
        sortOrderRef.current = sort;
        for (var k = 0; k < sortBtns.length; k++) sortBtns[k].classList.toggle('is-active', sortBtns[k] === btn);
        visibleCountRef.current = PAGE_SIZE;
        isExhaustedRef.current = false;
        hasMoreRef.current = true;
        var loader = document.getElementById('repliesLoader');
        if (loader) loader.innerHTML = '<div class="scroll-loader"><div class="scroll-loader-spinner"></div></div>';
        renderVisibleReplies();
        showToast(toastEl, 'Sorted by ' + sort);
      };
      for (var si = 0; si < sortBtns.length; si++) sortBtns[si].addEventListener('click', sortHandler);

      /* ── 首次渲染（600ms 骨架屏后） ── */
      var initialTimer = setTimeout(function () {
        renderVisibleReplies();
      }, 600);

      /* ── 无限滚动 ── */
      var loaderEl = document.getElementById('repliesLoader');
      if (loaderEl && 'IntersectionObserver' in window) {
        ioObserverRef.current = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            var entry = entries[ei];
            if (entry.isIntersecting && !isExhaustedRef.current && hasMoreRef.current) {
              var current = visibleCountRef.current;
              var next = current + PAGE_SIZE;
              if (next >= repliesRef.current.length) {
                isExhaustedRef.current = true;
                hasMoreRef.current = false;
                next = repliesRef.current.length;
                loaderEl.innerHTML = '<div class="scroll-loader" style="opacity:0.4">// End of replies</div>';
                if (ioObserverRef.current) ioObserverRef.current.disconnect();
              }
              visibleCountRef.current = next;
              renderVisibleReplies();
              break;
            }
          }
        }, { root: null, rootMargin: '200px', threshold: 0 });
        ioObserverRef.current.observe(loaderEl);
      }

      /* ── 投票组件（置顶显示 + 模拟投票过程） ── */
      var poll = document.querySelector('.post-poll');
      if (poll) {
        var options = poll.querySelectorAll('.post-poll-option');
        var votedLabel = poll.querySelector('.post-poll-voted');

        /* 初始化投票数据：展示已有票数与百分比 */
        (function initPoll() {
          var baseTotal = 142;
          var featureVotes = 111;
          var typeVotes = 31;
          for (var oi = 0; oi < options.length; oi++) {
            var optionKey = options[oi].getAttribute('data-option');
            var votes = optionKey === 'feature' ? featureVotes : typeVotes;
            var pct = Math.round((votes / baseTotal) * 100);
            var bar = options[oi].querySelector('.poll-bar');
            if (bar) bar.style.width = pct + '%';
            var countEl = options[oi].querySelector('.poll-count');
            if (countEl) countEl.textContent = votes + ' votes (' + pct + '%)';
          }
          var totalEl = poll.querySelector('.post-poll-total');
          if (totalEl) totalEl.textContent = baseTotal + ' votes total';
        })();

        for (var pi = 0; pi < options.length; pi++) {
          (function (opt) {
            opt.addEventListener('click', function () {
              if (poll.classList.contains('is-voted')) return;
              poll.classList.add('is-voted');
              var selected = opt.getAttribute('data-option');
              var baseTotal = 142;
              var featureVotes = 111;
              var typeVotes = 31;
              if (selected === 'feature') featureVotes += 1;
              else typeVotes += 1;
              var total = baseTotal + 1;

              for (var oi = 0; oi < options.length; oi++) {
                var optionKey = options[oi].getAttribute('data-option');
                var votes = optionKey === 'feature' ? featureVotes : typeVotes;
                var pct = Math.round((votes / total) * 100);
                options[oi].classList.toggle('is-selected', optionKey === selected);
                options[oi].disabled = true;
                var bar = options[oi].querySelector('.poll-bar');
                if (bar) bar.style.width = pct + '%';
                var countEl = options[oi].querySelector('.poll-count');
                if (countEl) countEl.textContent = votes + ' votes (' + pct + '%)';
              }
              var totalEl = poll.querySelector('.post-poll-total');
              if (totalEl) totalEl.textContent = total + ' votes total';
              if (votedLabel) votedLabel.style.display = 'block';
              showToast(toastEl, 'Vote recorded · ' + (selected === 'feature' ? 'Feature-based' : 'Type-based'));
            });
          })(options[pi]);
        }
      }

      return function cleanup() {
        clearTimeout(initialTimer);
        if (ioObserverRef.current) ioObserverRef.current.disconnect();
        for (var ci = 0; ci < sortBtns.length; ci++) sortBtns[ci].removeEventListener('click', sortHandler);
      };
    }, []);

    return null;
  }

  global.CommunityDetailPage = CommunityDetailPage;

  /* ── 挂载到独立隐藏容器，避免与 community.js 的 chrome root 冲突 ── */
  if (global.ReactDOM && typeof global.ReactDOM.createRoot === 'function') {
    var detailRootEl = document.getElementById('community-detail-root');
    if (!detailRootEl) {
      detailRootEl = document.createElement('div');
      detailRootEl.id = 'community-detail-root';
      detailRootEl.style.display = 'none';
      document.body.appendChild(detailRootEl);
    }
    var detailRoot = global.ReactDOM.createRoot(detailRootEl);
    detailRoot.render(global.React.createElement(CommunityDetailPage));
  } else {
    console.error('[GHRANK/CommunityDetail] ReactDOM.createRoot not found');
  }
})(window);
