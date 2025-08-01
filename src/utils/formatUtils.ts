/**
 * 데이터 포맷팅 유틸리티 함수들
 */

// 숫자에 콤마 추가
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

// 백분율 포맷팅
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// 파일 크기 포맷팅
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const decimals = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

// 응답 시간 포맷팅 (ms -> 사람이 읽기 쉬운 형태)
export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
};

// 성공률 포맷팅 (색상 코드 포함)
export const formatSuccessRate = (rate: number): { text: string; color: string } => {
  const percentage = formatPercentage(rate);
  let color = '#4caf50'; // 기본 녹색

  if (rate < 50) {
    color = '#f44336'; // 빨간색
  } else if (rate < 80) {
    color = '#ff9800'; // 주황색
  }

  return { text: percentage, color };
};

// 통화 포맷팅
export const formatCurrency = (amount: number, currency: string = 'KRW'): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// 이메일 마스킹
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskedLocal = localPart.length <= 2 
    ? localPart 
    : localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);

  return `${maskedLocal}@${domain}`;
};

// 전화번호 포맷팅
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};

// 상태 배지 포맷팅
export const formatStatusBadge = (status: string): { text: string; color: string; bgColor: string } => {
  const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
    active: { text: '활성', color: '#4caf50', bgColor: '#e8f5e8' },
    inactive: { text: '비활성', color: '#757575', bgColor: '#f5f5f5' },
    pending: { text: '대기', color: '#ff9800', bgColor: '#fff3e0' },
    error: { text: '오류', color: '#f44336', bgColor: '#ffebee' },
    success: { text: '성공', color: '#4caf50', bgColor: '#e8f5e8' },
    failed: { text: '실패', color: '#f44336', bgColor: '#ffebee' },
  };

  return statusMap[status.toLowerCase()] || { text: status, color: '#757575', bgColor: '#f5f5f5' };
};