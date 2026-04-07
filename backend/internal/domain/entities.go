package domain

import "context"

// Entities (Data Structures)
type ColumnDefinition struct {
	Name            string `json:"name"`
	Type            string `json:"type"`
	Length          int    `json:"length,omitempty"`
	IsPrimaryKey    bool   `json:"is_pk"`
	IsNotNull       bool   `json:"is_nn"`
	IsAutoIncrement bool   `json:"is_ai"`
	DefaultValue    string `json:"default_value,omitempty"`
}

type ForeignKeyDefinition struct {
	ColumnName    string `json:"column_name"`
	RefTableName  string `json:"ref_table_name"`
	RefColumnName string `json:"ref_column_name"`
	OnDelete      string `json:"on_delete,omitempty"`
	OnUpdate      string `json:"on_update,omitempty"`
}

type TableRequest struct {
	Name        string                 `json:"name"`
	Columns     []ColumnDefinition     `json:"columns"`
	ForeignKeys []ForeignKeyDefinition `json:"foreign_keys,omitempty"`
}

type DatabaseSchema struct {
	Tables    []TableSchema    `json:"tables"`
	Relations []RelationSchema `json:"relations"`
}

type TableSchema struct {
	Name    string         `json:"name"`
	Columns []ColumnSchema `json:"columns"`
}

type ColumnSchema struct {
	Name string `json:"name"`
	Type string `json:"type"`
	IsPK bool   `json:"is_pk"`
	IsFK bool   `json:"is_fk"`
}

type RelationSchema struct {
	SourceTable  string `json:"source_table"`
	TargetTable  string `json:"target_table"`
	SourceColumn string `json:"source_column"`
	TargetColumn string `json:"target_column"`
}

type TableData struct {
	Columns []string                 `json:"columns"`
	Rows    []map[string]interface{} `json:"rows"`
	Total   int64                    `json:"total"`
}

// Repositories Interfaces (DB Access)
type SchemaRepository interface {
	GetDatabases(ctx context.Context) ([]string, error)
	CreateDatabase(ctx context.Context, name string) error
	DropDatabase(ctx context.Context, name string) error

	GetFullSchema(ctx context.Context, dbName string) (*DatabaseSchema, error)
	SyncBatch(ctx context.Context, dbName string, reqs []TableRequest) error
	DropTable(ctx context.Context, name string) error

	GetTableData(ctx context.Context, tableName string, limit, offset int) (*TableData, error)
	InsertData(ctx context.Context, tableName string, data map[string]interface{}) error
	DeleteData(ctx context.Context, tableName string, condition map[string]interface{}) error

	ExecuteRaw(ctx context.Context, query string) ([]map[string]interface{}, error)
    
    // Layout
    SaveLayout(ctx context.Context, layouts map[string]interface{}) error
    GetLayout(ctx context.Context) (map[string]interface{}, error)
}

// ... (Existing services)
type SyncService interface {
	SyncBatch(ctx context.Context, dbName string, reqs []TableRequest) error
	GetSchema(ctx context.Context, dbName string) (*DatabaseSchema, error)
}

type LayoutService interface {
    Save(ctx context.Context, layouts map[string]interface{}) error
    Get(ctx context.Context) (map[string]interface{}, error)
}

type DatabaseService interface {
	List(ctx context.Context) ([]string, error)
	Create(ctx context.Context, name string) error
	Drop(ctx context.Context, name string) error
}

type DataService interface {
	GetData(ctx context.Context, table string, limit, offset int) (*TableData, error)
	Insert(ctx context.Context, table string, data map[string]interface{}) error
}
