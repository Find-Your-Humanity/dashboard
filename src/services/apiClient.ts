import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';
import { API_CONFIG } from '../config/api';
import { STORAGE_KEYS } from '../config/constants';

// Create a pre-configured Axios instance for the dashboard app.
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

// Attach Authorization header if token exists in localStorage
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      const headers: AxiosRequestHeaders = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as AxiosRequestHeaders;
      config.headers = headers;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

// Pass through successful responses; normalize errors for easier handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // 전역 401 처리: 토큰 만료/유효하지 않은 경우 자동 로그아웃 및 로그인 페이지로 이동
    const status = error.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } catch {
        // ignore
      }
      // 401 에러 시 localStorage만 정리하고 페이지 리다이렉트는 하지 않음
      // (인증 상태는 AuthContext에서 관리)
    }
    return Promise.reject(error);
  }
);

export { apiClient };

