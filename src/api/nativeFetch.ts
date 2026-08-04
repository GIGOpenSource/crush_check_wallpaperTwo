/**
 * 保存 CapacitorHttp 插件拦截前的原生 fetch 引用。
 * Capacitor 5+ 会在启动时替换 window.fetch 以支持 native HTTP 请求，
 * 但其对 multipart/form-data（文件上传）支持不完善，
 * 导致头像/壁纸上传在移动端失效。
 *
 * 使用方式：在所有其他模块之前 import 本模块（确保 fetch 尚未被替换），
 * 之后通过 `import { nativeFetch } from '@/api/nativeFetch'` 获取原生 fetch。
 */

// 在模块求值时捕获当前的 fetch 引用。
// 这个文件必须在 Capacitor 初始化前被加载（main.tsx 顶部直接 import 即可）。
const nativeFetch: typeof fetch =
  typeof window !== 'undefined' && typeof window.fetch === 'function'
    ? window.fetch.bind(window)
    : fetch.bind(globalThis as any);

/**
 * 是否在原生 Capacitor 环境下运行（非浏览器）。
 * 用于决定是否绕过 CapacitorHttp。
 */
export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.Capacitor?.getPlatform && w.Capacitor.getPlatform() !== 'web');
}

export { nativeFetch };
