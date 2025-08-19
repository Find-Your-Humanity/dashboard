import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Pagination,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { adminService, ContactRequest } from '../services/adminService';

const RequestsScreen: React.FC = () => {
  // 상태 관리
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 모달 상태
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  // 알림 상태
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // 문의사항 목록 로드
  const loadContacts = async (statusFilter?: string) => {
    try {
      setLoading(true);
      const status = statusFilter && statusFilter !== 'all' ? statusFilter : undefined;
      const response = await adminService.getContactRequests(page, 20, status);
      
      if (response.success) {
        setContacts(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalCount(response.data.pagination.total);
      } else {
        setError('문의사항을 불러올 수 없습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '문의사항 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts(currentTab);
  }, [page, currentTab]);

  // 탭 변경
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setPage(1);
  };

  // 페이지 변경
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // 상세보기 모달 열기
  const openDetailDialog = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setDetailDialogOpen(true);
  };

  // 답변 모달 열기
  const openResponseDialog = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setAdminResponse(contact.admin_response || '');
    setNewStatus(contact.status);
    setResponseDialogOpen(true);
  };

  // 문의사항 업데이트
  const handleUpdateContact = async () => {
    if (!selectedContact) return;

    try {
      const response = await adminService.updateContactRequest(
        selectedContact.id,
        newStatus,
        adminResponse
      );

      if (response.success) {
        showSnackbar('문의사항이 업데이트되었습니다.', 'success');
        setResponseDialogOpen(false);
        loadContacts(currentTab);
      } else {
        showSnackbar('업데이트에 실패했습니다.', 'error');
      }
    } catch (error) {
      showSnackbar('업데이트 중 오류가 발생했습니다.', 'error');
    }
  };

  // 첨부파일 다운로드
  const handleDownloadAttachment = async (contact: ContactRequest) => {
    try {
      const blob = await adminService.downloadContactAttachment(contact.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = contact.attachment_filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showSnackbar('파일 다운로드에 실패했습니다.', 'error');
    }
  };

  // 스낵바 표시
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // 상태별 칩 스타일
  const getStatusChip = (status: string) => {
    const statusConfig = {
      unread: { label: '읽지 않음', color: 'error' as const },
      in_progress: { label: '처리 중', color: 'warning' as const },
      resolved: { label: '해결됨', color: 'success' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        📧 요청사항 관리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 탭 메뉴 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={`전체 (${totalCount})`} value="all" />
            <Tab label="읽지 않음" value="unread" />
            <Tab label="처리 중" value="in_progress" />
            <Tab label="해결됨" value="resolved" />
          </Tabs>
        </CardContent>
      </Card>

      {/* 문의사항 테이블 */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>연락처</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>처리자</TableCell>
                  <TableCell>접수일</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {contact.subject}
                        </Typography>
                        {contact.attachment_filename && (
                          <Tooltip title={`첨부파일: ${contact.attachment_filename}`}>
                            <AttachFileIcon fontSize="small" color="action" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{contact.contact}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{contact.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(contact.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {contact.admin_username || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(contact.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openDetailDialog(contact)}
                        color="info"
                        title="상세보기"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openResponseDialog(contact)}
                        color="primary"
                        title="답변/상태 변경"
                      >
                        <EditIcon />
                      </IconButton>
                      {contact.attachment_filename && (
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadAttachment(contact)}
                          color="secondary"
                          title="첨부파일 다운로드"
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {contacts.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                문의사항이 없습니다.
              </Typography>
            </Box>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 상세보기 모달 */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📧 문의사항 상세보기
        </DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedContact.subject}
              </Typography>
              
              <Box display="flex" gap={2} mb={2}>
                <Chip icon={<EmailIcon />} label={selectedContact.email} variant="outlined" />
                <Chip icon={<PhoneIcon />} label={selectedContact.contact} variant="outlined" />
                {getStatusChip(selectedContact.status)}
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                접수일: {formatDate(selectedContact.created_at)}
              </Typography>

              {selectedContact.attachment_filename && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  첨부파일: {selectedContact.attachment_filename}
                </Typography>
              )}

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                문의 내용:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedContact.message}
                </Typography>
              </Paper>

              {selectedContact.admin_response && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    관리자 답변:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedContact.admin_response}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      답변자: {selectedContact.admin_username} | {formatDate(selectedContact.updated_at)}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 답변/상태 변경 모달 */}
      <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          ✏️ 문의사항 답변 및 상태 변경
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>상태</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="상태"
              >
                <MenuItem value="unread">읽지 않음</MenuItem>
                <MenuItem value="in_progress">처리 중</MenuItem>
                <MenuItem value="resolved">해결됨</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="관리자 답변"
              multiline
              rows={6}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              margin="normal"
              helperText="고객에게 전달할 답변을 작성하세요."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialogOpen(false)}>취소</Button>
          <Button onClick={handleUpdateContact} variant="contained">
            저장
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

export default RequestsScreen;
