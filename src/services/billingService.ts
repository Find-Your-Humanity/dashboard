import { apiClient } from './apiClient';
import { ApiResponse } from '../types';
import axios, { AxiosError } from 'axios';

export interface Plan {
  id: number;
  name: string;
  price: number;
  request_limit: number;
  description: string;
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
  // 현재 요금제 정보 조회
  async getCurrentPlan(): Promise<ApiResponse<CurrentPlan>> {
    try {
      const response = await apiClient.get('/api/billing/current-plan');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        data: {} as CurrentPlan,
        error: handleAxiosError(error, '현재 요금제 정보를 불러오는데 실패했습니다.')
      };
    }
  }

  // 사용 가능한 요금제 목록 조회
  async getAvailablePlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await apiClient.get('/api/billing/plans');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        data: [] as Plan[],
        error: handleAxiosError(error, '요금제 목록을 불러오는데 실패했습니다.')
      };
    }
  }

  // 요금제 변경
  async changePlan(planId: number): Promise<ApiResponse<PlanChangeResponse>> {
    try {
      const response = await apiClient.post('/api/billing/change-plan', { plan_id: planId });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        data: {} as PlanChangeResponse,
        error: handleAxiosError(error, '요금제 변경에 실패했습니다.')
      };
    }
  }

  // 사용량 히스토리 조회
  async getUsageHistory(days: number = 30): Promise<ApiResponse<UsageHistory[]>> {
    try {
      const response = await apiClient.get(`/api/billing/usage-history?days=${days}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        data: [] as UsageHistory[],
        error: handleAxiosError(error, '사용량 히스토리를 불러오는데 실패했습니다.')
      };
    }
  }

  // 결제 내역 조회
  async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/api/billing/payment-history');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        data: [] as any[],
        error: handleAxiosError(error, '결제 내역을 불러오는데 실패했습니다.')
      };
    }
  }
}

export const billingService = new BillingService();
