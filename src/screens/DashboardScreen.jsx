import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
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
import ErrorStatsTable from '../components/Tables/ErrorStatsTable';
import EndpointUsageTable from '../components/Tables/EndpointUsageTable';
import { dashboardService } from '../services/dashboardService';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [errorStats, setErrorStats] = useState([]);
  const [endpointUsage, setEndpointUsage] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 요약/차트
      await dashboardService.getAnalytics().catch(() => null);
      await dashboardService.getStats('daily').catch(() => null);
      // 엔드포인트 사용량
      dashboardService.getCaptchaPerformance()
        .then((res) => {
          if (res.success) setEndpointUsage(res.data);
        })
        .catch(() => {});
      // 에러 집계는 추후 백엔드 추가 시 연동
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

  // Mock 데이터
  const mockMetrics = {
    totalRequests: 125430,
    successfulSolves: 118920,
    failedAttempts: 6510,
    successRate: 94.8,
    averageResponseTime: 245,
    currentActiveUsers: 1247,
    requestsPerMinute: 125,
    systemHealth: 'healthy',
  };

  const mockChartData = [
    { time: '00:00', requests: 45, success: 42 },
    { time: '04:00', requests: 38, success: 36 },
    { time: '08:00', requests: 78, success: 74 },
    { time: '12:00', requests: 125, success: 118 },
    { time: '16:00', requests: 156, success: 148 },
    { time: '20:00', requests: 89, success: 84 },
  ];

  // Mock: 에러 코드 집계
  const mockErrorStats = [
    { status_code: 200, count: 120430 },
    { status_code: 400, count: 520 },
    { status_code: 401, count: 190 },
    { status_code: 403, count: 85 },
    { status_code: 404, count: 760 },
    { status_code: 429, count: 210 },
    { status_code: 500, count: 55 },
    { status_code: 502, count: 18 },
    { status_code: 503, count: 12 },
  ];

  // Mock: 엔드포인트별 사용량
  const mockEndpointUsage = [
    { endpoint: '/api/captcha/verify', requests: 60540, avg_ms: 241 },
    { endpoint: '/api/captcha/init', requests: 42110, avg_ms: 198 },
    { endpoint: '/api/captcha/image', requests: 15820, avg_ms: 312 },
    { endpoint: '/api/auth/profile', requests: 420, avg_ms: 95 },
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatPercentage = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const formatResponseTime = (ms) => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
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
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
            RealCatcha Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            캡차 서비스 실시간 지표와 운영 현황
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
                icon={<SuccessIcon />}
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

      {/* 테이블 섹션 */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                에러 코드 집계 (일별)
              </Typography>
              <ErrorStatsTable rows={mockErrorStats} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                엔드포인트별 사용량 (일별)
              </Typography>
              <EndpointUsageTable rows={endpointUsage.length ? endpointUsage : mockEndpointUsage} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardScreen; 