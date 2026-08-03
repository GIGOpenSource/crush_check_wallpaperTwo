import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export async function initCapacitorStatusBar() {
  try {
    await StatusBar.setStyle({
      style: Style.Dark,
    });

    await StatusBar.setOverlaysWebView({
      overlay: true,
    });

    // Android WebView 不会通过 env(safe-area-inset-top) 暴露状态栏高度，
    // overlay: true 时页面顶部内容会被状态栏遮挡（无可视区域）。
    // 这里读取实际状态栏高度（CSS px）写入 CSS 变量，供 .safe-area-pt 等工具类兜底使用。
    // iOS 的 env(safe-area-inset-top) 本身返回正确值，无需此处理。
    if (Capacitor.getPlatform() === 'android') {
      try {
        const info = await StatusBar.getInfo();
        const height = info.height ?? 0;
        if (height > 0) {
          document.documentElement.style.setProperty(
            '--status-bar-height',
            `${height}px`
          );
        }
      } catch (e) {
        console.log('Failed to read Android status bar height', e);
      }
    }
  } catch (error) {
    console.log('StatusBar not available (running in browser)');
  }
}