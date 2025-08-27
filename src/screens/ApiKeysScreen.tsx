import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale/ko';
import { apiService } from '../services/apiService';

interface APIKey {
  id: number;
  key_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  allowed_origins?: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
}

interface APIKeyCreate {
  name: string;
  description?: string;
  expires_at?: Date;
  allowed_origins?: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
}

interface APIKeyCreateResponse {
  api_key: string;
  key_info: APIKey;
}

const ApiKeysScreen: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState<APIKeyCreate>({
    name: '',
    description: '',
    rate_limit_per_minute: 100,
    rate_limit_per_day: 10000
  });

  // API 키 목록 조회
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/keys');
      setApiKeys(response.data);
    } catch (error) {
      console.error('API 키 조회 실패:', error);
      setSnackbar({
        open: true,
        message: 'API 키 목록을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // API 키 생성
  const handleCreateApiKey = async () => {
    try {
      const response = await apiService.post<APIKeyCreateResponse>('/api/keys', formData);
      
      setSnackbar({
        open: true,
        message: 'API 키가 성공적으로 생성되었습니다.',
        severity: 'success'
      });
      
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        rate_limit_per_minute: 100,
        rate_limit_per_day: 10000
      });
      
      // 생성된 API 키를 보여주는 다이얼로그
      setShowApiKey(response.data.api_key);
      
      fetchApiKeys();
    } catch (error) {
      console.error('API 키 생성 실패:', error);
      setSnackbar({
        open: true,
        message: 'API 키 생성에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  // API 키 수정
  const handleUpdateApiKey = async () => {
    if (!selectedKey) return;
    
    try {
      await apiService.put(`/api/keys/${selectedKey.key_id}`, formData);
      
      setSnackbar({
        open: true,
        message: 'API 키가 성공적으로 수정되었습니다.',
        severity: 'success'
      });
      
      setOpenEditDialog(false);
      setSelectedKey(null);
      fetchApiKeys();
    } catch (error) {
      console.error('API 키 수정 실패:', error);
      setSnackbar({
        open: true,
        message: 'API 키 수정에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  // API 키 삭제
  const handleDeleteApiKey = async (keyId: string) => {
    if (!window.confirm('정말로 이 API 키를 삭제하시겠습니까?')) return;
    
    try {
      await apiService.delete(`/api/keys/${keyId}`);
      
      setSnackbar({
        open: true,
        message: 'API 키가 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
      
      fetchApiKeys();
    } catch (error) {
      console.error('API 키 삭제 실패:', error);
      setSnackbar({
        open: true,
        message: 'API 키 삭제에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  // API 키 재생성
  const handleRegenerateApiKey = async (keyId: string) => {
    if (!window.confirm('기존 API 키가 무효화되고 새로운 키가 발급됩니다. 계속하시겠습니까?')) return;
    
    try {
      const response = await apiService.post<APIKeyCreateResponse>(`/api/keys/${keyId}/regenerate`);
      
      setSnackbar({
        open: true,
        message: 'API 키가 성공적으로 재생성되었습니다.',
        severity: 'success'
      });
      
      // 재생성된 API 키를 보여주는 다이얼로그
      setShowApiKey(response.data.api_key);
      
      fetchApiKeys();
    } catch (error) {
      console.error('API 키 재생성 실패:', error);
      setSnackbar({
        open: true,
        message: 'API 키 재생성에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  // API 키 복사
  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    setSnackbar({
      open: true,
      message: 'API 키가 클립보드에 복사되었습니다.',
      severity: 'success'
    });
  };

  // 편집 다이얼로그 열기
  const handleEditClick = (apiKey: APIKey) => {
    setSelectedKey(apiKey);
    setFormData({
      name: apiKey.name,
      description: apiKey.description || '',
      expires_at: apiKey.expires_at ? new Date(apiKey.expires_at) : undefined,
      allowed_origins: apiKey.allowed_origins || [],
      rate_limit_per_minute: apiKey.rate_limit_per_minute,
      rate_limit_per_day: apiKey.rate_limit_per_day
    });
    setOpenEditDialog(true);
  };

  // 상태 토글
  const handleToggleStatus = async (apiKey: APIKey) => {
    try {
      await apiService.put(`/api/keys/${apiKey.key_id}`, {
        is_active: !apiKey.is_active
      });
      
      setSnackbar({
        open: true,
        message: `API 키가 ${!apiKey.is_active ? '활성화' : '비활성화'}되었습니다.`,
        severity: 'success'
      });
      
      fetchApiKeys();
    } catch (error) {
      console.error('API 키 상태 변경 실패:', error);
      setSnackbar({
        open: true,
        message: 'API 키 상태 변경에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            API 키 관리
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            새 API 키 생성
          </Button>
        </Box>

        {/* API 키 목록 */}
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>이름</TableCell>
                    <TableCell>키 ID</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>사용 횟수</TableCell>
                    <TableCell>마지막 사용</TableCell>
                    <TableCell>생성일</TableCell>
                    <TableCell>만료일</TableCell>
                    <TableCell>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{apiKey.name}</Typography>
                        {apiKey.description && (
                          <Typography variant="caption" color="textSecondary">
                            {apiKey.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {apiKey.key_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={apiKey.is_active ? '활성' : '비활성'}
                          color={apiKey.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{apiKey.usage_count.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(apiKey.last_used_at)}</TableCell>
                      <TableCell>{formatDate(apiKey.created_at)}</TableCell>
                      <TableCell>{formatDate(apiKey.expires_at)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="상태 변경">
                            <Switch
                              checked={apiKey.is_active}
                              onChange={() => handleToggleStatus(apiKey)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="편집">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(apiKey)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="재생성">
                            <IconButton
                              size="small"
                              onClick={() => handleRegenerateApiKey(apiKey.key_id)}
                            >
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="삭제">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteApiKey(apiKey.key_id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* API 키 생성 다이얼로그 */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>새 API 키 생성</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API 키 이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="설명 (선택사항)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="분당 요청 제한"
                  type="number"
                  value={formData.rate_limit_per_minute}
                  onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="일일 요청 제한"
                  type="number"
                  value={formData.rate_limit_per_day}
                  onChange={(e) => setFormData({ ...formData, rate_limit_per_day: parseInt(e.target.value) })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>취소</Button>
            <Button onClick={handleCreateApiKey} variant="contained" disabled={!formData.name}>
              생성
            </Button>
          </DialogActions>
        </Dialog>

        {/* API 키 편집 다이얼로그 */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>API 키 편집</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API 키 이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="설명 (선택사항)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="분당 요청 제한"
                  type="number"
                  value={formData.rate_limit_per_minute}
                  onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="일일 요청 제한"
                  type="number"
                  value={formData.rate_limit_per_day}
                  onChange={(e) => setFormData({ ...formData, rate_limit_per_day: parseInt(e.target.value) })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>취소</Button>
            <Button onClick={handleUpdateApiKey} variant="contained" disabled={!formData.name}>
              수정
            </Button>
          </DialogActions>
        </Dialog>

        {/* API 키 표시 다이얼로그 */}
        <Dialog open={!!showApiKey} onClose={() => setShowApiKey(null)} maxWidth="md" fullWidth>
          <DialogTitle>API 키 생성 완료</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              이 API 키는 한 번만 표시됩니다. 안전한 곳에 저장해주세요.
            </Alert>
            <TextField
              fullWidth
              label="API 키"
              value={showApiKey || ''}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => handleCopyApiKey(showApiKey || '')}>
                    <CopyIcon />
                  </IconButton>
                )
              }}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowApiKey(null)} variant="contained">
              확인
            </Button>
          </DialogActions>
        </Dialog>

        {/* 스낵바 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ApiKeysScreen;
