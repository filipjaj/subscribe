# Subscribe MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Norwegian-language landing page and beauty profile onboarding quiz for a beauty/pharmacy subscription app.

**Architecture:** TanStack Start frontend with file-based routing, Hono API on Cloudflare Workers with D1 database, magic link auth via Resend. Multi-step onboarding quiz uses TanStack Form + Zod validation with shadcn/ui components.

**Tech Stack:** TanStack Start, TanStack Form, Zod, Tailwind v4, shadcn/ui (Base UI), Hono, Cloudflare Workers, D1, Resend

**Design doc:** `docs/plans/2026-02-27-subscribe-mvp-design.md`

---

### Task 1: Install dependencies

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/api/package.json`

**Step 1: Install web dependencies**

Run from project root:
```bash
cd apps/web && bun add @tanstack/react-form zod
```

**Step 2: Install API dependencies**

```bash
cd apps/api && bun add resend zod
```

**Step 3: Verify lockfile updated**

Run: `bun install` from root
Expected: Clean install, no errors

**Step 4: Commit**

```bash
git add package.json apps/web/package.json apps/api/package.json bun.lock
git commit -m "deps: add tanstack-form, zod, resend"
```

---

### Task 2: Clean up template scaffolding

Remove the template's example components that we won't need.

**Files:**
- Delete: `apps/web/src/components/component-example.tsx`
- Delete: `apps/web/src/components/example.tsx`
- Modify: `apps/web/src/routes/index.tsx`

**Step 1: Update index route to a placeholder**

Replace `apps/web/src/routes/index.tsx` with:

```tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return <div>Subscribe</div>
}
```

**Step 2: Delete example components**

```bash
rm apps/web/src/components/component-example.tsx apps/web/src/components/example.tsx
```

**Step 3: Verify dev server starts**

```bash
bun run dev:web
```

Expected: App runs on http://localhost:3000 showing "Subscribe"

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove template example components"
```

---

### Task 3: Shared schema and types

Create the shared Zod schema for the beauty profile. This lives in the web app for now (API will use its own validation).

**Files:**
- Create: `apps/web/src/lib/schema.ts`

**Step 1: Create the profile schema**

Create `apps/web/src/lib/schema.ts`:

```ts
import { z } from "zod"

export const SKIN_TYPES = [
  { value: "torr", label: "Tørr" },
  { value: "normal", label: "Normal" },
  { value: "kombinert", label: "Kombinert" },
  { value: "fet", label: "Fet" },
  { value: "sensitiv", label: "Sensitiv" },
] as const

export const HAIR_TYPES = [
  { value: "rett", label: "Rett" },
  { value: "bolgete", label: "Bølgete" },
  { value: "krollete", label: "Krøllete" },
  { value: "afro", label: "Afro" },
  { value: "tynt", label: "Tynt" },
  { value: "tykt", label: "Tykt" },
] as const

export const CONCERNS = [
  { value: "akne", label: "Akne" },
  { value: "torr-hud", label: "Tørr hud" },
  { value: "rynker", label: "Rynker" },
  { value: "pigmentering", label: "Pigmentering" },
  { value: "frizz", label: "Frizz" },
  { value: "tort-har", label: "Tørt hår" },
  { value: "fett-har", label: "Fett hår" },
  { value: "sensitiv-hodebunn", label: "Sensitiv hodebunn" },
] as const

export const CATEGORIES = [
  { value: "hudpleie", label: "Hudpleie" },
  { value: "harpleie", label: "Hårpleie" },
  { value: "sminke", label: "Sminke" },
  { value: "apotek", label: "Apotek & helse" },
  { value: "parfyme", label: "Parfyme" },
] as const

export const profileSchema = z.object({
  skinType: z.enum(["torr", "normal", "kombinert", "fet", "sensitiv"], {
    required_error: "Velg en hudtype",
  }),
  hairType: z.enum(["rett", "bolgete", "krollete", "afro", "tynt", "tykt"], {
    required_error: "Velg en hårtype",
  }),
  concerns: z.array(z.string()).min(1, "Velg minst én bekymring"),
  categories: z.array(z.string()).min(1, "Velg minst én kategori"),
  email: z.string().email("Ugyldig e-postadresse"),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/schema.ts
git commit -m "feat: add profile zod schema and Norwegian option constants"
```

---

### Task 4: Landing page

Build the full landing page with hero, how-it-works, categories, social proof, and footer CTA. All text in Norwegian. Use existing shadcn Button and Card components.

**Files:**
- Create: `apps/web/src/components/landing/hero.tsx`
- Create: `apps/web/src/components/landing/how-it-works.tsx`
- Create: `apps/web/src/components/landing/categories.tsx`
- Create: `apps/web/src/components/landing/social-proof.tsx`
- Create: `apps/web/src/components/landing/footer-cta.tsx`
- Modify: `apps/web/src/routes/index.tsx`

**Step 1: Create Hero component**

Create `apps/web/src/components/landing/hero.tsx`:

```tsx
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Dine favoritter, levert når du trenger dem
      </h1>
      <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl">
        Abonner på skjønnhets- og apotekproduktene du elsker. Vi leverer dem
        hjem til deg, akkurat når du trenger påfyll.
      </p>
      <Button size="lg" render={<Link to="/onboarding" />}>
        Kom i gang
      </Button>
    </section>
  )
}
```

**Step 2: Create How It Works component**

Create `apps/web/src/components/landing/how-it-works.tsx`:

```tsx
export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Fortell oss om deg",
      description: "Svar på noen enkle spørsmål om huden, håret og preferansene dine.",
    },
    {
      number: "2",
      title: "Velg produktene dine",
      description: "Bla gjennom produkter fra Apotek1, Vita, Kicks og flere.",
    },
    {
      number: "3",
      title: "Vi leverer",
      description: "Velg hvor ofte du vil ha påfyll — annenhver uke, månedlig eller sjeldnere.",
    },
  ]

  return (
    <section className="px-4 py-16 sm:py-24">
      <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
        Slik fungerer det
      </h2>
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center gap-3 text-center">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full text-lg font-bold">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

**Step 3: Create Categories component**

Create `apps/web/src/components/landing/categories.tsx`:

```tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

const categories = [
  { title: "Hudpleie", emoji: "\u2728" },
  { title: "Hårpleie", emoji: "\u{1F487}" },
  { title: "Sminke", emoji: "\u{1F484}" },
  { title: "Apotek", emoji: "\u{1F48A}" },
]

export function Categories() {
  return (
    <section className="px-4 py-16 sm:py-24">
      <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
        Kategorier
      </h2>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((cat) => (
          <Card key={cat.title} className="items-center text-center">
            <CardHeader className="items-center">
              <span className="text-4xl">{cat.emoji}</span>
              <CardTitle>{cat.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
```

**Step 4: Create Social Proof component**

Create `apps/web/src/components/landing/social-proof.tsx`:

```tsx
export function SocialProof() {
  return (
    <section className="bg-muted/50 px-4 py-16 text-center sm:py-24">
      <p className="text-muted-foreground text-lg">
        Bli med <span className="text-foreground font-semibold">200+</span> andre
        som allerede har registrert seg
      </p>
    </section>
  )
}
```

**Step 5: Create Footer CTA component**

Create `apps/web/src/components/landing/footer-cta.tsx`:

```tsx
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export function FooterCta() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-16 text-center sm:py-24">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Klar til å komme i gang?
      </h2>
      <p className="text-muted-foreground max-w-md">
        Opprett profilen din på under ett minutt, og finn produktene som passer for deg.
      </p>
      <Button size="lg" render={<Link to="/onboarding" />}>
        Kom i gang
      </Button>
    </section>
  )
}
```

**Step 6: Wire up the landing page route**

Replace `apps/web/src/routes/index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Categories } from "@/components/landing/categories"
import { SocialProof } from "@/components/landing/social-proof"
import { FooterCta } from "@/components/landing/footer-cta"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Categories />
      <SocialProof />
      <FooterCta />
    </main>
  )
}
```

**Step 7: Verify in browser**

Run: `bun run dev:web`
Expected: Landing page renders at http://localhost:3000 with all 5 sections, all text in Norwegian.

**Step 8: Commit**

```bash
git add apps/web/src/components/landing/ apps/web/src/routes/index.tsx
git commit -m "feat: add Norwegian landing page with hero, how-it-works, categories, social proof, footer CTA"
```

---

### Task 5: Onboarding quiz — step UI components

Build the reusable quiz step components: option card selector (single/multi), progress bar, and step layout.

**Files:**
- Create: `apps/web/src/components/onboarding/progress-bar.tsx`
- Create: `apps/web/src/components/onboarding/option-card.tsx`
- Create: `apps/web/src/components/onboarding/step-layout.tsx`

**Step 1: Create ProgressBar**

Create `apps/web/src/components/onboarding/progress-bar.tsx`:

```tsx
interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full">
      <div className="text-muted-foreground mb-2 text-sm">
        Steg {currentStep + 1} av {totalSteps}
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

**Step 2: Create OptionCard**

This is the visual card selector used for single-select and multi-select steps.

Create `apps/web/src/components/onboarding/option-card.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface OptionCardProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function OptionCard({ label, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  )
}
```

**Step 3: Create StepLayout**

Create `apps/web/src/components/onboarding/step-layout.tsx`:

```tsx
import { Button } from "@/components/ui/button"

interface StepLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  showBack?: boolean
  nextDisabled?: boolean
}

export function StepLayout({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = "Neste",
  showBack = true,
  nextDisabled = false,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      <div className="flex gap-3">
        {showBack && onBack && (
          <Button variant="outline" onClick={onBack}>
            Tilbake
          </Button>
        )}
        {onNext && (
          <Button onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add apps/web/src/components/onboarding/
git commit -m "feat: add onboarding UI primitives — progress bar, option card, step layout"
```

---

### Task 6: Onboarding quiz — multi-step form with TanStack Form

Wire up the full 5-step onboarding form using TanStack Form + Zod. Each step validates on "Neste" click. Final step submits email.

**Files:**
- Create: `apps/web/src/components/onboarding/quiz-form.tsx`
- Create: `apps/web/src/routes/onboarding.tsx`

**Step 1: Create the quiz form component**

Create `apps/web/src/components/onboarding/quiz-form.tsx`:

```tsx
"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { z } from "zod"
import { useNavigate } from "@tanstack/react-router"

import { ProgressBar } from "./progress-bar"
import { OptionCard } from "./option-card"
import { StepLayout } from "./step-layout"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  SKIN_TYPES,
  HAIR_TYPES,
  CONCERNS,
  CATEGORIES,
  type ProfileFormValues,
} from "@/lib/schema"
import { api } from "@/lib/api"

const TOTAL_STEPS = 5

// Per-step validation schemas
const stepSchemas = [
  z.object({ skinType: z.string().min(1, "Velg en hudtype") }),
  z.object({ hairType: z.string().min(1, "Velg en hårtype") }),
  z.object({ concerns: z.array(z.string()).min(1, "Velg minst én bekymring") }),
  z.object({ categories: z.array(z.string()).min(1, "Velg minst én kategori") }),
  z.object({ email: z.string().email("Ugyldig e-postadresse") }),
]

export function QuizForm() {
  const [step, setStep] = React.useState(0)
  const [submitted, setSubmitted] = React.useState(false)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      skinType: "",
      hairType: "",
      concerns: [] as string[],
      categories: [] as string[],
      email: "",
    },
    onSubmit: async ({ value }) => {
      // Send magic link + save profile
      await api("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      })
      setSubmitted(true)
    },
  })

  function validateAndNext() {
    const values = form.state.values
    const schema = stepSchemas[step]
    const result = schema.safeParse(values)
    if (result.success) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Sjekk innboksen din</h2>
        <p className="text-muted-foreground max-w-md">
          Vi har sendt en innloggingslenke til{" "}
          <span className="text-foreground font-medium">
            {form.state.values.email}
          </span>
          . Klikk på lenken for å fullføre registreringen.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
      <div className="mt-8">
        {step === 0 && (
          <form.Field
            name="skinType"
            children={(field) => (
              <StepLayout
                title="Hva er hudtypen din?"
                description="Velg det alternativet som passer best."
                onNext={validateAndNext}
                showBack={false}
                nextDisabled={!field.state.value}
              >
                {SKIN_TYPES.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={field.state.value === opt.value}
                    onClick={() => field.handleChange(opt.value)}
                  />
                ))}
              </StepLayout>
            )}
          />
        )}

        {step === 1 && (
          <form.Field
            name="hairType"
            children={(field) => (
              <StepLayout
                title="Hva er hårtypen din?"
                description="Velg det alternativet som passer best."
                onNext={validateAndNext}
                onBack={() => setStep(0)}
                nextDisabled={!field.state.value}
              >
                {HAIR_TYPES.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={field.state.value === opt.value}
                    onClick={() => field.handleChange(opt.value)}
                  />
                ))}
              </StepLayout>
            )}
          />
        )}

        {step === 2 && (
          <form.Field
            name="concerns"
            children={(field) => (
              <StepLayout
                title="Dine bekymringer"
                description="Velg alle som gjelder for deg."
                onNext={validateAndNext}
                onBack={() => setStep(1)}
                nextDisabled={field.state.value.length === 0}
              >
                <div className="grid grid-cols-2 gap-3">
                  {CONCERNS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      selected={field.state.value.includes(opt.value)}
                      onClick={() => {
                        const current = field.state.value
                        field.handleChange(
                          current.includes(opt.value)
                            ? current.filter((v) => v !== opt.value)
                            : [...current, opt.value]
                        )
                      }}
                    />
                  ))}
                </div>
              </StepLayout>
            )}
          />
        )}

        {step === 3 && (
          <form.Field
            name="categories"
            children={(field) => (
              <StepLayout
                title="Hva er du interessert i?"
                description="Velg kategoriene du vil utforske."
                onNext={validateAndNext}
                onBack={() => setStep(2)}
                nextDisabled={field.state.value.length === 0}
              >
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      selected={field.state.value.includes(opt.value)}
                      onClick={() => {
                        const current = field.state.value
                        field.handleChange(
                          current.includes(opt.value)
                            ? current.filter((v) => v !== opt.value)
                            : [...current, opt.value]
                        )
                      }}
                    />
                  ))}
                </div>
              </StepLayout>
            )}
          />
        )}

        {step === 4 && (
          <form.Field
            name="email"
            children={(field) => (
              <StepLayout
                title="Opprett konto"
                description="Skriv inn e-posten din, så sender vi deg en innloggingslenke."
                onNext={() => form.handleSubmit()}
                onBack={() => setStep(3)}
                nextLabel="Opprett konto"
                nextDisabled={!field.state.value || form.state.isSubmitting}
              >
                <Field>
                  <FieldLabel htmlFor="email">E-post</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@epost.no"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </Field>
              </StepLayout>
            )}
          />
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create the onboarding route**

Create `apps/web/src/routes/onboarding.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { QuizForm } from "@/components/onboarding/quiz-form"

export const Route = createFileRoute("/onboarding")({ component: Onboarding })

function Onboarding() {
  return (
    <main className="min-h-screen px-4 py-12">
      <QuizForm />
    </main>
  )
}
```

**Step 3: Verify in browser**

Run: `bun run dev:web`
Navigate to http://localhost:3000/onboarding
Expected: 5-step quiz renders, navigation works, form state persists between steps.

**Step 4: Commit**

```bash
git add apps/web/src/components/onboarding/quiz-form.tsx apps/web/src/routes/onboarding.tsx
git commit -m "feat: add 5-step onboarding quiz with TanStack Form"
```

---

### Task 7: API — D1 database setup and schema migration

Set up Cloudflare D1 database binding and create the schema migration.

**Files:**
- Modify: `apps/api/wrangler.jsonc`
- Create: `apps/api/migrations/0001_initial_schema.sql`
- Modify: `apps/api/src/index.ts` (update Bindings type)

**Step 1: Add D1 binding to wrangler config**

Replace `apps/api/wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "api",
  "main": "src/index.ts",
  "compatibility_date": "2026-02-10",
  "compatibility_flags": ["nodejs_compat"],
  "dev": {
    "port": 8787
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "subscribe-db",
      "database_id": "local"
    }
  ]
}
```

Note: `database_id` should be replaced with a real ID after running `wrangler d1 create subscribe-db` for production. For local dev, wrangler creates a local SQLite database automatically.

**Step 2: Create the migration file**

Create `apps/api/migrations/0001_initial_schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  skin_type TEXT,
  hair_type TEXT,
  concerns TEXT,
  categories TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS magic_links (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
```

**Step 3: Update Bindings type**

In `apps/api/src/index.ts`, update the Bindings type:

```ts
type Bindings = {
  DB: D1Database;
  RESEND_API_KEY: string;
  MAGIC_LINK_BASE_URL: string;
};
```

**Step 4: Run the migration locally**

```bash
cd apps/api && npx wrangler d1 migrations apply subscribe-db --local
```

Expected: Migration applies successfully.

**Step 5: Commit**

```bash
git add apps/api/wrangler.jsonc apps/api/migrations/ apps/api/src/index.ts
git commit -m "feat: add D1 database schema — users, profiles, magic_links"
```

---

### Task 8: API — magic link auth endpoints

Build the magic link auth flow: send link, verify token, create session.

**Files:**
- Create: `apps/api/src/auth.ts`
- Modify: `apps/api/src/index.ts` (mount auth routes)

**Step 1: Create auth module**

Create `apps/api/src/auth.ts`:

```ts
import { Hono } from "hono"
import { setCookie } from "hono/cookie"

type Bindings = {
  DB: D1Database
  RESEND_API_KEY: string
  MAGIC_LINK_BASE_URL: string
}

const auth = new Hono<{ Bindings: Bindings }>()

function generateId(): string {
  return crypto.randomUUID()
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

auth.post("/magic-link", async (c) => {
  const { email, skinType, hairType, concerns, categories } = await c.req.json()

  if (!email) {
    return c.json({ error: "E-post er påkrevd" }, 400)
  }

  // Create or find user
  let user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string }>()

  if (!user) {
    const userId = generateId()
    await c.env.DB.prepare("INSERT INTO users (id, email) VALUES (?, ?)")
      .bind(userId, email)
      .run()
    user = { id: userId }
  }

  // Save/update profile
  const existingProfile = await c.env.DB.prepare(
    "SELECT id FROM profiles WHERE user_id = ?"
  )
    .bind(user.id)
    .first()

  if (existingProfile) {
    await c.env.DB.prepare(
      "UPDATE profiles SET skin_type = ?, hair_type = ?, concerns = ?, categories = ?, updated_at = datetime('now') WHERE user_id = ?"
    )
      .bind(skinType, hairType, JSON.stringify(concerns), JSON.stringify(categories), user.id)
      .run()
  } else {
    await c.env.DB.prepare(
      "INSERT INTO profiles (id, user_id, skin_type, hair_type, concerns, categories) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(generateId(), user.id, skinType, hairType, JSON.stringify(concerns), JSON.stringify(categories))
      .run()
  }

  // Create magic link
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

  await c.env.DB.prepare(
    "INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)"
  )
    .bind(token, email, expiresAt)
    .run()

  // Send email via Resend
  const magicLinkUrl = `${c.env.MAGIC_LINK_BASE_URL}/api/auth/verify?token=${token}`

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Subscribe <noreply@subscribe.no>",
      to: [email],
      subject: "Logg inn på Subscribe",
      html: `<p>Hei!</p><p>Klikk <a href="${magicLinkUrl}">her for å logge inn</a>.</p><p>Lenken utløper om 15 minutter.</p>`,
    }),
  })

  return c.json({ ok: true })
})

auth.get("/verify", async (c) => {
  const token = c.req.query("token")

  if (!token) {
    return c.json({ error: "Token mangler" }, 400)
  }

  const link = await c.env.DB.prepare(
    "SELECT email, expires_at, used FROM magic_links WHERE token = ?"
  )
    .bind(token)
    .first<{ email: string; expires_at: string; used: number }>()

  if (!link) {
    return c.json({ error: "Ugyldig lenke" }, 400)
  }

  if (link.used) {
    return c.json({ error: "Lenken er allerede brukt" }, 400)
  }

  if (new Date(link.expires_at) < new Date()) {
    return c.json({ error: "Lenken har utløpt" }, 400)
  }

  // Mark as used
  await c.env.DB.prepare("UPDATE magic_links SET used = 1 WHERE token = ?")
    .bind(token)
    .run()

  // Get user
  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(link.email)
    .first<{ id: string }>()

  if (!user) {
    return c.json({ error: "Bruker ikke funnet" }, 400)
  }

  // Set session cookie
  const sessionToken = generateToken()
  setCookie(c, "session", `${user.id}:${sessionToken}`, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  // Redirect to confirmation page
  return c.redirect(`${c.env.MAGIC_LINK_BASE_URL}/bekreftelse`)
})

export { auth }
```

**Step 2: Mount auth routes in main app**

Update `apps/api/src/index.ts`:

```ts
import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "./auth"

type Bindings = {
  DB: D1Database
  RESEND_API_KEY: string
  MAGIC_LINK_BASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
)

app.get("/api/health", (c) => {
  return c.json({ status: "ok" })
})

app.route("/api/auth", auth)

export default app
```

**Step 3: Create .dev.vars for local secrets**

Create `apps/api/.dev.vars`:

```
RESEND_API_KEY=re_your_key_here
MAGIC_LINK_BASE_URL=http://localhost:3000
```

Note: `.dev.vars` is already in `.gitignore`.

**Step 4: Verify API starts**

```bash
bun run dev:api
```

Expected: API starts on http://localhost:8787

**Step 5: Commit**

```bash
git add apps/api/src/auth.ts apps/api/src/index.ts
git commit -m "feat: add magic link auth endpoints — send link, verify token, set session"
```

---

### Task 9: API — profile endpoint

Add a GET endpoint to retrieve the user's profile (used by the confirmation page).

**Files:**
- Create: `apps/api/src/profiles.ts`
- Modify: `apps/api/src/index.ts` (mount profile routes)

**Step 1: Create profiles module**

Create `apps/api/src/profiles.ts`:

```ts
import { Hono } from "hono"
import { getCookie } from "hono/cookie"

type Bindings = {
  DB: D1Database
}

const profiles = new Hono<{ Bindings: Bindings }>()

profiles.get("/:id", async (c) => {
  const userId = c.req.param("id")

  const profile = await c.env.DB.prepare(
    "SELECT p.*, u.email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?"
  )
    .bind(userId)
    .first()

  if (!profile) {
    return c.json({ error: "Profil ikke funnet" }, 404)
  }

  return c.json({
    ...profile,
    concerns: JSON.parse(profile.concerns as string),
    categories: JSON.parse(profile.categories as string),
  })
})

export { profiles }
```

**Step 2: Mount in main app**

Add to `apps/api/src/index.ts` after the auth route:

```ts
import { profiles } from "./profiles"
// ... existing code ...
app.route("/api/profiles", profiles)
```

**Step 3: Commit**

```bash
git add apps/api/src/profiles.ts apps/api/src/index.ts
git commit -m "feat: add profile GET endpoint"
```

---

### Task 10: Confirmation page

Build the `/bekreftelse` route that shows after magic link verification.

**Files:**
- Create: `apps/web/src/routes/bekreftelse.tsx`

**Step 1: Create confirmation route**

Create `apps/web/src/routes/bekreftelse.tsx`:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/bekreftelse")({ component: Confirmation })

function Confirmation() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Profilen din er klar!</CardTitle>
          <CardDescription>
            Vi jobber med å finne de beste produktene for deg.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Badge variant="secondary">Du blir varslet når produktene er klare</Badge>
          <Button variant="outline" render={<Link to="/" />}>
            Tilbake til forsiden
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
```

**Step 2: Verify in browser**

Navigate to http://localhost:3000/bekreftelse
Expected: Confirmation card renders with Norwegian text.

**Step 3: Commit**

```bash
git add apps/web/src/routes/bekreftelse.tsx
git commit -m "feat: add confirmation page after magic link verification"
```

---

### Task 11: Update root layout

Update the root layout with proper Norwegian meta tags and remove the TanStack branding.

**Files:**
- Modify: `apps/web/src/routes/__root.tsx`

**Step 1: Update root route**

Replace `apps/web/src/routes/__root.tsx`:

```tsx
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"

import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Subscribe — Dine favoritter, levert når du trenger dem" },
      {
        name: "description",
        content:
          "Abonner på skjønnhets- og apotekproduktene du elsker. Levert hjem til deg, akkurat når du trenger påfyll.",
      },
      { property: "og:locale", content: "nb_NO" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <head>
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/__root.tsx
git commit -m "feat: update root layout with Norwegian meta tags, remove devtools"
```

---

### Task 12: Final verification and push

**Step 1: Run the full dev environment**

```bash
bun install && bun run dev
```

Expected: Both API (8787) and web (3000) start.

**Step 2: Manual smoke test**

1. Visit http://localhost:3000 — landing page with 5 sections, all Norwegian
2. Click "Kom i gang" — navigates to /onboarding
3. Complete all 5 quiz steps — form state persists, back button works
4. Enter email on step 5 — submits to API (will fail if Resend not configured, that's ok)
5. Visit http://localhost:3000/bekreftelse — confirmation page shows

**Step 3: Push to remote**

```bash
git push origin main
```
