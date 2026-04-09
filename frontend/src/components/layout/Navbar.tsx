'use client';

import { Database as DatabaseIcon, Layers, Table as TableIcon, Terminal, Save, Settings, Download, Upload, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSchemaStore } from '@/store/useSchemaStore';

interface NavbarProps {
    activePage: 'diagram' | 'data' | 'sql';
    onNavigate: (page: 'diagram' | 'data' | 'sql') => void;
}

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const { currentDatabase } = useSchemaStore();

  return (
    <nav className="h-14 w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 select-none z-50">
      {/* LEFT: Brand + Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 cursor-default">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <DatabaseIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-black tracking-tight text-gray-900">Draw<span className="text-blue-600">DB</span></span>
        </div>

        <div className="h-5 w-px bg-gray-200"></div>

        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg">
          <button 
            onClick={() => onNavigate('diagram')}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
              activePage === 'diagram' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Diagram
          </button>
          <button 
            onClick={() => onNavigate('data')}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
              activePage === 'data' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            )}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Browser
          </button>
          <button 
            onClick={() => onNavigate('sql')}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
              activePage === 'sql' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            SQL Console
          </button>
        </div>
      </div>

      {/* CENTER: Sync Status (Simplified for now) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full">
         <span className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500")} />
         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {currentDatabase ? `Editing: ${currentDatabase}` : 'No Database Selected'}
         </span>
      </div>

      {/* RIGHT: Tools */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
          <Download className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
          <Upload className="w-4 h-4" />
        </button>
        
        <div className="h-5 w-px bg-gray-200"></div>
        
        <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
          <Settings className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center cursor-pointer">
            <User className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </nav>
  );
}
