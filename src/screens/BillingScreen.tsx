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
      console.log("🔍 Toss Payments SDK 초기화 시작...");
      
      // 1. 결제위젯 SDK 초기화 (Promise 기반)
      const widget = await loadPaymentWidget(
        'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm', // 클라이언트 키
        'ANONYMOUS' // customerKey (비회원 구매자)
      );
      
      console.log("✅ Toss Payments SDK 초기화 완료:", widget);
      console.log("🔍 widget 객체의 메서드들:", Object.getOwnPropertyNames(widget));
      console.log("🔍 widget.renderPaymentMethods 타입:", typeof widget.renderPaymentMethods);
      
      setPaymentWidget(widget);
      
      // 주문 ID 생성 및 결제 다이얼로그 열기
      const oid = generateOrderId();
      setOrderId(oid);
      setPaymentDialogOpen(true);
      
      // 결제수단 영역 렌더링
      setTimeout(async () => {
        try {
          const methods = await widget.renderPaymentMethods('#toss-payment-methods', { value: selectedPlan.price });
          const agreement = await widget.renderAgreement('#toss-agreement');
          setPaymentMethods(methods);
          setAgreementWidget(agreement);
          console.log("✅ 결제수단 렌더링 완료");
        } catch (e) {
          console.error('결제수단 렌더링 실패:', e);
          setError('결제 위젯 초기화에 실패했습니다.');
        }
      }, 100);
    } catch (err) {
      console.error('결제 위젯 초기화 실패:', err);
      setError('결제 위젯 초기화에 실패했습니다.');
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
        successUrl: `https://realcatcha.com/payment/success?planId=${selectedPlan.id}&amount=${selectedPlan.price}&orderId=${orderId}`,
        failUrl: `https://realcatcha.com/payment/fail?planType=${planType}`,
      };
      
      console.log("🔍 결제 데이터:", paymentData);
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

      {/* 결제 다이얼로그 */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>결제 진행</DialogTitle>
        <DialogContent>
          <Box id="toss-payment-methods" sx={{ minHeight: 200 }} />
          <Box id="toss-agreement" sx={{ mt: 2, minHeight: 100 }} />
          {selectedPlan && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                결제 금액: ₩{selectedPlan.price.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                결제 완료 후 웹사이트에서 승인이 처리되며, 완료되면 대시보드로 돌아가세요.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleRequestPayment}>결제하기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingScreen;
