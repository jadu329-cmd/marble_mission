# 개발 서버 실행 방법

## 방법 1: 터미널에서 직접 실행

현재 프로젝트 폴더에서 다음 명령어를 실행하세요:

```bash
npm run dev
```

실행 후 브라우저에서 **http://localhost:5173** 접속

---

## 방법 2: VS Code 터미널 사용

1. VS Code에서 프로젝트 열기
2. 터미널 열기 (Ctrl + `)
3. `npm run dev` 실행
4. 브라우저에서 http://localhost:5173 접속

---

## 문제 해결

### 포트가 이미 사용 중인 경우
다른 포트로 실행:
```bash
npm run dev -- --port 3000
```

### 의존성이 설치되지 않은 경우
```bash
npm install
npm run dev
```

