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
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { formatDate, maskEmail } from '../utils';
import { adminService, User, UserCreate, UserUpdate } from '../services/adminService';

const UsersScreen: React.FC = () => {
  // 상태 관리
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 모달 상태
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // 알림 상태
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // 폼 상태
  const [formData, setFormData] = useState<UserCreate | UserUpdate>({
    email: '',
    username: '',
    password: '',
    name: '',
    contact: '',
    is_admin: false,
  });

  // 사용자 목록 로드
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page, 20, searchTerm || undefined);
      if (response.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotal(response.data.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm]);

  // 검색 핸들러
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  // 사용자 생성/수정 모달 열기
  const openUserDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        username: user.username,
        name: user.name || '',
        contact: user.contact || '',
        is_admin: user.is_admin,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        username: '',
        password: '',
        name: '',
        contact: '',
        is_admin: false,
      });
    }
    setUserDialogOpen(true);
  };

  // 사용자 저장
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // 수정
        const updateData: UserUpdate = { ...formData };
        delete (updateData as any).password; // 수정 시 비밀번호 제외
        const response = await adminService.updateUser(editingUser.id, updateData);
        if (response.success) {
          showSnackbar('사용자가 수정되었습니다.', 'success');
          loadUsers();
        }
      } else {
        // 생성
        const response = await adminService.createUser(formData as UserCreate);
        if (response.success) {
          showSnackbar('사용자가 생성되었습니다.', 'success');
          loadUsers();
        }
      }
      setUserDialogOpen(false);
    } catch (err: any) {
      showSnackbar(err.response?.data?.detail || '작업 중 오류가 발생했습니다.', 'error');
    }
  };

  // 사용자 삭제 확인
  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  // 사용자 삭제
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await adminService.deleteUser(userToDelete.id);
      if (response.success) {
        showSnackbar('사용자가 비활성화되었습니다.', 'success');
        loadUsers();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.detail || '삭제 중 오류가 발생했습니다.', 'error');
    }
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  // 스낵바 표시
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // 역할 칩 컴포넌트
  const getRoleChip = (isAdmin: boolean) => {
    return isAdmin ? (
      <Chip label="관리자" color="error" size="small" />
    ) : (
      <Chip label="사용자" color="default" size="small" />
    );
  };

  // 상태 칩 컴포넌트
  const getStatusChip = (isActive: boolean) => {
    return isActive ? (
      <Chip label="활성" color="success" size="small" />
    ) : (
      <Chip label="비활성" color="default" size="small" />
    );
  };

  if (loading && users.length === 0) {
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
            사용자 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            전체 {total}명의 사용자
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => openUserDialog()}
        >
          사용자 추가
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* 검색 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="사용자 이름, 이메일 또는 사용자명으로 검색..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* 사용자 테이블 */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>사용자명</TableCell>
                  <TableCell>연락처</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>가입일</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>{maskEmail(user.email)}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.contact || '-'}</TableCell>
                    <TableCell>{getRoleChip(user.is_admin)}</TableCell>
                    <TableCell>{getStatusChip(user.is_active)}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openUserDialog(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => confirmDeleteUser(user)}
                        color="error"
                        disabled={user.is_admin} // 관리자는 삭제 불가
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        title="구독 관리"
                      >
                        <SettingsIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {users.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
              </Typography>
            </Box>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 사용자 추가/수정 모달 */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? '사용자 수정' : '사용자 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="사용자명"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
              required
            />
            {!editingUser && (
              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                value={(formData as UserCreate).password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
              />
            )}
            <TextField
              fullWidth
              label="이름"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="연락처"
              value={formData.contact || ''}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_admin || false}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                />
              }
              label="관리자 권한"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>취소</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {editingUser ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>사용자 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 <strong>{userToDelete?.name || userToDelete?.username}</strong> 사용자를 비활성화하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            비활성화
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

export default UsersScreen;