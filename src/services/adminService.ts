import { ApiResponse } from '../types';
import { apiClient } from './apiClient';

// 사용자 관리 타입들
export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  contact?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  // 구독 정보 추가
  current_plan?: string;
  plan_display_name?: string;
  subscription_status?: string;
  subscription_expires?: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  name?: string;
  contact?: string;
  is_admin?: boolean;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  name?: string;
  contact?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 요금제 관리 타입들
export interface Plan {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  plan_type: string;
  price: number;
  currency: string;
  billing_cycle: string;
  monthly_request_limit?: number;
  concurrent_requests: number;
  features?: any;
  rate_limit_per_minute: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  subscriber_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlanCreate {
  name: string;
  display_name: string;
  description?: string;
  plan_type?: string;
  price: number;
  currency?: string;
  billing_cycle?: string;
  monthly_request_limit?: number;
  concurrent_requests?: number;
  features?: any;
  rate_limit_per_minute?: number;
  is_active?: boolean;
  is_popular?: boolean;
  sort_order?: number;
}

export interface PlanUpdate {
  name?: string;
  display_name?: string;
  description?: string;
  plan_type?: string;
  price?: number;
  currency?: string;
  billing_cycle?: string;
  monthly_request_limit?: number;
  concurrent_requests?: number;
  features?: any;
  rate_limit_per_minute?: number;
  is_active?: boolean;
  is_popular?: boolean;
  sort_order?: number;
}

export interface UserSubscription {
  id: number;
  start_date: string;
  end_date?: string;
  plan_id: number;
  plan_name: string;
  price: number;
  request_limit: number;
  description?: string;
}

class AdminService {
  // ==================== 사용자 관리 ====================
  
  async getUsers(page = 1, limit = 20, search?: string): Promise<ApiResponse<UsersResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await apiClient.get<ApiResponse<UsersResponse>>(
        `/api/admin/users?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        '/api/admin/users',
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: number, userData: UserUpdate): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        `/api/admin/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `/api/admin/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== 요금제 관리 ====================

  async getPlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await apiClient.get<ApiResponse<Plan[]>>('/api/admin/plans');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createPlan(planData: PlanCreate): Promise<ApiResponse<Plan>> {
    try {
      const response = await apiClient.post<ApiResponse<Plan>>(
        '/api/admin/plans',
        planData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePlan(planId: number, planData: PlanUpdate): Promise<ApiResponse<Plan>> {
    try {
      const response = await apiClient.put<ApiResponse<Plan>>(
        `/api/admin/plans/${planId}`,
        planData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePlan(planId: number): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `/api/admin/plans/${planId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== 사용자 구독 관리 ====================

  async getUserSubscription(userId: number): Promise<ApiResponse<UserSubscription | null>> {
    try {
      const response = await apiClient.get<ApiResponse<UserSubscription | null>>(
        `/api/admin/users/${userId}/subscription`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async assignPlanToUser(userId: number, planId: number): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(
        `/api/admin/users/${userId}/subscription`,
        { plan_id: planId }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const adminService = new AdminService();
