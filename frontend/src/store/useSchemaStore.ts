import { create } from 'zustand';

interface Table {
  name: string;
  columns?: any[];
}

interface SchemaState {
  databases: string[];
  currentDatabase: string | null;
  tables: Table[];
  relations: any[]; // Tambahkan ini
  isLoading: boolean;
  isTablesLoading: boolean;
  fetchDatabases: () => Promise<void>;
  setCurrentDatabase: (db: string | null) => void;
  fetchTables: (db: string) => Promise<void>;
  dropDatabase: (db: string) => Promise<boolean>;
  createDatabase: (db: string) => Promise<boolean>;
}

const API_URL = '/api';

export const useSchemaStore = create<SchemaState>((set) => ({
  databases: [],
  currentDatabase: null,
  tables: [],
  relations: [],
  isLoading: false,
  isTablesLoading: false,

  fetchDatabases: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/databases`);
      if (!res.ok) throw new Error('Failed to fetch databases');
      const data = await res.json();
      set({ databases: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      console.error('Error fetching databases:', error);
      set({ databases: [], isLoading: false });
    }
  },

  setCurrentDatabase: (db) => {
    set({ currentDatabase: db, tables: [], relations: [] });
    if (db) {
      // Trigger fetch tables automatically
      useSchemaStore.getState().fetchTables(db);
    }
  },

  fetchTables: async (db) => {
    set({ isTablesLoading: true });
    try {
      // Sesuai backend schema_handler.go: c.Query("db")
      const res = await fetch(`${API_URL}/schema?db=${encodeURIComponent(db)}`);
      if (!res.ok) throw new Error('Failed to fetch schema');
      const data = await res.json();
      // Backend returns a schema object, usually containing tables ddan relations
      set({ 
        tables: data.tables || [], 
        relations: data.relations || [],
        isTablesLoading: false 
      });
    } catch (error) {
      console.error('Error fetching tables:', error);
      set({ tables: [], relations: [], isTablesLoading: false });
    }
  },

  dropDatabase: async (db) => {
    try {
      // Sesuai backend: c.Query("name")
      const res = await fetch(`${API_URL}/databases?name=${encodeURIComponent(db)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await useSchemaStore.getState().fetchDatabases();
        if (useSchemaStore.getState().currentDatabase === db) {
          set({ currentDatabase: null, tables: [] });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error dropping database:', error);
      return false;
    }
  },

  createDatabase: async (db) => {
    try {
      const res = await fetch(`${API_URL}/databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: db })
      });
      if (res.ok) {
        await useSchemaStore.getState().fetchDatabases();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating database:', error);
      return false;
    }
  }
}));
