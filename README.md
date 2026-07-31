# Want it Got It — NC State Entrepreneurship Garage

A live board for the garage TV. Students post **Wanted** cards (skills/people they're
looking for) and **Got It** cards (skills they offer) from their phones; approved cards
stream onto the TV in real time.

See [PLAN.md](PLAN.md) for the full architecture and decisions.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. With no database configured, the board renders on **sample
data** so you can see the layout immediately.

## Connect Supabase (persistence + realtime)

The app works without a backend (sample data). To make cards persist and stream live:

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is plenty).
2. **Create the schema:** in the dashboard, open **SQL Editor → New query**, paste the
   contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. **(Optional) Seed demo cards:** run [`supabase/seed.sql`](supabase/seed.sql) the same
   way to load the mockup's sample cards as approved rows — handy for verifying the board
   and realtime.
4. **Add your keys:** in the dashboard go to **Project Settings → API**, copy the
   **Project URL** and the **anon public** key, then create a `.env` file:

   ```bash
   # .env  (copy from .env.example)
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

5. **Restart** `npm run dev`. The board now reads live, approved cards and updates in
   real time.

> The `anon` key is safe to expose in a frontend — it's gated by row-level security.
> Never put the **service_role** key in this app.

> **Re-running the schema:** `schema.sql` is idempotent — safe to run again whenever it
> changes. It won't reset your data or your admin password.

## Admin console

Moderation lives at **`/admin`**. Students' submissions arrive as `pending` and stay invisible
on the board until an admin approves them there.

- **Access** is a single shared password, checked inside the database against a bcrypt hash —
  no privileged key is ever in the browser.
- **The default password is `changeme`.** ⚠️ **Change it immediately**: sign in at `/admin`,
  then **Settings → Change password**. Rotate it anytime the same way.
- From the console you can **approve / hide / mark claimed / delete** cards, and **clear the
  board** (end-of-semester reset).

## How the data is protected

- **`public.cards`** holds board data and contains **no contact info**. The public can
  only read `approved`, non-expired rows.
- **`public.card_private`** holds each poster's contact + a secret manage token. It's
  locked by row-level security — the anon key can't read it at all.
- Contact is reachable only through the `reveal_contact()` database function (used by the
  scan-to-reveal flow), and only for approved cards.

## Project layout

```
src/
  App.jsx                 board state: filter + clock
  components/             Header, FilterBar, Column, Card, Avatar
  lib/
    buckets.js            5 filter buckets + tag→bucket mapping
    useCards.js           fetch + realtime subscription (sample fallback)
    supabase.js           client (reads VITE_SUPABASE_* env vars)
    mapCard.js            DB row → card shape + badge derivation
    sampleData.js         mockup cards (used until Supabase is configured)
    time.js               "2d / 5h / 1w" formatter
  styles/global.css       dark glassmorphic theme
supabase/
  schema.sql              tables, RLS, functions, realtime
  seed.sql                optional demo data
```
