package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/services"
	"fmt"

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

	if err := services.SyncTable(req); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Table synced successfully"})
}

func DeleteTable(c *fiber.Ctx) error {
	tableName := c.Query("name")
	if tableName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Table name required"})
	}

	if err := services.DropTable(tableName); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Table deleted successfully"})
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

func InsertData(c *fiber.Ctx) error {
	tableName := c.Query("table")
	if tableName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Table name required"})
	}

	var data map[string]interface{}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON body"})
	}

	if err := services.InsertTableData(tableName, data); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Data inserted"})
}

func DeleteData(c *fiber.Ctx) error {
    tableName := c.Query("table")
    if tableName == "" {
        return c.Status(400).JSON(fiber.Map{"error": "Table name required"})
    }
    
    // Expecting body: { "id": 1 } or { "col": "val" }
    var condition map[string]interface{}
    if err := c.BodyParser(&condition); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON body"})
    }
    
    if err := services.DeleteTableData(tableName, condition); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message": "Data deleted"})
}

func ExecuteQuery(c *fiber.Ctx) error {
    type Payload struct {
        Query string `json:"query"`
    }
    
    var body Payload
    if err := c.BodyParser(&body); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
    }
    
    if body.Query == "" {
        return c.Status(400).JSON(fiber.Map{"error": "Query cannot be empty"})
    }
    
    results, err := services.ExecuteRawQuery(body.Query)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    	return c.JSON(results)
}

func CreateDatabase(c *fiber.Ctx) error {
    type Payload struct {
        Name string `json:"name"`
    }
    
    var body Payload
    if err := c.BodyParser(&body); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
    }
    
    if body.Name == "" {
        return c.Status(400).JSON(fiber.Map{"error": "Database name required"})
    }
    
    // Validate name (alphanumeric only recommended to prevent injection)
    // For now simple exec
    if err := database.DB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s`", body.Name)).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message": "Database created"})
}
