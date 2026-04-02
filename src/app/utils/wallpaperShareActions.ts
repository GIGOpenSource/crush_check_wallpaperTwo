export type WallpaperShareChannel = 'copy' | 'twitter' | 'facebook' | 'whatsapp';

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

export function openWallpaperShareChannel(channel: Exclude<WallpaperShareChannel, 'copy'>, url: string): void {
  const enc = encodeURIComponent(url);
  const href =
    channel === 'twitter'
      ? `https://twitter.com/intent/tweet?url=${enc}`
      : channel === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${enc}`
        : `https://wa.me/?text=${enc}`;
  window.open(href, '_blank', 'noopener,noreferrer');
}
