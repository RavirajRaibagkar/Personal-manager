'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Plus,
    CheckCircle2,
    Circle,
    Clock,
    Trash2,
    AlertCircle,
    Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
    const auth = useAuth(); const user = auth?.user;
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        alert_before_minutes: 60
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setTasks(data);
        setLoading(false);
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const { error } = await supabase
            .from('tasks')
            .insert([{
                ...newTask,
                user_id: user.id,
                due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
                notified: false
            }]);

        if (!error) {
            setIsAdding(false);
            setNewTask({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                due_date: '',
                alert_before_minutes: 60
            });
            fetchTasks();
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
        const { error } = await supabase
            .from('tasks')
            .update({ status: nextStatus })
            .eq('id', id);

        if (!error) fetchTasks();
    };

    const deleteTask = async (id: string) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (!error) fetchTasks();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                    <p className="text-muted-foreground">Manage your daily to-dos and priorities.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={20} />
                    Add Task
                </button>
            </div>

            {isAdding && (
                <div className="bg-card p-6 rounded-2xl border border-border shadow-xl animate-in fade-in zoom-in duration-200">
                    <form onSubmit={addTask} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Task title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={newTask.due_date}
                                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Bell size={14} className="text-primary" />
                                    Alert Before (Minutes)
                                </label>
                                <select
                                    value={newTask.alert_before_minutes}
                                    onChange={e => setNewTask({ ...newTask, alert_before_minutes: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={60}>1 Hour</option>
                                    <option value={120}>2 Hours</option>
                                    <option value={1440}>1 Day</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    value={newTask.status}
                                    onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="todo">Todo</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]"
                                placeholder="Optional description..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-2.5 text-muted-foreground hover:bg-accent rounded-xl transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
                            >
                                Save Task
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-3 md:gap-4">
                {loading ? (
                    <div className="text-center p-12 text-muted-foreground">Loading...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center p-12 bg-card rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
                        No tasks yet. Start by adding one!
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group bg-card p-4 md:p-5 rounded-2xl border border-border shadow-sm hover:shadow-md active:bg-accent/30 transition-all flex items-start gap-3 md:gap-4"
                        >
                            <button
                                onClick={() => toggleStatus(task.id, task.status)}
                                className={cn(
                                    "mt-1 p-0.5 rounded-full transition-all shrink-0",
                                    task.status === 'done' ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                )}
                            >
                                {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className={cn(
                                        "font-bold text-base tracking-tight truncate",
                                        task.status === 'done' && "line-through text-muted-foreground font-medium"
                                    )}>
                                        {task.title}
                                    </h3>
                                    <span className={cn(
                                        "text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-tighter border",
                                        task.priority === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            task.priority === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    )}>
                                        {task.priority}
                                    </span>
                                </div>
                                {task.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-none mb-3">
                                        {task.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] md:text-xs text-muted-foreground font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-primary/70" />
                                        {task.due_date ? new Date(task.due_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'No deadline'}
                                    </div>
                                    <div className="flex items-center gap-1.5 capitalize">
                                        <AlertCircle size={14} className="text-primary/70" />
                                        {task.status.replace('-', ' ')}
                                    </div>
                                    {task.alert_before_minutes && (
                                        <div className="flex items-center gap-1.5 text-primary">
                                            <Bell size={14} />
                                            Alert {task.alert_before_minutes >= 60 ? `${task.alert_before_minutes / 60}h` : `${task.alert_before_minutes}m`} before
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="transition-opacity">
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive active:bg-destructive/10 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
