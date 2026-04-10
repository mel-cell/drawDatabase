'use client';

import { useState, useEffect } from 'react';
import { useConnectionStore } from '@/store/useConnectionStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  X,
  Plus,
  Server,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Loader2,
  Play,
  Edit2,
} from 'lucide-react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function ConnectionModal({ isOpen, onClose, onConnect }: ConnectionModalProps) {
  const { connections, fetchConnections, saveConnection, testConnection, deleteConnection, setActiveConnection, applyConnection } = useConnectionStore();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<'none' | 'success' | 'error'>('none');

  const [form, setForm] = useState({
    name: "Local MySQL",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchConnections().then(() => {
        const currentConnections = useConnectionStore.getState().connections;
        if (currentConnections.length > 0) {
          selectConn(0, currentConnections);
        }
      });
    }
  }, [isOpen]);

  const selectConn = (idx: number, connList = connections) => {
    setSelectedIndex(idx);
    const conn = connList[idx];
    if (conn) {
      setForm({
        name: conn.name || "",
        host: conn.host || "127.0.0.1",
        port: conn.port || 3306,
        user: conn.user || "root",
        password: "",
        database: conn.database || "",
      });
    }
    setTestStatus('none');
  };

  const handleApplyDirectly = async (conn: any, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading(`Connecting to ${conn.name}...`);
    const ok = await applyConnection(conn);
    toast.dismiss();
    
    if (ok) {
        toast.success(`Connected to ${conn.name}`);
        onConnect();
        onClose();
    } else {
        toast.error(`Failed to connect to ${conn.name}. Check if MySQL is running.`);
    }
  };

  const createNew = () => {
    setSelectedIndex(-1);
    setForm({
      name: "New Connection",
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "",
    });
    setTestStatus('none');
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestStatus('none');
    const ok = await testConnection(form);
    setIsTesting(false);
    setTestStatus(ok ? 'success' : 'error');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveConnection(form);
    setIsSaving(false);
    
    if (ok) {
      toast.success("Saved successfully");
      await fetchConnections();
      const updatedList = useConnectionStore.getState().connections;
      const idx = updatedList.findIndex((c: any) => c.name === form.name);
      if (idx >= 0) setSelectedIndex(idx);
      return true;
    } else {
      toast.error("Failed to save connection");
      return false;
    }
  };

  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete connection "${name}"?`)) return;
    const ok = await deleteConnection(name);
    if(ok) {
        toast.warning(`Connection ${name} deleted.`);
        await fetchConnections();
        const currentConnections = useConnectionStore.getState().connections;
        if (currentConnections.length > 0) {
            selectConn(0, currentConnections);
        } else {
            createNew();
        }
    }
  };

  const handleConnect = async () => {
    // 1. Save first to update password/details
    const saved = await handleSave();
    if(saved) {
        // 2. Apply it globally on server
        const applied = await applyConnection(form);
        if (applied) {
            toast.success(`Connected to ${form.name}`);
            onConnect();
            onClose();
        } else {
            toast.error("Saved, but failed to establish live connection.");
        }
    }
  };

  if (!isOpen) return null;

  const connColors = ["bg-blue-500", "bg-orange-500", "bg-red-500", "bg-emerald-500", "bg-purple-500", "bg-cyan-500"];
  const getColor = (idx: number) => connColors[Math.max(0, idx) % connColors.length];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* SIDEBAR */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Connections</h3>
            <button
              onClick={createNew}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="New Connection"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {connections.map((conn: any, idx: number) => (
              <div
                key={conn.name}
                onClick={() => selectConn(idx)}
                className={cn(
                  "px-3 py-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 border group relative",
                  selectedIndex === idx ? "bg-white border-gray-200 shadow-sm" : "border-transparent hover:bg-gray-100"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0", getColor(idx))}>
                  MY
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-800 truncate">{conn.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{conn.user}@{conn.host}</div>
                </div>
                
                {/* ACTIONS ON HOVER */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                  <button
                    onClick={(e) => handleApplyDirectly(conn, e)}
                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Start Connection"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => selectConn(idx)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit Config"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conn.name, e)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {selectedIndex === -1 && (
              <div className="px-3 py-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-blue-700">New Connection</div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 w-full justify-center">
              <Server className="w-3.5 h-3.5" /> Manage Drivers
            </button>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{form.name}</h2>
              <p className="text-xs text-gray-400">Configure connection parameters</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Scroll */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-2 gap-6 max-w-2xl">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Connection Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Database Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 p-3 border border-blue-500 bg-blue-50 rounded-lg cursor-pointer shadow-sm">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-blue-900 text-sm">MySQL</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Host</label>
                <input
                  value={form.host}
                  onChange={(e) => setForm({...form, host: e.target.value})}
                  type="text"
                  placeholder="127.0.0.1"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Port</label>
                <input
                  value={form.port}
                  onChange={(e) => setForm({...form, port: parseInt(e.target.value) || 0})}
                  type="number"
                  placeholder="3306"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Username</label>
                <input
                  value={form.user}
                  onChange={(e) => setForm({...form, user: e.target.value})}
                  type="text"
                  placeholder="root"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
                <input
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Default Database (optional)</label>
                <input
                  value={form.database}
                  onChange={(e) => setForm({...form, database: e.target.value})}
                  type="text"
                  placeholder="draw_db"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* TEST RESULT */}
            {(testStatus !== 'none' || isTesting) && (
              <div
                className={cn(
                  "mt-6 p-3 rounded-lg border flex items-center gap-3 transition-all max-w-2xl",
                  testStatus === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                  isTesting ? 'bg-gray-50 border-gray-200 text-gray-600' :
                  'bg-red-50 border-red-200 text-red-700'
                )}
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 testStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                 <AlertCircle className="w-5 h-5" />}
                <span className="text-sm font-medium">
                  {isTesting ? "Testing connection..." : testStatus === "success" ? "Connection successful!" : "Connection failed!"}
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all shadow-sm disabled:opacity-50"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Config"}
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
              >
                <Wifi className="w-4 h-4" /> Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
