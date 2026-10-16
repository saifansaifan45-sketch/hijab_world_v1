# Hijab World – Build Blueprint

## 1. What we are building (and what we are not)
Hijab World needs two things: a public website where customers see the products and services, read about the business, and tap a button to reach the owner on WhatsApp, Instagram, other social media or email; and a protected admin panel where the owner or staff add products, post announcements and see how customers are getting in touch. Nothing is bought on the site.

### Scope Table
| In scope (build this) | Out of scope (do NOT build) |
|---|---|
| Public pages: Home, Products, Product detail, Services, About, Contact | Customer accounts or customer login |
| WhatsApp, Instagram, Facebook, TikTok, YouTube, email and phone links | Cart, checkout, payments, orders |
| Floating WhatsApp button and an Ask on WhatsApp button on every product | Prices on the public site |
| Admin panel with login for the owner and staff: products, categories, services, announcements, site settings, staff users | Contact form that stores customer names or phone numbers |
| Anonymous tracking of contact clicks, with a dashboard in the admin panel | Redis, queues, webhooks, push notifications |

## 2. Architecture at a glance
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide & React Icons.
- **Backend**: NestJS REST API (`/api/v1`), PostgreSQL 16 with Prisma ORM, JWT + cookie-based refresh, argon2 hashing, Swagger at `/api/docs`.
- **Database**: PostgreSQL 16.
- **Media**: Cloudinary for images.
- **Contract**: OpenAPI specification from NestJS.
