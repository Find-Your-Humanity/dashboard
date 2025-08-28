import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { apiKeyService, ApiKey, CreateApiKeyRequest } from '../services/apiKeyService';

const ApiKeysScreen: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [showSecretKey, setShowSecretKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{
    api_key: string;
    secret_key: string;
  } | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await apiKeyService.getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      showSnackbar('API 키 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      showSnackbar('API 키 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      const data: CreateApiKeyRequest = {
        name: newKeyName.trim(),
        description: newKeyDescription.trim() || undefined,
      };

      const result = await apiKeyService.createApiKey(data);
      setNewlyCreatedKey({
        api_key: result.api_key,
        secret_key: result.secret_key,
      });
      setOpenDialog(false);
      setNewKeyName('');
      setNewKeyDescription('');
      await loadApiKeys();
      showSnackbar('API 키가 성공적으로 생성되었습니다.', 'success');
    } catch (error) {
      showSnackbar('API 키 생성에 실패했습니다.', 'error');
    }
  };

  const handleToggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      await apiKeyService.toggleApiKey(keyId, isActive);
      await loadApiKeys();
      showSnackbar(
        `API 키가 ${isActive ? '활성화' : '비활성화'}되었습니다.`,
        'success'
      );
    } catch (error) {
      showSnackbar('API 키 상태 변경에 실패했습니다.', 'error');
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!window.confirm('정말로 이 API 키를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiKeyService.deleteApiKey(keyId);
      await loadApiKeys();
      showSnackbar('API 키가 삭제되었습니다.', 'success');
    } catch (error) {
      showSnackbar('API 키 삭제에 실패했습니다.', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar('클립보드에 복사되었습니다.', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatApiKey = (key: string) => {
    return `${key.substring(0, 20)}...`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          API 키 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          새 API 키 생성
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API 키 목록
          </Typography>
          
          {apiKeys.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                생성된 API 키가 없습니다.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ mt: 2 }}
              >
                첫 번째 API 키 생성
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>이름</TableCell>
                    <TableCell>API 키</TableCell>
                    <TableCell>설명</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>사용량</TableCell>
                                         <TableCell>생성일</TableCell>
                     <TableCell>수정일</TableCell>
                     <TableCell>마지막 사용</TableCell>
                     <TableCell>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <code>{formatApiKey(key.key_id)}</code>
                          <Tooltip title="복사">
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(key.key_id)}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {key.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={key.is_active ? '활성' : '비활성'}
                          color={key.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {key.usage_count.toLocaleString()}
                      </TableCell>
                                             <TableCell>
                         {formatDate(key.created_at)}
                       </TableCell>
                       <TableCell>
                         {key.updated_at ? formatDate(key.updated_at) : '-'}
                       </TableCell>
                       <TableCell>
                         {key.last_used_at ? formatDate(key.last_used_at) : '사용 안함'}
                       </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title={key.is_active ? '비활성화' : '활성화'}>
                            <Switch
                              checked={key.is_active}
                              onChange={(e) => handleToggleApiKey(key.key_id, e.target.checked)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="삭제">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteApiKey(key.key_id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* 새 API 키 생성 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 API 키 생성</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="API 키 이름"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            margin="normal"
            required
            placeholder="예: 프로덕션 서버"
          />
          <TextField
            fullWidth
            label="설명 (선택사항)"
            value={newKeyDescription}
            onChange={(e) => setNewKeyDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            placeholder="이 API 키의 용도나 설명을 입력하세요"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleCreateApiKey} variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>

      {/* 새로 생성된 API 키 표시 다이얼로그 */}
      <Dialog 
        open={!!newlyCreatedKey} 
        onClose={() => setNewlyCreatedKey(null)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>API 키 생성 완료</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            이 페이지를 벗어나면 Secret Key를 다시 볼 수 없습니다. 안전한 곳에 저장해주세요.
          </Alert>
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              API Key
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                value={newlyCreatedKey?.api_key || ''}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <Tooltip title="복사">
                <IconButton onClick={() => copyToClipboard(newlyCreatedKey?.api_key || '')}>
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Secret Key
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                type={showSecretKey === newlyCreatedKey?.secret_key ? 'text' : 'password'}
                value={newlyCreatedKey?.secret_key || ''}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <Tooltip title={showSecretKey === newlyCreatedKey?.secret_key ? '숨기기' : '보기'}>
                <IconButton 
                  onClick={() => setShowSecretKey(
                    showSecretKey === newlyCreatedKey?.secret_key ? null : newlyCreatedKey?.secret_key || null
                  )}
                >
                  {showSecretKey === newlyCreatedKey?.secret_key ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="복사">
                <IconButton onClick={() => copyToClipboard(newlyCreatedKey?.secret_key || '')}>
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewlyCreatedKey(null)} variant="contained">
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

export default ApiKeysScreen;
