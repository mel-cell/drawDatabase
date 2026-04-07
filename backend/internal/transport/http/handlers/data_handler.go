package handlers

import (
	"backend/internal/domain"
	"context"

	"github.com/gofiber/fiber/v2"
)

type DataHandler struct {
	service domain.DataService
}

func NewDataHandler(service domain.DataService) *DataHandler {
	return &DataHandler{service: service}
}

func (h *DataHandler) GetData(c *fiber.Ctx) error {
	table := c.Query("table")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 50)
	offset := (page - 1) * limit

	data, err := h.service.GetData(context.Background(), table, limit, offset)
	if err != nil { return c.Status(500).JSON(fiber.Map{"error": err.Error()}) }
	return c.JSON(data)
}

func (h *DataHandler) Insert(c *fiber.Ctx) error {
	table := c.Query("table")
	var data map[string]interface{}
	if err := c.BodyParser(&data); err != nil { return c.Status(400).JSON(fiber.Map{"error": "invalid json"}) }
	if err := h.service.Insert(context.Background(), table, data); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "data inserted"})
}
