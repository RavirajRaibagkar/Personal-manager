import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import {
    Receipt,
    Utensils,
    CheckSquare,
    AlertCircle
} from 'lucide-react';

export function CalendarPage() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        fetchAllEvents();
    }, []);

    const fetchAllEvents = async () => {
        try {
            // Fetch Expenses
            const { data: expenses } = await supabase.from('expenses').select('*');
            // Fetch Meals
            const { data: meals } = await supabase.from('meals').select('*');
            // Fetch Tasks
            const { data: tasks } = await supabase.from('tasks').select('*');

            const formattedEvents = [
                ...(expenses?.map(e => ({
                    id: e.id,
                    title: `$${e.amount} - ${e.category}`,
                    start: e.date,
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    extendedProps: { type: 'expense', note: e.note }
                })) || []),
                ...(meals?.map(m => ({
                    id: m.id,
                    title: `Meal: ${m.meal_type}`,
                    start: m.timestamp,
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    extendedProps: { type: 'meal', note: m.notes }
                })) || []),
                ...(tasks?.map(t => ({
                    id: t.id,
                    title: t.title,
                    start: t.due_date,
                    backgroundColor: '#3b82f6',
                    borderColor: '#3b82f6',
                    extendedProps: { type: 'task', priority: t.priority }
                })) || [])
            ];

            setEvents(formattedEvents.filter(e => e.start));
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        }
    };

    const renderEventContent = (eventInfo: any) => {
        const type = eventInfo.event.extendedProps.type;
        return (
            <div className="flex items-center gap-1 p-1 overflow-hidden">
                {type === 'expense' && <Receipt size={12} />}
                {type === 'meal' && <Utensils size={12} />}
                {type === 'task' && <CheckSquare size={12} />}
                <span className="truncate text-[11px] font-medium leading-tight">
                    {eventInfo.event.title}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                    <p className="text-muted-foreground">Panoramic view of your activities.</p>
                </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                <style>{`
          .fc { --fc-border-color: hsl(var(--border)); --fc-button-bg-color: hsl(var(--primary)); --fc-button-border-color: hsl(var(--primary)); --fc-button-hover-bg-color: hsl(var(--primary) / 0.9); --fc-button-hover-border-color: hsl(var(--primary) / 0.9); --fc-button-active-bg-color: hsl(var(--primary)); --fc-button-active-border-color: hsl(var(--primary)); }
          .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 700; color: hsl(var(--foreground)); }
          .fc .fc-col-header-cell-cushion { font-size: 0.875rem; font-weight: 600; padding: 12px 0; color: hsl(var(--muted-foreground)); text-transform: uppercase; }
          .fc .fc-daygrid-day-number { font-size: 0.875rem; padding: 8px; color: hsl(var(--foreground)); }
          .fc .fc-event { border-radius: 6px; padding: 0; cursor: pointer; transition: opacity 0.2s; }
          .fc .fc-event:hover { opacity: 0.8; }
          .fc .fc-day-today { background: hsl(var(--primary) / 0.03) !important; }
        `}</style>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    eventContent={renderEventContent}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek'
                    }}
                    height="auto"
                    dayMaxEvents={3}
                />
            </div>

            <div className="flex gap-6 flex-wrap mt-4">
                <LegendItem label="Expenses" color="#ef4444" />
                <LegendItem label="Meals" color="#f59e0b" />
                <LegendItem label="Tasks" color="#3b82f6" />
            </div>
        </div>
    );
}

function LegendItem({ label, color }: { label: string; color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-sm text-muted-foreground font-medium">{label}</span>
        </div>
    );
}
