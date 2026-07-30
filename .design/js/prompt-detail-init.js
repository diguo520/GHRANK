/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // Prompt Detail Page — Pure JS interactions
   不依赖 React/Babel，确保 prompt-detail.html 所有交互稳定可用
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  console.log('[prompt-detail-init.js] loaded');

  var docHandlers = [];
  var timers = [];
  var observers = [];

  function addDocListener(type, handler) {
    document.addEventListener(type, handler);
    docHandlers.push({ type: type, handler: handler });
  }

  function formatNum(n) {
    return n >= 1000 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : n.toString();
  }

  function isLoggedIn() {
    try { return localStorage.getItem('ghrank_logged_in') === '1'; }
    catch (e) { return false; }
  }

  function showToast(message) {
    var existing = document.querySelector('.review-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'review-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }
  global.showToast = showToast;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  var ACTIVITY_ICONS = {
    liked:  '<svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M8 14s-5-3-6-7c-1-3 1-5 3-5 1.5 0 2.5 1 3 2 .5-1 1.5-2 3-2 2 0 4 2 3 5-1 4-6 7-6 7z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>',
    saved:  '<svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M4 1h8v14l-4-3-4 3V1z" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    tipped: '<svg width="9" height="9" viewBox="0 0 16 16" fill="none"><rect x="4" y="5" width="7" height="6" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M11 7h1a1 1 0 0 1 0 2h-1" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>'
  };
  var ACTIVITY_PROB = { liked: 0.55, saved: 0.35, tipped: 0.25 };

  function badgeHTML(type, value) {
    var icon = ACTIVITY_ICONS[type] || '';
    var label = type === 'tipped' ? '+$' + value : '+' + value;
    return '<span class="thread-activity ' + type + '"><span class="ta-icon">' + icon + '</span>' + label + '</span>';
  }

  function decideActivities(activeFilter) {
    var out = [];
    if (activeFilter === 'liked' || Math.random() < ACTIVITY_PROB.liked) out.push({ type: 'liked', value: 1 });
    if (activeFilter === 'saved' || Math.random() < ACTIVITY_PROB.saved) out.push({ type: 'saved', value: 1 });
    if (activeFilter === 'tipped' || Math.random() < ACTIVITY_PROB.tipped) {
      var pool = [1, 1, 1, 2, 3, 3, 5, 5, 8, 10];
      out.push({ type: 'tipped', value: pool[Math.floor(Math.random() * pool.length)] });
    }
    return out;
  }

  function applyBadgesToThread(thread, activeFilter) {
    if (!thread) return;
    var meta = thread.querySelector('.thread-meta');
    if (!meta || thread.getAttribute('data-activity-tagged') === '1') return;
    thread.setAttribute('data-activity-tagged', '1');
    var acts = decideActivities(activeFilter);
    if (!acts.length) return;
    var anchor = meta.querySelector('.thread-badge') || meta.querySelector('.thread-author');
    if (!anchor) return;
    acts.forEach(function (a, i) {
      var node = document.createElement('span');
      node.innerHTML = badgeHTML(a.type, a.value);
      var el = node.firstChild;
      el.style.animationDelay = (i * 60) + 'ms';
      if (anchor.nextSibling) meta.insertBefore(el, anchor.nextSibling);
      else meta.appendChild(el);
    });
  }

  function applyToAllThreads(scope, activeFilter) {
    (scope || document).querySelectorAll('.thread').forEach(function (t) {
      applyBadgesToThread(t, activeFilter);
    });
  }

  var REVIEW_USERNAMES = [
    'PixelWizard','CodeNomad','DesignSage','DataVoyager','PromptHacker',
    'AIMaven','SyntaxNinja','VectorQueen','NeuralFox','CloudSculptor',
    'LogiCraft','RasterKing','FlowState','TensorPioneer','MetaForge'
  ];
  var REVIEW_COMMENTS = [
    'Absolutely love this prompt! The output quality exceeded my expectations. Highly recommended for anyone working on professional projects.',
    'Been using this for a week now and the consistency is remarkable. Well worth the price.',
    'Great prompt but I wish there were more customization options. The base results are solid though.',
    'This completely transformed my workflow. The attention to detail in the prompt design is incredible.',
    'Solid prompt with good results. Would give 5 stars if the documentation was more detailed.',
    'Incredible value for money. I\'ve generated over 100 images with this and the quality never drops.',
    'The prompt structure is brilliant. Easy to modify for different styles while maintaining core quality.',
    'Exactly what I was looking for. Saved me hours of experimentation. Top quality output.',
    'Pretty good but could use more examples in the description. The prompt itself works great.',
    'Game changer for my creative projects. The versatility is unmatched. Highly recommended!',
    'I was skeptical at first but this prompt delivers consistently professional results. 10/10.',
    'Decent prompt for the price. Works well with the latest model version. Good support too.',
    'Best investment I\'ve made for my AI toolkit. The quality-to-price ratio is outstanding.',
    'Really impressed with the output variety. Each generation feels unique while staying on-brand.',
    'The prompt has some issues with complex scenes but works perfectly for simpler compositions.'
  ];
  var REVIEW_RATINGS = [5,5,4,5,4,5,5,5,4,5,5,4,5,5,4];
  var REVIEW_HELPFUL = [12,8,3,5,7,15,2,9,4,11,6,1,10,3,8];

  function createReviewHTML(username, comment, rating, helpful, avatarIndex, includeImages, activeFilter) {
    var imgNum = (avatarIndex % 20) + 1;
    var ago = Math.floor(Math.random() * 14) + 1;
    var date = new Date(); date.setDate(date.getDate() - ago);
    var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    var replies = Math.floor(Math.random() * 4);
    var replyText = replies > 0 ? 'Reply (' + replies + ')' : 'Reply';
    var floor = Math.floor(Math.random() * 900) + 100;
    var imagesHtml = '';
    if (includeImages) {
      var imgOffset = (avatarIndex % 17) + 1;
      imagesHtml = '<div class="thread-images">' +
        '<div class="thread-image-thumb grad-X" data-expanded="false"><img src="../styles/images/demo/prompt_' + imgOffset + '.jpg" alt="" class="thread-image-img"></div>' +
        '<div class="thread-image-thumb grad-X" data-expanded="false"><img src="../styles/images/demo/prompt_' + (imgOffset + 1) + '.jpg" alt="" class="thread-image-img"></div>' +
      '</div>';
    }
    return '<div class="thread" data-floor="' + floor + '">' +
      '<div class="thread-timeline-dot"></div>' +
      '<div class="thread-op">' +
        '<div class="thread-avatar" style="background:rgba(88,166,255,0.12);color:#58A6FF;">' +
          '<img src="../styles/images/demo/prompt_' + imgNum + '.jpg" alt="" class="thread-avatar-img">' +
        '</div>' +
        '<div class="thread-body">' +
          '<div class="thread-meta">' +
            '<span class="thread-author">' + username + '</span>' +
            '<span class="thread-badge">Purchased</span>' +
            '<span class="thread-date">' + dateStr + '</span>' +
            '<span class="thread-floor">#' + floor + '</span>' +
          '</div>' +
          '<p class="thread-text">' + comment + '</p>' +
          imagesHtml +
          '<div class="thread-actions">' +
            '<button class="thread-action-btn like-btn" data-liked="false"><span class="like-icon">&#x2B06;</span> Helpful <span class="like-count">' + helpful + '</span></button>' +
            '<button class="thread-action-btn thread-reply-toggle">&#x21A9; ' + replyText + '</button>' +
            '<button class="thread-action-btn thread-collapse-btn">&#x25B2; Collapse</button>' +
            '<button class="thread-action-btn thread-share-btn">&#x1F517; Share</button>' +
          '</div>' +
          '<div class="thread-reply-form hidden">' +
            '<div class="reply-form-header"><span class="reply-form-to">Replying to <strong>@' + username + '</strong></span><button class="reply-form-close">&times;</button></div>' +
            '<textarea class="reply-textarea" rows="3" maxlength="500" placeholder="Write a reply..."></textarea>' +
            '<div class="reply-form-actions"><button class="reply-submit">Reply</button></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // 评论区骨架屏占位块
  function createSkeletonHTML(count) {
    var html = '';
    for (var i = 0; i < count; i++) {
      html +=
        '<div class="thread thread-skeleton" aria-hidden="true">' +
          '<div class="thread-timeline-dot"></div>' +
          '<div class="thread-op">' +
            '<div class="thread-avatar"><div class="sk-avatar"></div></div>' +
            '<div class="thread-body">' +
              '<div class="sk-meta">' +
                '<div class="sk-line sk-author"></div>' +
                '<div class="sk-line sk-badge"></div>' +
                '<div class="sk-line sk-date"></div>' +
              '</div>' +
              '<div class="sk-text">' +
                '<div class="sk-line"></div>' +
                '<div class="sk-line sk-short"></div>' +
              '</div>' +
              '<div class="sk-actions">' +
                '<div class="sk-line sk-action"></div>' +
                '<div class="sk-line sk-action"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
    return html;
  }

  // 生成分块评论数据（用于过滤/加载更多）
  function createGeneratedChunkHTML(count, page, filter, includeImages) {
    var html = '';
    for (var i = 0; i < count; i++) {
      var idx = i + (page * count);
      var name = REVIEW_USERNAMES[Math.floor(Math.random() * REVIEW_USERNAMES.length)];
      var comment = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
      var helpful = REVIEW_HELPFUL[Math.floor(Math.random() * REVIEW_HELPFUL.length)];
      if (filter === 'liked') helpful = Math.floor(Math.random() * 50) + 20;
      else if (filter === 'saved') helpful = Math.floor(Math.random() * 20) + 5;
      html += createReviewHTML(name, comment, 5, helpful, idx, includeImages || (idx % 3 === 0), filter);
    }
    return html;
  }

  function hydrateLazyImages(scope) {
    (scope || document).querySelectorAll('img[data-lazy]').forEach(function (img) {
      var lazySrc = img.getAttribute('data-lazy');
      if (lazySrc && !img.getAttribute('src')) img.setAttribute('src', lazySrc);
    });
  }

  // Reply textarea helpers
  function getReplyText(form) {
    var ta = form ? form.querySelector('.reply-textarea') : null;
    return ta ? (ta.value || '').trim() : '';
  }

  function focusReplyTextarea(form) {
    var ta = form ? form.querySelector('.reply-textarea') : null;
    if (ta) ta.focus();
  }

  function clearReplyTextarea(form) {
    var ta = form ? form.querySelector('.reply-textarea') : null;
    if (ta) ta.value = '';
  }

  function init() {
    // ─── Carousel ───
    var track = document.getElementById('previewTrack');
    var prevBtn = document.getElementById('carouselPrev');
    var nextBtn = document.getElementById('carouselNext');
    var dots = document.getElementById('carouselDots');
    var carouselCurrent = 0;
    if (track && dots) {
      var slides = track.querySelectorAll('.detail-preview-slide');
      var total = slides.length;
      if (total < 2) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
      } else {
        function goTo(index) {
          if (index < 0) index = total - 1;
          if (index >= total) index = 0;
          carouselCurrent = index;
          track.style.transform = 'translateX(-' + (index * 100) + '%)';
          dots.querySelectorAll('.carousel-dot').forEach(function (d, i) { d.classList.toggle('active', i === index); });
        }
        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(carouselCurrent - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(carouselCurrent + 1); });
        dots.querySelectorAll('.carousel-dot').forEach(function (dot, i) { dot.addEventListener('click', function () { goTo(i); }); });
        addDocListener('keydown', function (e) {
          if (e.key === 'ArrowLeft' && document.querySelector('.detail-preview-carousel:hover')) goTo(carouselCurrent - 1);
          if (e.key === 'ArrowRight' && document.querySelector('.detail-preview-carousel:hover')) goTo(carouselCurrent + 1);
        });
      }
    }

    // ─── Avatar Online Presence ───
    // 只区分在线(绿色标识)与离线(无标识)，去掉 away 的橙色标识以避免被误认为红色异常
    function applyAvatarPresence(scope) {
      (scope || document).querySelectorAll('.thread-avatar:not(.online):not(.offline)').forEach(function (av) {
        if (Math.random() < 0.6) av.classList.add('online');
        else av.classList.add('offline');
      });
    }
    applyAvatarPresence();

    // ─── Reward Amount Selector ───
    var rewardBtns = document.querySelectorAll('.reward-amount-btn');
    var totalEl = document.querySelector('.reward-total');
    var supportBtn = document.querySelector('.reward-support-btn');
    if (rewardBtns.length && totalEl) {
      function updateTotal(amount) { totalEl.textContent = '$' + amount.toFixed(2); }
      rewardBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          rewardBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var amount = parseInt(btn.getAttribute('data-amount'), 10) || 1;
          updateTotal(amount);
        });
      });
      if (supportBtn) {
        supportBtn.addEventListener('click', function () {
          if (!isLoggedIn()) { showToast('Please log in to send a tip'); return; }
          var activeBtn = document.querySelector('.reward-amount-btn.active');
          var amount = activeBtn ? parseInt(activeBtn.getAttribute('data-amount'), 10) : 1;
          supportBtn.textContent = 'Thank you!';
          supportBtn.style.pointerEvents = 'none';
          supportBtn.style.opacity = '0.6';
          var tid = setTimeout(function () {
            supportBtn.innerHTML = 'Support <span class="reward-total">$' + amount.toFixed(2) + '</span> <span class="reward-arrow">\u203A</span>';
            supportBtn.style.pointerEvents = '';
            supportBtn.style.opacity = '';
          }, 1500);
          timers.push(tid);
        });
      }
    }

    // ─── Review Interactions (event delegation) ───
    function handleLike(e) {
      var btn = e.target.closest('.like-btn');
      if (!btn) return;
      var isLiked = btn.getAttribute('data-liked') === 'true';
      var countEl = btn.querySelector('.like-count');
      var count = countEl ? parseInt(countEl.textContent) : 0;
      if (isLiked) {
        btn.setAttribute('data-liked', 'false');
        btn.classList.remove('is-active');
        if (countEl) countEl.textContent = Math.max(0, count - 1);
      } else {
        btn.setAttribute('data-liked', 'true');
        btn.classList.add('is-active');
        if (countEl) countEl.textContent = count + 1;
        btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
      }
    }
    addDocListener('click', handleLike);

    function handleReplyToggle(e) {
      var btn = e.target.closest('.thread-reply-toggle');
      if (!btn) return;
      if (!isLoggedIn()) { showToast('Please log in to reply'); return; }
      var thread = btn.closest('.thread-op') || btn.closest('.thread-body') || btn.closest('.thread');
      var replyForm = thread ? thread.querySelector('.thread-reply-form') : null;
      if (!replyForm) return;
      replyForm.classList.toggle('hidden');
      if (!replyForm.classList.contains('hidden')) focusReplyTextarea(replyForm);
      else clearReplyTextarea(replyForm);
    }
    addDocListener('click', handleReplyToggle);

    function handleReplyToReply(e) {
      var btn = e.target.closest('.reply-to-reply');
      if (!btn) return;
      if (!isLoggedIn()) { showToast('Please log in to reply'); return; }
      var reply = btn.closest('.thread-reply');
      var authorEl = reply ? reply.querySelector('.thread-author') : null;
      var authorName = authorEl ? authorEl.textContent.replace(/^@+/, '').trim() : 'user';
      var thread = btn.closest('.thread');
      var replyForm = thread ? thread.querySelector('.thread-reply-form') : null;
      if (!replyForm) return;
      replyForm.classList.remove('hidden');
      var replyTo = replyForm.querySelector('.reply-form-to');
      if (replyTo) replyTo.innerHTML = 'Replying to <strong>@' + authorName + '</strong>';
      focusReplyTextarea(replyForm);
    }
    addDocListener('click', handleReplyToReply);

    function handleReplyFormClose(e) {
      var btn = e.target.closest('.reply-form-close');
      if (!btn) return;
      var form = btn.closest('.thread-reply-form');
      if (form) {
        clearReplyTextarea(form);
        form.classList.add('hidden');
      }
    }
    addDocListener('click', handleReplyFormClose);

    function handleReplySubmit(e) {
      var btn = e.target.closest('.reply-submit');
      if (!btn) return;
      var form = btn.closest('.thread-reply-form');
      if (!form) return;
      var text = getReplyText(form);
      if (!text) return;
      var replyToEl = form.querySelector('.reply-form-to strong');
      var replyToName = replyToEl ? replyToEl.textContent.replace(/^@+/, '').trim() : '';
      var thread = form.closest('.thread');
      var repliesWrap = thread ? thread.querySelector('.thread-replies') : null;
      var mentionHtml = replyToName ? '<span class="reply-mention">@' + replyToName + '</span> ' : '';
      var replyNode = document.createElement('div');
      replyNode.className = 'thread-reply';
      replyNode.setAttribute('data-reply-floor', 'new');
      replyNode.innerHTML =
        '<div class="thread-avatar small online" style="background:rgba(88,166,255,0.12);color:#58A6FF;"><img src="../styles/images/demo/prompt_1.jpg" alt="" class="thread-avatar-img"></div>' +
        '<div class="thread-body">' +
          '<div class="thread-meta">' +
            '<span class="thread-author">You</span>' +
            '<span class="thread-activity liked"><span class="ta-icon"><svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M8 14s-5-3-6-7c-1-3 1-5 3-5 1.5 0 2.5 1 3 2 .5-1 1.5-2 3-2 2 0 4 2 3 5-1 4-6 7-6 7z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg></span> +1</span>' +
            '<span class="thread-date">Just now</span>' +
          '</div>' +
          '<p class="thread-text">' + mentionHtml + text + '</p>' +
          '<div class="thread-actions reply-actions">' +
            '<button class="thread-action-btn like-btn small" data-liked="false"><span class="like-icon">&#x2B06;</span> <span class="like-count">0</span></button>' +
            '<button class="thread-action-btn reply-to-reply">&#x21A9; Reply</button>' +
          '</div>' +
        '</div>';
      if (repliesWrap) repliesWrap.appendChild(replyNode);
      else if (thread) {
        var wrap = document.createElement('div');
        wrap.className = 'thread-replies';
        wrap.appendChild(replyNode);
        thread.appendChild(wrap);
      }
      showToast('Reply posted' + (replyToName ? ' to @' + replyToName : ''));
      clearReplyTextarea(form);
      form.classList.add('hidden');
    }
    addDocListener('click', handleReplySubmit);

    function handleCollapse(e) {
      var btn = e.target.closest('.thread-collapse-btn');
      if (!btn) return;
      var thread = btn.closest('.thread');
      if (!thread) return;
      var isCollapsed = thread.classList.contains('collapsed');
      thread.classList.toggle('collapsed');
      btn.innerHTML = isCollapsed ? '&#x25B2; Collapse' : '&#x25BC; Expand';
      var dot = thread.querySelector('.thread-timeline-dot');
      if (dot) dot.style.top = isCollapsed ? '' : '18px';
    }
    addDocListener('click', handleCollapse);

    function handleShare(e) {
      var btn = e.target.closest('.thread-share-btn');
      if (!btn) return;
      var thread = btn.closest('.thread');
      var floor = thread ? thread.getAttribute('data-floor') || '' : '';
      var url = window.location.href.split('#')[0] + '#review-' + floor;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { showToast('Link copied to clipboard!'); });
      } else {
        showToast('Link copied!');
      }
    }
    addDocListener('click', handleShare);

    // ─── Follow / Save / Like ───
    var followBtn = document.getElementById('detailFollowBtn');
    if (followBtn) {
      followBtn.addEventListener('click', function () {
        if (!isLoggedIn()) { showToast('Please log in to follow'); return; }
        var isFollowing = followBtn.classList.toggle('is-following');
        followBtn.setAttribute('aria-pressed', isFollowing);
        showToast(isFollowing ? 'Following @AlexShader' : 'Unfollowed @AlexShader');
      });
    }

    var bookmarkBtn = document.getElementById('detailBookmarkBtn');
    if (bookmarkBtn) {
      var bookmarkCountEl = bookmarkBtn.querySelector('.detail-action-count');
      var bookmarkCount = parseInt(bookmarkCountEl ? bookmarkCountEl.textContent.replace(/,/g, '') : '0', 10) || 0;
      bookmarkBtn.addEventListener('click', function () {
        if (!isLoggedIn()) { showToast('Please log in to save'); return; }
        var isActive = bookmarkBtn.classList.toggle('is-active');
        bookmarkBtn.setAttribute('aria-pressed', isActive);
        bookmarkCount += isActive ? 1 : -1;
        if (bookmarkCountEl) bookmarkCountEl.textContent = bookmarkCount >= 1000 ? (bookmarkCount / 1000).toFixed(1) + 'K' : bookmarkCount;
        showToast(isActive ? 'Saved to your collection' : 'Removed from collection');
      });
    }

    var likeBtn = document.getElementById('detailLikeBtn');
    if (likeBtn) {
      var likeCountEl = likeBtn.querySelector('.detail-action-count');
      var likeCount = 1200;
      likeBtn.addEventListener('click', function () {
        var isActive = likeBtn.classList.toggle('is-active');
        likeBtn.setAttribute('aria-pressed', isActive);
        likeCount += isActive ? 1 : -1;
        if (likeCountEl) likeCountEl.textContent = likeCount >= 1000 ? (likeCount / 1000).toFixed(1) + 'K' : likeCount;
        likeBtn.classList.remove('pop'); void likeBtn.offsetWidth; likeBtn.classList.add('pop');
        showToast(isActive ? 'Liked!' : 'Like removed');
      });
    }

    // ─── Mouse glow for cards ───
    document.querySelectorAll('.prompt-card, .related-card, .review-item, .detail-info-panel, .prompt-display-block, .thread').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });
    });

    // ─── Review composer char counter ───
    var reviewTextarea = document.getElementById('reviewTextarea');
    var charCounter = document.getElementById('charCounter');
    if (reviewTextarea && charCounter) {
      reviewTextarea.addEventListener('input', function () {
        var len = reviewTextarea.value.length;
        charCounter.textContent = len;
        charCounter.classList.toggle('over-limit', len > 500);
      });
    }

    var submitBtn = document.querySelector('.compose-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var input = document.getElementById('reviewTextarea');
        if (!input || !input.value.trim()) return;
        showToast('Review submitted successfully!');
        input.value = '';
        if (charCounter) { charCounter.textContent = '0'; charCounter.classList.remove('over-limit'); }
      });
    }

    // ─── Image Lightbox ───
    var lightbox = document.getElementById('imageLightbox');
    var lightboxImage = lightbox ? lightbox.querySelector('.lightbox-image') : null;
    var lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    var lightboxOverlay = lightbox ? lightbox.querySelector('.lightbox-overlay') : null;
    var currentLightboxImages = [];
    var currentLightboxIndex = 0;

    function setLightboxSource(thumb) {
      if (!thumb || !lightboxImage || !lightboxImg) return;
      var imgEl = thumb.querySelector('img');
      var imgSrc = imgEl ? imgEl.getAttribute('src') || imgEl.getAttribute('data-lazy') : '';
      if (!imgSrc) {
        var bg = getComputedStyle(thumb).backgroundImage;
        if (bg && bg !== 'none') imgSrc = bg.replace(/url\(["']?/, '').replace(/["']?\)/, '');
      }
      lightboxImg.src = imgSrc || '';
      var gradClass = thumb.className.split(' ').filter(function (c) { return c.startsWith('grad-'); })[0] || '';
      lightboxImage.className = 'lightbox-image ' + gradClass;
    }

    function handleLightboxOpen(e) {
      var thumb = e.target.closest('.thread-image-thumb');
      if (!thumb || !lightbox || !lightboxImage) return;
      var thread = thumb.closest('.thread-op') || thumb.closest('.thread');
      var allThumbs = thread ? thread.querySelectorAll('.thread-image-thumb') : [];
      currentLightboxImages = [];
      allThumbs.forEach(function (t, i) { currentLightboxImages.push(t); if (t === thumb) currentLightboxIndex = i; });
      setLightboxSource(thumb);
      lightbox.classList.remove('hidden');
    }
    addDocListener('click', handleLightboxOpen);

    if (lightbox) {
      function closeLightbox() { lightbox.classList.add('hidden'); }
      if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
      if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
      var lbPrevBtn = lightbox.querySelector('.lightbox-prev');
      var lbNextBtn = lightbox.querySelector('.lightbox-next');
      function navLightbox(direction) {
        return function (e) {
          e.stopPropagation();
          if (currentLightboxImages.length > 1) {
            currentLightboxIndex = (currentLightboxIndex + direction + currentLightboxImages.length) % currentLightboxImages.length;
            setLightboxSource(currentLightboxImages[currentLightboxIndex]);
          }
        };
      }
      if (lbPrevBtn) lbPrevBtn.addEventListener('click', navLightbox(-1));
      if (lbNextBtn) lbNextBtn.addEventListener('click', navLightbox(1));
      addDocListener('keydown', function (e) {
        if (lightbox.classList.contains('hidden')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && lbPrevBtn) lbPrevBtn.click();
        if (e.key === 'ArrowRight' && lbNextBtn) lbNextBtn.click();
      });
    }

    // ─── Reviews Sort/Filter + Lazy Chunk Loading ───
    var container = document.getElementById('discussionsContainer');
    var loadSentinel = document.getElementById('reviewsLoadSentinel');
    var endOfFeed = document.getElementById('reviewsEndOfFeed');
    var toolbarChips = document.querySelectorAll('.toolbar-chip');
    var reviewsFilter = 'all';
    var reviewsPage = 0;
    var initialReviewsHtml = '';
    var initialLoaded = false;
    var isLoading = false;
    var hasMore = true;
    var CHUNK_SIZE = 4;
    var INITIAL_SKELETON_COUNT = 5;

    function showLoadSpinner() {
      if (!loadSentinel) return;
      loadSentinel.classList.remove('hidden');
      loadSentinel.innerHTML = '<div class="scroll-loader"><div class="scroll-loader-spinner"></div></div>';
      if (endOfFeed) endOfFeed.classList.add('hidden');
    }

    function showEndOfFeed() {
      if (loadSentinel) loadSentinel.classList.add('hidden');
      if (endOfFeed) endOfFeed.classList.remove('hidden');
    }

    function loadInitialReviews(filter) {
      if (isLoading || !container) return;
      isLoading = true;
      var useFilter = filter || reviewsFilter;
      setTimeout(function () {
        container.innerHTML = useFilter === 'all' ? initialReviewsHtml : createGeneratedChunkHTML(8, 0, useFilter, false);
        initialLoaded = true;
        isLoading = false;
        reviewsPage = 0;
        hasMore = true;
        applyAvatarPresence(container);
        applyToAllThreads(container, useFilter);
        hydrateLazyImages(container);
        showLoadSpinner();
      }, 400);
    }

    function appendChunkSkeleton() {
      var wrap = document.createElement('div');
      wrap.className = 'chunk-skeletons';
      wrap.innerHTML = createSkeletonHTML(CHUNK_SIZE);
      container.appendChild(wrap);
      return wrap;
    }

    function loadMoreReviews() {
      if (!initialLoaded || isLoading || !hasMore || !container) return;
      isLoading = true;
      showLoadSpinner();
      var skeletonWrap = appendChunkSkeleton();
      setTimeout(function () {
        if (skeletonWrap && skeletonWrap.parentNode) skeletonWrap.remove();
        reviewsPage++;
        var html = '';
        for (var i = 0; i < CHUNK_SIZE; i++) {
          var name = REVIEW_USERNAMES[Math.floor(Math.random() * REVIEW_USERNAMES.length)];
          var comment = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
          var helpful = REVIEW_HELPFUL[Math.floor(Math.random() * REVIEW_HELPFUL.length)];
          if (reviewsFilter === 'liked') helpful = Math.floor(Math.random() * 50) + 20;
          else if (reviewsFilter === 'saved') helpful = Math.floor(Math.random() * 20) + 5;
          html += createReviewHTML(name, comment, 5, helpful, i + reviewsPage * CHUNK_SIZE, false, reviewsFilter);
        }
        container.insertAdjacentHTML('beforeend', html);
        applyAvatarPresence(container);
        applyToAllThreads(container, reviewsFilter);
        hydrateLazyImages(container);
        isLoading = false;
        if (reviewsPage >= 5) {
          hasMore = false;
          showEndOfFeed();
        } else {
          showLoadSpinner();
        }
      }, 600);
    }

    if (container) {
      initialReviewsHtml = container.innerHTML;
      container.innerHTML = createSkeletonHTML(INITIAL_SKELETON_COUNT);

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (entry.target === container && !initialLoaded) {
            loadInitialReviews(reviewsFilter);
          } else if (entry.target === loadSentinel) {
            loadMoreReviews();
          }
        });
      }, { rootMargin: '0px 0px 250px 0px', threshold: 0 });

      io.observe(container);
      if (loadSentinel) io.observe(loadSentinel);

      toolbarChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          toolbarChips.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          reviewsFilter = chip.getAttribute('data-filter') || 'all';
          initialLoaded = false;
          reviewsPage = 0;
          hasMore = true;
          container.innerHTML = createSkeletonHTML(INITIAL_SKELETON_COUNT);
          showLoadSpinner();
          var targetY = container.getBoundingClientRect().top + window.pageYOffset - 120;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          setTimeout(function () { loadInitialReviews(reviewsFilter); }, 180);
        });
      });
    }

    document.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () { reviewsFilter = chip.getAttribute('data-filter') || 'all'; });
    });

    // ─── Live Stats ───
    var elStatViews = document.getElementById('statViews');
    var elStatCommenters = document.getElementById('statCommenters');
    var elStatComments = document.getElementById('statComments');
    var elStatTips = document.getElementById('statTips');
    var reviewTotalEl = document.getElementById('reviewTotal');

    if (elStatViews) {
      var stats = {
        views:      { val: 12847, el: elStatViews },
        commenters: { val: 186,   el: elStatCommenters },
        comments:   { val: 248,   el: elStatComments },
        tips:       { val: 94,    el: elStatTips }
      };

      Object.keys(stats).forEach(function (key) {
        var el = stats[key].el;
        if (!el) return;
        var dot = document.createElement('span');
        dot.className = 'live-dot';
        dot.setAttribute('aria-hidden', 'true');
        el.appendChild(dot);
        el.style.position = 'relative';
        el.style.display = 'inline-block';
      });

      function spawnFloat(el, text) {
        var f = document.createElement('span');
        f.className = 'stat-float';
        f.textContent = text;
        el.appendChild(f);
        setTimeout(function () { if (f.parentNode) f.remove(); }, 950);
      }

      function animateCount(el, from, to, duration) {
        var start = performance.now();
        var span = el.querySelector('.live-dot');
        function frame(now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 3);
          var cur = Math.round(from + (to - from) * eased);
          el.textContent = formatNum(cur);
          if (span) el.appendChild(span);
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }

      function bump(key, delta) {
        var s = stats[key];
        if (!s || !s.el || delta === 0) return;
        var prev = s.val;
        s.val = Math.max(0, prev + delta);
        animateCount(s.el, prev, s.val, 480);
        s.el.classList.remove('is-bumping');
        void s.el.offsetWidth;
        s.el.classList.add('is-bumping');
        if (delta >= 1) spawnFloat(s.el, '+' + delta);
        if (key === 'comments' && reviewTotalEl) reviewTotalEl.textContent = formatNum(s.val) + ' reviews';
      }

      global.__liveStats = { bump: bump, get: function (k) { return stats[k] ? stats[k].val : null; } };

      function scheduleNextView() {
        var tid = setTimeout(function () { bump('views', 1 + Math.floor(Math.random() * 3)); scheduleNextView(); }, 5000 + Math.random() * 6000);
        timers.push(tid);
      }
      scheduleNextView();

      function scheduleSimulatedComment() {
        var tid = setTimeout(function () { bump('comments', 1); if (Math.random() < 0.3) bump('commenters', 1); scheduleSimulatedComment(); }, 18000 + Math.random() * 22000);
        timers.push(tid);
      }
      scheduleSimulatedComment();

      var detailLikeBtn = document.getElementById('detailLikeBtn');
      if (detailLikeBtn) {
        detailLikeBtn.addEventListener('click', function () { if (detailLikeBtn.classList.contains('is-active')) bump('views', 1); });
      }

      var rewardSupportBtn = document.querySelector('.reward-support-btn');
      if (rewardSupportBtn) {
        rewardSupportBtn.addEventListener('click', function () { bump('tips', 1); }, true);
      }

      var composeBtn = document.getElementById('composeSubmitBtn') || document.querySelector('.compose-submit');
      if (composeBtn) {
        composeBtn.addEventListener('click', function () {
          var input = document.getElementById('reviewTextarea');
          var text = input && input.value ? input.value.trim() : '';
          if (text) { bump('comments', 1); bump('commenters', 1); }
        });
      }

      addDocListener('click', function (e) {
        var btn = e.target.closest('.reply-submit, .reply-submit-btn');
        if (!btn) return;
        var form = btn.closest('.thread-reply-form');
        if (!form) return;
        var ta = form.querySelector('.reply-textarea');
        var text = ta ? ta.value || '' : '';
        if (text.trim()) bump('comments', 1);
      });
    }

    // ─── Prompt Display Login Gate ───
    var promptSection = document.getElementById('promptDisplaySection');
    var copyBtn = document.getElementById('promptDisplayCopy');
    if (promptSection && copyBtn) {
      if (isLoggedIn()) promptSection.classList.add('is-logged-in');
      copyBtn.addEventListener('click', function () {
        if (!promptSection.classList.contains('is-logged-in')) return;
        var code = document.getElementById('promptDisplayCode');
        if (code && navigator.clipboard) {
          navigator.clipboard.writeText(code.textContent).then(function () { showToast('Prompt copied!'); });
        }
      });
    }

    // ─── Review Composer Login Gate ───
    var compose = document.querySelector('.review-compose');
    if (compose && !isLoggedIn()) compose.style.display = 'none';

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup hook for SPA-like navigation (rarely used here)
  global.__cleanupPromptDetail = function () {
    timers.forEach(function (id) { clearTimeout(id); });
    observers.forEach(function (obs) { obs.disconnect(); });
    docHandlers.forEach(function (h) { document.removeEventListener(h.type, h.handler); });
  };
})(window);
