import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isBefore, subMinutes } from 'date-fns';

export function useTaskNotifications() {
    const { user } = useAuth();
    const intervalRef = useRef<number | null>(null);

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            console.warn("This browser does not support desktop notifications");
            return;
        }

        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            await Notification.requestPermission();
        }
    };

    const checkTasks = async () => {
        if (!user) return;

        try {
            const { data: tasks, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('status', 'todo')
                .eq('notified', false)
                .not('due_date', 'is', null);

            if (error) throw error;

            const now = new Date();

            for (const task of tasks || []) {
                const dueDate = new Date(task.due_date);
                const alertTime = subMinutes(dueDate, task.alert_before_minutes || 60);

                if (isBefore(alertTime, now)) {
                    // Send notification
                    if (Notification.permission === "granted") {
                        new Notification("Task Deadline Approaching!", {
                            body: `"${task.title}" is due in ${task.alert_before_minutes} minutes.`,
                            icon: '/vite.svg'
                        });
                    }

                    // Mark as notified in DB
                    await supabase
                        .from('tasks')
                        .update({ notified: true })
                        .eq('id', task.id);
                }
            }
        } catch (err) {
            console.error("Error checking tasks for notifications:", err);
        }
    };

    useEffect(() => {
        requestPermission();

        // Check every minute
        intervalRef.current = window.setInterval(checkTasks, 60000);
        // Also check immediately
        checkTasks();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user]);
}
