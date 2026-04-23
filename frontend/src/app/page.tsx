'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ConnectionModal from '@/components/modals/ConnectionModal';
import { useConnectionStore } from '@/store/useConnectionStore';
import { useSchemaStore } from '@/store/useSchemaStore';
import { Database, Search } from 'lucide-react';

import ERDCanvas from '@/components/canvas/ERDCanvas';
import PropertyPanel from '@/components/layout/PropertyPanel';

export default function Home() {
  const [activePage, setActivePage] = useState<'diagram' | 'data' | 'sql'>('diagram');
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const { activeConnection } = useConnectionStore();
  const { currentDatabase } = useSchemaStore();

  useEffect(() => {
    if (!activeConnection) {
        setIsConnModalOpen(true);
    }
  }, [activeConnection]);

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden text-slate-800">
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 relative bg-slate-50 flex flex-col overflow-hidden">
          {!currentDatabase ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white/50">
              <div className="w-16 h-16 border border-dashed border-slate-200 rounded-full flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-slate-200" />
              </div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">No Database Active</h3>
              <p className="text-[11px] text-slate-400 max-w-[240px] mt-2 font-medium leading-relaxed">
                Select a database from the sidebar to begin architecting your schema or browse data.
              </p>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsConnModalOpen(true)}
                  className="px-5 py-2 border border-slate-200 text-slate-400 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Change Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
                {activePage === 'diagram' && <ERDCanvas />}
                {activePage === 'data' && (
                    <div className="flex-1 flex items-center justify-center p-12 text-[10px] uppercase font-black tracking-widest text-slate-300">
                        Browser coming soon
                    </div>
                )}
                {activePage === 'sql' && (
                    <div className="flex-1 flex items-center justify-center p-12 text-[10px] uppercase font-black tracking-widest text-slate-300">
                        Console coming soon
                    </div>
                )}
            </div>
          )}

          {/* Bottom Bar - Slim ddan Minimal */}
          <div className="h-6 bg-white border-t border-slate-100 flex items-center px-4 justify-between shrink-0">
             <div className="flex items-center gap-4 text-[8px] uppercase font-black tracking-[0.2em] text-slate-300">
                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" /> Ready</span>
                <span>InnoDB</span>
             </div>
             <div className="text-[8px] font-mono text-slate-200 uppercase tracking-tighter">
                UTF8MB4_UNICODE_CI • Local
             </div>
          </div>
        </div>

        <PropertyPanel />
      </div>

      <ConnectionModal 
        isOpen={isConnModalOpen} 
        onClose={() => setIsConnModalOpen(false)} 
        onConnect={() => console.log("Re-connected")} 
      />
    </div>
  );
}
