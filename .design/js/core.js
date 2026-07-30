/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // React 19 CORE — 全站共享组件层
   ────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD)、ReactDOM 19 (UMD)、Babel Standalone
   加载方式：HTML 页面引入 React CDN → core.js (type=text/babel)

   职责：
   1. 全站页面配置表 PAGE_CONFIG（ticker / search / footer）
   2. 共享组件：Shell / Ticker / Navbar / Footer / SearchOverlay / UserSidebar / SideNav
   3. 副作用钩子：懒加载骨架、搜索覆盖层、头像解析、滚动显隐
   4. 挂载入口：GHRANK.mount(pageName, PageBodyComponent)

   替换原 shared.js + side-nav.js + loading.js + Header.html + Footer.html
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useRef, useMemo, useCallback } = React;
  var { createRoot } = ReactDOM;

  /* ═══════════════════════════════════════════════════════════════
     1. 页面配置表 —— 全站统一数据源
     ═══════════════════════════════════════════════════════════════ */
  var PAGE_CONFIG = {
    index: {
      tickerLabel: 'LIVE FEED',
      tickerItems: [
        { text: 'facebook/react <span>230K&#9733;</span>', href: 'community-detail.html' },
        { text: 'torvalds/linux <span>182K&#9733;</span>', href: 'community-detail.html' },
        { text: 'langchain-ai/langchain <span>96.7K&#9733;</span>', href: 'community-detail.html' },
        { text: 'rust-lang/rust <span>99.8K&#9733;</span>', href: 'community-detail.html' },
        { text: 'godotengine/godot <span>95.3K&#9733;</span>', href: 'community-detail.html' },
        { text: 'nextjs/next.js <span>128K&#9733;</span>', href: 'community-detail.html' },
        { text: 'docker/engine <span>69.4K&#9733;</span>', href: 'community-detail.html' },
        { text: 'vuejs/core <span>48.2K&#9733;</span>', href: 'community-detail.html' },
        { text: 'openai/whisper <span>72.8K&#9733;</span>', href: 'community-detail.html' },
        { text: 'denoland/deno <span>98.2K&#9733;</span>', href: 'community-detail.html' },
        { text: 'shadcn-ui/ui <span>81.4K&#9733;</span>', href: 'community-detail.html' },
        { text: 'tiangolo/fastapi <span>82.1K&#9733;</span>', href: 'community-detail.html' }
      ],
      searchPlaceholder: 'Search repos...',
      footerText: 'Data sourced from GitHub API &mdash; Ranked by multi-factor scoring with time-decay weighting',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    news: {
      tickerLabel: 'NEWS FEED',
      tickerItems: [
        { text: 'GPT-5 Official Release <span>BREAKING</span>', href: 'news.html' },
        { text: 'Anthropic Claude 4 Launch <span>NEW</span>', href: 'news.html' },
        { text: 'Meta LLama 4 Open Source <span>HOT</span>', href: 'news.html' },
        { text: 'Google Gemini Ultra 2 <span>UPDATE</span>', href: 'news.html' },
        { text: 'OpenAI DevDay 2026 <span>EVENT</span>', href: 'news.html' },
        { text: 'Mistral Large 3 Released <span>NEW</span>', href: 'news.html' },
        { text: 'xAI Grok 3 Update <span>LIVE</span>', href: 'news.html' },
        { text: 'Stability AI SD 4.0 <span>BREAKING</span>', href: 'news.html' }
      ],
      searchPlaceholder: 'Search news...',
      footerText: 'GHRANK Intelligence Feed &mdash; Aggregated from 2,400+ AI sources worldwide',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    prompt: {
      tickerLabel: 'PROMPT FEED',
      tickerItems: [
        { text: 'Cinematic Portrait Generator <span>SOLD</span>', href: 'prompt-detail.html' },
        { text: 'Code Review Assistant v3 <span>+47 uses</span>', href: 'prompt-detail.html' },
        { text: 'Midjourney Style Transfer <span>HOT</span>', href: 'prompt-detail.html' },
        { text: 'SEO Blog Writer Pro <span>+128 uses</span>', href: 'prompt-detail.html' },
        { text: 'UI/UX Design Critic <span>NEW</span>', href: 'prompt-detail.html' },
        { text: 'Data Analysis Copilot <span>+89 uses</span>', href: 'prompt-detail.html' },
        { text: 'Stable Diffusion Negative <span>SOLD</span>', href: 'prompt-detail.html' },
        { text: 'API Documentation Gen <span>+34 uses</span>', href: 'prompt-detail.html' }
      ],
      searchPlaceholder: 'Search prompts...',
      footerText: 'Prompt Marketplace &mdash; Trade intelligence. Powered by GHRANK.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'prompt-list': {
      tickerLabel: 'PROMPT FEED',
      tickerItems: [
        { text: 'Cinematic Portrait Generator <span>SOLD</span>', href: 'prompt-detail.html' },
        { text: 'Code Review Assistant v3 <span>+47 uses</span>', href: 'prompt-detail.html' },
        { text: 'Midjourney Style Transfer <span>HOT</span>', href: 'prompt-detail.html' },
        { text: 'SEO Blog Writer Pro <span>+128 uses</span>', href: 'prompt-detail.html' },
        { text: 'UI/UX Design Critic <span>NEW</span>', href: 'prompt-detail.html' },
        { text: 'Data Analysis Copilot <span>+89 uses</span>', href: 'prompt-detail.html' }
      ],
      searchPlaceholder: 'Search prompts...',
      footerText: 'Prompt Marketplace &mdash; Trade intelligence. Powered by GHRANK.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'prompt-detail': {
      tickerLabel: 'PROMPT FEED',
      tickerItems: [
        { text: 'Cinematic Portrait Generator <span>SOLD</span>', href: 'prompt-detail.html' },
        { text: 'Code Review Assistant v3 <span>+47 uses</span>', href: 'prompt-detail.html' },
        { text: 'Midjourney Style Transfer <span>HOT</span>', href: 'prompt-detail.html' },
        { text: 'SEO Blog Writer Pro <span>+128 uses</span>', href: 'prompt-detail.html' },
        { text: 'UI/UX Design Critic <span>NEW</span>', href: 'prompt-detail.html' },
        { text: 'Data Analysis Copilot <span>+89 uses</span>', href: 'prompt-detail.html' }
      ],
      searchPlaceholder: 'Search prompts...',
      footerText: 'Prompt Marketplace &mdash; Trade intelligence. Powered by GHRANK.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    skills: {
      tickerLabel: 'SKILLS FEED',
      tickerItems: [
        { text: 'claude-code <span>TOP</span>', href: 'skills-detail.html?id=skill-1' },
        { text: 'ai-sdk <span>HOT</span>', href: 'skills-detail.html?id=skill-9' },
        { text: 'superpowers <span>NEW</span>', href: 'skills-detail.html?id=skill-25' },
        { text: 'browser-use <span>+12%</span>', href: 'skills-detail.html?id=skill-41' },
        { text: 'remotion <span>TRENDING</span>', href: 'skills-detail.html?id=skill-57' },
        { text: 'cloudflare-workers <span>+89 uses</span>', href: 'skills-detail.html?id=skill-73' }
      ],
      searchPlaceholder: 'Search skills...',
      footerText: 'GHRANK Skills Market &mdash; Discover, compare and install Agent Skills.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'skills-detail': {
      tickerLabel: 'SKILLS FEED',
      tickerItems: [
        { text: 'claude-code <span>TOP</span>', href: 'skills-detail.html?id=skill-1' },
        { text: 'ai-sdk <span>HOT</span>', href: 'skills-detail.html?id=skill-9' },
        { text: 'superpowers <span>NEW</span>', href: 'skills-detail.html?id=skill-25' },
        { text: 'browser-use <span>+12%</span>', href: 'skills-detail.html?id=skill-41' },
        { text: 'remotion <span>TRENDING</span>', href: 'skills-detail.html?id=skill-57' },
        { text: 'cloudflare-workers <span>+89 uses</span>', href: 'skills-detail.html?id=skill-73' }
      ],
      searchPlaceholder: 'Search skills...',
      footerText: 'GHRANK Skills Market &mdash; Discover, compare and install Agent Skills.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'skills-owner': {
      tickerLabel: 'SKILLS FEED',
      tickerItems: [
        { text: 'Anthropics <span>8 skills</span>', href: 'skills-owner.html?owner=anthropics' },
        { text: 'Vercel Labs <span>8 skills</span>', href: 'skills-owner.html?owner=vercel-labs' },
        { text: 'ByteDance <span>8 skills</span>', href: 'skills-owner.html?owner=bytedance' }
      ],
      searchPlaceholder: 'Search skills...',
      footerText: 'GHRANK Skills Market &mdash; Creator profiles and published skills.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'skills-categories': {
      tickerLabel: 'SKILLS FEED',
      tickerItems: [
        { text: 'Development <span>7.4K skills</span>', href: 'skills.html' },
        { text: 'Tools <span>6.6K skills</span>', href: 'skills.html' },
        { text: 'Data &amp; AI <span>4.3K skills</span>', href: 'skills.html' }
      ],
      searchPlaceholder: 'Search skills...',
      footerText: 'GHRANK Skills Market &mdash; Browse all skill categories.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    detail: {
      tickerLabel: 'LIVE FEED',
      tickerItems: [
        { text: 'facebook/react <span>230K&#9733;</span>', href: 'community-detail.html' },
        { text: 'torvalds/linux <span>182K&#9733;</span>', href: 'community-detail.html' },
        { text: 'langchain-ai/langchain <span>96.7K&#9733;</span>', href: 'community-detail.html' },
        { text: 'rust-lang/rust <span>99.8K&#9733;</span>', href: 'community-detail.html' },
        { text: 'nextjs/next.js <span>128K&#9733;</span>', href: 'community-detail.html' },
        { text: 'docker/engine <span>69.4K&#9733;</span>', href: 'community-detail.html' },
        { text: 'vuejs/core <span>48.2K&#9733;</span>', href: 'community-detail.html' },
        { text: 'openai/whisper <span>72.8K&#9733;</span>', href: 'community-detail.html' }
      ],
      searchPlaceholder: 'Search repos...',
      footerText: 'Data sourced from GitHub API &mdash; Ranked by multi-factor scoring with time-decay weighting',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    search: {
      tickerLabel: 'SEARCH FEED',
      tickerItems: [
        { text: 'react <span>TRENDING</span>', href: 'search.html' },
        { text: 'vue <span>HOT</span>', href: 'search.html' },
        { text: 'rust <span>+12%</span>', href: 'search.html' },
        { text: 'python <span>TOP</span>', href: 'search.html' },
        { text: 'typescript <span>+8%</span>', href: 'search.html' },
        { text: 'go <span>RISING</span>', href: 'search.html' },
        { text: 'next.js <span>TRENDING</span>', href: 'search.html' },
        { text: 'tailwindcss <span>NEW</span>', href: 'search.html' }
      ],
      searchPlaceholder: 'Search...',
      footerText: 'GHRANK Search Engine &mdash; Real-time index of open source intelligence',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    website: {
      tickerLabel: 'WEBSITE',
      tickerItems: [
        { text: 'OpenAI <span>4.8M visits</span>', href: 'website.html' },
        { text: 'GitHub <span>3.2M visits</span>', href: 'website.html' },
        { text: 'Figma <span>5.2M visits</span>', href: 'website.html' },
        { text: 'Notion <span>6.1M visits</span>', href: 'website.html' },
        { text: 'Anthropic <span>4.1M visits</span>', href: 'website.html' },
        { text: 'Hugging Face <span>3.2M visits</span>', href: 'website.html' },
        { text: 'Vercel <span>860K visits</span>', href: 'website.html' },
        { text: 'freeCodeCamp <span>1.3M visits</span>', href: 'website.html' }
      ],
      searchPlaceholder: 'Search sites...',
      footerText: 'Website Directory &mdash; 1,284 curated links across AI, dev, design &amp; productivity.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    community: {
      tickerLabel: 'COMMUNITY',
      tickerItems: [
        { text: 'New thread in Hot Topics <span>2m</span>', href: 'community.html' },
        { text: 'kairos showed off a new build <span>SHOW</span>', href: 'community.html' },
        { text: 'Answered: Best vector DB for agents <span>SOLVED</span>', href: 'community.html' },
        { text: 'Tutorial: Fine-tune Llama 4 locally <span>NEW</span>', href: 'community.html' },
        { text: 'Dev log: GHRANK scoring v4 progress <span>LOG</span>', href: 'community.html' },
        { text: 'Community milestone: 48K members <span>HOT</span>', href: 'community.html' }
      ],
      searchPlaceholder: 'Search community...',
      footerText: 'GHRANK Community &mdash; Where builders connect, share, and learn together.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'community-new': {
      tickerLabel: 'COMMUNITY',
      tickerItems: [
        { text: 'New thread in Hot Topics <span>2m</span>', href: 'community.html' },
        { text: 'kairos showed off a new build <span>SHOW</span>', href: 'community.html' },
        { text: 'Answered: Best vector DB for agents <span>SOLVED</span>', href: 'community.html' },
        { text: 'Tutorial: Fine-tune Llama 4 locally <span>NEW</span>', href: 'community.html' },
        { text: 'Dev log: GHRANK scoring v4 progress <span>LOG</span>', href: 'community.html' },
        { text: 'Community milestone: 48K members <span>HOT</span>', href: 'community.html' }
      ],
      searchPlaceholder: 'Search community...',
      footerText: 'GHRANK Community &mdash; Where builders connect, share, and learn together.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'community-detail': {
      tickerLabel: 'COMMUNITY',
      tickerItems: [
        { text: 'New thread in Hot Topics <span>2m</span>', href: 'community.html' },
        { text: 'kairos showed off a new build <span>SHOW</span>', href: 'community.html' },
        { text: 'Answered: Best vector DB for agents <span>SOLVED</span>', href: 'community.html' },
        { text: 'Tutorial: Fine-tune Llama 4 locally <span>NEW</span>', href: 'community.html' },
        { text: 'Dev log: GHRANK scoring v4 progress <span>LOG</span>', href: 'community.html' },
        { text: 'Community milestone: 48K members <span>HOT</span>', href: 'community.html' }
      ],
      searchPlaceholder: 'Search community...',
      footerText: 'GHRANK Community &mdash; Where builders connect, share, and learn together.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'community-list': {
      tickerLabel: 'COMMUNITY',
      tickerItems: [
        { text: 'New thread in Hot Topics <span>2m</span>', href: 'community.html' },
        { text: 'kairos showed off a new build <span>SHOW</span>', href: 'community.html' },
        { text: 'Answered: Best vector DB for agents <span>SOLVED</span>', href: 'community.html' },
        { text: 'Tutorial: Fine-tune Llama 4 locally <span>NEW</span>', href: 'community.html' },
        { text: 'Dev log: GHRANK scoring v4 progress <span>LOG</span>', href: 'community.html' },
        { text: 'Community milestone: 48K members <span>HOT</span>', href: 'community.html' }
      ],
      searchPlaceholder: 'Search community...',
      footerText: 'GHRANK Community &mdash; Where builders connect, share, and learn together.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    'community-tiebas': {
      tickerLabel: 'COMMUNITY',
      tickerItems: [
        { text: 'New thread in AI Agents Hub <span>2m</span>', href: 'community-tiebas.html' },
        { text: 'RAG Builders milestone: 8.7K members <span>HOT</span>', href: 'community-tiebas.html?bar=rag-builders' },
        { text: 'Vector DB Labs trending <span>UP</span>', href: 'community-tiebas.html?bar=vector-db' },
        { text: 'CLI Craftsmen weekly showcase <span>SHOW</span>', href: 'community-tiebas.html?bar=cli-craft' },
        { text: 'DevOps Den: cost attribution guide <span>NEW</span>', href: 'community-tiebas.html?bar=devops' },
        { text: 'Open Source Guild governance talk <span>LOG</span>', href: 'community-tiebas.html?bar=open-src' }
      ],
      searchPlaceholder: 'Search tieba...',
      footerText: 'GHRANK Tieba &mdash; Focused spaces for deep technical discussions.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    login: {
      tickerLabel: 'ACCESS',
      tickerItems: [
        { text: 'New user joined <span>+1</span>', href: 'login.html' },
        { text: 'AlexShader published a new prompt <span>NEW</span>', href: 'prompt-detail.html' },
        { text: 'Top contributor this week <span>HOT</span>', href: 'community-detail.html' },
        { text: 'Community milestone reached <span>10K users</span>', href: 'index.html' }
      ],
      searchPlaceholder: 'Search...',
      footerText: 'GHRANK Access Portal &mdash; Secure authentication for open source intelligence.',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    about: {
      tickerLabel: 'LIVE FEED',
      tickerItems: [
        { text: 'facebook/react <span>230K&#9733;</span>', href: 'community-detail.html' },
        { text: 'torvalds/linux <span>182K&#9733;</span>', href: 'community-detail.html' },
        { text: 'rust-lang/rust <span>99.8K&#9733;</span>', href: 'community-detail.html' },
        { text: 'nextjs/next.js <span>128K&#9733;</span>', href: 'community-detail.html' },
        { text: 'docker/engine <span>69.4K&#9733;</span>', href: 'community-detail.html' },
        { text: 'vuejs/core <span>48.2K&#9733;</span>', href: 'community-detail.html' }
      ],
      searchPlaceholder: 'Search repos...',
      footerText: 'Data sourced from GitHub API &mdash; Ranked by multi-factor scoring with time-decay weighting',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    },
    '404': {
      tickerLabel: 'LIVE FEED',
      tickerItems: [
        { text: 'facebook/react <span>230K&#9733;</span>', href: 'community-detail.html' },
        { text: 'torvalds/linux <span>182K&#9733;</span>', href: 'community-detail.html' },
        { text: 'langchain-ai/langchain <span>96.7K&#9733;</span>', href: 'community-detail.html' },
        { text: 'rust-lang/rust <span>99.8K&#9733;</span>', href: 'community-detail.html' },
        { text: 'nextjs/next.js <span>128K&#9733;</span>', href: 'community-detail.html' },
        { text: 'docker/engine <span>69.4K&#9733;</span>', href: 'community-detail.html' },
        { text: 'vuejs/core <span>48.2K&#9733;</span>', href: 'community-detail.html' },
        { text: 'openai/whisper <span>72.8K&#9733;</span>', href: 'community-detail.html' }
      ],
      searchPlaceholder: 'Search repos...',
      footerText: 'Data sourced from GitHub API &mdash; Ranked by multi-factor scoring with time-decay weighting',
      footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms']
    }
  };

  var FOOTER_LINK_MAP = {
    'About Us': 'about.html#about',
    'Sponsors': 'about.html#sponsors',
    'Changelog': 'about.html#changelog',
    'Terms': 'about.html#terms',
    'Docs': 'about.html#about'
  };

  var NAV_LINKS = [
    { href: 'index.html', page: 'index', label: 'HOME' },
    { href: 'news.html', page: 'news', label: 'NEWS' },
    { href: 'skills.html', page: 'skills', label: 'SKILLS' },
    { href: 'prompt.html', page: 'prompt', label: 'PROMPT' },
    { href: 'website.html', page: 'website', label: 'WEBSITE' },
    { href: '#', page: 'study', label: 'STUDY' },
    { href: 'community.html', page: 'community', label: 'COMMUNITY' }
  ];

  /* ═══════════════════════════════════════════════════════════════
     2. 工具函数
     ═══════════════════════════════════════════════════════════════ */
  function detectPage() {
    var path = window.location.pathname;
    var file = path.split('/').pop().replace('.html', '') || 'index';
    if (file === '') file = 'index';
    return file;
  }

  function getConfig(page) {
    return PAGE_CONFIG[page] || PAGE_CONFIG['index'];
  }

  /* ═══════════════════════════════════════════════════════════════
     3. 共享组件 —— Ticker
     ═══════════════════════════════════════════════════════════════ */
  function Ticker({ config }) {
    var items = config.tickerItems || [];
    // 双倍循环实现无缝滚动
    var doubled = items.concat(items);
    return (
      <div className="ticker" id="siteTicker">
        <div className="ticker-label" id="tickerLabel">{config.tickerLabel}</div>
        <div className="ticker-track">
          <div className="ticker-scroll" id="tickerScroll">
            {doubled.map(function (it, i) {
              return (
                <a className="ticker-item" href={it.href || '#'} key={i}
                   dangerouslySetInnerHTML={{ __html: it.text }} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     4. 共享组件 —— Navbar
     通过 onOpenSearch 回调与 SearchOverlay 通信（多挂载点模式）
     ═══════════════════════════════════════════════════════════════ */
  function Navbar({ config, currentPage, onOpenSearch }) {
    var [loggedIn, setLoggedIn] = useState(function () {
      return localStorage.getItem('ghrank_logged_in') === '1';
    });
    var userAvatar = localStorage.getItem('ghrank_user_avatar') || '../styles/images/demo/prompt_1.jpg';

    // 监听登录状态变化（跨页面同步）
    useEffect(function () {
      function sync() { setLoggedIn(localStorage.getItem('ghrank_logged_in') === '1'); }
      window.addEventListener('storage', sync);
      return function () { window.removeEventListener('storage', sync); };
    }, []);

    var hideLogin = currentPage === 'login';

    // 通过自定义事件通知 UserCenterSidebar 组件切换打开状态
    // 避免直接操作 DOM 与 React state 不同步导致关闭失效
    function openUserSidebar() {
      window.dispatchEvent(new CustomEvent('ghrank:toggle-sidebar'));
    }

    /* ── LOGO 悬停动画状态 ──
       isHovered 控制六边形旋转、辉光脉冲、文字扫光等动效 */
    var [isLogoHovered, setIsLogoHovered] = useState(false);

    return (
      <nav className="navbar" id="siteNavbar">
        <div className="navbar-brand">
          <a href="index.html"
             className={'navbar-brand-link' + (isLogoHovered ? ' is-hovered' : '')}
             onMouseEnter={function () { setIsLogoHovered(true); }}
             onMouseLeave={function () { setIsLogoHovered(false); }}>
            <div className="logo-hex">
              <span className="logo-hex-letter">G</span>
              {/* 悬停时显示的六边形描边光环 */}
              <span className="logo-hex-ring" />
            </div>
            <div className="logo-text">
              <span className="logo-text-main" data-text="GHRANK">GHRANK</span>
              <span className="logo-text-sub">Open Source Intelligence</span>
            </div>
          </a>
        </div>
        <div className="navbar-nav" id="navbarNav">
          {NAV_LINKS.map(function (n) {
            return (
              <a href={n.href} data-page={n.page}
                 className={currentPage === n.page ? 'active' : ''}
                 key={n.page}>{n.label}</a>
            );
          })}
        </div>
        <div className="navbar-actions">
          <div className="search-box" onClick={function (e) {
            e.preventDefault(); e.stopPropagation();
            if (onOpenSearch) onOpenSearch();
          }}>
            <span className="search-icon">&#x1F50D;&#xFE0E;</span>
            <input type="text" id="searchInput" placeholder={config.searchPlaceholder} spellCheck="false" readOnly />
          </div>
          {!loggedIn && !hideLogin && (
            <a href="login.html" className="btn-dispatch" id="navLoginLink">LOG IN</a>
          )}
          {loggedIn && (
            <button className="nav-avatar-btn" id="navAvatarBtn" aria-label="Open user center"
                    onClick={openUserSidebar}>
              <span className="nav-avatar-wrap">
                <img src={userAvatar} alt="" className="nav-avatar-img" />
              </span>
              <span className="nav-avatar-online"></span>
            </button>
          )}
        </div>
      </nav>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     5. 共享组件 —— Footer
     ═══════════════════════════════════════════════════════════════ */
  function Footer({ config }) {
    var links = config.footerLinks || [];
    return (
      <footer className="footer" id="siteFooter">
        <div className="footer-text" id="footerText"
             dangerouslySetInnerHTML={{ __html: config.footerText }} />
        <div className="footer-links" id="footerLinks">
          {links.map(function (label, i) {
            var href = (typeof label === 'string') ? (FOOTER_LINK_MAP[label] || 'about.html#about') : (label.href || '#');
            var text = (typeof label === 'string') ? label : label.text;
            return <a href={href} key={i}>{text}</a>;
          })}
        </div>
      </footer>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     6. 共享组件 —— SearchOverlay
     ═══════════════════════════════════════════════════════════════ */
  var SEARCH_DATA = [
    { name: 'facebook/react', desc: 'The library for web and native user interfaces.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '230K', url: 'community-detail.html' },
    { name: 'torvalds/linux', desc: 'Linux kernel source tree. The core of the Linux operating system.', tag: 'Backend', tagClass: 'tag-backend', stars: '182K', url: 'community-detail.html' },
    { name: 'vuejs/core', desc: 'The Progressive JavaScript Framework for building web UIs.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '48.2K', url: 'community-detail.html' },
    { name: 'openai/whisper', desc: 'Robust Speech Recognition via Large-Scale Weak Supervision.', tag: 'AI/ML', tagClass: 'tag-ai', stars: '72.8K', url: 'community-detail.html' },
    { name: 'docker/engine', desc: 'Docker Engine — open source containerization technology.', tag: 'DevOps', tagClass: 'tag-devops', stars: '69.4K', url: 'community-detail.html' },
    { name: 'godotengine/godot', desc: 'Godot Engine — Multi-platform 2D and 3D game engine.', tag: 'Games', tagClass: 'tag-games', stars: '95.3K', url: 'community-detail.html' },
    { name: 'tiangolo/fastapi', desc: 'FastAPI framework, high performance, easy to learn, fast to code.', tag: 'Backend', tagClass: 'tag-backend', stars: '82.1K', url: 'community-detail.html' },
    { name: 'langchain-ai/langchain', desc: 'Build context-aware reasoning applications with LLMs.', tag: 'AI/ML', tagClass: 'tag-ai', stars: '96.7K', url: 'community-detail.html' },
    { name: 'shadcn-ui/ui', desc: 'Beautifully designed components built with Radix UI and Tailwind CSS.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '81.4K', url: 'community-detail.html' },
    { name: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software.', tag: 'Backend', tagClass: 'tag-backend', stars: '99.8K', url: 'community-detail.html' },
    { name: 'nextjs/next.js', desc: 'The React Framework for the Web. Full-stack web applications.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '128K', url: 'community-detail.html' },
    { name: 'denoland/deno', desc: 'A modern runtime for JavaScript and TypeScript. Secure by default.', tag: 'Backend', tagClass: 'tag-backend', stars: '98.2K', url: 'community-detail.html' },
    { name: 'kubernetes/kubernetes', desc: 'Production-Grade Container Scheduling and Management.', tag: 'DevOps', tagClass: 'tag-devops', stars: '112K', url: 'community-detail.html' },
    { name: 'huggingface/transformers', desc: 'State-of-the-art ML for PyTorch, TensorFlow, and JAX.', tag: 'AI/ML', tagClass: 'tag-ai', stars: '134K', url: 'community-detail.html' },
    { name: 'vercel/next.js', desc: 'The React Framework for the Web — by Vercel.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '128K', url: 'community-detail.html' },
    { name: 'tailwindlabs/tailwindcss', desc: 'A utility-first CSS framework for rapid UI development.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '82.4K', url: 'community-detail.html' },
    { name: 'flutter/flutter', desc: "Google's UI toolkit for building natively compiled applications.", tag: 'Mobile', tagClass: 'tag-mobile', stars: '164K', url: 'community-detail.html' },
    { name: 'pandas-dev/pandas', desc: 'Flexible and powerful data analysis / manipulation library.', tag: 'Data Science', tagClass: 'tag-data', stars: '43.8K', url: 'community-detail.html' },
    { name: 'spring-projects/spring-boot', desc: 'Spring Boot helps you create stand-alone, production-grade apps.', tag: 'Backend', tagClass: 'tag-backend', stars: '74.2K', url: 'community-detail.html' },
    { name: 'mui/material-ui', desc: 'Ready-to-use Material Design components for React.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '95.8K', url: 'community-detail.html' }
  ];

  function SearchOverlay({ open, onClose }) {
    var [query, setQuery] = useState('');
    var [activeIdx, setActiveIdx] = useState(-1);
    var inputRef = useRef(null);

    var results = useMemo(function () {
      var q = query.trim().toLowerCase();
      if (!q) return [];
      return SEARCH_DATA.filter(function (it) {
        return it.name.toLowerCase().indexOf(q) !== -1 ||
               it.desc.toLowerCase().indexOf(q) !== -1 ||
               it.tag.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 6);
    }, [query]);

    // 外部 open prop 变化时聚焦输入框并清空
    useEffect(function () {
      if (open && inputRef.current) {
        setQuery('');
        setActiveIdx(-1);
        setTimeout(function () { inputRef.current.focus(); }, 100);
      }
    }, [open]);

    useEffect(function () {
      function onKey(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          if (!open && onClose) { onClose(); return; }
          if (open && onClose) { onClose(); return; }
          return;
        }
        if (!open) return;
        if (e.key === 'Escape') { if (onClose) onClose(); return; }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIdx(function (i) { return Math.min(i + 1, results.length - 1); });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIdx(function (i) { return Math.max(i - 1, -1); });
        } else if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
          e.preventDefault();
          window.location.href = results[activeIdx].url;
        }
      }
      document.addEventListener('keydown', onKey);
      return function () { document.removeEventListener('keydown', onKey); };
    }, [open, results, activeIdx, onClose]);

    function highlight(name) {
      var q = query.trim();
      if (!q) return name;
      var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return name.replace(re, '<span style="color:var(--gold)">$1</span>');
    }

    return (
      <div className={'search-overlay' + (open ? ' open' : '')} id="searchOverlay">
        <div className="search-overlay-backdrop" id="searchBackdrop"
             onClick={function () { if (onClose) onClose(); }} />
        <div className="search-overlay-container">
          <div className="search-overlay-input-wrap">
            <span className="search-overlay-search-icon">&#x1F50D;&#xFE0E;</span>
            <input type="text" className="search-overlay-input" id="searchOverlayInput"
                   placeholder="Search repos, categories, languages..." autoComplete="off" spellCheck="false"
                   ref={inputRef}
                   onChange={function (e) { setQuery(e.target.value); setActiveIdx(-1); }} />
            <span className="search-overlay-esc">ESC</span>
          </div>
          <div className="search-results" id="searchResults">
            {query.trim() && results.length === 0 ? (
              <div className="search-results-empty">
                <div className="search-results-empty-icon">&#x23F3;</div>
                <div className="search-results-empty-text">No results found</div>
                <div className="search-results-empty-hint">Try a different search term</div>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="search-results-header">
                  <span className="search-results-label">// SEARCH RESULTS</span>
                  <span className="search-results-count">{results.length} of {SEARCH_DATA.length}</span>
                </div>
                {results.map(function (item, idx) {
                  return (
                    <a href={item.url} className={'search-result-item' + (idx === activeIdx ? ' active' : '')}
                       data-index={idx} key={idx}>
                      <div className="search-result-avatar">{item.name.charAt(0).toUpperCase()}</div>
                      <div className="search-result-info">
                        <div className="search-result-name" dangerouslySetInnerHTML={{ __html: highlight(item.name) }} />
                        <div className="search-result-desc">{item.desc}</div>
                      </div>
                      <div className="search-result-meta">
                        <span className="search-result-stars">&#9733; {item.stars}</span>
                        <span className={'search-result-tag ' + item.tagClass}>{item.tag}</span>
                      </div>
                    </a>
                  );
                })}
              </>
            ) : null}
          </div>
          <div className="search-footer-hints">
            <span className="search-hint"><kbd>&uarr;&darr;</kbd> Navigate</span>
            <span className="search-hint"><kbd>&crarr;</kbd> Open</span>
            <span className="search-hint"><kbd>ESC</kbd> Close</span>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     7. 共享组件 —— UserCenterSidebar (用户中心抽屉)
     ═══════════════════════════════════════════════════════════════ */
  function UserCenterSidebar() {
    var [open, setOpen] = useState(false);
    var userAvatar = localStorage.getItem('ghrank_user_avatar') || '../styles/images/demo/prompt_1.jpg';

    useEffect(function () {
      // ESC 关闭
      function onKey(e) { if (e.key === 'Escape') setOpen(false); }
      // 监听 Navbar 头像按钮派发的切换事件，同步 React state
      function onToggle() { setOpen(function (prev) { return !prev; }); }
      document.addEventListener('keydown', onKey);
      window.addEventListener('ghrank:toggle-sidebar', onToggle);
      return function () {
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('ghrank:toggle-sidebar', onToggle);
      };
    }, []);

    function logout() {
      localStorage.removeItem('ghrank_logged_in');
      localStorage.removeItem('ghrank_user_avatar');
      setOpen(false);
      window.location.href = 'login.html';
    }

    return (
      <>
        <div className={'user-sidebar-backdrop' + (open ? ' is-open' : '')} id="userSidebarBackdrop"
             onClick={function () { setOpen(false); }} />
        <aside className={'user-sidebar' + (open ? ' is-open' : '')} id="userSidebar">
          <div className="user-sidebar-header">
            <button className="user-sidebar-close" id="userSidebarClose"
                    onClick={function () { setOpen(false); }}>&times;</button>
            <div className="user-sidebar-profile">
              <div className="user-sidebar-avatar"><img src={userAvatar} alt="" id="sidebarAvatar" /></div>
              <div>
                <div className="user-sidebar-name" id="sidebarUserName">AlexShader</div>
                <div className="user-sidebar-role">Top Seller</div>
              </div>
            </div>
            <div className="user-sidebar-stats">
              <div className="user-sidebar-stat"><div className="user-sidebar-stat-val">142</div><div className="user-sidebar-stat-label">Prompts</div></div>
              <div className="user-sidebar-stat"><div className="user-sidebar-stat-val">2.4K</div><div className="user-sidebar-stat-label">Followers</div></div>
              <div className="user-sidebar-stat"><div className="user-sidebar-stat-val">89</div><div className="user-sidebar-stat-label">Following</div></div>
            </div>
          </div>
          <div className="user-sidebar-body">
            <div className="user-sidebar-section">
              <div className="user-sidebar-section-title">// Account</div>
              <a href="#" className="user-sidebar-nav-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 3-5 6-5s6 2 6 5"/></svg> Profile</a>
              <a href="#" className="user-sidebar-nav-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 2h7l3 3v9H3V2z"/><path d="M10 2v3h3"/></svg> My Prompts</a>
              <a href="#" className="user-sidebar-nav-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg> Purchases</a>
              <a href="#" className="user-sidebar-nav-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="4" width="12" height="9" rx="1"/><path d="M2 7h12"/></svg> Billing</a>
            </div>
            <div className="user-sidebar-section">
              <div className="user-sidebar-section-title">// Notebook</div>
              <div className="user-sidebar-notebook">
                <div className="user-sidebar-notebook-title">Cinematic lighting notes</div>
                <div className="user-sidebar-notebook-preview">--s 750 gives best film stock look for portraits. Combine with --style raw for...</div>
              </div>
              <div className="user-sidebar-notebook">
                <div className="user-sidebar-notebook-title">Color grading refs</div>
                <div className="user-sidebar-notebook-preview">Teal-orange split tone works best. Avoid --q 1 for client work, stick to...</div>
              </div>
            </div>
            <div className="user-sidebar-section">
              <div className="user-sidebar-section-title">// Preferences</div>
              <a href="#" className="user-sidebar-nav-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/></svg> Settings</a>
              <a href="#" className="user-sidebar-nav-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2C5 2 3 4 3 7c0 2 1 3 1 4M8 2c3 0 5 2 5 5 0 2-1 3-1 4M6 11h4M7 13h2"/></svg> Notifications</a>
              <a href="#" className="user-sidebar-nav-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg> History</a>
            </div>
          </div>
          <div className="user-sidebar-footer">
            <button className="user-sidebar-logout" id="userSidebarLogout" onClick={logout}>Sign Out</button>
          </div>
        </aside>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     8. 共享组件 —— SideNav (右侧悬浮导航 + 面板)
     ═══════════════════════════════════════════════════════════════ */
  var SIDE_ICONS = {
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h12v4"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2z"/><circle cx="17" cy="13" r="1.3" fill="currentColor" stroke="none"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h10l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v4h4"/><path d="M8 12h8M8 16h5"/></svg>',
    post: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    top: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    catHot: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1c1 2 3 3 3 6a3 3 0 0 1-6 0c0-1 .5-2 1-2.5C5 6 4 7 4 9a4 4 0 0 0 8 0c0-4-4-5-4-8z"/></svg>',
    catShow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="10"/><path d="M5 6h6M5 9h4"/></svg>',
    catHelp: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.5"/><path d="M6.5 6.5a1.5 1.5 0 0 1 3 0c0 1-.5 1.3-1 1.6-.3.2-.5.4-.5.8v.6"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/></svg>',
    catTutorials: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3l4 5-4 5M8 13h6"/></svg>',
    catDevlogs: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="5 6 8 3 11 6"/><polyline points="5 10 8 13 11 10"/><path d="M8 3v10"/></svg>',
    catOfftopic: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 3h8v10H4z"/><path d="M6 6h4M6 9h4"/></svg>'
  };

  var SIDE_MOCK = {
    alerts: [
      { type: 'tip', user: 'alexshader', avatar: '../styles/images/demo/prompt_1.jpg', action: 'tipped your prompt', target: 'Cinematic Portrait Generator', amount: '50 GHR', time: '2m', read: false },
      { type: 'like', user: 'kairos', avatar: '../styles/images/demo/prompt_2.jpg', action: 'liked your repo analysis', target: 'facebook/react', time: '15m', read: false },
      { type: 'follow', user: 'nova_dev', avatar: '../styles/images/demo/prompt_3.jpg', action: 'started following you', target: '', time: '1h', read: false },
      { type: 'system', user: 'GHRANK', avatar: 'LOGO', action: 'announced a new milestone: 12,847 repos now tracked on the platform', target: '', time: '2h', read: false },
      { type: 'system', user: 'GHRANK', avatar: 'LOGO', action: 'Hackathon 2026 is live — build agent integrations and win from $50K in prizes.', target: '', time: '45m', read: false, image: '../styles/images/demo/prompt_7.jpg', imageAlt: 'GHRANK Hackathon 2026 banner' },
      { type: 'tip', user: 'byteforge', avatar: '../styles/images/demo/prompt_5.jpg', action: 'tipped your prompt', target: 'SEO Blog Writer Pro', amount: '20 GHR', time: '3h', read: true }
    ],
    messages: [
      { user: 'alexshader', avatar: 'A', preview: 'Hey, saw your React analysis — great breakdown of the fiber arch...', time: '5m', read: false },
      { user: 'kairos', avatar: 'K', preview: 'Want to collaborate on the vector DB benchmark project?', time: '32m', read: false },
      { user: 'nova_dev', avatar: 'N', preview: 'The new prompt you published is fire. How did you tune the...', time: '2h', read: false },
      { user: 'pixelwitch', avatar: 'P', preview: 'Thanks for the tip on SSR caching! Saved my deploy.', time: '6h', read: true },
      { user: 'byteforge', avatar: 'B', preview: 'Are you joining the community hackathon next week?', time: '1d', read: true }
    ],
    wallet: {
      balance: '1,247.50', currency: 'GHR', pending: '+32.00',
      transactions: [
        { type: 'in', label: 'Prompt tip from alexshader', amount: '+50.00', time: '2m ago' },
        { type: 'in', label: 'Prompt tip from byteforge', amount: '+20.00', time: '3h ago' },
        { type: 'out', label: 'Tipped nova_dev prompt', amount: '-15.00', time: '1d ago' },
        { type: 'in', label: 'Weekly creator bonus', amount: '+120.00', time: '2d ago' }
      ]
    },
    categories: [
      { name: 'Hot Topics', icon: 'catHot', desc: 'Trending discussions', count: '342' },
      { name: 'Show & Tell', icon: 'catShow', desc: 'Show off your builds', count: '187' },
      { name: 'Help & Q&A', icon: 'catHelp', desc: 'Get answers fast', count: '894' },
      { name: 'Tutorials', icon: 'catTutorials', desc: 'Share your knowledge', count: '256' },
      { name: 'Dev Logs', icon: 'catDevlogs', desc: 'Build-in-progress updates', count: '143' },
      { name: 'Off-Topic', icon: 'catOfftopic', desc: 'Casual conversation', count: '520' }
    ]
  };

  var SIDE_NAV_ITEMS = [
    { id: 'alert', label: 'Alerts', icon: SIDE_ICONS.alert, badge: 3 },
    { id: 'mail', label: 'Messages', icon: SIDE_ICONS.mail, badge: 3 },
    { id: 'wallet', label: 'Wallet', icon: SIDE_ICONS.wallet },
    { id: 'note', label: 'Notes', icon: SIDE_ICONS.note, href: 'prompt.html' },
    { id: 'post', label: 'New Post', icon: SIDE_ICONS.post },
    { id: 'gear', label: 'Settings', icon: SIDE_ICONS.gear, href: 'about.html' }
  ];

  function SideNav() {
    var [visible, setVisible] = useState(false);
    var [activePanel, setActivePanel] = useState(null);
    var [badges, setBadges] = useState({ alert: 3, mail: 3 });
    var walletNumRef = useRef(null);

    // 滚动显示
    useEffect(function () {
      function onScroll() {
        var s = window.pageYOffset || document.documentElement.scrollTop;
        setVisible(s > 120);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return function () { window.removeEventListener('scroll', onScroll); };
    }, []);

    // wallet 数字滚动
    useEffect(function () {
      if (activePanel === 'wallet' && walletNumRef.current) {
        var el = walletNumRef.current;
        var target = parseFloat(el.getAttribute('data-count'));
        if (isNaN(target)) return;
        var dur = 900, start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, [activePanel]);

    // ESC 关闭
    useEffect(function () {
      function onKey(e) { if (e.key === 'Escape') setActivePanel(null); }
      document.addEventListener('keydown', onKey);
      return function () { document.removeEventListener('keydown', onKey); };
    }, []);

    function openPanel(id) {
      setActivePanel(function (cur) { return cur === id ? null : id; });
      // 清除 badge
      if (id === 'alert' || id === 'mail') {
        setBadges(function (b) { var n = Object.assign({}, b); n[id] = 0; return n; });
      }
    }

    function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

    function alertItemHtml(a) {
      var amt = a.amount ? '<span class="gh-evt-amount">' + a.amount + '</span>' : '';
      var tgt = a.target ? '<span class="gh-evt-target">' + a.target + '</span>' : '';
      var avatarHtml = (a.type === 'system' || a.avatar === 'LOGO')
        ? '<div class="gh-evt-avatar gh-evt-avatar-system"><div class="logo-hex">G</div></div>'
        : '<div class="gh-evt-avatar"><img src="' + a.avatar + '" alt="" loading="lazy"></div>';
      var userName = a.type === 'system' ? a.user : '@' + a.user;
      var dot = a.read ? '' : '<div class="gh-evt-icon" aria-label="unread"></div>';
      // 带图片的系统消息：在正文下方插入缩略图
      var imageHtml = a.image
        ? '<div class="gh-evt-image"><img src="' + a.image + '" alt="' + (a.imageAlt || '') + '" loading="lazy"></div>'
        : '';
      return '<div class="gh-evt' + (a.read ? '' : ' is-unread') + '">' + avatarHtml +
             '<div class="gh-evt-main"><div class="gh-evt-top"><span class="gh-evt-user' +
             (a.type === 'system' ? ' gh-evt-user-system' : '') + '">' + userName +
             '</span><span class="gh-evt-time">' + a.time + ' ago</span></div>' +
             '<div class="gh-evt-action">' + a.action + '</div>' +
             (tgt || amt ? '<div class="gh-evt-meta">' + tgt + amt + '</div>' : '') +
             imageHtml +
             '</div>' + dot + '</div>';
    }

    function msgItemHtml(m) {
      var dot = m.read ? '' : '<div class="gh-msg-dot" aria-label="unread"></div>';
      return '<div class="gh-msg' + (m.read ? '' : ' is-unread') + '">' +
             '<div class="gh-msg-avatar">' + m.avatar + '</div>' +
             '<div class="gh-msg-main"><div class="gh-msg-top"><span class="gh-msg-user">@' + m.user +
             '</span><span class="gh-msg-time">' + m.time + '</span></div>' +
             '<div class="gh-msg-preview">' + m.preview + '</div>' + dot + '</div></div>';
    }

    function renderNav() {
      return SIDE_NAV_ITEMS.map(function (item, i) {
        var badge = badges[item.id];
        var badgeEl = badge ? <span className={'gh-side-nav-badge' + (badge >= 3 ? ' is-pulse' : '')}>{badge}</span> : null;
        var cls = 'gh-side-nav-item' + (activePanel === item.id ? ' is-panel-open' : '');
        if (item.href) {
          return (
            <a className={cls} data-nav={item.id} href={item.href} aria-label={item.label} key={item.id}
               dangerouslySetInnerHTML={{ __html: item.icon }} />
          );
        }
        return (
          <button className={cls} data-nav={item.id} type="button" aria-label={item.label} key={item.id}
                  onClick={function () { openPanel(item.id); }}>
            <span dangerouslySetInnerHTML={{ __html: item.icon }} />
            {badgeEl}
          </button>
        );
      });
    }

    return (
      <>
        <div className={'gh-side-nav' + (visible ? ' is-ready' : ' is-hidden')} id="ghSideNav" role="navigation" aria-label="Side navigation">
          {renderNav()}
          <div className="gh-side-nav-divider"></div>
          <button type="button" className="gh-side-nav-item gh-side-nav-top" id="ghSideNavTop" aria-label="Back to top"
                  onClick={scrollToTop}>
            <span dangerouslySetInnerHTML={{ __html: SIDE_ICONS.top }} />
          </button>
        </div>

        <div className="gh-side-panels" id="ghSidePanels">
          {/* Alerts Panel */}
          <div className={'gh-side-panel' + (activePanel === 'alert' ? ' is-open' : '')} data-panel="alert" role="dialog" aria-label="Notifications">
            <div className="gh-side-panel-header">
              <span className="gh-side-panel-title">Notifications</span>
              <button type="button" className="gh-side-panel-close" aria-label="Close"
                      onClick={function () { setActivePanel(null); }}
                      dangerouslySetInnerHTML={{ __html: SIDE_ICONS.close }} />
            </div>
            <div className="gh-side-panel-body" dangerouslySetInnerHTML={{ __html: SIDE_MOCK.alerts.map(alertItemHtml).join('') }} />
          </div>

          {/* Messages Panel */}
          <div className={'gh-side-panel' + (activePanel === 'mail' ? ' is-open' : '')} data-panel="mail" role="dialog" aria-label="Messages">
            <div className="gh-side-panel-header">
              <span className="gh-side-panel-title">Messages</span>
              <button type="button" className="gh-side-panel-close" aria-label="Close"
                      onClick={function () { setActivePanel(null); }}
                      dangerouslySetInnerHTML={{ __html: SIDE_ICONS.close }} />
            </div>
            <div className="gh-side-panel-body" dangerouslySetInnerHTML={{ __html: SIDE_MOCK.messages.map(msgItemHtml).join('') }} />
          </div>

          {/* Wallet Panel */}
          <div className={'gh-side-panel' + (activePanel === 'wallet' ? ' is-open' : '')} data-panel="wallet" role="dialog" aria-label="Wallet">
            <div className="gh-side-panel-header">
              <span className="gh-side-panel-title">Wallet</span>
              <button type="button" className="gh-side-panel-close" aria-label="Close"
                      onClick={function () { setActivePanel(null); }}
                      dangerouslySetInnerHTML={{ __html: SIDE_ICONS.close }} />
            </div>
            <div className="gh-side-panel-body">
              <div className="gh-wallet-balance">
                <div className="gh-wallet-label">Available Balance</div>
                <div className="gh-wallet-amount">
                  <span className="gh-wallet-num" data-count={parseFloat(SIDE_MOCK.wallet.balance.replace(/,/g, ''))} ref={walletNumRef}>0.00</span>
                  <span className="gh-wallet-cur">{SIDE_MOCK.wallet.currency}</span>
                </div>
                <div className="gh-wallet-pending">{SIDE_MOCK.wallet.pending} {SIDE_MOCK.wallet.currency} pending</div>
              </div>
              <div className="gh-wallet-actions">
                <button className="gh-wallet-btn">Deposit</button>
                <button className="gh-wallet-btn">Withdraw</button>
              </div>
              <div className="gh-wallet-section-title">Recent Activity</div>
              <div className="gh-tx-list">
                {SIDE_MOCK.wallet.transactions.map(function (t, i) {
                  return (
                    <div className="gh-tx" key={i}>
                      <div className="gh-tx-info">
                        <span className="gh-tx-label">{t.label}</span>
                        <span className="gh-tx-time">{t.time}</span>
                      </div>
                      <span className={'gh-tx-amount gh-tx-' + t.type}>{t.amount} {SIDE_MOCK.wallet.currency}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* New Post Panel */}
          <div className={'gh-side-panel' + (activePanel === 'post' ? ' is-open' : '')} data-panel="post" role="dialog" aria-label="New Post — Choose Category">
            <div className="gh-side-panel-header">
              <span className="gh-side-panel-title">New Post — Choose Category</span>
              <button type="button" className="gh-side-panel-close" aria-label="Close"
                      onClick={function () { setActivePanel(null); }}
                      dangerouslySetInnerHTML={{ __html: SIDE_ICONS.close }} />
            </div>
            <div className="gh-side-panel-body">
              {SIDE_MOCK.categories.map(function (c, i) {
                return (
                  <a href={'community-new.html?cat=' + encodeURIComponent(c.name)} className="gh-cat" key={i}>
                    <span className="gh-cat-icon" dangerouslySetInnerHTML={{ __html: SIDE_ICONS[c.icon] || SIDE_ICONS.catHot }} />
                    <span className="gh-cat-info">
                      <span className="gh-cat-name">{c.name}</span>
                      <span className="gh-cat-desc">{c.desc}</span>
                    </span>
                    <span className="gh-cat-count">{c.count}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className={'gh-side-backdrop' + (activePanel ? ' is-open' : '')} id="ghSideBackdrop"
               onClick={function () { setActivePanel(null); }} />
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     9. 副作用 Hook —— 懒加载骨架 + 头像解析 + 滚动显隐
     ═══════════════════════════════════════════════════════════════ */
  function useLazyLoadAndAvatars() {
    useEffect(function () {
      var AVATAR_SELECTORS = ['avatar', 'avatar-img', 'thread-avatar-img', 'detail-avatar-img', 'compose-avatar-img', 'prompt-card-avatar-img'];
      function isAvatar(img) {
        var cls = (img.className || '').toLowerCase();
        if (AVATAR_SELECTORS.some(function (s) { return cls.indexOf(s) !== -1; })) return true;
        var parent = img.parentElement;
        if (parent && (parent.className || '').toLowerCase().indexOf('avatar') !== -1) return true;
        return false;
      }
      function avatarShape(img) {
        var parent = img.parentElement;
        if (!parent) return 'round';
        var cls = parent.className.toLowerCase();
        var hexAvatars = ['card-avatar', 'dossier-avatar', 'contributor-avatar', 'profile-hero-avatar', 'profile-activity-avatar', 'skills-detail-creator-avatar', 'thread-avatar', 'compose-avatar', 'sr-card-avatar', 'search-result-avatar'];
        for (var i = 0; i < hexAvatars.length; i++) { if (cls.indexOf(hexAvatars[i]) !== -1) return 'hex'; }
        return 'round';
      }

      function processImages() {
        // 排除页眉用户头像 nav-avatar-img，避免懒加载骨架包裹
        var allImgs = document.querySelectorAll('img:not([data-lazy]):not(.nav-avatar-img)');
        allImgs.forEach(function (img) {
          var src = img.getAttribute('src') || '';
          if (!src) return;
          img.setAttribute('data-lazy', src);
          img.removeAttribute('src');
          img.classList.add('lazy-loading');

          var av = isAvatar(img);
          var shape = av ? avatarShape(img) : null;
          var wrap = document.createElement('span');
          var wrapClass = 'lazy-wrap';
          if (av) { wrapClass += ' lazy-avatar'; if (shape === 'hex') wrapClass += ' lazy-avatar-hex'; }
          wrap.className = wrapClass;

          var skeleton = document.createElement('span');
          skeleton.className = 'lazy-skeleton';
          var cornerTL = document.createElement('span'); cornerTL.className = 'lazy-corner lazy-corner-tl'; skeleton.appendChild(cornerTL);
          var cornerBR = document.createElement('span'); cornerBR.className = 'lazy-corner lazy-corner-br'; skeleton.appendChild(cornerBR);
          var dots = document.createElement('span'); dots.className = 'lazy-dots';
          for (var i = 0; i < 3; i++) dots.appendChild(document.createElement('span'));
          skeleton.appendChild(dots);

          img.parentNode.insertBefore(wrap, img);
          wrap.appendChild(img);
          wrap.appendChild(skeleton);

          var safetyTimer;
          function finishLoad(el, w) {
            clearTimeout(safetyTimer);
            el.classList.add('lazy-loaded');
            el.classList.remove('lazy-loading');
            var reveal = document.createElement('span'); reveal.className = 'lazy-reveal'; w.appendChild(reveal);
            setTimeout(function () { var sk = w.querySelector('.lazy-skeleton'); if (sk) sk.remove(); setTimeout(function () { var r = w.querySelector('.lazy-reveal'); if (r) r.remove(); }, 400); }, 280);
          }
          img.onload = function () { finishLoad(img, wrap); };
          img.onerror = function () { finishLoad(img, wrap); };
          safetyTimer = setTimeout(function () { finishLoad(img, wrap); }, 600);
          img.setAttribute('src', src);
        });
      }

      function resolveAvatar(el, username) {
        if (!el || !username || el._avatarResolved) return;
        el._avatarResolved = true;
        var fallbackText = el.textContent.trim();
        el.classList.add('avatar-loading');
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.alt = username;
        img.onerror = function () { el.classList.remove('avatar-loading'); el.textContent = fallbackText; };
        img.onload = function () {
          el.textContent = '';
          el.style.backgroundImage = 'url(' + img.src + ')';
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          el.classList.remove('avatar-loading');
          el.classList.add('avatar-has-img', 'avatar-fade-in');
          setTimeout(function () { el.classList.remove('avatar-fade-in'); }, 650);
        };
        img.src = 'https://avatars.githubusercontent.com/' + encodeURIComponent(username) + '?v=4&s=88';
      }

      function resolveAllAvatars() {
        document.querySelectorAll('.card').forEach(function (card) {
          var avatarEl = card.querySelector('.card-avatar');
          var repoEl = card.querySelector('.card-repo');
          if (avatarEl && repoEl) resolveAvatar(avatarEl, repoEl.textContent.trim().split('/')[0]);
        });
        var dossierAvatar = document.querySelector('.dossier-avatar');
        var dossierRepo = document.querySelector('.dossier-repo-name');
        if (dossierAvatar && dossierRepo) resolveAvatar(dossierAvatar, dossierRepo.textContent.trim().split('/')[0]);
        document.querySelectorAll('.contributor-item').forEach(function (item) {
          var a = item.querySelector('.contributor-avatar');
          var h = item.querySelector('.contributor-handle');
          if (a && h) resolveAvatar(a, h.textContent.trim().replace('@', ''));
        });
        var creatorAvatar = document.querySelector('.skills-detail-creator-avatar');
        var creatorName = document.querySelector('.skills-detail-creator-name');
        if (creatorAvatar && creatorName) resolveAvatar(creatorAvatar, creatorName.textContent.trim());
      }

      function setupLazyObserver() {
        if (!('IntersectionObserver' in window)) return;
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) e.target.classList.remove('lazy-hidden');
            else e.target.classList.add('lazy-hidden');
          });
        }, { rootMargin: '100px 0px 100px 0px' });
        document.querySelectorAll('.card, .thread, .prompt-card').forEach(function (el) { obs.observe(el); });
      }

      // 运行
      processImages();
      resolveAllAvatars();
      setupLazyObserver();
    }, []);
  }

  /* ═══════════════════════════════════════════════════════════════
     10. ChromeHost 组件 —— 协调多个共享组件的根
     采用"多挂载点"模式：HTML 保留页面静态主体，React 只接管 chrome 区域
     各组件挂载到 HTML 中预置的占位容器（chrome-* / overlay-root）

     支持传入页面主体组件 (PageBody)：
     - GHRANK.mountChrome()           — 仅挂载 chrome 层
     - GHRANK.mountChrome(null, Body)  — chrome + 页面主体组件
     页面主体通过 portal 渲染到 #chrome-body（若存在）
     ═══════════════════════════════════════════════════════════════ */
  function ChromeHost({ page, pageBody: PageBody }) {
    var config = getConfig(page);
    var [searchOpen, setSearchOpen] = useState(false);

    // 共享副作用：懒加载骨架 + 头像解析 + 滚动显隐
    useLazyLoadAndAvatars();

    function openSearch() {
      setSearchOpen(true);
    }

    // 缓存 DOM 容器引用，避免每次渲染重复查询；React #299 要求 portal 容器不能为 null
    var tickerEl   = document.getElementById('chrome-ticker');
    var navbarEl   = document.getElementById('chrome-navbar');
    var footerEl   = document.getElementById('chrome-footer');
    var overlayEl  = document.getElementById('overlay-root');
    var bodyEl     = document.getElementById('chrome-body');

    return (
      <>
        {tickerEl && ReactDOM.createPortal(
          <Ticker config={config} />,
          tickerEl
        )}
        {navbarEl && ReactDOM.createPortal(
          <Navbar config={config} currentPage={page} onOpenSearch={openSearch} />,
          navbarEl
        )}
        {footerEl && ReactDOM.createPortal(
          <Footer config={config} />,
          footerEl
        )}
        {overlayEl && ReactDOM.createPortal(
          <SearchOverlay open={searchOpen} onClose={function () { setSearchOpen(false); }} />,
          overlayEl
        )}
        {overlayEl && ReactDOM.createPortal(
          <UserCenterSidebar />,
          overlayEl
        )}
        {overlayEl && ReactDOM.createPortal(
          <SideNav />,
          overlayEl
        )}
        {PageBody && bodyEl && ReactDOM.createPortal(
          <PageBody />,
          bodyEl
        )}
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     11. 挂载入口 —— GHRANK.mountChrome(pageName?, PageBody?)
     HTML 页面调用：GHRANK.mountChrome() 自动检测页面名
     或显式传入：GHRANK.mountChrome('login', LoginPage)
     第二个参数为可选的页面主体 React 组件
     ═══════════════════════════════════════════════════════════════ */
  function mountChrome(pageName, pageBody) {
    var page = pageName || detectPage();
    var rootEl = document.getElementById('chrome-root');
    if (!rootEl) {
      console.error('[GHRANK] #chrome-root mount point not found');
      return;
    }
    var root = createRoot(rootEl);
    root.render(<ChromeHost page={page} pageBody={pageBody} />);
  }

  /* ═══════════════════════════════════════════════════════════════
     12. 导出
     ═══════════════════════════════════════════════════════════════ */
  global.GHRANK = {
    React: React,
    mountChrome: mountChrome,
    ChromeHost: ChromeHost,
    Ticker: Ticker,
    Navbar: Navbar,
    Footer: Footer,
    SearchOverlay: SearchOverlay,
    UserCenterSidebar: UserCenterSidebar,
    SideNav: SideNav,
    detectPage: detectPage,
    getConfig: getConfig,
    PAGE_CONFIG: PAGE_CONFIG
  };
})(window);
