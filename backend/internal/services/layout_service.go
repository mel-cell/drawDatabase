package services

import (
	"backend/internal/database"
)

type Position struct {
    X int `json:"x"`
    Y int `json:"y"`
}

func EnsureLayoutTable() error {
    return database.DB.Exec(`
        CREATE TABLE IF NOT EXISTS _layout (
            table_name VARCHAR(255) PRIMARY KEY,
            x INT,
            y INT
        )
    `).Error
}

func SaveLayout(layouts map[string]Position) error {
    if err := EnsureLayoutTable(); err != nil {
        return err
    }
    
    // Batch upsert or individual replace
    for name, pos := range layouts {
        // MySQL REPLACE INTO
        err := database.DB.Exec("REPLACE INTO _layout (table_name, x, y) VALUES (?, ?, ?)", name, pos.X, pos.Y).Error
        if err != nil {
            return err
        }
    }
    return nil
}

func GetLayout() (map[string]Position, error) {
    // If table doesn't exist, return empty
    var count int64
    database.DB.Raw("SHOW TABLES LIKE '_layout'").Count(&count)
    if count == 0 {
        return make(map[string]Position), nil
    }

    var rows []struct {
        TableName string
        X         int
        Y         int
    }
    if err := database.DB.Raw("SELECT * FROM _layout").Scan(&rows).Error; err != nil {
        return nil, err
    }
    
    res := make(map[string]Position)
    for _, r := range rows {
        res[r.TableName] = Position{X: r.X, Y: r.Y}
    }
    return res, nil
}
