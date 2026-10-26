# chugumiJ-app

일정(캘린더)과 할 일을 한 곳에서 관리하고, 홈 화면 위젯으로 오늘 할 일을 바로 확인하는 앱입니다.

- React Native + Expo (SDK 58) + TypeScript
- Expo Router, Zustand, expo-sqlite + Drizzle ORM
- 로컬 우선(MVP). v1.1에서 Spring Boot 서버와 동기화 예정

## 시작하기

```bash
npm install
npx expo start
```

위젯·알림은 Expo Go에서 동작하지 않아 개발 빌드가 필요합니다.

```bash
npx eas-cli@latest build --profile development --platform android
```

## 스크립트

| 명령                  | 설명                                      |
| --------------------- | ----------------------------------------- |
| `npm run lint`        | ESLint                                    |
| `npm run typecheck`   | TypeScript 타입 검사                      |
| `npm run format`      | Prettier 적용                             |
| `npm run db:generate` | `src/db/schema` 변경 후 마이그레이션 생성 |

## 폴더 구조

```text
src/
├─ app/                 # Expo Router 라우트 (화면 컴포넌트만 불러옴)
├─ features/<기능>/      # event, task, calendar, today, settings
│  ├─ screens/          # 한 화면 조립
│  ├─ components/       # 기능 전용 UI (props만 받음)
│  ├─ hooks/            # 조회·저장 흐름 조합
│  ├─ store/            # 화면 상태 (Zustand)
│  ├─ repository/       # DB 읽기·쓰기 + sync_outbox 기록
│  ├─ types.ts
│  └─ index.ts          # 외부 공개 API
├─ shared/              # components/ui, hooks, utils, constants, types, theme
├─ db/                  # schema, migrations, client, outbox, seed
├─ services/            # notification, widget, api(v1.1)
└─ config/
```

규칙

- 다른 기능은 `@/features/<기능>`(index.ts)로만 import 합니다 (ESLint로 검사).
- `shared/`는 `features/`를 import 하지 않습니다.
- 화면은 훅만 부르고, DB·알림·위젯은 훅에서만 다룹니다.
- 데이터 변경은 repository에서 트랜잭션으로 처리하고 `recordChange`로 sync_outbox에 남깁니다.
- 날짜는 `shared/utils/date.ts`를 거칩니다. 저장은 UTC ISO, 종일·마감일은 `YYYY-MM-DD`.
- 색·간격은 `shared/theme` 토큰만 사용합니다.

## 커밋 메시지

Conventional Commits: `feat(event): ...`, `fix(widget): ...`, `refactor`, `chore`, `docs`, `test`
