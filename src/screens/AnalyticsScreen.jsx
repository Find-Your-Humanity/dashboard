import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const AnalyticsScreen = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        분석
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        상세 분석 데이터를 확인하세요.
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            분석 기능 준비 중
          </Typography>
          <Typography variant="body2" color="text.secondary">
            이 기능은 곧 업데이트될 예정입니다.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsScreen; 