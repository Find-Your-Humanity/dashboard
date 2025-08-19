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
} from '@mui/icons-material';
import { adminService, Plan, PlanCreate, PlanUpdate } from '../services/adminService';

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
  
  // 알림 상태
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // 폼 상태
  const [formData, setFormData] = useState<PlanCreate | PlanUpdate>({
    name: '',
    price: 0,
    request_limit: 0,
    description: '',
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
        price: plan.price,
        request_limit: plan.request_limit,
        description: plan.description || '',
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: 0,
        request_limit: 0,
        description: '',
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  // 요청 제한 포맷팅
  const formatRequestLimit = (limit: number) => {
    if (limit >= 1000000) {
      return `${(limit / 1000000).toFixed(1)}M`;
    } else if (limit >= 1000) {
      return `${(limit / 1000).toFixed(1)}K`;
    }
    return limit.toString();
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
                  <TableCell>가격</TableCell>
                  <TableCell>요청 제한</TableCell>
                  <TableCell>설명</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {plan.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatPrice(plan.price)} 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${formatRequestLimit(plan.request_limit)} 요청/월`} 
                        color="info" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description || '-'}
                      </Typography>
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
              label="요금제명"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="가격 (원)"
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
              value={formData.request_limit}
              onChange={(e) => setFormData({ ...formData, request_limit: Number(e.target.value) })}
              margin="normal"
              required
              helperText="월별 API 요청 가능 횟수"
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
