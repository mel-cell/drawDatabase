package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"sync"
)

type ConnectionConfig struct {
	Name     string `json:"name"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Database string `json:"database,omitempty"`
}

type Config struct {
	ServerPort string
	DSN        string
}

const connectionsFile = "connections.json"

var (
	mu sync.Mutex
)

func getConfigPath() string {
	exe, _ := os.Executable()
	return filepath.Join(filepath.Dir(exe), connectionsFile)
}

func getLocalConfigPath() string {
	return connectionsFile
}

// LoadConfig loads server config with sensible defaults
func LoadConfig() *Config {
	dsn := "root:root@tcp(127.0.0.1:3306)/?charset=utf8mb4&parseTime=True&loc=Local"
	port := ":3000"

	if envDSN := os.Getenv("DB_DSN"); envDSN != "" {
		dsn = envDSN
	}
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	// Try to load from connections.json
	conn, err := GetActiveConnection()
	if err == nil && conn != nil {
		dsn = BuildDSN(conn)
	}

	return &Config{
		ServerPort: port,
		DSN:        dsn,
	}
}

// BuildDSN constructs a MySQL DSN from a ConnectionConfig
func BuildDSN(c *ConnectionConfig) string {
	port := strconv.Itoa(c.Port)
	if c.Port == 0 {
		port = "3306"
	}
	dsn := c.User + ":" + c.Password + "@tcp(" + c.Host + ":" + port + ")/"
	if c.Database != "" {
		dsn += c.Database
	}
	dsn += "?charset=utf8mb4&parseTime=True&loc=Local"
	return dsn
}

// GetConnections reads all saved connections
func GetConnections() ([]ConnectionConfig, error) {
	mu.Lock()
	defer mu.Unlock()

	data, err := os.ReadFile(getLocalConfigPath())
	if err != nil {
		if os.IsNotExist(err) {
			return []ConnectionConfig{}, nil
		}
		return nil, err
	}

	var conns []ConnectionConfig
	if err := json.Unmarshal(data, &conns); err != nil {
		return nil, err
	}
	return conns, nil
}

// SaveConnections writes connections to JSON file
func SaveConnections(conns []ConnectionConfig) error {
	mu.Lock()
	defer mu.Unlock()

	data, err := json.MarshalIndent(conns, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(getLocalConfigPath(), data, 0644)
}

// GetActiveConnection returns the first connection (or nil if none)
func GetActiveConnection() (*ConnectionConfig, error) {
	conns, err := GetConnections()
	if err != nil || len(conns) == 0 {
		return nil, err
	}
	return &conns[0], nil
}

// AddConnection adds a new connection and saves
func AddConnection(conn ConnectionConfig) error {
	conns, err := GetConnections()
	if err != nil {
		conns = []ConnectionConfig{}
	}

	// Replace if same name exists
	found := false
	for i, c := range conns {
		if c.Name == conn.Name {
			conns[i] = conn
			found = true
			break
		}
	}
	if !found {
		conns = append(conns, conn)
	}

	return SaveConnections(conns)
}

// RemoveConnection removes a connection by name
func RemoveConnection(name string) error {
	conns, err := GetConnections()
	if err != nil {
		return err
	}

	filtered := make([]ConnectionConfig, 0)
	for _, c := range conns {
		if c.Name != name {
			filtered = append(filtered, c)
		}
	}

	return SaveConnections(filtered)
}
