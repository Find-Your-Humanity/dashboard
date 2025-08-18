import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import Layout from './components/Layout/Layout';
import { TENANT_ROUTES, ADMIN_ROUTES } from './navigation/routes';
import { RequireAuth, RequireAdmin } from './navigation/guards';
import { useAuth } from './contexts/AuthContext';
import './styles/App.css';

const App: React.FC = () => {
  const { loading } = useAuth();

  // 인증 확인 중에는 로딩 화면 표시
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
          gap: 2,
        }}
      >
        <CircularProgress size={48} color="primary" />
        <Typography variant="h6" color="text.secondary">
          Real Captcha Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          로딩 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="App">
      <Layout>
        <Routes>
          {/* 테넌트(고객) 대시보드 */}
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          {TENANT_ROUTES.map(r => (
            <Route key={r.path} path={r.path} element={<RequireAuth>{r.element}</RequireAuth>} />
          ))}
          {/* 운영자(관리) 대시보드 */}
          {ADMIN_ROUTES.map(r => (
            <Route key={r.path} path={r.path} element={<RequireAdmin>{r.element}</RequireAdmin>} />
          ))}
          {/* 모든 기타 경로는 대시보드로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </Layout>
    </Box>
  );
};

export default App;

