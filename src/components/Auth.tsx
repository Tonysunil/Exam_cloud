import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Successfully logged in!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast.error(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-brand-dark px-4 py-12">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-white mb-2">
            {isLogin ? 'Admin Login' : 'Create Admin Account'}
          </h2>
          <p className="text-slate-400">
            {isLogin ? 'Sign in to manage papers' : 'Sign up to manage papers'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="admin@papercloud.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-3 pl-10 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-400 hover:text-brand-yellow transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
