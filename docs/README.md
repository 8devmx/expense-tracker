# Documentación del Proyecto

Este directorio contiene la documentación necesaria para entender y continuar el desarrollo del proyecto Expense Tracker.

## Archivos

- [Overview](./overview.md) - Visión general del proyecto, estado actual y funcionalidades implementadas.
- [README](../README.md) - Instrucciones de instalación y configuración del proyecto.

## Estructura del Proyecto

```
expense-tracker/
├── api/                 # Backend Laravel (PHP)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/           # Controladores de API
│   │   │   └── Auth/          # Controladores de autenticación
│   │   ├── Models/            # Modelos Eloquent
│   │   └── Services/          # Servicios business logic
│   ├── database/
│   │   ├── migrations/        # Migraciones de base de datos
│   │   └── seeders/          # Seeders para datos iniciales
│   └── routes/               # Definición de rutas
├── front/               # Frontend React + Vite
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── contexts/          # Contextos de React (auth, theme)
│   │   ├── pages/             # Páginas de la aplicación
│   │   ├── services/          # Servicios API
│   │   └── utils/            # Utilidades
│   └── package.json
├── docker-compose.yml   # Configuración de servicios Docker
├── Makefile           # Comandos útiles para el proyecto
└── docs/              # Documentación del proyecto
```

## Tecnologías

- **Backend**: Laravel 10 + Sanctum
- **Frontend**: React 19 + Vite
- **Base de datos**: MySQL 8.0
- **Servidor web**: Nginx
- **Autenticación**: Google OAuth 2.0
- **Estilos**: Tailwind CSS + DaisyUI

## Links Rápidos

- [Documentación de API](./overview.md#api-endpoints)
- [Modelos de datos](./overview.md#modelos-de-base-de-datos)
- [Funcionalidades implementadas](./overview.md#funcionalidades-implementadas)
