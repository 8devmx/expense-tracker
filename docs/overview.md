# Expense Tracker - Overview

## Descripción del Proyecto

Expense Tracker es una aplicación web para gestión de finanzas personales. Permite a los usuarios registrar sus ingresos y gastos, categorizarlos, visualizar reportes anuales y exportar datos a Google Sheets.

**Usuario objetivo**: Personas que desean llevar un control de sus finanzas personales de forma sencilla.

---

## Estado del Proyecto

### ✅ Completado

El proyecto tiene una base sólida con las funcionalidades principales implementadas:

1. **Sistema de autenticación** con Google OAuth
2. **Gestión de transacciones** (CRUD completo)
3. **Gestión de categorías** (CRUD completo)
4. **Dashboard** con resumen anual y gráficos
5. **Transacciones recurrentes** (diario, semanal, quincenal, mensual, bimestral)
6. **Exportación a Google Sheets**
7. **Diseño responsivo** con Tailwind CSS + DaisyUI

### ⚠️ Incompleto / Por Mejorar

1. **No hay tests** implementados
2. **Validación de entorno** - Falta verificar que las variables de entorno necesarias estén configuradas
3. **Manejo de errores** - Algunos endpoints no tienen manejo de errores robusto
4. **Exportación a Google Sheets** - La función solo maneja frecuencias weekly, monthly, yearly (no daily ni bimonthly)
5. **No hay funcionalidad de presupuesto** (budgets)
6. **No hay notificaciones o recordatorios**
7. **Perfil de usuario** - No hay página para gestionar perfil
8. **Copia de seguridad** - No hay funcionalidad de backup
9. **Documentación de API** - No hay Swagger/OpenAPI

---

## Arquitectura

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite 7 |
| Backend | Laravel 10 |
| Base de datos | MySQL 8.0 |
| Autenticación | Laravel Sanctum + Google OAuth |
| Proxy | Nginx |
| Contenedores | Docker + Docker Compose |

### Estructura de Directorios

```
expense-tracker/
├── api/                    # Laravel application
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/              # API Controllers
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   └── TransactionController.php
│   │   │   └── Auth/
│   │   │       └── GoogleAuthController.php
│   │   ├── Models/
│   │   │   ├── Category.php
│   │   │   ├── Transaction.php
│   │   │   └── User.php
│   │   └── Services/
│   │       ├── CategoryService.php
│   │       └── GoogleSheetsService.php
│   └── routes/api.php
│
├── front/                  # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   ├── ThemeContext.jsx
│   │   │   └── UserContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Home.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance
│   │   └── utils/
│   │       └── format.js        # Currency formatter
│   └── package.json
│
└── docker-compose.yml       # Services: nginx, backend, frontend, database
```

---

## Modelos de Base de Datos

### Users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | PK |
| name | string | Nombre del usuario |
| email | string | Email único |
| google_id | string | ID de Google OAuth |
| profile_picture_url | string | URL del avatar |
| password | string | Hash de contraseña |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relaciones**: hasMany transactions, hasMany categories

### Categories
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | PK |
| name | string | Nombre de categoría |
| emoji | string | Emoji representativo |
| color | string | Color en formato CSS |
| type | enum | 'income' o 'expense' |
| user_id | bigint | FK -> users.id |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relaciones**: belongsTo User, hasMany transactions

### Transactions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | PK |
| description | string | Descripción |
| amount | decimal(10,2) | Monto |
| type | enum | 'income' o 'expense' |
| date | date | Fecha de la transacción |
| repeat_frequency | enum | 'none', 'daily', 'weekly', 'biweekly', 'monthly', 'bimonthly' |
| repeat_end_date | date | Fecha fin de repetición |
| user_id | bigint | FK -> users.id |
| category_id | bigint | FK -> categories.id |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relaciones**: belongsTo User, belongsTo Category

---

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/google/callback` | Login/Registro con Google |

### Transacciones (requiere auth:sanctum)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions?month=X&year=Y` | Listar transacciones del mes |
| POST | `/api/transactions` | Crear transacción |
| GET | `/api/transactions/{id}` | Ver transacción |
| PUT | `/api/transactions/{id}` | Actualizar transacción |
| DELETE | `/api/transactions/{id}` | Eliminar transacción |
| POST | `/api/export/transactions` | Exportar a Google Sheets |

### Categorías (requiere auth:sanctum)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar categorías del usuario |
| POST | `/api/categories` | Crear categoría |
| GET | `/api/categories/{id}` | Ver categoría |
| PUT | `/api/categories/{id}` | Actualizar categoría |
| DELETE | `/api/categories/{id}` | Eliminar categoría |

### Dashboard (requiere auth:sanctum)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard` | Obtener datos del dashboard |

---

## Funcionalidades Implementadas

### 1. Autenticación con Google
- Login mediante Google OAuth 2.0
- Registro automático de nuevos usuarios
- Asignación de categorías por defecto al primer login
- Token de acceso con Laravel Sanctum

### 2. Gestión de Transacciones
- Crear, leer, actualizar, eliminar transacciones
- Tipos: income (ingreso) / expense (gasto)
- Frecuencias de repetición:
  - none (sin repetición)
  - daily (diario)
  - weekly (semanal)
  - biweekly (quincenal)
  - monthly (mensual)
  - bimonthly (bimestral)
- Fecha de fin de repetición opcional

### 3. Gestión de Categorías
- CRUD de categorías personalizadas
- Categorías por defecto asignadas a nuevos usuarios:
  - **Gastos**: Comidas, Gastos Fijos, Innecesarios, General, Entretenimiento, Despensa, Gasolina, No Identificados, Cerveza
  - **Ingresos**: Salario, Extras
- Emoji y color para cada categoría

### 4. Dashboard
- Resumen anual (ingresos, gastos, balance)
- Gráfico de barras mensual (ingresos vs gastos)
- Resumen por categoría
- Exportación a Google Sheets

### 5. Interfaz de Usuario
- Tema claro/oscuro (ThemeContext)
- Navegación inferior en móvil
- Diseño responsivo con Tailwind CSS
- Loading states con skeleton

---

## Configuración Requerida

### Variables de Entorno (Backend - api/.env)

```env
# Base de datos
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=expense_tracker_api
DB_USERNAME=user
DB_PASSWORD=password

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Google Sheets (para exportación)
GOOGLE_SHEETS_SERVICE_ACCOUNT_CREDENTIALS=credentials.json
GOOGLE_SHEET_ID=
```

### Variables de Entorno (Frontend - front/.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=
```

---

## Notas para Desarrollo Futuro

### Bugs Conocidos

1. **Exportación incompleta**: La función `exportToGoogleSheets` en `TransactionController.php` solo maneja las frecuencias `weekly`, `monthly` y `yearly`. Faltan `daily` y `bimonthly`.

2. **Errores de validación**: Algunos errores de validación podrían ser más descriptivos para el usuario.

### Mejoras Sugeridas

1. **Testing**: Agregar tests unitarios y de integración
2. **Presupuestos**: Agregar funcionalidad de presupuestos mensuales
3. **Reportes**: Más opciones de visualización (gráfico de pastel, tendencias)
4. **Perfil de usuario**: Página para editar nombre, avatar, preferencias
5. **Notificaciones**: Recordatorios de transacciones recurrentes
6. **Backup/Export**: Descargar datos en JSON/CSV

---

## Comandos Útiles

```bash
# Iniciar contenedores
make up

# Ver logs
make logs
make logs-backend
make logs-frontend

# Migraciones
make migrate
make fresh  # migrate:fresh --seed

# Tests
make test

# Limpiar cache
make cache-clear
```

---

## Referencias

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [DaisyUI](https://daisyui.com)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
