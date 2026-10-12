/**
 * 全站共享常量
 */

/** 六边形 clip-path —— EVE Online HUD 标志性形状 */
export const HEX_CLIP_PATH = 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)';

/**
 * 默认用户头像：字母徽章 'AS'（AlexShader 首字母）。
 * 未上传头像时显示字母徽章，避免显示默认图片造成"已经有头像"的错觉。
 * 上传头像后，useIsLoggedIn 会用 localStorage 中保存的图片 URL 替换此值。
 */
export const DEFAULT_AVATAR = 'AS';

/** localStorage key 常量 */
export const STORAGE_KEYS = {
  LOGGED_IN: 'ghrank_logged_in',
  USER_AVATAR: 'ghrank_user_avatar',
  USER_NAME: 'ghrank_user_name',
  CREATED_TIEBAS: 'ghrank_created_tiebas',
} as const;
