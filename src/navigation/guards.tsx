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
    // 인증되지 않은 경우 안내 메시지 표시 (iframe 환경 고려)
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
          로그인이 필요합니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          대시보드에 접근하려면 먼저 메인 웹사이트에서 로그인해주세요.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <button
            onClick={() => {
              const parentOrigin = window.parent?.location?.origin || 'https://realcatcha.com';
              window.parent?.postMessage({ type: 'NEED_LOGIN' }, parentOrigin);
            }}
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
            메인 사이트에서 로그인
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
    // 인증되지 않은 경우 안내 메시지 표시 (iframe 환경 고려)
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
          로그인이 필요합니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          대시보드에 접근하려면 먼저 메인 웹사이트에서 로그인해주세요.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <button
            onClick={() => {
              const parentOrigin = window.parent?.location?.origin || 'https://realcatcha.com';
              window.parent?.postMessage({ type: 'NEED_LOGIN' }, parentOrigin);
            }}
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
            메인 사이트에서 로그인
          </button>
        </Box>
      </Box>
    );
  }
  
  const isAdmin = user?.is_admin === true || user?.is_admin === 1 || user?.role === 'admin';
  if (!isAdmin) {
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


