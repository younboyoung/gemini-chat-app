# Gemini Chat App

맥에서 `Option + Space` 단축키로 호출할 수 있는 Gemini AI 채팅 앱입니다.

## 기능

- **글로벌 단축키**: `Option + Space`로 언제든 앱 호출/숨김
- **투명한 UI**: 블러 효과와 투명도로 모던한 디자인
- **Gemini AI 연동**: Google의 Gemini Pro 모델 사용
- **시스템 트레이**: 백그라운드에서 실행
- **자동 숨김**: 포커스를 잃으면 자동으로 창 숨김
- **실시간 채팅**: 스트리밍 응답 지원

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 폴더 생성
mkdir gemini-chat-app
cd gemini-chat-app

# 파일들을 복사한 후
npm install
```

### 2. Gemini API 키 설정

1. [Google AI Studio](https://makersuite.google.com/)에서 API 키 발급
2. `.env.example`을 `.env`로 복사
3. `.env` 파일에 API 키 입력:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 개발 모드 실행

```bash
npm run dev
```

### 4. 앱 빌드

```bash
npm run build
```

## 사용법

1. **앱 실행**: `npm start` 또는 빌드된 앱 실행
2. **호출**: `Option + Space` 키로 채팅창 열기/닫기
3. **채팅**: 메시지 입력 후 Enter 키로 전송
4. **숨김**: ESC 키 또는 창 바깥 클릭으로 숨기기
5. **종료**: 트레이 메뉴에서 Quit 선택

## 단축키

- `Option + Space`: 앱 호출/숨김
- `Enter`: 메시지 전송
- `Shift + Enter`: 줄바꿈
- `Escape`: 창 숨기기

## 파일 구조

```
gemini-chat-app/
├── main.js              # Electron 메인 프로세스
├── renderer.js          # 렌더러 프로세스 (UI 로직)
├── index.html           # 메인 HTML
├── styles.css           # 스타일시트
├── package.json         # 패키지 설정
├── .env                 # 환경변수 (API 키)
└── assets/
    └── icon.png         # 트레이 아이콘 (추가 필요)
```

## 주요 기능 설명

### 글로벌 단축키
- `globalShortcut` API를 사용하여 시스템 전역에서 단축키 등록
- 앱이 백그라운드에서 실행 중일 때도 동작

### 투명한 UI
- `transparent: true`로 투명한 창 생성
- CSS `backdrop-filter`로 블러 효과
- 모던한 다크 테마 적용

### 시스템 트레이
- 메뉴바에서 앱 상태 확인
- 우클릭 메뉴로 앱 제어

### 자동 포커스 관리
- 창이 나타날 때 입력 필드에 자동 포커스
- 포커스를 잃으면 자동으로 창 숨김

## 커스터마이징

### UI 테마 변경
`styles.css`에서 색상과 스타일 수정 가능

### 단축키 변경
`main.js`의 `registerGlobalShortcuts()` 함수에서 변경

### 창 크기 및 위치
`main.js`의 `createWindow()` 함수에서 조정

## 문제 해결

### API 키 오류
- `.env` 파일에 올바른 API 키가 설정되어 있는지 확인
- Google AI Studio에서 API 키가 활성화되어 있는지 확인

### 단축키가 작동하지 않음
- 다른 앱에서 같은 단축키를 사용하고 있는지 확인
- 앱을 관리자 권한으로 실행해보기
- 시스템 환경설정에서 접근성 권한 확인

### 앱이 시작되지 않음
- Node.js 버전 확인 (16.x 이상 권장)
- 의존성 재설치: `rm -rf node_modules && npm install`
- 개발자 도구에서 오류 메시지 확인

### 트레이 아이콘이 보이지 않음
- `assets/icon.png` 파일 추가 필요
- 16x16, 32x32 크기의 PNG 파일 사용 권장

## 추가 개발 아이디어

### 기능 확장
- 다크/라이트 테마 토글
- 폰트 크기 조절
- 채팅 히스토리 저장
- 다중 대화 세션
- 음성 입력/출력
- 시스템 알림

### UI 개선
- 애니메이션 효과 추가
- 메시지 검색 기능
- 코드 하이라이팅
- 마크다운 렌더링
- 이미지 업로드 지원

### 성능 최적화
- 메시지 가상화 (긴 대화 시)
- 캐시 시스템
- 오프라인 모드

## 배포

### macOS 앱 번들 생성
```bash
npm run build
```

### 자동 시작 설정
```javascript
// main.js에 추가
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true
});
```

### 코드 서명 (배포용)
```bash
# Apple Developer 계정 필요
electron-builder --publish=never
```

## 라이선스

MIT License

## 기여

이슈 리포트와 풀 리퀘스트를 환영합니다!