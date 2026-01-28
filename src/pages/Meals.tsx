import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    ChevronLeft,
    ChevronRight,
    Utensils,
    Calendar,
    AlertCircle,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    isAfter
} from 'date-fns';

export function Meals() {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeals();
    }, [currentMonth]);

    const fetchMeals = async () => {
        setLoading(true);
        const start = startOfMonth(currentMonth).toISOString();
        const end = endOfMonth(currentMonth).toISOString();

        const { data } = await supabase
            .from('meals')
            .select('*')
            .gte('timestamp', start)
            .lte('timestamp', end);

        if (data) setMeals(data);
        setLoading(false);
    };

    const toggleMeal = async (date: Date, mealType: 'lunch' | 'dinner', existingId?: string) => {
        if (!user) return;

        if (existingId) {
            const { error } = await supabase.from('meals').delete().eq('id', existingId);
            if (!error) fetchMeals();
        } else {
            // Set time to standard lunch (13:00) or dinner (20:00)
            const timestamp = new Date(date);
            timestamp.setHours(mealType === 'lunch' ? 13 : 20, 0, 0, 0);

            const { error } = await supabase
                .from('meals')
                .insert([{
                    user_id: user.id,
                    meal_type: mealType,
                    timestamp: timestamp.toISOString()
                }]);
            if (!error) fetchMeals();
        }
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const getMealForDay = (date: Date, type: string) => {
        return meals.find(m => isSameDay(new Date(m.timestamp), date) && m.meal_type === type);
    };

    const holidaysCount = days.reduce((count, day) => {
        // A "holiday" is a day where neither lunch nor dinner is logged
        // (Or maybe days where at least one is missing? Let's go with "No meals logged")
        const hasLunch = getMealForDay(day, 'lunch');
        const hasDinner = getMealForDay(day, 'dinner');
        return (!hasLunch && !hasDinner) ? count + 1 : count;
    }, 0);

    const stats = {
        totalDays: days.length,
        loggedMeals: meals.length,
        holidays: holidaysCount
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Meal Routine</h2>
                    <p className="text-muted-foreground">Track your lunch and dinner attendance.</p>
                </div>

                <div className="flex items-center bg-card border border-border rounded-xl p-1 shrink-0">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-4 font-semibold min-w-[140px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Days"
                    value={stats.totalDays.toString()}
                    icon={Calendar}
                    color="bg-blue-500/10 text-blue-500"
                />
                <StatCard
                    title="Meals Logged"
                    value={stats.loggedMeals.toString()}
                    icon={Utensils}
                    color="bg-emerald-500/10 text-emerald-500"
                />
                <StatCard
                    title="Meal Holidays"
                    value={stats.holidays.toString()}
                    icon={AlertCircle}
                    color="bg-amber-500/10 text-amber-500"
                    subtitle="Days with 0 meals"
                />
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-4 md:px-6 py-4 text-sm font-semibold">Date</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-semibold text-center">Lunch</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-semibold text-center">Dinner</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-semibold text-right hidden md:table-cell">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {days.map((day) => {
                                const lunch = getMealForDay(day, 'lunch');
                                const dinner = getMealForDay(day, 'dinner');
                                const isFuture = isAfter(day, new Date()) && !isSameDay(day, new Date());

                                return (
                                    <tr key={day.toString()} className={cn(
                                        "hover:bg-accent/30 transition-colors",
                                        isSameDay(day, new Date()) && "bg-primary/5"
                                    )}>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{format(day, 'do')}</span>
                                                <span className="text-xs text-muted-foreground">{format(day, 'EEEE')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-center">
                                            <Checkbox
                                                checked={!!lunch}
                                                disabled={isFuture}
                                                onChange={() => toggleMeal(day, 'lunch', lunch?.id)}
                                            />
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-center">
                                            <Checkbox
                                                checked={!!dinner}
                                                disabled={isFuture}
                                                onChange={() => toggleMeal(day, 'dinner', dinner?.id)}
                                            />
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right hidden md:table-cell text-sm">
                                            {(lunch && dinner) ? (
                                                <span className="text-emerald-500 flex items-center justify-end gap-1 font-medium">
                                                    <CheckCircle2 size={14} /> Full
                                                </span>
                                            ) : (lunch || dinner) ? (
                                                <span className="text-amber-500 flex items-center justify-end gap-1 font-medium">
                                                    <AlertCircle size={14} /> Partial
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground flex items-center justify-end gap-1 font-medium">
                                                    <XCircle size={14} /> Holiday
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Checkbox({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
        <button
            disabled={disabled}
            onClick={onChange}
            className={cn(
                "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center mx-auto disabled:opacity-30 disabled:cursor-not-allowed",
                checked
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
            )}
        >
            {checked && <CheckCircle2 size={16} />}
        </button>
    );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", color)}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground min-w-max">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold">{value}</h4>
                        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
