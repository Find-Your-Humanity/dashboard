import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  BarChart,
  CheckCircle,
  Close,
  MonetizationOn,
  Speed,
  Support
} from '@mui/icons-material';
import { billingService } from '../services/billingService';

interface Plan {
  id: number;
  name: string;
  price: number;
  request_limit: number;
  description: string;
  features: Record<string, any>;
  rate_limit_per_minute: number;
  is_popular: boolean;
  sort_order: number;
}

interface CurrentPlan {
  plan: Plan;
  current_usage: {
    tokens_used: number;
    api_calls: number;
    overage_tokens: number;
    overage_cost: number;
    tokens_limit: number;
    average_tokens_per_call: number;
  };
  billing_info: {
    base_fee: number;
    overage_fee: number;
    total_amount: number;
    start_date: string | null;
    end_date: string | null;
  };
  pending_changes?: {
    plan_id: number;
    plan_name: string;
    effective_date: string;
  };
}

interface UsageStats {
  current_month: {
    tokens_used: number;
    api_calls: number;
    overage_cost: number;
  };
  last_month: {
    tokens_used: number;
    api_calls: number;
    overage_cost: number;
  };
}

const BillingScreen: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePlanDialog, setChangePlanDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [currentPlanData, plansData, statsData] = await Promise.all([
        billingService.getCurrentPlan(),
        billingService.getAvailablePlans(),
        billingService.getUsageStats()
      ]);
      
      setCurrentPlan(currentPlanData);
      setAvailablePlans(plansData);
      setUsageStats(statsData);
    } catch (err) {
      setError('요금제 정보를 불러오는데 실패했습니다.');
      console.error('Billing data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) return;
    
    try {
      setChangingPlan(true);
      await billingService.changePlan(selectedPlanId);
      setChangePlanDialog(false);
      setSelectedPlanId(null);
      await loadBillingData(); // 데이터 새로고침
    } catch (err) {
      setError('요금제 변경에 실패했습니다.');
      console.error('Plan change error:', err);
    } finally {
      setChangingPlan(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getUsagePercentage = () => {
    if (!currentPlan) return 0;
    return (currentPlan.current_usage.tokens_used / currentPlan.current_usage.tokens_limit) * 100;
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'analytics':
        return <BarChart fontSize="small" />;
      case 'api_access':
        return <Speed fontSize="small" />;
      case 'email_support':
        return <Support fontSize="small" />;
      case 'custom_ui':
        return <MonetizationOn fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentPlan) {
    return (
      <Box p={3}>
        <Alert severity="warning">요금제 정보를 불러올 수 없습니다.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* 페이지 헤더 */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          요금
        </Typography>
        <Typography variant="body1" color="text.secondary">
          요금제 및 청구 내역을 관리하세요
        </Typography>
      </Box>

      {/* 현재 요금제 섹션 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" gutterBottom>
              현재 요금제
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setChangePlanDialog(true)}
            >
              요금제 변경
            </Button>
          </Box>
          
          {/* 변경 예정일 표시 */}
          {currentPlan.pending_changes && (
            <Box mb={2} p={2} bgcolor="info.50" borderRadius={1} border="1px solid" borderColor="info.200">
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                📅 요금제 변경 예정
              </Typography>
              <Typography variant="body2">
                {currentPlan.pending_changes.plan_name} 요금제로 {new Date(currentPlan.pending_changes.effective_date).toLocaleDateString('ko-KR')}부터 변경됩니다.
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box mb={2}>
                <Typography variant="h5" gutterBottom>
                  {currentPlan.plan.name}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(currentPlan.plan.price)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  월 {formatNumber(currentPlan.plan.request_limit)} 토큰 무료제공 
                  {currentPlan.plan.price > 0 && ' 초과사용시 1,000 토큰당 ₩2.0'}
                </Typography>
              </Box>

              {/* 사용량 진행률 */}
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    토큰: {formatNumber(currentPlan.current_usage.tokens_used)}/{formatNumber(currentPlan.current_usage.tokens_limit)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getUsagePercentage().toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(getUsagePercentage(), 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Box mt={1}>
                  <Typography variant="body2" color="text.secondary">
                    평균 {currentPlan.current_usage.average_tokens_per_call.toFixed(0)} 토큰/회
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    API 호출: {formatNumber(currentPlan.current_usage.api_calls)}회
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                포함 기능
              </Typography>
              <Box>
                {Object.entries(currentPlan.plan.features).map(([key, value]) => (
                  <Box key={key} display="flex" alignItems="center" mb={1}>
                    <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {key === 'analytics' && value === 'basic' && '기본 API & 통계'}
                      {key === 'analytics' && value === 'standard' && '기본 API & 통계'}
                      {key === 'analytics' && value === 'advanced' && '고급 분석 리포트'}
                      {key === 'ads' && value === false && '광고 제거'}
                      {key === 'email_support' && value === true && '이메일 지원'}
                      {key === 'custom_ui' && value === true && '커스텀 UI 스킨 지원'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 청구 내역 섹션 */}
      <Typography variant="h6" gutterBottom>
        요금 청구 내역
      </Typography>
      
      <Grid container spacing={3}>
        {/* 실시간 사용량 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <TrendingUp sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6">실시간 사용량</Typography>
                  <Typography variant="body2" color="text.secondary">
                    이번 달 현재
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">기본 요금</Typography>
                  <Typography variant="body2">{formatCurrency(currentPlan.billing_info.base_fee)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">초과 사용량</Typography>
                  <Typography variant="body2">{formatCurrency(currentPlan.billing_info.overage_fee)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle2">총 금액</Typography>
                  <Typography variant="subtitle2" color="primary">
                    {formatCurrency(currentPlan.billing_info.total_amount)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 지난달 사용량 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <BarChart sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6">지난달 사용량</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {usageStats ? new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) : '로딩 중...'}
                  </Typography>
                </Box>
              </Box>
              
              {usageStats && (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">토큰 사용량</Typography>
                    <Typography variant="body2">{formatNumber(usageStats.last_month.tokens_used)} 토큰</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">API 호출 횟수</Typography>
                    <Typography variant="body2">{formatNumber(usageStats.last_month.api_calls)}회</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">기본 요금</Typography>
                    <Typography variant="body2">{formatCurrency(currentPlan.billing_info.base_fee)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">초과 요금</Typography>
                    <Typography variant="body2">{formatCurrency(usageStats.last_month.overage_cost)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2">총 청구액</Typography>
                    <Typography variant="subtitle2" color="primary">
                      {formatCurrency(currentPlan.billing_info.base_fee + usageStats.last_month.overage_cost)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 요금제 변경 다이얼로그 */}
      <Dialog 
        open={changePlanDialog} 
        onClose={() => setChangePlanDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            요금제 변경
            <IconButton onClick={() => setChangePlanDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            새로운 요금제를 선택하세요. 변경은 다음 청구 주기부터 적용됩니다.
          </Typography>
          
          <Grid container spacing={2}>
            {availablePlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPlanId === plan.id ? 2 : 1,
                    borderColor: selectedPlanId === plan.id ? 'primary.main' : 'divider',
                    bgcolor: selectedPlanId === plan.id ? 'primary.50' : 'background.paper'
                  }}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <CardContent>
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h6" gutterBottom>
                        {plan.name}
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {formatCurrency(plan.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /월
                      </Typography>
                    </Box>
                    
                    <Box>
                      {Object.entries(plan.features).map(([key, value]) => (
                        <Box key={key} display="flex" alignItems="center" mb={1}>
                          <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {key === 'analytics' && value === 'basic' && '월 100 토큰 무료제공'}
                            {key === 'analytics' && value === 'standard' && '월 50,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0'}
                            {key === 'analytics' && value === 'advanced' && '월 200,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0'}
                            {key === 'analytics' && value === 'basic' && '기본 API 통계'}
                            {key === 'analytics' && value === 'standard' && '기본 API & 통계'}
                            {key === 'analytics' && value === 'advanced' && 'Starter의 모든 혜택'}
                            {key === 'ads' && value === true && '광고 포함'}
                            {key === 'ads' && value === false && '광고 제거'}
                            {key === 'email_support' && value === true && '이메일 지원'}
                            {key === 'custom_ui' && value === true && '커스텀 UI 스킨 지원'}
                            {key === 'advanced_reports' && value === true && '고급 분석 리포트'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    
                    {plan.is_popular && (
                      <Chip 
                        label="인기" 
                        color="primary" 
                        size="small" 
                        sx={{ mt: 2 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePlanDialog(false)}>
            취소
          </Button>
          <Button 
            variant="contained" 
            onClick={handleChangePlan}
            disabled={!selectedPlanId || changingPlan}
          >
            {changingPlan ? <CircularProgress size={20} /> : '요금제 변경'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingScreen;
