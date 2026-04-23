# High Priority
- [x] Offer flow:
    - [x] When buyer submits offer, create pending offer and notify seller
    - [x] Seller can accept or decline offer; if accepted, allow seller and buyer to chat (later create escrow transaction) and notify buyer
    - [x] Buyer can withdraw offer if it's still pending
    - [x] Buyer should be able to choose how many tickets in their offer (currently hardcoded to 1)
    - [x] Seller can choose how many tickets can be sold (for example don't leave me with 1 ticket if I have 4 to sell)
    - [x] Don't allow buyer to submit multiple offers on the same listing unless they withdraw the previous one
    - [x] Once offer is accepted, deduct the sold quantity from the listing and update status to pending if there are still tickets available, or sold if all tickets are sold, and remove it from the browse page
    - [ ] Show currency on price
    - [ ] Remove cascade delete on listings. Listings should not be deletable, only updatable to "cancelled" status. This way we preserve offer and review history even if a listing is cancelled.
    - [ ] If user has no reviews, dont show as 0 stars — show "No reviews yet" or something instead
    - [ ] Add option for seller to make a counteroffer to the buyer's offer
    - [ ] Messaging flow: users must sign in with at least one contact method (WhatsApp, Facebook, or both)
    - [ ] Messaging flow: allow sellers to choose whether buyers can message before an offer is received
    - [ ] Messaging flow: once an offer is accepted, enable seller and buyer communication
- [x] Use 21st.dev to redesign the browse page and listing detail page
- [x] Browse tickets button is bigger than sell tickets button on home page, should be equal size
- [x] Redesign UI
- [x] Show offers submitted and received
- [x] Remove all API keys from code, and use environment variables instead. Add instructions in README for setting up .env file.
- [x] Add more tests for critical flows (creating listing, making offer, accepting offer, etc.)
- [x] Add loading states for all async actions (fetching listings, submitting offers, etc.)
- [x] Add error handling and display error messages to users when API calls fail
- [x] Move test files to a __tests__ directory for better organization

## Bugs (from audit)
- [ ] ProfilePage: sellers only see `available` listings — `filters?.status !== undefined` guard fires wrong branch when status key exists but is `undefined` (useListings.ts)
- [ ] MatchSearch "Change" button is broken — passes current match back to `onSelect`, input never reappears (MatchSearch.tsx)
- [ ] EscrowTracker.updateStatus silently swallows DB errors — Supabase returns `{error}`, not throws; success toast fires even on failure
- [ ] Double toast on mutation errors — global QueryClient.onError + per-mutation catch blocks in CreateListingPage, OfferModal, ProfilePage both toast on error
- [ ] ListingDetailPage: offer status chips only handle `pending`/`accepted`; `countered`, `withdrawn`, `completed`, `declined` all render red
- [ ] AuthCallbackPage: `onAuthStateChange` subscription created but never unsubscribed in cleanup
- [ ] `offersReceived` query refetches every render — queryKey includes full `myListings` array (new reference each render) in ProfilePage
- [ ] OfferModal: `makeSchema` not memoized — new Zod schema created every render
- [ ] HomePage missing "3rd Place" in stage tiles — `STAGES` array omits `3RD`; BrowsePage includes it
- [ ] `escrow_transactions` not auto-created on offer acceptance — `handle_offer_accepted` trigger updates listing status but never inserts an escrow row; escrow tab always empty

## Security (from audit)
- [ ] Open redirect via `CONTACT_URLS.facebook` — `info.startsWith('http') ? info : ...` lets sellers set any arbitrary URL as contact info (utils.ts)
- [ ] PostgREST filter injection in `useMatches` — user input directly interpolated into `.or(...)` string; use chained `.ilike()` instead
- [ ] Mailpit dev URL (`localhost:54324`) hardcoded and visible in production sign-in modal (LoginModal.tsx)
- [ ] Escrow status transitions enforced only in UI — RLS policy allows buyer to set `status = 'completed'` directly, bypassing seller confirmation

## Type issues (from audit)
- [ ] `hooks/useAuth.tsx` is a full duplicate implementation, not a re-export — components importing from this path get context `undefined` and will throw at runtime; should re-export from `contexts/AuthContext`
- [ ] `AnyListing = any` / `AnyOffer = any` — all query return types are `any`, nullifying TypeScript safety (useListings.ts, useOffers.ts)
- [ ] `as never` casts on Supabase inserts/updates mask legitimate type mismatches
- [ ] `offers.status` typed as `string | null` — should be a union of valid status literals

## Inconsistencies (from audit)
- [ ] `getContactLink` duplicated in ListingDetailPage vs utils.ts — they diverge on Facebook URL handling
- [ ] `STAGE_LABELS` duplicated in utils.ts and MatchBadge.tsx — one source of truth needed
- [ ] `setLoading(false)` races with async `loadProfile` in AuthContext — brief window where `loading=false` but `profile=null`
- [ ] ProfilePage: action buttons rendered in a separate unaligned grid, not under their respective listing cards
- [ ] `seed:db` script in package.json runs `supabase db reset` (wipes all data) — name is misleading and dangerous

# Medium Priority
- [ ] Add pagination or infinite scroll to browse page
- [ ] Setup Oauth with Google and Facebook for easier authentication
- [ ] Add listing edit page — pencil icon in ProfilePage navigates to read-only detail page; no edit form exists
- [ ] `buyer_read_at` column never written — unread badge on bell icon never clears after user views offers
- [ ] Add review submission UI — `reviews` table + RLS exist; frontend only shows received reviews, no way to submit
- [ ] Price filter labeled "USD" but compares raw numbers across currencies — MXN 100 passes a "min $100 USD" filter (BrowsePage)
- [ ] BrowsePage date filter: string vs TIMESTAMPTZ comparison is lexicographic and timezone-unaware
- [ ] "Sign in to make an offer" navigates to `/` instead of triggering the login modal (ListingDetailPage)
- [ ] EscrowTracker progress bar connectors visually broken — `left-1/2 w-full` creates floating half-lines, not connecting step circles
- [ ] Add delete confirmation dialog — single click on trash icon immediately deletes a listing with no confirmation
- [ ] All delete buttons share one `isPending` state — any in-flight delete disables every delete button (ProfilePage)
- [ ] "How It Works" step 3 claims funds are held in escrow — no real money integration; misleading to users (HomePage)