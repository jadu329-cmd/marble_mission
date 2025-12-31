# GitHub Actions 자동 배포 설정 가이드

## 🚀 설정 방법

### 1. Firebase 토큰 생성

Firebase CLI로 로그인하여 토큰을 생성합니다:

```bash
# Firebase CLI 설치 (로컬에서 한 번만)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 토큰 생성 (이 명령어는 토큰을 출력합니다)
firebase login:ci
```

명령어 실행 후 출력되는 토큰을 복사하세요.

### 2. GitHub Secrets 설정

1. GitHub 저장소 페이지로 이동
2. **Settings** > **Secrets and variables** > **Actions** 클릭
3. **New repository secret** 클릭
4. 다음 정보 입력:
   - **Name**: `FIREBASE_TOKEN`
   - **Value**: 위에서 복사한 Firebase 토큰
5. **Add secret** 클릭

### 3. GitHub에 코드 푸시

```bash
# Git 초기화 (아직 안 했다면)
git init

# GitHub 저장소 추가
git remote add origin https://github.com/사용자명/저장소명.git

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit"

# main 브랜치에 푸시
git push -u origin main
```

### 4. 자동 배포 확인

- `main` 브랜치에 푸시하면 자동으로 배포가 시작됩니다
- GitHub 저장소의 **Actions** 탭에서 배포 진행 상황을 확인할 수 있습니다
- 배포 완료 후 `https://marblemisson.web.app`에서 확인하세요

## 📋 Workflow 동작 순서

1. `main` 브랜치에 코드 푸시
2. GitHub Actions 자동 실행
3. `npm ci` - 의존성 설치
4. `npm run build` - 프로젝트 빌드
5. `firebase deploy --only hosting` - Firebase Hosting에 배포

## ✅ 배포 확인

배포가 완료되면:
- Firebase Console > Hosting에서 배포 내역 확인
- `https://marblemisson.web.app` 접속하여 사이트 동작 확인

## 🔧 문제 해결

### 배포가 실패하는 경우

1. **FIREBASE_TOKEN 확인**
   - GitHub Secrets에 토큰이 올바르게 설정되었는지 확인
   - 토큰이 만료되었을 수 있으니 다시 생성: `firebase login:ci`

2. **Firebase 프로젝트 확인**
   - `.firebaserc` 파일의 프로젝트 ID가 올바른지 확인
   - Firebase Console에서 프로젝트가 존재하는지 확인

3. **Actions 로그 확인**
   - GitHub 저장소 > Actions 탭에서 실패한 워크플로우 클릭
   - 에러 메시지 확인

## 📝 참고사항

- `main` 브랜치에만 자동 배포됩니다
- 다른 브랜치에 푸시해도 배포되지 않습니다
- 배포는 약 2-3분 정도 소요됩니다

