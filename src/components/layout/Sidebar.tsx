import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    Utensils,
    CheckSquare,
    Calendar as CalendarIcon,
    LogOut,
    User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/meals', icon: Utensils, label: 'Meals' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/calendar', icon: CalendarIcon, label: 'Calendar' },
];

export function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
        if (onNavClick) onNavClick();
    };

    return (
        <aside className="w-64 bg-card border-r border-border h-full flex flex-col">
            <div className="p-6 hidden lg:block">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        <LayoutDashboard size={20} />
                    </div>
                    Persnl
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 lg:py-0 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onNavClick}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                        <User size={16} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
