# 청년회 부서대항전 미션 체크 시스템 - 프로젝트 전체 개요

## 📋 프로젝트 개요

Firebase Firestore를 사용한 실시간 미션 체크 및 점수 관리 시스템입니다. 모바일/데스크톱 어디서든 접속하여 미션을 체크하고, 부서별 점수를 실시간으로 확인할 수 있습니다.

**핵심 특징:**
- ✅ Firebase 실시간 동기화 (localStorage 문제 해결)
- ✅ 월간 캘린더 방식으로 직관적인 미션 체크
- ✅ 부서별 점수 합산 및 실시간 표시
- ✅ 캘린더에 점수 바로 표시
- ✅ 상세 정보 툴팁 제공

## 🎯 주요 요구사항

1. 일단위 부서별 미션 체크
2. Firebase 실시간 동기화 (모든 기기에서 동일한 데이터)
3. 부서별 점수 합산 및 메인 화면 표시
4. 부서: 사랑부, 하나부
5. 월간 캘린더 방식으로 날짜 클릭 시 미션 체크
6. 말씀 묵상 공유: 6명 이상 체크 시 1점 (명단 클릭 방식)
7. 총 점수 합계 표시 (모든 기간)
8. 캘린더에 부서별 점수 바로 표시

## 📝 미션 목록

1. **전도** - 5점/1인
2. **부서 심방** - 5점/1인 (월 2회 제한)
3. **간증 자원** - 1점/1인
4. **말씀 묵상 공유** - 1점/1일 (6명 이상 필요, 명단 클릭)
5. **주일 묵상모임** - 1점/1인
6. **줌 묵상모임** - 1점/1인
7. **수요말씀 참석** - 1점/1인
8. **청년회 교제** - 1점/1인
9. **집회 참석** - 1점/1인
10. **동계 참석** - 1점/1인

## 🛠 기술 스택

- **React** 18.2.0
- **Vite** 5.0.8
- **Firebase** 10.7.1 (Firestore)
- **date-fns** 3.0.0

## 📁 프로젝트 구조

```
Misson/
├── package.json
├── vite.config.js
├── index.html
├── firebase.json              # Firebase Hosting 설정
├── .firebaserc               # Firebase 프로젝트 설정
├── .gitignore
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── firebase/
│   │   └── config.js         # Firebase 설정 (실제 값 입력 필요)
│   ├── data/
│   │   ├── missions.js       # 미션 목록 정의
│   │   └── members.js        # 부서별 명단 (실제 명단 입력 필요)
│   ├── services/
│   │   └── missionService.js # Firebase 데이터 처리 로직
│   └── components/
│       ├── MainScreen.jsx    # 메인 화면 (점수 표시 + 캘린더)
│       ├── MainScreen.css
│       ├── Calendar.jsx      # 월간 캘린더
│       ├── Calendar.css
│       ├── MissionModal.jsx # 미션 체크 모달
│       ├── MissionModal.css
│       ├── MissionCheck.jsx # (구버전, 사용 안 함)
│       └── MissionCheck.css
├── README.md
├── DEPLOY.md                 # 배포 가이드
└── PROJECT_SUMMARY.md       # 이 파일
```

## 🚀 시작하기

### 1. 프로젝트 생성 및 의존성 설치

```bash
# 프로젝트 폴더 생성
mkdir Misson
cd Misson

# package.json 생성 (아래 내용으로)
# vite.config.js 생성
# index.html 생성
# src 폴더 구조 생성

# 의존성 설치
npm install
```

### 2. Firebase 설정

#### 2.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `marblemisson` (또는 원하는 이름)
4. 프로젝트 생성

#### 2.2 Firestore Database 생성
1. Firebase Console에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "테스트 모드로 시작" 선택
4. 위치 선택: `asia-northeast3` (서울) 권장
5. "사용 설정" 클릭

#### 2.3 Firestore 보안 규칙 설정
Firestore Database > 규칙 탭에서 다음 규칙 입력:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /missions/{document} {
      allow read, write: if true;
    }
  }
}
```

"게시" 버튼 클릭

#### 2.4 웹 앱 추가 및 설정 정보 복사
1. 프로젝트 설정(톱니바퀴 아이콘) > 일반 탭
2. "앱 추가" > 웹 아이콘 선택
3. 앱 닉네임 입력 후 "앱 등록"
4. 설정 정보 복사

#### 2.5 config.js 파일에 설정 입력
`src/firebase/config.js` 파일에 복사한 설정 정보 입력:

```javascript
const firebaseConfig = {
  apiKey: "실제-apiKey",
  authDomain: "실제-authDomain",
  projectId: "실제-projectId",
  storageBucket: "실제-storageBucket",
  messagingSenderId: "실제-messagingSenderId",
  appId: "실제-appId",
  measurementId: "실제-measurementId"
}
```

### 3. 부서별 명단 설정

`src/data/members.js` 파일에 실제 명단 입력:

```javascript
export const departmentMembers = {
  sarang: [
    '이름1',
    '이름2',
    // ... 실제 사랑부 명단
  ],
  hana: [
    '이름1',
    '이름2',
    // ... 실제 하나부 명단
  ]
}
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 📊 데이터 구조

### Firestore 컬렉션: `missions`

**문서 ID 형식:** `{날짜}_{부서}` (예: `2024-01-15_sarang`)

**문서 구조:**
```javascript
{
  date: "2024-01-15",
  department: "sarang", // 또는 "hana"
  missions: {
    "evangelism": 2,        // 전도 2명
    "meditation-share": 1,  // 묵상 공유 (6명 이상이면 1, 아니면 0)
    "department-visit": 1,  // 부서 심방 1명
    // ... 기타 미션
  },
  meditationMembers: {
    "meditation-share": ["김사랑", "이사랑", ...] // 묵상 공유한 사람들
  },
  updatedAt: Timestamp
}
```

## 🎨 주요 기능

### 1. 메인 화면 (MainScreen.jsx)
- 부서별 총 점수 표시 (모든 기간 합산)
- 월간 캘린더 표시
- 날짜 클릭 시 모달 열기

### 2. 캘린더 (Calendar.jsx)
- 월간 캘린더 뷰
- 미션 있는 날짜 표시 (색상/도트)
- 날짜에 부서별 점수 바로 표시
- 호버 시 상세 정보 툴팁 표시
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
- `getMonthlyMissionCount()`: 월별 미션 체크 횟수

## 🔑 핵심 로직

### 말씀 묵상 공유 점수 계산
- 6명 이상 체크 시: 1점
- 5명 이하: 0점
- 명단에서 체크박스로 선택
- 선택된 멤버는 `meditationMembers`에 저장

### 총 점수 계산
- `getAllTimeScores()`: 모든 `missions` 문서를 조회하여 부서별 합산
- 각 날짜별 점수는 `calculateDailyScore()`로 계산

### 월 제한 체크
- 부서 심방은 월 2회 제한
- `getMonthlyMissionCount()`로 해당 월의 총 체크 횟수 확인
- 제한 초과 시 저장 불가

## 🎯 사용 방법

1. **캘린더에서 날짜 클릭**
2. **부서 선택** (사랑부/하나부)
3. **미션 체크:**
   - 말씀 묵상 공유: 명단에서 체크박스 선택 (6명 이상)
   - 다른 미션: +/- 버튼으로 인원수 입력
4. **자동 저장 및 실시간 동기화**
5. **캘린더에서 점수 확인** (날짜에 바로 표시)
6. **호버 시 상세 정보 확인**

## 📦 빌드 및 배포

### 빌드
```bash
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

### Firebase Hosting 배포

#### 1. Firebase CLI 설치
```bash
npm install -g firebase-tools
```

#### 2. Firebase 로그인
```bash
firebase login
```

#### 3. 프로젝트 설정 확인
`.firebaserc` 파일에 프로젝트 ID가 설정되어 있는지 확인

#### 4. 배포
```bash
firebase deploy --only hosting
```

#### 5. 배포 URL 확인
배포 완료 후 제공되는 URL로 접속:
- `https://{프로젝트ID}.web.app`
- `https://{프로젝트ID}.firebaseapp.com`

## ⚠️ 주의사항

1. **Firebase 설정 필수**: `src/firebase/config.js`에 실제 설정 정보 입력 필요
2. **부서별 명단 설정**: `src/data/members.js`에 실제 명단 입력 필요
3. **Firestore 보안 규칙**: 개발용으로 모든 읽기/쓰기 허용. 프로덕션에서는 인증 추가 권장
4. **월 제한 미션**: 부서 심방은 자동으로 월 2회 제한 체크
5. **모든 데이터는 Firebase Firestore에 저장**: 실시간 동기화됨

## 🔧 개발 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 실행 (localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

## 📱 반응형 디자인

- 모바일/데스크톱 모두 지원
- 캘린더는 화면 크기에 따라 자동 조정
- 터치 인터페이스 지원

## 🐛 문제 해결

### 저장이 안 되는 경우
1. Firebase 설정 확인 (`src/firebase/config.js`)
2. Firestore 보안 규칙 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 배포 후 데이터가 저장되지 않는 경우
1. Firebase 설정이 빌드에 포함되었는지 확인
2. Firestore 보안 규칙 확인
3. 네트워크 연결 확인

## 📄 주요 파일 설명

- `src/firebase/config.js`: Firebase 초기화 및 설정
- `src/data/missions.js`: 미션 목록 정의
- `src/data/members.js`: 부서별 명단
- `src/services/missionService.js`: Firebase 데이터 처리 로직
- `src/components/MainScreen.jsx`: 메인 화면 컴포넌트
- `src/components/Calendar.jsx`: 캘린더 컴포넌트
- `src/components/MissionModal.jsx`: 미션 체크 모달 컴포넌트

## 🎉 완성된 기능

✅ Firebase 실시간 동기화
✅ 월간 캘린더 방식 미션 체크
✅ 부서별 점수 합산 및 표시
✅ 캘린더에 점수 바로 표시
✅ 상세 정보 툴팁
✅ 말씀 묵상 공유 6명 이상 조건
✅ 명단 클릭 방식
✅ 월 제한 체크
✅ 반응형 디자인

---

**프로젝트 생성일:** 2024년
**최종 업데이트:** 2024년
**버전:** 1.0.0

