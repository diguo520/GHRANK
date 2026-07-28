/* ═══════════════════════════════════════════════════════════════════════
   GHRANK // React 19 PROMPT MARKETPLACE — Prompt 页面组件
   ────────────────────────────────────────────────────────────────────────
   依赖：React 19 (UMD)、core.js (GHRANK.mountChrome)
   加载方式：HTML 页面通过 <script type="text/babel"> 引入

   职责：
   1. 轮播图（Carousel）交互
   2. Avatar 在线状态指示
   3. Reward Amount Selector（打赏金额选择）
   4. 动态评论交互（Like / Reply / Collapse / Share）
   5. Follow / Save / Like 按钮
   6. 入场动画（Entrance Animation）
   7. 鼠标光晕追踪 + 分类筛选 + 拖拽滚动 + 分页
   8. 评论星级评分 + 字数计数 + 提交
   9. 图片 Lightbox
   10. 搜索覆盖层（由 core.js 接管，此处保留数据）
   11. 无限滚动加载
   12. 评论排序/筛选 + Load More
   13. 实时统计（Views / Commenters / Comments / Tips）
   14. 活动徽章（Liked / Saved / Tipped）
   15. Prompt 显示（登录门禁）
   16. 评论编辑器登录门禁
   17. Hero 统计实时模拟

   注意：页面静态结构已由 HTML 提供，本组件 return null，
        仅通过 useEffect 管理所有 DOM 交互。
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var { useState, useEffect, useCallback, useRef, useMemo } = React;

  /* ═══════════════════════════════════════════════════════════════
     1. MOCK DATA — 纯数据常量
     ═══════════════════════════════════════════════════════════════ */

  // 搜索数据（仅在搜索覆盖层由 core.js 接管前，提供页面本地搜索候选）
  var SEARCH_DATA = [
    { name: 'Cinematic Portrait Generator', desc: 'Generate photorealistic cinematic portraits with dramatic lighting.', model: 'Midjourney', modelClass: 'tag-midjourney', price: '$4.99', url: 'prompt-detail.html' },
    { name: 'Code Review Assistant v3', desc: 'Advanced code review — quality, security, performance analysis.', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$9.99', url: 'prompt-detail.html' },
    { name: 'Marketing Copy Writer', desc: 'High-converting marketing copy for landing pages and campaigns.', model: 'Claude', modelClass: 'tag-claude', price: '$6.99', url: 'prompt-detail.html' },
    { name: 'Product Mockup Creator', desc: 'Professional product mockups with customizable backgrounds.', model: 'DALL-E 3', modelClass: 'tag-dalle', price: '$7.49', url: 'prompt-detail.html' },
    { name: 'Anime Character Designer', desc: 'Design anime-style characters with detailed prompts.', model: 'Stable Diffusion', modelClass: 'tag-sd', price: '$3.99', url: 'prompt-detail.html' },
    { name: 'API Documentation Generator', desc: 'Auto-generate OpenAPI specs and endpoint docs from code.', model: 'Custom', modelClass: 'tag-custom', price: '$7.99', url: 'prompt-detail.html' },
    { name: 'Cyberpunk Cityscape', desc: 'Neon-lit dystopian cityscapes with rain reflections.', model: 'Midjourney', modelClass: 'tag-midjourney', price: '$2.99', url: 'prompt-detail.html' },
    { name: 'Bug Bounty Hunter', desc: 'AI-assisted vulnerability discovery and exploit analysis.', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$14.99', url: 'prompt-detail.html' },
    { name: 'Research Paper Summarizer', desc: 'Condense academic papers into key findings and citations.', model: 'Claude', modelClass: 'tag-claude', price: '$5.49', url: 'prompt-detail.html' },
    { name: 'Logo Concept Generator', desc: 'Generate unique logo concepts with brand identity.', model: 'DALL-E 3', modelClass: 'tag-dalle', price: '$6.49', url: 'prompt-detail.html' },
    { name: 'Fantasy Landscape Forge', desc: 'Epic fantasy environments with magical atmospheres.', model: 'Stable Diffusion', modelClass: 'tag-sd', price: '$3.49', url: 'prompt-detail.html' },
    { name: 'Regex Pattern Builder', desc: 'Generate and explain complex regex patterns.', model: 'Llama 3', modelClass: 'tag-llama', price: '$2.49', url: 'prompt-detail.html' },
    { name: 'UX Research Interviewer', desc: 'Generate user research questions and interview scripts.', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$4.99', url: 'prompt-detail.html' },
    { name: 'Stable Diffusion Negative Prompt', desc: 'Optimized negative prompts for clean AI image generation.', model: 'Stable Diffusion', modelClass: 'tag-sd', price: '$1.99', url: 'prompt-detail.html' },
    { name: 'SEO Blog Writer Pro', desc: 'SEO-optimized blog posts with keyword integration.', model: 'Claude', modelClass: 'tag-claude', price: '$8.49', url: 'prompt-detail.html' },
    { name: 'Data Visualization Assistant', desc: 'Generate charts, dashboards, and data viz recommendations.', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$5.99', url: 'prompt-detail.html' },
    { name: 'Midjourney Style Transfer', desc: 'Apply artistic styles to images using Midjourney prompts.', model: 'Midjourney', modelClass: 'tag-midjourney', price: '$4.49', url: 'prompt-detail.html' },
    { name: 'UI/UX Design Critic', desc: 'Professional design feedback and improvement suggestions.', model: 'Claude', modelClass: 'tag-claude', price: '$6.99', url: 'prompt-detail.html' },
    { name: 'Gemini Code Explainer', desc: 'Explain complex code with diagrams and analogies.', model: 'Gemini', modelClass: 'tag-gemini', price: '$3.99', url: 'prompt-detail.html' },
    { name: 'Custom Workflow Automator', desc: 'Build automated workflows with custom prompt chains.', model: 'Custom', modelClass: 'tag-custom', price: '$12.99', url: 'prompt-detail.html' }
  ];

  // 无限滚动加载的更多卡片数据
  var MORE_DATA = [
    { model: 'image', height: 'tall', title: 'Cinematic Realistic Portrait', snippet: 'Hyper-realistic cinematic portraits with film grain, bokeh, and dramatic studio lighting.', stars: 5, rating: 284, price: '$5.99', author: 'AlexShader', uses: '2.8K', img: 'prompt_1' },
    { model: 'image', height: 'short', title: 'Masterpiece Japanese Illustration', snippet: 'Traditional Japanese art style with ink wash textures.', stars: 5, rating: 176, price: '$6.49', author: 'WashiMaster', uses: '1.9K', img: 'prompt_2' },
    { model: 'animation', height: 'tall', title: 'Shadow Puppet Theatre', snippet: 'Dramatic shadow play compositions.', stars: 4, rating: 92, price: '$3.49', author: 'ShadowCraft', uses: '756', img: 'prompt_3' },
    { model: 'image', height: 'tall', title: 'Premium Cinematic Advertisement', snippet: 'High-end commercial product renders.', stars: 5, rating: 218, price: '$9.99', author: 'AdForge', uses: '3.1K', img: 'prompt_4' },
    { model: 'image', height: 'short', title: 'Classic Vibrant Illustration', snippet: 'Bold saturated vector art.', stars: 4, rating: 145, price: '$4.49', author: 'ColorBlast', uses: '2.2K', img: 'prompt_5' },
    { model: 'image', height: 'tall', title: 'Vintage Lithograph', snippet: 'Authentic retro print aesthetic.', stars: 5, rating: 167, price: '$3.99', author: 'RetroPress', uses: '1.4K', img: 'prompt_6' },
    { model: 'image', height: 'short', title: 'Vintage Dual-Color Art', snippet: 'Two-tone retro screenprint style.', stars: 4, rating: 89, price: '$2.99', author: 'DualTone', uses: '968', img: 'prompt_7' },
    { model: 'animation', height: 'tall', title: 'Metallic Origami Sculpture', snippet: 'Folded metal paper art.', stars: 5, rating: 203, price: '$4.99', author: 'OrigamiPro', uses: '2.7K', img: 'prompt_8' },
    { model: 'animation', height: 'short', title: 'Handmade Claymation Diorama', snippet: 'Stop-motion style clay figures.', stars: 4, rating: 118, price: '$5.49', author: 'ClayWorks', uses: '887', img: 'prompt_9' },
    { model: 'image', height: 'tall', title: 'Gritty Charcoal', snippet: 'Expressive charcoal sketches.', stars: 4, rating: 76, price: '$2.49', author: 'SketchNinja', uses: '645', img: 'prompt_10' },
    { model: 'image', height: 'tall', title: 'RETRO TECHNICOLOR ODYSSEY', snippet: 'Vibrant 1950s technicolor aesthetics.', stars: 5, rating: 231, price: '$7.99', author: 'RetroFuture', uses: '3.4K', img: 'prompt_11' },
    { model: 'animation', height: 'short', title: '80s Dark Fantasy Animation', snippet: 'Rotoscope-style dark fantasy.', stars: 5, rating: 192, price: '$6.99', author: 'SynthDream', uses: '1.8K', img: 'prompt_12' },
    { model: 'animation', height: 'tall', title: 'Cute Stylish Pixel-Art', snippet: 'Charming retro pixel characters.', stars: 4, rating: 134, price: '$3.49', author: 'PixelQueen', uses: '2.1K', img: 'prompt_13' },
    { model: 'image', height: 'short', title: 'Bold SketchToon Minis', snippet: 'Minimalist cartoon characters.', stars: 4, rating: 87, price: '$2.99', author: 'ToonLab', uses: '723', img: 'prompt_14' },
    { model: 'animation', height: 'tall', title: 'Lego MinifIgures', snippet: 'Brick-built character renders.', stars: 5, rating: 245, price: '$5.49', author: 'BlockBuilder', uses: '2.9K', img: 'prompt_15' },
    { model: 'image', height: 'short', title: 'Neon Comic Pop Art', snippet: 'Bold comic book panels.', stars: 4, rating: 156, price: '$4.49', author: 'PopNeon', uses: '1.5K', img: 'prompt_16' },
    { model: 'animation', height: 'tall', title: 'Pop-up Book Illustration', snippet: 'Paper-cut dimensional scenes.', stars: 5, rating: 198, price: '$6.49', author: 'PaperArt', uses: '2.4K', img: 'prompt_17' },
    { model: 'image', height: 'tall', title: 'NBA LEGEND POSTER', snippet: 'Sports poster art.', stars: 5, rating: 212, price: '$5.99', author: 'SlamDunk', uses: '1.7K', img: 'prompt_18' },
    { model: 'animation', height: 'short', title: '3D Vinyl Collectable Figure', snippet: 'Toy design renders.', stars: 4, rating: 143, price: '$7.49', author: 'ToyLab', uses: '1.2K', img: 'prompt_19' },
    { model: 'image', height: 'tall', title: 'Industrial Concept Design', snippet: 'Hard-surface sci-fi designs.', stars: 5, rating: 187, price: '$8.99', author: 'MechDesign', uses: '2.0K', img: 'prompt_20' }
  ];

  // 自动扩充 MORE_DATA：循环使用现有图片和模板，保证无限滚动有足够数据
  var EXTRA_PROMPT_TEMPLATES = [
    { model: 'image', title: 'Cosmic Nebula Landscape', snippet: 'Deep space nebula photography.', author: 'CosmicEye' },
    { model: 'animation', title: 'Fluid Motion Loop', snippet: 'Seamless abstract motion graphics.', author: 'FlowArt' },
    { model: 'image', title: 'Art Deco Portrait', snippet: '1920s glamour portrait style.', author: 'DecoLady' },
    { model: 'animation', title: 'Surreal Dream Sequence', snippet: 'Dreamlike morphing visuals.', author: 'DreamWeaver' },
    { model: 'image', title: 'Watercolor Botanical', snippet: 'Delicate botanical watercolors.', author: 'BotanicInk' },
    { model: 'animation', title: 'Particle Galaxy Formation', snippet: 'Procedural galaxy simulation.', author: 'StarCoder' },
    { model: 'image', title: 'Brutalist Architecture', snippet: 'Raw concrete architectural photography.', author: 'BetonBrut' },
    { model: 'animation', title: 'Paper Cut Shadow Play', snippet: 'Intricate paper cutout animations.', author: 'CutShadow' },
    { model: 'image', title: 'Neon Tokyo Nightlife', snippet: 'Cyberpunk city scene at night.', author: 'NeonCity' },
    { model: 'animation', title: 'Geometric Kaleidoscope', snippet: 'Hypnotic geometric patterns.', author: 'GeoLens' },
    { model: 'image', title: 'Underwater Fantasy Kingdom', snippet: 'Submerged mythical cityscape.', author: 'AquaRealm' },
    { model: 'animation', title: 'Anime Transformation Sequence', snippet: 'Classic magical girl transformation.', author: 'AnimeLab' },
    { model: 'image', title: 'Oil Paint Impressionism', snippet: 'Monet-style landscape scenes.', author: 'ImpressBox' },
    { model: 'animation', title: 'Steampunk Clockwork', snippet: 'Animated brass gear mechanisms.', author: 'SteamMind' },
    { model: 'image', title: 'Glitch Art Portrait', snippet: 'Databending portrait effects.', author: 'GlitchPop' },
    { model: 'animation', title: 'Isometric Room Design', snippet: 'Cozy isometric room animations.', author: 'IsoRoom' },
    { model: 'image', title: 'Double Exposure Nature', snippet: 'Silhouette with nature overlay.', author: 'DualExpo' },
    { model: 'animation', title: 'Retro VHS Aesthetic', snippet: 'Analog tape distortion effects.', author: 'VHS_Rewind' },
    { model: 'image', title: 'Macro Insect Photography', snippet: 'Ultra-detailed insect close-ups.', author: 'MacroZoo' },
    { model: 'animation', title: 'Liquid Chrome Morphing', snippet: 'Reflective liquid metal surfaces.', author: 'ChromeFlow' },
    { model: 'image', title: 'Abstract Geometric Flow', snippet: 'Flowing geometric abstract patterns.', author: 'AbstractMind' },
    { model: 'animation', title: 'Anime Epic Battle Scene', snippet: 'Dynamic anime action sequence.', author: 'AnimeForge' },
    { model: 'image', title: 'Gothic Cathedral Interior', snippet: 'Soaring Gothic architecture photography.', author: 'ArchLens' },
    { model: 'image animation', title: 'Oil Painting Come Alive', snippet: 'Classical painting animation effect.', author: 'PaintMotion' },
    { model: 'animation', title: 'Fantasy Dragon Rider', snippet: 'Epic fantasy dragon scene.', author: 'DragonArt' },
    { model: 'image', title: 'Sci-Fi Space Station', snippet: 'Orbital station interior design.', author: 'SpaceDock' },
    { model: 'animation', title: 'Nature Time Lapse Bloom', snippet: 'Flower blooming timelapse.', author: 'NatureCam' },
    { model: 'image', title: 'Studio Portrait Lighting', snippet: 'Professional studio portrait setup.', author: 'PortraitPro' },
    { model: 'image animation', title: 'Surreal Floating Islands', snippet: 'Dreamlike floating landscape.', author: 'DreamScape' },
    { model: 'animation', title: 'Technology Circuit Board', snippet: 'Macro circuit board animation.', author: 'TechMicro' },
    { model: 'image', title: 'Minimalist Line Art', snippet: 'Clean single-line illustrations.', author: 'LinePure' },
    { model: 'animation', title: 'Water Ripple Simulation', snippet: 'Realistic water surface physics.', author: 'FluidSim' },
    { model: 'image', title: 'Cyberpunk Street Scene', snippet: 'Neon-lit dystopian alley.', author: 'CyberAlley' },
    { model: 'image', title: 'Enchanted Forest Path', snippet: 'Magical woodland atmosphere.', author: 'ForestMyst' },
    { model: 'animation', title: 'Mechanical Gear Assembly', snippet: 'Clockwork mechanism animation.', author: 'GearWorks' },
    { model: 'image', title: 'Vintage Film Noir', snippet: 'Classic black and white crime scene.', author: 'NoirShot' },
    { model: 'image video', title: 'Aurora Borealis Sky', snippet: 'Northern lights photography.', author: 'AuroraEye' },
    { model: 'animation', title: 'Clay Morph Transition', snippet: 'Smooth claymation transitions.', author: 'MorphClay' },
    { model: 'image', title: 'Pop Art Collage', snippet: 'Warhol-inspired multi-panel art.', author: 'PopCollage' },
    { model: 'image', title: 'Desert Mirage Oasis', snippet: 'Surreal desert landscape.', author: 'DesertDream' },
    { model: 'animation', title: 'DNA Helix Rotation', snippet: 'Scientific molecular animation.', author: 'BioAnim' },
    { model: 'image', title: 'Ukiyo-e Wave Pattern', snippet: 'Japanese woodblock wave art.', author: 'WaveMaster' },
    { model: 'image animation', title: 'Neon Sign Flicker', snippet: 'Realistic neon tube effects.', author: 'NeonGlow' },
    { model: 'animation', title: 'Origami Crane Flight', snippet: 'Paper crane flying animation.', author: 'FoldWing' },
    { model: 'image', title: 'Steampunk Airship', snippet: 'Victorian flying machine concept.', author: 'SteamShip' },
    { model: 'image', title: 'Bioluminescent Cave', snippet: 'Glowing underground cavern.', author: 'GlowCave' },
    { model: 'animation', title: 'Pixel Art Dungeon', snippet: 'Retro game dungeon crawler.', author: 'PixelDungeon' },
    { model: 'image', title: 'Crystal Geode Formation', snippet: 'Macro crystal photography.', author: 'CrystalLens' },
    { model: 'image', title: 'Samurai Sunset Silhouette', snippet: 'Japanese warrior sunset scene.', author: 'SamuraiArt' },
    { model: 'animation', title: 'Smoke wisps Trail', snippet: 'Ethereal smoke particle effect.', author: 'SmokeTrail' },
    { model: 'image', title: 'Art Nouveau Poster', snippet: 'Mucha-style decorative poster.', author: 'NouveauArt' },
    { model: 'image video', title: 'Ocean Storm Waves', snippet: 'Dramatic seascape photography.', author: 'StormSea' },
    { model: 'animation', title: 'Rubik Cube Solve', snippet: 'Satisfying puzzle animation.', author: 'CubeSolver' },
    { model: 'image', title: 'Macro Snowflake Crystal', snippet: 'Ultra-close snowflake detail.', author: 'FrostDetail' },
    { model: 'image', title: 'Graffiti Street Art', snippet: 'Urban mural graffiti style.', author: 'StreetArt' },
    { model: 'animation', title: 'Constellation Drawing', snippet: 'Stars connecting animation.', author: 'StarDraw' },
    { model: 'image', title: 'Terraced Rice Fields', snippet: 'Asian landscape photography.', author: 'RiceTerrace' },
    { model: 'image animation', title: 'Hologram Projection', snippet: 'Futuristic holographic display.', author: 'HoloProj' },
    { model: 'animation', title: 'Bonsai Tree Growth', snippet: 'Time-lapse bonsai cultivation.', author: 'BonsaiGrow' },
    { model: 'image', title: 'Volcanic Eruption Close-up', snippet: 'Dramatic lava flow photography.', author: 'LavaFlow' }
  ];
  var promptImgIdx = 0;
  var snackImgs = ['snackprompt_1.png', 'snackprompt_2.jpg', 'snackprompt_3.png', 'snackprompt_4.png'];
  var allLocalImgs = [];
  for (var li = 1; li <= 20; li++) { allLocalImgs.push('prompt_' + li); }
  for (var pi = 0; pi < EXTRA_PROMPT_TEMPLATES.length; pi++) {
    var tmpl = EXTRA_PROMPT_TEMPLATES[pi];
    // 交替使用本地图片和 snackprompt 远程图片
    var imgSrc;
    if (pi < 20) {
      // 前半段使用本地图片（统一带扩展名）
      promptImgIdx = (promptImgIdx % 20) + 1;
      imgSrc = 'prompt_' + promptImgIdx + '.jpg';
    } else {
      // 后半段交替使用 snackprompt 图片和本地图片
      if ((pi - 20) % 3 === 0) {
        imgSrc = snackImgs[(pi - 20) % snackImgs.length];
      } else {
        promptImgIdx = (promptImgIdx % 20) + 1;
        imgSrc = 'prompt_' + promptImgIdx + '.jpg';
      }
    }
    MORE_DATA.push({
      model: tmpl.model,
      height: pi % 3 === 0 ? 'short' : 'tall',
      title: tmpl.title,
      snippet: tmpl.snippet,
      stars: Math.floor(Math.random() * 2) + 4,
      rating: Math.floor(Math.random() * 200) + 50,
      price: '$' + (Math.floor(Math.random() * 8) + 2) + '.' + (Math.floor(Math.random() * 9) + 1) + '9',
      author: tmpl.author,
      uses: Math.floor(Math.random() * 3000 + 200) >= 1000 ? ((Math.floor(Math.random() * 3000 + 200) / 1000).toFixed(1) + 'K') : String(Math.floor(Math.random() * 3000 + 200)),
      img: imgSrc
    });
  }

  // 无限滚动模型的标签映射
  var MODEL_TAG_MAP = {
    'image': 'tag-image', 'animation': 'tag-animation', 'video': 'tag-video',
    'html': 'tag-html', 'data': 'tag-data'
  };
  var MODEL_LABEL_MAP = {
    'image': 'Image', 'animation': 'Animation', 'video': 'Video',
    'html': 'HTML', 'data': 'Data'
  };

  // 初始 24 张卡片数据（与原 HTML 静态卡片一一对应）
  var INITIAL_DATA = [
    { model: 'image', height: 'tall', img: 'prompt_1', author: 'AlexShader' },
    { model: 'html data', height: 'tall', img: 'prompt_2', author: 'DevPromptMaster' },
    { model: 'animation', height: 'short', img: 'prompt_3', author: 'ShadowCraft' },
    { model: 'video', height: 'tall', img: 'prompt_4', author: 'CineForge' },
    { model: 'image', height: 'short', img: 'prompt_5', author: 'DesignForge' },
    { model: 'image animation', height: 'tall', img: 'prompt_6', author: 'AnimeForge' },
    { model: 'data', height: 'tall', img: 'prompt_7', author: 'DataWizard' },
    { model: 'html', height: 'short', img: 'prompt_8', author: 'TechDocPro' },
    { model: 'video', height: 'tall', img: 'prompt_9', author: 'MotionVault' },
    { model: 'data', height: 'short', img: 'prompt_10', author: 'DataInsight' },
    { model: 'html data', height: 'tall', img: 'prompt_11', author: 'APIBuilder' },
    { model: 'image', height: 'tall', img: 'prompt_12', author: 'WashiMaster' },
    { model: 'animation', height: 'short', img: 'prompt_13', author: 'ClayWorks' },
    { model: 'video', height: 'tall', img: 'prompt_14', author: 'VoxelPro' },
    { model: 'image', height: 'short', img: 'prompt_15', author: 'RetroPress' },
    { model: 'html', height: 'tall', img: 'prompt_16', author: 'CopyGuru' },
    { model: 'data', height: 'tall', img: 'prompt_17', author: 'ScholarAI' },
    { model: 'animation', height: 'short', img: 'prompt_18', author: 'SketchNinja' },
    { model: 'image', height: 'tall', img: 'prompt_19', author: 'RetroFuture' },
    { model: 'animation', height: 'tall', img: 'prompt_20', author: 'SynthDream' },
    { model: 'image', height: 'short', img: 'prompt_12', author: 'PopNeon' },
    { model: 'video', height: 'tall', img: 'prompt_13', author: 'VFXWizard' },
    { model: 'html data', height: 'short', img: 'prompt_14', author: 'PageSmith' },
    { model: 'data', height: 'tall', img: 'prompt_15', author: 'QuantLab' }
  ];

  // 评论随机数据池
  var REVIEW_USERNAMES = [
    'PixelWizard', 'CodeNomad', 'DesignSage', 'DataVoyager', 'PromptHacker',
    'AIMaven', 'SyntaxNinja', 'VectorQueen', 'NeuralFox', 'CloudSculptor',
    'LogiCraft', 'RasterKing', 'FlowState', 'TensorPioneer', 'MetaForge'
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
  var REVIEW_RATINGS = [5, 5, 4, 5, 4, 5, 5, 5, 4, 5, 5, 4, 5, 5, 4];
  var REVIEW_HELPFUL = [12, 8, 3, 5, 7, 15, 2, 9, 4, 11, 6, 1, 10, 3, 8];

  // 活动徽章 SVG 图标
  var ACTIVITY_ICONS = {
    liked:  '<svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M8 14s-5-3-6-7c-1-3 1-5 3-5 1.5 0 2.5 1 3 2 .5-1 1.5-2 3-2 2 0 4 2 3 5-1 4-6 7-6 7z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>',
    saved:  '<svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M4 1h8v14l-4-3-4 3V1z" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
    tipped: '<svg width="9" height="9" viewBox="0 0 16 16" fill="none"><rect x="4" y="5" width="7" height="6" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M11 7h1a1 1 0 0 1 0 2h-1" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>'
  };
  var ACTIVITY_PROB = { liked: 0.55, saved: 0.35, tipped: 0.25 };

  /* ═══════════════════════════════════════════════════════════════
     2. 纯函数工具（无状态依赖，组件外定义）
     ═══════════════════════════════════════════════════════════════ */

  function formatNum(n) {
    if (n >= 1000) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return n.toString();
  }

  function starsHTML(count) {
    var s = '';
    for (var i = 0; i < 5; i++) {
      s += i < count ? '\u2605' : '\u2606';
    }
    return s;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function isLoggedIn() {
    try { return localStorage.getItem('ghrank_logged_in') === '1'; }
    catch (e) { return false; }
  }

  // Toast 通知（全局唯一，供多处复用）
  function showToast(message) {
    var existing = document.querySelector('.review-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'review-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }
  // 暴露为全局，供打赏按钮等其他模块复用同款底部 toast
  global.showToast = showToast;

  // 创建评论 HTML
  function createReviewHTML(username, comment, rating, helpful, avatarIndex, includeImages, activeFilter) {
    var imgNum = (avatarIndex % 20) + 1;
    var ago = Math.floor(Math.random() * 14) + 1;
    var agoText = ago === 1 ? '1 day ago' : ago + ' days ago';
    var date = new Date();
    date.setDate(date.getDate() - ago);
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
        '<div class="thread-avatar online" style="background:rgba(88,166,255,0.12);color:#58A6FF;">' +
          '<img src="../styles/images/demo/prompt_' + imgNum + '.jpg" alt="" class="thread-avatar-img">' +
        '</div>' +
        '<div class="thread-body">' +
          '<div class="thread-meta">' +
            '<span class="thread-author"><span class="at-prefix">@</span>' + username + '</span>' +
            '<span class="thread-badge">Purchased</span>' +
            '<span class="thread-date">' + dateStr + '</span>' +
            '<span class="thread-floor">#' + floor + '</span>' +
          '</div>' +
          '<p class="thread-text">' + comment + '</p>' +
          imagesHtml +
          '<div class="thread-actions">' +
            '<button class="thread-action-btn like-btn" data-liked="false">' +
              '<span class="like-icon">&#x2B06;</span> Helpful <span class="like-count">' + helpful + '</span>' +
            '</button>' +
            '<button class="thread-action-btn thread-reply-toggle">&#x21A9; ' + replyText + '</button>' +
            '<button class="thread-action-btn thread-collapse-btn">&#x25B2; Collapse</button>' +
            '<button class="thread-action-btn thread-share-btn">&#x1F517; Share</button>' +
          '</div>' +
          '<div class="thread-reply-form hidden">' +
            '<div class="reply-form-header">' +
              '<span class="reply-form-to">Replying to <strong>@' + username + '</strong></span>' +
              '<button class="reply-form-close">&times;</button>' +
            '</div>' +
            '<div class="reply-tiptap-host" data-placeholder="Write a reply..."></div>' +
            '<div class="reply-form-actions">' +
              '<button class="reply-submit">Reply</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // 活动徽章 HTML
  function badgeHTML(type, value) {
    var icon = ACTIVITY_ICONS[type] || '';
    var label = type === 'tipped' ? '+$' + value : '+' + value;
    return '<span class="thread-activity ' + type + '">' +
             '<span class="ta-icon">' + icon + '</span>' +
             label +
           '</span>';
  }

  function decideActivities(activeFilter) {
    var out = [];
    if (activeFilter === 'liked' || Math.random() < ACTIVITY_PROB.liked) {
      out.push({ type: 'liked', value: 1 });
    }
    if (activeFilter === 'saved' || Math.random() < ACTIVITY_PROB.saved) {
      out.push({ type: 'saved', value: 1 });
    }
    if (activeFilter === 'tipped' || Math.random() < ACTIVITY_PROB.tipped) {
      var pool = [1, 1, 1, 2, 3, 3, 5, 5, 8, 10];
      out.push({ type: 'tipped', value: pool[Math.floor(Math.random() * pool.length)] });
    }
    return out;
  }

  function applyBadgesToThread(thread, activeFilter) {
    if (!thread) return;
    var meta = thread.querySelector('.thread-meta');
    if (!meta) return;
    if (thread.getAttribute('data-activity-tagged') === '1') return;
    thread.setAttribute('data-activity-tagged', '1');

    var acts = decideActivities(activeFilter);
    if (!acts.length) return;

    var anchor = meta.querySelector('.thread-badge') || meta.querySelector('.thread-author');
    if (!anchor) return;

    var frag = document.createDocumentFragment();
    acts.forEach(function (a, i) {
      var node = document.createElement('span');
      node.innerHTML = badgeHTML(a.type, a.value);
      var el = node.firstChild;
      el.style.animationDelay = (i * 60) + 'ms';
      frag.appendChild(el);
    });
    if (anchor.nextSibling) {
      meta.insertBefore(frag, anchor.nextSibling);
    } else {
      meta.appendChild(frag);
    }
  }

  function applyToAllThreads(scope, activeFilter) {
    var root = scope || document;
    var threads = root.querySelectorAll('.thread');
    threads.forEach(function (t) { applyBadgesToThread(t, activeFilter); });
  }

  /* ═══════════════════════════════════════════════════════════════
     3. PromptPage React 组件
        return null — 静态 HTML 已由页面提供
        所有 DOM 交互通过 useEffect 管理
     ═══════════════════════════════════════════════════════════════ */
  function PromptPage() {

    // ── 组件内部状态 ──
    // 活动徽章筛选（liked/saved/tipped 对应 filter chip）
    var [activeFilter, setActiveFilter] = useState('all');

    // ── Refs：可变数据源（无需触发重渲染）──
    var carouselCurrentRef = useRef(0);
    var scrollPageRef = useRef(1);
    var scrollLoadingRef = useRef(false);
    var scrollExhaustedRef = useRef(false);
    var promptObserverRef = useRef(null);
    var reviewsPageRef = useRef(1);
    var reviewsFilterRef = useRef('all');
    var ioObserverRef = useRef(null);
    var activityObsRef = useRef(null);

    // ── 定时器 refs（清理用）──
    var timersRef = useRef([]);

    // ── 初始评论 HTML 快照 ref ──
    var initialReviewsRef = useRef('');

    // ── Detail page 统计 ──
    var detailStatsRef = useRef({
      views: 12847, commenters: 186, comments: 248, tips: 94
    });

    // ── Hero 统计 ──
    var heroStatsRef = useRef({
      total: 12487, creators: 3842, tips: 1247
    });

    // ═══════════════════════════════════════════════════════════════
    //   EFFECT 1: 初始化 — 单次挂载，合并所有 init 逻辑
    // ═══════════════════════════════════════════════════════════════
    useEffect(function () {
      var timers = [];
      var observers = [];
      // 集中管理 document 级事件监听器，cleanup 时统一移除（防止内存泄漏）
      var docHandlers = [];
      function addDocListener(type, handler) {
        document.addEventListener(type, handler);
        docHandlers.push({ type: type, handler: handler });
      }

      // ─── 1a. Carousel（轮播图）───
      var track = document.getElementById('previewTrack');
      var prevBtn = document.getElementById('carouselPrev');
      var nextBtn = document.getElementById('carouselNext');
      var dots = document.getElementById('carouselDots');
      if (track && dots) {
        var slides = track.querySelectorAll('.detail-preview-slide');
        var total = slides.length;
        if (total < 2) {
          if (prevBtn) prevBtn.style.display = 'none';
          if (nextBtn) nextBtn.style.display = 'none';
        } else {
          carouselCurrentRef.current = 0;
          function goTo(index) {
            if (index < 0) index = total - 1;
            if (index >= total) index = 0;
            carouselCurrentRef.current = index;
            track.style.transform = 'translateX(-' + (index * 100) + '%)';
            var dotEls = dots.querySelectorAll('.carousel-dot');
            dotEls.forEach(function (d, i) {
              d.classList.toggle('active', i === index);
            });
          }
          if (prevBtn) prevBtn.addEventListener('click', function () { goTo(carouselCurrentRef.current - 1); });
          if (nextBtn) nextBtn.addEventListener('click', function () { goTo(carouselCurrentRef.current + 1); });
          dots.querySelectorAll('.carousel-dot').forEach(function (dot, i) {
            dot.addEventListener('click', function () { goTo(i); });
          });
          // 键盘导航
          var keyHandler = function (e) {
            if (e.key === 'ArrowLeft' && document.querySelector('.detail-preview-carousel:hover')) {
              goTo(carouselCurrentRef.current - 1);
            }
            if (e.key === 'ArrowRight' && document.querySelector('.detail-preview-carousel:hover')) {
              goTo(carouselCurrentRef.current + 1);
            }
          };
          addDocListener('keydown', keyHandler);
        }
      }

      // ─── 1b. Avatar Online Presence ──
      var avatars = document.querySelectorAll('.thread-avatar:not(.online)');
      avatars.forEach(function (av) {
        var r = Math.random();
        if (r < 0.6) av.classList.add('online');
        else if (r < 0.8) av.classList.add('online', 'away');
        else av.classList.add('online', 'offline');
      });

      // ─── 1c. Reward Amount Selector ──
      var rewardBtns = document.querySelectorAll('.reward-amount-btn');
      var totalEl = document.querySelector('.reward-total');
      var supportBtn = document.querySelector('.reward-support-btn');
      if (rewardBtns.length && totalEl) {
        function updateTotal(amount) {
          totalEl.textContent = '$' + amount.toFixed(2);
        }
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
            if (!isLoggedIn()) {
              if (typeof global.showToast === 'function') {
                global.showToast('Please log in to send a tip');
              }
              return;
            }
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

      // ─── 1d. Dynamic Review Interactions — Event Delegation ──

      // Like button（事件委托）
      function handleLike(e) {
        var btn = e.target.closest('.like-btn');
        if (!btn) return;
        var isLiked = btn.getAttribute('data-liked') === 'true';
        var countEl = btn.querySelector('.like-count');
        var count = countEl ? parseInt(countEl.textContent) : 0;
        if (isLiked) {
          btn.setAttribute('data-liked', 'false');
          btn.classList.remove('liked');
          if (countEl) countEl.textContent = count - 1;
        } else {
          btn.setAttribute('data-liked', 'true');
          btn.classList.add('liked');
          if (countEl) countEl.textContent = count + 1;
          var particle = document.createElement('span');
          particle.className = 'like-particle';
          particle.textContent = '+1';
          btn.appendChild(particle);
          setTimeout(function () { particle.remove(); }, 800);
        }
      }
      addDocListener('click', handleLike);

      // Reply toggle（事件委托）
      function handleReplyToggle(e) {
        var btn = e.target.closest('.thread-reply-toggle');
        if (!btn) return;
        if (!isLoggedIn()) { showToast('Please log in to reply'); return; }
        var thread = btn.closest('.thread-op') || btn.closest('.thread-body') || btn.closest('.thread');
        var replyForm = thread ? thread.querySelector('.thread-reply-form') : null;
        if (!replyForm) return;
        var isOpening = replyForm.classList.contains('hidden');
        replyForm.classList.toggle('hidden');
        if (!replyForm.classList.contains('hidden')) {
          initReplyEditor(replyForm, '');
        } else {
          destroyReplyEditor(replyForm);
        }
      }
      addDocListener('click', handleReplyToggle);

      // Reply-to-Reply（事件委托）
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
        initReplyEditor(replyForm, '');
      }
      addDocListener('click', handleReplyToReply);

      // Reply form close
      function handleReplyFormClose(e) {
        var btn = e.target.closest('.reply-form-close');
        if (!btn) return;
        var form = btn.closest('.thread-reply-form');
        if (form) {
          destroyReplyEditor(form);
          var host = form.querySelector('.reply-tiptap-host');
          if (host) host.innerHTML = '';
          form.classList.add('hidden');
        }
      }
      addDocListener('click', handleReplyFormClose);

      // Reply submit
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
        var mentionHtml = replyToName
          ? '<span class="reply-mention">@' + replyToName + '</span> '
          : '';
        var replyNode = document.createElement('div');
        replyNode.className = 'thread-reply';
        replyNode.setAttribute('data-reply-floor', 'new');
        replyNode.innerHTML =
          '<div class="thread-avatar small online" style="background:rgba(88,166,255,0.12);color:#58A6FF;">' +
            '<img src="../styles/images/demo/prompt_1.jpg" alt="" class="thread-avatar-img">' +
          '</div>' +
          '<div class="thread-body">' +
            '<div class="thread-meta">' +
              '<span class="thread-author"><span class="at-prefix">@</span>You</span>' +
              '<span class="thread-activity liked"><span class="ta-icon"><svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M8 14s-5-3-6-7c-1-3 1-5 3-5 1.5 0 2.5 1 3 2 .5-1 1.5-2 3-2 2 0 4 2 3 5-1 4-6 7-6 7z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg></span> +1</span>' +
              '<span class="thread-date">Just now</span>' +
            '</div>' +
            '<p class="thread-text">' + mentionHtml + text + '</p>' +
            '<div class="thread-actions reply-actions">' +
              '<button class="thread-action-btn like-btn small" data-liked="false">' +
                '<span class="like-icon">&#x2B06;</span> <span class="like-count">0</span>' +
              '</button>' +
              '<button class="thread-action-btn reply-to-reply">&#x21A9; Reply</button>' +
            '</div>' +
          '</div>';
        if (repliesWrap) {
          repliesWrap.appendChild(replyNode);
        } else if (thread) {
          var wrap = document.createElement('div');
          wrap.className = 'thread-replies';
          wrap.appendChild(replyNode);
          thread.appendChild(wrap);
        }
        showToast('Reply posted' + (replyToName ? ' to @' + replyToName : ''));
        destroyReplyEditor(form);
        var host = form.querySelector('.reply-tiptap-host');
        if (host) host.innerHTML = '';
        form.classList.add('hidden');
      }
      addDocListener('click', handleReplySubmit);

      // Collapse / Expand
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

      // Share button
      function handleShare(e) {
        var btn = e.target.closest('.thread-share-btn');
        if (!btn) return;
        var thread = btn.closest('.thread');
        var floor = thread ? thread.getAttribute('data-floor') || '' : '';
        if (navigator.clipboard) {
          var url = window.location.href + '#review-' + floor;
          navigator.clipboard.writeText(url).then(function () {
            showToast('Link copied to clipboard!');
          });
        } else {
          showToast('Link copied!');
        }
      }
      addDocListener('click', handleShare);

      // ─── 1e. Detail page: Follow / Save / Like ───
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
          if (bookmarkCountEl) {
            bookmarkCountEl.textContent = bookmarkCount >= 1000
              ? (bookmarkCount / 1000).toFixed(1) + 'K'
              : bookmarkCount;
          }
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
          if (likeCountEl) {
            likeCountEl.textContent = likeCount >= 1000
              ? (likeCount / 1000).toFixed(1) + 'K'
              : likeCount;
          }
          likeBtn.classList.remove('pop');
          void likeBtn.offsetWidth;
          likeBtn.classList.add('pop');
          showToast(isActive ? 'Liked!' : 'Like removed');
        });
      }

      // ─── 1g. Mouse glow + Category chips + Drag scroll + Pagination ───
      var cards = document.querySelectorAll('.prompt-card, .related-card, .review-item');
      cards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
          card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
      });

      var chips = document.querySelectorAll('.prompt-chip');
      var allCards = document.querySelectorAll('.prompt-card');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          // Toggle：再次点击已选中的分类则恢复全部
          var wasActive = chip.classList.contains('active');
          var selectedModel = chip.getAttribute('data-model');

          // 如果点击的是非 "All" 且已激活，取消并恢复 "All"
          if (wasActive && selectedModel !== 'all') {
            chip.classList.remove('active');
            var allChip = document.querySelector('.prompt-chip[data-model="all"]');
            if (allChip) allChip.classList.add('active');
            selectedModel = 'all';
          } else {
            chips.forEach(function (c) { c.classList.remove('active'); });
            chip.classList.add('active');
          }

          allCards.forEach(function (card, i) {
            var cardModels = (card.getAttribute('data-model') || '').split(' ');
            var show = selectedModel === 'all' || cardModels.indexOf(selectedModel) !== -1;
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
        });
      });

      // Category drag scrolling
      var scrollEl = document.getElementById('promptCategoryScroll');
      if (scrollEl) {
        var isDown = false;
        var startX = 0;
        var scrollLeft = 0;
        scrollEl.addEventListener('mousedown', function (e) {
          isDown = true;
          scrollEl.classList.add('active');
          startX = e.pageX - scrollEl.offsetLeft;
          scrollLeft = scrollEl.scrollLeft;
        });
        scrollEl.addEventListener('mouseleave', function () {
          isDown = false;
          scrollEl.classList.remove('active');
        });
        scrollEl.addEventListener('mouseup', function () {
          isDown = false;
          scrollEl.classList.remove('active');
        });
        scrollEl.addEventListener('mousemove', function (e) {
          if (!isDown) return;
          e.preventDefault();
          var x = e.pageX - scrollEl.offsetLeft;
          var walk = (x - startX) * 2;
          scrollEl.scrollLeft = scrollLeft - walk;
        });
        scrollEl.addEventListener('wheel', function (e) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            scrollEl.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }

      // Pagination
      var pageBtns = document.querySelectorAll('.page-btn');
      pageBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (btn.textContent.match(/[\u2190\u2194]/)) return;
          pageBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        });
      });

      // ─── 1h. Reviews: Star Rating Picker + Char Counter + Submit ───
      var allStarPickers = document.querySelectorAll('.compose-rating-picker');
      allStarPickers.forEach(function (picker) {
        var stars = picker.querySelectorAll('.rate-star');
        stars.forEach(function (star) {
          star.addEventListener('mouseenter', function () {
            var val = parseInt(star.getAttribute('data-val'));
            stars.forEach(function (s) {
              s.textContent = parseInt(s.getAttribute('data-val')) <= val ? '\u2605' : '\u2606';
            });
          });
        });
        picker.addEventListener('mouseleave', function () {
          var activeVal = picker.getAttribute('data-rating') || 0;
          stars.forEach(function (s) {
            s.textContent = parseInt(s.getAttribute('data-val')) <= parseInt(activeVal) ? '\u2605' : '\u2606';
          });
        });
        stars.forEach(function (star) {
          star.addEventListener('click', function () {
            var val = parseInt(star.getAttribute('data-val'));
            picker.setAttribute('data-rating', val);
            stars.forEach(function (s) {
              var sv = parseInt(s.getAttribute('data-val'));
              s.classList.toggle('active', sv <= val);
              s.textContent = sv <= val ? '\u2605' : '\u2606';
            });
          });
        });
      });

      var composeInput = document.querySelector('.compose-input');
      var charCounter = document.getElementById('charCounter');
      if (composeInput && charCounter) {
        composeInput.addEventListener('input', function () {
          var len = composeInput.value.length;
          charCounter.textContent = len;
          if (len > 500) {
            charCounter.classList.add('over-limit');
          } else {
            charCounter.classList.remove('over-limit');
          }
        });
      }

      var submitBtn = document.querySelector('.compose-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', function () {
          var input = document.querySelector('.compose-input');
          if (!input || !input.value.trim()) return;
          showToast('Review submitted successfully!');
          input.value = '';
          if (charCounter) {
            charCounter.textContent = '0';
            charCounter.classList.remove('over-limit');
          }
          var mainPicker = document.querySelector('.compose-rating-picker');
          if (mainPicker) {
            mainPicker.removeAttribute('data-rating');
            mainPicker.querySelectorAll('.rate-star').forEach(function (s) {
              s.classList.remove('active');
              s.textContent = '\u2606';
            });
          }
        });
      }

      // ─── 1i. Image Lightbox ───
      var lightbox = document.getElementById('imageLightbox');
      var lightboxImage = lightbox ? lightbox.querySelector('.lightbox-image') : null;
      var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
      var lightboxOverlay = lightbox ? lightbox.querySelector('.lightbox-overlay') : null;
      var currentLightboxImages = [];
      var currentLightboxIndex = 0;

      function handleLightboxOpen(e) {
        var thumb = e.target.closest('.thread-image-thumb');
        if (!thumb || !lightbox || !lightboxImage) return;
        var thread = thumb.closest('.thread-op') || thumb.closest('.thread');
        var allThumbs = thread ? thread.querySelectorAll('.thread-image-thumb') : [];
        currentLightboxImages = [];
        allThumbs.forEach(function (t, i) {
          currentLightboxImages.push(t);
          if (t === thumb) currentLightboxIndex = i;
        });
        var imgEl = thumb.querySelector('img');
        var imgSrc = imgEl ? imgEl.getAttribute('src') || imgEl.getAttribute('data-lazy') : '';
        if (!imgSrc) {
          var bg = getComputedStyle(thumb).backgroundImage;
          if (bg && bg !== 'none') {
            imgSrc = bg.replace(/url\(["']?/, '').replace(/["']?\)/, '');
          }
        }
        if (imgSrc) {
          lightboxImage.style.backgroundImage = 'url(' + imgSrc + ')';
        }
        var classList = thumb.className.split(' ').filter(function (c) { return c.startsWith('grad-'); });
        lightboxImage.className = 'lightbox-image ' + (classList[0] || '');
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
              var thumb = currentLightboxImages[currentLightboxIndex];
              var classList = thumb.className.split(' ').filter(function (c) { return c.startsWith('grad-'); });
              lightboxImage.className = 'lightbox-image ' + (classList[0] || '');
              var navImg = thumb.querySelector('img');
              var navSrc = navImg ? navImg.getAttribute('src') || navImg.getAttribute('data-lazy') : '';
              if (navSrc) lightboxImage.style.backgroundImage = 'url(' + navSrc + ')';
            }
          };
        }
        if (lbPrevBtn) lbPrevBtn.addEventListener('click', navLightbox(-1));
        if (lbNextBtn) lbNextBtn.addEventListener('click', navLightbox(1));

        function handleLightboxKeydown(e) {
          if (lightbox.classList.contains('hidden')) return;
          if (e.key === 'Escape') closeLightbox();
          if (e.key === 'ArrowLeft' && lbPrevBtn) lbPrevBtn.click();
          if (e.key === 'ArrowRight' && lbNextBtn) lbNextBtn.click();
        }
        addDocListener('keydown', handleLightboxKeydown);
      }

      // ─── 1j. Search Overlay（由 core.js 接管时跳过）───
      var overlay = document.getElementById('searchOverlay');
      var backdrop = document.getElementById('searchBackdrop');
      var input = document.getElementById('searchOverlayInput');
      var results = document.getElementById('searchResults');
      var activeIndex = -1;
      // 若 React 尚未挂载覆盖层，跳过本页绑定，交由 core.js 统一处理
      if (overlay && input && results && backdrop) {
        function openSearch() {
          overlay.classList.add('open');
          input.value = '';
          results.innerHTML = '';
          activeIndex = -1;
          setTimeout(function () { input.focus(); }, 100);
        }
        function closeSearch() {
          overlay.classList.remove('open');
          activeIndex = -1;
        }
        function highlightMatch(name) {
          var q = input.value.trim();
          if (!q) return name;
          var regex = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
          return name.replace(regex, '<span style="color:var(--gold)">$1</span>');
        }
        function renderResults(items) {
          if (items.length === 0) {
            results.innerHTML =
              '<div class="search-results-empty">' +
                '<div class="search-results-empty-icon">&#x23F3;</div>' +
                '<div class="search-results-empty-text">No prompts found</div>' +
                '<div class="search-results-empty-hint">Try a different search term</div>' +
              '</div>';
            return;
          }
          var html = '<div class="search-results-header">' +
            '<span class="search-results-label">// PROMPT RESULTS</span>' +
            '<span class="search-results-count">' + items.length + ' of ' + SEARCH_DATA.length + '</span>' +
          '</div>';
          items.forEach(function (item, idx) {
            var initial = item.name.charAt(0).toUpperCase();
            html += '<a href="' + item.url + '" class="search-result-item" data-index="' + idx + '">' +
              '<div class="search-result-avatar">' + initial + '</div>' +
              '<div class="search-result-info">' +
                '<div class="search-result-name">' + highlightMatch(item.name) + '</div>' +
                '<div class="search-result-desc">' + item.desc + '</div>' +
              '</div>' +
              '<div class="search-result-meta">' +
                '<span class="search-result-stars">' + item.price + '</span>' +
                '<span class="search-result-model-tag ' + item.modelClass + '">' + item.model + '</span>' +
              '</div>' +
            '</a>';
          });
          results.innerHTML = html;
        }
        function doSearch(query) {
          var q = query.trim().toLowerCase();
          if (!q) { results.innerHTML = ''; activeIndex = -1; return; }
          var matched = SEARCH_DATA.filter(function (item) {
            return item.name.toLowerCase().indexOf(q) !== -1 ||
                   item.desc.toLowerCase().indexOf(q) !== -1 ||
                   item.model.toLowerCase().indexOf(q) !== -1;
          }).slice(0, 6);
          activeIndex = -1;
          renderResults(matched);
        }
        function updateActiveIndex() {
          var items = results.querySelectorAll('.search-result-item');
          items.forEach(function (item, i) {
            item.classList.toggle('active', i === activeIndex);
          });
          if (activeIndex >= 0 && items[activeIndex]) {
            items[activeIndex].scrollIntoView({ block: 'nearest' });
          }
        }
        var searchBox = document.querySelector('.search-box');
        if (searchBox) {
          searchBox.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openSearch();
          });
        }
        function handleSearchKeydown(e) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (overlay.classList.contains('open')) closeSearch();
            else openSearch();
            return;
          }
          if (!overlay.classList.contains('open')) return;
          if (e.key === 'Escape') { closeSearch(); return; }
          var items = results.querySelectorAll('.search-result-item');
          if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); updateActiveIndex(); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, -1); updateActiveIndex(); }
          else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) { e.preventDefault(); items[activeIndex].click(); }
        }
        addDocListener('keydown', handleSearchKeydown);
        input.addEventListener('input', function () { doSearch(input.value); });
        backdrop.addEventListener('click', closeSearch);
      }

      // ─── 1j. 骨架屏初始化：Intersection Observer 逐块替换为真实卡片 ───
      var initGrid = document.getElementById('featuredGrid');
      var initSkeletons = initGrid ? initGrid.querySelectorAll('.skeleton-card[data-skeleton-idx]') : [];
      if (initSkeletons.length > 0 && 'IntersectionObserver' in window) {
        // 创建真实卡片的通用函数
        function buildCard(item) {
          var card = document.createElement('div');
          card.className = 'prompt-card';
          card.setAttribute('data-model', item.model);
          card.setAttribute('data-height', item.height || 'tall');
          card.onclick = function () { window.location.href = 'prompt-detail.html'; };
          var models = item.model.split(' ');
          var tagsHtml = '';
          models.forEach(function (m) {
            var tagClass = MODEL_TAG_MAP[m] || 'tag-image';
            var label = MODEL_LABEL_MAP[m] || 'Image';
            tagsHtml += '<span class="prompt-card-tag ' + tagClass + '">' + label + '</span>';
          });
          var imgPath = item.img.includes('.') ? item.img : item.img + '.jpg';
          var imgSrc = '../styles/images/demo/' + imgPath;
          card.innerHTML =
            '<div class="prompt-card-inner" style="background:var(--bg-panel)">' +
              '<img src="' + imgSrc + '" alt="" class="prompt-card-img" style="opacity:0;transition:opacity 0.5s ease">' +
              '<button class="prompt-card-bookmark" onclick="event.stopPropagation();this.classList.toggle(\'bookmarked\')">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>' +
                '</svg>' +
              '</button>' +
              '<div class="prompt-card-overlay">' +
                '<div class="prompt-card-overlay-top">' + tagsHtml + '</div>' +
                '<div class="prompt-card-overlay-bottom">' +
                  '<div class="prompt-card-overlay-author">' +
                    '<div class="prompt-card-overlay-avatar"><img src="' + imgSrc + '" alt=""></div>' +
                    '<span class="prompt-card-overlay-name">' + item.author + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          var img = card.querySelector('.prompt-card-img');
          if (img) {
            if (img.complete && img.naturalWidth > 0) { img.style.opacity = '1'; }
            else { img.onload = function () { this.style.opacity = '1'; }; }
          }
          return card;
        }

        // 记录已替换的索引，防止重复
        var revealedSet = new Set();

        // 分块阈值：每次 observer 触发时，替换当前可见批次
        // 使用 rootMargin 200px 提前触发
        var skelObserver = new IntersectionObserver(function (entries) {
          // 收集当前可见且未替换的骨架屏索引
          var batchIndices = [];
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var idx = parseInt(entry.target.getAttribute('data-skeleton-idx'), 10);
              if (!isNaN(idx) && !revealedSet.has(idx)) {
                batchIndices.push(idx);
              }
            }
          });
          if (batchIndices.length === 0) return;

          // 对索引排序，按顺序替换
          batchIndices.sort(function (a, b) { return a - b; });
          batchIndices.forEach(function (idx) {
            if (idx >= INITIAL_DATA.length) return;
            var skel = initGrid.querySelector('.skeleton-card[data-skeleton-idx="' + idx + '"]');
            if (!skel || revealedSet.has(idx)) return;
            revealedSet.add(idx);
            var realCard = buildCard(INITIAL_DATA[idx]);
            skel.replaceWith(realCard);
            skelObserver.unobserve(skel);
          });

          // 全部替换完毕后断开 observer
          if (revealedSet.size >= Math.min(INITIAL_DATA.length, initSkeletons.length)) {
            skelObserver.disconnect();
          }
        }, { rootMargin: '200px 0px' });

        initSkeletons.forEach(function (skel) { skelObserver.observe(skel); });
        observers.push(skelObserver);
      }

      // ─── 1k. Infinite Scroll（骨架屏 + Observer 重新触发 + 数据耗尽停止） ───
      var grid = document.getElementById('featuredGrid');
      var sentinel = document.getElementById('scrollSentinel');
      if (grid && sentinel) {
        // 骨架屏 shimmer 背景（内联复用，避免外部依赖）
        var SKEL_SHIMMER = 'background:linear-gradient(90deg,var(--surface) 25%,var(--surface-overlay) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;';

        function loadMore() {
          if (scrollLoadingRef.current || scrollExhaustedRef.current) return;
          scrollLoadingRef.current = true;
          sentinel.classList.add('loading');

          var start = (scrollPageRef.current - 1) * 6;
          var batch = MORE_DATA.slice(start, start + 6);
          var BATCH_SIZE = batch.length;

          if (BATCH_SIZE === 0) {
            scrollExhaustedRef.current = true;
            scrollLoadingRef.current = false;
            sentinel.classList.remove('loading');
            sentinel.innerHTML = '<div class="scroll-loader" style="opacity:0.4;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;">// END OF FEED</div>';
            if (promptObserverRef.current) promptObserverRef.current.unobserve(sentinel);
            return;
          }

          // 第一步：插入骨架屏占位到 sentinel 前，保持 Grid 空间
          var skeletonEls = [];
          var skelFrag = document.createDocumentFragment();
          for (var s = 0; s < BATCH_SIZE; s++) {
            var skelItem = batch[s];
            var skel = document.createElement('div');
            skel.className = 'skeleton-card prompt-card';
            skel.setAttribute('data-model', skelItem.model);
            skel.setAttribute('data-height', skelItem.height || 'tall');
            skel.style.pointerEvents = 'none';
            skel.innerHTML = '<div style="' + SKEL_SHIMMER + 'border-radius:8px;height:100%;width:100%"></div>';
            skelFrag.appendChild(skel);
            skeletonEls.push(skel);
          }
          grid.insertBefore(skelFrag, sentinel);

          // 第二步：创建真实卡片 Fragment（不立即插入）
          var cardFrag = document.createDocumentFragment();
          batch.forEach(function (item, idx) {
            var card = document.createElement('div');
            card.className = 'prompt-card';
            card.setAttribute('data-model', item.model);
            card.setAttribute('data-height', item.height || 'tall');
            card.onclick = function () { window.location.href = 'prompt-detail.html'; };

            var models = item.model.split(' ');
            var tagsHtml = '';
            models.forEach(function (m) {
              var tagClass = MODEL_TAG_MAP[m] || 'tag-image';
              var label = MODEL_LABEL_MAP[m] || 'Image';
              tagsHtml += '<span class="prompt-card-tag ' + tagClass + '">' + label + '</span>';
            });
            var imgPath = item.img.includes('.') ? item.img : item.img + '.jpg';
            var imgSrc = '../styles/images/demo/' + imgPath;

            card.innerHTML =
              '<div class="prompt-card-inner" style="background:var(--bg-panel)">' +
                '<img src="' + imgSrc + '" alt="" class="prompt-card-img" style="opacity:0;transition:opacity 0.5s ease">' +
                '<button class="prompt-card-bookmark" onclick="event.stopPropagation();this.classList.toggle(\'bookmarked\')">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>' +
                  '</svg>' +
                '</button>' +
                '<div class="prompt-card-overlay">' +
                  '<div class="prompt-card-overlay-top">' + tagsHtml + '</div>' +
                  '<div class="prompt-card-overlay-bottom">' +
                    '<div class="prompt-card-overlay-author">' +
                      '<div class="prompt-card-overlay-avatar">' +
                        '<img src="' + imgSrc + '" alt="">' +
                      '</div>' +
                      '<span class="prompt-card-overlay-name">' + item.author + '</span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>';

            // 图片加载完成后渐入
            var img = card.querySelector('.prompt-card-img');
            if (img) {
              if (img.complete && img.naturalWidth > 0) {
                img.style.opacity = '1';
              } else {
                img.onload = function () { this.style.opacity = '1'; };
                img.onerror = function () { this.style.opacity = '1'; this.style.objectFit = 'contain'; };
              }
            }

            cardFrag.appendChild(card);
          });

          // 第三步：用真实卡片原位替换骨架屏（逐个 replaceWith，保持 Grid 位置不变）
          skeletonEls.forEach(function (skel) {
            if (skel.parentNode === grid) {
              // 从 cardFrag 中取第一个真实卡片来替换
              var realCard = cardFrag.firstChild;
              if (realCard) {
                skel.replaceWith(realCard);
              } else {
                skel.remove();
              }
            }
          });

          scrollPageRef.current++;
          scrollLoadingRef.current = false;
          sentinel.classList.remove('loading');

          // 重新 observe sentinel
          if (promptObserverRef.current && !scrollExhaustedRef.current) {
            promptObserverRef.current.unobserve(sentinel);
            setTimeout(function () {
              if (promptObserverRef.current && !scrollExhaustedRef.current) {
                promptObserverRef.current.observe(sentinel);
              }
            }, 50);
          }
        }
        if ('IntersectionObserver' in window) {
          promptObserverRef.current = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && !scrollLoadingRef.current && !scrollExhaustedRef.current) {
                loadMore();
              }
            });
          }, { rootMargin: '200px' });
          promptObserverRef.current.observe(sentinel);
          observers.push(promptObserverRef.current);
        }
      }

      // ─── 1l. Reviews: Sort/Filter + Load More ───
      var container = document.getElementById('discussionsContainer');
      var loadMoreBtn = document.querySelector('.load-more-btn');
      var toolbarChips = document.querySelectorAll('.toolbar-chip');
      reviewsFilterRef.current = 'all';

      if (container) {
        // 快照初始评论 HTML
        initialReviewsRef.current = container.innerHTML;

        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', function () {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
            setTimeout(function () {
              var shuffledNames = shuffle(REVIEW_USERNAMES);
              var shuffledComments = shuffle(REVIEW_COMMENTS);
              var shuffledRatings = shuffle(REVIEW_RATINGS);
              var shuffledHelpful = shuffle(REVIEW_HELPFUL);
              var html = '';
              for (var i = 0; i < 4; i++) {
                var name = shuffledNames[i % shuffledNames.length];
                var comment = shuffledComments[i % shuffledComments.length];
                var rating = shuffledRatings[i % shuffledRatings.length];
                var helpful = shuffledHelpful[i % shuffledHelpful.length];
                html += createReviewHTML(name, comment, rating, helpful, i, false, reviewsFilterRef.current);
              }
              container.insertAdjacentHTML('beforeend', html);
              reviewsPageRef.current++;
              // 标记新线程的活动徽章
              applyToAllThreads(container, reviewsFilterRef.current);
              loadMoreBtn.textContent = 'Load More Reviews (' + (5 + reviewsPageRef.current * 4) + ' more)';
              loadMoreBtn.disabled = false;
            }, 600);
          });
        }

        // Sort chip filter 交互
        toolbarChips.forEach(function (chip) {
          chip.addEventListener('click', function () {
            toolbarChips.forEach(function (c) { c.classList.remove('active'); });
            chip.classList.add('active');
            reviewsFilterRef.current = chip.getAttribute('data-filter') || 'all';

            var allThreads = container.querySelectorAll('.thread');
            allThreads.forEach(function (t) {
              t.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
              t.style.opacity = '0';
              t.style.transform = 'translateY(-8px) scale(0.97)';
            });

            setTimeout(function () {
              var old = container.querySelectorAll('.thread');
              old.forEach(function (t) { t.remove(); });

              if (reviewsFilterRef.current === 'all') {
                container.innerHTML = initialReviewsRef.current;
                // 恢复懒加载图片
                container.querySelectorAll('img[data-lazy]').forEach(function (img) {
                  var lazySrc = img.getAttribute('data-lazy');
                  if (lazySrc && !img.getAttribute('src')) {
                    img.setAttribute('src', lazySrc);
                  }
                  img.classList.remove('lazy-loading');
                  img.classList.add('lazy-loaded');
                  var wrap = img.closest('.lazy-wrap');
                  if (wrap) {
                    var sk = wrap.querySelector('.lazy-skeleton');
                    if (sk) sk.remove();
                    var rv = wrap.querySelector('.lazy-reveal');
                    if (rv) rv.remove();
                  }
                });
                var restored = container.querySelectorAll('.thread');
                restored.forEach(function (el, i) {
                  el.style.opacity = '0';
                  el.style.transform = 'translateY(12px)';
                  (function (elem, delay) {
                    setTimeout(function () {
                      elem.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
                      elem.style.opacity = '1';
                      elem.style.transform = 'translateY(0)';
                    }, delay);
                  })(el, 60 + i * 60);
                });
                // 重新标记活动徽章
                applyToAllThreads(container, reviewsFilterRef.current);
                return;
              }

              // 生成 8 条新评论
              var shuffledNames = shuffle(REVIEW_USERNAMES);
              var shuffledComments = shuffle(REVIEW_COMMENTS);
              var shuffledRatings = shuffle(REVIEW_RATINGS);
              var shuffledHelpful = shuffle(REVIEW_HELPFUL);
              for (var i = 0; i < 8; i++) {
                var name = shuffledNames[i % shuffledNames.length];
                var comment = shuffledComments[i % shuffledComments.length];
                var rating = shuffledRatings[i % shuffledRatings.length];
                var helpful = shuffledHelpful[i % shuffledHelpful.length];
                if (reviewsFilterRef.current === 'liked') {
                  helpful = Math.floor(Math.random() * 50) + 20;
                } else if (reviewsFilterRef.current === 'saved') {
                  helpful = Math.floor(Math.random() * 20) + 5;
                }
                var html = createReviewHTML(name, comment, rating, helpful, i, false, reviewsFilterRef.current);
                var wrapper = document.createElement('div');
                wrapper.innerHTML = html;
                var el = wrapper.firstElementChild;
                el.style.opacity = '0';
                el.style.transform = 'translateY(12px)';
                container.appendChild(el);
                // 标记活动徽章
                applyBadgesToThread(el, reviewsFilterRef.current);
                (function (elem, delay) {
                  setTimeout(function () {
                    elem.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
                    elem.style.opacity = '1';
                    elem.style.transform = 'translateY(0)';
                  }, delay);
                })(el, 80 + i * 70);
              }
            }, 280);
          });
        });
      }

      // ─── 1m. Live Stats (Detail page) ───
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

        // 添加 live-dot
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
          if (key === 'comments' && reviewTotalEl) {
            reviewTotalEl.textContent = formatNum(s.val) + ' reviews';
          }
        }

        global.__liveStats = { bump: bump, get: function (k) { return stats[k] ? stats[k].val : null; } };

        // 模拟后台 Views 增长
        function scheduleNextView() {
          var tid = setTimeout(function () {
            bump('views', 1 + Math.floor(Math.random() * 3));
            scheduleNextView();
          }, 5000 + Math.random() * 6000);
          timers.push(tid);
        }
        scheduleNextView();

        // 模拟新评论
        function scheduleSimulatedComment() {
          var tid = setTimeout(function () {
            bump('comments', 1);
            if (Math.random() < 0.3) bump('commenters', 1);
            scheduleSimulatedComment();
          }, 18000 + Math.random() * 22000);
          timers.push(tid);
        }
        scheduleSimulatedComment();

        // Detail Like → views +1
        var detailLikeBtn = document.getElementById('detailLikeBtn');
        if (detailLikeBtn) {
          detailLikeBtn.addEventListener('click', function () {
            if (detailLikeBtn.classList.contains('is-active')) bump('views', 1);
          });
        }

        // Reward button → tips +1（capture phase）
        var rewardSupportBtn = document.querySelector('.reward-support-btn');
        if (rewardSupportBtn) {
          rewardSupportBtn.addEventListener('click', function () {
            bump('tips', 1);
          }, true);
        }

        // Compose-submit → comments +1, commenters +1
        var composeBtn = document.getElementById('composeSubmitBtn') || document.querySelector('.compose-submit');
        if (composeBtn) {
          composeBtn.addEventListener('click', function () {
            var input = document.querySelector('.compose-input');
            if (input && input.value && input.value.trim()) {
              bump('comments', 1);
              bump('commenters', 1);
            }
          });
        }

        // Reply submit → comments +1（事件委托）
        function handleReplyStat(e) {
          var btn = e.target.closest('.reply-submit, .reply-submit-btn');
          if (!btn) return;
          var form = btn.closest('.thread-reply-form');
          if (!form) return;
          var host = form.querySelector('.reply-tiptap-host');
          var text = '';
          if (form._tiptapEditor && typeof form._tiptapEditor.getText === 'function') {
            text = form._tiptapEditor.getText();
          } else if (host) {
            text = host.textContent || '';
          }
          if (text.trim()) bump('comments', 1);
        }
        addDocListener('click', handleReplyStat);
      }

      // ─── 1n. Activity Badges 初始化 + MutationObserver ───
      applyToAllThreads(document, 'all');

      if (container && window.MutationObserver) {
        var actObs = new MutationObserver(function (mutations) {
          mutations.forEach(function (m) {
            m.addedNodes.forEach(function (node) {
              if (node.nodeType !== 1) return;
              if (node.classList && node.classList.contains('thread')) {
                applyBadgesToThread(node, reviewsFilterRef.current);
              } else if (node.querySelectorAll) {
                applyToAllThreads(node, reviewsFilterRef.current);
              }
            });
          });
        });
        actObs.observe(container, { childList: true, subtree: true });
        observers.push(actObs);
      }

      // Filter chip click → 更新 activeFilter
      var filterChips = document.querySelectorAll('.filter-chip');
      filterChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          reviewsFilterRef.current = chip.getAttribute('data-filter') || 'all';
        });
      });

      // ─── 1o. Prompt Display — Login-gated copy ───
      var promptSection = document.getElementById('promptDisplaySection');
      var copyBtn = document.getElementById('promptDisplayCopy');
      if (promptSection && copyBtn) {
        if (isLoggedIn()) {
          promptSection.classList.add('is-logged-in');
        }
        copyBtn.addEventListener('click', function () {
          if (!promptSection.classList.contains('is-logged-in')) return;
        });
      }

      // ─── 1p. Review Composer — Login gate ───
      var compose = document.querySelector('.review-compose');
      if (compose && !isLoggedIn()) {
        compose.style.display = 'none';
      }

      // ─── 1q. Hero Stats — Live counter simulation ───
      var elTotal = document.getElementById('statTotalPrompts');
      var elCreator = document.getElementById('statActiveCreators');
      var elCats = document.getElementById('statTotalCategories');
      var elTipsHero = document.getElementById('statDailyTips');
      if (elTotal || elCreator || elTipsHero) {
        function parseInitial(el, fallback) {
          if (!el) return fallback;
          var raw = (el.textContent || '').replace(/[^\d]/g, '');
          var n = parseInt(raw, 10);
          return isNaN(n) ? fallback : n;
        }

        var heroStats = {
          total:    { val: parseInitial(elTotal, 12487),   el: elTotal },
          creators: { val: parseInitial(elCreator, 3842),  el: elCreator },
          tips:     { val: parseInitial(elTipsHero, 1247), el: elTipsHero },
        };

        if (elCats) {
          var chips = document.querySelectorAll('#promptCategoryScroll .prompt-chip');
          elCats.textContent = formatNum(chips.length);
        }

        Object.keys(heroStats).forEach(function (key) {
          var el = heroStats[key].el;
          if (!el) return;
          el.style.position = 'relative';
          el.style.display = 'inline-block';
        });

        function heroSpawnFloat(el, text) {
          var f = document.createElement('span');
          f.className = 'stat-float';
          f.textContent = text;
          el.appendChild(f);
          setTimeout(function () { if (f.parentNode) f.remove(); }, 950);
        }

        function heroAnimateCount(el, from, to, duration) {
          var start = performance.now();
          function frame(now) {
            var t = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - t, 3);
            var cur = Math.round(from + (to - from) * eased);
            el.textContent = formatNum(cur);
            if (t < 1) requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        }

        function heroBump(key, delta) {
          var s = heroStats[key];
          if (!s || !s.el || delta === 0) return;
          var prev = s.val;
          s.val = Math.max(0, prev + delta);
          heroAnimateCount(s.el, prev, s.val, 520);
          s.el.classList.remove('is-bumping');
          void s.el.offsetWidth;
          s.el.classList.add('is-bumping');
          if (delta >= 1) heroSpawnFloat(s.el, '+' + delta);
        }

        global.__homeStats = { bump: heroBump, get: function (k) { return heroStats[k] ? heroStats[k].val : null; } };

        // 模拟 Total Prompts 增长
        function scheduleTotal() {
          var tid = setTimeout(function () {
            heroBump('total', 1 + Math.floor(Math.random() * 4));
            scheduleTotal();
          }, 6000 + Math.random() * 6000);
          timers.push(tid);
        }
        scheduleTotal();

        // 模拟活跃创作者增长
        function scheduleCreators() {
          var tid = setTimeout(function () {
            heroBump('creators', 1 + Math.floor(Math.random() * 3));
            scheduleCreators();
          }, 10000 + Math.random() * 10000);
          timers.push(tid);
        }
        scheduleCreators();

        // 模拟打赏数量增长
        function scheduleTips() {
          var tid = setTimeout(function () {
            var delta;
            if (Math.random() < 0.12) {
              delta = 8 + Math.floor(Math.random() * 8);
            } else {
              delta = 1 + Math.floor(Math.random() * 5);
            }
            heroBump('tips', delta);
            scheduleTips();
          }, 2500 + Math.random() * 3500);
          timers.push(tid);
        }
        scheduleTips();
      }

      // ── 清理函数 ──
      return function cleanup() {
        timers.forEach(function (id) { clearTimeout(id); });
        observers.forEach(function (obs) { obs.disconnect(); });
        // 移除所有 document 级事件监听器，防止内存泄漏
        docHandlers.forEach(function (h) { document.removeEventListener(h.type, h.handler); });
      };
    }, []);

    // 静态内容由 HTML 提供，组件不渲染内容
    return null;
  }

  // 导出组件
  global.PromptPage = PromptPage;

  /* ── 自动挂载到 GHRANK chrome 层 ── */
  if (global.GHRANK && typeof global.GHRANK.mountChrome === 'function') {
    global.GHRANK.mountChrome('prompt', PromptPage);
  } else {
    console.error('[GHRANK/Prompt] GHRANK.mountChrome 未找到，请确保 core.js 先于 prompt.js 加载');
  }
})(window);
