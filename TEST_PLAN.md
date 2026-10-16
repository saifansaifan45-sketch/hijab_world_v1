# TEST PLAN & SYSTEM INVENTORY: HIJAB WORLD (v1 Showcase)

## 1. System Inventory

### Frontend (Next.js 16.4 Turbopack, React 19)
- **Routes**:
  - `/` (`src/app/page.tsx`): Main single-page interactive showcase featuring 4 views:
    - `#overview` (Home hero, features, comparison, guarantee, social actions)
    - `#anatomy` (Engineering diagram, 4 interactive ergonomic zone hotspots, specifications)
    - `#packs` (Curated Tones, Trio Bundle card, 3 individual variant product cards)
    - `#order` (Customer support, WhatsApp concierge card, Instagram card, FAQs)
  - `/api/settings` (`src/app/api/settings/route.ts`): Serverless proxy route fetching backend settings with local static fallback.
- **Components & Assets**:
  - `src/lib/links.ts`: Link verification and sanitization logic.
  - `public/app.js`: Interactive UI controller, smooth scroll, view state, zone inspection, WhatsApp message composer.
  - `public/style.css`: Cleaned responsive styles without admin styles or mock placeholders.
  - `public/robots.txt`: Proper robots directives (no admin links).
  - `public/sitemap.xml`: Clean canonical sitemap.
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_BRAND_NAME`
  - `NEXT_PUBLIC_WHATSAPP_NUMBER`
  - `NEXT_PUBLIC_WHATSAPP_MESSAGE`
  - `NEXT_PUBLIC_INSTAGRAM_URL`
  - `NEXT_PUBLIC_CONCIERGE_EMAIL`
  - `NEXT_PUBLIC_PHONE_NUMBER`

### Backend (NestJS 12, Prisma ORM, PostgreSQL)
- **Modules & Controllers**:
  - `AppModule`: Imports `PrismaModule`, `ProductsModule`, `SettingsModule`.
  - `AppController` (`GET /api/v1`): Health check / root banner endpoint.
  - `ProductsController`:
    - `GET /api/v1/products`: Query filtered public product list (search, category, availability).
    - `GET /api/v1/products/:id`: Fetch individual product by UUID or slug.
  - `SettingsController`:
    - `GET /api/v1/settings`: Public business metadata, WhatsApp link, Instagram link, and banner details. Explicitly omits `emailAddress`.
- **Database Models (Prisma)**:
  - `Category`, `Product`, `Service`, `Announcement`, `SiteSetting`
- **Environment Variables (`backend/.env` & `backend/.env.test`)**:
  - `NODE_ENV`, `PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `DATABASE_URL`, `CORS_ORIGIN`, `COOKIE_SECRET`, `THROTTLE_TTL`, `THROTTLE_LIMIT`, `BRAND_NAME`, `TAGLINE`, `WHATSAPP_NUMBER`, `INSTAGRAM_URL`, `CLOUDINARY_*`

---

## 2. Audit of Removed Features & Leftovers

| Item | Location | Type | Risk/Impact | Action Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Auth/Security Dependencies** | `backend/package.json` (`@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcryptjs`, `cookie-parser`, `cloudinary`) | Dead Dependencies | Increases bundle/install footprint, potential audit flags. | Ask user to remove or keep in Phase 5. |
| **Root Package Upload Dependencies** | Root `package.json` (`multer`, `express`, `cors`) | Dead Dependencies | Legacy root package left over from prototype scripts. | Ask user to clean up root `package.json`. |
| **Cloudinary Env Variables** | `backend/.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) | Unused Config | Harmless placeholder text, but no upload feature exists. | Ask user to remove from `.env` in Phase 5. |
| **Prisma Unused Tables** | `prisma/schema.prisma` (`Service`, `Announcement`) | Dead Tables / Schema | Currently not queried by any public frontend page or backend controller. | Keep schema intact for now; mark as N/A in test suite. |
| **Legacy Prototype Folder** | `legacy_prototype/` | Legacy Code | Contains old admin pin login `1234`, `db.js`, `server.js`. Isolated from `frontend/` and `backend/`. | Inform user. Do not touch without explicit request. |
| **Click Tracking Endpoint** | Backend / Frontend | **Gone** | Neither backend nor frontend contains click tracking code or models. Verified completely absent. | Documented as N/A (no endpoint to keep or delete). |

---

## 3. Test Matrix & Execution Plan

### A. Phase 1: Full-Stack Orchestration
- [x] Configure test database isolated connection (`hijab_world_test`).
- [x] Unify start scripts (`dev:all` / `test:stack`) ensuring parallel execution on ports 3000 and 4001/4000.
- [x] Implement backend health check endpoint `/api/v1/health` with live Prisma DB ping.
- [x] Strict CORS verification: allow only `http://localhost:3000`, reject wildcard `*`.
- [x] End-to-end data flow and failure recovery simulation.

### B. Phase 2: API Contract & Integration
- [x] Product schema validation (`id`, `title`, `slug`, `features`, `colors`, `images`, `category`).
- [x] Query parameter sanitization and search handling.
- [x] Strict HTTP method restriction: ensure POST/PUT/DELETE return 404/405.
- [x] Simulate backend delay, 500 error, and empty DB graceful fallback.

### C. Phase 3: Frontend Automation (Playwright Real Stack)
- [x] Multi-viewport testing (1920, 1440, 1280, 1024, 768, 375px).
- [x] Layout verification: 0px empty gap under header, footer flush to bottom, no horizontal scroll.
- [x] Link integrity: WhatsApp starts with `https://wa.me/918861720050`, Instagram equals `https://www.instagram.com/hijab_worl`.
- [x] Zero email, zero prices, zero admin wording.
- [x] Visual regression baseline generation in `frontend/tests/screenshots/`.
- [x] Axe accessibility audit & Lighthouse performance metrics.

### D. Phase 4: Security Testing (Local Only)
- [x] SQL injection & path traversal fuzzing.
- [x] Client-side bundle secret leakage scanner.
- [x] Rate limiting via Throttler.
- [x] Security headers inspection (CSP, X-Frame-Options, X-Content-Type-Options).
- [x] `npm audit --omit=dev`.
