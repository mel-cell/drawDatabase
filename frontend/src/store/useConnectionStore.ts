import { create } from 'zustand';

export interface DatabaseConnection {
  name: string;
  host: string;
  port: number;
  user: string;
  password?: string;
  database?: string;
  type?: string; 
}

interface ConnectionState {
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
  fetchConnections: () => Promise<void>;
  saveConnection: (conn: DatabaseConnection) => Promise<boolean>;
  deleteConnection: (name: string) => Promise<boolean>;
  testConnection: (conn: DatabaseConnection) => Promise<boolean>;
  setActiveConnection: (conn: DatabaseConnection) => void;
}

const API_URL = 'http://localhost:3000/api/connections';

export const useConnectionStore = create<ConnectionState>((set) => ({
  connections: [],
  activeConnection: null,

  setActiveConnection: (conn) => set({ activeConnection: conn }),

  fetchConnections: async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch connections');
      const data = await res.json();
      set({ connections: data });
    } catch (error) {
      console.error('Error fetching connections:', error);
      set({ connections: [] });
    }
  },

  saveConnection: async (conn) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conn)
      });
      if (!res.ok) throw new Error('Failed to save connection');
      return true;
    } catch (error) {
      console.error('Error saving connection:', error);
      return false;
    }
  },

  testConnection: async (conn) => {
    try {
      const res = await fetch(`${API_URL}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conn)
      });
      return res.ok;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  },

  deleteConnection: async (name: string) => {
    try {
      const res = await fetch(`${API_URL}?name=${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete connection');
      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      return false;
    }
  }
}));
