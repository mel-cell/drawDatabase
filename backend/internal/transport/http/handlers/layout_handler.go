package handlers

import (
	"backend/internal/domain"
	"context"

	"github.com/gofiber/fiber/v2"
)

type LayoutHandler struct {
	service domain.LayoutService
}

func NewLayoutHandler(service domain.LayoutService) *LayoutHandler {
	return &LayoutHandler{service: service}
}

func (h *LayoutHandler) Save(c *fiber.Ctx) error {
	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil { return c.Status(400).JSON(fiber.Map{"error": "invalid json"}) }
	if err := h.service.Save(context.Background(), body); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "layout saved"})
}

func (h *LayoutHandler) Get(c *fiber.Ctx) error {
	layout, err := h.service.Get(context.Background())
	if err != nil { return c.Status(500).JSON(fiber.Map{"error": err.Error()}) }
	return c.JSON(layout)
}
