/**
 * Prompt 市场数据 —— 类型定义 + 初始卡片 + 无限滚动数据
 * 迁移自 prompt.js 的 INITIAL_DATA、MORE_DATA、EXTRA_PROMPT_TEMPLATES
 * 图片路径统一使用 Next.js public 目录格式：/images/demo/prompt_N.jpg
 */

/* ═══ 类型定义 ═══ */

/** Prompt 模型分类（一张卡片可包含多个分类，以空格分隔） */
export type PromptModel = 'image' | 'animation' | 'video' | 'html' | 'data';

/** 卡片高度：tall 占两行，short 占一行 */
export type PromptCardHeight = 'tall' | 'short';

/** Prompt 卡片数据 */
export interface PromptCardData {
  /** 模型分类字符串（空格分隔多个分类，如 "image animation"） */
  model: string;
  /** 卡片高度类型 */
  height: PromptCardHeight;
  /** 图片完整路径 */
  img: string;
  /** 作者名 */
  author: string;
  /** 标题（列表页使用，特色卡片不展示） */
  title?: string;
  /** 描述（列表页使用） */
  snippet?: string;
  /** 星级 1-5 */
  stars?: number;
  /** 评分数 */
  rating?: number;
  /** 价格 */
  price?: string;
  /** 使用次数 */
  uses?: string;
}

/** 分类筛选 chip 数据 */
export interface PromptCategory {
  /** 模型标识 */
  model: string;
  /** 显示名称 */
  label: string;
  /** 数量 */
  count: number;
}

/** Hero 统计数据 */
export interface PromptHeroStat {
  key: string;
  value: number;
  label: string;
}

/* ═══ 模型标签映射 ═══ */

/** 模型 → 显示名称 */
export const MODEL_LABEL_MAP: Record<string, string> = {
  image: 'Image',
  animation: 'Animation',
  video: 'Video',
  html: 'HTML',
  data: 'Data',
};

/* ═══ 分类筛选 chips ═══ */

export const PROMPT_CATEGORIES: PromptCategory[] = [
  { model: 'all', label: 'All', count: 12487 },
  { model: 'image', label: 'Image', count: 4286 },
  { model: 'animation', label: 'Animation', count: 2134 },
  { model: 'video', label: 'Video', count: 1872 },
  { model: 'html', label: 'HTML', count: 2563 },
  { model: 'data', label: 'Data', count: 1632 },
];

/* ═══ Hero 统计数据 ═══ */

export const HERO_STATS: PromptHeroStat[] = [
  { key: 'total', value: 12487, label: 'Total Prompts' },
  { key: 'creators', value: 3842, label: 'Active Creators' },
  { key: 'categories', value: 6, label: 'Total Categories' },
  { key: 'tips', value: 1247, label: 'Total Tips' },
];

/* ═══ 初始 24 张卡片（首屏骨架屏逐批替换） ═══ */

export const INITIAL_PROMPTS: PromptCardData[] = [
  { model: 'image', height: 'tall', img: '/images/demo/prompt_1.jpg', author: 'AlexShader' },
  { model: 'html data', height: 'tall', img: '/images/demo/prompt_2.jpg', author: 'DevPromptMaster' },
  { model: 'animation', height: 'short', img: '/images/demo/prompt_3.jpg', author: 'ShadowCraft' },
  { model: 'video', height: 'tall', img: '/images/demo/prompt_4.jpg', author: 'CineForge' },
  { model: 'image', height: 'short', img: '/images/demo/prompt_5.jpg', author: 'DesignForge' },
  { model: 'image animation', height: 'tall', img: '/images/demo/prompt_6.jpg', author: 'AnimeForge' },
  { model: 'data', height: 'tall', img: '/images/demo/prompt_7.jpg', author: 'DataWizard' },
  { model: 'html', height: 'short', img: '/images/demo/prompt_8.jpg', author: 'TechDocPro' },
  { model: 'video', height: 'tall', img: '/images/demo/prompt_9.jpg', author: 'MotionVault' },
  { model: 'data', height: 'short', img: '/images/demo/prompt_10.jpg', author: 'DataInsight' },
  { model: 'html data', height: 'tall', img: '/images/demo/prompt_11.jpg', author: 'APIBuilder' },
  { model: 'image', height: 'tall', img: '/images/demo/prompt_12.jpg', author: 'WashiMaster' },
  { model: 'animation', height: 'short', img: '/images/demo/prompt_13.jpg', author: 'ClayWorks' },
  { model: 'video', height: 'tall', img: '/images/demo/prompt_14.jpg', author: 'VoxelPro' },
  { model: 'image', height: 'short', img: '/images/demo/prompt_15.jpg', author: 'RetroPress' },
  { model: 'html', height: 'tall', img: '/images/demo/prompt_16.jpg', author: 'CopyGuru' },
  { model: 'data', height: 'tall', img: '/images/demo/prompt_17.jpg', author: 'ScholarAI' },
  { model: 'animation', height: 'short', img: '/images/demo/prompt_18.jpg', author: 'SketchNinja' },
  { model: 'image', height: 'tall', img: '/images/demo/prompt_19.jpg', author: 'RetroFuture' },
  { model: 'animation', height: 'tall', img: '/images/demo/prompt_20.jpg', author: 'SynthDream' },
  { model: 'image', height: 'short', img: '/images/demo/prompt_12.jpg', author: 'PopNeon' },
  { model: 'video', height: 'tall', img: '/images/demo/prompt_13.jpg', author: 'VFXWizard' },
  { model: 'html data', height: 'short', img: '/images/demo/prompt_14.jpg', author: 'PageSmith' },
  { model: 'data', height: 'tall', img: '/images/demo/prompt_15.jpg', author: 'QuantLab' },
];

/* ═══ 无限滚动基础数据（20 张，含完整字段） ═══ */

const BASE_MORE_PROMPTS: PromptCardData[] = [
  { model: 'image', height: 'tall', title: 'Cinematic Realistic Portrait', snippet: 'Hyper-realistic cinematic portraits with film grain, bokeh, and dramatic studio lighting.', stars: 5, rating: 284, price: '$5.99', author: 'AlexShader', uses: '2.8K', img: '/images/demo/prompt_1.jpg' },
  { model: 'image', height: 'short', title: 'Masterpiece Japanese Illustration', snippet: 'Traditional Japanese art style with ink wash textures.', stars: 5, rating: 176, price: '$6.49', author: 'WashiMaster', uses: '1.9K', img: '/images/demo/prompt_2.jpg' },
  { model: 'animation', height: 'tall', title: 'Shadow Puppet Theatre', snippet: 'Dramatic shadow play compositions.', stars: 4, rating: 92, price: '$3.49', author: 'ShadowCraft', uses: '756', img: '/images/demo/prompt_3.jpg' },
  { model: 'image', height: 'tall', title: 'Premium Cinematic Advertisement', snippet: 'High-end commercial product renders.', stars: 5, rating: 218, price: '$9.99', author: 'AdForge', uses: '3.1K', img: '/images/demo/prompt_4.jpg' },
  { model: 'image', height: 'short', title: 'Classic Vibrant Illustration', snippet: 'Bold saturated vector art.', stars: 4, rating: 145, price: '$4.49', author: 'ColorBlast', uses: '2.2K', img: '/images/demo/prompt_5.jpg' },
  { model: 'image', height: 'tall', title: 'Vintage Lithograph', snippet: 'Authentic retro print aesthetic.', stars: 5, rating: 167, price: '$3.99', author: 'RetroPress', uses: '1.4K', img: '/images/demo/prompt_6.jpg' },
  { model: 'image', height: 'short', title: 'Vintage Dual-Color Art', snippet: 'Two-tone retro screenprint style.', stars: 4, rating: 89, price: '$2.99', author: 'DualTone', uses: '968', img: '/images/demo/prompt_7.jpg' },
  { model: 'animation', height: 'tall', title: 'Metallic Origami Sculpture', snippet: 'Folded metal paper art.', stars: 5, rating: 203, price: '$4.99', author: 'OrigamiPro', uses: '2.7K', img: '/images/demo/prompt_8.jpg' },
  { model: 'animation', height: 'short', title: 'Handmade Claymation Diorama', snippet: 'Stop-motion style clay figures.', stars: 4, rating: 118, price: '$5.49', author: 'ClayWorks', uses: '887', img: '/images/demo/prompt_9.jpg' },
  { model: 'image', height: 'tall', title: 'Gritty Charcoal', snippet: 'Expressive charcoal sketches.', stars: 4, rating: 76, price: '$2.49', author: 'SketchNinja', uses: '645', img: '/images/demo/prompt_10.jpg' },
  { model: 'image', height: 'tall', title: 'RETRO TECHNICOLOR ODYSSEY', snippet: 'Vibrant 1950s technicolor aesthetics.', stars: 5, rating: 231, price: '$7.99', author: 'RetroFuture', uses: '3.4K', img: '/images/demo/prompt_11.jpg' },
  { model: 'animation', height: 'short', title: '80s Dark Fantasy Animation', snippet: 'Rotoscope-style dark fantasy.', stars: 5, rating: 192, price: '$6.99', author: 'SynthDream', uses: '1.8K', img: '/images/demo/prompt_12.jpg' },
  { model: 'animation', height: 'tall', title: 'Cute Stylish Pixel-Art', snippet: 'Charming retro pixel characters.', stars: 4, rating: 134, price: '$3.49', author: 'PixelQueen', uses: '2.1K', img: '/images/demo/prompt_13.jpg' },
  { model: 'image', height: 'short', title: 'Bold SketchToon Minis', snippet: 'Minimalist cartoon characters.', stars: 4, rating: 87, price: '$2.99', author: 'ToonLab', uses: '723', img: '/images/demo/prompt_14.jpg' },
  { model: 'animation', height: 'tall', title: 'Lego Minifigures', snippet: 'Brick-built character renders.', stars: 5, rating: 245, price: '$5.49', author: 'BlockBuilder', uses: '2.9K', img: '/images/demo/prompt_15.jpg' },
  { model: 'image', height: 'short', title: 'Neon Comic Pop Art', snippet: 'Bold comic book panels.', stars: 4, rating: 156, price: '$4.49', author: 'PopNeon', uses: '1.5K', img: '/images/demo/prompt_16.jpg' },
  { model: 'animation', height: 'tall', title: 'Pop-up Book Illustration', snippet: 'Paper-cut dimensional scenes.', stars: 5, rating: 198, price: '$6.49', author: 'PaperArt', uses: '2.4K', img: '/images/demo/prompt_17.jpg' },
  { model: 'image', height: 'tall', title: 'NBA LEGEND POSTER', snippet: 'Sports poster art.', stars: 5, rating: 212, price: '$5.99', author: 'SlamDunk', uses: '1.7K', img: '/images/demo/prompt_18.jpg' },
  { model: 'animation', height: 'short', title: '3D Vinyl Collectable Figure', snippet: 'Toy design renders.', stars: 4, rating: 143, price: '$7.49', author: 'ToyLab', uses: '1.2K', img: '/images/demo/prompt_19.jpg' },
  { model: 'image', height: 'tall', title: 'Industrial Concept Design', snippet: 'Hard-surface sci-fi designs.', stars: 5, rating: 187, price: '$8.99', author: 'MechDesign', uses: '2.0K', img: '/images/demo/prompt_20.jpg' },
];

/* ═══ 扩展模板（循环使用图片和模板，保证无限滚动有足够数据） ═══ */

const EXTRA_TEMPLATES = [
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
  { model: 'animation', title: 'Smoke Wisps Trail', snippet: 'Ethereal smoke particle effect.', author: 'SmokeTrail' },
  { model: 'image', title: 'Art Nouveau Poster', snippet: 'Mucha-style decorative poster.', author: 'NouveauArt' },
  { model: 'image video', title: 'Ocean Storm Waves', snippet: 'Dramatic seascape photography.', author: 'StormSea' },
  { model: 'animation', title: 'Rubik Cube Solve', snippet: 'Satisfying puzzle animation.', author: 'CubeSolver' },
  { model: 'image', title: 'Macro Snowflake Crystal', snippet: 'Ultra-close snowflake detail.', author: 'FrostDetail' },
  { model: 'image', title: 'Graffiti Street Art', snippet: 'Urban mural graffiti style.', author: 'StreetArt' },
  { model: 'animation', title: 'Constellation Drawing', snippet: 'Stars connecting animation.', author: 'StarDraw' },
  { model: 'image', title: 'Terraced Rice Fields', snippet: 'Asian landscape photography.', author: 'RiceTerrace' },
  { model: 'image animation', title: 'Hologram Projection', snippet: 'Futuristic holographic display.', author: 'HoloProj' },
  { model: 'animation', title: 'Bonsai Tree Growth', snippet: 'Time-lapse bonsai cultivation.', author: 'BonsaiGrow' },
  { model: 'image', title: 'Volcanic Eruption Close-up', snippet: 'Dramatic lava flow photography.', author: 'LavaFlow' },
];

/** snackprompt 图片池（扩展数据后半段交替使用） */
const SNACK_IMGS = [
  'snackprompt_1.png',
  'snackprompt_2.jpg',
  'snackprompt_3.png',
  'snackprompt_4.png',
];

/**
 * 基于扩展模板生成更多卡片数据
 * 使用确定性公式替代 Math.random()，避免 SSR/CSR 水合不匹配
 */
function generateExtendedPrompts(): PromptCardData[] {
  const result: PromptCardData[] = [];
  let promptImgIdx = 0;

  EXTRA_TEMPLATES.forEach((tmpl, pi) => {
    // 交替使用本地图片和 snackprompt 图片（与原始逻辑一致）
    let imgSrc: string;
    if (pi < 20) {
      promptImgIdx = (promptImgIdx % 20) + 1;
      imgSrc = `prompt_${promptImgIdx}.jpg`;
    } else {
      if ((pi - 20) % 3 === 0) {
        imgSrc = SNACK_IMGS[(pi - 20) % SNACK_IMGS.length];
      } else {
        promptImgIdx = (promptImgIdx % 20) + 1;
        imgSrc = `prompt_${promptImgIdx}.jpg`;
      }
    }

    // 确定性生成星级、评分、价格、使用次数
    const usesRaw = 200 + ((pi * 137) % 3000);
    const uses = usesRaw >= 1000
      ? `${(usesRaw / 1000).toFixed(1)}K`
      : String(usesRaw);

    result.push({
      model: tmpl.model,
      height: pi % 3 === 0 ? 'short' : 'tall',
      title: tmpl.title,
      snippet: tmpl.snippet,
      stars: 4 + (pi % 2),
      rating: 50 + ((pi * 7) % 200),
      price: `$${2 + (pi % 8)}.${(pi % 9) + 1}9`,
      author: tmpl.author,
      uses,
      img: `/images/demo/${imgSrc}`,
    });
  });

  return result;
}

/** 无限滚动完整数据（基础 20 张 + 扩展 60 张 = 80 张） */
export const MORE_PROMPTS: PromptCardData[] = [
  ...BASE_MORE_PROMPTS,
  ...generateExtendedPrompts(),
];
