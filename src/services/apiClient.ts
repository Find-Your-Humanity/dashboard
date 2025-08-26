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
      // 토큰이 유효한지 간단한 검증 (빈 문자열이나 undefined가 아닌지)
      if (token.trim() && token !== 'undefined' && token !== 'null') {
        const headers: AxiosRequestHeaders = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
        config.headers = headers;
      } else {
        // 유효하지 않은 토큰은 제거
        console.warn('유효하지 않은 토큰 발견, 제거 중...');
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    }
  } catch (error) {
    console.warn('토큰 처리 중 오류:', error);
    // 스토리지 오류 시 토큰 정리 시도
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {}
  }
  return config;
});

// Pass through successful responses; normalize errors for easier handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as any;

    // 401이면 1회 한해 /auth/refresh 호출 후 원요청 재시도
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('토큰 만료, 갱신 시도 중...');
        
        // refresh 토큰으로 새로운 access 토큰 요청
        const refreshResp = await axios.post(
          `${API_CONFIG.BASE_URL}/api/auth/refresh`,
          {},
          { 
            withCredentials: true,
            timeout: 5000 // 5초 타임아웃
          }
        );
        
        if (refreshResp.data && refreshResp.data.data && refreshResp.data.data.access_token) {
          const newAccess = refreshResp.data.data.access_token;
          
          // 새 토큰을 localStorage에 저장
          try {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccess);
            console.log('토큰 갱신 성공');
          } catch (storageError) {
            console.warn('토큰 저장 실패:', storageError);
          }
          
          // 원래 요청에 새 토큰으로 헤더 설정
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newAccess}`,
          };
          
          // 원래 요청 재시도
          return apiClient(originalRequest);
        } else {
          throw new Error('토큰 갱신 응답에 access_token이 없습니다');
        }
      } catch (refreshError) {
        console.warn('토큰 갱신 실패:', refreshError);
        
        // refresh 실패 시 토큰 정리
        try {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        } catch (storageError) {
          console.warn('토큰 정리 실패:', storageError);
        }
      }
    }

    // 401 에러가 아닌 경우 또는 refresh 실패한 경우
    if (status === 401) {
      console.log('401 에러 발생 - 인증 필요');
      // 토큰이 이미 정리되었으므로 추가 정리 불필요
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };

