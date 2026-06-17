cloudpress/
├── astro.config.mjs         # Astro 설정
├── package.json             # 의존성 관리
├── tsconfig.json            # TS 설정
├── wrangler.toml            # Cloudflare 설정
├── seed.sql                 # 초기 DB 데이터
├── src/
│   ├── env.d.ts             # 타입 정의
│   ├── index.ts             # Worker Entry (Cron/DO)
│   ├── middleware.ts        # 인증 미들웨어
│   ├── db/
│   │   ├── client.ts        # Drizzle 클라이언트
│   │   └── schema.ts        # DB 스키마
│   ├── lib/
│   │   ├── auth.ts          # 세션 관리
│   │   ├── crypto.ts        # 암호화 (Web Crypto)
│   │   ├── sharding.ts      # DO 부하 분산
│   │   ├── GitHubQueueDO.ts # GitHub 스토리지 큐
│   │   ├── og-image-generator.ts # 이미지 생성
│   │   └── og-helper.ts     # 폰트/헬퍼
│   ├── layouts/
│   │   └── Layout.astro     # 공통 레이아웃
│   ├── components/
│   │   ├── GameCanvas.tsx   # 메인 게임 (React)
│   │   └── StatsChart.tsx   # 통계 차트 (React)
│   └── pages/
│       ├── index.astro      # 메인 페이지
│       ├── login.astro      # 로그인
│       ├── register.astro   # 회원가입
│       ├── stats.astro      # 오답률 통계
│       ├── guide/           # SEO 가이드 시스템
│       │   ├── index.astro
│       │   └── [slug].astro
│       ├── admin/           # 관리자 대시보드
│       │   └── index.astro
│       └── api/             # 백엔드 API
│           ├── auth/ (login.ts, register.ts)
│           ├── game/ (save.ts)
│           └── og/ ([id].ts)
