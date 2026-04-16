// 存储 navigate 函数的引用，用于在 request.ts 中跳转
let navigateFunction: ((path: string, options?: any) => void) | null = null;

export function setNavigateFunction(navigate: (path: string, options?: any) => void) {
  navigateFunction = navigate;
}

/** 线上资源域名（拼接接口返回的相对图片地址等） */
export const API_ORIGIN = 'https://markwallpapers.com';

/**
 * 发起请求时的基址：开发环境为空，走当前页同源 + Vite proxy（避免 CORS）；生产为线上域名。
 */
const API_FETCH_BASE = import.meta.env.DEV ? '' : API_ORIGIN;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = {
  method?: HttpMethod;
  params?: Record<string, QueryValue>;
  data?: unknown;
  headers?: Record<string, string>;
  token?: string;
  signal?: AbortSignal;
};

const TOKEN_STORAGE_KEY = 'token';
let memoryToken = '';

export function getAuthToken(): string {
  if (memoryToken) return memoryToken;
  if (typeof window === 'undefined') return '';
  try {
    const local = window.localStorage.getItem(TOKEN_STORAGE_KEY) || '';
    const session = window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';
    const token = (local || session).trim();
    if (token) {
      memoryToken = token;
      return token;
    }
    return '';
  } catch {
    return '';
  }
}

export function setAuthToken(token: string) {
  const normalized = token.trim();
  memoryToken = normalized;
  if (typeof window === 'undefined') return;
  try {
    if (normalized) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, normalized);
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path: string, params?: Record<string, QueryValue>) {
  const base = path.startsWith('http') ? path : `${API_FETCH_BASE}${path}`;

  if (!params) return base;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${base}${base.includes('?') ? '&' : '?'}${query}` : base;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', params, data, headers, token, signal } = options;
  const url = buildUrl(path, params);

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  const init: RequestInit = {
    method,
    headers: requestHeaders,
    signal,
  };

  const finalToken = (token || getAuthToken()).trim();
  if (finalToken) {
    requestHeaders.token = finalToken;
    // requestHeaders.Token = finalToken;
    // requestHeaders.Authorization = `Bearer ${finalToken}`;
  }

  if (data !== undefined && data !== null) {
    // 特殊处理 FormData：不要设置 Content-Type，让浏览器自动设置 boundary
    if (data instanceof FormData) {
      init.body = data;
      // 删除之前设置的 Content-Type，让浏览器自动处理
      delete requestHeaders['Content-Type'];
    } else {
      // 普通 JSON 数据
      requestHeaders['Content-Type'] = 'application/json';
      init.body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, init);
  const payload = await parseResponse(response);

  if (!response.ok) {
    // 处理401未授权错误，跳转到登录页
    if (response.status === 401) {
      // 清除token
      setAuthToken('');
      
      // 跳转到登录页（保持当前视图模式）
      if (navigateFunction && typeof window !== 'undefined') {
        // 避免重复跳转
        if (!window.location.pathname.includes('/login')) {
          navigateFunction('/login', { replace: true });
        }
      }
    }
    
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: unknown }).message || 'Request failed')
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const http = {
  get: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),
  post: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', ...options }),
  put: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', ...options }),
  patch: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', ...options }),
  delete: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
};
