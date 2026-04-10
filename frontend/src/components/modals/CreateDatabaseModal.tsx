'use client';

import { useState } from 'react';
import { useSchemaStore } from '@/store/useSchemaStore';
import { 
  Database, 
  X, 
  Plus, 
  Loader2,
  AlertCircle,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface CreateDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDatabaseModal({ isOpen, onClose }: CreateDatabaseModalProps) {
  const [dbName, setDbName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDatabase } = useSchemaStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbName.trim()) {
      toast.error('Database name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    const success = await createDatabase(dbName.trim());
    setIsSubmitting(false);

    if (success) {
      toast.success(`Database "${dbName}" created successfully`);
      setDbName('');
      onClose();
    } else {
      toast.error('Failed to create database. It might already exist.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">New Database</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Create MySQL Schema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
              Database Name
            </label>
            <div className="relative group">
              <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input
                autoFocus
                type="text"
                placeholder="e.g. ecommerce_db"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-300"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 flex gap-3 border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
              Creating a database will initialize a fresh schema in your active MySQL connection. Make sure you have the necessary permissions.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Create Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
