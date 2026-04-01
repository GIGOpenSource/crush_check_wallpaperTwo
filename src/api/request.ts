const API_BASE_URL = 'https://markwallpapers.com';

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
  const base = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

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

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (data !== undefined && data !== null) {
    requestHeaders['Content-Type'] = 'application/json';
    init.body = JSON.stringify(data);
  }

  const response = await fetch(url, init);
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: unknown }).message || 'Request failed')
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const http = {
  get: <T = unknown>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'data'>,
  ) => request<T>(path, { ...options, method: 'GET' }),
  post: <T = unknown>(
    path: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'data'>,
  ) => request<T>(path, { ...options, method: 'POST', data }),
  put: <T = unknown>(
    path: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'data'>,
  ) => request<T>(path, { ...options, method: 'PUT', data }),
  patch: <T = unknown>(
    path: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'data'>,
  ) => request<T>(path, { ...options, method: 'PATCH', data }),
  delete: <T = unknown>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'data'>,
  ) => request<T>(path, { ...options, method: 'DELETE' }),
};

export { API_BASE_URL };
