import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Check as CheckIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { billingService, Plan, CurrentPlan } from '../services/billingService';


const BillingScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentPlanData, setCurrentPlanData] = useState<CurrentPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  


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
    // 바로 웹사이트 결제 페이지로 이동
    const planType = plan.name?.toLowerCase() || 'basic';
    
    // 웹사이트 결제 페이지 URL 생성 (planType만 전달, 웹사이트에서 내부적으로 가격과 ID 매핑)
    const websitePaymentUrl = `https://realcatcha.com/pay?planType=${planType}&from=dashboard`;
    
    console.log("🔍 웹사이트 결제 페이지로 이동:", websitePaymentUrl);
    
    // 새 창에서 웹사이트 결제 페이지 열기
    window.open(websitePaymentUrl, '_blank');
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




    </Box>
  );
};

export default BillingScreen;
