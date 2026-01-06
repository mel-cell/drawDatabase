package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/routes"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Connect to Database
	database.Connect(cfg.DSN)

	// 3. Initialize Fiber App
	app := fiber.New()

	// 4. Middleware
	app.Use(cors.New())

	// 5. Setup Routes
	routes.SetupRoutes(app)

	// 6. Start Server
	log.Printf("Server listening on port %s", cfg.ServerPort)
	log.Fatal(app.Listen(cfg.ServerPort))
}
