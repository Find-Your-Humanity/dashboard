import React, { useState } from 'react';
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
import { formatNumber, formatPercentage } from '@/utils';

const AnalyticsScreen: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('7days');

  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    setTimePeriod(event.target.value);
  };

  // Mock 데이터
  const dailyStats = [
    { date: '2025-01-20', requests: 1250, success: 1188, failed: 62 },
    { date: '2025-01-21', requests: 1340, success: 1271, failed: 69 },
    { date: '2025-01-22', requests: 1180, success: 1121, failed: 59 },
    { date: '2025-01-23', requests: 1520, success: 1444, failed: 76 },
    { date: '2025-01-24', requests: 1680, success: 1596, failed: 84 },
    { date: '2025-01-25', requests: 1890, success: 1796, failed: 94 },
    { date: '2025-01-26', requests: 1750, success: 1663, failed: 87 },
  ];

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
            캐트차 서비스 사용 패턴 및 성능 분석
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

      <Grid container spacing={3}>
        {/* 일별 요청 현황 */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                일별 요청 현황
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="success" fill="#2e7d32" name="성공" />
                    <Bar dataKey="failed" fill="#d32f2f" name="실패" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 캐트차 유형별 비율 */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                캐트차 유형별 사용 비율
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