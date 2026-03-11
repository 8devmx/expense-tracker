# PRD — Expense Tracker PWA Conversion
**Version:** 1.0  
**Date:** 2026-03-10  
**Author:** Senior Developer  
**Status:** Ready for Implementation

---

## 1. Objective

Convert the existing Expense Tracker web application into a fully installable **Progressive Web App (PWA)** so the user can install it on their mobile device (iOS/Android) and use it with a native app experience: home screen icon, splash screen, standalone window (no browser UI), and offline resilience.

---

## 2. Current Stack (Context for the AI Agent)

| Layer | Technology | How it runs |
|---|---|---|
| Frontend | React 19 + Vite 7 + TailwindCSS 4 | Docker container, port 3000 → internal 5173 |
| Backend API | Laravel 9 + PHP-FPM | Docker container, port 8000 via Nginx proxy |
| Database | MySQL 8.0 | Docker container, port 3306 |
| Auth | Google OAuth + Laravel Sanctum tokens | Token stored in localStorage |

**Relevant files:**
- `front/vite.config.js` — Vite configuration (currently minimal, no PWA plugin)
- `front/package.json` — Frontend dependencies
- `front/index.html` — HTML entry point (missing all PWA meta tags)
- `front/public/` — Static assets (has `favicon.png`, `logo.png`, `logo-header.png`)
- `front/src/main.jsx` — React entry point
- `nginx/nginx.conf` — Backend proxy (serves Laravel only, not the frontend)
- `front/nginx.conf` — Frontend static server config (used in production Docker build)
- `docker-compose.yml` — Orchestrates all services

**Important constraint:** The frontend runs via Vite dev server in Docker (`npm run dev -- --host`). The PWA plugin works in both dev and production build, but the installability prompt only fully activates over HTTPS or `localhost`. Since the app already runs on `localhost:3000`, this is satisfied in development.

---

## 3. Scope

### In Scope
- Web App Manifest (`manifest.json`)
- Service Worker via `vite-plugin-pwa`
- App icons (all required sizes)
- iOS-specific meta tags (`apple-mobile-web-app-*`)
- Offline fallback page
- Network-first caching strategy for API calls
- Cache-first strategy for static assets
- Install prompt handling (Android Chrome)
- Splash screen configuration

### Out of Scope
- Push notifications
- Background sync for offline mutations
- Native app stores (App Store / Google Play)
- Server-side changes (the Laravel API requires no modifications)

---

## 4. PWA Requirements

### 4.1 Web App Manifest

The manifest must be placed at `front/public/manifest.json` and linked from `front/index.html`.

**Required fields:**

```json
{
  "name": "Expense Tracker",
  "short_name": "Gastos",
  "description": "Seguimiento personal de gastos e ingresos",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#667eea",
  "theme_color": "#e17055",
  "lang": "es",
  "icons": [
    { "src": "/icons/icon-72x72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96x96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**Notes:**
- `theme_color: "#e17055"` matches the app's primary coral color defined in `App.css` (`--color-coral-500`).
- `background_color: "#667eea"` matches the body gradient start color in `index.css`.
- `short_name: "Gastos"` keeps the home screen label short and in Spanish.
- `display: "standalone"` hides browser chrome — this is the key flag for native feel.

### 4.2 App Icons

The existing `front/public/logo.png` must be used as the source to generate all icon sizes. Create a directory `front/public/icons/` and generate all 8 sizes listed in the manifest above.

**Generation method:** Use the `sharp` npm package in a one-time script, or use an online tool like [realfavicongenerator.net](https://realfavicongenerator.net) with the existing `logo.png` as source.

**Maskable icons:** The 192x192 and 512x512 variants must have `"purpose": "any maskable"`. For maskable icons, the logo should have visible padding (~10% on all sides) so Android's adaptive icon system doesn't crop it. If the current logo has no padding, create a padded version for these two sizes.

**One-time generation script** — create and run `front/scripts/generate-icons.mjs`:

```javascript
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const source = './public/logo.png'
const outDir = './public/icons'

mkdirSync(outDir, { recursive: true })

for (const size of sizes) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 102, g: 126, b: 234, alpha: 1 } })
    .png()
    .toFile(`${outDir}/icon-${size}x${size}.png`)
  console.log(`Generated ${size}x${size}`)
}
```

Run with: `node front/scripts/generate-icons.mjs` (requires `npm install sharp` in the `front` directory as a devDependency).

### 4.3 iOS-Specific Meta Tags

Apple does not fully honor the Web App Manifest spec. These tags must be added to `front/index.html`, replacing the current minimal `<head>` content:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expense Tracker</title>

  <!-- Favicon -->
  <link rel="icon" href="/favicon.png" />

  <!-- Web App Manifest -->
  <link rel="manifest" href="/manifest.json" />

  <!-- PWA: Theme color (Android Chrome toolbar) -->
  <meta name="theme-color" content="#e17055" />

  <!-- PWA: iOS Safari -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Gastos" />
  <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

  <!-- PWA: Android -->
  <meta name="mobile-web-app-capable" content="yes" />

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 4.4 Service Worker

Use **`vite-plugin-pwa`** — the standard Vite integration for Workbox-based service workers.

**Install:**
```bash
cd front
npm install -D vite-plugin-pwa
```

**`front/vite.config.js` — complete final file:**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo.png', 'logo-header.png', 'icons/*.png'],
      manifest: false, // We manage manifest.json manually in /public
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Network-first for API calls: always try fresh data, fallback to cache
            urlPattern: /^http:\/\/localhost:8000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Cache-first for Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable service worker in Vite dev server for testing
        type: 'module',
      },
    }),
  ],
  server: {
    allowedHosts: ['bfee19d8d69c.ngrok-free.app'],
  },
})
```

**Key decisions:**
- `registerType: 'autoUpdate'` — The SW updates silently in the background without prompting the user. This is appropriate for a personal finance app where you always want the latest data.
- `manifest: false` — We provide our own `manifest.json` in `/public` for full control.
- `NetworkFirst` for API calls — The app will always try to fetch fresh transactions from `localhost:8000/api/*`. If offline, it serves the last cached response. The 10-second timeout prevents the app from hanging on slow connections.
- `devOptions.enabled: true` — Allows testing the SW behavior during `npm run dev`, not only in production builds.
- `react()` plugin added — The current `vite.config.js` is missing it. It's already in `devDependencies` (`@vitejs/plugin-react: ^4.6.0`) and is required for JSX processing alongside the PWA plugin.

### 4.5 Offline Fallback Page

Create `front/public/offline.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sin conexión — Gastos</title>
  <style>
    body {
      font-family: Inter, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #e17055 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-align: center;
      margin: 0;
    }
    .card {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 40px;
      max-width: 320px;
    }
    h1 { font-size: 48px; margin: 0 0 8px; }
    p { opacity: 0.85; line-height: 1.5; }
    button {
      margin-top: 20px;
      background: #e17055;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>📵</h1>
    <h2>Sin conexión</h2>
    <p>No se puede conectar al servidor. Revisa tu conexión a internet e intenta de nuevo.</p>
    <button onclick="window.location.reload()">Reintentar</button>
  </div>
</body>
</html>
```

### 4.6 iOS Install Hint Component

iOS does not show an automatic install prompt. Create `front/src/components/IOSInstallHint.jsx`:

```jsx
import { useState, useEffect } from 'react'

const IOSInstallHint = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    const dismissed = localStorage.getItem('pwa_hint_dismissed')
    if (isIOS && !isStandalone && !dismissed) {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('pwa_hint_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 9999,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <span style={{ fontSize: 28 }}>📲</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#1f2937', fontSize: 14 }}>Instala esta app</p>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13, lineHeight: 1.4 }}>
          Toca el botón compartir <strong>⬆</strong> y luego <strong>"Agregar a pantalla de inicio"</strong>
        </p>
      </div>
      <button onClick={dismiss} style={{
        background: 'none', border: 'none', color: '#9ca3af',
        fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1,
      }}>×</button>
    </div>
  )
}

export default IOSInstallHint
```

Import and render this component in `front/src/App.jsx`, at the root level (outside the Router), so it appears on every page.

---

## 5. File Changes Summary

### New Files to Create
| File | Purpose |
|---|---|
| `front/public/manifest.json` | Web App Manifest |
| `front/public/offline.html` | Offline fallback page |
| `front/public/icons/icon-72x72.png` | App icon |
| `front/public/icons/icon-96x96.png` | App icon |
| `front/public/icons/icon-128x128.png` | App icon |
| `front/public/icons/icon-144x144.png` | App icon |
| `front/public/icons/icon-152x152.png` | App icon |
| `front/public/icons/icon-192x192.png` | App icon (maskable) |
| `front/public/icons/icon-384x384.png` | App icon |
| `front/public/icons/icon-512x512.png` | App icon (maskable) |
| `front/src/components/IOSInstallHint.jsx` | iOS install prompt component |
| `front/scripts/generate-icons.mjs` | One-time icon generation script |

### Files to Modify
| File | Change |
|---|---|
| `front/index.html` | Replace `<head>` content with full PWA meta tags |
| `front/vite.config.js` | Add `VitePWA` plugin + `react` plugin (full replacement) |
| `front/package.json` | Add `vite-plugin-pwa` and `sharp` to devDependencies |
| `front/src/App.jsx` | Import and render `<IOSInstallHint />` at root level |

### Files That Require No Changes
| File | Reason |
|---|---|
| `nginx/nginx.conf` | Backend proxy — unrelated to PWA |
| `front/nginx.conf` | Already serves static files correctly in production |
| `docker-compose.yml` | No new services needed |
| All Laravel/PHP files | Service worker operates entirely on the frontend |

---

## 6. Implementation Steps (Ordered)

**Step 1 — Install dependencies**
```bash
cd /Users/abrahampech/Documents/Github/expense-tracker/front
npm install -D vite-plugin-pwa sharp
```

**Step 2 — Generate icons**
```bash
node scripts/generate-icons.mjs
```
Verify that `front/public/icons/` contains all 8 PNG files.

**Step 3 — Create `front/public/manifest.json`**
Use the JSON defined in section 4.1.

**Step 4 — Create `front/public/offline.html`**
Use the HTML defined in section 4.5.

**Step 5 — Update `front/index.html`**
Replace the entire file with the content defined in section 4.3.

**Step 6 — Update `front/vite.config.js`**
Replace the entire file with the configuration defined in section 4.4.

**Step 7 — Create `front/src/components/IOSInstallHint.jsx`**
Use the component defined in section 4.6.

**Step 8 — Update `front/src/App.jsx`**
Import `IOSInstallHint` and add `<IOSInstallHint />` before the closing tag of the root JSX element.

**Step 9 — Rebuild the frontend Docker container**
The frontend Dockerfile copies and installs npm dependencies. Since we added new packages, a rebuild is required:
```bash
cd /Users/abrahampech/Documents/Github/expense-tracker
make down
docker-compose build --no-cache frontend
make up
```

**Step 10 — Verify in Chrome DevTools**
Open `http://localhost:3000` in Chrome:
- DevTools → Application → Manifest: no errors, all icons visible
- DevTools → Application → Service Workers: status "activated and running"
- DevTools → Application → Cache Storage: `api-cache` and `google-fonts-cache` present after first navigation
- Address bar: install icon (⊕) appears on the right side

---

## 7. Acceptance Criteria

The implementation is complete when ALL of the following are true:

- [ ] Chrome DevTools → Application → Manifest shows no errors and all 8 icons load correctly
- [ ] Chrome DevTools → Application → Service Workers shows status "activated and running"
- [ ] On Android Chrome, the "Add to Home Screen" / install prompt appears after browsing the app
- [ ] After installing on Android, the app opens in standalone mode (no browser address bar)
- [ ] The app icon appears on the Android home screen with the correct logo
- [ ] Navigating to any cached page while offline shows the page (not a browser error)
- [ ] Navigating to an uncached route while offline shows `offline.html`
- [ ] On iOS Safari, the app can be added to the home screen via Share → "Agregar a pantalla de inicio"
- [ ] On iOS, after installing, the app opens in standalone mode (no Safari UI)
- [ ] On iOS, the `IOSInstallHint` component is visible on first visit and dismissible
- [ ] The splash screen background on both platforms matches the app gradient (`#667eea`)
- [ ] The status bar on Android shows `#e17055` (coral) as theme color
- [ ] After a code update and page reload, the service worker updates silently

---

## 8. Known Constraints & Notes

**Localhost vs production:** The full PWA install prompt requires HTTPS in production. On `localhost`, Chrome allows it for development. If the app is ever deployed to a domain, the `start_url` in `manifest.json` and the API URL pattern in the Workbox config must be updated to match the production domain.

**ngrok testing on physical device:** The project already uses ngrok (`bfee19d8d69c.ngrok-free.app` in `vite.config.js`). When testing the PWA on a physical Android device over ngrok, the service worker will register correctly since ngrok provides HTTPS. The Workbox `urlPattern` for the API (`localhost:8000`) must be updated to the ngrok backend URL when doing remote device testing.

**Docker dev server & SW caching:** The service worker is enabled in dev mode (`devOptions.enabled: true`). Cached responses may persist across dev sessions. Use "Update on reload" in Chrome DevTools → Application → Service Workers during active development to avoid stale cache issues.

**Token authentication:** The app uses Sanctum token auth stored in `localStorage`. The service worker does not intercept or modify auth headers — it only caches responses. If the token expires while offline, the user will see cached data but must re-authenticate when back online. This is acceptable behavior within the current scope.

**iOS limitations:** iOS (Safari/WebKit) has historically had limited PWA support. As of iOS 16.4+, most PWA features work correctly including standalone mode, splash screens, and service workers. The main limitation remains the lack of automatic install prompts, which is addressed by the `IOSInstallHint` component.
