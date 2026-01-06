package handlers

import (
	"backend/internal/models"
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

func HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "DrawDatabase Backend is running",
	})
}

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

func GetDatabases(c *fiber.Ctx) error {
	dbs, err := services.GetDatabases()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(dbs)
}

func CreateTable(c *fiber.Ctx) error {
	var req models.CreateTableRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := services.CreateTable(req); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Table created successfully"})
}

func GetTableData(c *fiber.Ctx) error {
	tableName := c.Query("table")
	if tableName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Table name is required"})
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 50)
	offset := (page - 1) * limit

	data, err := services.GetTableData(tableName, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(data)
}
