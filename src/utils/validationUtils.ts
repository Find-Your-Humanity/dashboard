/**
 * 유효성 검사 유틸리티 함수들
 */

// 이메일 유효성 검사
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 강도 검사
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 8자 이상이어야 합니다.');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호에 대문자가 포함되어야 합니다.');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호에 소문자가 포함되어야 합니다.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에 숫자가 포함되어야 합니다.');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('비밀번호에 특수문자가 포함되어야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 전화번호 유효성 검사
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\d{10,11}$/;
  const cleaned = phone.replace(/[^\d]/g, '');
  return phoneRegex.test(cleaned);
};

// URL 유효성 검사
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// IP 주소 유효성 검사
export const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// 필수 필드 검사
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): {
  isValid: boolean;
  missingFields: string[];
} => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

// 숫자 범위 검사
export const isNumberInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// 문자열 길이 검사
export const isValidLength = (str: string, minLength: number, maxLength?: number): boolean => {
  if (str.length < minLength) return false;
  if (maxLength !== undefined && str.length > maxLength) return false;
  return true;
};

// 날짜 범위 검사
export const isDateInValidRange = (date: Date, startDate?: Date, endDate?: Date): boolean => {
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
};

// 비어있지 않은 값 검사
export const isNotEmpty = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length > 0;
  }
  return value !== null && value !== undefined;
};