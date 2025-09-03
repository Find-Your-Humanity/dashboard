import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  Check as CheckIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { billingService, Plan, CurrentPlan } from '../services/billingService';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';

const BillingScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentPlanData, setCurrentPlanData] = useState<CurrentPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [agreementWidget, setAgreementWidget] = useState<any>(null);
  
  // 간단한 주문 ID 생성기 (대시보드 결제 테스트용)
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const userId = user?.id ?? 'anonymous';
    return `DASH_${timestamp}_${random}_${userId}`;
  };

  useEffect(() => {
    fetchBillingData();
    
    // Toss Payments에서 postMessage 수신 리스너 추가
    const handleMessage = (event: MessageEvent) => {
      // Toss Payments 도메인에서 온 메시지만 처리
      if (event.origin !== 'https://payment-gateway-sandbox.tosspayments.com' && 
          event.origin !== 'https://payment-gateway.tosspayments.com') {
        return;
      }
      
      console.log("🔍 Toss Payments에서 메시지 수신:", event.data);
      
      // 결제 성공 메시지 처리
      if (event.data && event.data.type === 'PAYMENT_SUCCESS') {
        const { planId, amount, orderId, paymentType, paymentKey } = event.data.data;
        console.log("✅ 결제 성공 메시지 수신:", { planId, amount, orderId, paymentType, paymentKey });
        
        // 결제 성공 페이지로 리다이렉트
        window.location.href = `https://dashboard.realcatcha.com/payment/success?planId=${planId}&amount=${amount}&orderId=${orderId}&paymentType=${paymentType}&paymentKey=${paymentKey}`;
      }
      
      // 결제 실패 메시지 처리
      if (event.data && event.data.type === 'PAYMENT_FAIL') {
        const { planId, amount, orderId, errorCode, errorMessage } = event.data.data;
        console.log("❌ 결제 실패 메시지 수신:", { planId, amount, orderId, errorCode, errorMessage });
        
        // 결제 실패 페이지로 리다이렉트
        window.location.href = `https://dashboard.realcatcha.com/payment/fail?planId=${planId}&amount=${amount}&orderId=${orderId}&errorCode=${errorCode}&errorMessage=${encodeURIComponent(errorMessage)}`;
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 현재 요금제 정보 가져오기
      const currentPlanResponse = await billingService.getCurrentPlan();
      if (currentPlanResponse.success) {
        setCurrentPlanData(currentPlanResponse.data);
      } else {
        setError(currentPlanResponse.error || '현재 요금제 정보를 불러오는데 실패했습니다.');
      }

      // 사용 가능한 요금제 목록 가져오기
      const plansResponse = await billingService.getAvailablePlans();
      if (plansResponse.success) {
        setAvailablePlans(plansResponse.data);
      } else {
        setError(plansResponse.error || '요금제 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('요금제 정보 조회 실패:', err);
      setError('요금제 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (plan: Plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;

    try {
      setChangingPlan(true);
      console.log("🔍 웹사이트 결제 페이지로 이동 시작...");
      
      // 웹사이트 결제 페이지로 이동 (결제 정보와 함께)
      const planType = selectedPlan.name?.toLowerCase() || 'basic';
      const planId = selectedPlan.id;
      const amount = selectedPlan.price;
      
      // 웹사이트 결제 페이지 URL 생성
      const websitePaymentUrl = `https://realcatcha.com/payment/checkout?planType=${planType}&planId=${planId}&amount=${amount}&from=dashboard`;
      
      console.log("🔍 웹사이트 결제 페이지 URL:", websitePaymentUrl);
      
      // 새 창에서 웹사이트 결제 페이지 열기
      window.open(websitePaymentUrl, '_blank');
      
      // 결제 다이얼로그 닫기
      setDialogOpen(false);
      
      console.log("✅ 웹사이트 결제 페이지로 이동 완료");
      
    } catch (err) {
      console.error('웹사이트 이동 실패:', err);
      setError('결제 페이지로 이동하는데 실패했습니다.');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!selectedPlan || !orderId || !paymentWidget) {
      console.error('❌ 결제 요청 실패: 필수 정보 누락', { selectedPlan, orderId, paymentWidget });
      setError('결제 정보가 올바르지 않습니다.');
      return;
    }
    
    try {
      console.log("🔍 결제 요청 시작:", { selectedPlan, orderId, paymentWidget });
      
      const planType = (selectedPlan.name || '').toLowerCase();
      const paymentData = {
        orderId,
        orderName: `${selectedPlan.name} 구독`,
        amount: selectedPlan.price,
        successUrl: `${window.location.origin}/payment/success?planType=${selectedPlan.name?.toLowerCase()}&planId=${selectedPlan.id}`,
        failUrl: `${window.location.origin}/payment/fail?planType=${selectedPlan.name?.toLowerCase()}&planId=${selectedPlan.id}`,
        windowTarget: 'popup', // 새 창으로 결제창 열기 (iframe 대신)
        customerEmail: user?.email || 'test@example.com',
        customerName: user?.name || '테스트 사용자',
        flowMode: 'DEFAULT' // 명시적으로 기본 흐름 모드 설정
      };
      
      console.log("🔍 결제 데이터:", paymentData);
      console.log("🔍 successUrl:", paymentData.successUrl);
      console.log("🔍 failUrl:", paymentData.failUrl);
      console.log("🔍 paymentWidget.requestPayment 타입:", typeof paymentWidget.requestPayment);
      
      // 결제 요청 실행
      await paymentWidget.requestPayment(paymentData);
      console.log("✅ 결제 요청 성공");
      
    } catch (e) {
      console.error('❌ 결제 요청 실패:', e);
      setError(`결제 요청에 실패했습니다: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const getUsagePercentage = () => {
    if (!currentPlanData) return 0;
    const { tokens_used, tokens_limit } = currentPlanData.current_usage;
    return Math.min((tokens_used / tokens_limit) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        요금제 관리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 현재 요금제 정보 */}
      {currentPlanData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              현재 요금제: {currentPlanData.plan.name}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  월 요금
                </Typography>
                <Typography variant="h6">
                  ₩{currentPlanData.plan.price.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  사용량
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress
                    variant="determinate"
                    value={getUsagePercentage()}
                    color={getUsageColor()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="body2">
                    {Math.round(getUsagePercentage())}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {currentPlanData.current_usage.tokens_used.toLocaleString()} / {currentPlanData.current_usage.tokens_limit.toLocaleString()} 요청
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              다음 결제일: 정보 없음
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 사용 가능한 요금제 목록 */}
      <Typography variant="h5" gutterBottom>
        요금제 변경
      </Typography>

      <Grid container spacing={3}>
        {availablePlans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {plan.name}
                </Typography>
                
                <Typography variant="h4" color="primary" gutterBottom>
                  ₩{plan.price.toLocaleString()}
                  <Typography component="span" variant="body2" color="text.secondary">
                    /월
                  </Typography>
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${plan.request_limit.toLocaleString()} 요청/월`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${plan.rate_limit_per_minute} 요청/분`}
                    />
                  </ListItem>
                  {Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
                
                <Box mt="auto" pt={2}>
                  {currentPlanData?.plan.id === plan.id ? (
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled
                    >
                      현재 요금제
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handlePlanChange(plan)}
                    >
                      요금제 변경
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 요금제 변경 확인 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          요금제 변경 확인
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="body1" paragraph>
                <strong>{selectedPlan.name}</strong> 요금제로 변경하시겠습니까?
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                변경 사항:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PaymentIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`월 요금: ₩${selectedPlan.price.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`요청 한도: ${selectedPlan.request_limit.toLocaleString()} 요청/월`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`속도 제한: ${selectedPlan.rate_limit_per_minute} 요청/분`}
                  />
                </ListItem>
              </List>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                요금제 변경은 즉시 적용되며, 다음 결제일에 새로운 요금이 청구됩니다.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={changingPlan}>
            취소
          </Button>
          <Button 
            onClick={handleConfirmPlanChange} 
            variant="contained"
            disabled={changingPlan}
          >
            {changingPlan ? <CircularProgress size={20} /> : '변경 확인'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 웹사이트 결제 안내 다이얼로그 */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>웹사이트에서 결제 진행</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="body1" paragraph>
                <strong>{selectedPlan.name}</strong> 요금제로 결제를 진행합니다.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                결제 금액: ₩{selectedPlan.price.toLocaleString()}
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                웹사이트 결제 페이지가 새 창에서 열립니다.
                결제 완료 후 자동으로 대시보드로 돌아갑니다.
              </Alert>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                새 창이 열리지 않았다면 팝업 차단을 해제해주세요.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>취소</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // 웹사이트 결제 페이지 다시 열기
              const planType = selectedPlan?.name?.toLowerCase() || 'basic';
              const planId = selectedPlan?.id;
              const amount = selectedPlan?.price;
              const websitePaymentUrl = `https://realcatcha.com/payment/checkout?planType=${planType}&planId=${planId}&amount=${amount}&from=dashboard`;
              window.open(websitePaymentUrl, '_blank');
            }}
          >
            웹사이트에서 결제하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingScreen;
