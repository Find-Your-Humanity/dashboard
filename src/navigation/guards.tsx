import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

type GuardProps = { children: React.ReactElement };

export const RequireAuth: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary">
          인증 확인 중...
        </Typography>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    // 이미 로그인 페이지면 리다이렉트하지 않음 (무한 루프 방지)
    if (location.pathname === '/login') {
      return children;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export const RequireAdmin: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary">
          관리자 권한 확인 중...
        </Typography>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    // 이미 로그인 페이지면 리다이렉트하지 않음 (무한 루프 방지)
    if (location.pathname === '/login') {
      return children;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!(user?.is_admin === true || user?.role === 'admin')) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
};


