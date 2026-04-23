'use client';

import { Handle, Position } from '@xyflow/react';
import { Key, Hash, CaseSensitive, Calendar, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TableNode({ data, selected }: { data: any, selected: boolean }) {
  const { name, columns } = data;

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('int')) return <Hash className="w-2.5 h-2.5 opacity-40 text-blue-500" />;
    if (t.includes('char') || t.includes('text')) return <CaseSensitive className="w-2.5 h-2.5 opacity-40 text-emerald-500" />;
    if (t.includes('date') || t.includes('time')) return <Calendar className="w-2.5 h-2.5 opacity-40 text-amber-500" />;
    return <Database className="w-2.5 h-2.5 opacity-40" />;
  };

  return (
    <div className={cn(
      "min-w-[240px] bg-white rounded-2xl border-2 transition-all duration-300",
      selected 
        ? "border-[#1A73E8] shadow-2xl shadow-blue-500/10 scale-[1.02]" 
        : "border-slate-100 shadow-xl shadow-slate-900/[0.02] hover:border-slate-200"
    )}>
      {/* Header - Berwarna tapi tetep Clean */}
      <div className={cn(
          "px-4 py-3 rounded-t-[14px] flex items-center justify-between border-b transition-colors",
          selected ? "bg-[#1A73E8]/5 border-[#1A73E8]/10" : "bg-slate-50/50 border-slate-100"
      )}>
        <div className="flex items-center gap-2.5">
            <div className={cn(
                "w-1.5 h-4 rounded-full",
                selected ? "bg-[#1A73E8]" : "bg-slate-300"
            )} />
            <span className="text-xs font-black text-slate-800 tracking-tight uppercase">
                {name}
            </span>
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
            {columns?.length || 0} Cols
        </span>
      </div>

      {/* Columns Area */}
      <div className="py-2">
        {columns?.map((col: any, idx: number) => (
          <div key={idx} className="group relative flex items-center px-4 py-2 hover:bg-slate-50/80 transition-colors">
            {/* Left Handles */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${name}-${col.name}-left`}
              className="!w-2 !h-2 !bg-[#1A73E8] !border-4 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
            />

            <div className="flex-1 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                {col.is_pk ? (
                  <Key className="w-3 h-3 text-amber-500 fill-amber-500/10" />
                ) : (
                  getTypeIcon(col.type)
                )}
                <span className={cn(
                    "text-[11px] font-bold tracking-tight",
                    col.is_pk ? "text-slate-900" : "text-slate-600"
                )}>
                    {col.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                 <span className={cn(
                     "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                     col.type.toLowerCase().includes('int') ? "text-blue-500 bg-blue-50/50" : 
                     col.type.toLowerCase().includes('char') ? "text-emerald-500 bg-emerald-50/50" : 
                     "text-slate-400 bg-slate-50"
                 )}>
                    {col.type}
                 </span>
              </div>
            </div>

            {/* Right Handles */}
            <Handle
              type="source"
              position={Position.Right}
              id={`${name}-${col.name}-right`}
              className="!w-2 !h-2 !bg-[#1A73E8] !border-4 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
      
      {/* Footer - Minimalist Subtle */}
      <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/30 rounded-b-2xl flex justify-between items-center">
         <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-slate-200" />
             <div className="w-1 h-1 rounded-full bg-slate-200" />
         </div>
         <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            ENGINE: INNODB
         </span>
      </div>
    </div>
  );
}
