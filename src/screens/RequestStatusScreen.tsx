import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TablePagination
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { adminService, RequestStats, RequestLog, ErrorStats, EndpointUsage } from '../services/adminService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-status-tabpanel-${index}`}
      aria-labelledby={`request-status-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RequestStatusScreen: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 통계 데이터
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStats[]>([]);
  const [endpointUsage, setEndpointUsage] = useState<EndpointUsage[]>([]);
  
  // 요청 로그 데이터
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  // 필터 상태
  const [days, setDays] = useState(7);
  const [filters, setFilters] = useState({
    userId: '',
    statusCode: '',
    path: ''
  });

  // 데이터 로드 함수들
  const loadStats = async () => {
    try {
      const response = await adminService.getRequestStats(days);
      setStats(response.data);
    } catch (err) {
      console.error('통계 로드 실패:', err);
    }
  };

  const loadErrorStats = async () => {
    try {
      const response = await adminService.getErrorStats(days);
      setErrorStats(response.data.error_stats);
    } catch (err) {
      console.error('오류 통계 로드 실패:', err);
    }
  };

  const loadEndpointUsage = async () => {
    try {
      const response = await adminService.getEndpointUsage(days);
      setEndpointUsage(response.data.endpoint_usage);
    } catch (err) {
      console.error('엔드포인트 사용량 로드 실패:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await adminService.getRequestLogs(
        pagination.page,
        pagination.limit,
        days,
        filters.userId ? parseInt(filters.userId) : undefined,
        filters.statusCode ? parseInt(filters.statusCode) : undefined,
        filters.path || undefined
      );
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('로그 로드 실패:', err);
      setError('로그를 불러오는데 실패했습니다.');
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadStats(),
          loadErrorStats(),
          loadEndpointUsage(),
          loadLogs()
        ]);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [days]);

  // 로그 필터 변경 시 재로드
  useEffect(() => {
    if (!loading) {
      loadLogs();
    }
  }, [filters, pagination.page]);

  // 새로고침
  const handleRefresh = () => {
    loadAllData();
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadErrorStats(),
        loadEndpointUsage(),
        loadLogs()
      ]);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상태 코드에 따른 색상
  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'info';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    return 'error';
  };

  // HTTP 메서드에 따른 색상
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'primary';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          요청 상태 관리
        </Typography>
        <Box>
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>조회 기간</InputLabel>
            <Select
              value={days}
              label="조회 기간"
              onChange={(e) => setDays(e.target.value as number)}
            >
              <MenuItem value={1}>1일</MenuItem>
              <MenuItem value={7}>7일</MenuItem>
              <MenuItem value={30}>30일</MenuItem>
              <MenuItem value={90}>90일</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="새로고침">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 통계 카드 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  총 요청
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats?.total_requests.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SpeedIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  평균 응답시간
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats?.avg_response_time || 0}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  활성 사용자
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats?.unique_users || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <KeyIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  API 키
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats?.unique_api_keys || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="요청 로그" />
          <Tab label="오류 통계" />
          <Tab label="엔드포인트 사용량" />
        </Tabs>
      </Box>

      {/* 요청 로그 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <TextField
                size="small"
                label="사용자 ID"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                sx={{ width: 120 }}
              />
            </Grid>
            <Grid item>
              <TextField
                size="small"
                label="상태 코드"
                value={filters.statusCode}
                onChange={(e) => setFilters({ ...filters, statusCode: e.target.value })}
                sx={{ width: 120 }}
              />
            </Grid>
            <Grid item>
              <TextField
                size="small"
                label="경로"
                value={filters.path}
                onChange={(e) => setFilters({ ...filters, path: e.target.value })}
                sx={{ width: 200 }}
              />
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>시간</TableCell>
                <TableCell>사용자</TableCell>
                <TableCell>메서드</TableCell>
                <TableCell>경로</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>응답시간</TableCell>
                <TableCell>API 키</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.request_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.user_email || log.user_username || '익명'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.method}
                      color={getMethodColor(log.method) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                    {log.path}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.status_code}
                      color={getStatusColor(log.status_code) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.response_time}ms</TableCell>
                  <TableCell>
                    {log.api_key ? (
                      <Tooltip title={log.api_key}>
                        <Typography variant="body2" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.api_key.substring(0, 8)}...
                        </Typography>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(e, page) => setPagination({ ...pagination, page })}
            color="primary"
          />
        </Box>
      </TabPanel>

      {/* 오류 통계 탭 */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>상태 코드</TableCell>
                <TableCell>발생 횟수</TableCell>
                <TableCell>비율</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorStats.map((error) => (
                <TableRow key={error.status_code}>
                  <TableCell>
                    <Chip
                      label={error.status_code}
                      color={getStatusColor(error.status_code) as any}
                    />
                  </TableCell>
                  <TableCell>{error.count.toLocaleString()}</TableCell>
                  <TableCell>{error.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 엔드포인트 사용량 탭 */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>엔드포인트</TableCell>
                <TableCell>요청 수</TableCell>
                <TableCell>평균 응답시간</TableCell>
                <TableCell>비율</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {endpointUsage.map((endpoint) => (
                <TableRow key={endpoint.endpoint}>
                  <TableCell sx={{ maxWidth: 400, wordBreak: 'break-all' }}>
                    {endpoint.endpoint}
                  </TableCell>
                  <TableCell>{endpoint.requests.toLocaleString()}</TableCell>
                  <TableCell>{endpoint.avg_response_time}ms</TableCell>
                  <TableCell>{endpoint.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
};

export default RequestStatusScreen;
