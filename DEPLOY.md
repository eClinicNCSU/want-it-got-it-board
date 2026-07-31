# Deploying the board (GitHub + Vercel)

The code is version-controlled with git and deploys to Vercel, which rebuilds
automatically on every push to `main`.

## 1. Put the code on GitHub

1. Create a new **empty** repository at <https://github.com/new>
   - Name it e.g. `want-it-got-it-board`
   - **Don't** add a README, .gitignore, or license (the repo already has them)
2. Connect your local repo and push (replace `YOUR-USERNAME`):

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/want-it-got-it-board.git
   git push -u origin main
   ```

   The first push will prompt you to sign in to GitHub (a browser window opens —
   this is Git Credential Manager). Approve it once and it's remembered.

## 2. Deploy on Vercel

1. Go to <https://vercel.com> and sign in **with GitHub**.
2. **Add New → Project**, then import the `want-it-got-it-board` repo.
3. Vercel auto-detects Vite (Build: `npm run build`, Output: `dist`). Leave as is.
4. Expand **Environment Variables** and add the two from your `.env`:
   - `VITE_SUPABASE_URL` → your Project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon public key
5. Click **Deploy**. In ~1 minute you get a live URL like
   `https://want-it-got-it-board.vercel.app`.

`vercel.json` in this repo routes all paths to the app, so `/submit`, `/admin`,
`/c/…`, and `/m/…` work even when opened directly or refreshed.

## 3. Point the hardware at it

- **TV:** open the live URL at `/` in full-screen (kiosk) mode.
- **iPad:** open the same URL; students filter, tap cards, and post from here.
- **Admin:** go to `/admin` and sign in with the shared password.

## Updating the site later

Any change you commit and push redeploys automatically:

```bash
git add -A
git commit -m "describe the change"
git push
```

Vercel builds the new version and swaps it in. Roll back anytime from the Vercel
dashboard (Deployments → … → Promote to Production).

## Notes

- Never commit `.env` (it's gitignored). The keys live only in Vercel's env vars.
- The `anon` key is safe to expose; it's protected by row-level security. Never
  add the Supabase **service_role** key anywhere.
- To use a custom domain (e.g. a garage URL), add it in Vercel → Project →
  Settings → Domains.
