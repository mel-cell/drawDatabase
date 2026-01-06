.PHONY: dev dev-backend dev-frontend setup

# Default target
dev:
	@echo "Starting DrawDatabase..."
	@make -j 2 dev-backend dev-frontend

dev-backend:
	@echo "Starting Backend..."
	@cd backend && air || go run cmd/server/main.go

dev-frontend:
	@echo "Starting Frontend..."
	@cd frontend && npm run dev

setup:
	@echo "Installing Backend Dependencies..."
	@cd backend && go mod tidy
	@echo "Installing Frontend Dependencies..."
	@cd frontend && npm install
	@echo "Setup Complete!"
