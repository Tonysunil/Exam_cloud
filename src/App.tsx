import { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentView from './components/StudentView';
import AdminView from './components/AdminView';
import Auth from './components/Auth';
import { Paper } from './types';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchPapers();

    return () => subscription.unsubscribe();
  }, []);

  const fetchPapers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to load papers. Please refresh the page.');
    } else if (data) {
      const formattedPapers = data.map(p => ({
        id: p.id,
        subject: p.subject,
        year: p.year,
        type: p.type,
        branch: p.branch,
        semester: p.semester,
        url: p.url,
        fileName: p.fileName,
        tags: p.tags || [],
        createdAt: p.created_at
      }));
      setPapers(formattedPapers);
    }
    setIsLoading(false);
  };

  const handleAddPaper = async (paper: Omit<Paper, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('papers')
      .insert([{
        subject: paper.subject,
        year: paper.year,
        type: paper.type,
        branch: paper.branch,
        semester: paper.semester,
        url: paper.url,
        fileName: paper.fileName,
        tags: paper.tags || []
      }])
      .select();

    if (error) {
      console.error('Error adding paper:', error);
      toast.error('Failed to add paper: ' + error.message);
    } else if (data) {
      const newPaper = {
        id: data[0].id,
        subject: data[0].subject,
        year: data[0].year,
        type: data[0].type,
        branch: data[0].branch,
        semester: data[0].semester,
        url: data[0].url,
        fileName: data[0].fileName,
        tags: data[0].tags || [],
        createdAt: data[0].created_at
      };
      setPapers([newPaper, ...papers]);
      setView('student');
      toast.success('Paper added successfully!');
    }
  };

  const handleDeletePaper = async (id: string) => {
    const { error } = await supabase.from('papers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting paper:', error);
      toast.error('Failed to delete paper: ' + error.message);
    } else {
      setPapers(papers.filter(p => p.id !== id));
      toast.success('Paper deleted successfully!');
    }
  };

  const handleEditPaper = async (id: string, updates: Partial<Paper>) => {
    const { error } = await supabase.from('papers').update({
      subject: updates.subject,
      year: updates.year,
      type: updates.type,
      branch: updates.branch,
      semester: updates.semester,
      tags: updates.tags
    }).eq('id', id);

    if (error) {
      console.error('Error updating paper:', error);
      toast.error('Failed to update paper: ' + error.message);
    } else {
      setPapers(papers.map(p => p.id === id ? { ...p, ...updates } : p));
      toast.success('Paper updated successfully!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-yellow">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-dark text-slate-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#eab308',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Header view={view} setView={setView} paperCount={papers.length} session={session} />
      <main className="flex-grow flex flex-col">
        {view === 'student' ? (
          <StudentView papers={papers} />
        ) : session ? (
          <AdminView 
            papers={papers} 
            onAddPaper={handleAddPaper} 
            onDeletePaper={handleDeletePaper} 
            onEditPaper={handleEditPaper}
          />
        ) : (
          <Auth />
        )}
      </main>
    </div>
  );
}
