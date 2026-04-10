'use client';

import { useEffect, useState, useRef } from 'react';
import { useSchemaStore } from '@/store/useSchemaStore';
import { useConnectionStore } from '@/store/useConnectionStore';
import { toast } from 'sonner';
import { 
  Database, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Plus, 
  RefreshCw,
  Table as TableIcon,
  Trash2,
  Terminal,
  MoreVertical
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { 
    databases, 
    fetchDatabases, 
    currentDatabase, 
    setCurrentDatabase, 
    tables,
    isTablesLoading,
    isLoading,
    dropDatabase 
  } = useSchemaStore();
  
  const { activeConnection, applyConnection } = useConnectionStore();
  const [search, setSearch] = useState('');
  
  // Context Menu State
  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);

  useEffect(() => {
    const initSidebar = async () => {
      if (activeConnection) {
        // 1. Pastikan backend sinkron dengan koneksi aktif kita (Auto-Apply)
        await applyConnection(activeConnection);
        // 2. Baru tarik database-nya
        await fetchDatabases();
      }
    };
    
    initSidebar();
  }, [activeConnection, fetchDatabases, applyConnection]);

  const handleContextMenu = (e: React.MouseEvent, db: string) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuTarget(db);
  };

  const closeMenu = () => {
    setMenuPos(null);
    setMenuTarget(null);
  };

  useEffect(() => {
    const handleClick = () => closeMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleDrop = async (db: string) => {
    if (confirm(`Are you sure you want to drop database "${db}"? This action is IRREVERSIBLE.`)) {
      const ok = await dropDatabase(db);
      if (ok) toast.success(`Database "${db}" dropped`);
      else toast.error(`Failed to drop database "${db}"`);
    }
    closeMenu();
  };

  const filteredDatabases = databases.filter(db => 
    db.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 border-r border-gray-200 bg-[#f8f9fa] flex flex-col h-full shrink-0 select-none relative">
      {/* Sidebar Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Explorer</h2>
          <div className="flex gap-1">
            <button 
                onClick={() => fetchDatabases()}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600 transition-all"
                title="Refresh All"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600 transition-all" title="Create New Database">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search databases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Database List */}
      <ScrollArea className="flex-1 px-2 pt-2">
        <div className="space-y-0.5">
          {filteredDatabases.length === 0 && !isLoading && (
            <div className="py-12 text-center opacity-40">
                <Database className="w-10 h-10 mx-auto mb-3 stroke-[1.5px]" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No Results</p>
            </div>
          )}

          {filteredDatabases.map((db) => (
            <div key={db} className="group relative">
              <button
                onClick={() => setCurrentDatabase(currentDatabase === db ? null : db)}
                onContextMenu={(e) => handleContextMenu(e, db)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group-context-menu:bg-blue-50",
                  currentDatabase === db 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100 font-medium" 
                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                )}
              >
                <div className="shrink-0">
                  {currentDatabase === db ? (
                    <ChevronDown className={cn("w-3.5 h-3.5", currentDatabase === db ? "text-blue-100" : "text-gray-400")} />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
                <Database className={cn("w-4 h-4 shrink-0", currentDatabase === db ? "text-blue-100" : "text-gray-400")} />
                <span className="truncate flex-1 text-left">{db}</span>
                
                <MoreVertical 
                  className={cn(
                    "w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
                    currentDatabase === db ? "text-blue-200" : "text-gray-300"
                  )} 
                  onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, db); }}
                />
              </button>

              {/* Nested Table List */}
              {currentDatabase === db && (
                <div className="ml-6 mt-1 mb-2 space-y-0.5 border-l-2 border-blue-500/10 pl-3 py-1 ring-inset transition-all animate-in slide-in-from-left-2 duration-200">
                   <div className="flex items-center justify-between pr-2 mb-1">
                      <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Tables</span>
                      {isTablesLoading && <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-300" />}
                   </div>

                   {tables.length === 0 && !isTablesLoading ? (
                     <p className="text-[10px] text-gray-400 italic py-2 pl-2">No tables found</p>
                   ) : (
                     tables.map((table: any) => (
                       <button 
                         key={table.name}
                         className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                       >
                         <TableIcon className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400" />
                         <span className="truncate">{table.name}</span>
                       </button>
                     ))
                   )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* CUSTOM CONTEXT MENU */}
      {menuPos && (
        <div 
          className="fixed z-[1000] w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-1 animate-in zoom-in-95 duration-100"
          style={{ top: menuPos.y, left: menuPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-gray-50">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter truncate">{menuTarget}</p>
          </div>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="w-3 h-3" /> Refresh Schema
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Terminal className="w-3 h-3" /> New SQL Query
          </button>
          <div className="h-px bg-gray-100 my-1"></div>
          <button 
            onClick={() => menuTarget && handleDrop(menuTarget)}
            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" /> Drop Database
          </button>
        </div>
      )}

      {/* Connection Info Footer */}
      <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-30"></div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight truncate leading-none mb-1">MySQL Connected</p>
          <p className="text-xs font-bold text-gray-700 truncate tracking-tight">{activeConnection?.name || 'Local MySQL'}</p>
        </div>
        <SettingsBtn />
      </div>
    </aside>
  );
}

function SettingsBtn() {
    return (
        <button className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all">
            <MoreVertical className="w-4 h-4" />
        </button>
    )
}
