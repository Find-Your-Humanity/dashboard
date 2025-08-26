import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

export interface Plan {
  id: number;
  name: string;
  price: number;
  request_limit: number;
  description: string;
  features: string[];
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
      console.error('요금제 목록 조회 실패:', error);
      return {
        success: false,
        data: [] as Plan[],
        error: '요금제 목록을 불러오는데 실패했습니다.'
      };
    }
  }

  // 현재 사용자의 요금제 정보 조회
  async getCurrentPlan(): Promise<ApiResponse<CurrentPlan>> {
    try {
      const response = await apiClient.get('/api/billing/current-plan');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('현재 요금제 조회 실패:', error);
      return {
        success: false,
        data: {} as CurrentPlan,
        error: '현재 요금제 정보를 불러오는데 실패했습니다.'
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
      console.error('사용량 히스토리 조회 실패:', error);
      return {
        success: false,
        data: [] as UsageHistory[],
        error: '사용량 히스토리를 불러오는데 실패했습니다.'
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
      console.error('요금제 변경 실패:', error);
      return {
        success: false,
        data: {} as PlanChangeResponse,
        error: '요금제 변경에 실패했습니다.'
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
      console.error('사용량 통계 조회 실패:', error);
      return {
        success: false,
        data: {
          current_month: { tokens_used: 0, api_calls: 0, overage_cost: 0 },
          last_month: { tokens_used: 0, api_calls: 0, overage_cost: 0 }
        },
        error: '사용량 통계를 불러오는데 실패했습니다.'
      };
    }
  }
}

export const billingService = new BillingService();
