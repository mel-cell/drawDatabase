package database

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(dsn string) {
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("Warning: Failed to connect to database: %v", err)
	} else {
		log.Println("Database connected successfully")
	}
}
