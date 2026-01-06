import { ref } from "vue";

const API_URL = "http://localhost:3000/api";

// Shared State (Singleton)
const tables = ref<TableSchema[]>([]);
const relations = ref<RelationSchema[]>([]);
const databases = ref<string[]>([]);
const currentDatabase = ref("draw_db");

interface Column {
  name: string;
  type: string;
  is_pk: boolean;
  is_fk: boolean;
}

export interface TableSchema {
  name: string;
  columns: Column[];
}

export interface RelationSchema {
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
}

export function useSchema() {
  const fetchDatabases = async () => {
    try {
      const res = await fetch(`${API_URL}/databases`);
      const data = await res.json();
      databases.value = data;
    } catch (error) {
      console.error("Failed to fetch databases:", error);
    }
  };

  const fetchSchema = async () => {
    try {
      // Fetch schema for the currently selected database
      const res = await fetch(`${API_URL}/schema?db=${currentDatabase.value}`);
      const data = await res.json();

      tables.value = data.tables || [];
      relations.value = data.relations || [];
    } catch (error) {
      console.error("Failed to fetch schema:", error);
    }
  };

  const createTable = async (tableData: any) => {
    try {
      const res = await fetch(`${API_URL}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tableData),
      });

      if (!res.ok) throw new Error("Failed to create table");

      // Refresh schema after creation
      await fetchSchema();
      return true;
    } catch (error) {
      console.error("Failed to create table:", error);
      return false;
    }
  };

  return {
    currentDatabase,
    databases,
    tables,
    relations,
    fetchSchema,
    fetchDatabases,
    createTable,
  };
}
