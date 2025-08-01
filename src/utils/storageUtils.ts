/**
 * 로컬 스토리지 유틸리티 함수들
 */

// 로컬 스토리지에 데이터 저장
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`로컬 스토리지 저장 실패 (${key}):`, error);
  }
};

// 로컬 스토리지에서 데이터 가져오기
export const getLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue || null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`로컬 스토리지 읽기 실패 (${key}):`, error);
    return defaultValue || null;
  }
};

// 로컬 스토리지에서 데이터 제거
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`로컬 스토리지 제거 실패 (${key}):`, error);
  }
};

// 로컬 스토리지 전체 제거
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('로컬 스토리지 전체 제거 실패:', error);
  }
};

// 세션 스토리지에 데이터 저장
export const setSessionStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`세션 스토리지 저장 실패 (${key}):`, error);
  }
};

// 세션 스토리지에서 데이터 가져오기
export const getSessionStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) {
      return defaultValue || null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`세션 스토리지 읽기 실패 (${key}):`, error);
    return defaultValue || null;
  }
};

// 세션 스토리지에서 데이터 제거
export const removeSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`세션 스토리지 제거 실패 (${key}):`, error);
  }
};

// 세션 스토리지 전체 제거
export const clearSessionStorage = (): void => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('세션 스토리지 전체 제거 실패:', error);
  }
};

// 캐시 데이터 저장 (만료 시간 포함)
export const setCacheWithExpiry = <T>(key: string, value: T, expiryInMinutes: number): void => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + expiryInMinutes * 60 * 1000,
  };
  setLocalStorage(key, item);
};

// 캐시 데이터 가져오기 (만료 확인)
export const getCacheWithExpiry = <T>(key: string): T | null => {
  const item = getLocalStorage<{ value: T; expiry: number }>(key);
  
  if (!item) {
    return null;
  }
  
  const now = new Date();
  
  if (now.getTime() > item.expiry) {
    // 만료된 데이터 제거
    removeLocalStorage(key);
    return null;
  }
  
  return item.value;
};

// 브라우저 지원 여부 확인
export const isStorageSupported = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = type === 'localStorage' ? localStorage : sessionStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// 스토리지 사용량 확인
export const getStorageSize = (type: 'localStorage' | 'sessionStorage'): number => {
  try {
    const storage = type === 'localStorage' ? localStorage : sessionStorage;
    let total = 0;
    
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        total += storage[key].length + key.length;
      }
    }
    
    return total;
  } catch {
    return 0;
  }
};