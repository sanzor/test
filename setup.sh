#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_COMPOSE_FILE="$ROOT_DIR/yml/db.yml"
REDIS_COMPOSE_FILE="$ROOT_DIR/yml/redis.yml"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

require_command docker

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required (docker compose ...)."
  exit 1
fi

echo "Starting database container..."
docker compose -f "$DB_COMPOSE_FILE" up -d

echo "Starting redis container..."
docker compose -f "$REDIS_COMPOSE_FILE" up -d

echo "Waiting for PostgreSQL to become ready..."
for _ in $(seq 1 60); do
  if docker compose -f "$DB_COMPOSE_FILE" exec -T school-mgmt-db pg_isready -U postgres -d school_mgmt >/dev/null 2>&1; then
    echo "PostgreSQL is ready."
    break
  fi
  sleep 2
done

if ! docker compose -f "$DB_COMPOSE_FILE" exec -T school-mgmt-db pg_isready -U postgres -d school_mgmt >/dev/null 2>&1; then
  echo "PostgreSQL did not become ready in time."
  exit 1
fi

echo "Applying schema..."
cat "$ROOT_DIR/seed_db/tables.sql" | docker compose -f "$DB_COMPOSE_FILE" exec -T school-mgmt-db psql -U postgres -d school_mgmt

echo "Applying seed data..."
cat "$ROOT_DIR/seed_db/seed-db.sql" | docker compose -f "$DB_COMPOSE_FILE" exec -T school-mgmt-db psql -U postgres -d school_mgmt

echo "Applying indexes..."
cat "$ROOT_DIR/seed_db/indexes.sql" | docker compose -f "$DB_COMPOSE_FILE" exec -T school-mgmt-db psql -U postgres -d school_mgmt

echo "Setup complete."
echo "Next:"
echo "  make up-backend"
echo "  make up-frontend"
