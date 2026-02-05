# GEditor Clone

가비아 제디터(GEditor)를 Vanilla HTML/CSS/JS로 구현한 클론 프로젝트입니다.

## 특징

- **순수 Vanilla JS**: 프레임워크 없이 ES Modules로 구현
- **반응형 상태 관리**: 자체 구현 Observable Store
- **드래그앤드롭**: HTML5 DnD + SortableJS
- **블록 기반 에디터**: 13종 블록 타입 지원
- **실시간 속성 편집**: 선택 블록의 모든 속성 편집
- **Undo/Redo**: 스냅샷 기반 히스토리
- **자동 저장**: localStorage/IndexedDB
- **HTML 내보내기**: 독립 실행 가능한 HTML 파일 생성

## 시작하기

### 방법 1: Python 서버 (권장)

```bash
cd geditor-clone
python -m http.server 8080
```

브라우저에서 http://localhost:8080/editor.html 접속

### 방법 2: VS Code Live Server

1. VS Code에서 Live Server 확장 설치
2. `editor.html` 우클릭 → "Open with Live Server"

### 방법 3: Node.js 서버

```bash
npx serve .
```

## 프로젝트 구조

```
geditor-clone/
├── editor.html          # 메인 에디터 페이지
├── css/                 # 스타일시트
│   ├── variables.css    # CSS 변수
│   ├── reset.css        # 리셋 스타일
│   ├── layout.css       # 레이아웃
│   ├── header.css       # 헤더
│   ├── left-panel.css   # 왼쪽 패널
│   ├── canvas.css       # 캔버스
│   ├── property-panel.css # 속성 패널
│   ├── blocks.css       # 블록 스타일
│   ├── modals.css       # 모달
│   └── responsive.css   # 반응형
├── js/
│   ├── app.js           # 진입점
│   ├── core/            # 핵심 모듈
│   │   ├── state.js     # 상태 관리
│   │   ├── events.js    # 이벤트 버스
│   │   ├── history.js   # Undo/Redo
│   │   ├── storage.js   # 저장소
│   │   └── utils.js     # 유틸리티
│   ├── editor/          # 에디터 모듈
│   │   ├── canvas.js    # 캔버스 매니저
│   │   └── block-registry.js # 블록 등록
│   ├── panels/          # 패널 모듈
│   │   ├── panel-manager.js
│   │   ├── block-panel.js
│   │   └── property-panel.js
│   └── services/        # 서비스 모듈
│       ├── toast-service.js
│       ├── keyboard-service.js
│       ├── export-service.js
│       └── autosave-service.js
└── data/                # 정적 데이터
    ├── block-library.json
    ├── themes.json
    └── skins.json
```

## 블록 타입

| 블록 | 설명 |
|------|------|
| Hero | 대형 배너 |
| Text | 텍스트 블록 |
| Image | 이미지 |
| Button | CTA 버튼 |
| Divider | 구분선 |
| Spacer | 여백 |
| Columns | 컬럼 레이아웃 |
| Gallery | 이미지 갤러리 |
| Video | YouTube/Vimeo |
| List | 목록 |
| Quote | 인용문 |
| Social | SNS 아이콘 |
| Map | Google Maps |

## 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| Ctrl+Z | 실행 취소 |
| Ctrl+Y | 다시 실행 |
| Ctrl+S | 저장 |
| Ctrl+D | 블록 복제 |
| Delete | 블록 삭제 |
| Escape | 선택 해제 |
| ↑/↓ | 블록 선택 이동 |
| Ctrl+↑/↓ | 블록 순서 이동 |

## 기술 스택

- HTML5 / CSS3 (CSS Variables, Grid, Flexbox)
- JavaScript (ES Modules, Async/Await)
- SortableJS (드래그 리오더)
- IndexedDB (이미지 저장)
- localStorage (프로젝트 저장)
- Google Material Symbols (아이콘)
- Pretendard (폰트)

## 구현 단계

- [x] Phase 1: 레이아웃 쉘
- [x] Phase 2: 블록 엔진 코어
- [x] Phase 3: 속성 패널
- [x] Phase 4: 블록/요소 라이브러리
- [ ] Phase 5: 이미지/업로드 시스템
- [ ] Phase 6: 테마/스킨/저장/내보내기
- [ ] Phase 7: AI 통합
- [ ] Phase 8: 폴리시 & 마무리

## 라이선스

학습 및 포트폴리오 목적으로 제작되었습니다.
