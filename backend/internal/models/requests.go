package models

type CreateTableRequest struct {
	Name    string          `json:"name"`
	Columns []ColumnDefinition `json:"columns"`
	ForeignKeys []ForeignKeyDefinition `json:"foreign_keys,omitempty"`
}

type ForeignKeyDefinition struct {
	ColumnName    string `json:"column_name"`
	RefTableName  string `json:"ref_table_name"`
	RefColumnName string `json:"ref_column_name"`
	OnDelete      string `json:"on_delete,omitempty"`
	OnUpdate      string `json:"on_update,omitempty"`
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
