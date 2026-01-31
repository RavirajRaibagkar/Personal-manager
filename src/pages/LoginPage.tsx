'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<'parent' | 'child'>('child');
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
                    options: {
                        data: {
                            role: role
                        }
                    }
                });
                if (error) throw error;

                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                full_name: email.split('@')[0],
                                role: role
                            }
                        ]);
                    if (profileError) throw profileError;
                }

                alert('Check your email for confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-lg border border-border">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl text-primary-foreground mb-4">
                        <LayoutDashboard size={32} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isSignUp ? 'Create an account' : 'Welcome back'}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        {isSignUp ? 'Sign up to start managing your life' : 'Sign in to access your dashboard'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Password"
                            />
                        </div>

                        {/* Role Selection */}
                        {isSignUp && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('child')}
                                    className={`py-2 px-4 rounded-lg border transition-all ${role === 'child'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:border-primary'
                                        }`}
                                >
                                    Child Account
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('parent')}
                                    className={`py-2 px-4 rounded-lg border transition-all ${role === 'parent'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:border-primary'
                                        }`}
                                >
                                    Parent Account
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            isSignUp ? 'Sign Up' : 'Sign In'
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }}
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
