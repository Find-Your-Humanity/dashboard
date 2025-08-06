import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 인증 상태 확인
    const token = localStorage.getItem('captcha_dashboard_token');
    const userData = localStorage.getItem('captcha_dashboard_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error);
        localStorage.removeItem('captcha_dashboard_token');
        localStorage.removeItem('captcha_dashboard_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // 임시 로그인 로직 (실제 API 연동 시 수정)
      const mockUser = {
        id: '1',
        email: credentials.email,
        name: '관리자',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      localStorage.setItem('captcha_dashboard_token', mockToken);
      localStorage.setItem('captcha_dashboard_user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('로그인 실패:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('captcha_dashboard_token');
    localStorage.removeItem('captcha_dashboard_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 