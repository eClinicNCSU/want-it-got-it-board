# Wanted / Got It Board — Project Plan

A live board for the NC State Entrepreneurship Garage. Students post cards in one of
two categories:

- **Wanted** — skills or people they're looking for ("Looking for a software engineer").
- **Got It** — skills they offer ("I'm a software engineer").

The board is displayed on an always-on TV in the garage. Students submit from their own
phones by scanning a QR code. New cards appear on the TV live after admin approval.

---

## Decisions locked in

| Decision | Choice | Consequence |
|---|---|---|
| **Submission** | Phone via QR code | TV is a pure display (works with a non-touch TV). Phones load a submit form. |
| **Auth** | Open / no login | Lowest friction. Shifts safety burden onto the approval queue. |
| **Moderation** | Pre-approval queue | Nothing hits the TV until an admin approves. Catches spam + abuse. |
| **Connecting** | Scan-to-reveal contact | No personal info shown on the public TV. Contact revealed privately on the viewer's phone. |
| **Lifecycle** | Cards expire after 30 days | Board query filters out expired cards; admin has a manual "clear board" action. |
| **Tags** | Fixed pick-list (multiple) + free-text "Other" fallback | Cleaner + filterable; escape hatch for missing categories. Custom tags vetted via the approval queue. |
| **Scale** | ~20 cards/month, permanent | ~20 live cards at a time. Free tier indefinitely. Keep admin tooling simple + code maintainable. |
| **Branding** | No official NC State marks | Dark glassmorphic UI per mockup; neutral red/green/purple palette. |
| **Surfaces** | TV (display) + iPad (touch) + phone (scan) | iPad hosts filtering & card taps; TV stays browse-only. |
| **Card status** | Poster gets a private manage link | PAID/DEADLINE set at submit; poster marks CLAIMED / edits via a no-login secret link. |
| **Reveal** | Per-card QR + shared iPad | Scan a card's QR onto your own phone, or tap it on the iPad. |

## Visual design (from mockup, 2026-07-31)

Dark, glassmorphic, high-contrast for legibility across a room. Background gradient runs
red (Wanted / left) → green (Got It / right) → purple (bottom).

- **Header:** "Wanted & Got It" + "NC State Entrepreneurship Garage" on a gradient pill.
  Right side: live **Wanted count** (red) · **Got It count** (green) · **clock**.
- **Filter bar:** "FILTER" + friendly bucket buttons — Everything (default) · Code · Design ·
  Build · Business · Everything else. Active button is a solid white pill.
- **Two columns:** "Wanted — what people are looking for" (red glow) and
  "Got it — what people can do" (green glow).
- **Card:** title · description · granular colored tag pills · divider · footer =
  initials avatar + name + "major 'gradyear" + time-ago. Top-right corner: status badge.
- **Status badges:** `NEW` (green), `DEADLINE` (red), `PAID` (yellow), `CLAIMED` (gray).
  Claimed cards render dimmed.
- Palette is neutral brand colors (no official NC State marks), per earlier decision.

### Data-model additions from the mockup

- `author_major`, `author_grad_year` (shown in footer)
- `is_paid` (boolean → PAID badge; poster-set at submit)
- `deadline` (nullable date → DEADLINE badge; poster-set at submit)
- `status` extended: `pending` | `approved` | `claimed` | `hidden` (claimed = dimmed)
- `NEW` badge is derived (e.g. approved within last 24h), not stored
- Granular `tags[]` on the card + a coarse **filter bucket** for the filter bar (see below)

## Architecture

### Surfaces

| Surface | Role | Interaction |
|---|---|---|
| **TV** | Always-on display, read from across the room | None — auto-updating, shows "Everything" |
| **iPad (by the TV)** | Touch twin: browse, filter, tap a card to reveal contact, post | Full touch |
| **Personal phone** | Scan submit QR to post; scan a card's QR to save contact privately | Scan |

- **Frontend:** React + Vite. Views sharing one data layer:
  - **Board view** (`/`) — what the **TV** loads once and leaves running. Two columns
    (Wanted / Got It), large type, live counts + clock, auto-updates in real time. Also the
    base for the **iPad**, where the filter bar and card taps are interactive.
  - **Submit view** (`/submit`) — the form reached via the submit QR (phone) or a "Post" button
    on the iPad. On confirm, the poster gets a private **manage link**.
  - **Manage view** (`/m/:token`) — poster's no-login link to mark their card CLAIMED or edit it.
  - **Admin view** (`/admin`) — approval queue + hide/remove + re-bucket custom tags +
    "clear board". Password-gated.
  - **Reveal view** (`/c/:id`) — scan a card's QR to reveal that poster's contact privately.
- **Backend / DB / realtime:** Supabase (hosted Postgres + realtime subscriptions + storage).
  New approved cards push to the TV instantly with almost no backend code.
- **Hosting:** Vercel or Netlify (frontend) + Supabase (data). Free tier, deploy from Git.

### Data model (draft)

`cards`
- `id` (uuid)
- `type` — `wanted` | `got_it`
- `title`, `description`
- `tags[]`
- `author_name`
- `contact` — **private**; never returned to the public board query
- `status` — `pending` | `approved` | `hidden`
- `created_at`, `expires_at`

### Privacy / security notes

- **Row-level security** so the public board query cannot return `contact` — enforced in the
  database, not just hidden in the frontend.
- Contact is exposed only through the **reveal endpoint** (`/c/:id`), scanned from an approved
  card. No account needed to be contacted.
- Approval queue is the single choke point protecting the public screen.

## Tag taxonomy (proposed starter set — needs confirmation)

Students pick one or more from a fixed list. Proposed:

- Software / Engineering
- Product / Design (UX/UI)
- Data / AI
- Hardware / Prototyping
- Marketing / Social
- Business / Strategy
- Finance / Fundraising
- Sales / BizDev
- Legal / IP
- Operations
- Science / Bio
- Co-founder

**Confirmed:** cards carry **multiple** granular tags + a free-text **"Other"** fallback
(vetted via the approval queue). Each tag rolls up into one of **5 filter buckets** shown on
the filter bar. Custom tags default to "Everything else" until an admin re-buckets them.

### Filter bucket → tag mapping (draft — tweak freely)

| Bucket | Granular tags |
|---|---|
| **Code** | software/engineering, web, react, data/ai, backend, mobile |
| **Design** | product/design, ux/ui, illustration, branding |
| **Build** | hardware/prototyping, fabrication, welding, manufacturing |
| **Business** | business/strategy, finance/fundraising, grants, sales/bizdev, marketing, legal/ip, pitch |
| **Everything else** | science/bio, chemistry, operations, video, testing, feedback, co-founder, custom "Other" |

## Open questions (minor, can decide during build)

1. **Bucket→tag mapping** — refine the draft table above.
2. **Submit form fields** — confirm required vs optional (name, major, grad year, contact,
   type, tags, paid?, deadline?).

## Progress

- [x] Scaffold Vite + React app, git repo.
- [x] Board view (TV + iPad) matching the mockup — header/counts/clock, filter bar,
      two columns, cards with badges/tags/avatars/time-ago.
- [x] Supabase layer: `schema.sql` (cards + private contact table, RLS, RPCs, realtime),
      client, `useCards` fetch + realtime subscription, sample-data fallback. Setup in README.
- [x] Submit form (`/submit`) + `submit_card` RPC wired to the UI. Routing via
      react-router. RPC + RLS verified end-to-end against the live DB.
- [x] Reveal page (`/c/:id`) using `reveal_contact` + card context, smart contact link.
      Verified live.
- [x] Manage link (`/m/:token`) using `manage_get` / `manage_set_status` +
      `manage_delete_card` (take it down). Verified live (delete needs schema re-run).
- [x] Admin console (`/admin`) — rotatable shared-password login (bcrypt in DB),
      approval queue, approve/hide/claim/delete, change password, clear board.
- [ ] Per-card QR (submit QR + reveal QR), routing, deploy.

## Next steps

1. **(User)** Create the Supabase project and run `supabase/schema.sql` (see README).
2. Build the **submit form** + wire the `submit_card` RPC.
3. Then reveal page → manage link → admin console → QR + routing → deploy.
