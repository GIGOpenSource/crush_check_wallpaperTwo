// src/utils/device.ts
export const getDeviceType = (): 'android' | 'iphone' | 'web' => {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/android/i.test(ua)) {
    return 'android';
  }
  
  if (/iphone|ipad|ipod/i.test(ua)) {
    return 'iPhone';
  }
  
  return 'web';
};