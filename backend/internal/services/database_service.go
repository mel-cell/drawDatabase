package services

import (
	"backend/internal/database"
	"fmt"
	"strings"
)

func GetDatabases() ([]string, error) {
    db := database.DB
    var databases []string
    // Don't show system databases generally, or show them if admin
    if err := db.Raw("SHOW DATABASES").Scan(&databases).Error; err != nil {
        return nil, err
    }
    return databases, nil
}

func CreateDatabase(name string) error {
    if name == "" {
        return fmt.Errorf("database name required")
    }
    return database.DB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s`", name)).Error
}

func DropDatabase(name string) error {
    if name == "" {
        return fmt.Errorf("database name required")
    }
    if name == "information_schema" || name == "mysql" || name == "performance_schema" || name == "sys" {
        return fmt.Errorf("cannot drop system database")
    }
    return database.DB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS `%s`", name)).Error
}

func RenameDatabase(oldName, newName string) error {
    if oldName == "" || newName == "" {
        return fmt.Errorf("old and new names required")
    }
    
    // 1. Create New DB
    if err := database.DB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s`", newName)).Error; err != nil {
        return err
    }
    
    // 2. Get Tables
    var tables []string
    if err := database.DB.Raw(fmt.Sprintf("SHOW TABLES FROM `%s`", oldName)).Scan(&tables).Error; err != nil {
        return err
    }
    
    // 3. Move Tables
    for _, table := range tables {
        // Skip system/internal tables if any
        if strings.HasPrefix(table, "_") { continue }
        
        // RENAME TABLE old.tbl TO new.tbl
        query := fmt.Sprintf("RENAME TABLE `%s`.`%s` TO `%s`.`%s`", oldName, table, newName, table)
        if err := database.DB.Exec(query).Error; err != nil {
            return fmt.Errorf("failed to move table %s: %v", table, err)
        }
    }
    
    // 4. Move Layout Table (special case since it might be skipped)
    // Check if _layout exists
    var count int64
    database.DB.Raw(fmt.Sprintf("SHOW TABLES FROM `%s` LIKE '_layout'", oldName)).Count(&count)
    if count > 0 {
         database.DB.Exec(fmt.Sprintf("RENAME TABLE `%s`._layout TO `%s`._layout", oldName, newName))
    }
    
    // 5. Drop Old DB
    return database.DB.Exec(fmt.Sprintf("DROP DATABASE `%s`", oldName)).Error
}
