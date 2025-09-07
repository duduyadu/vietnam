import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  user_id: number;
  username: string;
  email?: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'korean_branch';
  agency_name?: string;
  branch_name?: string;
  preferred_language: 'ko' | 'vi';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 저장된 토큰과 사용자 정보 복원
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // 토큰이 유효한지 간단히 확인 (실제로는 백엔드 검증이 필요)
          // 현재는 토큰이 있으면 일단 사용
          setToken(savedToken);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse saved user data:', error);
          // 잘못된 데이터는 삭제
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        // 토큰이 없으면 명시적으로 null 설정
        setToken(null);
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      console.log('AuthContext: Starting login process...');
      const response = await authAPI.login(username, password);
      console.log('AuthContext: Login response received:', response.data);
      
      const { token, user } = response.data;
      
      // localStorage에 저장
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // state 업데이트
      setToken(token);
      setUser(user);
      
      // 사용자 선호 언어로 변경 (리로드 없이)
      if (user.preferred_language) {
        localStorage.setItem('language', user.preferred_language);
      }
      
      console.log('AuthContext: Login successful, state updated');
      // 로그인 성공 후 약간의 지연을 주어 state가 업데이트되도록 함
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};