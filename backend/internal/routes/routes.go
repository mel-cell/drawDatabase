package routes

import (
	"backend/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/health", handlers.HealthCheck)
	api.Get("/schema", handlers.GetSchema)
	api.Get("/databases", handlers.GetDatabases)
    api.Post("/databases", handlers.CreateDatabase)
    api.Post("/databases/rename", handlers.RenameDatabase)
    api.Delete("/databases", handlers.DropDatabase)
	api.Post("/tables", handlers.CreateTable)
	api.Delete("/tables", handlers.DeleteTable)
	api.Get("/data", handlers.GetTableData)       // Read
	api.Post("/data", handlers.InsertData)        // Create
	api.Delete("/data", handlers.DeleteData)      // Delete
	api.Post("/execute", handlers.ExecuteQuery)   // Raw SQL
	api.Post("/databases", handlers.CreateDatabase) // Create DB
    
    api.Post("/layout", handlers.SaveLayout)
    api.Get("/layout", handlers.GetLayout)
}
