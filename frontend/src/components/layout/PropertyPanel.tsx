'use client';

import { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { 
  Settings, 
  Table as TableIcon, 
  Columns, 
  Trash2, 
  Plus, 
  Key, 
  Type, 
  X,
  Save,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PropertyPanel() {
  const { selectedNode, updateNodeData, setSelectedNode } = useCanvasStore();
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<any[]>([]);

  // Sync state when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setTableName((selectedNode.data as any).name || '');
      setColumns((selectedNode.data as any).columns || []);
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <aside className="w-[350px] border-l border-slate-200 bg-white hidden lg:flex flex-col items-center justify-center p-12 text-center">
         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <Settings className="w-8 h-8" />
         </div>
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Property Panel</h3>
         <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Select a table on the canvas to edit its properties, columns, ddan relations.
         </p>
      </aside>
    );
  }

  const handleUpdate = () => {
    updateNodeData(selectedNode.id, {
        ...selectedNode.data,
        name: tableName,
        columns: columns
    });
  };

  const addColumn = () => {
    setColumns([...columns, { name: 'new_column', type: 'VARCHAR(255)', is_pk: false }]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, field: string, value: any) => {
    const next = [...columns];
    next[index] = { ...next[index], [field]: value };
    setColumns(next);
  };

  return (
    <aside className="w-[350px] border-l border-slate-200 bg-white flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <TableIcon className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Table Properties</h3>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Table Name Section */}
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3" /> Table Name
            </label>
            <input 
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:font-normal"
              placeholder="Enter table name..."
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* Columns Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Columns className="w-3 h-3" /> Columns ({columns.length})
              </label>
              <button 
                onClick={addColumn}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-all"
              >
                <Plus className="w-3 h-3" /> ADD NEW
              </button>
            </div>

            <div className="space-y-1 border border-slate-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400">
                  <div className="w-8">PK</div>
                  <div className="flex-1">COLUMN NAME</div>
                  <div className="w-32">TYPE</div>
                  <div className="w-6"></div>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white">
                {columns.map((col, idx) => (
                  <div key={idx} className="group flex items-center gap-2 px-3 py-1.5 border-b border-slate-50 last:border-none hover:bg-blue-50/30 transition-all">
                      {/* PK Toggle */}
                      <button 
                          onClick={() => updateColumn(idx, 'is_pk', !col.is_pk)}
                          className={cn(
                              "w-8 flex justify-center transition-all",
                              col.is_pk ? "text-amber-500" : "text-slate-200 hover:text-slate-400"
                          )}
                      >
                          <Key className={cn("w-3.5 h-3.5", col.is_pk && "fill-amber-500")} />
                      </button>

                      {/* Name Input */}
                      <input 
                          type="text"
                          value={col.name}
                          onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                          className="flex-1 bg-transparent border-none text-[12px] font-bold text-slate-700 focus:ring-0 p-0 outline-none truncate placeholder:font-normal"
                          placeholder="column_name"
                      />

                      {/* Type Select */}
                      <select 
                          value={col.type.toUpperCase()}
                          onChange={(e) => updateColumn(idx, 'type', e.target.value)}
                          className="w-32 bg-transparent border-none text-[10px] font-bold text-slate-500 p-0 focus:ring-0 outline-none cursor-pointer"
                      >
                          <option value="INT">INT</option>
                          <option value="BIGINT">BIGINT</option>
                          <option value="VARCHAR(255)">VARCHAR(255)</option>
                          <option value="TEXT">TEXT</option>
                          <option value="DATE">DATE</option>
                          <option value="TIMESTAMP">TIMESTAMP</option>
                          <option value="BOOLEAN">BOOLEAN</option>
                          <option value="DECIMAL">DECIMAL</option>
                      </select>

                      {/* Actions */}
                      <button 
                          onClick={() => removeColumn(idx)}
                          className="w-6 opacity-0 group-hover:opacity-100 flex justify-center text-slate-300 hover:text-red-500 transition-all"
                      >
                          <Trash2 className="w-3.5 h-3.5" />
                      </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Save Button */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <button 
          onClick={handleUpdate}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
        >
          <Save className="w-4 h-4" />
          Update Draft
        </button>
        <p className="text-[9px] text-center text-slate-400 mt-2.5 font-medium italic">
            Changes will be applied to the canvas only.
        </p>
      </div>
    </aside>
  );
}
