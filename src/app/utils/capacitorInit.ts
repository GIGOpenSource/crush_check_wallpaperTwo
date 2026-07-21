import { StatusBar, Style } from '@capacitor/status-bar';

export async function initCapacitorStatusBar() {
  try {
    await StatusBar.setStyle({
      style: Style.Dark,
    });
    
    await StatusBar.setOverlaysWebView({
      overlay: true,
    });
  } catch (error) {
    console.log('StatusBar not available (running in browser)');
  }
}