import { umengclick } from './aplusTracking';
import { copyTextToClipboard, openWallpaperShareChannel } from '../utils/wallpaperShareActions';
import type { WallpaperShareChannel } from '../utils/wallpaperShareActions';

export type DetailShareActionKey = 'copy' | 'tw' | 'fb' | 'wa' | 'pin';

const CHANNEL_BY_KEY: Record<Exclude<DetailShareActionKey, 'copy'>, WallpaperShareChannel> = {
  tw: 'twitter',
  fb: 'facebook',
  wa: 'whatsapp',
  pin: 'pinterest',
};

const CLICK_EVENT_BY_KEY: Record<Exclude<DetailShareActionKey, 'copy'>, string> = {
  tw: 'share_to_x',
  fb: 'share_to_facebook',
  wa: 'share_to_whatsapp',
  pin: 'share_to_pinterest',
};

/** 壁纸详情分享面板：渠道点击 + 成功/失败（复制 / 打开分享页） */
export async function trackAndRunDetailShare(
  key: DetailShareActionKey,
  wallpaperId: string | undefined,
  onCopySuccess: () => void,
): Promise<void> {
  if (!wallpaperId?.trim()) {
    umengclick('share_fail');
    return;
  }
  if (key === 'copy') {
    umengclick('copy_link_click');
    // 构建完整的壁纸分享URL用于复制
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/wallpaper/${encodeURIComponent(wallpaperId)}`;
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      umengclick('share_success');
      onCopySuccess();
    } else {
      umengclick('share_fail');
    }
    return;
  }
  umengclick(CLICK_EVENT_BY_KEY[key]);
  const opened = openWallpaperShareChannel(CHANNEL_BY_KEY[key], wallpaperId);
  if (opened) umengclick('share_success');
  else umengclick('share_fail');
}
