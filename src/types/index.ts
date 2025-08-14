// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  is_admin?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// Captcha Statistics Types
export interface CaptchaStats {
  totalRequests: number;
  successfulSolves: number;
  failedAttempts: number;
  successRate: number;
  averageResponseTime: number;
}

// Dashboard Analytics Types
export interface DashboardAnalytics {
  dailyStats: CaptchaStats[];
  weeklyStats: CaptchaStats[];
  monthlyStats: CaptchaStats[];
  realtimeMetrics: {
    currentActiveUsers: number;
    requestsPerMinute: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}