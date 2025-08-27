import { apiClient } from './apiClient';
import { ApiResponse } from '../types';
import axios, { AxiosError } from 'axios';

export interface Plan {
  id: number;
  name: string;
  price: number;
  request_limit: number;
  description: string;
  // 백엔드에서는 dict(JSON) 형태를 반환하므로 호환 타입으로 둔다
  features: string[] | Record<string, unknown>;
  rate_limit_per_minute: number;
  is_popular: boolean;
  sort_order: number;
}

export interface CurrentPlan {
  plan: Plan;
  current_usage: {
    tokens_used: number;
    api_calls: number;
    overage_tokens: number;
    overage_cost: number;
    tokens_limit: number;
    average_tokens_per_call: number;
    success_rate: number;
  };
  billing_info: {
    base_fee: number;
    overage_fee: number;
    total_amount: number;
    start_date: string | null;
    end_date: string | null;
  };
  pending_changes?: {
    plan_id: number;
    plan_name: string;
    effective_date: string;
  };
}

export interface UsageHistory {
  date: string;
  tokens_used: number;
  api_calls: number;
  overage_tokens: number;
  overage_cost: number;
}

export interface PlanChangeRequest {
  plan_id: number;
}

export interface PlanChangeResponse {
  success: boolean;
  message: string;
  plan_id: number;
  effective_date: string;
}

// Axios 에러 처리 헬퍼 함수
function handleAxiosError(error: any, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network Error (서버 연결 실패)
    if (axiosError.code === 'ERR_NETWORK') {
      return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
    
    // Timeout Error
    if (axiosError.code === 'ECONNABORTED') {
      return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }
    
    // HTTP Status Error
    if (axiosError.response) {
      const status = axiosError.response.status;
      switch (status) {
        case 401:
          return '인증이 필요합니다. 다시 로그인해주세요.';
        case 403:
          return '접근 권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 500:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return `서버 오류가 발생했습니다. (${status})`;
      }
    }
    
    // 기타 Axios 에러
    return axiosError.message || defaultMessage;
  }
  
  // 일반 JavaScript 에러
  return error?.message || defaultMessage;
}

class BillingService {
  // 사용 가능한 요금제 목록 조회
  async getAvailablePlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await apiClient.get('/api/billing/plans');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '요금제 목록을 불러오는데 실패했습니다.');
      console.error('요금제 목록 조회 실패:', error);
      return {
        success: false,
        data: [] as Plan[],
        error: errorMessage
      };
    }
  }

  // 현재 사용자의 요금제 정보 조회
  async getCurrentPlan(): Promise<ApiResponse<CurrentPlan>> {
    try {
      // 쿠키 전송을 명시적으로 보장
      const response = await apiClient.get('/api/billing/current-plan', { withCredentials: true });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '현재 요금제 정보를 불러오는데 실패했습니다.');
      // 서버 응답 전문을 함께 출력하여 디버깅 가시성 향상
      const anyErr = error as any;
      console.error('현재 요금제 조회 실패:', {
        message: errorMessage,
        status: anyErr?.response?.status,
        data: anyErr?.response?.data,
        headers: anyErr?.response?.headers,
      });
      return {
        success: false,
        data: {} as CurrentPlan,
        error: errorMessage
      };
    }
  }

  // 사용량 히스토리 조회
  async getUsageHistory(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<UsageHistory[]>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiClient.get(`/api/billing/usage?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '사용량 히스토리를 불러오는데 실패했습니다.');
      console.error('사용량 히스토리 조회 실패:', error);
      return {
        success: false,
        data: [] as UsageHistory[],
        error: errorMessage
      };
    }
  }

  // 요금제 변경
  async changePlan(planId: number): Promise<ApiResponse<PlanChangeResponse>> {
    try {
      const response = await apiClient.post('/api/billing/change-plan', {
        plan_id: planId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '요금제 변경에 실패했습니다.');
      console.error('요금제 변경 실패:', error);
      return {
        success: false,
        data: {} as PlanChangeResponse,
        error: errorMessage
      };
    }
  }

  // 사용량 통계 조회
  async getUsageStats(): Promise<ApiResponse<{
    current_month: {
      tokens_used: number;
      api_calls: number;
      overage_cost: number;
    };
    last_month: {
      tokens_used: number;
      api_calls: number;
      overage_cost: number;
    };
  }>> {
    try {
      const response = await apiClient.get('/api/billing/usage-stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '사용량 통계를 불러오는데 실패했습니다.');
      console.error('사용량 통계 조회 실패:', error);
      return {
        success: false,
        data: {
          current_month: { tokens_used: 0, api_calls: 0, overage_cost: 0 },
          last_month: { tokens_used: 0, api_calls: 0, overage_cost: 0 }
        },
        error: errorMessage
      };
    }
  }
}

export const billingService = new BillingService();

import axios, { AxiosError } from 'axios';

export interface Plan {
  id: number;
  name: string;
  price: number;
  request_limit: number;
  description: string;
  // 백엔드에서는 dict(JSON) 형태를 반환하므로 호환 타입으로 둔다
  features: string[] | Record<string, unknown>;
  rate_limit_per_minute: number;
  is_popular: boolean;
  sort_order: number;
}

export interface CurrentPlan {
  plan: Plan;
  current_usage: {
    tokens_used: number;
    api_calls: number;
    overage_tokens: number;
    overage_cost: number;
    tokens_limit: number;
    average_tokens_per_call: number;
    success_rate: number;
  };
  billing_info: {
    base_fee: number;
    overage_fee: number;
    total_amount: number;
    start_date: string | null;
    end_date: string | null;
  };
  pending_changes?: {
    plan_id: number;
    plan_name: string;
    effective_date: string;
  };
}

export interface UsageHistory {
  date: string;
  tokens_used: number;
  api_calls: number;
  overage_tokens: number;
  overage_cost: number;
}

export interface PlanChangeRequest {
  plan_id: number;
}

export interface PlanChangeResponse {
  success: boolean;
  message: string;
  plan_id: number;
  effective_date: string;
}

// Axios 에러 처리 헬퍼 함수
function handleAxiosError(error: any, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network Error (서버 연결 실패)
    if (axiosError.code === 'ERR_NETWORK') {
      return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
    
    // Timeout Error
    if (axiosError.code === 'ECONNABORTED') {
      return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }
    
    // HTTP Status Error
    if (axiosError.response) {
      const status = axiosError.response.status;
      switch (status) {
        case 401:
          return '인증이 필요합니다. 다시 로그인해주세요.';
        case 403:
          return '접근 권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 500:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return `서버 오류가 발생했습니다. (${status})`;
      }
    }
    
    // 기타 Axios 에러
    return axiosError.message || defaultMessage;
  }
  
  // 일반 JavaScript 에러
  return error?.message || defaultMessage;
}

class BillingService {
  // 사용 가능한 요금제 목록 조회
  async getAvailablePlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await apiClient.get('/api/billing/plans');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '요금제 목록을 불러오는데 실패했습니다.');
      console.error('요금제 목록 조회 실패:', error);
      return {
        success: false,
        data: [] as Plan[],
        error: errorMessage
      };
    }
  }

  // 현재 사용자의 요금제 정보 조회
  async getCurrentPlan(): Promise<ApiResponse<CurrentPlan>> {
    try {
      // 쿠키 전송을 명시적으로 보장
      const response = await apiClient.get('/api/billing/current-plan', { withCredentials: true });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '현재 요금제 정보를 불러오는데 실패했습니다.');
      // 서버 응답 전문을 함께 출력하여 디버깅 가시성 향상
      const anyErr = error as any;
      console.error('현재 요금제 조회 실패:', {
        message: errorMessage,
        status: anyErr?.response?.status,
        data: anyErr?.response?.data,
        headers: anyErr?.response?.headers,
      });
      return {
        success: false,
        data: {} as CurrentPlan,
        error: errorMessage
      };
    }
  }

  // 사용량 히스토리 조회
  async getUsageHistory(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<UsageHistory[]>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiClient.get(`/api/billing/usage?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '사용량 히스토리를 불러오는데 실패했습니다.');
      console.error('사용량 히스토리 조회 실패:', error);
      return {
        success: false,
        data: [] as UsageHistory[],
        error: errorMessage
      };
    }
  }

  // 요금제 변경
  async changePlan(planId: number): Promise<ApiResponse<PlanChangeResponse>> {
    try {
      const response = await apiClient.post('/api/billing/change-plan', {
        plan_id: planId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '요금제 변경에 실패했습니다.');
      console.error('요금제 변경 실패:', error);
      return {
        success: false,
        data: {} as PlanChangeResponse,
        error: errorMessage
      };
    }
  }

  // 사용량 통계 조회
  async getUsageStats(): Promise<ApiResponse<{
    current_month: {
      tokens_used: number;
      api_calls: number;
      overage_cost: number;
    };
    last_month: {
      tokens_used: number;
      api_calls: number;
      overage_cost: number;
    };
  }>> {
    try {
      const response = await apiClient.get('/api/billing/usage-stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = handleAxiosError(error, '사용량 통계를 불러오는데 실패했습니다.');
      console.error('사용량 통계 조회 실패:', error);
      return {
        success: false,
        data: {
          current_month: { tokens_used: 0, api_calls: 0, overage_cost: 0 },
          last_month: { tokens_used: 0, api_calls: 0, overage_cost: 0 }
        },
        error: errorMessage
      };
    }
  }
}

export const billingService = new BillingService();
