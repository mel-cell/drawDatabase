'use client';

import { Handle, Position } from '@xyflow/react';
import { Table as TableIcon, Key, Hash, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TableNode({ data }: { data: any }) {
  const { name, columns } = data;

  return (
    <div className="min-w-[200px] bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden group hover:border-blue-400 transition-all duration-300">
      {/* Table Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-md shadow-md shadow-blue-100">
            <TableIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm">{name}</span>
        </div>
      </div>

      {/* Columns List */}
      <div className="p-1 space-y-0.5">
        {columns?.map((col: any) => (
          <div 
            key={col.name} 
            className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 rounded-lg group/col transition-colors relative"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="shrink-0">
                {col.is_pk ? (
                  <Key className="w-3 h-3 text-amber-500 fill-amber-500/10" />
                ) : col.type.toLowerCase().includes('int') ? (
                  <Hash className="w-3 h-3 text-slate-400" />
                ) : (
                  <AlignLeft className="w-3 h-3 text-slate-400" />
                )}
              </div>
              <span className={cn(
                "text-[11px] truncate",
                col.is_pk ? "text-slate-900 font-bold" : "text-slate-600"
              )}>
                {col.name}
              </span>
            </div>
            
            <span className="text-[9px] font-mono text-slate-400 ml-4 shrink-0 uppercase">
              {col.type.split('(')[0]}
            </span>

            {/* Handle for relations (Target/Source) */}
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`${name}-${col.name}-left`}
              className="w-1.5 h-1.5 !bg-slate-300 !border-white opacity-0 group-hover/col:opacity-100 transition-opacity"
            />
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`${name}-${col.name}-right`}
              className="w-1.5 h-1.5 !bg-blue-400 !border-white opacity-0 group-hover/col:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>

      {/* Connection points (General) */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
