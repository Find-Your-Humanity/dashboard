import { apiClient } from './apiClient';

// API 키 관련 타입 정의
export interface APIKey {
  id: number;
  key_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  allowed_origins?: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
}

export interface APIKeyCreate {
  name: string;
  description?: string;
  expires_at?: Date;
  allowed_origins?: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
}

export interface APIKeyUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  allowed_origins?: string[];
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
}

export interface APIKeyCreateResponse {
  api_key: string;
  key_info: APIKey;
}

// API 키 서비스 클래스
class ApiKeyService {
  // API 키 목록 조회
  async getApiKeys(): Promise<APIKey[]> {
    const response = await apiClient.get('/api/keys');
    return response.data;
  }

  // API 키 생성
  async createApiKey(data: APIKeyCreate): Promise<APIKeyCreateResponse> {
    const response = await apiClient.post('/api/keys', data);
    return response.data;
  }

  // API 키 조회
  async getApiKey(keyId: string): Promise<APIKey> {
    const response = await apiClient.get(`/api/keys/${keyId}`);
    return response.data;
  }

  // API 키 수정
  async updateApiKey(keyId: string, data: APIKeyUpdate): Promise<APIKey> {
    const response = await apiClient.put(`/api/keys/${keyId}`, data);
    return response.data;
  }

  // API 키 삭제
  async deleteApiKey(keyId: string): Promise<void> {
    await apiClient.delete(`/api/keys/${keyId}`);
  }

  // API 키 재생성
  async regenerateApiKey(keyId: string): Promise<APIKeyCreateResponse> {
    const response = await apiClient.post(`/api/keys/${keyId}/regenerate`);
    return response.data;
  }
}

// 싱글톤 인스턴스 생성
export const apiKeyService = new ApiKeyService();

// 기존 apiClient를 그대로 export하여 다른 곳에서도 사용할 수 있도록 함
export const apiService = apiClient;
