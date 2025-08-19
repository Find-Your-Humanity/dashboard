import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { adminService, Plan, PlanCreate, PlanUpdate, PlanSubscriber, PlanSubscriberStats } from '../services/adminService';

const PlansScreen: React.FC = () => {
  // 상태 관리
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 모달 상태
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  
  // 구독자 상세보기 모달 상태
  const [subscribersDialogOpen, setSubscribersDialogOpen] = useState(false);
  const [selectedPlanSubscribers, setSelectedPlanSubscribers] = useState<PlanSubscriber[]>([]);
  const [selectedPlanStats, setSelectedPlanStats] = useState<PlanSubscriberStats | null>(null);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  
  // 알림 상태
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // 폼 상태
  const [formData, setFormData] = useState<PlanCreate | PlanUpdate>({
    name: '',
    display_name: '',
    price: 0,
    monthly_request_limit: 0,
    concurrent_requests: 1,
    rate_limit_per_minute: 60,
    description: '',
    plan_type: 'paid',
    currency: 'KRW',
    billing_cycle: 'monthly',
    is_active: true,
    is_popular: false,
    sort_order: 0,
  });

  // 요금제 목록 로드
  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '요금제 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // 요금제 생성/수정 모달 열기
  const openPlanDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        display_name: plan.display_name,
        price: plan.price,
        monthly_request_limit: plan.monthly_request_limit,
        concurrent_requests: plan.concurrent_requests,
        rate_limit_per_minute: plan.rate_limit_per_minute,
        description: plan.description || '',
        plan_type: plan.plan_type,
        currency: plan.currency,
        billing_cycle: plan.billing_cycle,
        is_active: plan.is_active,
        is_popular: plan.is_popular,
        sort_order: plan.sort_order,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        display_name: '',
        price: 0,
        monthly_request_limit: 0,
        concurrent_requests: 1,
        rate_limit_per_minute: 60,
        description: '',
        plan_type: 'paid',
        currency: 'KRW',
        billing_cycle: 'monthly',
        is_active: true,
        is_popular: false,
        sort_order: 0,
      });
    }
    setPlanDialogOpen(true);
  };

  // 요금제 저장
  const handleSavePlan = async () => {
    try {
      if (editingPlan) {
        // 수정
        const response = await adminService.updatePlan(editingPlan.id, formData);
        if (response.success) {
          showSnackbar('요금제가 수정되었습니다.', 'success');
          loadPlans();
        }
      } else {
        // 생성
        const response = await adminService.createPlan(formData as PlanCreate);
        if (response.success) {
          showSnackbar('요금제가 생성되었습니다.', 'success');
          loadPlans();
        }
      }
      setPlanDialogOpen(false);
    } catch (err: any) {
      showSnackbar(err.response?.data?.detail || '작업 중 오류가 발생했습니다.', 'error');
    }
  };

  // 요금제 삭제 확인
  const confirmDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteConfirmOpen(true);
  };

  // 구독자 상세보기
  const openSubscribersDialog = async (plan: Plan) => {
    try {
      setSubscribersLoading(true);
      setSubscribersDialogOpen(true);
      
      const response = await adminService.getPlanSubscribers(plan.id);
      if (response.success) {
        setSelectedPlanSubscribers(response.data.subscribers);
        setSelectedPlanStats(response.data.plan_stats);
      } else {
        showSnackbar('구독자 정보를 불러올 수 없습니다.', 'error');
      }
    } catch (error) {
      showSnackbar('구독자 정보 조회 중 오류가 발생했습니다.', 'error');
    } finally {
      setSubscribersLoading(false);
    }
  };

  // 구독자 모달 닫기
  const closeSubscribersDialog = () => {
    setSubscribersDialogOpen(false);
    setSelectedPlanSubscribers([]);
    setSelectedPlanStats(null);
  };

  // 요금제 삭제
  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      const response = await adminService.deletePlan(planToDelete.id);
      if (response.success) {
        showSnackbar('요금제가 삭제되었습니다.', 'success');
        loadPlans();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.detail || '삭제 중 오류가 발생했습니다.', 'error');
    }
    setDeleteConfirmOpen(false);
    setPlanToDelete(null);
  };

  // 스낵바 표시
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // 가격 포맷팅
  const formatPrice = (price: number, currency = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // 요청 제한 포맷팅
  const formatRequestLimit = (limit?: number) => {
    if (!limit) return '무제한';
    if (limit >= 1000000) {
      return `${(limit / 1000000).toFixed(1)}M`;
    } else if (limit >= 1000) {
      return `${(limit / 1000).toFixed(1)}K`;
    }
    return limit.toString();
  };

  // 플랜 타입 칩
  const getPlanTypeChip = (planType: string) => {
    const typeConfig = {
      free: { label: '무료', color: 'success' as const },
      paid: { label: '유료', color: 'primary' as const },
      enterprise: { label: '기업', color: 'warning' as const },
    };
    const config = typeConfig[planType as keyof typeof typeConfig] || { label: planType, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            요금제 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            총 {plans.length}개의 요금제
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openPlanDialog()}
        >
          요금제 추가
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* 요금제 테이블 */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>요금제명</TableCell>
                  <TableCell>타입</TableCell>
                  <TableCell>가격</TableCell>
                  <TableCell>요청 제한</TableCell>
                  <TableCell>구독자</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {plan.display_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.name}
                        </Typography>
                        {plan.is_popular && (
                          <Chip label="인기" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getPlanTypeChip(plan.plan_type)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatPrice(plan.price, plan.currency)} 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${formatRequestLimit(plan.monthly_request_limit)} 요청/월`} 
                        color="info" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {plan.subscriber_count || 0}명
                        </Typography>
                        {plan.subscriber_count && plan.subscriber_count > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => openSubscribersDialog(plan)}
                            color="info"
                            title="구독자 상세보기"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={plan.is_active ? '활성' : '비활성'} 
                        color={plan.is_active ? 'success' : 'default'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openPlanDialog(plan)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => confirmDeletePlan(plan)}
                        color="error"
                        disabled={plan.subscriber_count! > 0}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {plans.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                등록된 요금제가 없습니다.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 요금제 추가/수정 모달 */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPlan ? '요금제 수정' : '요금제 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="요금제 ID"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              helperText="시스템에서 사용할 고유 ID (예: free, pro, enterprise)"
            />
            <TextField
              fullWidth
              label="표시명"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              margin="normal"
              required
              helperText="사용자에게 보여질 이름"
            />
            <TextField
              fullWidth
              label="가격"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="월 요청 제한"
              type="number"
              value={formData.monthly_request_limit || ''}
              onChange={(e) => setFormData({ ...formData, monthly_request_limit: e.target.value ? Number(e.target.value) : undefined })}
              margin="normal"
              helperText="월별 API 요청 가능 횟수 (빈칸 = 무제한)"
            />
            <TextField
              fullWidth
              label="동시 요청 수"
              type="number"
              value={formData.concurrent_requests}
              onChange={(e) => setFormData({ ...formData, concurrent_requests: Number(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="분당 요청 제한"
              type="number"
              value={formData.rate_limit_per_minute}
              onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: Number(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="설명"
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              helperText="요금제에 대한 상세 설명"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialogOpen(false)}>취소</Button>
          <Button onClick={handleSavePlan} variant="contained">
            {editingPlan ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>요금제 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 <strong>{planToDelete?.name}</strong> 요금제를 삭제하시겠습니까?
            현재 이 요금제를 사용하는 사용자가 있다면 삭제할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button onClick={handleDeletePlan} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 구독자 상세보기 모달 */}
      <Dialog 
        open={subscribersDialogOpen} 
        onClose={closeSubscribersDialog} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <PersonIcon />
            <Box>
              <Typography variant="h6">
                {selectedPlanStats?.plan_info.display_name} 구독자 목록
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedPlanStats?.plan_info.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {subscribersLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* 통계 요약 */}
              {selectedPlanStats && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>📊 통계 요약</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip 
                      icon={<PersonIcon />}
                      label={`총 구독자: ${selectedPlanStats.total_subscribers}명`} 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<TrendingUpIcon />}
                      label={`활성 구독자: ${selectedPlanStats.active_subscribers}명`} 
                      color="success" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<AccessTimeIcon />}
                      label={`월간 총 요청: ${selectedPlanStats.total_monthly_requests.toLocaleString()}회`} 
                      color="info" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`오늘 총 요청: ${selectedPlanStats.total_daily_requests.toLocaleString()}회`} 
                      color="warning" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
              )}

              {/* 구독자 목록 테이블 */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>사용자</TableCell>
                      <TableCell>구독 기간</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>사용량</TableCell>
                      <TableCell>마지막 요청</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPlanSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.subscription_id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {subscriber.name || subscriber.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {subscriber.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              시작: {new Date(subscriber.start_date).toLocaleDateString('ko-KR')}
                            </Typography>
                            {subscriber.end_date && (
                              <Typography variant="body2" color="text.secondary">
                                종료: {new Date(subscriber.end_date).toLocaleDateString('ko-KR')}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={
                              subscriber.subscription_status === 'active' ? '활성' :
                              subscriber.subscription_status === 'expired' ? '만료' :
                              subscriber.subscription_status === 'cancelled' ? '취소' : 
                              subscriber.subscription_status
                            }
                            color={
                              subscriber.subscription_status === 'active' ? 'success' :
                              subscriber.subscription_status === 'expired' ? 'error' :
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              월간: {subscriber.monthly_requests_used.toLocaleString()} / {
                                subscriber.monthly_request_limit ? 
                                subscriber.monthly_request_limit.toLocaleString() : 
                                '무제한'
                              }
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              오늘: {subscriber.daily_requests_used.toLocaleString()}회
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {subscriber.last_request_time ? 
                              new Date(subscriber.last_request_time).toLocaleString('ko-KR') : 
                              '요청 없음'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedPlanSubscribers.length === 0 && !subscribersLoading && (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    이 요금제의 구독자가 없습니다.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSubscribersDialog}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlansScreen;
