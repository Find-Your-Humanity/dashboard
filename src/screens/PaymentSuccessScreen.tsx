import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle as CheckIcon, Home as HomeIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // URL 파라미터에서 결제 정보 추출
  const planId = searchParams.get('planId');
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');
  const paymentType = searchParams.get('paymentType');
  const paymentKey = searchParams.get('paymentKey');

  useEffect(() => {
    console.log("🔍 PaymentSuccessScreen 로드됨");
    console.log("🔍 URL 파라미터:", { planId, amount, orderId, paymentType, paymentKey });
    
    if (!planId || !amount || !orderId) {
      setError("결제 정보가 올바르지 않습니다.");
      setIsProcessing(false);
      return;
    }

    // 결제 완료 처리
    confirmPayment();
  }, [planId, amount, orderId, paymentType, paymentKey]);

  const confirmPayment = async () => {
    try {
      console.log("🔍 결제 완료 처리 시작");
      
      // null 체크 및 타입 안전성 확보
      if (!amount || !planId) {
        setError("결제 정보가 올바르지 않습니다.");
        setIsProcessing(false);
        return;
      }
      
      const response = await fetch('https://gateway.realcatcha.com/api/payments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: paymentKey || 'DASHBOARD_DIRECT',
          orderId: orderId || '',
          amount: parseInt(amount),
          plan_id: parseInt(planId)
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentResult(result);
        console.log("✅ 결제 승인 성공:", result);
      } else {
        setError(result.detail || "결제 승인에 실패했습니다.");
        console.error("❌ 결제 승인 실패:", result);
      }
    } catch (error) {
      console.error("❌ 결제 승인 요청 오류:", error);
      setError("결제 승인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/billing');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  if (isProcessing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">결제를 처리하고 있습니다...</Typography>
          <Typography variant="body2" color="text.secondary">
            잠시만 기다려주세요.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleGoToDashboard}>
          요금제 관리로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            🎉 결제가 완료되었습니다!
          </Typography>
          
          {paymentResult && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                구독 정보
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">요금제:</Typography>
                <Typography variant="body2">{paymentResult.message}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">결제 ID:</Typography>
                <Typography variant="body2">{paymentResult.payment_id}</Typography>
              </Box>
              
                             <Box display="flex" justifyContent="space-between" mb={1}>
                 <Typography variant="body2" color="text.secondary">주문 ID:</Typography>
                 <Typography variant="body2">{orderId || 'N/A'}</Typography>
               </Box>
               
               <Box display="flex" justifyContent="space-between" mb={1}>
                 <Typography variant="body2" color="text.secondary">결제 금액:</Typography>
                 <Typography variant="body2">₩{amount ? parseInt(amount).toLocaleString() : 'N/A'}</Typography>
               </Box>
            </Box>
          )}

          <Box mt={4}>
            <Typography variant="body1" paragraph>
              선택하신 요금제가 즉시 적용되었습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              이제 CAPTCHA 서비스를 이용하실 수 있습니다.
            </Typography>
          </Box>

          <Box mt={4} display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToDashboard}
              startIcon={<HomeIcon />}
            >
              요금제 관리로 이동
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

export default PaymentSuccessScreen;
