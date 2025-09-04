import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  LinearProgress,
  Chip,
  TextField,
  Button,
  Skeleton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber, formatPercentage } from '../utils';
import { dashboardService } from '../services/dashboardService';
import { CaptchaStats, ApiUsageLimit } from '../types';
import AnalyticsSkeleton from '../components/AnalyticsSkeleton';
import AnalyticsChart from '../components/AnalyticsChart';

const AnalyticsScreen: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('7days');
  const [statsData, setStatsData] = useState<CaptchaStats[]>([]);
  const [usageLimits, setUsageLimits] = useState<ApiUsageLimit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // API 키 사용량 관련 상태
  const [apiKeyUsage, setApiKeyUsage] = useState<any>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);

  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    setTimePeriod(event.target.value);
  };

  // API 연동: 기간 변경 시 통계 조회
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const period: 'daily' | 'weekly' | 'monthly' =
          timePeriod === '7days' ? 'daily' : timePeriod === '30days' ? 'weekly' : 'monthly';
        const res = await dashboardService.getStats(period);
        if (res.success) {
          setStatsData(res.data);
        } else {
          setError(res.message || '통계 데이터를 불러오지 못했습니다.');
          setStatsData([]);
        }
      } catch (e) {
        setError('통계 데이터를 불러오지 못했습니다.');
        setStatsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timePeriod]);

  // API 사용량 제한 조회
  useEffect(() => {
    const fetchUsageLimits = async () => {
      try {
        const res = await dashboardService.getUsageLimits();
        if (res.success) {
          setUsageLimits(res.data);
        }
      } catch (e) {
        console.error('API 사용량 제한 조회 실패:', e);
      }
    };
    
    // 초기 로드
    fetchUsageLimits();
    
    // 요금제 변경 이벤트 리스너 추가
    const handlePlanChanged = () => {
      console.log('요금제 변경 감지됨 - Analytics 데이터 새로고침');
      fetchUsageLimits();
    };
    
    window.addEventListener('planChanged', handlePlanChanged);
    
    // 클린업
    return () => {
      window.removeEventListener('planChanged', handlePlanChanged);
    };
  }, []);

  // 차트용 가공 데이터 생성 (라벨은 기간에 따라 합성)
  const chartData = useMemo(() => {
    const length = statsData.length;
    const labels: string[] = [];
    if (length === 7) {
      // 최근 7일: D-6 ~ D-0
      for (let i = length - 1; i >= 0; i--) labels.push(`D-${i}`);
    } else if (length === 4) {
      labels.push('W1', 'W2', 'W3', 'W4');
    } else if (length === 3) {
      labels.push('M1', 'M2', 'M3');
    } else {
      for (let i = 0; i < length; i++) labels.push(String(i + 1));
    }
    return statsData.map((s, idx) => ({
      label: labels[idx] ?? `${idx + 1}`,
      success: s.successfulSolves,
      failed: s.failedAttempts,
    }));
  }, [statsData]);

  // 사용량 제한 상태에 따른 색상 반환
  const getUsageStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'exceeded': return 'error';
      default: return 'default';
    }
  };

  // 사용량 퍼센트 계산
  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  // API 키 사용량 조회 함수
  const fetchApiKeyUsage = async (apiKey: string) => {
    try {
      setApiKeyLoading(true);
      const res = await dashboardService.getApiKeyUsage(apiKey);
      if (res.success) {
        setApiKeyUsage(res.data);
      }
    } catch (e) {
      console.error('API 키 사용량 조회 실패:', e);
      setApiKeyUsage(null);
    } finally {
      setApiKeyLoading(false);
    }
  };

  // API 키 사용량 조회 버튼 핸들러
  const handleApiKeyUsageCheck = () => {
    if (apiKeyInput.trim()) {
      fetchApiKeyUsage(apiKeyInput.trim());
    }
  };

  const captchaTypeStats = [
    { name: '이미지 인식', value: 45, color: '#1976d2' },
    { name: '필기 인식', value: 35, color: '#dc004e' },
    { name: '감정 인식', value: 20, color: '#f57c00' },
  ];

  const errorTypes = [
    { type: '타임아웃', count: 156, percentage: 42.5 },
    { type: '잘못된 입력', count: 98, percentage: 26.7 },
    { type: '네트워크 오류', count: 67, percentage: 18.2 },
    { type: '서버 오류', count: 46, percentage: 12.5 },
  ];

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            분석
          </Typography>
          <Typography variant="body1" color="text.secondary">
            캡차 서비스 사용 패턴 및 성능 분석
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>기간</InputLabel>
          <Select
            value={timePeriod}
            label="기간"
            onChange={handleTimePeriodChange}
          >
            <MenuItem value="7days">최근 7일</MenuItem>
            <MenuItem value="30days">최근 30일</MenuItem>
            <MenuItem value="90days">최근 90일</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 에러 상태 표시 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* 초기 로딩 시 스켈레톤 표시 */}
      {loading && (
        <AnalyticsSkeleton />
      )}

      <Grid container spacing={3}>
        {/* API 사용량 제한 확인 */}
        {usageLimits && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    API 사용량 제한 확인
                  </Typography>
                  <Chip 
                    label={`${usageLimits.planDisplayName || usageLimits.plan.toUpperCase()} 플랜`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Grid container spacing={3}>
                  {/* 분당 요청 제한 */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">분당 요청 제한</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(usageLimits.currentUsage.perMinute)} / {formatNumber(usageLimits.limits.perMinute)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getUsagePercentage(usageLimits.currentUsage.perMinute, usageLimits.limits.perMinute)}
                        color={getUsageStatusColor(usageLimits.status) as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        리셋: {new Date(usageLimits.resetTimes.perMinute).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* 일일 요청 제한 */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">일일 요청 제한</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(usageLimits.currentUsage.perDay)} / {formatNumber(usageLimits.limits.perDay)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getUsagePercentage(usageLimits.currentUsage.perDay, usageLimits.limits.perDay)}
                        color={getUsageStatusColor(usageLimits.status) as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        리셋: {new Date(usageLimits.resetTimes.perDay).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* 월간 요청 제한 */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">월간 요청 제한</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(usageLimits.currentUsage.perMonth)} / {formatNumber(usageLimits.limits.perMonth)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getUsagePercentage(usageLimits.currentUsage.perMonth, usageLimits.limits.perMonth)}
                        color={getUsageStatusColor(usageLimits.status) as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        리셋: {new Date(usageLimits.resetTimes.perMonth).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* 사용량 제한 경고 */}
                {usageLimits.status !== 'normal' && (
                  <Alert 
                    severity={usageLimits.status === 'exceeded' ? 'error' : 'warning'} 
                    sx={{ mt: 2 }}
                  >
                    {usageLimits.status === 'exceeded' 
                      ? 'API 사용량 제한을 초과했습니다. 플랜을 업그레이드하거나 다음 리셋 시간까지 기다려주세요.'
                      : 'API 사용량이 제한에 근접하고 있습니다. 사용량을 모니터링하세요.'
                    }
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* API 키 사용량 조회 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API 키 사용량 조회
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="API 키 입력"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="예: rc_live_f49a055d62283fd02e8203ccaba70fc2"
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleApiKeyUsageCheck}
                  disabled={!apiKeyInput.trim() || apiKeyLoading}
                  sx={{ minWidth: 120 }}
                >
                  {apiKeyLoading ? '조회 중...' : '조회'}
                </Button>
              </Box>
              
              {apiKeyUsage && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    API 키: {apiKeyUsage.name || apiKeyUsage.apiKey}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {formatNumber(apiKeyUsage.totalRequests)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          총 요청 수
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main">
                          {formatNumber(apiKeyUsage.successRequests)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          성공 요청
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="error.main">
                          {formatNumber(apiKeyUsage.failedRequests)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          실패 요청
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="info.main">
                          {apiKeyUsage.avgResponseTime}ms
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          평균 응답 시간
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  {apiKeyUsage.lastUsed && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      마지막 사용: {new Date(apiKeyUsage.lastUsed).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 기간별 요청 현황 (API 연동) */}
        <Grid item xs={12}>
          <AnalyticsChart 
            data={chartData} 
            loading={loading} 
            timePeriod={timePeriod} 
          />
        </Grid>



        {/* 오류 유형 분석 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                오류 유형 분석
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {errorTypes.map((error, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" color="error.main">
                        {formatNumber(error.count)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {error.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({formatPercentage(error.percentage)})
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 성능 메트릭 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                성능 메트릭
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">평균 응답 시간</Typography>
                  <Typography variant="body2" fontWeight="bold">245ms</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">95% 응답 시간</Typography>
                  <Typography variant="body2" fontWeight="bold">890ms</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">초당 처리 요청</Typography>
                  <Typography variant="body2" fontWeight="bold">2.1/s</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">업타임</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">99.9%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 사용자 통계 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                사용자 통계
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">일일 활성 사용자</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatNumber(15420)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">신규 사용자</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatNumber(1240)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">재방문 사용자</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatNumber(14180)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">평균 세션 시간</Typography>
                  <Typography variant="body2" fontWeight="bold">4m 32s</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsScreen;