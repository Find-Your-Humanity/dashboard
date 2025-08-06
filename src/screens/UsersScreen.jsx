import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const UsersScreen = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        사용자 관리
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        사용자 정보를 관리하세요.
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            사용자 관리 기능 준비 중
          </Typography>
          <Typography variant="body2" color="text.secondary">
            이 기능은 곧 업데이트될 예정입니다.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsersScreen; 