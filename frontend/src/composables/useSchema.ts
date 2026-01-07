import { ref } from "vue";

export interface ColumnSchema {
  name: string;
  type: string;
  is_pk: boolean;
  is_fk: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface RelationSchema {
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
}

// Global State
const tables = ref<TableSchema[]>([]);
const relations = ref<RelationSchema[]>([]);
const databases = ref<string[]>([]);
const currentDatabase = ref<string>(""); // Default empty

export function useSchema() {
  const fetchDatabases = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/databases");
      if (res.ok) {
        databases.value = await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch databases", e);
    }
  };

  const fetchSchema = async (dbName?: string) => {
    // If dbName provided, switch to it. Else use current.
    const target = dbName || currentDatabase.value;

    try {
      // Pass ?db=name to backend
      const res = await fetch(`http://localhost:3000/api/schema?db=${target}`);
      if (!res.ok) throw new Error("Failed to fetch schema");

      const data = await res.json();
      tables.value = data.tables || [];
      relations.value = data.relations || [];

      if (dbName) currentDatabase.value = dbName;

      console.log(`Schema loaded for ${target}: ${tables.value.length} tables`);
    } catch (error) {
      console.error(error);
    }
  };

  const switchDatabase = async (name: string) => {
    await fetchSchema(name);
  };

  const createTable = async (tableData: any) => {
    try {
      const res = await fetch("http://localhost:3000/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tableData),
      });

      if (!res.ok) throw new Error("Failed to create table");

      await fetchSchema();
      return true;
    } catch (error) {
      console.error(error);
      alert("Failed to create table");
      return false;
    }
  };

  return {
    tables,
    relations,
    databases,
    currentDatabase,
    fetchSchema,
    fetchDatabases,
    switchDatabase,
    createTable,
  };
}
