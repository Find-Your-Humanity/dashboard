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
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatNumber, formatPercentage } from '../utils';
import { dashboardService } from '../services/dashboardService';
import { CaptchaStats } from '../types';

const AnalyticsScreen: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('7days');
  const [statsData, setStatsData] = useState<CaptchaStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

      {/* 로딩/에러 상태 표시 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          데이터를 불러오는 중입니다...
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 기간별 요청 현황 (API 연동) */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {timePeriod === '7days' ? '일별 요청 현황' : timePeriod === '30days' ? '주간 요청 현황' : '월간 요청 현황'}
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="success" fill="#2e7d32" name="성공" isAnimationActive={!loading} />
                    <Bar dataKey="failed" fill="#d32f2f" name="실패" isAnimationActive={!loading} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 캡차 유형별 비율 */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                캡차 유형별 사용 비율
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={captchaTypeStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {captchaTypeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
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