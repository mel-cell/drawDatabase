package models

type ColumnSchema struct {
	Name string `json:"name"`
	Type string `json:"type"`
	IsPK bool   `json:"is_pk"`
	IsFK bool   `json:"is_fk"`
}

type TableSchema struct {
	Name    string         `json:"name"`
	Columns []ColumnSchema `json:"columns"`
}

type RelationSchema struct {
	SourceTable  string `json:"source_table"`
	TargetTable  string `json:"target_table"`
	SourceColumn string `json:"source_column"` // FK Column
	TargetColumn string `json:"target_column"` // Reference Column
}

type DatabaseSchema struct {
	Tables    []TableSchema    `json:"tables"`
	Relations []RelationSchema `json:"relations"`
}
