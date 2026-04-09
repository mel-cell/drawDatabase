'use client';

import { useState } from 'react';
import ConnectionModal from '@/components/modals/ConnectionModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-24">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Draw<span className="text-blue-600">DB</span> Setup</h1>
        
        <p className="text-gray-500 font-medium">
          Welcome to the new Next.js IDE environment. Let's start by getting your database connected securely!
        </p>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-black hover:scale-105 transition-all"
        >
          Open Connection Engine
        </button>
      </div>

      <ConnectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnect={() => console.log("Connected to DB!")}
      />
    </main>
  );
}
