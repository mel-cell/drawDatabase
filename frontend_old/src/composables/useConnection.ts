import { ref } from "vue";
import { useToast } from "./useToast";

export interface ConnectionInfo {
  name: string;
  host: string;
  port: number;
  user: string;
  password?: string;
  database?: string;
}

const connections = ref<ConnectionInfo[]>([]);
const activeConnection = ref<ConnectionInfo | null>(null);

export function useConnection() {
  const toast = useToast();

  const fetchConnections = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/connections");
      if (res.ok) {
        connections.value = await res.json();
        if (connections.value.length > 0 && !activeConnection.value) {
          activeConnection.value = connections.value[0];
        }
      }
    } catch (e) {
      console.error("Failed to fetch connections", e);
    }
  };

  const saveConnection = async (conn: ConnectionInfo) => {
    try {
      const res = await fetch("http://localhost:3000/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conn),
      });
      if (res.ok) {
        toast.success("Connection Saved", `${conn.name} has been saved`);
        await fetchConnections();
        return true;
      }
      toast.error("Failed to save connection");
      return false;
    } catch (e) {
      toast.error("Connection Error", String(e));
      return false;
    }
  };

  const testConnection = async (conn: ConnectionInfo) => {
    try {
      const res = await fetch("http://localhost:3000/api/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conn),
      });
      if (res.ok) {
        toast.success("Connection OK", "Successfully connected to database");
        return true;
      }
      toast.error("Connection Failed");
      return false;
    } catch (e) {
      toast.error("Connection Error", String(e));
      return false;
    }
  };

  const deleteConnection = async (name: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/connections?name=${name}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.info("Connection Removed", `${name} has been deleted`);
        await fetchConnections();
        return true;
      }
      return false;
    } catch (e) {
      toast.error("Failed to delete connection", String(e));
      return false;
    }
  };

  return {
    connections,
    activeConnection,
    fetchConnections,
    saveConnection,
    testConnection,
    deleteConnection,
  };
}
