# CI/CD Plan — Expense Tracker
**Version:** 1.0  
**Date:** 2026-03-10  
**Author:** Senior Developer  
**Stack de deployment:** GitHub + GitHub Actions + FTP + cPanel (hospedando.mx)

---

## 1. Resumen Ejecutivo

Este documento define la estrategia completa de CI/CD para desplegar Expense Tracker en producción usando exclusivamente las herramientas disponibles: GitHub como repositorio y trigger de automatización, GitHub Actions como motor de CI/CD (gratuito para repos privados hasta 2,000 min/mes), y FTP como mecanismo de transferencia hacia hospedando.mx.

El resultado final es un pipeline completamente automatizado: cada `git push` a `main` dispara una cadena que construye, valida y despliega tanto el frontend como el backend sin intervención manual.

---

## 2. Estrategia de Branching

```
main          ← producción (auto-deploy al hacer push/merge)
staging       ← pre-producción (opcional, para validar antes de main)
develop       ← integración de features
feature/*     ← desarrollo de funcionalidades
hotfix/*      ← correcciones urgentes en producción
```

### Reglas

- **Nadie hace push directo a `main`** — solo merges desde `develop` o `hotfix/*`
- **`develop`** acumula features terminadas
- **`hotfix/*`** se crea desde `main`, se mergea a `main` Y a `develop`
- Los tags de versión siguen **Semantic Versioning**: `v1.0.0`, `v1.0.1`, `v1.1.0`

### Flujo normal de trabajo

```
feature/nueva-funcionalidad
    ↓ PR a develop
develop
    ↓ PR a main (cuando hay suficientes features)
main  →  GitHub Actions  →  FTP  →  hospedando.mx (producción)
```

### Flujo de hotfix

```
main
    ↓ branch hotfix/fix-critico
hotfix/fix-critico
    ↓ PR a main + PR a develop
main  →  GitHub Actions  →  FTP  →  hospedando.mx (producción)
```

---

## 3. Arquitectura del Pipeline

El pipeline tiene **dos workflows independientes** que se ejecutan en paralelo cuando hay un push a `main`:

```
git push main
    │
    ├─── Workflow: Deploy Frontend ─────────────────────────────────┐
    │    1. Checkout código                                          │
    │    2. Setup Node 20                                            │
    │    3. npm ci                                                   │
    │    4. npm run build  (genera front/dist/)                      │
    │    5. FTP upload → public_html/ en hospedando.mx              │
    │                                                                │
    └─── Workflow: Deploy Backend ──────────────────────────────────┘
         1. Checkout código
         2. Setup PHP 8.1
         3. composer install --no-dev
         4. FTP upload → subdomain/api/ en hospedando.mx
         5. HTTP trigger → /api/deploy-hook (corre migraciones)
```

Los dos workflows son independientes porque el frontend y el backend cambian de forma asíncrona — no tiene sentido resubir ambos si solo cambió uno.

---

## 4. Secrets de GitHub

Antes de crear los workflows, hay que configurar los siguientes secrets en el repo de GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valor | Descripción |
|---|---|---|
| `FTP_SERVER` | `ftp.tudominio.com` | Host FTP de hospedando.mx |
| `FTP_USERNAME` | `tu-usuario-ftp` | Usuario FTP de cPanel |
| `FTP_PASSWORD` | `tu-password-ftp` | Contraseña FTP de cPanel |
| `DEPLOY_HOOK_SECRET` | `string-random-largo` | Token secreto para el endpoint de migraciones |
| `VITE_API_URL` | `https://api.tudominio.com` | URL del backend en producción |
| `APP_KEY` | `base64:...` | Laravel APP_KEY de producción |

El `FTP_SERVER`, `FTP_USERNAME` y `FTP_PASSWORD` los encuentras en cPanel → Cuentas FTP o en el email de bienvenida de hospedando.mx.

Para generar el `DEPLOY_HOOK_SECRET`:
```bash
openssl rand -base64 32
```

---

## 5. Workflow: Deploy Frontend

Archivo: `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'front/**'          # Solo se dispara si cambia algo en /front
      - '.github/workflows/deploy-frontend.yml'

jobs:
  build-and-deploy:
    name: Build & Deploy React
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: front/package-lock.json

      - name: Install dependencies
        working-directory: front
        run: npm ci

      - name: Build
        working-directory: front
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: npm run build

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: front/dist/
          server-dir: /public_html/
          # Solo sube archivos que hayan cambiado (diff por hash)
          dangerous-clean-slate: false
          exclude: |
            **/.git*
            **/.git*/**
            **/node_modules/**
```

**Puntos clave:**
- `paths: ['front/**']` — El workflow solo corre cuando hay cambios en el frontend. Si solo cambió el backend, este workflow no se ejecuta, ahorrando minutos de Actions.
- `npm ci` en lugar de `npm install` — Usa exactamente las versiones de `package-lock.json`. Más rápido y reproducible.
- `dangerous-clean-slate: false` — Usa comparación por hash para subir solo los archivos que cambiaron. Un build de React completo son ~5-15 archivos que cambian realmente.
- La variable `VITE_API_URL` se inyecta en build time, por eso necesita ser un secret de GitHub y no solo un `.env` local.

---

## 6. Workflow: Deploy Backend

Archivo: `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'api/**'            # Solo se dispara si cambia algo en /api
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    name: Deploy Laravel
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup PHP 8.1
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          extensions: pdo_mysql, mbstring, bcmath, gd, intl
          coverage: none

      - name: Install Composer dependencies
        working-directory: api
        run: |
          composer install \
            --no-dev \
            --no-interaction \
            --prefer-dist \
            --optimize-autoloader

      - name: Create production .env
        working-directory: api
        run: |
          cat > .env << EOF
          APP_NAME="Expense Tracker"
          APP_ENV=production
          APP_KEY=${{ secrets.APP_KEY }}
          APP_DEBUG=false
          APP_URL=${{ secrets.VITE_API_URL }}

          DB_CONNECTION=mysql
          DB_HOST=${{ secrets.DB_HOST }}
          DB_PORT=3306
          DB_DATABASE=${{ secrets.DB_DATABASE }}
          DB_USERNAME=${{ secrets.DB_USERNAME }}
          DB_PASSWORD=${{ secrets.DB_PASSWORD }}

          CACHE_DRIVER=file
          SESSION_DRIVER=file
          QUEUE_CONNECTION=sync

          SANCTUM_STATEFUL_DOMAINS=${{ secrets.SANCTUM_STATEFUL_DOMAINS }}

          GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
          EOF

      - name: Optimize Laravel for production
        working-directory: api
        run: |
          php artisan config:cache
          php artisan route:cache
          php artisan view:cache

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: api/
          server-dir: /subdomains/api/
          dangerous-clean-slate: false
          exclude: |
            **/.git*
            **/.git*/**
            **/node_modules/**
            **/tests/**
            **/.env.example
            **/docker*
            **/Dockerfile
            **/*.md
            **/storage/logs/**
            **/storage/framework/cache/**
            **/storage/framework/sessions/**

      - name: Run migrations via deploy hook
        run: |
          curl -f -X POST \
            "${{ secrets.VITE_API_URL }}/deploy-hook" \
            -H "X-Deploy-Secret: ${{ secrets.DEPLOY_HOOK_SECRET }}" \
            -H "Content-Type: application/json"
```

**Puntos clave:**
- El `.env` de producción se genera en tiempo de ejecución del workflow — **nunca se commitea al repo**.
- `config:cache` + `route:cache` mejoran el performance en producción hasta ~40%.
- El bloque `exclude` evita subir archivos innecesarios (Dockerfile, tests, logs, sessions) que no tienen lugar en el servidor.
- La llamada `curl` al final dispara el endpoint de migraciones (definido en sección 7).

**Secrets adicionales necesarios para el backend:**

Agregar a GitHub Secrets:

| Secret | Descripción |
|---|---|
| `DB_HOST` | Host MySQL de cPanel (usualmente `localhost`) |
| `DB_DATABASE` | Nombre de la BD en cPanel |
| `DB_USERNAME` | Usuario MySQL de cPanel |
| `DB_PASSWORD` | Contraseña MySQL de cPanel |
| `SANCTUM_STATEFUL_DOMAINS` | `tudominio.com,www.tudominio.com` |
| `GOOGLE_CLIENT_ID` | De Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | De Google Cloud Console |

---

## 7. Deploy Hook — Migraciones Automáticas

Como hospedando.mx no tiene SSH, las migraciones deben dispararse vía HTTP. Este endpoint debe crearse en Laravel y **eliminarse o desactivarse** cuando no se necesite.

### Crear la ruta en `api/routes/api.php`

```php
// Deploy hook — solo accesible con el secret correcto
Route::post('/deploy-hook', function (Illuminate\Http\Request $request) {
    $secret = $request->header('X-Deploy-Secret');

    if ($secret !== env('DEPLOY_HOOK_SECRET')) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    try {
        Artisan::call('migrate', ['--force' => true]);
        $output = Artisan::output();

        return response()->json([
            'status' => 'ok',
            'output' => $output,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});
```

### Agregar al `.env` de producción (y al workflow)

```env
DEPLOY_HOOK_SECRET=el-mismo-string-que-en-github-secrets
```

### Seguridad del hook

- Solo acepta `POST` con el header `X-Deploy-Secret` exacto
- Devuelve 401 ante cualquier secret incorrecto
- En producción, el secret tiene 32+ caracteres aleatorios
- Si en algún momento quieres desactivarlo, simplemente cambia o elimina `DEPLOY_HOOK_SECRET` del `.env` del servidor

---

## 8. Estructura de Archivos del Repo

Después de implementar este plan, el repo debe tener esta estructura en la raíz:

```
expense-tracker/
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml     ← Workflow del frontend
│       └── deploy-backend.yml      ← Workflow del backend
├── api/                            ← Laravel (sin cambios)
├── front/                          ← React (sin cambios)
├── nginx/                          ← Solo para desarrollo local
├── docs/
│   ├── pwa-prd.md
│   ├── cicd-plan.md                ← Este documento
│   └── overview.md
├── docker-compose.yml              ← Solo para desarrollo local
└── Makefile                        ← Solo para desarrollo local
```

---

## 9. Pasos de Implementación (Ordenados)

### Paso 1 — Configurar secretos en GitHub
Ir a: `github.com/[usuario]/expense-tracker` → Settings → Secrets and variables → Actions

Crear todos los secrets listados en las secciones 4 y 6.

### Paso 2 — Crear el endpoint de migraciones
Agregar la ruta del deploy hook a `api/routes/api.php` (sección 7).

### Paso 3 — Crear los workflows
Crear los dos archivos en `.github/workflows/` con el contenido de las secciones 5 y 6.

### Paso 4 — Primer deploy manual (único)
El primer deploy no puede ser automatizado porque el servidor está vacío. Hacerlo una sola vez manualmente:

```bash
# Frontend
cd front && npm run build
# Subir front/dist/* a public_html/ por FTP manualmente

# Backend
cd api && composer install --no-dev
# Subir api/* a subdomains/api/ por FTP manualmente
# Crear .env en el servidor con las credenciales reales
# Ir a phpMyAdmin en cPanel e importar el schema de la BD
```

### Paso 5 — Validar el pipeline
Hacer un cambio menor (ej. un comentario en un archivo de `front/`), commitear y hacer push a `main`. Verificar en GitHub → Actions que el workflow corre y completa exitosamente.

### Paso 6 — Proteger la branch `main`
En GitHub → Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging

Esto previene pushes directos a producción sin pasar por el pipeline.

---

## 10. Flujo Completo de un Release

### Release normal (nueva feature)

```bash
# 1. Crear branch de feature
git checkout develop
git checkout -b feature/nueva-pantalla

# 2. Desarrollar y commitear
git add .
git commit -m "feat: agregar pantalla de reportes mensuales"
git push origin feature/nueva-pantalla

# 3. Abrir PR a develop en GitHub, revisar, mergear

# 4. Cuando esté listo para producción, abrir PR de develop → main
# GitHub Actions corre automáticamente al mergear

# 5. Verificar el deploy en GitHub → Actions
# La app en producción se actualiza en ~3-5 minutos
```

### Hotfix urgente

```bash
# 1. Crear branch desde main
git checkout main
git checkout -b hotfix/fix-login

# 2. Corregir y commitear
git add .
git commit -m "fix: corregir error de autenticación con token expirado"
git push origin hotfix/fix-login

# 3. PR a main → mergear → deploy automático
# 4. PR a develop → mergear → mantener develop actualizado
```

### Convención de commits

Seguir **Conventional Commits** para tener un historial limpio:

| Prefijo | Cuándo usarlo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `chore:` | Cambios de configuración, deps |
| `docs:` | Documentación |
| `refactor:` | Refactorización sin cambio de comportamiento |
| `style:` | Cambios de UI/CSS |
| `perf:` | Mejoras de rendimiento |

Ejemplo: `fix: corregir CORS en preflight OPTIONS requests`

---

## 11. Monitoreo Post-Deploy

Como no hay herramientas de observabilidad configuradas, el monitoreo básico se hace así:

**Verificar que el deploy fue exitoso:**
1. GitHub → Actions → ver el último run, debe estar en verde ✅
2. Abrir `tudominio.com` en el navegador — debe cargar el frontend
3. Abrir `api.tudominio.com/api/health` — debe devolver `{"status":"ok"}` (agregar este endpoint a Laravel)
4. Hacer login y navegar a Transacciones — confirmar que los datos cargan

**Si algo falla:**
1. GitHub → Actions → click en el workflow fallido → ver los logs paso a paso
2. El paso con ❌ indica exactamente qué falló (build, FTP, migraciones)
3. Corregir, hacer commit y push — el pipeline se re-ejecuta automáticamente

**Agregar endpoint de health check en `api/routes/api.php`:**
```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => env('APP_VERSION', '1.0.0'),
    ]);
});
```

---

## 12. Limitaciones Conocidas y Mitigaciones

| Limitación | Impacto | Mitigación |
|---|---|---|
| FTP no es atómico | Durante el upload hay un momento donde el servidor tiene archivos mezclados (viejos + nuevos) | Deployar en horas de bajo tráfico; el tiempo de upload es ~30-60s |
| Sin rollback automático | Si el deploy rompe algo, no hay `git revert` automático | Mantener el build anterior en una carpeta `backup/` en el servidor; ante fallo, restaurar por FTP manualmente |
| Migraciones irreversibles | `migrate --force` en producción no se puede deshacer fácilmente | Siempre escribir migraciones con `down()` funcional; hacer backup de BD en phpMyAdmin antes de migrations complejas |
| GitHub Actions gratuito = 2,000 min/mes | Cada deploy tarda ~3-5 min; con 2 workflows son ~10 min por release | Para uso personal con 2-4 releases/semana, esto equivale a ~80-160 min/mes — muy por debajo del límite |
| No hay entorno de staging en hospedando.mx | Los cambios van directo a producción | Probar exhaustivamente en local con Docker antes de mergear a main |
