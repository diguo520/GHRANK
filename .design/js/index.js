/* ===== INDEX PAGE — React 19 组件：入场动画 / 打字机 / 卡片交互 / 过滤 / 无限滚动 =====
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   加载方式：HTML 页面通过 <script type="text/babel" src="../js/index.js"> 引入
            （index.html 需将 <script src="../js/index.js"> 改为 text/babel）

   职责：管理首页静态内容的动画时序、交互逻辑与动态功能。
   注意：页面静态结构已由 index.html 提供，本组件不重复渲染内容，
        仅通过 useEffect 绑定到已有 DOM 元素控制动画与交互。
   ═════════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useCallback, useRef } = React;

  /* ═══════════════════════════════════════════════════════════════
     静态数据 —— 分类排行（组件外部，避免每次渲染重新创建）
     ═══════════════════════════════════════════════════════════════ */
  var categoryRankData = {
    'all': {
      name: 'All Projects',
      total: '12,847',
      items: [
        { name: 'facebook/react', count: 230412 },
        { name: 'nextjs/next.js', count: 128000 },
        { name: 'rust-lang/rust', count: 99800 },
        { name: 'langchain-ai/langchain', count: 96700 },
        { name: 'denoland/deno', count: 98200 },
        { name: 'torvalds/linux', count: 182000 },
        { name: 'godotengine/godot', count: 95300 },
        { name: 'tiangolo/fastapi', count: 82100 }
      ]
    },
    'ai-ml': {
      name: 'AI / ML',
      total: '2,341',
      items: [
        { name: 'langchain-ai/langchain', count: 96700 },
        { name: 'openai/whisper', count: 72800 },
        { name: 'huggingface/transformers', count: 134200 },
        { name: 'AUTOMATIC1111/stable-diffusion', count: 67200 },
        { name: 'oobabooga/text-gen', count: 38400 },
        { name: 'microsoft/semantic-kernel', count: 22100 },
        { name: 'vllm-project/vllm', count: 31800 }
      ]
    },
    'tools': {
      name: 'Tools',
      total: '1,876',
      items: [
        { name: 'tiangolo/fastapi', count: 82100 },
        { name: 'denoland/deno', count: 98200 },
        { name: 'BurntSushi/ripgrep', count: 48600 },
        { name: 'sharkdp/fd', count: 38200 },
        { name: 'ajeetdsouza/zoxide', count: 21400 },
        { name: 'sdwendler/texlab', count: 15800 }
      ]
    },
    'games': {
      name: 'Games',
      total: '942',
      items: [
        { name: 'godotengine/godot', count: 95300 },
        { name: 'bevyengine/bevy', count: 36800 },
        { name: 'libsdl-org/SDL', count: 11200 },
        { name: 'raylib-raycast/raylib', count: 21400 },
        { name: 'love2d/love', count: 4800 },
        { name: 'pygame-ce/pygame', count: 8900 }
      ]
    },
    'frontend': {
      name: 'Frontend',
      total: '2,108',
      items: [
        { name: 'facebook/react', count: 230412 },
        { name: 'nextjs/next.js', count: 128000 },
        { name: 'vuejs/core', count: 48200 },
        { name: 'shadcn-ui/ui', count: 81400 },
        { name: 'sveltejs/svelte', count: 78900 },
        { name: 'solidjs/solid', count: 32400 },
        { name: 'angular/angular', count: 97200 }
      ]
    },
    'devops': {
      name: 'DevOps',
      total: '1,523',
      items: [
        { name: 'docker/engine', count: 69400 },
        { name: 'kubernetes/kubernetes', count: 112000 },
        { name: 'hashicorp/terraform', count: 43800 },
        { name: 'ansible/ansible', count: 62500 },
        { name: 'grafana/grafana', count: 64400 },
        { name: 'prometheus/prometheus', count: 56200 }
      ]
    },
    'data': {
      name: 'Data Science',
      total: '1,287',
      items: [
        { name: 'pandas-dev/pandas', count: 43800 },
        { name: 'numpy/numpy', count: 27800 },
        { name: 'scikit-learn/scikit-learn', count: 61200 },
        { name: 'apache/spark', count: 39400 },
        { name: 'jupyter/jupyter', count: 12800 },
        { name: 'dmlc/xgboost', count: 27200 }
      ]
    },
    'security': {
      name: 'Security',
      total: '764',
      items: [
        { name: 'OWASP/owasp-top-10', count: 8400 },
        { name: 'trailofbits/pip-audit', count: 4200 },
        { name: 'projectdiscovery/nuclei', count: 18900 },
        { name: 'Lyken/py-cid', count: 12300 },
        { name: 'sigmaHQ/sigma', count: 8200 }
      ]
    },
    'mobile': {
      name: 'Mobile',
      total: '1,105',
      items: [
        { name: 'facebook/react-native', count: 118000 },
        { name: 'flutter/flutter', count: 164000 },
        { name: 'expo/expo', count: 34200 },
        { name: 'ionic-team/ionic-framework', count: 49800 },
        { name: 'NativeScript/NativeScript', count: 22800 }
      ]
    },
    'design': {
      name: 'Design',
      total: '638',
      items: [
        { name: 'shadcn-ui/ui', count: 81400 },
        { name: 'vercel/next.js', count: 128000 },
        { name: 'tailwindlabs/tailwindcss', count: 82400 },
        { name: 'chakra-ui/chakra-ui', count: 38200 },
        { name: 'mui/material-ui', count: 95800 }
      ]
    },
    'backend': {
      name: 'Backend',
      total: '1,942',
      items: [
        { name: 'torvalds/linux', count: 182000 },
        { name: 'rust-lang/rust', count: 99800 },
        { name: 'tiangolo/fastapi', count: 82100 },
        { name: 'denoland/deno', count: 98200 },
        { name: 'django/django', count: 78400 },
        { name: 'spring-projects/spring-boot', count: 74200 },
        { name: 'golang/go', count: 123400 }
      ]
    }
  };

  /* ── 无限滚动额外卡片数据（组件外部）── */
var INITIAL_CARDS = [
      {rank:1, rankClass:'gold', avatar:`<img src="https://avatars.githubusercontent.com/facebook?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'facebook/react', desc:'The library for web and native user interfaces. A declarative, efficient, and flexible JavaScript library for building user interfaces.', stars:'230K', forks:'46.8K', lang:'JS', langColor:'#f1e05a', growth:'+8.2%', sparkPts:'0,12 8,10 16,11 24,7 32,8 40,4 48,3', time:'Updated 1h ago', updated:'day', likes:2347},
      {rank:2, rankClass:'silver', avatar:`<img src="https://avatars.githubusercontent.com/torvalds?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', repo:'torvalds/linux', desc:'Linux kernel source tree. The core of the Linux operating system, maintained by Linus Torvalds and contributors worldwide.', stars:'182K', forks:'38.2K', lang:'C', langColor:'#555555', growth:'+3.1%', sparkPts:'0,8 8,9 16,7 24,10 32,9 40,8 48,7', time:'Updated 2h ago', updated:'day', likes:1892},
      {rank:3, rankClass:'bronze', avatar:`<img src="https://avatars.githubusercontent.com/vuejs?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'vuejs/core', desc:'The Progressive JavaScript Framework. An approachable, performant and versatile framework for building web user interfaces.', stars:'48.2K', forks:'9.8K', lang:'TS', langColor:'#3178c6', growth:'+12.7%', sparkPts:'0,13 8,11 16,9 24,7 32,5 40,3 48,2', time:'Updated 3h ago', updated:'day', likes:856},
      {rank:4, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/openai?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'openai/whisper', desc:'Robust Speech Recognition via Large-Scale Weak Supervision. General-purpose speech recognition model by OpenAI.', stars:'72.8K', forks:'8.4K', lang:'Py', langColor:'#3572A5', growth:'+15.3%', sparkPts:'0,14 8,12 16,10 24,8 32,5 40,4 48,2', time:'Updated 4h ago', updated:'week', likes:623},
      {rank:5, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/docker?v=4&s=88" alt="" />`, category:'devops', tag:'DevOps', tagClass:'tag-devops', repo:'docker/engine', desc:'Docker Engine is an open source containerization technology for building and containerizing applications.', stars:'69.4K', forks:'18.9K', lang:'Go', langColor:'#00ADD8', growth:'+5.6%', sparkPts:'0,10 8,9 16,10 24,8 32,7 40,6 48,5', time:'Updated 5h ago', updated:'month', likes:445},
      {rank:6, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/godotengine?v=4&s=88" alt="" />`, category:'games', tag:'Games', tagClass:'tag-games', repo:'godotengine/godot', desc:'Godot Engine - Multi-platform 2D and 3D game engine. Free, open-source, and community-driven game development platform.', stars:'95.3K', forks:'21.4K', lang:'GDScript', langColor:'#478CBF', growth:'+9.4%', sparkPts:'0,12 8,10 16,11 24,8 32,6 40,5 48,3', time:'Updated 6h ago', updated:'week', likes:1123},
      {rank:7, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/tiangolo?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', tag2:'Tools', tagClass2:'tag-tools', repo:'tiangolo/fastapi', desc:'FastAPI framework, high performance, easy to learn, fast to code, ready for production. Modern Python web framework.', stars:'82.1K', forks:'6.7K', lang:'Py', langColor:'#3572A5', growth:'+7.8%', sparkPts:'0,10 8,9 16,8 24,9 32,7 40,6 48,5', time:'Updated 7h ago', updated:'year', likes:734},
      {rank:8, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/langchain-ai?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'langchain-ai/langchain', desc:'Build context-aware reasoning applications. Framework for developing applications powered by language models.', stars:'96.7K', forks:'14.2K', lang:'Py', langColor:'#3572A5', growth:'+18.1%', sparkPts:'0,14 8,12 16,10 24,7 32,5 40,3 48,1', time:'Updated 8h ago', updated:'month', likes:967},
      {rank:9, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/shadcn-ui?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', tag2:'Design', tagClass2:'tag-design', repo:'shadcn-ui/ui', desc:'Beautifully designed components built with Radix UI and Tailwind CSS. Accessible, customizable, and open source.', stars:'81.4K', forks:'4.6K', lang:'TS', langColor:'#3178c6', growth:'+22.4%', sparkPts:'0,15 8,13 16,10 24,8 32,5 40,3 48,1', time:'Updated 9h ago', updated:'week', likes:1456},
      {rank:10, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/rust-lang?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', repo:'rust-lang/rust', desc:'Empowering everyone to build reliable and efficient software. A language empowering everyone to build reliable software.', stars:'99.8K', forks:'16.1K', lang:'Rust', langColor:'#dea584', growth:'+6.3%', sparkPts:'0,10 8,9 16,11 24,9 32,8 40,7 48,6', time:'Updated 10h ago', updated:'month', likes:1567},
      {rank:11, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/vercel?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'nextjs/next.js', desc:'The React Framework for the Web. Used by some of the world\'s largest companies, Next.js enables you to create full-stack web applications.', stars:'128K', forks:'27.3K', lang:'TS', langColor:'#3178c6', growth:'+11.6%', sparkPts:'0,12 8,10 16,9 24,8 32,6 40,5 48,3', time:'Updated 11h ago', updated:'month', likes:1834},
      {rank:12, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/denoland?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', tag2:'Tools', tagClass2:'tag-tools', repo:'denoland/deno', desc:'A modern runtime for JavaScript and TypeScript. Secure by default, with built-in tooling for a better developer experience.', stars:'98.2K', forks:'5.4K', lang:'Rust', langColor:'#dea584', growth:'+14.2%', sparkPts:'0,13 8,11 16,9 24,7 32,5 40,4 48,2', time:'Updated 12h ago', updated:'year', likes:378},
      {rank:13, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/ollama?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'ollama/ollama', desc:'Get up and running with Llama 3 and other large language models locally. Lightweight and extensible.', stars:'98.5K', forks:'7.2K', lang:'Go', langColor:'#00ADD8', growth:'+28.4%', sparkPts:'0,14 8,12 16,10 24,8 32,6 40,4 48,2', time:'Updated 13h ago', updated:'day', likes:1456},
      {rank:14, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/pnpm?v=4&s=88" alt="" />`, category:'tools', tag:'Tools', tagClass:'tag-tools', repo:'pnpm/pnpm', desc:'Fast, disk space efficient package manager. Strict, deterministic, and monorepo support out of the box.', stars:'32.8K', forks:'1.1K', lang:'TS', langColor:'#3178C6', growth:'+9.7%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,1', time:'Updated 14h ago', updated:'day', likes:567},
      {rank:15, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/vercel?v=4&s=88" alt="" />`, category:'devops', tag:'DevOps', tagClass:'tag-devops', repo:'vercel/turborepo', desc:'High-performance build system for JavaScript and TypeScript monorepos. Remote caching and parallel execution.', stars:'26.4K', forks:'1.8K', lang:'TS', langColor:'#3178C6', growth:'+16.3%', sparkPts:'0,14 8,12 16,11 24,9 32,7 40,5 48,3', time:'Updated 15h ago', updated:'day', likes:423},
      {rank:16, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/expressjs?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', repo:'expressjs/express', desc:'Fast, unopinionated, minimalist web framework for Node.js. The most popular Node.js web framework.', stars:'65.2K', forks:'16.1K', lang:'JS', langColor:'#f1e05a', growth:'+4.2%', sparkPts:'0,11 8,10 16,8 24,7 32,5 40,3 48,1', time:'Updated 16h ago', updated:'day', likes:834},
      {rank:17, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/love2d?v=4&s=88" alt="" />`, category:'games', tag:'Games', tagClass:'tag-games', repo:'love2d/love', desc:'LÖVE is an awesome 2D game framework for Lua. Free, open source, and easy to get started making games.', stars:'4.8K', forks:'621', lang:'Lua', langColor:'#000080', growth:'+6.3%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,1', time:'Updated 17h ago', updated:'week', likes:234},
      {rank:18, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/linuxkit?v=4&s=88" alt="" />`, category:'devops', tag:'DevOps', tagClass:'tag-devops', repo:'moby/moby', desc:'Moby Project - a collaborative project for the container ecosystem. The open-source base for Docker products.', stars:'68.6K', forks:'18.9K', lang:'Go', langColor:'#00ADD8', growth:'+3.4%', sparkPts:'0,12 8,11 16,10 24,8 32,6 40,4 48,1', time:'Updated 18h ago', updated:'month', likes:567},
      {rank:19, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/pytorch?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'pytorch/pytorch', desc:'Tensors and Dynamic neural networks in Python with strong GPU acceleration. Flexible deep learning framework.', stars:'84K', forks:'22K', lang:'Python', langColor:'#3572A5', growth:'+8.7%', sparkPts:'0,14 8,12 16,11 24,9 32,7 40,5 48,2', time:'Updated 19h ago', updated:'day', likes:1234},
      {rank:20, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/huggingface?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'huggingface/transformers', desc:'State-of-the-art NLP for PyTorch, TensorFlow, and JAX. Thousands of pretrained models for text, vision, and audio.', stars:'134K', forks:'27.5K', lang:'Python', langColor:'#3572A5', growth:'+18.6%', sparkPts:'0,13 8,12 16,10 24,8 32,6 40,4 48,1', time:'Updated 20h ago', updated:'day', likes:0},
      {rank:21, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/nuxt?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'nuxt/nuxt', desc:'The Intuitive Vue Framework. Build your next Vue.js application with confidence using Nuxt.', stars:'56.3K', forks:'6.4K', lang:'TS', langColor:'#3178C6', growth:'+12.8%', sparkPts:'0,12 8,10 16,9 24,8 32,6 40,4 48,2', time:'Updated 21h ago', updated:'week', likes:678},
      {rank:22, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/sveltejs?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'sveltejs/svelte', desc:'Cybernetically enhanced web apps. A radical new approach to building user interfaces.', stars:'82.4K', forks:'4.3K', lang:'JS', langColor:'#f1e05a', growth:'+6.8%', sparkPts:'0,12 8,10 16,9 24,8 32,6 40,4 48,2', time:'Updated 22h ago', updated:'day', likes:589},
      {rank:23, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/kubernetes?v=4&s=88" alt="" />`, category:'devops', tag:'DevOps', tagClass:'tag-devops', repo:'kubernetes/kubernetes', desc:'Production-grade container orchestration. Automate deployment, scaling, and management of containerized applications.', stars:'112K', forks:'39.2K', lang:'Go', langColor:'#F18E33', growth:'+5.2%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,2', time:'Updated 23h ago', updated:'day', likes:0},
      {rank:24, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/facebook?v=4&s=88" alt="" />`, category:'mobile', tag:'Mobile', tagClass:'tag-mobile', repo:'facebook/react-native', desc:'A framework for building native apps with React. Write once, run on iOS, Android, and beyond.', stars:'118K', forks:'24.1K', lang:'TS', langColor:'#3178C6', growth:'+3.4%', sparkPts:'0,12 8,11 16,9 24,7 32,5 40,3 48,1', time:'Updated 24h ago', updated:'week', likes:876},
      {rank:25, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/flutter?v=4&s=88" alt="" />`, category:'mobile', tag:'Mobile', tagClass:'tag-mobile', repo:'flutter/flutter', desc:'Google\'s UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase.', stars:'164K', forks:'27.3K', lang:'Dart', langColor:'#00B4AB', growth:'+8.9%', sparkPts:'0,14 8,12 16,11 24,9 32,7 40,5 48,3', time:'Updated 25h ago', updated:'day', likes:0},
      {rank:26, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/AUTOMATIC1111?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'AUTOMATIC1111/stable-diffusion-webui', desc:'Stable Diffusion web UI — A browser interface for Stable Diffusion image generation.', stars:'67.2K', forks:'12.6K', lang:'Python', langColor:'#3572A5', growth:'+9.7%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,1', time:'Updated 26h ago', updated:'week', likes:892},
      {rank:27, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/sharkdp?v=4&s=88" alt="" />`, category:'tools', tag:'Tools', tagClass:'tag-tools', repo:'sharkdp/fd', desc:'A simple, fast and user-friendly alternative to find. A blazing fast search tool with intuitive syntax.', stars:'38.2K', forks:'1.1K', lang:'Rust', langColor:'#dea584', growth:'+12.4%', sparkPts:'0,11 8,10 16,8 24,7 32,5 40,3 48,1', time:'Updated 27h ago', updated:'day', likes:312},
      {rank:28, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/bevyengine?v=4&s=88" alt="" />`, category:'games', tag:'Games', tagClass:'tag-games', repo:'bevyengine/bevy', desc:'A refreshingly simple data-driven game engine built in Rust. ECS architecture with a friendly community.', stars:'38.5K', forks:'3.8K', lang:'Rust', langColor:'#dea584', growth:'+18.5%', sparkPts:'0,13 8,11 16,9 24,7 32,5 40,3 48,2', time:'Updated 28h ago', updated:'month', likes:534},
      {rank:29, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/hashicorp?v=4&s=88" alt="" />`, category:'devops', tag:'DevOps', tagClass:'tag-devops', repo:'hashicorp/terraform', desc:'Infrastructure as Code tool. Manage cloud and on-prem resources with declarative configuration files.', stars:'43.8K', forks:'9.7K', lang:'Go', langColor:'#F18E33', growth:'+4.8%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,1', time:'Updated 29h ago', updated:'week', likes:643},
      {rank:30, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/grafana?v=4&s=88" alt="" />`, category:'devops', tag:'DevOps', tagClass:'tag-devops', repo:'grafana/grafana', desc:'The open and composable observability and data visualization platform. Metrics, logs, and traces in one place.', stars:'64.4K', forks:'10.8K', lang:'Go', langColor:'#F18E33', growth:'+6.3%', sparkPts:'0,14 8,12 16,10 24,8 32,6 40,4 48,2', time:'Updated 30h ago', updated:'day', likes:456},
      {rank:31, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/prometheus?v=4&s=88" alt="" />`, category:'devops', tag:'DevOps', tagClass:'tag-devops', repo:'prometheus/prometheus', desc:'Monitoring system and time series database. Power metrics-based alerting and visualization for cloud-native environments.', stars:'56.2K', forks:'9.4K', lang:'Go', langColor:'#F18E33', growth:'+5.1%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,1', time:'Updated 31h ago', updated:'month', likes:321},
      {rank:32, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/pandas-dev?v=4&s=88" alt="" />`, category:'data', tag:'Data Science', tagClass:'tag-data', repo:'pandas-dev/pandas', desc:'Flexible and powerful data analysis and manipulation library for Python. The go-to tool for tabular data.', stars:'43.8K', forks:'18.2K', lang:'Python', langColor:'#3572A5', growth:'+3.7%', sparkPts:'0,12 8,11 16,9 24,7 32,5 40,3 48,2', time:'Updated 32h ago', updated:'week', likes:789},
      {rank:33, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/numpy?v=4&s=88" alt="" />`, category:'data', tag:'Data Science', tagClass:'tag-data', repo:'numpy/numpy', desc:'The fundamental package for scientific computing with Python. N-dimensional arrays, linear algebra, and FFT.', stars:'27.8K', forks:'7.1K', lang:'Python', langColor:'#3572A5', growth:'+2.8%', sparkPts:'0,11 8,10 16,8 24,7 32,5 40,3 48,1', time:'Updated 33h ago', updated:'month', likes:456},
      {rank:34, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/scikit-learn?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'scikit-learn/scikit-learn', desc:'Machine learning in Python. Simple and efficient tools for predictive data analysis and model building.', stars:'61.2K', forks:'26.3K', lang:'Python', langColor:'#3572A5', growth:'+5.4%', sparkPts:'0,13 8,12 16,10 24,8 32,6 40,4 48,2', time:'Updated 34h ago', updated:'day', likes:0},
      {rank:35, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/apache?v=4&s=88" alt="" />`, category:'data', tag:'Data Science', tagClass:'tag-data', repo:'apache/spark', desc:'Unified analytics engine for large-scale data processing. Speed up to 100x faster than Hadoop MapReduce.', stars:'39.4K', forks:'28.7K', lang:'Scala', langColor:'#c22d40', growth:'+3.2%', sparkPts:'0,12 8,11 16,9 24,8 32,6 40,4 48,2', time:'Updated 35h ago', updated:'month', likes:567},
      {rank:36, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/jupyter?v=4&s=88" alt="" />`, category:'data', tag:'Data Science', tagClass:'tag-data', repo:'jupyter/jupyter', desc:'Project Jupyter — Interactive computing platform. Notebooks, kernels, and protocols for data science.', stars:'12.8K', forks:'3.6K', lang:'Python', langColor:'#3572A5', growth:'+4.1%', sparkPts:'0,14 8,12 16,11 24,9 32,7 40,5 48,3', time:'Updated 36h ago', updated:'week', likes:234},
      {rank:37, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/OWASP?v=4&s=88" alt="" />`, category:'security', tag:'Security', tagClass:'tag-security', repo:'OWASP/owasp-top-10', desc:'OWASP Top 10 — The ten most critical web application security risks. Essential security awareness resource.', stars:'8.4K', forks:'2.3K', lang:'HTML', langColor:'#e34c26', growth:'+7.6%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,1', time:'Updated 37h ago', updated:'month', likes:178},
      {rank:38, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/projectdiscovery?v=4&s=88" alt="" />`, category:'security', tag:'Security', tagClass:'tag-security', repo:'projectdiscovery/nuclei', desc:'Fast and customizable vulnerability scanner based on simple YAML templates. Find security issues at scale.', stars:'18.9K', forks:'2.4K', lang:'Go', langColor:'#F18E33', growth:'+21.3%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,1', time:'Updated 38h ago', updated:'day', likes:567},
      {rank:39, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/vercel?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'vercel/next.js', desc:'The React Framework for the Web. Server-side rendering, static generation, and edge runtime support.', stars:'128K', forks:'27K', lang:'TS', langColor:'#3178C6', growth:'+6.8%', sparkPts:'0,11 8,9 16,8 24,7 32,5 40,3 48,1', time:'Updated 39h ago', updated:'day', likes:891},
      {rank:40, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/tailwindlabs?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'tailwindlabs/tailwindcss', desc:'A utility-first CSS framework for rapid UI development. Build modern designs without leaving your HTML.', stars:'82.4K', forks:'4.2K', lang:'CSS', langColor:'#563D7C', growth:'+14.2%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,2', time:'Updated 40h ago', updated:'week', likes:0},
      {rank:41, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/remix-run?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'remix-run/remix', desc:'Full stack web framework for JavaScript. Build better websites with nested routes and progressive enhancement.', stars:'29.4K', forks:'2.1K', lang:'TS', langColor:'#3178C6', growth:'+11.3%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,1', time:'Updated 41h ago', updated:'day', likes:567},
      {rank:42, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/solidjs?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'solidjs/solid', desc:'A declarative, efficient, and flexible JavaScript library for building user interfaces. Fine-grained reactivity without the overhead.', stars:'32.4K', forks:'1.8K', lang:'TS', langColor:'#3178C6', growth:'+16.8%', sparkPts:'0,14 8,12 16,11 24,9 32,7 40,5 48,3', time:'Updated 42h ago', updated:'week', likes:432},
      {rank:43, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/angular?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'angular/angular', desc:'The modern web developer\'s platform. Build enterprise-scale applications with TypeScript and a rich component ecosystem.', stars:'97.2K', forks:'25.6K', lang:'TS', langColor:'#3178C6', growth:'+4.2%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,2', time:'Updated 43h ago', updated:'day', likes:678},
      {rank:44, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/zed-industries?v=4&s=88" alt="" />`, category:'tools', tag:'Tools', tagClass:'tag-tools', repo:'zed-industries/zed', desc:'Code at the speed of thought. A high-performance, multiplayer code editor built in Rust with AI integration.', stars:'52.1K', forks:'2.9K', lang:'Rust', langColor:'#dea584', growth:'+35.2%', sparkPts:'0,11 8,9 16,8 24,6 32,5 40,3 48,1', time:'Updated 44h ago', updated:'day', likes:0},
      {rank:45, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/anthropics?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'anthropics/claude-code', desc:'Claude Code — AI-powered development agent. Terminal-based coding assistant for complex software engineering tasks.', stars:'45.6K', forks:'3.2K', lang:'Python', langColor:'#3572A5', growth:'+41.3%', sparkPts:'0,14 8,12 16,10 24,7 32,5 40,3 48,1', time:'Updated 45h ago', updated:'day', likes:0},
      {rank:46, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/neondatabase?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', repo:'neondatabase/neon', desc:'Neon — Serverless Postgres. Separate storage and compute for modern apps with branching and auto-scaling.', stars:'16.8K', forks:'1.5K', lang:'Rust', langColor:'#dea584', growth:'+27.8%', sparkPts:'0,13 8,11 16,9 24,7 32,5 40,3 48,1', time:'Updated 46h ago', updated:'day', likes:456},
      {rank:47, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/django?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', repo:'django/django', desc:'The web framework for perfectionists with deadlines. Batteries-included Python web framework for rapid development.', stars:'78.4K', forks:'32.1K', lang:'Python', langColor:'#3572A5', growth:'+3.8%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,2', time:'Updated 47h ago', updated:'week', likes:567},
      {rank:48, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/spring-projects?v=4&s=88" alt="" />`, category:'backend', tag:'Backend', tagClass:'tag-backend', repo:'spring-projects/spring-boot', desc:'Spring Boot — Build production-ready Spring applications quickly. Opinionated framework with embedded servers.', stars:'74.2K', forks:'30.8K', lang:'Java', langColor:'#b07219', growth:'+4.1%', sparkPts:'0,14 8,12 16,11 24,9 32,7 40,5 48,3', time:'Updated 48h ago', updated:'month', likes:834},
      {rank:49, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/golang?v=4&s=88" alt="" />`, category:'tools', tag:'Tools', tagClass:'tag-tools', repo:'golang/go', desc:'The Go programming language. An open source programming language that makes it easy to build simple, reliable, efficient software.', stars:'123K', forks:'18.3K', lang:'Go', langColor:'#F18E33', growth:'+5.6%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,2', time:'Updated 49h ago', updated:'day', likes:423},
      {rank:50, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/expo?v=4&s=88" alt="" />`, category:'mobile', tag:'Mobile', tagClass:'tag-mobile', repo:'expo/expo', desc:'An open-source platform for making universal native apps with React. Build, deploy, and iterate fast with over-the-air updates.', stars:'34.2K', forks:'5.1K', lang:'TS', langColor:'#3178C6', growth:'+12.8%', sparkPts:'0,11 8,9 16,8 24,6 32,5 40,3 48,1', time:'Updated 50h ago', updated:'week', likes:345},
      {rank:51, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/ionic-team?v=4&s=88" alt="" />`, category:'mobile', tag:'Mobile', tagClass:'tag-mobile', repo:'ionic-team/ionic-framework', desc:'Ionic Framework — Build amazing native mobile and desktop apps with web technologies. Open source UI toolkit.', stars:'49.8K', forks:'13.2K', lang:'TS', langColor:'#3178C6', growth:'+2.4%', sparkPts:'0,12 8,11 16,9 24,8 32,6 40,4 48,2', time:'Updated 51h ago', updated:'month', likes:234},
      {rank:52, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/chakra-ui?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'chakra-ui/chakra-ui', desc:'A simple, modular and accessible component library for React. Build accessible React apps with speed.', stars:'38.2K', forks:'3.6K', lang:'TS', langColor:'#3178C6', growth:'+5.3%', sparkPts:'0,13 8,12 16,10 24,8 32,6 40,4 48,2', time:'Updated 52h ago', updated:'week', likes:678},
      {rank:53, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/mui?v=4&s=88" alt="" />`, category:'frontend', tag:'Frontend', tagClass:'tag-frontend', repo:'mui/material-ui', desc:'MUI — Ready-to-use Material Design components. React components for faster and easier web development.', stars:'95.8K', forks:'31.4K', lang:'TS', langColor:'#3178C6', growth:'+7.8%', sparkPts:'0,14 8,12 16,10 24,8 32,6 40,4 48,1', time:'Updated 53h ago', updated:'day', likes:0},
      {rank:54, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/ajeetdsouza?v=4&s=88" alt="" />`, category:'tools', tag:'Tools', tagClass:'tag-tools', repo:'ajeetdsouza/zoxide', desc:'A smarter cd command. Learns your habits and navigates to the most frequently visited directories automatically.', stars:'21.4K', forks:'612', lang:'Rust', langColor:'#dea584', growth:'+8.7%', sparkPts:'0,11 8,10 16,8 24,7 32,5 40,3 48,1', time:'Updated 54h ago', updated:'week', likes:345},
      {rank:55, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/BurntSushi?v=4&s=88" alt="" />`, category:'tools', tag:'Tools', tagClass:'tag-tools', repo:'BurntSushi/ripgrep', desc:'ripgrep — recursively searches directories for a regex pattern. Fast, respectful of .gitignore, and user-friendly.', stars:'48.6K', forks:'2.1K', lang:'Rust', langColor:'#dea584', growth:'+6.4%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,2', time:'Updated 55h ago', updated:'month', likes:567},
      {rank:56, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/vllm-project?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'vllm-project/vllm', desc:'High-throughput and memory-efficient inference and serving engine for LLMs. Fast, easy to use, and open source.', stars:'31.8K', forks:'4.7K', lang:'Python', langColor:'#3572A5', growth:'+42.1%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,1', time:'Updated 56h ago', updated:'day', likes:0},
      {rank:57, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/microsoft?v=4&s=88" alt="" />`, category:'ai-ml', tag:'AI/ML', tagClass:'tag-ai', repo:'microsoft/semantic-kernel', desc:'Integrate cutting-edge LLM technology quickly and easily into your apps. Semantic Kernel for AI orchestration.', stars:'22.1K', forks:'3.2K', lang:'C', langColor:'#178600', growth:'+15.8%', sparkPts:'0,14 8,12 16,11 24,9 32,7 40,5 48,3', time:'Updated 57h ago', updated:'week', likes:432},
      {rank:58, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/dmlc?v=4&s=88" alt="" />`, category:'data', tag:'Data Science', tagClass:'tag-data', repo:'dmlc/xgboost', desc:'XGBoost — Scalable, Portable, and Distributed Gradient Boosting. The most popular machine learning library for structured data.', stars:'27.2K', forks:'11.8K', lang:'C', langColor:'#f34b7d', growth:'+3.5%', sparkPts:'0,11 8,10 16,8 24,7 32,5 40,3 48,1', time:'Updated 58h ago', updated:'month', likes:345},
      {rank:59, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/trailofbits?v=4&s=88" alt="" />`, category:'security', tag:'Security', tagClass:'tag-security', repo:'trailofbits/pip-audit', desc:'A vulnerability scanner for Python dependencies. Check installed packages against known security advisories.', stars:'4.2K', forks:'345', lang:'Python', langColor:'#3572A5', growth:'+11.2%', sparkPts:'0,13 8,11 16,10 24,8 32,6 40,4 48,2', time:'Updated 59h ago', updated:'month', likes:123},
      {rank:60, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/Lyken?v=4&s=88" alt="" />`, category:'security', tag:'Security', tagClass:'tag-security', repo:'Lyken/py-cid', desc:'An experimental tool to find the GitHub repository from a piece of Python code. Code identification and attribution.', stars:'12.3K', forks:'856', lang:'Python', langColor:'#3572A5', growth:'+6.9%', sparkPts:'0,12 8,10 16,9 24,7 32,5 40,3 48,1', time:'Updated 60h ago', updated:'week', likes:234},
      {rank:61, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/sigmaHQ?v=4&s=88" alt="" />`, category:'security', tag:'Security', tagClass:'tag-security', repo:'sigmaHQ/sigma', desc:'Generic signature format for SIEM systems. Convert logs into meaningful security events with community detections.', stars:'8.2K', forks:'2.1K', lang:'YAML', langColor:'#cb171e', growth:'+8.4%', sparkPts:'0,14 8,12 16,10 24,8 32,6 40,4 48,2', time:'Updated 61h ago', updated:'month', likes:178},
      {rank:62, rankClass:'normal', avatar:`<img src="https://avatars.githubusercontent.com/NativeScript?v=4&s=88" alt="" />`, category:'mobile', tag:'Mobile', tagClass:'tag-mobile', repo:'NativeScript/NativeScript', desc:'NativeScript — Build truly native mobile apps with JavaScript and TypeScript. Direct access to native APIs.', stars:'22.8K', forks:'3.4K', lang:'TS', langColor:'#3178C6', growth:'+2.1%', sparkPts:'0,11 8,10 16,8 24,7 32,5 40,3 48,1', time:'Updated 62h ago', updated:'month', likes:156}
    ];

  var moreCards = [
    {
      rank: 63, rankClass: 'normal', avatar: 'M', category: 'ai-ml',
      tag: 'AI/ML', tagClass: 'tag-ai',
      repo: 'microsoft/vscode', desc: 'Visual Studio Code — Code editor redefined and optimized for productivity.',
      stars: '168K', forks: '32K', lang: 'TS', langColor: '#3178C6',
      growth: '+5.3%', sparkPts: '0,10 8,9 16,8 24,6 32,5 40,4 48,3',
      time: 'Updated 3h ago', updated: 'day', likes: 1876
    },
    {
      rank: 64, rankClass: 'normal', avatar: 'S', category: 'backend',
      tag: 'Backend', tagClass: 'tag-backend',
      repo: 'supabase/supabase', desc: 'The open source Firebase alternative. Build in a weekend, scale to millions.',
      stars: '76.4K', forks: '6.2K', lang: 'TS', langColor: '#3178C6',
      growth: '+19.4%', sparkPts: '0,14 8,12 16,10 24,8 32,6 40,4 48,2',
      time: 'Updated 6h ago', updated: 'day', likes: 934
    },
    {
      rank: 65, rankClass: 'normal', avatar: 'D', category: 'ai-ml',
      tag: 'AI/ML', tagClass: 'tag-ai',
      repo: 'dagger/dagger', desc: 'Programmable CI/CD engine that runs your pipelines in containers.',
      stars: '12.4K', forks: '876', lang: 'Go', langColor: '#00ADD8',
      growth: '+24.6%', sparkPts: '0,13 8,11 16,10 24,8 32,6 40,4 48,2',
      time: 'Updated 12h ago', updated: 'day', likes: 567
    },
    {
      rank: 66, rankClass: 'normal', avatar: 'J', category: 'ai-ml',
      tag: 'AI/ML', tagClass: 'tag-ai',
      repo: 'jina-ai/reader', desc: 'Convert any URL to LLM-friendly markdown. Extract clean content from web pages.',
      stars: '18.7K', forks: '1.5K', lang: 'Python', langColor: '#3572A5',
      growth: '+34.6%', sparkPts: '0,14 8,11 16,9 24,6 32,4 40,2 48,1',
      time: 'Updated 1h ago', updated: 'day', likes: 876
    },
    {
      rank: 67, rankClass: 'normal', avatar: 'T', category: 'tools',
      tag: 'Tools', tagClass: 'tag-tools',
      repo: 'typst/typst', desc: 'A new markup-based typesetting system. Powerful and easy to learn.',
      stars: '36.8K', forks: '987', lang: 'Rust', langColor: '#dea584',
      growth: '+31.2%', sparkPts: '0,14 8,12 16,10 24,8 32,6 40,4 48,2',
      time: 'Updated 2h ago', updated: 'week', likes: 678
    },
    {
      rank: 68, rankClass: 'normal', avatar: 'P', category: 'backend',
      tag: 'Backend', tagClass: 'tag-backend',
      repo: 'postgrest/postgrest', desc: 'REST API for any PostgreSQL database. Auto-generated from schema.',
      stars: '24.6K', forks: '1.3K', lang: 'Haskell', langColor: '#5e5086',
      growth: '+8.4%', sparkPts: '0,12 8,10 16,9 24,7 32,5 40,3 48,1',
      time: 'Updated 4h ago', updated: 'week', likes: 445
    },
    {
      rank: 69, rankClass: 'normal', avatar: 'G', category: 'ai-ml',
      tag: 'AI/ML', tagClass: 'tag-ai',
      repo: 'postgresml/postgresml', desc: 'PostgresML — Machine learning and AI in PostgreSQL. Train and deploy LLMs.',
      stars: '6.4K', forks: '318', lang: 'Python', langColor: '#3572A5',
      growth: '+42.1%', sparkPts: '0,13 8,11 16,9 24,7 32,5 40,3 48,1',
      time: 'Updated 8h ago', updated: 'month', likes: 234
    },
    {
      rank: 70, rankClass: 'normal', avatar: 'V', category: 'data',
      tag: 'Data Science', tagClass: 'tag-data',
      repo: 'tensorchord/vectorchord', desc: 'A Rust-based vector search extension for PostgreSQL. Fast and scalable.',
      stars: '3.8K', forks: '142', lang: 'Rust', langColor: '#dea584',
      growth: '+56.3%', sparkPts: '0,14 8,12 16,10 24,8 32,6 40,4 48,2',
      time: 'Updated 1h ago', updated: 'week', likes: 178
    },
    {
      rank: 71, rankClass: 'normal', avatar: 'R', category: 'ai-ml',
      tag: 'AI/ML', tagClass: 'tag-ai',
      repo: 'run-llama/llama_index', desc: 'LlamaIndex — Data framework for LLM applications. Connect custom data to LLMs.',
      stars: '36.2K', forks: '5.1K', lang: 'Python', langColor: '#3572A5',
      growth: '+26.7%', sparkPts: '0,13 8,11 16,10 24,8 32,6 40,4 48,2',
      time: 'Updated 5h ago', updated: 'month', likes: 923
    },
    {
      rank: 72, rankClass: 'normal', avatar: 'B', category: 'tools',
      tag: 'Tools', tagClass: 'tag-tools',
      repo: 'biomejs/biome', desc: 'A toolchain for web projects. Linter, formatter, and type checker in one tool.',
      stars: '18.9K', forks: '612', lang: 'Rust', langColor: '#dea584',
      growth: '+45.3%', sparkPts: '0,15 8,13 16,10 24,7 32,4 40,2 48,1',
      time: 'Updated 30m ago', updated: 'day', likes: 567
    },
    {
      rank: 73, rankClass: 'normal', avatar: 'Q', category: 'tools',
      tag: 'Tools', tagClass: 'tag-tools',
      repo: 'quarto-dev/quarto', desc: 'Open-source scientific and technical publishing system. Reproducible documents and presentations.',
      stars: '4.2K', forks: '378', lang: 'Rust', langColor: '#dea584',
      growth: '+12.8%', sparkPts: '0,12 8,10 16,9 24,7 32,5 40,3 48,1',
      time: 'Updated 45m ago', updated: 'day', likes: 145
    },
    {
      rank: 74, rankClass: 'normal', avatar: 'W', category: 'backend',
      tag: 'Backend', tagClass: 'tag-backend',
      repo: 'windmill-labs/windmill', desc: 'Workflow engine and platform. Build complex apps with minimal code, fast.',
      stars: '10.2K', forks: '678', lang: 'Rust', langColor: '#dea584',
      growth: '+38.4%', sparkPts: '0,14 8,12 16,10 24,8 32,6 40,4 48,2',
      time: 'Updated 3h ago', updated: 'day', likes: 345
    }
  ];

  /* ═══════════════════════════════════════════════════════════════
     辅助函数 —— 构建 dropdown HTML
     ═══════════════════════════════════════════════════════════════ */
  function buildDropdownHTML(cat) {
    var data = categoryRankData[cat];
    if (!data) return '';

    var maxCount = data.items.length > 0 ? data.items[0].count : 1;

    var headerHTML = '<div class="chip-dropdown-header">' +
      '<span class="dd-cat-name">TOP REPOS //</span>' +
      '<span class="dd-total">' + data.total + ' repos</span>' +
      '</div>';

    var listHTML = '<div class="chip-dropdown-list">';
    data.items.forEach(function (item, idx) {
      var posClass = idx < 3 ? ' top3' : (idx < 5 ? ' top5' : '');
      var barWidth = Math.round((item.count / maxCount) * 100);
      var countStr = item.count >= 1000 ? Math.round(item.count / 1000) + 'K' : item.count.toString();
      listHTML += '<div class="dd-rank-item">' +
        '<span class="dd-rank-pos' + posClass + '">' + (idx + 1) + '</span>' +
        '<span class="dd-rank-name">' + item.name + '</span>' +
        '<span class="dd-rank-bar-track"><span class="dd-rank-bar-fill" style="width:' + barWidth + '%"></span></span>' +
        '<span class="dd-rank-count">' + countStr + '</span>' +
        '</div>';
    });
    listHTML += '</div>';

    return headerHTML + listHTML;
  }

  /* ═══════════════════════════════════════════════════════════════
     辅助函数 —— 构建无限滚动卡片 HTML
     ═══════════════════════════════════════════════════════════════ */
  function buildCardHTML(item) {
    var likesFormatted = (item.likes || 0) >= 1000
      ? Math.floor((item.likes || 0) / 100) / 10 + 'K'
      : String(item.likes || 0);

    return '<div class="card-rank-bg ' + item.rankClass + '">#' + item.rank + '</div>' +
      '<div class="card-inner">' +
        '<div class="card-top">' +
          '<div class="card-avatar">' + item.avatar + '</div>' +
          '<div class="card-info">' +
            '<div class="card-repo">' + item.repo + '</div>' +
            '<div class="card-desc">' + item.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card-tags">' +
          '<span class="tag ' + item.tagClass + '">' + item.tag + '</span>' +
        '</div>' +
        '<div class="card-stats">' +
          '<span class="card-stat"><span class="icon">\u2605</span> ' + item.stars + '</span>' +
          '<span class="card-stat"><span class="icon">\u2699</span> ' + item.forks + '</span>' +
          '<span class="card-stat"><span class="lang-dot" style="background:' + item.langColor + ';"></span> ' + item.lang + '</span>' +
          '<span class="growth-badge">' + item.growth + '</span>' +
          '<svg class="sparkline" width="48" height="16" viewBox="0 0 48 16">' +
            '<polyline fill="none" stroke="var(--green)" stroke-width="1.5" points="' + item.sparkPts + '"/>' +
          '</svg>' +
        '</div>' +
        '<div class="card-bottom">' +
          '<div class="card-time"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> ' + item.time + '</div>' +
          '<div class="card-likes">\u2665 ' + likesFormatted + '</div>' +
        '</div>' +
      '</div>';
  }

  /* ═══════════════════════════════════════════════════════════════
     IndexPage 组件
     ═══════════════════════════════════════════════════════════════ */
  function IndexPage() {
    // 无限滚动状态（所有 ref 声明在组件顶层，遵守 hooks 规则）
    // pageRef 从 0 开始：start = 0 * 4 = 0，即 moreCards[0..3] = rank 13-16
    var pageRef = useRef(0);
    var loadingRef = useRef(false);
    var exhaustedRef = useRef(false);
    var observerRef = useRef(null);

    /* ── 1. 打字机效果 ── */
    useEffect(function () {
      var twEl = document.getElementById('heroTypewriter');
      if (!twEl) return;

      var text = twEl.getAttribute('data-text') || '';
      twEl.textContent = '';
      var charIndex = 0;
      var timers = [];

      function typeChar() {
        if (charIndex < text.length) {
          twEl.textContent += text.charAt(charIndex);
          charIndex++;
          var id = setTimeout(typeChar, 80 + Math.random() * 60);
          timers.push(id);
        } else {
          var id = setTimeout(function () { twEl.classList.add('done'); }, 1200);
          timers.push(id);
        }
      }

      var startId = setTimeout(typeChar, 600);
      timers.push(startId);

      return function cleanup() {
        timers.forEach(function (id) { clearTimeout(id); });
      };
    }, []);

    /* ── 3. 卡片鼠标追踪（光晕效果）── */
    useEffect(function () {
      function handleMouseMove(e) {
        var card = e.currentTarget;
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      }

      // 使用事件委托：在 document 上监听，通过匹配 .card 过滤
      function handleCardMouseMove(e) {
        var card = e.target.closest('.card');
        if (card) {
          var rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
          card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        }
      }
      document.addEventListener('mousemove', handleCardMouseMove);

      // 使用 passive: true 优化 mousemove 性能（touch-action 默认 scroll）
      // cleanup 时移除 document 级监听器
      return function cleanup() {
        document.removeEventListener('mousemove', handleCardMouseMove);
      };
    }, []);

    /* ── 4. 分类 chip dropdown 构建 ── */
    useEffect(function () {
      document.querySelectorAll('.chip').forEach(function (chip) {
        var cat = chip.getAttribute('data-category');
        var dd = chip.querySelector('.chip-dropdown');
        if (!dd || !categoryRankData[cat]) return;
        dd.innerHTML = buildDropdownHTML(cat);
      });
    }, []);

    /* ── 5. 分类 Tab 过滤 ── */
    useEffect(function () {
      var chips = document.querySelectorAll('.chip');

      function handleClick(e) {
        // 忽略 dropdown 区域的点击
        if (e.target.closest('.chip-dropdown')) return;

        var chip = e.currentTarget;
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');

        var selectedCat = chip.getAttribute('data-category');
        var allCards = document.querySelectorAll('#cardGrid .card');

        allCards.forEach(function (card, i) {
          var cardCats = (card.getAttribute('data-category') || '').split(',');
          var show = selectedCat === 'all' || cardCats.indexOf(selectedCat) !== -1;

          if (show) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            setTimeout(function () {
              card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 50);
          } else {
            card.style.display = 'none';
          }
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', handleClick);
      });

      return function cleanup() {
        chips.forEach(function (chip) {
          chip.removeEventListener('click', handleClick);
        });
      };
    }, []);

    /* ── 6. 分类拖拽滚动 ── */
    useEffect(function () {
      var scrollEl = document.getElementById('categoryScroll');
      if (!scrollEl) return;

      var isDown = false;
      var startX = 0;
      var scrollLeftVal = 0;

      function onMouseDown(e) {
        isDown = true;
        scrollEl.classList.add('active');
        startX = e.pageX - scrollEl.offsetLeft;
        scrollLeftVal = scrollEl.scrollLeft;
      }

      function onMouseLeave() {
        isDown = false;
        scrollEl.classList.remove('active');
      }

      function onMouseUp() {
        isDown = false;
        scrollEl.classList.remove('active');
      }

      function onMouseMove(e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - scrollEl.offsetLeft;
        var walk = (x - startX) * 2;
        scrollEl.scrollLeft = scrollLeftVal - walk;
      }

      function onWheel(e) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          scrollEl.scrollLeft += e.deltaY;
        }
      }

      scrollEl.addEventListener('mousedown', onMouseDown);
      scrollEl.addEventListener('mouseleave', onMouseLeave);
      scrollEl.addEventListener('mouseup', onMouseUp);
      scrollEl.addEventListener('mousemove', onMouseMove);
      scrollEl.addEventListener('wheel', onWheel, { passive: false });

      return function cleanup() {
        scrollEl.removeEventListener('mousedown', onMouseDown);
        scrollEl.removeEventListener('mouseleave', onMouseLeave);
        scrollEl.removeEventListener('mouseup', onMouseUp);
        scrollEl.removeEventListener('mousemove', onMouseMove);
        scrollEl.removeEventListener('wheel', onWheel);
      };
    }, []);

    /* ── 7. 时间 Tab 过滤 ── */
    useEffect(function () {
      var timeTabs = document.querySelectorAll('.time-tab');

      function handleTabClick() {
        var tab = this; // 普通函数中 this 指向绑定元素
        timeTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        var period = tab.getAttribute('data-period');
        var cards = document.querySelectorAll('.card');
        cards.forEach(function (card) {
          var updated = card.getAttribute('data-updated');
          if (!updated || updated === period) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }

      timeTabs.forEach(function (tab) {
        tab.addEventListener('click', handleTabClick);
      });

      return function cleanup() {
        timeTabs.forEach(function (tab) {
          tab.removeEventListener('click', handleTabClick);
        });
      };
    }, []);

    /* ── 8. 初始骨架屏 + IntersectionObserver 懒加载 + 无限滚动 ── */
    useEffect(function () {
      var grid = document.getElementById('cardGrid');
      var sentinel = document.getElementById('scrollSentinel');
      if (!grid || !sentinel) return;

      var SKELETON_BATCH = 8;  // 每批替换的骨架屏数量（约等于一屏可见数）
      var INFINITE_BATCH = 4;  // 无限滚动每批加载数量
      var initialIdx = 0;      // 初始卡片加载索引（闭包变量，useEffect 内持久）
      var initialDone = false;

      // 生成骨架屏卡片
      function createSkeletonCard() {
        var skel = document.createElement('div');
        skel.className = 'skeleton-card card';
        skel.innerHTML =
          '<div style="display:flex;gap:12px;align-items:flex-start;">' +
            '<div class="skeleton-avatar" style="width:48px;height:48px;flex-shrink:0;"></div>' +
            '<div style="flex:1;display:flex;flex-direction:column;gap:8px;">' +
              '<div class="skeleton-line" style="width:55%;height:13px;"></div>' +
              '<div class="skeleton-line short" style="width:85%;height:11px;"></div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px;"><div class="skeleton-line" style="width:60px;height:22px;"></div></div>' +
          '<div style="display:flex;gap:16px;margin-top:12px;">' +
            '<div class="skeleton-line" style="width:50px;height:11px;"></div>' +
            '<div class="skeleton-line" style="width:50px;height:11px;"></div>' +
            '<div class="skeleton-line" style="width:40px;height:11px;"></div>' +
            '<div class="skeleton-line" style="width:60px;height:11px;"></div>' +
          '</div>';
        return skel;
      }

      // 替换一批骨架屏为真实卡片（初始数据）
      function replaceSkeletonBatch() {
        var skeletons = Array.from(grid.querySelectorAll('.skeleton-card.card[data-skeleton-idx]'));
        if (skeletons.length === 0 || initialIdx >= INITIAL_CARDS.length) {
          initialDone = true;
          // 移除骨架屏触发标记，避免占据 grid 空位
          var trig = document.getElementById('skeletonTrigger');
          if (trig) trig.remove();
          // 检查 sentinel 是否在视口内，触发无限滚动
          setTimeout(function () {
            if (sentinel && !loadingRef.current && !exhaustedRef.current) {
              var sentRect = sentinel.getBoundingClientRect();
              if (sentRect.top < window.innerHeight + 400) {
                loadMore();
              }
            }
          }, 100);
          return;
        }

        var toReplace = Math.min(SKELETON_BATCH, skeletons.length);
        for (var i = 0; i < toReplace; i++) {
          if (initialIdx >= INITIAL_CARDS.length) break;
          var skel = skeletons[i];
          var item = INITIAL_CARDS[initialIdx];
          initialIdx++;

          // 用真实卡片替换骨架屏（同步替换，无延迟）
          var card = document.createElement('div');
          card.className = 'card card-fade-in';
          card.setAttribute('data-category', item.category);
          card.setAttribute('data-updated', item.updated || 'day');
          card.setAttribute('data-likes', String(item.likes || 0));
          card.onclick = function () { window.location.href = 'detail.html'; };
          card.innerHTML = buildCardHTML(item);

          skel.replaceWith(card);
        }
      }

      // 无限滚动加载更多
      function loadMore() {
        if (loadingRef.current || exhaustedRef.current) return;
        // 确保 moreCards 有足够数据
        while (moreCards.length < 40) {
          // rank 从 62 + 当前 moreCards 长度 + 1 开始，确保连续递增
          var n = 62 + moreCards.length + 1;
          var templates = [
            { repo: 'pola-rs/polars', desc: 'Dataframes powered by a multithreaded, vectorized query engine, written in Rust.', stars: '30.2K', forks: '2.1K', lang: 'Rust', langColor: '#dea584', category: 'data', tag: 'Data Science', tagClass: 'tag-data' },
            { repo: 'astral-sh/uv', desc: 'An extremely fast Python package and project manager, written in Rust.', stars: '24.8K', forks: '678', lang: 'Rust', langColor: '#dea584', category: 'tools', tag: 'Tools', tagClass: 'tag-tools' },
            { repo: 'tabler/tabler-icons', desc: 'A set of over 5200 free MIT-licensed SVG icons for web projects.', stars: '18.4K', forks: '1.2K', lang: 'TS', langColor: '#3178C6', category: 'frontend', tag: 'Frontend', tagClass: 'tag-frontend' },
            { repo: 'surrealdb/surrealdb', desc: 'A scalable, distributed, document-graph database for the modern web.', stars: '26.8K', forks: '1.5K', lang: 'Rust', langColor: '#dea584', category: 'backend', tag: 'Backend', tagClass: 'tag-backend' },
            { repo: 'dani-garcia/vaultwarden', desc: 'Unofficial Bitwarden server. Lightweight and self-hosted password manager.', stars: '38.4K', forks: '2.1K', lang: 'Rust', langColor: '#dea584', category: 'devops', tag: 'DevOps', tagClass: 'tag-devops' },
            { repo: 'google/googletest', desc: 'Google C++ testing framework. Write better C++ tests with xUnit style.', stars: '32.4K', forks: '10.2K', lang: 'C++', langColor: '#f34b7d', category: 'tools', tag: 'Tools', tagClass: 'tag-tools' },
            { repo: 'redis/redis', desc: 'Redis is an in-memory database that persists on disk. Data structure server.', stars: '67.8K', forks: '24.1K', lang: 'C', langColor: '#555555', category: 'backend', tag: 'Backend', tagClass: 'tag-backend' },
            { repo: 'cohere-ai/cookiecutter', desc: 'Cookiecutter creates projects from templates. Fast project bootstrapping.', stars: '21.6K', forks: '2.3K', lang: 'Python', langColor: '#3572A5', category: 'tools', tag: 'Tools', tagClass: 'tag-tools' },
            { repo: 'appwrite/appwrite', desc: 'Open-source backend platform for developing apps at any scale.', stars: '46.8K', forks: '4.2K', lang: 'TS', langColor: '#3178C6', category: 'backend', tag: 'Backend', tagClass: 'tag-backend' },
            { repo: 'orbstack/orbstack', desc: 'Run Docker containers and Linux machines on Mac with fast, lightweight VMs.', stars: '18.9K', forks: '712', lang: 'Rust', langColor: '#dea584', category: 'devops', tag: 'DevOps', tagClass: 'tag-devops' }
          ];
          var tpl = templates[moreCards.length % templates.length];
          var growthOpts = ['+1.2%', '+3.8%', '+5.4%', '+8.1%', '+11.6%', '+15.3%', '+22.1%', '+28.7%'];
          var updatedOpts = ['day', 'week', 'month'];
          moreCards.push({
            rank: n, rankClass: 'normal', avatar: tpl.repo.split('/')[1][0].toUpperCase(),
            category: tpl.category, tag: tpl.tag, tagClass: tpl.tagClass,
            repo: tpl.repo, desc: tpl.desc,
            stars: tpl.stars, forks: tpl.forks, lang: tpl.lang, langColor: tpl.langColor,
            growth: growthOpts[moreCards.length % growthOpts.length],
            sparkPts: '0,' + (10 + Math.floor(Math.random() * 6)) + ' 8,' + (8 + Math.floor(Math.random() * 6)) + ' 16,' + (6 + Math.floor(Math.random() * 6)) + ' 24,' + (4 + Math.floor(Math.random() * 6)) + ' 32,' + (3 + Math.floor(Math.random() * 4)) + ' 40,' + (2 + Math.floor(Math.random() * 4)) + ' 48,' + (1 + Math.floor(Math.random() * 3)),
            time: 'Updated ' + (Math.floor(Math.random() * 23) + 1) + 'h ago',
            updated: updatedOpts[moreCards.length % updatedOpts.length],
            likes: Math.floor(Math.random() * 2000) + 50
          });
        }

        loadingRef.current = true;
        sentinel.classList.add('loading');

        // 插入骨架屏占位（在 sentinel 之前）
        var frag = document.createDocumentFragment();
        for (var s = 0; s < INFINITE_BATCH; s++) {
          frag.appendChild(createSkeletonCard());
        }
        grid.insertBefore(frag, sentinel);

        // 模拟网络延迟后替换骨架屏为真实卡片
        setTimeout(function () {
          var skeletons = grid.querySelectorAll('.skeleton-card.card');
          skeletons.forEach(function (sk) { sk.remove(); });

          var start = pageRef.current * INFINITE_BATCH;
          var batch = moreCards.slice(start, start + INFINITE_BATCH);

          if (batch.length === 0) {
            exhaustedRef.current = true;
            loadingRef.current = false;
            sentinel.classList.remove('loading');
            sentinel.innerHTML = '<div class="scroll-loader" style="opacity:0.4;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;">// END OF FEED</div>';
            if (observerRef.current) {
              observerRef.current.unobserve(sentinel);
            }
            return;
          }

          var cardFrag = document.createDocumentFragment();
          batch.forEach(function (item) {
            var card = document.createElement('div');
            card.className = 'card card-fade-in';
            card.setAttribute('data-category', item.category);
            card.setAttribute('data-updated', item.updated || 'day');
            card.setAttribute('data-likes', String(item.likes || 0));
            card.onclick = function () { window.location.href = 'detail.html'; };
            card.innerHTML = buildCardHTML(item);
            cardFrag.appendChild(card);
          });
          grid.insertBefore(cardFrag, sentinel);

          pageRef.current++;
          loadingRef.current = false;
          sentinel.classList.remove('loading');

          if (observerRef.current) {
            observerRef.current.unobserve(sentinel);
            setTimeout(function () {
              if (observerRef.current && !exhaustedRef.current) {
                observerRef.current.observe(sentinel);
              }
            }, 50);
          }
        }, 600);
      }

      // Intersection Observer：骨架屏逐块懒加载 + 无限滚动
      if ('IntersectionObserver' in window) {
        // 骨架屏 Observer：使用独立触发点，避免批量触发
        var replacingRef = false;
        // 在初始视口外的骨架屏后面插入触发标记（跳过前两屏）
        var trigger = document.createElement('div');
        trigger.id = 'skeletonTrigger';
        trigger.style.cssText = 'width:100%;height:1px;';
        var firstBatch = grid.querySelectorAll('.skeleton-card.card[data-skeleton-idx]');
        var triggerIdx = Math.min(SKELETON_BATCH * 2, firstBatch.length - 1);
        if (firstBatch.length > triggerIdx) {
          firstBatch[triggerIdx].after(trigger);
        } else {
          grid.insertBefore(trigger, sentinel);
        }

        // 初始加载：延迟替换首屏骨架屏（模拟数据请求）
        setTimeout(function () {
          if (initialDone) return;
          replacingRef = true;
          replaceSkeletonBatch();

          // 检查后续是否需要继续替换
          var remaining = grid.querySelectorAll('.skeleton-card.card[data-skeleton-idx]');
          if (remaining.length > 0) {
            var insertAfter = Math.min(SKELETON_BATCH - 1, remaining.length - 1);
            remaining[insertAfter].after(trigger);
            // 如果 trigger 在视口内，手动触发后续替换
            var triggerRect = trigger.getBoundingClientRect();
            if (triggerRect.top < window.innerHeight + 200) {
              setTimeout(function () {
                replacingRef = false;
                // 手动触发 observer 回调
                skeletonObserver.unobserve(trigger);
                skeletonObserver.observe(trigger);
              }, 300);
            } else {
              replacingRef = false;
            }
          } else {
            replacingRef = false;
          }
        }, 1200);

        var skeletonObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || initialDone || replacingRef) return;

            // 递归替换函数：持续替换直到 trigger 不在视口内
            function processBatch() {
              if (initialDone || replacingRef) return;
              replacingRef = true;
              replaceSkeletonBatch();

              var remaining = grid.querySelectorAll('.skeleton-card.card[data-skeleton-idx]');
              if (remaining.length > 0) {
                var insertAfter = Math.min(SKELETON_BATCH - 1, remaining.length - 1);
                remaining[insertAfter].after(trigger);

                // 检查触发点是否仍在视口预加载范围内
                var triggerRect = trigger.getBoundingClientRect();
                var inView = triggerRect.top < window.innerHeight + 200;
                if (inView) {
                  // trigger 仍在视口内，延迟继续替换下一批
                  setTimeout(function () {
                    replacingRef = false;
                    processBatch();
                  }, 400);
                } else {
                  // trigger 不在视口内，等待滚动触发
                  skeletonObserver.unobserve(trigger);
                  skeletonObserver.observe(trigger);
                  replacingRef = false;
                }
              } else {
                initialDone = true;
                skeletonObserver.disconnect();
                replacingRef = false;
                // 移除骨架屏触发标记，避免占据 grid 空位
                trigger.remove();
                // 所有骨架屏已替换完毕，手动检查 sentinel 是否在视口内
                setTimeout(function () {
                  if (!loadingRef.current && !exhaustedRef.current) {
                    var sentRect = sentinel.getBoundingClientRect();
                    if (sentRect.top < window.innerHeight + 400) {
                      loadMore();
                    }
                  }
                }, 100);
              }
            }

            processBatch();
          });
        }, { rootMargin: '200px', threshold: 0 });

        // Sentinel Observer：无限滚动
        var sentinelObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (!initialDone) return;  // 初始骨架屏未加载完时不触发
            if (!loadingRef.current && !exhaustedRef.current) {
              loadMore();
            }
          });
        }, { rootMargin: '400px' });

        // observe 触发点
        skeletonObserver.observe(trigger);

        // observe sentinel（用于无限滚动）
        observerRef.current = sentinelObserver;
        sentinelObserver.observe(sentinel);

        return function cleanup() {
          skeletonObserver.disconnect();
          sentinelObserver.disconnect();
          skeletonObserver = null;
          sentinelObserver = null;
          observerRef.current = null;
        };
      }
    }, []);

    // 静态内容由 index.html 提供，组件本身不渲染内容
    return null;
  }

  /* ═══════════════════════════════════════════════════════════════
     自动挂载 —— 等待 GHRANK 就绪后挂载 IndexPage
     原因：text/babel 脚本按文档顺序执行，index.js 可能在 core.js 之前
     ═══════════════════════════════════════════════════════════════ */
  function mountWhenReady() {
    if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
      global.GHRANK.mountChrome('index', IndexPage);
    } else {
      setTimeout(mountWhenReady, 50);
    }
  }

  mountWhenReady();
})(window);
