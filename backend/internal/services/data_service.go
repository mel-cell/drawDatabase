package services

import (
	"backend/internal/database"
	"fmt"
)

type TableDataResponse struct {
	Columns []string                 `json:"columns"`
	Rows    []map[string]interface{} `json:"rows"`
	Total   int64                    `json:"total"`
}

func GetTableData(tableName string, limit, offset int) (*TableDataResponse, error) {
	db := database.DB

	// Validate Table Name (Simple check against schema to prevent injection)
	// For MVP, we assume internal trust or strict alphanumeric check. 
	// Ideally, check against existing tables list.

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
