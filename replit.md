# EV Tribe India — Community Platform

A full-stack community platform for verified Indian EV owners. Built with React + Vite frontend, Express API backend, and PostgreSQL via Drizzle ORM.

## Architecture

```
artifacts/ev-community/   — React + Vite frontend (port from PORT env, preview path: /)
artifacts/api-server/     — Express REST API (port 8080, path prefix: /api)
lib/db/                   — Drizzle ORM schema + client (@workspace/db)
lib/api-spec/             — OpenAPI spec + orval codegen
lib/api-zod/              — Zod schemas generated from OpenAPI
lib/api-client-react/     — React Query hooks generated from OpenAPI
scripts/                  — Utility scripts (seed.ts)
```

## Features

1. **Registration Wizard** — 3-step form capturing all original Google Form fields (personal details, vehicle info, proof of ownership). Submissions enter "pending" state for admin review.
2. **Admin Panel** — Review registrations, approve with custom username/password/blog-toggle, or reject with reason. Accessible at `/admin` (admin role required).
3. **Owner Directory** — Browse approved owners, filter by brand/city/search. Individual profile pages with contact links, cars, blog posts, and gallery.
4. **Community Blog** — Feed with pagination, tags, view counts. Write/edit/delete for owners with blog access enabled by admin.
5. **Range Calculator** — Select from 24 Indian EV models, adjust battery %, driving style, AC usage, terrain. Returns estimated km + efficiency factors + tips.
6. **CPO Contact Sheet** — Charge Point Operators with city/network filters, charger types, phone/WhatsApp/email, operating hours.
7. **Accessories Catalog** — Category-filtered catalog with seller contact, price range, compatible car codes, star ratings.
8. **Community Gallery** — Masonry photo grid. Logged-in owners can add (URL) and delete their own photos.
9. **AI-Powered FAQ Chatbot** — Knowledge-base-driven Q&A with conversation history, suggested questions, 12 seeded articles.
10. **Dashboard** — Stats overview, community car breakdown, pending-registration alert for admins.
11. **Profile Page** — Edit bio, avatar URL, WhatsApp, Telegram. View own vehicle/status/role.

## Auth Flow

- Session-based login (`express-session`). Token stored as `session-{id}` in localStorage.
- Bearer token sent via `Authorization: Bearer session-{id}` header.
- Admin credentials: `username=admin, password=admin123`
- Sample owner credentials: `rahulkumar / priyasharma / amitpatel / sunitareddy / vikramnair`, password: `owner123`

## Database Tables

- `owners` — Members with all registration fields, status (pending/approved/rejected), credentials, role
- `blog_posts` — Posts with author FK, tags array, published flag, view count
- `ev_range_specs` — 24 car models with WLTP/real-world range, battery capacity, charging speed
- `cpos` — Charge point operators with location, charger types, contact details
- `accessories` — Products with category, compatible cars array, seller info, rating
- `gallery_items` — Photos with owner FK, car model, location, caption
- `faq_items` — Q&A knowledge base with car model scoping and categories
- `faq_conversations` — Stored chat history (JSON messages column)

## Running Seed

```bash
pnpm --filter @workspace/scripts run seed
```

## Codegen (API client)

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Key Dependencies

- Frontend: React, Vite, Wouter (routing), TanStack Query, React Hook Form, Zod, shadcn/ui, date-fns
- Backend: Express 5, express-session, bcryptjs, Drizzle ORM, node-postgres, pino
- Shared: OpenAPI → orval → typed React Query hooks + Zod schemas

## EV Car Codes (34 models)

NEV, NEM, N3M, N3L, TiM, TiL, TiG, PuM, PuL, CeM, CeL, HeL, HQL, HeM (Tata),
ZSM, WeM, CoM (MG), ByA3, ByE6, BySL (BYD), KE6, KCC (Kia),
HyK, HyC, Hi5 (Hyundai), X400, BEV6, XE9, E20, E20+, REV (Mahindra),
EQS4, EQB3 (Mercedes), EVit (Suzuki)
