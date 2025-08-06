import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/constants';
import { LoginCredentials } from '../types';

const LoginScreen: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { login, loading } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    // 입력 시 에러 메시지 제거
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!credentials.email || !credentials.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const success = await login(credentials);
      if (!success) {
        setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        {/* 로고 및 제목 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <SecurityIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {APP_CONFIG.NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {APP_CONFIG.DESCRIPTION}
          </Typography>
        </Box>

        {/* 로그인 폼 */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="이메일"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            disabled={loading}
          />

          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleInputChange}
            margin="normal"
            required
            autoComplete="current-password"
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    disabled={loading}
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
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Box>

        {/* 버전 정보 */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Version {APP_CONFIG.VERSION}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginScreen;