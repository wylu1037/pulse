# Pulse - Makefile for local development
# Cross-platform builds are handled by GitHub Actions

.PHONY: all build frontend backend dev clean help

# Default target
all: build

# Build output
BINARY_NAME := pulse

# Directories
FRONTEND_DIR := frontend
FRONTEND_OUT := $(FRONTEND_DIR)/out
PB_PUBLIC := pb_public

# ============================================================================
# Main targets
# ============================================================================

## build: Build the complete application (frontend + backend)
build: frontend backend
	@echo "✅ Build complete: ./$(BINARY_NAME)"

## frontend: Build the frontend and copy to pb_public
frontend:
	@echo "📦 Building frontend..."
	cd $(FRONTEND_DIR) && pnpm install --frozen-lockfile
	cd $(FRONTEND_DIR) && pnpm run build
	@echo "📁 Copying frontend assets to $(PB_PUBLIC)..."
	rm -rf $(PB_PUBLIC)
	cp -r $(FRONTEND_OUT) $(PB_PUBLIC)
	@echo "✅ Frontend build complete"

## backend: Build the Go binary with embedded frontend
backend:
	@echo "🔨 Building backend..."
	go mod tidy
	go build -o $(BINARY_NAME) .
	@echo "✅ Backend build complete: ./$(BINARY_NAME)"

## dev: Run development servers (frontend + backend in parallel)
dev:
	@echo "🚀 Starting development servers..."
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8090"
	@echo "   Admin:    http://localhost:8090/_/"
	@trap 'kill 0' INT; \
		(cd $(FRONTEND_DIR) && pnpm dev) & \
		(sleep 2 && go run . serve --dev) & \
		wait

## clean: Remove all build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -f $(BINARY_NAME)
	rm -rf $(PB_PUBLIC)
	rm -rf $(FRONTEND_DIR)/out
	rm -rf $(FRONTEND_DIR)/.next
	@echo "✅ Clean complete"

# ============================================================================
# Help
# ============================================================================

## help: Show this help message
help:
	@echo "Pulse Makefile"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'
