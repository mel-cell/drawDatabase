package models

type CreateTableRequest struct {
	Name    string          `json:"name"`
	Columns []ColumnDefinition `json:"columns"`
	// Indexes []IndexDefinition `json:"indexes,omitempty"`
}

type ColumnDefinition struct {
	Name         string `json:"name"`
	Type         string `json:"type"` // INT, VARCHAR, TEXT, etc
	Length       int    `json:"length,omitempty"`
	IsPrimaryKey bool   `json:"is_pk"`
	IsNotNull    bool   `json:"is_nn"`
	IsAutoIncrement bool `json:"is_ai"`
	DefaultValue string `json:"default_value,omitempty"`
}

type BatchCreateRequest []CreateTableRequest
