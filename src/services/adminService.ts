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
  active_subscribers?: number;
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

// 요금제별 구독자 상세 정보 타입들
export interface PlanSubscriber {
  user_id: number;
  username: string;
  email: string;
  name?: string;
  user_created_at: string;
  subscription_id: number;
  start_date: string;
  end_date?: string;
  subscription_status: string;
  amount: number;
  payment_method?: string;
  notes?: string;
  subscription_created_at: string;
  plan_name: string;
  plan_display_name: string;
  monthly_request_limit?: number;
  monthly_requests_used: number;
  daily_requests_used: number;
  last_request_time?: string;
}

export interface PlanSubscriberStats {
  plan_info: {
    id: number;
    name: string;
    display_name: string;
  };
  total_subscribers: number;
  active_subscribers: number;
  total_monthly_requests: number;
  total_daily_requests: number;
}

export interface PlanSubscribersResponse {
  plan_stats: PlanSubscriberStats;
  subscribers: PlanSubscriber[];
}

// 문의사항 관련 타입들
export interface ContactRequest {
  id: number;
  subject: string;
  contact: string;
  email: string;
  message: string;
  attachment_filename?: string;
  status: 'unread' | 'in_progress' | 'resolved';
  admin_response?: string;
  admin_username?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface ContactRequestsResponse {
  data: ContactRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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

  // ==================== 요금제별 구독자 상세 정보 ====================
  
  async getPlanSubscribers(planId: number): Promise<ApiResponse<PlanSubscribersResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<PlanSubscribersResponse>>(
        `/api/admin/plans/${planId}/subscribers`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== 문의사항 관리 ====================
  
  async getContactRequests(page = 1, limit = 20, status?: string): Promise<ApiResponse<ContactRequestsResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) {
        params.append('status', status);
      }
      
      const response = await apiClient.get<ApiResponse<ContactRequestsResponse>>(
        `/api/admin/contact-requests?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateContactRequest(contactId: number, status?: string, adminResponse?: string): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      
      if (status) {
        params.append('status', status);
      }
      
      if (adminResponse !== undefined) {
        params.append('admin_response', adminResponse);
      }
      
      const response = await apiClient.put<ApiResponse>(
        `/api/admin/contact-requests/${contactId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async downloadContactAttachment(contactId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `/api/admin/contact-requests/${contactId}/attachment`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== 요청 상태 관리 ====================
  
  async getRequestStats(days = 7): Promise<ApiResponse<RequestStats>> {
    try {
      const response = await apiClient.get<ApiResponse<RequestStats>>(
        `/api/admin/request-stats?days=${days}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRequestLogs(
    page = 1, 
    limit = 50, 
    days = 7,
    userId?: number,
    statusCode?: number,
    path?: string
  ): Promise<ApiResponse<RequestLogsResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        days: days.toString(),
      });
      
      if (userId) {
        params.append('user_id', userId.toString());
      }
      
      if (statusCode) {
        params.append('status_code', statusCode.toString());
      }
      
      if (path) {
        params.append('path', path);
      }
      
      const response = await apiClient.get<ApiResponse<RequestLogsResponse>>(
        `/api/admin/request-logs?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getErrorStats(days = 7): Promise<ApiResponse<ErrorStatsResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<ErrorStatsResponse>>(
        `/api/admin/error-stats?days=${days}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEndpointUsage(days = 7): Promise<ApiResponse<EndpointUsageResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<EndpointUsageResponse>>(
        `/api/admin/endpoint-usage?days=${days}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// 요청 상태 관리 타입들
export interface RequestLog {
  id: number;
  user_id?: number;
  api_key?: string;
  path: string;
  method: string;
  status_code: number;
  response_time: number;
  user_agent?: string;
  request_time: string;
  user_email?: string;
  user_username?: string;
}

export interface RequestStats {
  total_requests: number;
  success_count: number;
  failure_count: number;
  avg_response_time: number;
  unique_users: number;
  unique_api_keys: number;
}

export interface ErrorStats {
  status_code: number;
  count: number;
  percentage: number;
}

export interface EndpointUsage {
  endpoint: string;
  requests: number;
  avg_response_time: number;
  percentage: number;
}

export interface RequestLogsResponse {
  logs: RequestLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorStatsResponse {
  error_stats: ErrorStats[];
}

export interface EndpointUsageResponse {
  endpoint_usage: EndpointUsage[];
}

export const adminService = new AdminService();
