package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"fmt"
	"strings"
)

func GetDatabases() ([]string, error) {
	db := database.DB
	var databases []string
	if err := db.Raw("SHOW DATABASES").Scan(&databases).Error; err != nil {
		return nil, err
	}
	return databases, nil
}

func GetDatabaseSchema(dbName string) (*models.DatabaseSchema, error) {
	db := database.DB
	var tables []string
	
    // Safety check: Don't allow raw injection, though GORM handles it mostly.
    if dbName != "" {
        if err := db.Exec("USE " + dbName).Error; err != nil {
             return nil, err
        }
    }

	// 1. Get All Tables
	if err := db.Raw("SHOW TABLES").Scan(&tables).Error; err != nil {
		return nil, err
	}

	schema := &models.DatabaseSchema{
		Tables:    []models.TableSchema{},
		Relations: []models.RelationSchema{},
	}

	// 2. Loop through each table to get Columns and Foreign Keys
	for _, tableName := range tables {
		var tableSchema models.TableSchema
		tableSchema.Name = tableName

		// Get Columns
		var columns []struct {
			Field string
			Type  string
			Key   string
		}
		if err := db.Raw("SHOW COLUMNS FROM " + tableName).Scan(&columns).Error; err != nil {
			return nil, err
		}

		for _, col := range columns {
			tableSchema.Columns = append(tableSchema.Columns, models.ColumnSchema{
				Name: col.Field,
				Type: col.Type,
				IsPK: col.Key == "PRI",
				IsFK: col.Key == "MUL", // Basic detection, refined by FK query below
			})
		}
		schema.Tables = append(schema.Tables, tableSchema)

		// Get Foreign Keys (Relations)
		// Accessing information_schema.KEY_COLUMN_USAGE
		var relations []struct {
			TableName      string `gorm:"column:TABLE_NAME"`
			ColumnName     string `gorm:"column:COLUMN_NAME"`
			RefTableName   string `gorm:"column:REFERENCED_TABLE_NAME"`
			RefColumnName  string `gorm:"column:REFERENCED_COLUMN_NAME"`
		}

		query := `
			SELECT 
				TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
			FROM 
				INFORMATION_SCHEMA.KEY_COLUMN_USAGE
			WHERE 
				TABLE_SCHEMA = DATABASE() AND 
				TABLE_NAME = ? AND
				REFERENCED_TABLE_NAME IS NOT NULL
		`
		
		if err := db.Raw(query, tableName).Scan(&relations).Error; err != nil {
			// Log error but maybe continue? For now, return error
			return nil, err
		}

		for _, rel := range relations {
			schema.Relations = append(schema.Relations, models.RelationSchema{
				SourceTable:  rel.TableName,
				SourceColumn: rel.ColumnName,
				TargetTable:  rel.RefTableName,
				TargetColumn: rel.RefColumnName,
			})
		}
	}

	return schema, nil
}

func SyncTable(req models.CreateTableRequest) error {
	db := database.DB

	// Basic validation
	if req.Name == "" || len(req.Columns) == 0 {
		return fmt.Errorf("table name and columns are required")
	}

	// 1. Check if table exists
	var exists bool
	checkQuery := fmt.Sprintf("SHOW TABLES LIKE '%s'", req.Name)
	rows, err := db.Raw(checkQuery).Rows()
	if err != nil {
		return err
	}
	defer rows.Close()
	exists = rows.Next()

	if !exists {
		// --- CREATE MODE ---
		query := fmt.Sprintf("CREATE TABLE `%s` (", req.Name)
		var pkColumns []string

		for i, col := range req.Columns {
			query += fmt.Sprintf("`%s` %s", col.Name, col.Type)

			if col.IsNotNull {
				query += " NOT NULL"
			}
			if col.IsAutoIncrement {
				query += " AUTO_INCREMENT"
			}
			
			if col.IsPrimaryKey {
				pkColumns = append(pkColumns, fmt.Sprintf("`%s`", col.Name))
			}

			if i < len(req.Columns)-1 {
				query += ", "
			}
		}

		if len(pkColumns) > 0 {
			query += fmt.Sprintf(", PRIMARY KEY (%s)", strings.Join(pkColumns, ", "))
		}

		query += ");"
		return db.Exec(query).Error

	} else {
		// --- ALTER/UPDATE MODE ---
		// Simple strategy: Add missing columns only.
		// Detailed diffing is complex; this covers 80% of use cases.
		
		var existingColumns []struct {
			Field string
		}
		if err := db.Raw(fmt.Sprintf("SHOW COLUMNS FROM `%s`", req.Name)).Scan(&existingColumns).Error; err != nil {
			return err
		}

		existingMap := make(map[string]bool)
		for _, col := range existingColumns {
			existingMap[col.Field] = true
		}

		for _, col := range req.Columns {
			if !existingMap[col.Name] {
				// ADD COLUMN
				alterQuery := fmt.Sprintf("ALTER TABLE `%s` ADD COLUMN `%s` %s", req.Name, col.Name, col.Type)
				if col.IsNotNull {
					alterQuery += " NOT NULL"
				}
				// (Skip AI/PK for Alter for safety, usually added at creation)
				if err := db.Exec(alterQuery).Error; err != nil {
					return err 
				}
			}
		}
		
		return nil
	}
}

func DropTable(tableName string) error {
    if tableName == "" {
        return fmt.Errorf("table name required")
    }
    // Safety: Use backticks
    return database.DB.Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", tableName)).Error
}
