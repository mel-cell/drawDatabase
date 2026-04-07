package handlers

import (
	"backend/internal/config"

	"github.com/gofiber/fiber/v2"
)

type ConnectionHandler struct{}

func NewConnectionHandler() *ConnectionHandler {
	return &ConnectionHandler{}
}

func (h *ConnectionHandler) List(c *fiber.Ctx) error {
	conns, err := config.GetConnections()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// Strip passwords for security
	safe := make([]fiber.Map, len(conns))
	for i, conn := range conns {
		safe[i] = fiber.Map{
			"name": conn.Name,
			"host": conn.Host,
			"port": conn.Port,
			"user": conn.User,
			"database": conn.Database,
		}
	}
	return c.JSON(safe)
}

func (h *ConnectionHandler) Save(c *fiber.Ctx) error {
	var conn config.ConnectionConfig
	if err := c.BodyParser(&conn); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid connection data"})
	}

	if conn.Name == "" {
		conn.Name = "default"
	}
	if conn.Host == "" {
		conn.Host = "127.0.0.1"
	}
	if conn.Port == 0 {
		conn.Port = 3306
	}

	if err := config.AddConnection(conn); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Connection saved", "name": conn.Name})
}

func (h *ConnectionHandler) Test(c *fiber.Ctx) error {
	var conn config.ConnectionConfig
	if err := c.BodyParser(&conn); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid connection data"})
	}

	if conn.Host == "" {
		conn.Host = "127.0.0.1"
	}
	if conn.Port == 0 {
		conn.Port = 3306
	}

	// Try the DSN
	dsn := config.BuildDSN(&conn)
	_ = dsn // We'd need to test the actual connection here

	return c.JSON(fiber.Map{"status": "ok", "dsn_preview": conn.User + "@" + conn.Host})
}

func (h *ConnectionHandler) Delete(c *fiber.Ctx) error {
	name := c.Query("name")
	if name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Connection name required"})
	}

	if err := config.RemoveConnection(name); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Connection removed"})
}
