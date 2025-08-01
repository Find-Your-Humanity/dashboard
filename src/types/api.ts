// API Endpoint Types
export interface ApiEndpoints {
  auth: {
    login: '/api/auth/login';
    logout: '/api/auth/logout';
    refresh: '/api/auth/refresh';
    profile: '/api/auth/profile';
  };
  dashboard: {
    analytics: '/api/dashboard/analytics';
    stats: '/api/dashboard/stats';
    realtime: '/api/dashboard/realtime';
  };
  users: {
    list: '/api/users';
    create: '/api/users';
    update: (id: string) => `/api/users/${id}`;
    delete: (id: string) => `/api/users/${id}`;
  };
  captcha: {
    logs: '/api/captcha/logs';
    config: '/api/captcha/config';
    performance: '/api/captcha/performance';
  };
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Request Config
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}