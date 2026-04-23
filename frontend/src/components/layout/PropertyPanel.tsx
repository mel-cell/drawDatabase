'use client';

import { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Settings, 
  Table as TableIcon, 
  Columns, 
  Trash2, 
  Plus, 
  Key, 
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PropertyPanel() {
  const { selectedNode, updateNodeData, setSelectedNode } = useCanvasStore();
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation Schemas
  const columnSchema = z.object({
    name: z.string().min(1, "Required").regex(/^[a-zA-Z0-9_]+$/, "Invalid chars"),
    type: z.string()
  });

  const tableSchema = z.object({
    name: z.string().min(1, "Name required").regex(/^[a-zA-Z0-9_]+$/, "Invalid chars"),
    columns: z.array(columnSchema).refine((cols) => {
        const names = cols.map(c => c.name.toLowerCase());
        return new Set(names).size === names.length;
    }, { message: "Duplicate columns" })
  });

  // Sync state when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setTableName((selectedNode.data as any).name || '');
      setColumns((selectedNode.data as any).columns || []);
    }
  }, [selectedNode]);

  // Auto-update Canvas (with Validation)
  useEffect(() => {
    if (!selectedNode) return;

    const result = tableSchema.safeParse({ name: tableName, columns });
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
         formattedErrors[issue.path.join('.')] = issue.message;
      });
      setErrors(formattedErrors);
    } else {
      setErrors({});
    }

    updateNodeData(selectedNode.id, {
      ...selectedNode.data,
      name: tableName,
      columns: columns
    });
  }, [tableName, columns, selectedNode?.id, updateNodeData]);

  if (!selectedNode) {
    return (
      <aside className="w-[320px] border-l border-slate-100 bg-white hidden lg:flex flex-col items-center justify-center p-12 text-center">
         <Settings className="w-6 h-6 text-slate-200 mb-3" />
         <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Select Table</h3>
      </aside>
    );
  }

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
    <aside className="w-[320px] border-l border-slate-200 bg-white flex flex-col h-full">
      {/* Header - Clean ddan Tanpa Background Berat */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Properties</h3>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="p-1 hover:bg-slate-50 rounded text-slate-300 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Table Name Section */}
        <div className="p-4 space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Table Name</label>
            <input 
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className={cn(
                  "w-full bg-slate-50 border rounded-md px-3 py-2 text-xs font-bold transition-all outline-none",
                  errors.name ? "border-red-200 text-red-500" : "border-slate-100 text-slate-700 focus:border-slate-300"
              )}
            />
          </div>

          <div className="h-px bg-slate-50" />

          {/* Columns Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Columns className="w-3 h-3" /> Columns
              </label>
              <button 
                onClick={addColumn}
                className="text-[9px] font-bold text-slate-400 hover:text-slate-800 transition-all uppercase underline underline-offset-4"
              >
                + Add Column
              </button>
            </div>

            <div className="border border-slate-100 rounded-md overflow-hidden bg-white">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/50 border-b border-slate-50 text-[8px] font-bold text-slate-300 uppercase">
                  <div className="w-5 text-center">PK</div>
                  <div className="flex-1">Name</div>
                  <div className="w-20">Type</div>
                  <div className="w-4"></div>
              </div>
              <div className="divide-y divide-slate-50">
                {columns.map((col, idx) => (
                  <div key={idx} className="group flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50/50 transition-all">
                      <button 
                          onClick={() => updateColumn(idx, 'is_pk', !col.is_pk)}
                          className={cn(
                              "w-5 flex justify-center transition-all",
                              col.is_pk ? "text-amber-400" : "text-slate-200"
                          )}
                      >
                          <Key className="w-2.5 h-2.5" />
                      </button>

                      <input 
                          type="text"
                          value={col.name}
                          onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                          className="flex-1 bg-transparent border-none text-[10px] font-medium text-slate-600 focus:ring-0 p-0 outline-none"
                      />

                      <select 
                          value={col.type.toUpperCase()}
                          onChange={(e) => updateColumn(idx, 'type', e.target.value)}
                          className="w-20 bg-transparent border-none text-[9px] font-bold text-slate-400 p-0 focus:ring-0 outline-none cursor-pointer"
                      >
                          <option value="INT">INT</option>
                          <option value="BIGINT">BIGINT</option>
                          <option value="VARCHAR(255)">VARCHAR(255)</option>
                          <option value="TEXT">TEXT</option>
                          <option value="DATE">DATE</option>
                      </select>

                      <button 
                          onClick={() => removeColumn(idx)}
                          className="w-4 opacity-0 group-hover:opacity-100 flex justify-center text-slate-200 hover:text-red-400 transition-all"
                      >
                          <Trash2 className="w-3 h-3" />
                      </button>
                  </div>
                ))}
              </div>
            </div>

            {errors.columns && (
              <p className="text-[9px] font-medium text-red-400 italic">
                 * {errors.columns}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/20">
        <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Schema Drafted</span>
        </div>
        <p className="text-[9px] text-slate-300 leading-relaxed italic">
          Changes are staged locally. Push to synchronize with MySQL.
        </p>
      </div>
    </aside>
  );
}
