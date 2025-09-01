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

// 쿠키 기반 인증 사용: Authorization 헤더 자동 부착 로직 제거
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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
        
        if (refreshResp.data && (refreshResp.data.data?.access_token || refreshResp.data.access_token)) {
          // 서버가 쿠키를 갱신하므로 헤더/스토리지 조작 없이 재시도만 수행
          console.log('토큰 갱신 성공 (쿠키 기반)');

          // 원래 요청 재시도 (withCredentials 유지)
          return apiClient(originalRequest);
        } else {
          throw new Error('토큰 갱신 응답에 access_token이 없습니다');
        }
      } catch (refreshError) {
        console.warn('토큰 갱신 실패:', refreshError);
        
        // refresh 실패 시 로컬 저장소 토큰 사용 안 함 (쿠키 기반)
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

