# AGENTS.md — WC Tickets 2026

Coding standards and guidelines for AI agents editing this repo.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Vite 5 + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first, no tailwind.config theme) |
| Components | shadcn/ui base-nova style (`@base-ui/react`, NOT Radix UI) |
| DB / Auth | Supabase local (PostgreSQL + RLS) |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod v4 |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Icons | Lucide React |

---

## Project Structure

```
src/
  components/
    auth/        # LoginModal
    layout/      # Header, Footer, Layout (outlet-based)
    listings/    # ListingCard, ListingGrid
    matches/     # MatchBadge, MatchSearch
    offers/      # OfferModal, EscrowTracker
    ui/          # shadcn/ui primitives
  contexts/
    AuthContext.tsx   # AuthProvider + useAuth (canonical)
  hooks/
    useAuth.tsx       # Re-exports from AuthContext (compat)
    useListings.ts
    useMatches.ts
    useOffers.ts
  lib/
    database.types.ts # Supabase TypeScript types (manual)
    supabase.ts       # Typed Supabase client
    utils.ts          # Utilities + constants
  pages/
    HomePage.tsx
    BrowsePage.tsx
    ListingDetailPage.tsx
    CreateListingPage.tsx
    ProfilePage.tsx
    AuthCallbackPage.tsx
  App.tsx             # Root router
  index.css           # Tailwind v4 + WC theme tokens
supabase/
  migrations/         # SQL migrations — apply with psql, NOT supabase db reset
  seed.sql            # 104 WC 2026 matches
```

---

## Critical Rules

### Tailwind CSS v4
- Config is **CSS-first** in `src/index.css` with `@theme inline { ... }`
- Do **NOT** add theme values to `tailwind.config.js` — that file is mostly empty by design
- Custom WC colors: `wc-red`, `wc-blue`, `wc-gold`, `wc-red-dark`, `wc-blue-dark`
- Custom gradients: `bg-wc-gradient` (hero), `bg-wc-hero`

### shadcn/ui base-nova (IMPORTANT)
- Uses `@base-ui/react` primitives — NOT Radix UI
- **`<Button asChild>` does NOT exist**. Use `<Link className={cn(buttonVariants({variant, size}))}>` instead
- **`<SheetTrigger asChild>` does NOT exist**. Remove `asChild` from SheetTrigger
- **Select `onValueChange`** signature: `(value: string | null, eventDetails) => void` — always guard null: `(v) => setState(v ?? '')`

### Zod v4
- `.positive('msg')` syntax removed → use `.positive({ message: 'msg' })`
- `invalid_type_error` removed → use `error: 'msg'`

### Supabase TypeScript
- Joined queries return `never` if typed naively. Use `as unknown as MyType[]` or explicit return types on `queryFn`
- For `.update()` with status strings, cast: `update({ status } as any)`
- Schema: `listings.row_label` (not `row_name`). Contact info is on `profiles`, not `listings`
- `profiles` has NO `verified` field
- Auth context: import from `@/contexts/AuthContext` (canonical). `@/hooks/useAuth` re-exports it

### Auth
- OAuth providers: Facebook + Google
- Supabase redirect URL: `http://localhost:5173/auth/callback`
- Profile auto-created on signup via DB trigger `handle_new_user()`

### Routing
- `/` → HomePage
- `/browse` → BrowsePage
- `/listing/:id` → ListingDetailPage
- `/sell` → CreateListingPage
- `/profile` → ProfilePage
- `/auth/callback` → AuthCallbackPage

---

## Database

### ⚠️ Migration Rules — READ FIRST
**NEVER run `supabase db reset` unless it is the absolute only option** — it wipes all data.

To apply a new migration:
```bash
# Apply a single migration file directly (preferred — preserves data)
docker exec supabase_db_wc-tickets-2026 psql -U postgres -d postgres \
  -f /path/to/supabase/migrations/YYYYMMDD_name.sql

# Or pipe inline SQL
docker exec supabase_db_wc-tickets-2026 psql -U postgres -d postgres \
  -c "ALTER TABLE foo ADD COLUMN bar text;"

# supabase db push can also apply pending migrations without resetting
npx supabase db push
```

`supabase db reset` is only acceptable when:
- Setting up a brand-new local environment from scratch
- Explicitly asked by the user

### Local Dev
```bash
npx supabase start        # start containers
npx supabase stop         # stop containers
# To apply new migrations, use docker exec psql (see above)
```

### Schema Summary
- `matches` — 104 WC 2026 fixtures (read-only seed)
- `profiles` — auto-created on auth signup; has `contact_preference`, `contact_info`
- `listings` — ticket listings with `status: available | pending | sold`
- `offers` — buyer offers with `status: pending | countered | accepted | declined | withdrawn | completed`
- `escrow_transactions` — created on offer acceptance; tracks handoff flow
- `reviews` — post-transaction reviews

### RLS
All tables have RLS enabled. Public can read `matches` and `available` listings. Mutations require auth. Sellers own their listings/offers. See migration for full policies.

---

## WC 2026 Theme Colors

| Token | Hex | Usage |
|---|---|---|
| `wc-red` | `#E30613` | Primary CTA, accents |
| `wc-blue` | `#0033A0` | Nav, secondary elements |
| `wc-gold` | `#F0A500` | Highlights, badges |
| `wc-red-dark` | `#B8000F` | Hover states |
| `wc-blue-dark` | `#002080` | Hover states |

---

## Dev Workflow

```bash
npm run dev       # start dev server (port 5173)
npm run build     # TypeScript check + production build
npm run lint      # ESLint
```

Always run `npm run build` before committing to catch TS errors.

---

## Feature Scope (v1)

- Sellers list tickets (match, section, row, seat, category, price, currency)
- Buyers browse + filter (stage, category, price, currency, text search)
- Buyers make offers; sellers accept/decline
- Accepted offer → escrow tracking flow (trust layer, no real money)
- Contact via external links (WhatsApp, Facebook, email, Instagram)
- Mark listing as sold
- Reviews after transaction

## Out of Scope (v1)
- Real payment processing
- On-site chat
- Ticket authenticity verification
- Mobile app

---

## Caveman Mode (Always-On)

Copilot agent: terse output. Technical substance exact. Only fluff die.

Drop: articles, filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Code unchanged.
Pattern: `[thing] [action] [reason]. [next step].`

**ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift.**

Override only: code/commits/PRs (write normal). Off only: "stop caveman" / "normal mode".
