import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import { Error as ErrorIcon, Home as HomeIcon } from '@mui/icons-material';

const PaymentFailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 결제 정보 추출
  const planType = searchParams.get('planType');
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  const handleGoToBilling = () => {
    navigate('/billing');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    if (errorCode) return `오류 코드: ${errorCode}`;
    return "결제 처리 중 오류가 발생했습니다.";
  };

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="error">
            ❌ 결제에 실패했습니다
          </Typography>
          
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            {getErrorMessage()}
          </Alert>

          {planType && (
            <Box mb={3}>
              <Typography variant="body1" paragraph>
                <strong>{planType.toUpperCase()}</strong> 요금제 변경이 취소되었습니다.
              </Typography>
            </Box>
          )}

          <Box mt={4}>
            <Typography variant="body1" paragraph>
              결제에 실패했습니다. 다시 시도하거나 다른 결제 방법을 선택해주세요.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              문제가 지속되면 고객 지원팀에 문의해주세요.
            </Typography>
          </Box>

          <Box mt={4} display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToBilling}
              startIcon={<HomeIcon />}
            >
              요금제 관리로 돌아가기
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleGoToHome}
            >
              홈으로 돌아가기
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentFailScreen;

