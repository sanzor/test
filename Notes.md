# Project Notes

## Summary of Additions

## Schema Comparison (Original vs Current)
- No table structure changes were made to `seed_db/tables.sql` compared to the original schema you shared:
  - no new tables
  - no removed tables
  - no column/type/constraint changes in existing tables
  - no function signature changes for existing SQL functions
- The only database change added in this implementation is **new performance indexes** in `seed_db/indexes.sql`.
- These indexes are applied after schema + seed using:
  - `make seed-db`
  - `./setup.sh`

### Student Domain (Backend)
- Implemented/finished Student CRUD controller behavior in `backend/src/modules/students/students-controller.js`.
- Added full service flow in `backend/src/modules/students/students-service.js` for:
  - list students
  - get student detail
  - add student
  - update student
  - enable/disable status
  - delete student
- Added delete student DB flow end-to-end:
  - route -> controller -> service -> repository transaction
  - repository delete logic in `backend/src/modules/students/students-repository.js`
  - route wired as `DELETE /api/v1/students/:id`

### Validation
- Added schema-based request validation middleware usage (`validateRequest`) for student routes.
- Added student schemas in `backend/src/modules/students/students-schema.js`.
- Added notice schemas in `backend/src/modules/notices/notices-schema.js`.
- Added notice payload normalization (`content` -> `description`) and validation for Issue 2.
- Updated service error mapping for student add:
  - duplicate email -> `409`
  - invalid input syntax (e.g. bad roll) -> `400`
  - unknown failure -> `500` with detail.

### Redis Usage
- Added Redis config and cache utility:
  - `backend/src/config/redis.js`
  - `backend/src/utils/cache-store.js`
- Auth session cache (hybrid with DB) in `backend/src/modules/auth/auth-session-store.js`:
  - cache refresh token <-> user mapping
  - used in login / refresh / logout flows
- Cached notice recipient read-heavy endpoints in `backend/src/modules/notices/notices-service.js`.
- Cached permission checks in `backend/src/middlewares/check-api-access.js`.
- Redis is cache/session acceleration only; Postgres remains source of truth.

### Indexes Added and Why
- Added `seed_db/indexes.sql` and applied via setup/make seed flow.
- Main indexes:
  - `user_refresh_tokens(token)` unique: fast refresh token lookup/revoke
  - `user_refresh_tokens(user_id)`: fast token cleanup by user
  - `users(role_id)`: frequent role filtering (students/staff/etc.)
  - `users(name)`: frequent name-based filtering
  - `notices(status)`, `notices(author_id)`: pending/status + author lookups
  - `permissions(role_id)`: frequent permission checks
  - `user_profiles(class_name, section_name, roll)`: student filter endpoints
  - `user_leaves(user_id|status|leave_policy_id)`: leave query performance

## Makefile / Docker Workflow

### Compose Files
- `yml/db.yml`: Postgres container
- `yml/redis.yml`: Redis container
- `yml/backend.yml`: Backend runtime container
- `yml/frontend.yml`: Frontend runtime container

### Main Targets
- `make setup`: run `setup.sh` (start db + redis + seed schema/data/indexes)
- `make up-db` / `make down-db`
- `make up-redis` / `make down-redis`
- `make up-backend` / `make down-backend`
- `make up-frontend` / `make down-frontend`
- `make up-all` / `make down-all`
- `make rebuild-app`: tear down frontend/backend and recreate both
- `make logs-db|logs-redis|logs-backend|logs-frontend`

### Requirements to Use Makefile
- Docker + Docker Compose v2 installed
- Ports available (or updated in compose/env):
  - frontend `5173`
  - backend `5007`
  - db host port default `5433` (mapped to container 5432)
  - redis host port `6379`
- Correct backend env:
  - `DATABASE_URL`
  - `REDIS_URL`
  - JWT/CSRF secrets
  - `RESEND_API_KEY` + `MAIL_FROM_USER` for email delivery

## Frontend Fixes
- Fixed Add Notice issue (description not saved):
  - changed add notice defaults to `description`
  - changed form registration from `content` to `description`
  - files:
    - `frontend/src/domains/notice/pages/add-notice-page.tsx`
    - `frontend/src/domains/notice/components/notice-form.tsx`
- Wired student row-menu Delete action:
  - added delete mutation in student API
  - hooked action in menu handler
  - added "Delete Student" option in row action menu

## Testing
- Added Jest scaffolding in backend:
  - `backend/jest.config.js`
  - tests:
    - `backend/src/modules/students/students-controller.test.js`
    - `backend/src/modules/students/students-service.test.js`
- Added `npm test` script in `backend/package.json`.
- Note: run `npm install` in backend to install Jest before running tests.

## Recommended Next Steps
- Add DB migration tool (for production-ready schema evolution).
- Add integration tests for student endpoints (`supertest` against app).
- Improve Redis fallback logging/health endpoint (`/health` for db+redis).
- Decide clear policy for duplicate email handling UX (show existing user context).
