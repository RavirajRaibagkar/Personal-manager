'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, Loader2, Baby } from 'lucide-react';

export default function ParentLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { role: 'parent' } }
                });
                if (error) throw error;

                if (data.user) {
                    await supabase
                        .from('profiles')
                        .insert([{
                            id: data.user.id,
                            full_name: email.split('@')[0],
                            role: 'parent'
                        }]);
                }
                alert('Verification email sent! Please check your inbox.');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                if (data.user) {
                    // Force update role to parent if logging in through parent portal
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    if (!existingProfile || existingProfile.role !== 'parent') {
                        await supabase
                            .from('profiles')
                            .upsert({
                                id: data.user.id,
                                full_name: email.split('@')[0],
                                role: 'parent'
                            });
                    }
                }
                router.push('/parent');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-indigo-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-md w-full relative">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-3xl shadow-lg shadow-indigo-500/20 mb-2 transform hover:scale-105 transition-transform duration-300">
                            <ShieldCheck size={40} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight">Parent Portal</h2>
                        <p className="text-slate-400 text-lg">
                            {isSignUp ? 'Create your guardian account' : 'Welcome back, Guardian'}
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleAuth}>
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Guardian Email"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Secret Guard Key"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (isSignUp ? 'Initialize Account' : 'Secure Entry')}
                        </button>
                    </form>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="w-full text-slate-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            {isSignUp ? 'Already a guardian? Enter portal' : 'Need parent access? Register here'}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1e293b] px-2 text-slate-500 font-bold tracking-widest">Other Options</span></div>
                        </div>

                        <button
                            onClick={() => router.push('/login')}
                            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 text-sm font-bold transition-colors"
                        >
                            <Baby size={16} />
                            Go to Child Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
