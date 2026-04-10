'use client';

import { Handle, Position } from '@xyflow/react';
import { Table as TableIcon, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TableNode({ data, selected }: { data: any, selected: boolean }) {
  const { name, columns } = data;

  return (
    <div className={cn(
      "min-w-[240px] bg-white rounded-xl shadow-2xl border-2 transition-all duration-200 overflow-hidden",
      selected ? "border-blue-500 scale-[1.02] ring-4 ring-blue-500/10" : "border-slate-200"
    )}>
      {/* Table Header */}
      <div className={cn(
        "px-4 py-3 border-b flex items-center gap-2.5",
        selected ? "bg-blue-600 border-blue-600" : "bg-slate-50 border-slate-200"
      )}>
        <TableIcon className={cn("w-4 h-4", selected ? "text-white" : "text-slate-400")} />
        <span className={cn("text-xs font-black uppercase tracking-wider", selected ? "text-white" : "text-slate-700")}>
          {name}
        </span>
      </div>

      {/* Columns List */}
      <div className="py-1">
        {columns?.map((col: any, idx: number) => (
          <div key={idx} className="group relative flex items-center px-4 py-2 hover:bg-slate-50 transition-colors">
            {/* Left Handle (Target) */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${name}-${col.name}-left`}
              className="!w-2 !h-2 !bg-blue-400 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
            />

            <div className="flex-1 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {col.is_pk ? (
                  <Key className="w-3 h-3 text-amber-500 fill-amber-500" />
                ) : (
                  <div className="w-3" /> 
                )}
                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">
                    {col.name}
                </span>
              </div>
              
              <div className="flex items-center justify-end gap-1.5 min-w-fit">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                    {col.type}
                 </span>
                 {col.nullable && (
                   <span className="text-[10px] font-bold text-blue-400 leading-none">?</span>
                 )}
                 {col.is_ai && (
                   <span className="text-[9px] font-black text-emerald-500 leading-none">AI</span>
                 )}
              </div>
            </div>

            {/* Right Handle (Source) */}
            <Handle
              type="source"
              position={Position.Right}
              id={`${name}-${col.name}-right`}
              className="!w-2 !h-2 !bg-blue-400 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
      
      {/* Footer Info */}
      <div className="px-4 py-1.5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
         <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
           InnodB
         </span>
         <span className="text-[8px] font-bold text-slate-400">
           {columns?.length || 0} COLS
         </span>
      </div>
    </div>
  );
}
