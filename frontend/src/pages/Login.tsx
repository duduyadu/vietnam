import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  DeleteForever
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(i18n.language);
  const [cacheCleared, setCacheCleared] = useState(false);

  // 캐시 초기화 함수
  const clearCache = () => {
    // localStorage 완전 초기화
    localStorage.clear();
    // sessionStorage도 초기화
    sessionStorage.clear();
    // 캐시 초기화 상태 설정
    setCacheCleared(true);
    console.log('Cache cleared successfully');
  };

  // 초기화 시 localStorage 완전 제거
  useEffect(() => {
    // URL 파라미터로 clear=true가 있으면 캐시 초기화
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clear') === 'true') {
      clearCache();
      // URL에서 clear 파라미터 제거
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  // 이미 로그인된 경우 대시보드로 리다이렉트 (캐시 초기화 상태가 아닐 때만)
  useEffect(() => {
    if (isAuthenticated && !cacheCleared) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, cacheCleared]);

  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string | null
  ) => {
    if (newLanguage) {
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt:', { username, password });
      await login(username, password);
      console.log('Login successful, navigating to dashboard...');
      
      // 로그인 성공 후 강제로 페이지 새로고침
      // React Router의 navigate가 제대로 작동하지 않는 경우를 위한 임시 해결책
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error:', err);
      
      // 400 에러인 경우 더 자세한 정보 표시
      if (err.response?.status === 400) {
        console.error('400 Error details:', err.response.data);
        const validationErrors = err.response.data.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map((e: any) => `${e.path}: ${e.msg}`).join(', ');
          setError(`입력 오류: ${errorMessages}`);
        } else {
          setError(err.response.data.message || '입력값을 확인해주세요.');
        }
      } else {
        setError(extractErrorMessage(err, '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'));
      }
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography component="h1" variant="h5">
              {t('auth.login')}
            </Typography>
            <ToggleButtonGroup
              value={language}
              exclusive
              onChange={handleLanguageChange}
              size="small"
            >
              <ToggleButton value="ko">
                한국어
              </ToggleButton>
              <ToggleButton value="vi">
                Tiếng Việt
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label={t('auth.username') || '아이디'}
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.login')}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Vietnam Student Management System v1.0
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;