import { DATE_FORMATS } from '../config/constants';

/**
 * 날짜 및 시간 처리 유틸리티 함수들
 */

// 날짜 포맷팅
export const formatDate = (date: string | Date, format: string = DATE_FORMATS.DISPLAY): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '-';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case DATE_FORMATS.DATE_ONLY:
      return `${year}-${month}-${day}`;
    case DATE_FORMATS.TIME_ONLY:
      return `${hours}:${minutes}:${seconds}`;
    case DATE_FORMATS.DISPLAY:
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

// 상대적 시간 표시 (1분 전, 1시간 전 등)
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return '방금 전';
  }
};

// 날짜 범위 검사
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

// 오늘 날짜 반환
export const getToday = (): string => {
  return formatDate(new Date(), DATE_FORMATS.DATE_ONLY);
};

// 어제 날짜 반환
export const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday, DATE_FORMATS.DATE_ONLY);
};

// 지난 7일 날짜 범위 반환
export const getLast7Days = (): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  
  return {
    startDate: formatDate(startDate, DATE_FORMATS.DATE_ONLY),
    endDate: formatDate(endDate, DATE_FORMATS.DATE_ONLY),
  };
};

// 지난 30일 날짜 범위 반환
export const getLast30Days = (): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);
  
  return {
    startDate: formatDate(startDate, DATE_FORMATS.DATE_ONLY),
    endDate: formatDate(endDate, DATE_FORMATS.DATE_ONLY),
  };
};