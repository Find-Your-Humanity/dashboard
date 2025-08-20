import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';

// Extend AxiosRequestConfig to include _retry flag
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
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

// Refresh token function
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    
    if (response.data.success && response.data.access_token) {
      const token = response.data.access_token;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      if (response.data.user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      }
      return token;
    }
    return null;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
};

// Pass through successful responses; handle 401 with automatic token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // 401 에러 시 토큰 갱신 시도
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // 새 토큰으로 원본 요청 재시도
          const headers: AxiosRequestHeaders = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          } as AxiosRequestHeaders;
          originalRequest.headers = headers;
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('토큰 갱신 재시도 실패:', refreshError);
      }
      
      // 갱신 실패 시 로컬 스토리지 정리
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } catch {
        // ignore
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };

