import { http } from './request';

export type RegisterPayload = {
  email: string;
  password: string;
  confirm_password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export function registerUser(payload: RegisterPayload) {
  return http.post('/api/client/users/register/', payload);
}

export function loginUser(payload: LoginPayload) {
  return http.post('/api/client/users/login/', payload);
}

/** 退出登录 */
export function logoutUser() {
  return http.post('/api/client/users/logout/');
}

/** 从后端错误响应里尽量提取可展示的错误文案 */
export function extractApiErrorMessage(data: unknown): string | undefined {
  if (typeof data === 'string') {
    const s = data.trim();
    return s || undefined;
  }
  if (!data || typeof data !== 'object') return undefined;

  const obj = data as Record<string, unknown>;
  const directKeys = ['message', 'msg', 'error', 'detail', 'non_field_errors'];
  for (const key of directKeys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v;
    if (Array.isArray(v) && typeof v[0] === 'string' && v[0].trim()) return v[0];
  }

  for (const v of Object.values(obj)) {
    if (typeof v === 'string' && v.trim()) return v;
    if (Array.isArray(v) && typeof v[0] === 'string' && v[0].trim()) return v[0];
  }
  return undefined;
}

/** 业务层成功判断：兼容 code/status/success 多种返回结构 */
export function isApiSuccess(data: unknown): boolean {
  if (!data || typeof data !== 'object') return true;
  const obj = data as Record<string, unknown>;
  const code = obj.code;
  if (typeof code === 'number') return code === 200;
  if (typeof code === 'string' && code.trim() !== '') return code === '200';
  const status = obj.status;
  if (typeof status === 'number') return status >= 200 && status < 300;
  if (typeof status === 'string' && status.trim() !== '') return status === '200' || status.toLowerCase() === 'ok';
  const success = obj.success;
  if (typeof success === 'boolean') return success;
  return true;
}

/** 从登录响应中提取 token（兼容 data.token / token） */
export function extractApiToken(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const obj = data as Record<string, unknown>;
  const directKeys = ['token', 'Token', 'access_token', 'accessToken'];
  for (const key of directKeys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  const nested = obj.data;
  if (nested && typeof nested === 'object') {
    const nestedObj = nested as Record<string, unknown>;
    for (const key of directKeys) {
      const v = nestedObj[key];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }
  return '';
}
