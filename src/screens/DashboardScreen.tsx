import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '@/services/dashboardService';
import { DashboardAnalytics, CaptchaStats } from '@/types';
import { formatNumber, formatPercentage, formatResponseTime } from '@/utils';

const DashboardScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [stats, setStats] = useState<CaptchaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, statsResponse] = await Promise.all([
        dashboardService.getAnalytics(),
        dashboardService.getStats('daily'),
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Mock 데이터 (API 연동 전 더미 데이터)
  const mockMetrics = {
    totalRequests: 125430,
    successfulSolves: 118920,
    failedAttempts: 6510,
    successRate: 94.8,
    averageResponseTime: 245,
    currentActiveUsers: 1247,
    requestsPerMinute: 125,
    systemHealth: 'healthy' as const,
  };

  const mockChartData = [
    { time: '00:00', requests: 45, success: 42 },
    { time: '04:00', requests: 38, success: 36 },
    { time: '08:00', requests: 78, success: 74 },
    { time: '12:00', requests: 125, success: 118 },
    { time: '16:00', requests: 156, success: 148 },
    { time: '20:00', requests: 89, success: 84 },
  ];

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            대시보드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real Captcha 서비스 모니터링 및 관리
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            마지막 업데이트: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <IconButton onClick={loadDashboardData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 시스템 상태 */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                시스템 상태
              </Typography>
              <Chip
                label="정상 운영"
                color="success"
                variant="outlined"
                icon={<CheckCircle />}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 주요 메트릭 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 요청 수"
            value={formatNumber(mockMetrics.totalRequests)}
            icon={<SecurityIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="성공률"
            value={formatPercentage(mockMetrics.successRate)}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            subtitle={`${formatNumber(mockMetrics.successfulSolves)} / ${formatNumber(mockMetrics.totalRequests)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="평균 응답 시간"
            value={formatResponseTime(mockMetrics.averageResponseTime)}
            icon={<SpeedIcon sx={{ fontSize: 40 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="현재 활성 사용자"
            value={formatNumber(mockMetrics.currentActiveUsers)}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="#9c27b0"
            subtitle={`${mockMetrics.requestsPerMinute}/분`}
          />
        </Grid>
      </Grid>

      {/* 차트 */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                시간별 요청 현황
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#1976d2"
                      strokeWidth={2}
                      name="전체 요청"
                    />
                    <Line
                      type="monotone"
                      dataKey="success"
                      stroke="#2e7d32"
                      strokeWidth={2}
                      name="성공 요청"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                실시간 알림
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SuccessIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body2">
                    모든 서비스가 정상 작동 중입니다.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ErrorIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body2">
                    GPU 풀 사용률이 85%에 도달했습니다.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardScreen;