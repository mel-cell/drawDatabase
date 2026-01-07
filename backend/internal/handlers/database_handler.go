package handlers

import (
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

func GetDatabases(c *fiber.Ctx) error {
    dbs, err := services.GetDatabases()
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": err.Error(),
        })
    }
    return c.JSON(dbs)
}

func CreateDatabase(c *fiber.Ctx) error {
    type Payload struct {
        Name string `json:"name"`
    }
    
    var body Payload
    if err := c.BodyParser(&body); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
    }
    
    if err := services.CreateDatabase(body.Name); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message": "Database created"})
}

func DropDatabase(c *fiber.Ctx) error {
    name := c.Query("name")
    if err := services.DropDatabase(name); err != nil {
        if err.Error() == "cannot drop system database" {
             return c.Status(403).JSON(fiber.Map{"error": err.Error()})
        }
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    return c.JSON(fiber.Map{"message": "Database dropped"})
}

func RenameDatabase(c *fiber.Ctx) error {
    type Payload struct {
        OldName string `json:"old_name"`
        NewName string `json:"new_name"`
    }
    
    var body Payload
    if err := c.BodyParser(&body); err != nil {
         return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
    }
    
    if err := services.RenameDatabase(body.OldName, body.NewName); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message": "Database renamed"})
}
