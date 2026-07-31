# Running the board as a kiosk

The site is a **PWA** — it can be installed to a device's home screen and launches
**fullscreen, with no browser bar or tabs**. Installing hides the browser chrome;
the OS-level lock (below) is what actually stops someone from exiting.

Live URL: **https://want-it-got-it-board.vercel.app**

## iPad (the interactive tablet)

1. **Install it:** open the URL in **Safari** → Share button → **Add to Home Screen**.
   Launch it from the new "Want it Got It" icon — it opens fullscreen, no address bar.
2. **Lock it to this one app — Guided Access:**
   - Settings → **Accessibility → Guided Access** → turn on. Set a **passcode**.
   - Open the app, then **triple-click** the side/top button → **Start**.
   - Now the home gesture, app switching, and everything else are disabled until you
     triple-click again and enter the passcode. This is the real kiosk lock.
3. Optional: Settings → Display & Brightness → **Auto-Lock → Never**, and keep it on
   the charger so the screen stays on.

## The TV

Pick the row that matches what drives the TV:

### A mini-PC / laptop / Chromebox / Raspberry Pi (best lockdown)
Run Chrome in kiosk mode — fullscreen, no chrome, no navigation:

```bash
chrome --kiosk --app=https://want-it-got-it-board.vercel.app
```

(On Windows: `chrome.exe --kiosk --app=https://want-it-got-it-board.vercel.app`.)
Put it in startup so it relaunches on boot. `--incognito` also prevents students
from reaching history.

### A streaming stick / box (Fire TV, Android TV)
Install a kiosk browser app (e.g. **Fully Kiosk Browser**), set the start URL to the
live URL, enable fullscreen + motion/keep-screen-on, and lock its settings with a PIN.

### The TV's own built-in browser
Most limited — open the URL and use the browser's fullscreen option. These browsers
usually can't be fully locked down, so if you need real lockdown, a cheap streaming
stick or mini-PC is worth it.

## Updating

The app **auto-updates**: when a new version is deployed, the kiosk picks it up on its
next load (the service worker is set to `autoUpdate`). No reinstall needed.

## Regenerating the app icon

The icon is generated from `scripts/icon.svg`:

```bash
node scripts/gen-icons.mjs
```
