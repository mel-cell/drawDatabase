package routes

import (
	"backend/internal/domain"
	_handlers "backend/internal/transport/http/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(
	app *fiber.App, 
	syncService domain.SyncService,
	dbService domain.DatabaseService,
	dataService domain.DataService,
	layoutService domain.LayoutService,
	repo domain.SchemaRepository,
) {
	api := app.Group("/api")

	schemaH := _handlers.NewSchemaHandler(syncService)
	dbH := _handlers.NewDatabaseHandler(dbService)
	dataH := _handlers.NewDataHandler(dataService)
	layoutH := _handlers.NewLayoutHandler(layoutService)

	api.Get("/health", _handlers.HealthCheck)

	// Schema & Sync
	api.Get("/schema", schemaH.GetSchema)
	api.Post("/tables/sync", schemaH.SyncBatch)
	
	// Database Management
	api.Get("/databases", dbH.List)
	api.Post("/databases", dbH.Create)
	api.Delete("/databases", dbH.Drop)

	// Data Browser
	api.Get("/data", dataH.GetData)
	api.Post("/data", dataH.Insert)

	// Layout Persistence
	api.Get("/layout", layoutH.Get)
	api.Post("/layout", layoutH.Save)

	// Connection Management
	connH := _handlers.NewConnectionHandler(repo)
	api.Get("/connections", connH.List)
	api.Post("/connections", connH.Save)
	api.Post("/connections/apply", connH.Apply)
	api.Post("/connections/test", connH.Test)
	api.Delete("/connections", connH.Delete)
}
