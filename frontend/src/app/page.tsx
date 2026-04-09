'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ConnectionModal from '@/components/modals/ConnectionModal';
import { useConnectionStore } from '@/store/useConnectionStore';
import { useSchemaStore } from '@/store/useSchemaStore';
import { Database, Plus } from 'lucide-react';

export default function Home() {
  const [activePage, setActivePage] = useState<'diagram' | 'data' | 'sql'>('diagram');
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const { activeConnection } = useConnectionStore();
  const { currentDatabase } = useSchemaStore();

  // Open modal on load if no active connection (optional UX)
  useEffect(() => {
    if (!activeConnection) {
        setIsConnModalOpen(true);
    }
  }, [activeConnection]);

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden text-slate-900">
      {/* 1. TOP NAV */}
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Canvas / Content Area */}
        <div className="flex-1 relative bg-slate-50 flex flex-col overflow-hidden">
          {/* Active Database Content Placeholder */}
          {!currentDatabase ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6">
                <Database className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Database Active</h3>
              <p className="text-slate-500 max-w-sm mt-2">
                Select a database from the sidebar or create a new one to start architecting your schema.
              </p>
              <div className="mt-8 flex gap-4">
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Table
                </button>
                <button 
                  onClick={() => setIsConnModalOpen(true)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Change Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12">
               <div className="text-center">
                 <p className="text-slate-400 font-mono text-sm">Workspace for:</p>
                 <h2 className="text-4xl font-black text-slate-900 mt-2 uppercase tracking-tighter">{currentDatabase}</h2>
                 <p className="mt-4 text-slate-500">Wait for Tahap Utama: ERD Canvas Integration...</p>
               </div>
            </div>
          )}

          {/* Bottom Bar (Statistics placeholder) */}
          <div className="h-7 bg-white border-t border-slate-200 flex items-center px-4 justify-between shrink-0">
             <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> System Ready</span>
                <span>InnoDB Engine</span>
             </div>
             <div className="text-[10px] font-mono text-slate-400">
                UTF8MB4_UNICODE_CI
             </div>
          </div>
        </div>

        {/* 3. Right Property Panel (To be implemented) */}
        <aside className="w-[300px] border-l border-slate-200 bg-white hidden lg:flex flex-col">
           <div className="p-4 border-b border-slate-200">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Properties</h3>
           </div>
           <div className="flex-1 flex items-center justify-center p-8 text-center">
              <p className="text-xs text-slate-300 italic italic">No item selected</p>
           </div>
        </aside>
      </div>

      {/* Modals */}
      <ConnectionModal 
        isOpen={isConnModalOpen} 
        onClose={() => setIsConnModalOpen(false)} 
        onConnect={() => console.log("Re-connected")} 
      />
    </div>
  );
}
