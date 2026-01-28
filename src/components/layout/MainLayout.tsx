import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X, LayoutDashboard } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Sidebar - Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card transform transition-transform duration-300 ease-in-out lg:hidden",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar onNavClick={() => setIsSidebarOpen(false)} />
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-accent rounded-lg lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className="font-bold text-lg">Persnl</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-accent rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
