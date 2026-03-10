.PHONY: help build up down restart logs logs-backend logs-frontend logs-nginx logs-db ps stop clean migrate seed test lint frontend-install backend-install

help:
	@echo "Expense Tracker - Comandos disponibles"
	@echo "========================================"
	@echo "make up              - Iniciar todos los contenedores"
	@echo "make down            - Detener todos los contenedores"
	@echo "make restart         - Reiniciar todos los contenedores"
	@echo "make logs            - Ver logs de todos los servicios"
	@echo "make logs-backend    - Ver logs del backend (Laravel)"
	@echo "make logs-frontend   - Ver logs del frontend"
	@echo "make logs-db         - Ver logs de la base de datos"
	@echo "make ps              - Ver estado de los contenedores"
	@echo "make stop            - Detener todos los contenedores"
	@echo "make clean           - Eliminar contenedores y volúmenes"
	@echo "make migrate         - Ejecutar migraciones de Laravel"
	@echo "make seed            - Ejecutar seeders de Laravel"
	@echo "make tinker          - Abrir tinker de Laravel"
	@echo "make test            - Ejecutar tests de Laravel"
	@echo "make backend-install - Instalar dependencias de Laravel"
	@echo "make frontend-install - Instalar dependencias del frontend"
	@echo "make fresh           - Recrear la base de datos (migrate + seed)"

# Docker Compose
up:
	docker-compose up -d

down:
	docker-compose down

stop:
	docker-compose stop

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-nginx:
	docker-compose logs -f nginx

logs-db:
	docker-compose logs -f database

ps:
	docker-compose ps

clean:
	docker-compose down -v

# Laravel / Backend
migrate:
	docker-compose exec backend php artisan migrate

seed:
	docker-compose exec backend php artisan db:seed

fresh:
	docker-compose exec backend php artisan migrate:fresh --seed

tinker:
	docker-compose exec backend php artisan tinker

test:
	docker-compose exec backend php artisan test

cache-clear:
	docker-compose exec backend php artisan cache:clear
	docker-compose exec backend php artisan config:clear
	docker-compose exec backend php artisan route:clear
	docker-compose exec backend php artisan view:clear

route-list:
	docker-compose exec backend php artisan route:list

make-key:
	docker-compose exec backend php artisan key:generate

backend-install:
	docker-compose exec backend composer install

# Frontend
frontend-install:
	docker-compose exec frontend npm install

frontend-build:
	docker-compose exec frontend npm run build

frontend-lint:
	docker-compose exec frontend npm run lint
