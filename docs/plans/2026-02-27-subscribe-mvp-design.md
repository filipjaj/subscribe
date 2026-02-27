# Subscribe MVP Design — Landing + Onboarding

**Date:** 2026-02-27
**Approach:** Landing-First (Phase 1)
**Language:** Norwegian (all user-facing text)

## Overview

Subscribe is a beauty & pharmacy subscription app targeting Norwegian women. Users create a beauty profile, browse products scraped from retailers (Apotek1, Vita, Kicks, Coverbrands), and subscribe to individual products at flexible intervals.

Phase 1 focuses on the landing page and onboarding quiz to validate interest and collect user profiles before building the product catalog.

## Landing Page

**Route:** `/`

Sections top to bottom:

1. **Hero** — visual, full-width. Headline: "Dine favoritter, levert når du trenger dem". CTA: "Kom i gang" → navigates to onboarding.
2. **How it works** — 3 icon steps: Fortell oss om deg → Velg produktene dine → Vi leverer.
3. **Categories preview** — visual cards: Hudpleie, Hårpleie, Sminke, Apotek. Non-interactive, sets expectations.
4. **Social proof** — placeholder. "Bli med X andre" or testimonials later.
5. **Footer CTA** — repeat "Kom i gang" button.

**Design:** Clean, feminine. Soft muted pinks, creams, warm neutrals. Leveraging the existing oklch warm-tone shadcn theme.

## Onboarding Quiz

**Route:** `/onboarding`

Multi-step form, one question per screen, progress bar at top. 5 steps:

| Step | Question | Type | Options |
|------|----------|------|---------|
| 1 | Hudtype (Skin type) | Single select | Tørr, Normal, Kombinert, Fet, Sensitiv |
| 2 | Hårtype (Hair type) | Single select | Rett, Bølgete, Krøllete, Afro, Tynt, Tykt |
| 3 | Dine bekymringer (Concerns) | Multi-select | Akne, Tørr hud, Rynker, Pigmentering, Frizz, Tørt hår, Fett hår, Sensitiv hodebunn |
| 4 | Kategorier (Categories) | Multi-select | Hudpleie, Hårpleie, Sminke, Apotek & helse, Parfyme |
| 5 | E-post (Email) | Text input | Email + "Opprett konto" CTA |

After email submission: "Sjekk innboksen din for å logge inn" screen.
After auth: redirect to `/bekreftelse` — profile confirmation with "Vi jobber med å finne de beste produktene for deg" message.

UI: Visual card selectors (not dropdowns). Chip/badge style for multi-select. Animated step transitions.

### Form Handling

**TanStack Form** (`@tanstack/react-form`) with **Zod** validation, using shadcn/ui's `Field`, `FieldLabel`, `FieldError` components.

```tsx
// Pattern: form.Field render prop + shadcn Field wrapper
<form.Field
  name="skinType"
  children={(field) => (
    <Field data-invalid={field.state.meta.errors.length > 0}>
      <FieldLabel>Hudtype</FieldLabel>
      {/* Visual card selector */}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
/>
```

Zod schema for the full profile:

```ts
const profileSchema = z.object({
  skinType: z.enum(["torr", "normal", "kombinert", "fet", "sensitiv"]),
  hairType: z.enum(["rett", "bolgete", "krollete", "afro", "tynt", "tykt"]),
  concerns: z.array(z.string()).min(1, "Velg minst én bekymring"),
  categories: z.array(z.string()).min(1, "Velg minst én kategori"),
  email: z.string().email("Ugyldig e-postadresse"),
})
```

Multi-step state is managed by TanStack Form across all steps — single form instance, validated per-step on navigation, full validation on final submit.

## Architecture

### Frontend (apps/web — TanStack Start)

Routes:
- `/` — Landing page
- `/onboarding` — Multi-step beauty quiz (TanStack Form + Zod)
- `/bekreftelse` — Profile confirmation after magic link auth

Dependencies to add:
- `@tanstack/react-form`
- `zod`

### API (apps/api — Hono on Cloudflare Workers)

Endpoints:
- `POST /api/auth/magic-link` — send magic link email
- `GET /api/auth/verify?token=...` — verify token, create session
- `POST /api/profiles` — create/update beauty profile
- `GET /api/profiles/:id` — get user profile

### Database (Cloudflare D1)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  skin_type TEXT,
  hair_type TEXT,
  concerns TEXT, -- JSON array
  categories TEXT, -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE magic_links (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
```

### Email Delivery

Resend API (free tier: 100 emails/day).

### Auth Flow

1. User submits email → API creates magic link token, sends email via Resend
2. User clicks link → API verifies token, creates user if new, sets HTTP-only session cookie
3. Subsequent requests authenticated via cookie

## Subscription Intervals (Phase 2)

Per-product intervals: Hver 2. uke / Hver måned / Hver 2. måned / Hver 3. måned.

## Out of Scope (Phase 1)

- Product scraping and catalog
- Subscription management / cart
- Payment processing
- User dashboard
- Product recommendations based on profile
