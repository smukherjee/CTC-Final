# Makefile for TAM Platform development

.PHONY: help dev-up dev-down dev-logs dev-ps build-all clean reset rebuild-frontend rebuild-backend

help:
	@echo "TAM Platform - Development Commands"
	@echo "===================================="
	@echo ""
	@echo "Infrastructure:"
	@echo "  make dev-up       - Start all dev services"
	@echo "  make dev-down     - Stop all services"
	@echo "  make dev-logs     - Tail logs from all services"
	@echo "  make dev-ps       - Show running containers"
	@echo ""
	@echo "  make build-all       - Build everything"
	@echo ""
	@echo "Utils:"
	@echo "  make clean        - Remove build artifacts"
	@echo "  make reset        - Stop services and delete all volumes"
	@echo ""
	@echo "  make rebuild-frontend - rebuilds with no-cache option and deploys in docker"
	@echo "  make rebuild-backend  - rebuilds backend and deploys to docker"

# Infrastructure targets

dev-up:
	docker-compose up -d --build

dev-down:
	docker-compose down

dev-logs:
	docker-compose logs -f

dev-ps:
	docker-compose ps

build-all:
	# build all components and restart services within Docker
	docker-compose build
	cd frontend && npm install && npm run build || true
	# backend build steps could go here
	# redeploy containers using the freshly built images
	docker-compose up -d --remove-orphans

# Utility targets

clean:
	@echo "Removing build artifacts..."
	rm -rf frontend/dist frontend/build
	# add other clean commands as necessary

reset:
	@echo "Stopping services and removing volumes..."
	docker-compose down -v

rebuild-frontend:
	@echo "Rebuilding frontend with no-cache and deploying..."
	docker-compose build --no-cache frontend && docker-compose up -d frontend

rebuild-backend:
	@echo "Rebuilding backend and deploying..."
	docker-compose build --no-cache backend && docker-compose up -d backend
