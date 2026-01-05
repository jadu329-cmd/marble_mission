# 배포 가이드

## 문제 해결: 배포 후 데이터 저장 안 됨

현재 코드는 **Firebase Firestore**를 사용하므로, 배포 후에도 모든 기기에서 데이터가 실시간으로 동기화됩니다.

### 이전 문제의 원인
- localStorage를 사용했을 경우: 각 기기별로 저장되어 다른 기기에서 보이지 않음
- **현재는 Firebase 사용**: 모든 데이터가 클라우드에 저장되어 모든 기기에서 공유됨

## Firebase Hosting 배포 방법 (권장)

### 1. Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인
```bash
firebase login
```

### 3. 프로젝트 빌드
```bash
npm run build
```

### 4. Firebase 초기화 (처음 한 번만)
```bash
firebase init hosting
```
- 기존 프로젝트 선택: `marblemisson`
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub 자동 배포: `No` (원하면 Yes)

### 5. 배포
```bash
firebase deploy --only hosting
```

### 6. 배포 URL 확인
배포 완료 후 제공되는 URL로 접속하면 모든 기기에서 접속 가능합니다.

## 배포 후 확인 사항

### 1. Firestore 보안 규칙 확인
Firebase Console > Firestore Database > 규칙 탭에서:
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

### 2. 브라우저 콘솔 확인
배포된 사이트에서 F12 > Console 탭에서:
- `✅ Firebase 초기화 완료` 메시지 확인
- 에러 메시지가 없는지 확인

### 3. 데이터 저장 테스트
1. 배포된 사이트에서 미션 체크
2. Firebase Console > Firestore Database > 데이터 탭에서 저장 확인
3. 다른 기기에서 접속하여 데이터 확인

## 다른 배포 방법 (GitHub Pages, Vercel 등)

### 주의사항
1. **빌드 필수**: `npm run build` 실행 후 `dist` 폴더 배포
2. **Firebase 설정 확인**: `src/firebase/config.js`에 실제 설정이 있는지 확인
3. **환경 변수**: 일부 플랫폼은 환경 변수 설정 필요할 수 있음

### Vercel 배포
```bash
npm install -g vercel
vercel
```

### Netlify 배포
1. Netlify 사이트에서 `dist` 폴더 드래그 앤 드롭
2. 또는 GitHub 연동

## 문제 해결

### 일부 데스크탑에서 접속이 안 되는 경우

모바일에서는 접속이 되는데 데스크탑 일부에서만 접속이 안 되는 경우, 다음 방법을 시도해보세요:

#### 1. 브라우저 캐시 삭제 (가장 흔한 원인)
**Chrome/Edge:**
- `Ctrl + Shift + Delete` (Windows) 또는 `Cmd + Shift + Delete` (Mac)
- "캐시된 이미지 및 파일" 선택
- 시간 범위: "전체 기간"
- 데이터 삭제 클릭

**또는 시크릿 모드로 접속:**
- `Ctrl + Shift + N` (Chrome) 또는 `Ctrl + Shift + P` (Edge)
- 시크릿 창에서 https://marblemisson.web.app/ 접속

#### 2. 하드 새로고침
- `Ctrl + F5` (Windows) 또는 `Cmd + Shift + R` (Mac)
- 또는 `Ctrl + Shift + R` (브라우저에 따라 다름)

#### 3. DNS 캐시 삭제
**Windows:**
```bash
ipconfig /flushdns
```

**Mac:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

#### 4. 다른 브라우저로 접속 테스트
- Chrome, Firefox, Edge 등 다른 브라우저로 접속해보기
- 특정 브라우저에서만 문제가 있다면 브라우저 호환성 문제일 수 있음

#### 5. 네트워크/방화벽 확인
- 회사 네트워크나 공공 Wi-Fi를 사용 중이라면, 다른 네트워크(모바일 핫스팟 등)로 접속 테스트
- 방화벽이나 보안 프로그램이 Firebase 도메인을 차단하는지 확인
- 회사 네트워크 관리자에게 Firebase Hosting 도메인 허용 요청

#### 6. 브라우저 확장 프로그램 비활성화
- 광고 차단기나 보안 확장 프로그램이 사이트를 차단할 수 있음
- 확장 프로그램을 일시적으로 비활성화하고 접속 테스트

#### 7. Firebase Hosting 캐시 초기화
- Firebase Console > Hosting > 설정에서 캐시 무효화 또는 재배포
- 또는 다음 명령어로 재배포:
```bash
firebase deploy --only hosting --force
```

#### 8. 브라우저 콘솔에서 에러 확인
- F12 > Console 탭에서 에러 메시지 확인
- Network 탭에서 실패한 요청 확인

### 배포 후 데이터가 저장되지 않는 경우

1. **Firebase 설정 확인**
   - `src/firebase/config.js`에 실제 설정이 있는지 확인
   - 빌드된 파일에 설정이 포함되었는지 확인

2. **Firestore 보안 규칙 확인**
   - Firebase Console에서 규칙이 올바르게 설정되었는지 확인

3. **브라우저 콘솔 확인**
   - F12 > Console에서 에러 메시지 확인
   - Firebase 초기화 메시지 확인

4. **네트워크 확인**
   - Firebase 서버에 접속 가능한지 확인
   - 방화벽이나 보안 프로그램 확인

## 배포 후 모든 기기에서 접속 가능

Firebase Hosting으로 배포하면:
- ✅ 인터넷이 있는 모든 기기에서 접속 가능
- ✅ 모바일, 데스크톱 모두 지원
- ✅ 실시간 데이터 동기화
- ✅ localStorage 문제 없음

