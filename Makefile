# Makefile for CTC ERP — development and CI orchestration

.PHONY: help \
        dev-up dev-down dev-logs dev-ps \
        build-all clean reset \
        rebuild-frontend rebuild-backend \
        migrate seed seed-sample

# ─── Colours ──────────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

# ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "$(CYAN)CTC ERP — Development Commands$(RESET)"
	@echo "================================"
	@echo ""
	@echo "  $(CYAN)make build-all$(RESET)        Full clean rebuild: reset → clean → build → up → seed"
	@echo ""
	@echo "  $(CYAN)make dev-up$(RESET)           Start all dev services (build if needed)"
	@echo "  $(CYAN)make dev-down$(RESET)         Stop all running services"
	@echo "  $(CYAN)make dev-logs$(RESET)         Tail combined service logs"
	@echo "  $(CYAN)make dev-ps$(RESET)           Show running container status"
	@echo ""
	@echo "  $(CYAN)make migrate$(RESET)          Run alembic upgrade head inside the backend container"
	@echo "  $(CYAN)make seed$(RESET)             Seed cities master data (idempotent)"
	@echo "  $(CYAN)make seed-sample$(RESET)      Seed full 15-scenario sample dataset (idempotent)"
	@echo ""
	@echo "  $(CYAN)make clean$(RESET)            Remove local build artefacts (frontend dist)"
	@echo "  $(CYAN)make reset$(RESET)            Stop services and delete ALL Docker volumes (destructive)"
	@echo ""
	@echo "  $(CYAN)make rebuild-frontend$(RESET) No-cache rebuild of frontend image and redeploy"
	@echo "  $(CYAN)make rebuild-backend$(RESET)  No-cache rebuild of backend image and redeploy"
	@echo ""

# ─── Full clean build ─────────────────────────────────────────────────────────
# Sequence:
#   1. reset  — stop containers, wipe volumes (fresh DB)
#   2. clean  — remove local build artefacts
#   3. npm ci + npm run build — compile frontend assets locally (validates TS)
#   4. docker-compose build — rebuild all images with no layer cache
#   5. docker-compose up -d — start DB → backend (runs migrations + city seed) → frontend
#   6. wait   — poll backend /openapi.json until it responds (confirms startup)
#   7. seed-sample — load comprehensive 15-scenario sample data

build-all: reset clean
	@echo ""
	@echo "$(CYAN)[1/5] Building frontend assets...$(RESET)"
	cd frontend && npm ci && npm run build

	@echo ""
	@echo "$(CYAN)[2/5] Building Docker images (no cache)...$(RESET)"
	docker-compose build --no-cache

	@echo ""
	@echo "$(CYAN)[3/5] Starting services...$(RESET)"
	docker-compose up -d --remove-orphans

	@echo ""
	@echo "$(CYAN)[4/5] Waiting for backend to be ready...$(RESET)"
	@echo "  (migrations + seed data run automatically on startup)"
	@until curl -sf http://localhost:8000/openapi.json > /dev/null 2>&1; do \
		printf '.'; sleep 3; \
	done
	@echo " backend ready."

	@echo ""
	@echo "$(CYAN)[5/5] Loading sample data...$(RESET)"
	$(MAKE) seed-sample

	@echo ""
	@echo "$(CYAN)build-all complete.$(RESET)"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API docs: http://localhost:8000/docs"

# ─── Dev lifecycle ────────────────────────────────────────────────────────────

dev-up:
	docker-compose up -d --build

dev-down:
	docker-compose down

dev-logs:
	docker-compose logs -f

dev-ps:
	docker-compose ps

# ─── DB operations ────────────────────────────────────────────────────────────

migrate:
	@echo "Running alembic upgrade head..."
	docker-compose exec -T backend alembic upgrade head

seed:
	@echo "Seeding comprehensive sample data (includes well-known cities)..."
	docker-compose exec -T backend python app/scripts/seed_comprehensive_sample_data.py

seed-sample:
	@echo "Seeding comprehensive 15-scenario sample data..."
	docker-compose exec -T backend python app/scripts/seed_comprehensive_sample_data.py

# ─── Utility ──────────────────────────────────────────────────────────────────

clean:
	@echo "Removing build artefacts..."
	rm -rf frontend/dist frontend/build frontend/.vite
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find backend -name "*.pyc" -delete 2>/dev/null || true

reset:
	@echo "Stopping services and removing all volumes (DATA WILL BE LOST)..."
	docker-compose down -v --remove-orphans

rebuild-frontend:
	@echo "Rebuilding frontend image (no cache) and redeploying..."
	docker-compose build --no-cache frontend
	docker-compose up -d frontend

rebuild-backend:
	@echo "Rebuilding backend image (no cache) and redeploying..."
	docker-compose build --no-cache backend
	docker-compose up -d backend
