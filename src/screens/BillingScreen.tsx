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


const BillingScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentPlanData, setCurrentPlanData] = useState<CurrentPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);

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
      const response = await billingService.changePlan(selectedPlan.id);
      if (response.success) {
        setDialogOpen(false);
        setSelectedPlan(null);
        // 성공 메시지 표시
        setError(null);
        // 데이터 새로고침
        await fetchBillingData();
      } else {
        setError(response.error || '요금제 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('요금제 변경 실패:', err);
      setError('요금제 변경에 실패했습니다.');
    } finally {
      setChangingPlan(false);
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
      <Typography variant="body1" color="text.secondary" mb={4}>
        현재 요금제를 확인하고 필요에 따라 변경할 수 있습니다.
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
            <Box display="flex" alignItems="center" mb={2}>
              <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">현재 요금제</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" color="primary" gutterBottom>
                  {currentPlanData.plan.name}
                </Typography>
                <Typography variant="h4" color="text.primary" gutterBottom>
                  ₩{currentPlanData.plan.price.toLocaleString()}/월
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {currentPlanData.plan.description}
                </Typography>
                
                {/* 사용량 표시 */}
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    이번 달 사용량
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="body2">
                      {currentPlanData.current_usage.tokens_used.toLocaleString()} / {currentPlanData.current_usage.tokens_limit.toLocaleString()} 요청
                    </Typography>
                    <Chip 
                      label={`${Math.round(getUsagePercentage())}%`}
                      size="small"
                      color={getUsageColor()}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getUsagePercentage()} 
                    color={getUsageColor()}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  
                  {currentPlanData.current_usage.overage_tokens > 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <WarningIcon />
                      한도를 초과하여 {currentPlanData.current_usage.overage_tokens.toLocaleString()}개의 추가 요청이 발생했습니다.
                    </Alert>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  포함된 기능
                </Typography>
                <List dense>
                  {Array.isArray(currentPlanData.plan.features) ? 
                    currentPlanData.plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    )) : (
                      <ListItem>
                        <ListItemText primary="기본 기능 포함" />
                      </ListItem>
                    )
                  }
                </List>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    요금 정보
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    기본 요금: ₩{currentPlanData.billing_info.base_fee.toLocaleString()}
                  </Typography>
                  {currentPlanData.billing_info.overage_fee > 0 && (
                    <Typography variant="body2" color="warning.main">
                      초과 요금: ₩{currentPlanData.billing_info.overage_fee.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body2" fontWeight="bold">
                    총 요금: ₩{currentPlanData.billing_info.total_amount.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* 사용 가능한 요금제 목록 */}
      <Typography variant="h5" gutterBottom>
        요금제 변경
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        다른 요금제로 변경하려면 아래에서 선택하세요.
      </Typography>

      <Grid container spacing={3}>
        {availablePlans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: currentPlanData?.plan.id === plan.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {plan.is_popular && (
                <Chip
                  label="인기"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1
                  }}
                />
              )}
              
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  {plan.name}
                </Typography>
                
                <Typography variant="h4" color="primary" gutterBottom>
                  ₩{plan.price.toLocaleString()}
                  <Typography component="span" variant="body2" color="text.secondary">
                    /월
                  </Typography>
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {plan.description}
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    월 {plan.request_limit.toLocaleString()} 요청
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    분당 {plan.rate_limit_per_minute} 요청
                  </Typography>
                </Box>
                
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    포함 기능
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    {Array.isArray(plan.features) ? 
                      plan.features.slice(0, 3).map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      )) : (
                        <ListItem>
                          <ListItemText 
                            primary="기본 기능 포함" 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      )
                    }
                    {Array.isArray(plan.features) && plan.features.length > 3 && (
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`+${plan.features.length - 3}개 더보기`}
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: 'text.secondary',
                            fontStyle: 'italic'
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
                
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
    </Box>
  );
};

export default BillingScreen;

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


const BillingScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentPlanData, setCurrentPlanData] = useState<CurrentPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);

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
      const response = await billingService.changePlan(selectedPlan.id);
      if (response.success) {
        setDialogOpen(false);
        setSelectedPlan(null);
        // 성공 메시지 표시
        setError(null);
        // 데이터 새로고침
        await fetchBillingData();
      } else {
        setError(response.error || '요금제 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('요금제 변경 실패:', err);
      setError('요금제 변경에 실패했습니다.');
    } finally {
      setChangingPlan(false);
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
      <Typography variant="body1" color="text.secondary" mb={4}>
        현재 요금제를 확인하고 필요에 따라 변경할 수 있습니다.
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
            <Box display="flex" alignItems="center" mb={2}>
              <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">현재 요금제</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" color="primary" gutterBottom>
                  {currentPlanData.plan.name}
                </Typography>
                <Typography variant="h4" color="text.primary" gutterBottom>
                  ₩{currentPlanData.plan.price.toLocaleString()}/월
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {currentPlanData.plan.description}
                </Typography>
                
                {/* 사용량 표시 */}
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    이번 달 사용량
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="body2">
                      {currentPlanData.current_usage.tokens_used.toLocaleString()} / {currentPlanData.current_usage.tokens_limit.toLocaleString()} 요청
                    </Typography>
                    <Chip 
                      label={`${Math.round(getUsagePercentage())}%`}
                      size="small"
                      color={getUsageColor()}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getUsagePercentage()} 
                    color={getUsageColor()}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  
                  {currentPlanData.current_usage.overage_tokens > 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <WarningIcon />
                      한도를 초과하여 {currentPlanData.current_usage.overage_tokens.toLocaleString()}개의 추가 요청이 발생했습니다.
                    </Alert>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  포함된 기능
                </Typography>
                <List dense>
                  {Array.isArray(currentPlanData.plan.features) ? 
                    currentPlanData.plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    )) : (
                      <ListItem>
                        <ListItemText primary="기본 기능 포함" />
                      </ListItem>
                    )
                  }
                </List>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    요금 정보
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    기본 요금: ₩{currentPlanData.billing_info.base_fee.toLocaleString()}
                  </Typography>
                  {currentPlanData.billing_info.overage_fee > 0 && (
                    <Typography variant="body2" color="warning.main">
                      초과 요금: ₩{currentPlanData.billing_info.overage_fee.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body2" fontWeight="bold">
                    총 요금: ₩{currentPlanData.billing_info.total_amount.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* 사용 가능한 요금제 목록 */}
      <Typography variant="h5" gutterBottom>
        요금제 변경
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        다른 요금제로 변경하려면 아래에서 선택하세요.
      </Typography>

      <Grid container spacing={3}>
        {availablePlans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: currentPlanData?.plan.id === plan.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {plan.is_popular && (
                <Chip
                  label="인기"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1
                  }}
                />
              )}
              
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  {plan.name}
                </Typography>
                
                <Typography variant="h4" color="primary" gutterBottom>
                  ₩{plan.price.toLocaleString()}
                  <Typography component="span" variant="body2" color="text.secondary">
                    /월
                  </Typography>
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {plan.description}
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    월 {plan.request_limit.toLocaleString()} 요청
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    분당 {plan.rate_limit_per_minute} 요청
                  </Typography>
                </Box>
                
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    포함 기능
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    {Array.isArray(plan.features) ? 
                      plan.features.slice(0, 3).map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      )) : (
                        <ListItem>
                          <ListItemText 
                            primary="기본 기능 포함" 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      )
                    }
                    {Array.isArray(plan.features) && plan.features.length > 3 && (
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`+${plan.features.length - 3}개 더보기`}
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: 'text.secondary',
                            fontStyle: 'italic'
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
                
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
    </Box>
  );
};

export default BillingScreen;
