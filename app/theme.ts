/**
 * antd 主题配置 —— LobeHub 风格
 *
 * 参考 lobehub.com/zh 与 @lobehub/ui 的设计语言：
 * - 现代紫色系品牌色
 * - 圆角卡片 + 柔和阴影
 * - 无衬线字体（Inter）
 * - 充足留白 + 克制动效
 *
 * 亮暗双模式分别配置，通过 next-themes 或 cookie 切换。
 */
import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

// 亮色模式 —— LobeHub 风格
export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // 品牌色（参考 LobeHub 紫色系，上线前可校准）
    colorPrimary: '#6E56CF',
    colorLink: '#6E56CF',
    colorLinkHover: '#8B6FE8',

    // 背景色
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F7F7F8',

    // 边框
    colorBorder: '#E5E5E5',
    colorBorderSecondary: '#F0F0F0',

    // 文本
    colorText: '#1A1A1A',
    colorTextSecondary: '#525252',
    colorTextTertiary: '#8B8B8B',
    colorTextQuaternary: '#BDBDBD',

    // 状态色
    colorSuccess: '#00B96B',
    colorError: '#FF4D4F',
    colorWarning: '#FAAD14',
    colorInfo: '#6E56CF',

    // 形态
    borderRadius: 8,
    borderRadiusLG: 10,
    borderRadiusSM: 6,

    // 字体（LobeHub 风格使用无衬线字体）
    fontFamily:
      "'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,

    // 控件高度
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // 层级（高于 Tiptap BubbleMenu 1100 / SlashMenu 1200）
    zIndexPopupBase: 1500,
  },
  components: {
    Button: {
      fontWeight: 500,
      primaryShadow: '0 2px 8px rgba(110, 86, 207, 0.2)',
    },
    Card: {
      borderRadiusLG: 10,
      boxShadowTertiary: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    Menu: {
      itemSelectedColor: '#6E56CF',
      itemSelectedBg: 'rgba(110, 86, 207, 0.08)',
    },
    Tabs: {
      itemSelectedColor: '#6E56CF',
      inkBarColor: '#6E56CF',
    },
  },
  // antd v6: cssVar 必须传对象（{ key, prefix }），不再接受 true
  cssVar: { key: 'ant' },
  hashed: false,
};

// 暗色模式 —— LobeHub 风格
export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // 品牌色（暗色模式下柔和不刺眼）
    colorPrimary: '#9D8CFF',
    colorLink: '#9D8CFF',
    colorLinkHover: '#B8A8FF',

    // 背景色
    colorBgBase: '#0F0F10',
    colorBgContainer: '#1A1A1B',
    colorBgElevated: '#242425',
    colorBgLayout: '#0F0F10',

    // 边框
    colorBorder: '#2E2E2F',
    colorBorderSecondary: '#242425',

    // 文本
    colorText: '#E8E8E8',
    colorTextSecondary: '#A0A0A0',
    colorTextTertiary: '#707070',
    colorTextQuaternary: '#4A4A4A',

    // 状态色
    colorSuccess: '#3FB950',
    colorError: '#FF6B6B',
    colorWarning: '#FFB84D',
    colorInfo: '#9D8CFF',

    // 形态
    borderRadius: 8,
    borderRadiusLG: 10,
    borderRadiusSM: 6,

    // 字体
    fontFamily:
      "'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,

    // 控件高度
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // 层级
    zIndexPopupBase: 1500,
  },
  components: {
    Button: {
      fontWeight: 500,
      primaryShadow: '0 2px 8px rgba(157, 140, 255, 0.25)',
    },
    Card: {
      borderRadiusLG: 10,
      boxShadowTertiary: '0 1px 3px rgba(0, 0, 0, 0.3)',
    },
    Menu: {
      itemSelectedColor: '#9D8CFF',
      itemSelectedBg: 'rgba(157, 140, 255, 0.12)',
    },
    Tabs: {
      itemSelectedColor: '#9D8CFF',
      inkBarColor: '#9D8CFF',
    },
  },
  // antd v6: cssVar 必须传对象（{ key, prefix }），不再接受 true
  cssVar: { key: 'ant' },
  hashed: false,
};

// 默认导出暗色主题（项目默认暗色模式）
export default darkTheme;
