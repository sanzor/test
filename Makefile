DB_COMPOSE := docker compose -f yml/db.yml
REDIS_COMPOSE := docker compose -f yml/redis.yml
BACKEND_COMPOSE := docker compose -f yml/backend.yml
FRONTEND_COMPOSE := docker compose -f yml/frontend.yml

.PHONY: setup up-db down-db up-redis down-redis up-backend down-backend up-frontend down-frontend rebuild-app up-all down-all wait-db seed-db logs-db logs-redis logs-backend logs-frontend

setup:
	./setup.sh

up-db:
	$(DB_COMPOSE) up -d

down-db:
	$(DB_COMPOSE) down

up-redis:
	$(REDIS_COMPOSE) up -d

down-redis:
	$(REDIS_COMPOSE) down

wait-db:
	@echo "Waiting for PostgreSQL..."
	@for i in $$(seq 1 60); do \
		if $(DB_COMPOSE) exec -T school-mgmt-db pg_isready -U postgres -d school_mgmt >/dev/null 2>&1; then \
			echo "PostgreSQL is ready."; \
			exit 0; \
		fi; \
		sleep 2; \
	done; \
	echo "Timed out waiting for PostgreSQL."; \
	exit 1

seed-db:
	cat seed_db/tables.sql | $(DB_COMPOSE) exec -T school-mgmt-db psql -U postgres -d school_mgmt
	cat seed_db/seed-db.sql | $(DB_COMPOSE) exec -T school-mgmt-db psql -U postgres -d school_mgmt
	cat seed_db/indexes.sql | $(DB_COMPOSE) exec -T school-mgmt-db psql -U postgres -d school_mgmt

up-backend:
	$(BACKEND_COMPOSE) up -d

down-backend:
	$(BACKEND_COMPOSE) down

up-frontend:
	$(FRONTEND_COMPOSE) up -d

down-frontend:
	$(FRONTEND_COMPOSE) down

rebuild-app: down-frontend down-backend
	$(BACKEND_COMPOSE) up -d --force-recreate
	$(FRONTEND_COMPOSE) up -d --force-recreate

rebuild: rebuild-app

up-all: up-db wait-db up-redis up-backend up-frontend

down-all: down-frontend down-backend down-redis down-db

logs-db:
	$(DB_COMPOSE) logs -f

logs-redis:
	$(REDIS_COMPOSE) logs -f

logs-backend:
	$(BACKEND_COMPOSE) logs -f

logs-frontend:
	$(FRONTEND_COMPOSE) logs -f
