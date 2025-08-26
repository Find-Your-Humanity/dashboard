# Real Captcha Dashboard

Real Captcha 서비스 관리를 위한 React 기반 대시보드 애플리케이션입니다.

## 🚀 기능

### 주요 기능
- **실시간 대시보드**: 캡차 서비스 사용 현황 모니터링
- **분석 및 통계**: 일별/주별/월별 성능 및 사용 패턴 분석
- **사용자 관리**: 대시보드 접근 권한 및 사용자 계정 관리
- **시스템 설정**: 캡차 서비스 설정 및 보안 정책 관리

### 캡차 유형 지원
- 이미지 인식 캡차
- 필기 인식 캡차
- 감정 인식 캡차

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript
- **UI Framework**: Material-UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Build Tool**: React Scripts
- **Container**: Docker + Nginx

## 📁 프로젝트 구조

```
src/
├── assets/          # 정적 리소스 (이미지, 폰트, 아이콘)
├── components/      # 재사용 가능한 UI 컴포넌트
│   └── Layout/      # 레이아웃 컴포넌트
├── config/          # 환경 설정 및 상수
├── contexts/        # React Context (전역 상태 관리)
├── navigation/      # 라우팅 및 네비게이션
├── screens/         # 페이지 컴포넌트
├── services/        # API 서비스 및 비즈니스 로직
├── styles/          # 전역 스타일 및 테마
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build

# 테스트
npm test
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_VERSION=1.0.0
```

## 🐳 Docker 실행

```bash
# Docker 이미지 빌드
docker build -t captcha-dashboard .

# Docker 컨테이너 실행
docker run -p 80:80 captcha-dashboard
```

## 📊 화면 구성

### 1. 대시보드 (/dashboard) 
- 실시간 메트릭 및 시스템 상태
- 주요 성능 지표 (성공률, 응답시간, 활성 사용자)
- 시간별 요청 현황 차트

### 2. 분석 (/analytics)
- 일별/주별/월별 통계
- 캡차 유형별 사용 비율
- 오류 유형 분석
- 성능 메트릭 및 사용자 통계

### 3. 사용자 관리 (/users)
- 사용자 목록 및 검색
- 사용자 추가/편집/삭제
- 권한 관리 (관리자/사용자)

### 4. 설정 (/settings)
- 캡차 서비스 설정 (유형 활성화, 난이도, 타임아웃)
- 시스템 설정 (자동 스케일링, 디버그 모드)
- 보안 설정 (요청 제한, IP 차단, SSL)

## 🔧 개발 가이드

### 코드 스타일
- TypeScript 엄격 모드 사용
- ESLint 및 Prettier 설정 준수
- 컴포넌트는 함수형 컴포넌트 사용
- 절대 경로 import 사용 (`@/` prefix)

### 컴포넌트 작성 규칙
```tsx
// Good
import React from 'react';
import { Box, Typography } from '@mui/material';
import { SomeType } from '@/types';

interface ComponentProps {
  title: string;
  data: SomeType[];
}

const Component: React.FC<ComponentProps> = ({ title, data }) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {/* 컴포넌트 내용 */}
    </Box>
  );
};

export default Component;
```

### API 서비스 사용
```tsx
// API 호출 예시
import { dashboardService } from '@/services/dashboardService';

const fetchData = async () => {
  try {
    const response = await dashboardService.getAnalytics();
    if (response.success) {
      setData(response.data);
    }
  } catch (error) {
    console.error('API 호출 실패:', error);
  }
};
```

## 🔗 관련 링크

- [GEMINI.md](../../GEMINI.md) - 인프라 구축 계획
- [WBS](../../documents/wbs.md) - 작업 분할 구조
- [Captcha Widget](../captcha-widget/) - 캡차 위젯 프론트엔드

## 📝 라이선스

This project is licensed under the MIT License.

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Real Captcha Dashboard v1.0.0**  
© 2025 Real Captcha. All rights reserved.
# Force rebuild for billing menu 08/25/2025 13:38:19
# Force rebuild for billing menu - 08/25/2025 13:44:30
