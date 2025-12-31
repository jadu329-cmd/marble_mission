# 청년회 부서대항전 미션 체크 시스템 - 개발 요약

## 프로젝트 개요
Firebase를 사용한 실시간 미션 체크 및 점수 관리 시스템입니다. 모바일/데스크톱 어디서든 접속하여 미션을 체크하고, 부서별 점수를 실시간으로 확인할 수 있습니다.

## 주요 요구사항
1. ✅ 일단위 부서별 미션 체크
2. ✅ Firebase 실시간 동기화 (localStorage 문제 해결)
3. ✅ 부서별 점수 합산 및 메인 화면 표시
4. ✅ 부서: 사랑부, 하나부
5. ✅ 월간 캘린더 방식으로 날짜 클릭 시 미션 체크
6. ✅ 말씀 묵상 공유: 6명 이상 체크 시 1점 (명단 클릭 방식)
7. ✅ 총 점수 합계 표시 (모든 기간)

## 미션 목록
1. 전도 - 5점/1인
2. 부서 심방 - 5점/1인 (월 2회 제한)
3. 간증 자원 - 1점/1인
4. 말씀 묵상 공유 - 1점/1일 (6명 이상 필요, 명단 클릭)
5. 주일 묵상모임 - 1점/1인
6. 줌 묵상모임 - 1점/1인
7. 수요말씀 참석 - 1점/1인
8. 청년회 교제 - 1점/1인
9. 집회 참석 - 1점/1인
10. 동계 참석 - 1점/1인

## 기술 스택
- React 18.2.0
- Vite 5.0.8
- Firebase 10.7.1 (Firestore)
- date-fns 3.0.0

## 프로젝트 구조
```
Misson/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── firebase/
│   │   └── config.js (Firebase 설정 필요)
│   ├── data/
│   │   ├── missions.js (미션 목록)
│   │   └── members.js (부서별 명단 - 수정 필요)
│   ├── services/
│   │   └── missionService.js (Firebase 데이터 처리)
│   └── components/
│       ├── MainScreen.jsx (메인 화면)
│       ├── MainScreen.css
│       ├── Calendar.jsx (월간 캘린더)
│       ├── Calendar.css
│       ├── MissionModal.jsx (미션 체크 모달)
│       ├── MissionModal.css
│       ├── MissionCheck.jsx (구버전, 사용 안 함)
│       └── MissionCheck.css
└── README.md
```

## 주요 기능 구현

### 1. 메인 화면 (MainScreen.jsx)
- 부서별 총 점수 표시 (모든 기간 합산)
- 월간 캘린더 표시
- 날짜 클릭 시 모달 열기

### 2. 캘린더 (Calendar.jsx)
- 월간 캘린더 뷰
- 미션 있는 날짜 표시 (색상/도트)
- 월 이동 기능

### 3. 미션 체크 모달 (MissionModal.jsx)
- 날짜 클릭 시 부서 선택 화면
- 부서 선택 후 미션 체크
- 말씀 묵상 공유: 명단 체크박스 (6명 이상 시 1점)
- 다른 미션: +/- 버튼으로 인원수 입력
- 월 제한 체크 (부서 심방)

### 4. 데이터 서비스 (missionService.js)
- `getAllTimeScores()`: 모든 기간 총 점수
- `getMissionData()`: 특정 날짜/부서 미션 데이터
- `saveMissionCheck()`: 미션 체크 저장
- `calculateDailyScore()`: 일일 점수 계산 (묵상 6명 이상 조건 포함)

## 설정 방법

### 1. Firebase 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Firestore Database 생성 (테스트 모드로 시작 가능)
3. 프로젝트 설정 > 일반 탭에서 웹 앱 추가
4. 설정 정보를 `src/firebase/config.js`에 입력:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 2. 부서별 명단 설정
`src/data/members.js` 파일에 실제 명단 입력:
```javascript
export const departmentMembers = {
  sarang: ['이름1', '이름2', ...], // 사랑부 명단
  hana: ['이름1', '이름2', ...]    // 하나부 명단
}
```

### 3. Firestore 보안 규칙 (개발용)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /missions/{document} {
      allow read, write: if true; // 개발용 - 프로덕션에서는 인증 추가 권장
    }
  }
}
```

## 데이터 구조

### Firestore 컬렉션: `missions`
문서 ID: `{날짜}_{부서}` (예: `2024-01-15_sarang`)

문서 구조:
```javascript
{
  date: "2024-01-15",
  department: "sarang", // 또는 "hana"
  missions: {
    "evangelism": 2,        // 전도 2명
    "meditation-share": 1,  // 묵상 공유 (6명 이상이면 1, 아니면 0)
    ...
  },
  meditationMembers: {
    "meditation-share": ["김사랑", "이사랑", ...] // 묵상 공유한 사람들
  },
  updatedAt: Timestamp
}
```

## 핵심 로직

### 말씀 묵상 공유 점수 계산
- 6명 이상 체크 시: 1점
- 5명 이하: 0점
- 명단에서 체크박스로 선택
- 선택된 멤버는 `meditationMembers`에 저장

### 총 점수 계산
- `getAllTimeScores()`: 모든 `missions` 문서를 조회하여 부서별 합산
- 각 날짜별 점수는 `calculateDailyScore()`로 계산

## 사용 방법
1. 캘린더에서 날짜 클릭
2. 부서 선택 (사랑부/하나부)
3. 미션 체크:
   - 말씀 묵상 공유: 명단에서 체크박스 선택 (6명 이상)
   - 다른 미션: +/- 버튼으로 인원수 입력
4. 자동 저장 및 실시간 동기화

## 개발 명령어
```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 실행 (localhost:5173)
npm run build        # 프로덕션 빌드
```

## 주의사항
- ⚠️ Firebase 설정은 반드시 필요 (없으면 데이터 저장/불러오기 불가)
- ⚠️ 부서별 명단은 `src/data/members.js`에서 수정 필요
- ⚠️ 월 제한 미션(부서 심방)은 자동 체크됨
- ✅ 모든 데이터는 Firebase Firestore에 저장되어 실시간 동기화

## 설치 방법

1. 의존성 설치:
```bash
npm install
```

2. Firebase 설정:
   - `src/firebase/config.js` 파일을 열어서 본인의 Firebase 설정 정보를 입력하세요.
   - Firebase Console에서 프로젝트를 생성하고 설정 정보를 복사하세요.

3. 개발 서버 실행:
```bash
npm run dev
```

## 빌드

프로덕션 빌드:
```bash
npm run build
```
