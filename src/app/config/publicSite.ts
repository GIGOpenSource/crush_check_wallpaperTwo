/** 分享、复制链接等对外使用的站点根地址（固定线上域名，不用本地 origin） */
export const PUBLIC_SITE_ORIGIN = 'https://www.markwallpapers.com';

/** 隐私协议页面地址 */
export const PRIVACY_POLICY_URL = `${PUBLIC_SITE_ORIGIN}/privacy/pages/privacy/privacy`;

export function openExternalUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
