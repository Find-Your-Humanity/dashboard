import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.realcatcha.com';

export interface ApiKey {
  id: number;
  key_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  last_used_at: string | null;
  usage_count: number;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
}

export interface CreateApiKeyResponse {
  success: boolean;
  api_key: string;
  secret_key: string;
  created_at: string;
}

export interface ApiKeyListResponse {
  success: boolean;
  api_keys: ApiKey[];
}

export interface ToggleApiKeyRequest {
  is_active: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

class ApiKeyService {
  private handleAxiosError(error: any): never {
    if (error.response) {
      // 서버 응답이 있는 경우
      const message = error.response.data?.detail || error.response.data?.message || '서버 오류가 발생했습니다.';
      throw new Error(message);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      throw new Error('서버에 연결할 수 없습니다.');
    } else {
      // 요청 자체에 문제가 있는 경우
      throw new Error('요청을 보낼 수 없습니다.');
    }
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    try {
      const response = await axios.post<CreateApiKeyResponse>(
        `${API_BASE_URL}/api/v1/keys/create`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await axios.get<ApiKeyListResponse>(
        `${API_BASE_URL}/api/v1/keys/list`,
        {
          withCredentials: true,
        }
      );
      return response.data.api_keys;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  async toggleApiKey(keyId: string, isActive: boolean): Promise<ApiResponse> {
    try {
      const response = await axios.patch<ApiResponse>(
        `${API_BASE_URL}/api/v1/keys/${keyId}/toggle`,
        { is_active: isActive },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  async deleteApiKey(keyId: string): Promise<ApiResponse> {
    try {
      const response = await axios.delete<ApiResponse>(
        `${API_BASE_URL}/api/v1/keys/${keyId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }
}

export const apiKeyService = new ApiKeyService();
