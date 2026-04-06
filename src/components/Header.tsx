import { BookOpen, Settings, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  view: 'student' | 'admin';
  setView: (view: 'student' | 'admin') => void;
  paperCount: number;
  session?: Session | null;
}

export default function Header({ view, setView, paperCount, session }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between px-4 md:px-6 py-4 bg-[#0f172a] border-b border-slate-800 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 flex items-center justify-center shadow-lg">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-serif font-bold tracking-wide text-white">ExamCloud</span>
      </div>

      <div className="flex bg-[#1e293b] rounded-lg p-1 order-3 w-full sm:w-auto sm:order-2 justify-center">
        <button
          onClick={() => setView('student')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'student' ? 'bg-brand-yellow text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Student
        </button>
        <button
          onClick={() => setView('admin')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'admin' ? 'bg-brand-yellow text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Admin
        </button>
      </div>

      <div className="flex items-center gap-3 order-2 sm:order-3">
        {session && view === 'admin' && (
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 text-sm text-slate-300 hover:text-red-400 hover:border-red-400/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Connected
        </div>
        <div className="px-3 md:px-4 py-1.5 rounded-full border border-slate-700 text-sm text-slate-300 flex items-center gap-2">
          <span className="w-3 h-0.5 bg-brand-yellow"></span>
          {paperCount} <span className="hidden sm:inline">papers</span>
        </div>
      </div>
    </header>
  );
}
