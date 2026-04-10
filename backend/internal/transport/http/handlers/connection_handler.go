package handlers

import (
	"backend/internal/config"
	"backend/internal/database"
    "backend/internal/domain"
    "fmt"

	"github.com/gofiber/fiber/v2"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

type ConnectionHandler struct{
    repo domain.SchemaRepository
}

func NewConnectionHandler(repo domain.SchemaRepository) *ConnectionHandler {
	return &ConnectionHandler{repo: repo}
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
            "type": "mysql", // Default for now
		}
	}
	return c.JSON(safe)
}

func (h *ConnectionHandler) Save(c *fiber.Ctx) error {
	var conn config.ConnectionConfig
	if err := c.BodyParser(&conn); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid connection data"})
	}

	if conn.Name == "" { conn.Name = "default" }
	if conn.Host == "" { conn.Host = "127.0.0.1" }
	if conn.Port == 0 { conn.Port = 3306 }

	if err := config.AddConnection(conn); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Connection saved", "name": conn.Name})
}

// Apply sets the active connection globally
func (h *ConnectionHandler) Apply(c *fiber.Ctx) error {
    var conn config.ConnectionConfig
	if err := c.BodyParser(&conn); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
    
    if conn.Password == "" {
        saved, _ := config.GetConnections()
        for _, sc := range saved {
            if sc.Name == conn.Name {
                conn.Password = sc.Password
                break
            }
        }
    }

    dsn := config.BuildDSN(&conn)
    fmt.Printf("Applying connection: %s@%s:%d\n", conn.User, conn.Host, conn.Port)
    
    database.Connect(dsn)
    
    if database.DB == nil {
        return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to connect to MySQL. Check credentials ddan if server is running."})
    }
    
    // UPDATE THE REPOSITORY!
    h.repo.SetDB(database.DB)

    return c.JSON(fiber.Map{"status": "ok", "message": "Connection applied successfully"})
}

func (h *ConnectionHandler) Test(c *fiber.Ctx) error {
	var conn config.ConnectionConfig
	if err := c.BodyParser(&conn); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	if conn.Host == "" { conn.Host = "127.0.0.1" }
	if conn.Port == 0 { conn.Port = 3306 }

	dsn := config.BuildDSN(&conn)
    fmt.Printf("Testing connection to: %s@%s:%d\n", conn.User, conn.Host, conn.Port)
    
    // Explicitly check for empty user/host to avoid weird DSNs
    if conn.User == "" || conn.Host == "" {
        return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Username ddan Host are required"})
    }

    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
        return c.Status(400).JSON(fiber.Map{"status": "error", "message": fmt.Sprintf("Connection failed: %v", err)})
    }
    
    sqlDB, err := db.DB()
    if err == nil {
        defer sqlDB.Close()
    }

	return c.JSON(fiber.Map{"status": "ok", "message": "Successfully connected to MySQL server!"})
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
