package handlers

import (
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

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
