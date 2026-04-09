package main

import (
	"backend/internal/config"
	infraDB "backend/internal/database"
    "backend/internal/repository/mysql"
    "backend/internal/app/schema"
    appDB "backend/internal/app/database"
    "backend/internal/app/data"
    "backend/internal/app/layout"
	"backend/internal/transport/http/routes"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Connect to Database (Global GORM instance for now)
	infraDB.Connect(cfg.DSN)
    
    // 3. Dependency Injection (Modern Style)
    repo := mysql.NewMySQLRepository(&infraDB.DB)
    
    syncSvc := schema.NewSyncService(repo)
    dbSvc := appDB.NewDatabaseService(repo)
    dataSvc := data.NewDataService(repo)
    layoutSvc := layout.NewLayoutService(repo)

	// 4. Initialize Fiber App
	app := fiber.New()

	// 5. Middleware
	app.Use(cors.New())

	// 6. Setup Routes (Connect Services to Handlers)
	routes.SetupRoutes(app, syncSvc, dbSvc, dataSvc, layoutSvc)

	// 7. Start Server
	log.Printf("Server listening on port %s (Clean Architecture)", cfg.ServerPort)
	log.Fatal(app.Listen(cfg.ServerPort))
}
