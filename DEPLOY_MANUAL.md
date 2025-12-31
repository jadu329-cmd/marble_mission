# 수동 배포 가이드

## 로컬에서 직접 배포하기

### 1. Firebase CLI 로그인

```bash
npx firebase-tools login
```

브라우저가 열리면 Google 계정으로 로그인하세요.

### 2. 배포 실행

```bash
# 빌드 (이미 했다면 생략 가능)
npm run build

# Firebase Hosting에 배포
npx firebase-tools deploy --only hosting --project marblemisson
```

### 3. 배포 확인

배포 완료 후 다음 URL에서 확인:
- https://marblemisson.web.app

## 문제 해결

### "Site Not Found" 에러가 나는 경우

1. **배포가 안 된 경우**
   - 위의 수동 배포를 실행하세요
   - 또는 GitHub Actions에서 배포가 성공했는지 확인하세요

2. **캐시 문제**
   - 모바일 브라우저 캐시 삭제
   - 시크릿 모드로 접속 시도
   - 다른 네트워크에서 접속 시도

3. **URL 확인**
   - 정확한 URL: `https://marblemisson.web.app`
   - `marblemission.web.app` (mission이 하나)가 아닙니다

### GitHub Actions 배포 확인

1. https://github.com/jadu329-cmd/marble_mission/actions 접속
2. 최근 워크플로우 실행 상태 확인
3. 실패했다면 에러 로그 확인
4. 성공했다면 배포 후 몇 분 기다린 후 다시 시도

