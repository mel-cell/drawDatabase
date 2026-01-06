package config

import (
	"os"
)

type Config struct {
	ServerPort string
	DSN        string // Database Connection String
}

func LoadConfig() *Config {
	// Defaults
	dsn := "root:root@tcp(127.0.0.1:3306)/draw_db?charset=utf8mb4&parseTime=True&loc=Local"
	port := ":3000"

	if envDSN := os.Getenv("DB_DSN"); envDSN != "" {
		dsn = envDSN
	}
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	return &Config{
		ServerPort: port,
		DSN:        dsn,
	}
}
