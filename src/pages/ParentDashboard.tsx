'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    Activity,
    CheckCircle2,
    Wallet,
    Calendar,
    ArrowRight,
    Search,
    Loader2,
    Shield,
    Bell,
    Settings,
    Eye,
    TrendingUp,
    Layout,
    Utensils,
    Clock
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';

interface ChildProfile {
    id: string;
    full_name: string;
}

interface ChildStats {
    totalIncome: number;
    totalExpenses: number;
    activeTasks: number;
    completionRate: number;
    mealsToday: number;
}

export default function ParentDashboard() {
    const { user } = useAuth();
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [selectedChild, setSelectedChild] = useState<string | null>(null);
    const [childStats, setChildStats] = useState<ChildStats | null>(null);
    const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
    const [recentTasks, setRecentTasks] = useState<any[]>([]);
    const [recentMeals, setRecentMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchChildren();
    }, [user]);

    useEffect(() => {
        if (selectedChild) fetchChildStats(selectedChild);
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            const { data, error } = await supabase
                .from('family_links')
                .select('child_id, profiles:child_id (id, full_name)')
                .eq('parent_id', user?.id);

            if (error) throw error;

            const linked = data.map((item: any) => ({
                id: item.profiles.id,
                full_name: item.profiles.full_name
            }));

            setChildren(linked);
            if (linked.length > 0 && !selectedChild) setSelectedChild(linked[0].id);
        } catch (err: any) {
            console.error('Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchChildStats = async (childId: string) => {
        try {
            const [
                { data: expenses },
                { data: tasks },
                { data: meals },
                { count: mealsCount }
            ] = await Promise.all([
                supabase.from('expenses').select('*').eq('user_id', childId).order('date', { ascending: false }).limit(5),
                supabase.from('tasks').select('*').eq('user_id', childId).order('created_at', { ascending: false }).limit(5),
                supabase.from('meals').select('*').eq('user_id', childId).order('timestamp', { ascending: false }).limit(5),
                supabase.from('meals').select('*', { count: 'exact', head: true }).eq('user_id', childId).gte('timestamp', new Date().toISOString().split('T')[0])
            ]);

            const { data: allExpenses } = await supabase.from('expenses').select('amount, type').eq('user_id', childId);
            const { data: allTasks } = await supabase.from('tasks').select('status').eq('user_id', childId);

            const totalInc = allExpenses?.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
            const totalExp = allExpenses?.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
            const completed = allTasks?.filter(t => t.status === 'done').length || 0;

            setChildStats({
                totalIncome: totalInc,
                totalExpenses: totalExp,
                activeTasks: (allTasks?.length || 0) - completed,
                completionRate: allTasks?.length ? Math.round((completed / allTasks.length) * 100) : 0,
                mealsToday: mealsCount || 0
            });

            setRecentExpenses(expenses || []);
            setRecentTasks(tasks || []);
            setRecentMeals(meals || []);
        } catch (err: any) {
            console.error('Error fetching stats:', err.message);
        }
    };

    const handleLinkChild = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            // Link directly via UUID provided by child
            const { data: child, error: searchError } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('id', searchQuery.trim())
                .eq('role', 'child')
                .maybeSingle();

            if (searchError) throw searchError;

            if (!child) {
                throw new Error('Invalid Family ID. Please check the ID provided by the child.');
            }

            const { error: linkError } = await supabase
                .from('family_links')
                .insert([{ parent_id: user?.id, child_id: child.id }]);

            if (linkError) {
                if (linkError.code === '23505') throw new Error('Account already linked.');
                throw new Error('Connection failed. Please ensure the ID is correct.');
            }

            setSearchQuery('');
            fetchChildren();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-indigo-500">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold tracking-widest text-sm uppercase">Synchronizing Guardian Data</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 selection:bg-indigo-500/30">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-xs uppercase">
                        <Shield size={14} />
                        Active Monitoring Session
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Guardian Oversight</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <form onSubmit={handleLinkChild}>
                            <input
                                type="text"
                                placeholder="Paste Family ID here..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all w-full md:w-64 text-sm"
                            />
                        </form>
                    </div>
                    <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
                    </button>
                    <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-8 animate-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: Family Registry */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Registry</h3>
                        <Users size={16} className="text-slate-600" />
                    </div>

                    <div className="space-y-3">
                        {children.length === 0 ? (
                            <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
                                <p className="text-slate-500 text-sm">No accounts linked.</p>
                            </div>
                        ) : (
                            children.map((child) => (
                                <button
                                    key={child.id}
                                    onClick={() => setSelectedChild(child.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-5 rounded-3xl border transition-all group relative overflow-hidden",
                                        selectedChild === child.id
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20"
                                            : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner",
                                            selectedChild === child.id ? "bg-white/20" : "bg-slate-800 text-indigo-400"
                                        )}>
                                            {child.full_name[0].toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black tracking-tight">{child.full_name}</p>
                                            <p className={cn("text-[10px] font-bold uppercase tracking-wider", selectedChild === child.id ? "text-indigo-200" : "text-slate-600")}>Monitored</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className={cn(
                                        "transition-transform relative z-10",
                                        selectedChild === child.id ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                                    )} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main: Monitoring View */}
                <div className="lg:col-span-9 space-y-8">
                    {selectedChild && childStats ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Visual Stats Grid - Improved for Mobile Wrapping */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                                <MonitorCard title="Current Balance" value={formatCurrency(childStats.totalIncome - childStats.totalExpenses)} icon={Activity} color="text-indigo-400" bg="bg-indigo-400/10" />
                                <MonitorCard title="Financials" value={formatCurrency(childStats.totalExpenses)} icon={Wallet} color="text-rose-500" bg="bg-rose-500/10" />
                                <MonitorCard title="Tasks" value={childStats.activeTasks.toString()} icon={CheckCircle2} color="text-sky-500" bg="bg-sky-500/10" />
                                <MonitorCard title="Efficiency" value={`${childStats.completionRate}%`} icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-500/10" />
                                <MonitorCard title="Meals Today" value={childStats.mealsToday.toString()} icon={Calendar} color="text-amber-500" bg="bg-amber-500/10" />
                            </div>

                            {/* Detailed Lists Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Recent Expenses */}
                                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500">
                                            <Wallet size={20} />
                                        </div>
                                        <h3 className="text-xl font-black">Recent Expenses</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {recentExpenses.length === 0 ? (
                                            <p className="text-slate-500 text-sm italic">No recent expenses logged.</p>
                                        ) : (
                                            recentExpenses.map((exp) => (
                                                <div key={exp.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                    <div>
                                                        <p className="font-bold text-slate-200">{exp.description}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{exp.category} • {formatDate(exp.date)}</p>
                                                    </div>
                                                    <span className={cn("font-black", exp.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                                                        {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount)}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Recent Tasks */}
                                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-500">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <h3 className="text-xl font-black">Recent Tasks</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {recentTasks.length === 0 ? (
                                            <p className="text-slate-500 text-sm italic">No tasks assigned.</p>
                                        ) : (
                                            recentTasks.map((task) => (
                                                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                    <div>
                                                        <p className="font-bold text-slate-200">{task.title}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                                                                task.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                            )}>
                                                                {task.status}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                                {task.priority} Priority
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Due</p>
                                                        <p className="text-xs font-bold text-slate-300">{formatDate(task.due_date)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Recent Meals */}
                                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 xl:col-span-2">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                                            <Utensils size={20} />
                                        </div>
                                        <h3 className="text-xl font-black">Nutrition Logs</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recentMeals.length === 0 ? (
                                            <p className="text-slate-500 text-sm italic col-span-full">No meals logged recently.</p>
                                        ) : (
                                            recentMeals.map((meal) => (
                                                <div key={meal.id} className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{meal.type}</span>
                                                        <Clock size={12} className="text-slate-600" />
                                                    </div>
                                                    <p className="font-black text-slate-200 mb-1">{meal.description}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{formatDate(meal.timestamp)}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Activity View */}
                            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Eye size={200} className="text-indigo-500" />
                                </div>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 bg-indigo-500/20 rounded-[1.25rem] flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
                                        <TrendingUp size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tight">Account Insight</h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Registry ID: {selectedChild.slice(0, 8)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <MetricBox label="Reliability" value="High" status="Stable" icon={Shield} />
                                    <MetricBox label="Engagement" value="Active" status="Current" icon={Activity} />
                                    <MetricBox label="Risk Profile" value="Secure" status="Verified" icon={CheckCircle2} color="text-emerald-400" />
                                </div>

                                <div className="mt-12 p-12 bg-slate-950/50 rounded-[2rem] border border-slate-800/50 text-center relative z-10 backdrop-blur-sm">
                                    <Layout className="mx-auto mb-6 text-slate-700" size={48} />
                                    <p className="text-slate-400 text-lg font-medium mb-6">Live stream for <span className="text-white font-bold">{children.find(c => c.id === selectedChild)?.full_name}</span> is active and secure.</p>
                                    <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-[0.2em] uppercase rounded-full shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
                                        Download Security Audit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 border-4 border-dashed border-slate-900/50 rounded-[4rem]">
                            <Shield size={80} className="text-slate-800 mb-8 animate-pulse" />
                            <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Selection Required</h3>
                            <p className="text-slate-600 max-w-sm text-lg font-medium">Please select a profile from the registry to initialize the monitoring interface.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MonitorCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] group hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-8">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform", bg, color)}>
                    <Icon size={28} />
                </div>
                <div className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 border border-white/5">Signal: 100%</div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{title}</p>
                <h4 className="text-4xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">{value}</h4>
            </div>
        </div>
    );
}

function MetricBox({ label, value, status, icon: Icon, color = "text-indigo-400" }: any) {
    return (
        <div className="bg-slate-950/40 p-8 rounded-[2rem] border border-slate-800/30 group hover:bg-slate-950/60 transition-colors">
            <div className="flex items-center gap-3 mb-4 text-slate-600 group-hover:text-indigo-500 transition-colors">
                <Icon size={16} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-3xl font-black tracking-tighter", color)}>{value}</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em]">/ {status}</span>
            </div>
        </div>
    );
}
