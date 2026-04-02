/** 从图片 URL 触发本地下载；跨域无 CORS 时回退为新标签页打开 */

export type DownloadWallpaperImageResult = 'blob' | 'opened-tab' | 'failed';

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

/**
 * 优先 fetch 为 Blob 后触发浏览器「另存为」下载；失败则新窗口打开原图（用户可右键保存）。
 */
export async function downloadWallpaperImage(
  imageUrl: string,
  filenameBase: string
): Promise<DownloadWallpaperImageResult> {
  const safeName = sanitizeFilename(filenameBase);

  try {
    const res = await fetch(imageUrl, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    if (!blob.size) throw new Error('empty blob');

    const ext = extensionFromMime(blob.type);
    const objectUrl = URL.createObjectURL(blob);
    try {
      triggerAnchorDownload(objectUrl, `${safeName}${ext}`);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
    return 'blob';
  } catch {
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return 'opened-tab';
    } catch {
      return 'failed';
    }
  }
}
