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
	api.Post("/tables", handlers.CreateTable)
	api.Get("/data", handlers.GetTableData)       // Read
	api.Post("/data", handlers.InsertData)        // Create
	api.Delete("/data", handlers.DeleteData)      // Delete
	api.Post("/execute", handlers.ExecuteQuery)   // Raw SQL
	api.Post("/databases", handlers.CreateDatabase) // Create DB
}
