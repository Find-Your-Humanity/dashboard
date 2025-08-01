import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Slider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    // 캐트차 설정
    imageRecognitionEnabled: true,
    handwritingRecognitionEnabled: true,
    emotionRecognitionEnabled: false,
    difficultyLevel: 3,
    timeoutDuration: 30,
    maxAttempts: 3,
    
    // 시스템 설정
    autoScalingEnabled: true,
    debugMode: false,
    analyticsEnabled: true,
    alertsEnabled: true,
    
    // 보안 설정
    rateLimitEnabled: true,
    rateLimitPerMinute: 60,
    blockSuspiciousIPs: true,
    requireSSL: true,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // API 호출 시뮤레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('설정 저장:', settings);
      setSaveStatus('success');
      
      // 3초 후 메시지 숨김
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    setSettings({
      imageRecognitionEnabled: true,
      handwritingRecognitionEnabled: true,
      emotionRecognitionEnabled: false,
      difficultyLevel: 3,
      timeoutDuration: 30,
      maxAttempts: 3,
      autoScalingEnabled: true,
      debugMode: false,
      analyticsEnabled: true,
      alertsEnabled: true,
      rateLimitEnabled: true,
      rateLimitPerMinute: 60,
      blockSuspiciousIPs: true,
      requireSSL: true,
    });
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            설정
          </Typography>
          <Typography variant="body1" color="text.secondary">
            캐트차 서비스 및 시스템 설정 관리
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            초기화
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? '저장 중...' : '저장'}
          </Button>
        </Box>
      </Box>

      {/* 저장 상태 메시지 */}
      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          설정이 성공적으로 저장되었습니다.
        </Alert>
      )}
      {saveStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          설정 저장 중 오류가 발생했습니다.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 캐트차 설정 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                캐트차 설정
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.imageRecognitionEnabled}
                    onChange={(e) => handleSettingChange('imageRecognitionEnabled', e.target.checked)}
                  />
                }
                label="이미지 인식 캐트차"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.handwritingRecognitionEnabled}
                    onChange={(e) => handleSettingChange('handwritingRecognitionEnabled', e.target.checked)}
                  />
                }
                label="필기 인식 캐트차"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emotionRecognitionEnabled}
                    onChange={(e) => handleSettingChange('emotionRecognitionEnabled', e.target.checked)}
                  />
                }
                label="감정 인식 캐트차"
                sx={{ display: 'block', mb: 3 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" gutterBottom>
                난이도 레벨: {settings.difficultyLevel}
              </Typography>
              <Slider
                value={settings.difficultyLevel}
                onChange={(_, value) => handleSettingChange('difficultyLevel', value)}
                min={1}
                max={5}
                marks
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="타임아웃 (초)"
                type="number"
                value={settings.timeoutDuration}
                onChange={(e) => handleSettingChange('timeoutDuration', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="최대 시도 횟수"
                type="number"
                value={settings.maxAttempts}
                onChange={(e) => handleSettingChange('maxAttempts', parseInt(e.target.value))}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 시스템 설정 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                시스템 설정
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoScalingEnabled}
                    onChange={(e) => handleSettingChange('autoScalingEnabled', e.target.checked)}
                  />
                }
                label="자동 스케일링"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.debugMode}
                    onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                  />
                }
                label="디버그 모드"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.analyticsEnabled}
                    onChange={(e) => handleSettingChange('analyticsEnabled', e.target.checked)}
                  />
                }
                label="분석 데이터 수집"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.alertsEnabled}
                    onChange={(e) => handleSettingChange('alertsEnabled', e.target.checked)}
                  />
                }
                label="알림 알림"
                sx={{ display: 'block', mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 보안 설정 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                보안 설정
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.rateLimitEnabled}
                        onChange={(e) => handleSettingChange('rateLimitEnabled', e.target.checked)}
                      />
                    }
                    label="요청 빈도 제한"
                    sx={{ display: 'block', mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="분당 최대 요청 수"
                    type="number"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => handleSettingChange('rateLimitPerMinute', parseInt(e.target.value))}
                    disabled={!settings.rateLimitEnabled}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.blockSuspiciousIPs}
                        onChange={(e) => handleSettingChange('blockSuspiciousIPs', e.target.checked)}
                      />
                    }
                    label="의심스러운 IP 차단"
                    sx={{ display: 'block', mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireSSL}
                        onChange={(e) => handleSettingChange('requireSSL', e.target.checked)}
                      />
                    }
                    label="SSL 연결 요구"
                    sx={{ display: 'block', mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsScreen;