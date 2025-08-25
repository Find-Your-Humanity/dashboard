import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.realcatcha.com';

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 인터페이스 정의
export interface Plan {
  id: number;
  name: string;
  price: number;
  request_limit: number;
  description: string;
  features: Record<string, any>;
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
  };
  billing_info: {
    base_fee: number;
    overage_fee: number;
    total_amount: number;
    start_date: string | null;
    end_date: string | null;
  };
}

export interface UsageResponse {
  date: string;
  tokens_used: number;
  api_calls: number;
  overage_tokens: number;
  overage_cost: number;
}

export interface UsageStats {
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
}

export interface PlanChangeRequest {
  plan_id: number;
}

export interface PlanChangeResponse {
  success: boolean;
  message: string;
  plan_id: number;
}

class BillingService {
  /**
   * 사용 가능한 요금제 목록 조회
   */
  async getAvailablePlans(): Promise<Plan[]> {
    try {
      const response = await apiClient.get<Plan[]>('/api/billing/plans');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available plans:', error);
      throw new Error('요금제 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 현재 사용자의 요금제 정보 조회
   */
  async getCurrentPlan(): Promise<CurrentPlan> {
    try {
      const response = await apiClient.get<CurrentPlan>('/api/billing/current-plan');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
      throw new Error('현재 요금제 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 사용량 히스토리 조회
   */
  async getUsageHistory(
    startDate?: string,
    endDate?: string
  ): Promise<UsageResponse[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiClient.get<UsageResponse[]>(
        `/api/billing/usage?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch usage history:', error);
      throw new Error('사용량 히스토리를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 요금제 변경
   */
  async changePlan(planId: number): Promise<PlanChangeResponse> {
    try {
      const response = await apiClient.post<PlanChangeResponse>(
        '/api/billing/change-plan',
        { plan_id: planId }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to change plan:', error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.detail || '요금제 변경에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('요금제 변경에 실패했습니다.');
    }
  }

  /**
   * 사용량 통계 조회
   */
  async getUsageStats(): Promise<UsageStats> {
    try {
      const response = await apiClient.get<UsageStats>('/api/billing/usage-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      throw new Error('사용량 통계를 불러오는데 실패했습니다.');
    }
  }
}

export const billingService = new BillingService();
