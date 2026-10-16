# Hijab World – Monorepo

Showcase website and protected admin management portal for **Hijab World**.

## Project Architecture
- `backend/`: NestJS REST API with PostgreSQL, Prisma ORM, JWT authentication, class-validator, Swagger (`/api/docs`), and Cloudinary upload support.
- `frontend/`: Next.js 14+ (App Router), TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod, mobile-first haute modesty atelier design.
- `docker-compose.yml`: Local PostgreSQL 16 container.
- `legacy_prototype/`: Preserved lightweight Express prototype.

## Quick Start

### 1. Database
```bash
docker compose up -d
```

### 2. Backend (NestJS)
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```
Backend API will be running on `http://localhost:4000/api/v1`
Swagger API documentation at `http://localhost:4000/api/docs`

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running on `http://localhost:3000`
