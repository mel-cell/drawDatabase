package services

import (
	"backend/internal/database"
	"fmt"
	"strings"
)

type TableDataResponse struct {
	Columns []string                 `json:"columns"`
	Rows    []map[string]interface{} `json:"rows"`
	Total   int64                    `json:"total"`
}

func GetTableData(tableName string, limit, offset int) (*TableDataResponse, error) {
	db := database.DB

	// 1. Get Columns
	var dbColumns []struct {
		Field string
	}
	if err := db.Raw(fmt.Sprintf("SHOW COLUMNS FROM `%s`", tableName)).Scan(&dbColumns).Error; err != nil {
		return nil, fmt.Errorf("error reading table schema: %v", err)
	}

	colNames := make([]string, len(dbColumns))
	for i, c := range dbColumns {
		colNames[i] = c.Field
	}

	// 2. Count Total
	var total int64
	if err := db.Table(tableName).Count(&total).Error; err != nil {
		return nil, err
	}

	// 3. Get Data
	var rows []map[string]interface{}
	query := fmt.Sprintf("SELECT * FROM `%s` LIMIT ? OFFSET ?", tableName)
	
	if err := db.Raw(query, limit, offset).Scan(&rows).Error; err != nil {
		return nil, err
	}

	return &TableDataResponse{
		Columns: colNames,
		Rows:    rows,
		Total:   total,
	}, nil
}

func InsertTableData(tableName string, data map[string]interface{}) error {
	db := database.DB

	columns := []string{}
	values := []interface{}{}
	placeholders := []string{}

	for col, val := range data {
		columns = append(columns, fmt.Sprintf("`%s`", col))
		values = append(values, val)
		placeholders = append(placeholders, "?")
	}

	if len(columns) == 0 {
		return fmt.Errorf("no data to insert")
	}

	query := fmt.Sprintf("INSERT INTO `%s` (%s) VALUES (%s)", 
		tableName, 
		strings.Join(columns, ", "), 
		strings.Join(placeholders, ", "))

	return db.Exec(query, values...).Error
}

func DeleteTableData(tableName string, conditions map[string]interface{}) error {
    db := database.DB
    
    whereClauses := []string{}
    values := []interface{}{}
    
    for col, val := range conditions {
        whereClauses = append(whereClauses, fmt.Sprintf("`%s` = ?", col))
        values = append(values, val)
    }
    
    if len(whereClauses) == 0 {
        return fmt.Errorf("no delete conditions provided (safety block)")
    }
    
    query := fmt.Sprintf("DELETE FROM `%s` WHERE %s", tableName, strings.Join(whereClauses, " AND "))
    
    return db.Exec(query, values...).Error
}

// ExecuteRawQuery runs a raw SQL query and returns the results.
// WARNING: This is dangerous and should be restricted in production.
func ExecuteRawQuery(sql string) ([]map[string]interface{}, error) {
    db := database.DB
    var results []map[string]interface{}
    
    // Simple check to prevent multi-statement injection if possible, 
    // but GORM Exec/Raw usually handles one statement.
    // For SELECT queries:
    if strings.HasPrefix(strings.ToUpper(strings.TrimSpace(sql)), "SELECT") || strings.HasPrefix(strings.ToUpper(strings.TrimSpace(sql)), "SHOW") {
         if err := db.Raw(sql).Scan(&results).Error; err != nil {
             return nil, err
         }
         return results, nil
    } 
    
    // For INSERT, UPDATE, DELETE, DROP, CREATE
    if err := db.Exec(sql).Error; err != nil {
        return nil, err
    }
    
    // Return empty success for non-select
    return []map[string]interface{}{{"status": "Query executed successfully"}}, nil
}
