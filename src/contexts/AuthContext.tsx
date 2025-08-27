import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials } from '../types';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../config/constants';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_SUCCESS'; payload: { user: User; token: string } };

const initialState: AuthState & { loading: boolean } = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // 초기에는 로딩 상태로 설정
};

function authReducer(state: AuthState & { loading: boolean }, action: AuthAction) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // 애플리케이션 시작 시 인증 상태 확인 (로컬 스토리지 + 쿠키)
    const initAuth = async () => {
      console.log('🔍 인증 초기화 시작');
      dispatch({ type: 'LOGIN_START' });
      
      // 1. 로컬 스토리지 확인
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      console.log('📦 로컬 스토리지 데이터:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        userData: userData ? JSON.parse(userData) : null 
      });
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          console.log('✅ 로컬 데이터로 즉시 로그인 상태 설정:', user);
          // 로컬 데이터가 있으면 즉시 로그인 상태로 설정
          dispatch({ type: 'REFRESH_SUCCESS', payload: { user, token } });
          
          // 백그라운드에서 서버 검증
          setTimeout(async () => {
            console.log('🔄 서버 검증 시작');
            try {
              const response = await authService.getCurrentUser();
              console.log('📡 서버 응답:', response);
              if (response.success && response.data && response.data.user) {
                // 서버 데이터로 업데이트
                const serverUser = response.data.user;
                const serverToken = response.data.access_token || token;
                
                console.log('✅ 서버 검증 성공, 데이터 업데이트:', serverUser);
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, serverToken);
                localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(serverUser));
                
                dispatch({ type: 'REFRESH_SUCCESS', payload: { user: serverUser, token: serverToken } });
              } else {
                // 서버 검증 실패 시 로컬 데이터 정리
                console.log('❌ 서버 검증 실패, 로컬 데이터 정리');
                localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                dispatch({ type: 'LOGOUT' });
              }
            } catch (error) {
              console.warn('⚠️ 서버 검증 중 오류:', error);
              // 네트워크 오류 시에도 로컬 데이터 정리
              if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                if (axiosError.response?.status === 401) {
                  console.log('❌ 401 오류로 로컬 데이터 정리');
                  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                  dispatch({ type: 'LOGOUT' });
                }
              }
            }
          }, 1000);
          
          return;
        } catch (error) {
          console.log('❌ 로컬 데이터 파싱 실패, 정리');
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      }
      
      // 2. 쿠키 기반 자동 로그인 시도
      console.log('🍪 쿠키 기반 자동 로그인 시도');
      try {
        const response = await authService.getCurrentUser();
        console.log('📡 쿠키 기반 인증 응답:', response);
        if (response.success && response.data && response.data.user) {
          const user = response.data.user;
          const token = response.data.access_token || '';
          
          console.log('✅ 쿠키 기반 인증 성공:', user);
          // 로컬 스토리지에도 저장
          if (token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          }
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
          
          dispatch({ type: 'REFRESH_SUCCESS', payload: { user, token } });
          return;
        }
      } catch (error) {
        console.warn('❌ 쿠키 기반 자동 로그인 실패:', error);
        // 401 에러인 경우 localStorage도 정리
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          if (axiosError.response?.status === 401) {
            console.log('❌ 401 오류로 쿠키 기반 인증 실패');
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          }
        }
      }
      
      // 인증 실패 시 로딩 상태 해제
      dispatch({ type: 'LOGIN_FAILURE' });
    };
    
    // 3. PostMessage 리스너 - 부모 창에서 토큰 받기
    const handlePostMessage = (event: MessageEvent) => {
      // 보안: 신뢰할 수 있는 도메인에서만 메시지 수신
      if (event.origin !== 'https://www.realcatcha.com' && event.origin !== 'https://realcatcha.com') {
        return;
      }
      
      if (event.data.type === 'AUTH_TOKEN' && event.data.token && event.data.user) {
        // 기존 로컬 데이터 정리 후 새 데이터 저장
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        
        // 부모 창에서 받은 토큰으로 자동 로그인
        const { token, user } = event.data;
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        dispatch({ type: 'REFRESH_SUCCESS', payload: { user, token } });
        console.log('PostMessage로 자동 로그인 완료:', user);
        
        // 서버 검증도 즉시 수행
        setTimeout(async () => {
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.data && response.data.user) {
              const serverUser = response.data.user;
              const serverToken = response.data.access_token || token;
              
              localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, serverToken);
              localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(serverUser));
              
              dispatch({ type: 'REFRESH_SUCCESS', payload: { user: serverUser, token: serverToken } });
            }
          } catch (error) {
            console.warn('PostMessage 후 서버 검증 실패:', error);
          }
        }, 1000);
      }
    };
    
    window.addEventListener('message', handlePostMessage);
    initAuth();
    
    // 정리
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // 로그인 전에 기존 데이터 정리
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // 로컬 스토리지에 저장
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = async () => {
    try {
      // 백엔드에 로그아웃 요청 (쿠키 제거)
      await authService.logout();
    } catch (error) {
      console.warn('로그아웃 API 호출 실패:', error);
      // API 실패해도 로컬 상태는 정리
    }
    
    // 로컬 스토리지 및 상태 정리
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    dispatch({ type: 'LOGOUT' });
    
    // 부모 창(웹사이트)에 로그아웃 알림
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'LOGOUT'
      }, 'https://www.realcatcha.com');
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken();
      
      if (response.success) {
        const { user, token } = response.data;
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        dispatch({ type: 'REFRESH_SUCCESS', payload: { user, token } });
        return true;
      }
      return false;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    loading: state.loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}