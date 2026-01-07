package handlers

import (
	"backend/internal/models"
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

func GetSchema(c *fiber.Ctx) error {
	dbName := c.Query("db")
	schema, err := services.GetDatabaseSchema(dbName)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(schema)
}

func CreateTable(c *fiber.Ctx) error {
	var req models.CreateTableRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := services.SyncTable(req); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Table synced successfully"})
}

func DeleteTable(c *fiber.Ctx) error {
	tableName := c.Query("name")
	if err := services.DropTable(tableName); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Table deleted successfully"})
}
