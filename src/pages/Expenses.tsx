import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Plus,
    Trash2,
    Tag,
    Calendar as CalendarIcon,
    DollarSign,
    TrendingDown,
    TrendingUp,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    Clock
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export function Expenses() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'expense' as 'expense' | 'income',
        category: 'Food',
        note: '',
        date: new Date().toISOString().split('T')[0]
    });

    const expenseCategories = [
        'Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education', 'Rent', 'Other'
    ];

    const incomeCategories = [
        'Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'
    ];

    const activeCategories = newTransaction.type === 'expense' ? expenseCategories : incomeCategories;

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        const { data } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (data) setTransactions(data);
        setLoading(false);
    };

    const addTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const { error } = await supabase
            .from('expenses')
            .insert([{
                ...newTransaction,
                amount: parseFloat(newTransaction.amount),
                user_id: user.id
            }]);

        if (!error) {
            setIsAdding(false);
            setNewTransaction({
                amount: '',
                type: 'expense',
                category: 'Food',
                note: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchTransactions();
        }
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (!error) fetchTransactions();
    };

    const totals = transactions.reduce((acc, curr) => {
        if (curr.type === 'income') acc.income += Number(curr.amount);
        else acc.expenses += Number(curr.amount);
        return acc;
    }, { income: 0, expenses: 0 });

    return (
        <div className="space-y-6 max-w-full overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finances</h2>
                    <p className="text-muted-foreground">Monitor your income and expenses.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={20} />
                    Add Record
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Income"
                    value={formatCurrency(totals.income)}
                    icon={ArrowUpCircle}
                    color="text-emerald-500 bg-emerald-500/10"
                />
                <StatCard
                    title="Total Expenses"
                    value={formatCurrency(totals.expenses)}
                    icon={ArrowDownCircle}
                    color="text-red-500 bg-red-500/10"
                />
                <StatCard
                    title="Balance"
                    value={formatCurrency(totals.income - totals.expenses)}
                    icon={Wallet}
                    color="text-primary bg-primary/10"
                />
            </div>

            {isAdding && (
                <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-xl animate-in fade-in zoom-in duration-200">
                    <form onSubmit={addTransaction} className="space-y-6">
                        <div className="flex p-1 bg-muted rounded-xl w-full max-w-[300px]">
                            <button
                                type="button"
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: 'Food' })}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                    newTransaction.type === 'expense' ? "bg-card text-red-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: 'Salary' })}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                    newTransaction.type === 'income' ? "bg-card text-emerald-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Income
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newTransaction.amount}
                                        onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    value={newTransaction.category}
                                    onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    {activeCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newTransaction.date}
                                    onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Note</label>
                                <input
                                    value={newTransaction.note}
                                    onChange={e => setNewTransaction({ ...newTransaction, note: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Optional description..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-border">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-2.5 text-muted-foreground hover:bg-accent rounded-xl transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={cn(
                                    "px-6 py-2.5 text-white rounded-xl font-bold transition-all shadow-md active:scale-95",
                                    newTransaction.type === 'expense' ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
                                )}
                            >
                                Save {newTransaction.type}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions History */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="hidden md:block">
                    {/* Desktop Table */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs font-black uppercase tracking-widest text-muted-foreground">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Note</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm italic">No transactions recorded yet.</td></tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-accent/30 transition-all group">
                                        <td className="px-6 py-4 text-sm font-medium">{formatDate(t.date)}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                                t.type === 'income' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground truncate block max-w-[200px]">{t.note || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={cn(
                                                "text-sm font-black flex items-center justify-end gap-1.5",
                                                t.type === 'income' ? "text-emerald-500" : "text-red-500"
                                            )}>
                                                {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {formatCurrency(t.amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteTransaction(t.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-all"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View - No Horizontal Scroll, Date below Type */}
                <div className="md:hidden divide-y divide-border">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground text-sm font-bold">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm italic">No transactions yet.</div>
                    ) : (
                        transactions.map((t) => (
                            <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-accent/10 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest mb-0.5 px-2 py-0.5 rounded-full border self-start",
                                            t.type === 'income' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" : "text-red-500 border-red-500/20 bg-red-500/10"
                                        )}>
                                            {t.category}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-1">
                                            <CalendarIcon size={10} />
                                            {formatDate(t.date)}
                                        </span>
                                        {t.note && <p className="text-xs text-foreground/70 mt-1 truncate max-w-[150px]">{t.note}</p>}
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-2 shrink-0">
                                    <div className={cn(
                                        "text-sm font-black flex items-center gap-1",
                                        t.type === 'income' ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </div>
                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="p-1.5 text-muted-foreground active:text-destructive active:bg-destructive/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-3 transition-all">
            <div className={cn("p-2 rounded-xl shrink-0 scale-90 md:scale-100", color)}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-wider mb-0.5">{title}</p>
                <h4 className="text-lg md:text-xl font-black tracking-tight">{value}</h4>
            </div>
        </div>
    );
}
