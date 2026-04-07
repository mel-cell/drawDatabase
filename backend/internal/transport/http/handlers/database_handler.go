package handlers

import (
	"backend/internal/domain"
	"context"

	"github.com/gofiber/fiber/v2"
)

type DatabaseHandler struct {
	service domain.DatabaseService
}

func NewDatabaseHandler(service domain.DatabaseService) *DatabaseHandler {
	return &DatabaseHandler{service: service}
}

func (h *DatabaseHandler) List(c *fiber.Ctx) error {
	dbs, err := h.service.List(context.Background())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(dbs)
}

func (h *DatabaseHandler) Create(c *fiber.Ctx) error {
	type Req struct { Name string `json:"name"` }
	var req Req
	if err := c.BodyParser(&req); err != nil { return c.Status(400).JSON(fiber.Map{"error": "invalid json"}) }
	if err := h.service.Create(context.Background(), req.Name); err != nil { 
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "database created"})
}

func (h *DatabaseHandler) Drop(c *fiber.Ctx) error {
	name := c.Query("name")
	if err := h.service.Drop(context.Background(), name); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "database dropped"})
}
