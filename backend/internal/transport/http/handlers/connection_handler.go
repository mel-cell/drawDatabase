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
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body format"})
	}
    
    // Cari password di saved connections jika tidak dikirim (keamanan frontend)
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
    fmt.Printf("Attempting to Apply connection: %s@%s:%d (DB: %s)\n", conn.User, conn.Host, conn.Port, conn.Database)
    
    database.Connect(dsn)
    
    // database.DB sekarang dijamin nil jika gagal (karena fix kita di database.go)
    if database.DB == nil {
        return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not connect to MySQL. Check credentials ddan Host."})
    }

    // Hanya update repository jika koneksi benar-benar sehat
    h.repo.SetDB(database.DB)

    return c.JSON(fiber.Map{"status": "ok", "message": "Connection applied successfully"})
}

func (h *ConnectionHandler) Test(c *fiber.Ctx) error {
	var conn config.ConnectionConfig
	if err := c.BodyParser(&conn); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body format"})
	}

	if conn.Host == "" { conn.Host = "127.0.0.1" }
	if conn.Port == 0 { conn.Port = 3306 }

	dsn := config.BuildDSN(&conn)
    fmt.Printf("Testing connection: %s@%s:%d\n", conn.User, conn.Host, conn.Port)
    
    if conn.User == "" {
        return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Username is required"})
    }

    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
        return c.Status(400).JSON(fiber.Map{"status": "error", "message": fmt.Sprintf("Network connection failed: %v", err)})
    }
    
    // Cek apakah DB yang dikembalikan punya error internal
    if db.Error != nil {
        return c.Status(400).JSON(fiber.Map{"status": "error", "message": fmt.Sprintf("MySQL Error: %v", db.Error)})
    }
    
    sqlDB, err := db.DB()
    if err == nil {
        defer sqlDB.Close()
    }

	return c.JSON(fiber.Map{"status": "ok", "message": "Connection test successful!"})
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
