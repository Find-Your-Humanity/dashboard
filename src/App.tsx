import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import { TENANT_ROUTES, ADMIN_ROUTES } from './navigation/routes';
import { RequireAuth, RequireAdmin } from './navigation/guards';
import LoginScreen from './screens/LoginScreen';
import './styles/App.css';

const App: React.FC = () => {
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
          {/* 로그인 */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </Layout>
    </Box>
  );
};

export default App;


