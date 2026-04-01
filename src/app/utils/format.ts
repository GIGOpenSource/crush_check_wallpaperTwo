export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'k';
  }
  return num.toString();
}

export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale);
}
