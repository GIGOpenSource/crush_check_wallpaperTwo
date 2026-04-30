import { PUBLIC_SITE_ORIGIN } from '../config/publicSite';

export type WallpaperShareChannel = 'twitter' | 'facebook' | 'whatsapp' | 'pinterest';

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** @returns 是否成功打开新窗口（被拦截则为 false） */
export function openWallpaperShareChannel(channel: WallpaperShareChannel, wallpaperId: string): boolean {
  // 构建壁纸详情页的完整URL（使用固定的线上域名，包含 base path）
  // BrowserRouter 模式使用标准路径格式
  const origin = PUBLIC_SITE_ORIGIN.replace(/\/$/, '');
  const wallpaperUrl = `${origin}/wallpaper/${encodeURIComponent(wallpaperId)}`;
  const enc = encodeURIComponent(wallpaperUrl);
  
  const href =
    channel === 'twitter'
      ? `https://twitter.com/intent/tweet?url=${enc}`
      : channel === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${enc}`
        : channel === 'pinterest'
          ? `https://www.pinterest.com/pin/create/button/?url=${enc}`
          : `https://wa.me/?text=${enc}`;
  const w = window.open(href, '_blank', 'noopener,noreferrer');
  return w != null;
}
