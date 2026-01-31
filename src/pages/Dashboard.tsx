'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    TrendingUp,
    CheckCircle2,
    Zap,
    Wallet,
    ArrowDownCircle,
    ArrowUpCircle
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        activeTasks: 0,
        mealsToday: 0,
        completionRate: 0
    });

    const [expenseData, setExpenseData] = useState<any[]>([]);
    const [flowData, setFlowData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: transactions } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: true });

            if (transactions) {
                const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

                setStats(prev => ({
                    ...prev,
                    totalIncome: income,
                    totalExpenses: expense
                }));

                // Expense by category pie chart
                const expOnly = transactions.filter(t => t.type === 'expense');
                const grouped = expOnly.reduce((acc: any, t) => {
                    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                    return acc;
                }, {});
                setExpenseData(Object.entries(grouped).map(([name, value]) => ({ name, value })));

                // Income vs Expense comparison
                setFlowData([
                    { name: 'Income', value: income, color: '#10b981' },
                    { name: 'Expense', value: expense, color: '#ef4444' }
                ]);
            }

            const { data: tasks } = await supabase.from('tasks').select('*');
            if (tasks) {
                const active = tasks.filter(t => t.status !== 'done').length;
                const completed = tasks.filter(t => t.status === 'done').length;
                setStats(prev => ({
                    ...prev,
                    activeTasks: active,
                    completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
                }));
            }

            const today = new Date().toISOString().split('T')[0];
            const { count } = await supabase
                .from('meals')
                .select('*', { count: 'exact', head: true })
                .gte('timestamp', `${today}T00:00:00`)
                .lte('timestamp', `${today}T23:59:59`);

            setStats(prev => ({ ...prev, mealsToday: count || 0 }));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your productivity and finances.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Balance"
                    value={formatCurrency(stats.totalIncome - stats.totalExpenses)}
                    icon={Wallet}
                    trend="Current"
                    trendUp={true}
                />
                <StatCard
                    title="Income"
                    value={formatCurrency(stats.totalIncome)}
                    icon={ArrowUpCircle}
                    trend="Monthly"
                    trendUp={true}
                    color="text-emerald-500 bg-emerald-500/10"
                />
                <StatCard
                    title="Tasks"
                    value={stats.activeTasks.toString()}
                    icon={CheckCircle2}
                    trend="Active"
                    trendUp={false}
                />
                <StatCard
                    title="Progress"
                    value={`${stats.completionRate}%`}
                    icon={Zap}
                    trend="Overall"
                    trendUp={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Flow Chart */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-lg font-bold">Income vs Expenses</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={flowData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontWeight="bold" />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                                    {flowData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Category Chart */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                            <ArrowDownCircle size={20} />
                        </div>
                        <h3 className="text-lg font-bold">Expense Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {expenseData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '16px'
                                    }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
    return (
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-5">
                <div className={cn("p-3 rounded-2xl transition-colors", color || "bg-primary/10 text-primary")}>
                    <Icon size={24} />
                </div>
                <div className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border transition-all",
                    trendUp ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{title}</p>
                <h4 className="text-2xl font-black tracking-tight">{value}</h4>
            </div>
        </div>
    );
}
