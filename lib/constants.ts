/**
 * 全站共享常量
 */

/** 六边形 clip-path —— EVE Online HUD 标志性形状 */
export const HEX_CLIP_PATH = 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)';

/** 默认用户头像 */
export const DEFAULT_AVATAR = '/images/demo/prompt_1.jpg';

/** localStorage key 常量 */
export const STORAGE_KEYS = {
  LOGGED_IN: 'ghrank_logged_in',
  USER_AVATAR: 'ghrank_user_avatar',
  USER_NAME: 'ghrank_user_name',
} as const;
