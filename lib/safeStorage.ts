/** 安全 localStorage 操作 —— 隐私模式或存储被禁用时静默降级 */
export const safeStorage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, value); } catch { /* noop */ }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};
