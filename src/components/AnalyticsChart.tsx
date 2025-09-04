import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
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
import { ApiType } from '../types';

interface ChartData {
  label: string;
  success: number;
  failed: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  loading: boolean;
  timePeriod: string;
  apiType: ApiType;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = React.memo(({ data, loading, timePeriod, apiType }) => {
  const getApiTypeName = () => {
    switch (apiType) {
      case 'all': return '전체';
      case 'handwriting': return '필기 캡차';
      case 'abstract': return '추상 캡차';
      case 'imagecaptcha': return '이미지 캡차';
      default: return '전체';
    }
  };

  const getChartTitle = () => {
    const apiName = getApiTypeName();
    switch (timePeriod) {
      case '7days': return `${apiName} 일별 요청 현황`;
      case '30days': return `${apiName} 주간 요청 현황`;
      case '90days': return `${apiName} 월간 요청 현황`;
      default: return `${apiName} 요청 현황`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {getChartTitle()}
          </Typography>
          <Box sx={{ 
            height: 400, 
            mt: 2, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {getChartTitle()}
          </Typography>
          <Box sx={{ 
            height: 400, 
            mt: 2, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Typography variant="body1" color="text.secondary">
              데이터가 없습니다.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {getChartTitle()}
        </Typography>
        <Box sx={{ height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="success" fill="#2e7d32" name="성공" />
              <Bar dataKey="failed" fill="#d32f2f" name="실패" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
});

AnalyticsChart.displayName = 'AnalyticsChart';

export default AnalyticsChart;
