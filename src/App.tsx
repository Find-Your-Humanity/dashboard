import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import { TENANT_ROUTES, ADMIN_ROUTES } from './navigation/routes';
import { RequireAuth, RequireAdmin } from './navigation/guards';
// LoginScreen 제거됨 - iframe 환경에서는 별도 로그인 페이지 불필요
import { useAuth } from './contexts/AuthContext';
import './styles/App.css';

// 루트 경로에서 사용자 권한에 따라 리다이렉트
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null; // 로딩 중이면 아무것도 렌더링하지 않음
  }
  
  if (!isAuthenticated) {
    // 별도의 /login 라우트가 없으므로 부모 창에 로그인 요청만 보내고 현재 경로 유지
    if (window.parent && window.parent !== window) {
      // 현재 origin을 기반으로 부모 창에 메시지 전송
      const currentOrigin = window.location.origin;
      window.parent.postMessage({ type: 'NEED_LOGIN' }, currentOrigin);
    }
    return null;
  }
  
  // 관리자면 admin 대시보드로, 아니면 app 대시보드로
  const isAdmin = user?.is_admin === true || user?.is_admin === 1 || user?.role === 'admin';
  const targetPath = isAdmin ? '/admin/dashboard' : '/app/dashboard';
    
  return <Navigate to={targetPath} replace />;
};

const App: React.FC = () => {
  return (
    <Box className="App">
      <Layout>
        <Routes>
          {/* 루트 경로 - 사용자 권한에 따라 리다이렉트 */}
          <Route path="/" element={<RootRedirect />} />
          {TENANT_ROUTES.map(r => (
            <Route key={r.path} path={r.path} element={<RequireAuth>{r.element}</RequireAuth>} />
          ))}
          {/* 운영자(관리) 대시보드 */}
          {ADMIN_ROUTES.map(r => (
            <Route key={r.path} path={r.path} element={<RequireAdmin>{r.element}</RequireAdmin>} />
          ))}
          {/* 존재하지 않는 경로는 루트로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Box>
  );
};

export default App;


