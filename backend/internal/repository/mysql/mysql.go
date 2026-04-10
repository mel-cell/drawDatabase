package mysql

import (
	"backend/internal/domain"
	"context"
	"fmt"
	"log"
	"strings"
	"sync"

	"gorm.io/gorm"
)

type mysqlRepository struct {
	db *gorm.DB
	mu sync.RWMutex
}

func NewMySQLRepository(db *gorm.DB) domain.SchemaRepository {
	return &mysqlRepository{db: db}
}

func (r *mysqlRepository) SetDB(db *gorm.DB) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.db = db
}

func (r *mysqlRepository) getDB() (*gorm.DB, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
    
    // Cek apakah pointer nil ATAU DB-nya punya error internal (broken connection)
	if r.db == nil {
		return nil, fmt.Errorf("database connection not established. please configure connection in settings")
	}
    
    // GORM kadang mengembalikan objek DB yang punya Error di dalamnya jika gagal konek
    if r.db.Error != nil {
        return nil, fmt.Errorf("database connection is broken: %v. please re-connect", r.db.Error)
    }

	return r.db, nil
}

// Database Operations
func (r *mysqlRepository) GetDatabases(ctx context.Context) ([]string, error) {
	db, err := r.getDB()
	if err != nil {
		return nil, err
	}
	var databases []string
	if err := db.Raw("SHOW DATABASES").Scan(&databases).Error; err != nil {
		return nil, err
	}
	return databases, nil
}

func (r *mysqlRepository) CreateDatabase(ctx context.Context, name string) error {
	db, err := r.getDB()
	if err != nil {
		return err
	}
	return db.WithContext(ctx).Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s`", name)).Error
}

func (r *mysqlRepository) DropDatabase(ctx context.Context, name string) error {
	db, err := r.getDB()
	if err != nil {
		return err
	}
	return db.WithContext(ctx).Exec(fmt.Sprintf("DROP DATABASE IF EXISTS `%s`", name)).Error
}

// Schema Operations
func (r *mysqlRepository) GetFullSchema(ctx context.Context, dbName string) (*domain.DatabaseSchema, error) {
	db, err := r.getDB()
	if err != nil {
		return nil, err
	}
	tx := db.WithContext(ctx)
	if dbName != "" {
		tx = tx.Exec("USE " + dbName)
	}

	var tables []string
	if err := tx.Raw("SHOW TABLES").Scan(&tables).Error; err != nil {
		return nil, err
	}

	schema := &domain.DatabaseSchema{
		Tables:    []domain.TableSchema{},
		Relations: []domain.RelationSchema{},
	}

	for _, tableName := range tables {
		if strings.HasPrefix(tableName, "_") { continue }

		var tableSchema domain.TableSchema
		tableSchema.Name = tableName

		var columns []struct {
			Field string; Type string; Key string
		}
		tx.Raw("SHOW COLUMNS FROM " + tableName).Scan(&columns)

		for _, col := range columns {
			tableSchema.Columns = append(tableSchema.Columns, domain.ColumnSchema{
				Name: col.Field,
				Type: col.Type,
				IsPK: col.Key == "PRI",
				IsFK: col.Key == "MUL",
			})
		}
		schema.Tables = append(schema.Tables, tableSchema)

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
		tx.Raw(query, tableName).Scan(&relations)

		for _, rel := range relations {
			schema.Relations = append(schema.Relations, domain.RelationSchema{
				SourceTable:  rel.TableName,
				TargetTable:  rel.RefTableName,
				SourceColumn: rel.ColumnName,
				TargetColumn: rel.RefColumnName,
			})
		}
	}
	return schema, nil
}

func (r *mysqlRepository) SyncBatch(ctx context.Context, dbName string, reqs []domain.TableRequest) error {
	db, err := r.getDB()
	if err != nil {
		return err
	}
	return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if dbName != "" {
			if err := tx.Exec(fmt.Sprintf("USE `%s`", dbName)).Error; err != nil {
				return err
			}
		}

		// 1. Map requested table names
		requestedNames := make(map[string]bool)
		for _, req := range reqs {
			requestedNames[strings.ToLower(req.Name)] = true
		}

		// 2. Identification of tables to drop
		var currentTables []string
		tx.Raw("SHOW TABLES").Scan(&currentTables)
		for _, tableName := range currentTables {
			if strings.HasPrefix(tableName, "_") { continue }
			if !requestedNames[strings.ToLower(tableName)] {
				if err := tx.Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s` CASCADE", tableName)).Error; err != nil {
					log.Printf("Warning: failed to drop table %s: %v", tableName, err)
				}
			}
		}

		// 3. Sync each table
		for _, req := range reqs {
			var count int64
			tx.Raw("SELECT count(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", req.Name).Scan(&count)
			exists := count > 0

			if !exists {
				query := fmt.Sprintf("CREATE TABLE `%s` (", req.Name)
				var defs []string
				var pks []string

				for _, col := range req.Columns {
					def := fmt.Sprintf("`%s` %s", col.Name, col.Type)
					if col.IsNotNull { def += " NOT NULL" }
					if col.IsAutoIncrement { def += " AUTO_INCREMENT" }
					if col.DefaultValue != "" { def += fmt.Sprintf(" DEFAULT '%s'", col.DefaultValue) }
					defs = append(defs, def)
					if col.IsPrimaryKey { pks = append(pks, fmt.Sprintf("`%s`", col.Name)) }
				}
				if len(pks) > 0 {
					defs = append(defs, fmt.Sprintf("PRIMARY KEY (%s)", strings.Join(pks, ", ")))
				}
				query += strings.Join(defs, ", ") + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
				if err := tx.Exec(query).Error; err != nil { return err }
			} else {
				// Update existing table structure (simple version: add/modify columns)
				var existingColumns []struct { Field string; Type string }
				tx.Raw(fmt.Sprintf("SHOW COLUMNS FROM `%s`", req.Name)).Scan(&existingColumns)
				colMap := make(map[string]string)
				for _, ec := range existingColumns { colMap[ec.Field] = ec.Type }

				for _, col := range req.Columns {
					oldType, colExists := colMap[col.Name]
					colDef := fmt.Sprintf("`%s` %s", col.Name, col.Type)
					if col.IsNotNull { colDef += " NOT NULL" }

					if !colExists {
						if err := tx.Exec(fmt.Sprintf("ALTER TABLE `%s` ADD COLUMN %s", req.Name, colDef)).Error; err != nil { return err }
					} else if !strings.EqualFold(oldType, col.Type) {
						if err := tx.Exec(fmt.Sprintf("ALTER TABLE `%s` MODIFY COLUMN %s", req.Name, colDef)).Error; err != nil { return err }
					}
				}
			}
		}

		// 4. Second pass for Foreign Keys (avoid circular ref issues during creation)
		for _, req := range reqs {
			for _, fk := range req.ForeignKeys {
				fkName := fmt.Sprintf("fk_%s_%s", req.Name, fk.ColumnName)
				var fkExists int64
				tx.Raw("SELECT count(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND constraint_name = ?", fkName).Scan(&fkExists)

				if fkExists == 0 {
					sql := fmt.Sprintf("ALTER TABLE `%s` ADD CONSTRAINT `%s` FOREIGN KEY (`%s`) REFERENCES `%s`(`%s`) ON DELETE CASCADE",
						req.Name, fkName, fk.ColumnName, fk.RefTableName, fk.RefColumnName)
					if err := tx.Exec(sql).Error; err != nil {
						log.Printf("Warning: Failed to add FK %s: %v", fkName, err)
					}
				}
			}
		}

		return nil
	})
}

func (r *mysqlRepository) DropTable(ctx context.Context, name string) error {
	db, err := r.getDB()
	if err != nil {
		return err
	}
	return db.WithContext(ctx).Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", name)).Error
}

// Data Operations
func (r *mysqlRepository) GetTableData(ctx context.Context, tableName string, limit, offset int) (*domain.TableData, error) {
	db, err := r.getDB()
	if err != nil {
		return nil, err
	}
	tx := db.WithContext(ctx)
	var dbColumns []struct { Field string }
	if err := tx.Raw(fmt.Sprintf("SHOW COLUMNS FROM `%s`", tableName)).Scan(&dbColumns).Error; err != nil {
		return nil, err
	}
	colNames := make([]string, len(dbColumns))
	for i, c := range dbColumns { colNames[i] = c.Field }

	var total int64
	tx.Table(tableName).Count(&total)

	var rows []map[string]interface{}
	query := fmt.Sprintf("SELECT * FROM `%s` LIMIT ? OFFSET ?", tableName)
	if err := tx.Raw(query, limit, offset).Scan(&rows).Error; err != nil { return nil, err }

	return &domain.TableData{ Columns: colNames, Rows: rows, Total: total }, nil
}

func (r *mysqlRepository) InsertData(ctx context.Context, tableName string, data map[string]interface{}) error {
	db, err := r.getDB()
	if err != nil {
		return err
	}
	cols := []string{}; vals := []interface{}{}; phs := []string{}
	for k, v := range data {
		cols = append(cols, fmt.Sprintf("`%s`", k))
		vals = append(vals, v)
		phs = append(phs, "?")
	}
	query := fmt.Sprintf("INSERT INTO `%s` (%s) VALUES (%s)", tableName, strings.Join(cols, ","), strings.Join(phs, ","))
	return db.WithContext(ctx).Exec(query, vals...).Error
}

func (r *mysqlRepository) DeleteData(ctx context.Context, tableName string, condition map[string]interface{}) error {
	db, err := r.getDB()
	if err != nil {
		return err
	}
	tx := db.WithContext(ctx).Table(tableName)
	for k, v := range condition { tx = tx.Where(fmt.Sprintf("`%s` = ?", k), v) }
	return tx.Delete(nil).Error
}

func (r *mysqlRepository) ExecuteRaw(ctx context.Context, query string) ([]map[string]interface{}, error) {
    db, err := r.getDB()
	if err != nil {
        return nil, err
    }
    var results []map[string]interface{}
    if err := db.WithContext(ctx).Raw(query).Scan(&results).Error; err != nil {
        return nil, err
    }
    return results, nil
}

func (r *mysqlRepository) ExecuteDDL(ctx context.Context, query string) error {
    db, err := r.getDB()
	if err != nil {
        return err
    }
    // Pakai Exec untuk DDL karena tidak mengembalikan baris
    return db.WithContext(ctx).Exec(query).Error
}

func (r *mysqlRepository) SaveLayout(ctx context.Context, layouts map[string]interface{}) error {
    db, err := r.getDB()
	if err != nil {
        return err
    }
    db.Exec(`CREATE TABLE IF NOT EXISTS _layout (table_name VARCHAR(255) PRIMARY KEY, x INT, y INT)`)
    for name, pos := range layouts {
        p := pos.(map[string]interface{})
        db.Exec("REPLACE INTO _layout (table_name, x, y) VALUES (?, ?, ?)", name, p["x"], p["y"])
    }
    return nil
}

func (r *mysqlRepository) GetLayout(ctx context.Context) (map[string]interface{}, error) {
    db, err := r.getDB()
	if err != nil {
        return nil, err
    }
    var rows []struct { TableName string; X int; Y int }
    if err := db.Raw("SELECT * FROM _layout").Scan(&rows).Error; err != nil { return nil, err }
    res := make(map[string]interface{})
    for _, r := range rows { res[r.TableName] = map[string]int{"x": r.X, "y": r.Y} }
    return res, nil
}
