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
    // 401 오류 시 localStorage만 정리하고 AuthContext에서 처리하도록 함
    // 자동 리다이렉트는 제거하여 무한 루프 방지
    const status = error.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } catch {
        // ignore storage errors
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };

