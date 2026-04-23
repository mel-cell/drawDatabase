'use client';

import { useEffect, useState } from 'react';
import { useSchemaStore } from '@/store/useSchemaStore';
import { useConnectionStore } from '@/store/useConnectionStore';
import { toast } from 'sonner';
import CreateDatabaseModal from '@/components/modals/CreateDatabaseModal';
import { 
  Database, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Search, 
  Plus, 
  RefreshCw,
  Table as TableIcon,
  Trash2,
  MoreVertical
} from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreateDbModalOpen, setIsCreateDbModalOpen] = useState(false);
  
  const [dbMenu, setDbMenu] = useState<{ x: number, y: number, name: string } | null>(null);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (!activeConnection) return;
    const initSidebar = async () => {
      const ok = await applyConnection(activeConnection);
      if (ok) await fetchDatabases();
    };
    initSidebar();
  }, [activeConnection, fetchDatabases, applyConnection]);

  const handleDbContextMenu = (e: React.MouseEvent, db: string) => {
    e.preventDefault();
    setDbMenu({ x: e.clientX, y: e.clientY, name: db });
  };

  const closeMenus = () => setDbMenu(null);

  useEffect(() => {
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  const toggleTable = (tableName: string) => {
    const next = new Set(expandedTables);
    if (next.has(tableName)) next.delete(tableName);
    else next.add(tableName);
    setExpandedTables(next);
  };

  const filteredDatabases = databases.filter(db => 
    db.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={cn(
        "border-r border-slate-100 bg-[#F8FAFC] flex flex-col h-full shrink-0 select-none relative transition-all duration-300",
        isCollapsed ? "w-12" : "w-64"
    )}>
      {/* Search & Header Section */}
      <div className={cn("p-6 transition-all", isCollapsed ? "opacity-0 invisible h-0" : "opacity-100")}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Explorer</h2>
          <button 
              onClick={() => fetchDatabases()}
              className={cn("p-1.5 hover:bg-white hover:shadow-sm text-slate-400 rounded-lg transition-all", isLoading && "animate-spin")}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#1A73E8] transition-colors" />
          <input
            type="text"
            placeholder="Search databases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200/60 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-[#1A73E8] outline-none transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* List Area */}
      <div className={cn("flex-1 overflow-y-auto px-3 space-y-1", isCollapsed && "hidden")}>
          {filteredDatabases.map((db) => (
            <div key={db} className="space-y-1">
              <button
                onClick={() => setCurrentDatabase(currentDatabase === db ? null : db)}
                onContextMenu={(e) => handleDbContextMenu(e, db)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                  currentDatabase === db 
                    ? "bg-white text-[#1A73E8] shadow-sm shadow-blue-900/5 font-black border border-blue-50" 
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                )}
              >
                <Database className={cn("w-4 h-4 shrink-0", currentDatabase === db ? "text-[#1A73E8]" : "text-slate-300")} />
                <span className="truncate flex-1 text-left text-xs tracking-tight">{db}</span>
                {currentDatabase === db ? <ChevronDown className="w-3.5 h-3.5 opacity-40" /> : <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40" />}
              </button>

              {currentDatabase === db && (
                <div className="ml-5 mt-1 mb-3 pl-4 border-l-2 border-slate-100 space-y-1 animate-in slide-in-from-left-2 duration-300">
                   <div className="flex items-center justify-between mb-2 pl-1">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Schemas</span>
                      <button onClick={() => setIsCreateDbModalOpen(true)} className="p-1 hover:bg-white rounded"><Plus className="w-2.5 h-2.5 text-slate-300" /></button>
                   </div>

                   {tables.length === 0 && !isTablesLoading ? (
                     <p className="text-[10px] text-slate-300 italic pl-1">No tables found</p>
                   ) : (
                     tables.map((table: any) => (
                       <button 
                          key={table.name}
                          onClick={() => toggleTable(table.name)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-all group",
                            expandedTables.has(table.name) ? "text-[#1A73E8] bg-blue-50/50 font-bold" : "text-slate-400 hover:text-slate-600 hover:bg-white"
                          )}
                        >
                          <TableIcon className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100" />
                          <span className="truncate text-[11px]">{table.name}</span>
                        </button>
                     ))
                   )}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Footer Status Section (Color Indication) */}
      <div className={cn("p-6 border-t border-slate-100 bg-white flex items-center gap-3", isCollapsed && "hidden")}>
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping opacity-30"></div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none mb-1">Status Connected</p>
          <p className="text-[11px] font-black text-slate-700 truncate tracking-tight">{activeConnection?.name || 'Local MySQL'}</p>
        </div>
        <MoreVertical className="w-4 h-4 text-slate-200" />
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-lg text-slate-300 hover:text-[#1A73E8] transition-all z-50 group"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {dbMenu && (
        <div 
          className="fixed z-[3000] w-48 bg-white border border-slate-100 shadow-2xl rounded-xl py-1.5 text-[11px] font-bold text-slate-600"
          style={{ top: dbMenu.y, left: dbMenu.x }}
        >
          <button className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-[#1A73E8] transition-colors">Refresh Tables</button>
          <button className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-[#1A73E8] transition-colors">SQL Interface</button>
          <div className="h-px bg-slate-50 my-1"></div>
          <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-50 transition-colors">Drop Database</button>
        </div>
      )}
      <CreateDatabaseModal isOpen={isCreateDbModalOpen} onClose={() => setIsCreateDbModalOpen(false)} />
    </aside>
  );
}
