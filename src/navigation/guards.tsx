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
    
    // 인증되지 않은 경우 안내 메시지 표시
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={3}
        sx={{ p: 4, textAlign: 'center' }}
      >
        <Box 
          sx={{ 
            fontSize: 64, 
            color: 'error.main',
            mb: 2 
          }}
        >
          🔒
        </Box>
        <Typography variant="h4" color="error.main" gutterBottom>
          접근할 수 없습니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          이 페이지에 접근하려면 로그인이 필요합니다.
          먼저 로그인을 진행해주세요.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            로그인하기
          </button>
        </Box>
      </Box>
    );
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
    
    // 인증되지 않은 경우 안내 메시지 표시
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={3}
        sx={{ p: 4, textAlign: 'center' }}
      >
        <Box 
          sx={{ 
            fontSize: 64, 
            color: 'error.main',
            mb: 2 
          }}
        >
          🔒
        </Box>
        <Typography variant="h4" color="error.main" gutterBottom>
          접근할 수 없습니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          이 페이지에 접근하려면 로그인이 필요합니다.
          먼저 로그인을 진행해주세요.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            로그인하기
          </button>
        </Box>
      </Box>
    );
  }
  
  if (!(user?.is_admin === true || user?.role === 'admin')) {
    // 관리자 권한이 없는 경우 안내 메시지 표시
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={3}
        sx={{ p: 4, textAlign: 'center' }}
      >
        <Box 
          sx={{ 
            fontSize: 64, 
            color: 'warning.main',
            mb: 2 
          }}
        >
          ⛔
        </Box>
        <Typography variant="h4" color="warning.main" gutterBottom>
          관리자 권한이 필요합니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          이 페이지는 관리자만 접근할 수 있습니다.
          일반 사용자 대시보드로 이동하시겠습니까?
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <button
            onClick={() => window.location.href = '/app/dashboard'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            사용자 대시보드로 이동
          </button>
        </Box>
      </Box>
    );
  }
  return children;
};


