import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

type GuardProps = { children: React.ReactElement };

export const RequireAuth: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    // 인증 확인 완료 후 인증되지 않은 사용자는 메인 사이트로 리다이렉트
    if (!loading && !isAuthenticated) {
      const isDev = process.env.NODE_ENV === 'development';
      const mainSiteUrl = isDev 
        ? 'http://localhost:3000/signin' 
        : 'https://www.realcatcha.com/signin';
      window.location.href = mainSiteUrl;
    }
  }, [loading, isAuthenticated]);

  // 로딩 중이거나 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (loading || !isAuthenticated) {
    return null;
  }
  
  return children;
};

export const RequireAdmin: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  useEffect(() => {
    // 인증 확인 완료 후 인증되지 않은 사용자는 메인 사이트로 리다이렉트
    if (!loading && !isAuthenticated) {
      const isDev = process.env.NODE_ENV === 'development';
      const mainSiteUrl = isDev 
        ? 'http://localhost:3000/signin' 
        : 'https://www.realcatcha.com/signin';
      window.location.href = mainSiteUrl;
    }
  }, [loading, isAuthenticated]);

  // 로딩 중이거나 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (loading || !isAuthenticated) {
    return null;
  }
  
  // 관리자가 아닌 경우 테넌트 대시보드로 리다이렉트
  if (!(user?.is_admin === true || user?.role === 'admin')) {
    window.location.href = '/app/dashboard';
    return null;
  }
  
  return children;
};


