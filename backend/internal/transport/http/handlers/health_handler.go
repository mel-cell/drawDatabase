package handlers

import "github.com/gofiber/fiber/v2"

func HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "up",
		"message": "DrawDatabase Backend is running",
	})
}
