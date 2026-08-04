import { Capacitor } from '@capacitor/core';

/** 从图片 URL 触发本地下载；跨域无 CORS 时由上层先弹窗，用户确认后再 {@link openImageUrlInNewTab} */

export type DownloadWallpaperImageResult =
  | { status: 'blob' }
  | { status: 'open-tab-after-confirm'; url: string }
  | { status: 'failed' };

/** 在新标签页打开图片地址（供「无法直接保存」时用户点击确认后调用） */
export function openImageUrlInNewTab(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function sanitizeFilename(name: string, maxLen = 100): string {
  const s = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
  return s || 'wallpaper';
}

function extensionFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes('png')) return '.png';
  if (m.includes('webp')) return '.webp';
  if (m.includes('gif')) return '.gif';
  if (m.includes('jpeg') || m.includes('jpg')) return '.jpg';
  if (m.includes('bmp')) return '.bmp';
  return '.jpg';
}

function triggerAnchorDownload(href: string, downloadName: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = downloadName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// navigator.share / canShare 的最小类型补充（部分 TS lib 版本未内置）
type ShareNavigator = Navigator & {
  share?: (data?: ShareData) => Promise<void>;
  canShare?: (data?: ShareData) => boolean;
};

/**
 * 通过系统分享面板（Web Share API）分享图片文件。
 * 原生 App WebView 中 <a download> 不生效，改用此方式让用户保存到相册或分享。
 *
 * @returns true 表示已唤起分享面板（成功或用户取消均视为已处理）；
 *          false 表示当前环境不支持文件分享，需上层降级处理。
 */
async function shareImageFile(blob: Blob, filename: string): Promise<boolean> {
  const nav = navigator as ShareNavigator;
  if (typeof nav.share !== 'function') return false;

  const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
  const shareData: ShareData = { files: [file] };

  // canShare 可用时先做能力探测，避免直接抛错
  if (typeof nav.canShare === 'function' && !nav.canShare(shareData)) {
    return false;
  }

  try {
    await nav.share(shareData);
    return true;
  } catch (err) {
    // 用户取消分享（AbortError）不视为失败，静默结束
    if (err instanceof DOMException && err.name === 'AbortError') return true;
    // 不支持文件分享或其它错误：返回 false 让上层降级
    return false;
  }
}

/**
 * 优先 fetch 为 Blob 后触发浏览器「另存为」下载；失败则新窗口打开原图（用户可右键保存）。
 *
 * 原生 App（Capacitor）环境下：<a download> 在 WebView 中无法保存文件，
 * 改走系统分享面板（Web Share API），用户可在分享面板中「保存到相册 / 存储到文件」。
 * Web 浏览器环境下保持原有 Blob 下载逻辑。
 */
export async function downloadWallpaperImage(
  imageUrl: string,
  filenameBase: string
): Promise<DownloadWallpaperImageResult> {
  const safeName = sanitizeFilename(filenameBase);
  const isNative = Capacitor.isNativePlatform();

  try {
    const res = await fetch(imageUrl, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    if (!blob.size) throw new Error('empty blob');

    const ext = extensionFromMime(blob.type);
    const fileName = `${safeName}${ext}`;

    // 原生 App：WebView 中 <a download> 无法保存文件，改用系统分享面板
    if (isNative) {
      const handled = await shareImageFile(blob, fileName);
      if (handled) return { status: 'blob' };
      // 当前 WebView 不支持文件分享：降级为打开原图链接（系统浏览器可长按保存）
      return { status: 'open-tab-after-confirm', url: imageUrl };
    }

    // Web 浏览器：生成 object URL 触发「另存为」下载
    const objectUrl = URL.createObjectURL(blob);
    try {
      triggerAnchorDownload(objectUrl, fileName);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
    return { status: 'blob' };
  } catch {
    const u = imageUrl?.trim();
    if (!u) return { status: 'failed' };
    return { status: 'open-tab-after-confirm', url: u };
  }
}
