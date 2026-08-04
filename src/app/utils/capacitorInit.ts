import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * 根据主题更新状态栏样式
 * - 深色模式 (dark): 白色文字/图标 (Style.Dark)
 * - 浅色模式 (light): 黑色文字/图标 (Style.Light)
 */
export async function updateStatusBarStyle(isDark: boolean) {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
  } catch (error) {
    console.log('Failed to update status bar style', error);
  }
}

export async function initCapacitorStatusBar(isDark: boolean = false) {
  try {
    // 设置状态栏样式（根据主题）
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });

    await StatusBar.setOverlaysWebView({
      overlay: true,
    });

    // Android WebView 不会通过 env(safe-area-inset-top/bottom) 暴露真实高度，
    // 在 overlay: true 下内容会被系统状态栏 / 导航栏遮挡。
    // 这里读取实际状态栏高度（CSS px）写入 CSS 变量，供 .safe-area-pt / .safe-area-pb 兜底使用。
    // iOS 的 env(safe-area-inset-*) 本身返回正确值，无需此处理。
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

      // Android 底部导航栏（手势条或三按钮）高度通过 window.innerHeight 与
      // screen 的实际可用高度差值估算（status bar 同理）。这里同样写入 CSS 变量。
      try {
        const navBarHeight =
          (window.outerHeight - window.innerHeight) / window.devicePixelRatio || 0;
        if (navBarHeight > 0) {
          document.documentElement.style.setProperty(
            '--nav-bar-height',
            `${navBarHeight}px`
          );
        }
      } catch (e) {
        console.log('Failed to read Android nav bar height', e);
      }
    }
  } catch (error) {
    console.log('StatusBar not available (running in browser)');
  }
}