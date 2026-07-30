/* ============================================================
   code-block.js —全站代码块统一增强
   依赖：highlight.js (CDN 自动加载)
   功能：
   1. 为 .code-block 和裸 <pre><code> 统一注入 header（语言标签 + Copy + Expand）
   2. 调用 hljs.highlightElement 做语法高亮
   3. 长代码块自动标记为可折叠，提供展开/收起
   4. Copy 按钮复制代码，1.4s 反馈
   兼容已有 .thread-code-block / .prompt-display-block 的 copy 按钮。
   ============================================================ */
(function () {
  'use strict';

  var HLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0';
  var COLLAPSE_THRESHOLD = 340; // px，超过此高度则可折叠
  var COLLAPSED_HEIGHT = 340;

  // ── 全站 Copy Toast：复用 prompt.js 的 .review-toast 样式 ──
  // 优先调用页面已有的 window.showToast（prompt-detail 等），避免重复弹窗；
  // 其它页面（detail/community）由本模块自建同款 toast。
  function showCopyToast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
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
    }, 2200);
  }

  // 语言标签映射：hljs className -> 显示文本
  var LANG_LABELS = {
    'language-typescript': 'TypeScript',
    'language-ts': 'TypeScript',
    'language-javascript': 'JavaScript',
    'language-js': 'JavaScript',
    'language-jsx': 'JSX',
    'language-tsx': 'TSX',
    'language-python': 'Python',
    'language-py': 'Python',
    'language-bash': 'Shell',
    'language-sh': 'Shell',
    'language-shell': 'Shell',
    'language-json': 'JSON',
    'language-html': 'HTML',
    'language-css': 'CSS',
    'language-scss': 'SCSS',
    'language-yaml': 'YAML',
    'language-yml': 'YAML',
    'language-markdown': 'Markdown',
    'language-md': 'Markdown',
    'language-sql': 'SQL',
    'language-go': 'Go',
    'language-rust': 'Rust',
    'language-java': 'Java',
    'language-c': 'C',
    'language-cpp': 'C++',
    'language-csharp': 'C#',
    'language-php': 'PHP',
    'language-ruby': 'Ruby',
    'language-diff': 'Diff',
    'language-plaintext': 'Text',
    'language-text': 'Text'
  };

  function loadHLJS() {
    if (window.hljs) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = HLJS_CDN + '/styles/atom-one-dark.min.css';
      document.head.appendChild(link);

      var script = document.createElement('script');
      script.src = HLJS_CDN + '/highlight.min.js';
      script.onload = function () {
        if (window.hljs) {
          try { window.hljs.configure({ ignoreUnescapedHTML: true }); } catch (_) {}
        }
        resolve();
      };
      script.onerror = function () { reject(new Error('hljs load failed')); };
      document.head.appendChild(script);
    });
  }

  function detectLang(codeEl) {
    // 1) 显式 class
    var cls = codeEl.className || '';
    var m = cls.match(/language-(\w+)/);
    if (m) {
      var key = 'language-' + m[1].toLowerCase();
      if (LANG_LABELS[key]) return LANG_LABELS[key];
      return m[1].charAt(0).toUpperCase() + m[1].slice(1);
    }
    // 2) 由父 .code-block 的 data-lang 属性指定
    var block = codeEl.closest('.code-block');
    if (block && block.getAttribute('data-lang')) {
      return block.getAttribute('data-lang');
    }
    // 3) 启发式：根据内容猜测
    var txt = (codeEl.textContent || '').trim();
    if (/^\s*(#|\/\*|\/\/)/.test(txt) && /\bdef\s+\w+\s*\(/.test(txt)) return 'Python';
    if (/^\s*<\?php/.test(txt)) return 'PHP';
    if (/^\s*</.test(txt) && /<\/[a-zA-Z]/.test(txt)) return 'HTML';
    if (/\bfunction\s+\w+|\bconst\s+\w+\s*=|\bimport\s+.*from\s+['"]/.test(txt)) return 'JavaScript';
    if (/^\s*\$/.test(txt) && /\b(curl|jq|cd|ls|grep|sed|awk|bash)\b/.test(txt)) return 'Shell';
    return 'Code';
  }

  function buildHeader(lang, hasExpand) {
    var header = document.createElement('div');
    header.className = 'code-block-header';

    var langSpan = document.createElement('span');
    langSpan.className = 'code-block-lang';
    langSpan.textContent = lang;
    header.appendChild(langSpan);

    var actions = document.createElement('div');
    actions.className = 'code-block-actions';

    if (hasExpand) {
      var expandBtn = document.createElement('button');
      expandBtn.className = 'code-block-expand';
      expandBtn.type = 'button';
      expandBtn.textContent = 'Expand';
      expandBtn.setAttribute('aria-expanded', 'false');
      actions.appendChild(expandBtn);
    }

    var copyBtn = document.createElement('button');
    copyBtn.className = 'code-block-copy';
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy';
    actions.appendChild(copyBtn);

    header.appendChild(actions);
    return header;
  }

  function copyText(text, btn) {
    // 乐观反馈：用户点击即立即弹出 toast + 按钮高亮
    // clipboard 写入是异步的，在某些环境（自动化/非 HTTPS）Promise 可能 hang，
    // 所以不等待它的回调，直接给反馈。真实写入仍会尝试，且有超时兜底走 fallback。
    btn.classList.add('is-copied');
    setTimeout(function () { btn.classList.remove('is-copied'); }, 1400);
    showCopyToast('Copied to clipboard');

    var done = false;
    function tryFallback() {
      if (done) return;
      done = true;
      fallbackCopy(text, null);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done = true; // 写入成功，无需 fallback
      }).catch(tryFallback);
      // 超时兜底：1.2s 内 Promise 未落定则走 fallback
      setTimeout(tryFallback, 1200);
    } else {
      tryFallback();
    }
  }
  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    // 无论 execCommand 是否成功，都触发反馈（用户已点击，需要视觉响应）
    cb && cb();
  }

  // 为单个 .code-block 注入 header + 高亮 + 折叠判定
  function enhanceBlock(block) {
    if (block.getAttribute('data-code-enhanced') === '1') return;
    var pre = block.querySelector('pre');
    var codeEl = block.querySelector('pre code') || pre;
    if (!pre || !codeEl) return;

    // 高亮
    if (window.hljs) {
      try {
        // 移除可能存在的旧 hljs class，避免重复
        codeEl.className = codeEl.className.replace(/\bhljs\b/g, '').trim();
        window.hljs.highlightElement(codeEl);
      } catch (_) {}
    }

    var lang = detectLang(codeEl);
    block.setAttribute('data-lang', lang);

    // 判断是否需要折叠：测量原始高度
    // 临时解除可能存在的 max-height 限制来测量
    var prevMaxHeight = pre.style.maxHeight;
    pre.style.maxHeight = 'none';
    var naturalHeight = pre.scrollHeight;
    pre.style.maxHeight = prevMaxHeight;
    var needsCollapse = naturalHeight > COLLAPSE_THRESHOLD + 40;

    if (needsCollapse) {
      block.classList.add('is-collapsible', 'is-collapsed');
    }

    // 插入 header（若已存在则不重复）
    if (!block.querySelector('.code-block-header')) {
      var header = buildHeader(lang, needsCollapse);
      block.insertBefore(header, pre);
    }

    block.setAttribute('data-code-enhanced', '1');
  }

  // 处理裸 <pre><code>（未被 .code-block 包裹的）
  function wrapBarePre(pre) {
    if (pre.closest('.code-block')) return; // 已在 code-block 内
    if (pre.closest('.thread-code-block')) return; // prompt-detail 旧结构
    if (pre.closest('.prompt-display-block')) return;
    var block = document.createElement('div');
    block.className = 'code-block';
    pre.parentNode.insertBefore(block, pre);
    block.appendChild(pre);
  }

  function enhanceAll(root) {
    root = root || document;
    // 1. 包装裸 pre
    var barePres = root.querySelectorAll('pre code');
    Array.prototype.forEach.call(barePres, function (code) {
      var pre = code.parentElement;
      if (pre && pre.tagName === 'PRE') wrapBarePre(pre);
    });
    // 2. 增强 .code-block
    var blocks = root.querySelectorAll('.code-block');
    Array.prototype.forEach.call(blocks, enhanceBlock);
  }

  // 事件委托：Copy + Expand
  function bindEvents() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      // Copy（统一 .code-block-copy / .thread-code-copy / .prompt-display-copy）
      var copyBtn = t.closest('.code-block-copy, .thread-code-copy, .prompt-display-copy');
      if (copyBtn) {
        var block = copyBtn.closest('.code-block, .thread-code-block, .prompt-display-block');
        if (!block) return;
        // 登录门禁：prompt-display 未登录时不复制，弹 toast 提示登录
        var pSection = copyBtn.closest('.prompt-display-section');
        if (pSection && !pSection.classList.contains('is-logged-in')) {
          copyBtn.classList.add('is-copied');
          setTimeout(function () { copyBtn.classList.remove('is-copied'); }, 1400);
          showCopyToast('Please log in to copy');
          return;
        }
        var codeEl = block.querySelector('pre code') ||
                     block.querySelector('code') ||
                     block.querySelector('pre');
        if (!codeEl) return;
        copyText(codeEl.textContent, copyBtn);
        return;
      }

      // Expand / Collapse
      var expandBtn = t.closest('.code-block-expand');
      if (expandBtn) {
        var cb = expandBtn.closest('.code-block');
        if (!cb) return;
        var isCollapsed = cb.classList.toggle('is-collapsed');
        expandBtn.textContent = isCollapsed ? 'Expand' : 'Collapse';
        expandBtn.setAttribute('aria-expanded', String(!isCollapsed));
      }
    });
  }

  function init() {
    bindEvents();
    loadHLJS()
      .then(function () { enhanceAll(document); })
      .catch(function () { enhanceAll(document); }); // hljs 加载失败也至少注入 header
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露给动态内容使用（例如动态插入新代码块后）
  window.GHRankCodeBlock = {
    enhance: enhanceAll,
    enhanceBlock: enhanceBlock
  };
})();
