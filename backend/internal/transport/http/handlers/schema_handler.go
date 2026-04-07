package handlers

import (
	"backend/internal/domain"
	"context"

	"github.com/gofiber/fiber/v2"
)

type SchemaHandler struct {
	service domain.SyncService
}

func NewSchemaHandler(service domain.SyncService) *SchemaHandler {
	return &SchemaHandler{service: service}
}

func (h *SchemaHandler) GetSchema(c *fiber.Ctx) error {
	dbName := c.Query("db")
	if dbName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "db name required"})
	}

	schema, err := h.service.GetSchema(context.Background(), dbName)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(schema)
}

func (h *SchemaHandler) SyncBatch(c *fiber.Ctx) error {
	dbName := c.Query("db")
	var reqs []domain.TableRequest
	if err := c.BodyParser(&reqs); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}

	if err := h.service.SyncBatch(context.Background(), dbName, reqs); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "All tables synced successfully"})
}
