package handlers

import (
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

func SaveLayout(c *fiber.Ctx) error {
    var layouts map[string]services.Position
    if err := c.BodyParser(&layouts); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
    }
    
    if err := services.SaveLayout(layouts); err != nil {
         return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    return c.JSON(fiber.Map{"message": "Layout saved"})
}

func GetLayout(c *fiber.Ctx) error {
    layout, err := services.GetLayout()
    if err != nil {
         return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    return c.JSON(layout)
}
