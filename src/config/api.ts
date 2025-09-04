// API 기본 설정
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://gateway.realcatcha.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
    ME: '/api/auth/me',
  },
  DASHBOARD: {
    ANALYTICS: '/api/dashboard/analytics',
    STATS: '/api/dashboard/stats',
    REALTIME: '/api/dashboard/realtime',
    USAGE_LIMITS: '/api/dashboard/usage-limits', // API 사용량 제한 조회
    API_KEY_USAGE: '/api/dashboard/api-key-usage', // API 키별 사용량 통계
    CLEANUP_DUPLICATES: '/api/dashboard/cleanup-duplicates', // 중복 데이터 정리
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },
  CAPTCHA: {
    LOGS: '/api/captcha/logs',
    CONFIG: '/api/captcha/config', 
    PERFORMANCE: '/api/captcha/performance',
  },
  API_KEYS: {
    CREATE: '/api/keys/create',
    LIST: '/api/keys/list',
    TOGGLE: (keyId: string) => `/api/keys/${keyId}/toggle`,
    DELETE: (keyId: string) => `/api/keys/${keyId}`,
  },
  PAYMENTS: {
    CONFIRM: '/api/payments/confirm',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
