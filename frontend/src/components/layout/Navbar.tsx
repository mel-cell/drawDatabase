'use client';

import { Database as DatabaseIcon, Layers, Table as TableIcon, Terminal, Settings, Download, Upload, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSchemaStore } from '@/store/useSchemaStore';

interface NavbarProps {
    activePage: 'diagram' | 'data' | 'sql';
    onNavigate: (page: 'diagram' | 'data' | 'sql') => void;
}

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const { currentDatabase, isTablesLoading } = useSchemaStore();

  return (
    <nav className="h-14 w-full bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 select-none z-50 shadow-sm shadow-slate-900/5">
      {/* LEFT: Branding + Tabs */}
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3 cursor-default group">
          <div className="w-8 h-8 bg-[#1A73E8] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
            <DatabaseIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
             Draw<span className="text-[#1A73E8]">DB</span>
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
          <button 
            onClick={() => onNavigate('diagram')}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activePage === 'diagram' ? "bg-white text-[#1A73E8] shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Diagram
          </button>
          <button 
            onClick={() => onNavigate('data')}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activePage === 'data' ? "bg-white text-[#1A73E8] shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Browser
          </button>
          <button 
            onClick={() => onNavigate('sql')}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activePage === 'sql' ? "bg-white text-[#1A73E8] shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console
          </button>
        </div>
      </div>

      {/* CENTER: Status Hub (Ala-ala Screenshot 2) */}
      <div className="hidden xl:flex items-center gap-4 bg-blue-50/50 border border-blue-100/50 px-5 py-2 rounded-full">
         <div className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500", !currentDatabase && "bg-slate-300")} />
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {currentDatabase ? `Editing: ${currentDatabase}` : 'Select a Database'}
         </span>
      </div>

      {/* RIGHT: Global Tools */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
           <button className="p-2 text-slate-400 hover:text-[#1A73E8] hover:bg-blue-50 rounded-xl transition-all">
             <Download className="w-4 h-4" />
           </button>
           <button className="p-2 text-slate-400 hover:text-[#1A73E8] hover:bg-blue-50 rounded-xl transition-all">
             <Upload className="w-4 h-4" />
           </button>
        </div>
        
        <div className="h-6 w-px bg-slate-100"></div>
        
        <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-all">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group cursor-pointer hover:border-blue-200 transition-all">
                <User className="w-4 h-4 text-slate-300 group-hover:text-[#1A73E8] transition-colors" />
            </div>
        </div>
      </div>
    </nav>
  );
}
