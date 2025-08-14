import { ApiResponse, DashboardAnalytics, CaptchaStats } from '../types';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

class DashboardService {
  async getAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardAnalytics>>(
        API_ENDPOINTS.DASHBOARD.ANALYTICS
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getStats(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ApiResponse<CaptchaStats[]>> {
    try {
      const response = await apiClient.get<ApiResponse<CaptchaStats[]>>(
        `${API_ENDPOINTS.DASHBOARD.STATS}?period=${period}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRealtimeMetrics(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.DASHBOARD.REALTIME
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCaptchaLogs(params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    status?: 'success' | 'failed';
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.CAPTCHA.LOGS,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCaptchaPerformance(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.CAPTCHA.PERFORMANCE
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();