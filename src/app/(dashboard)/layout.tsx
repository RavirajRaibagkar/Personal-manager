'use client';

import { useAuth } from "../../context/AuthContext";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { MainLayout } from "../../components/layout/MainLayout";
import { useTaskNotifications } from "../../hooks/useTaskNotifications";

import { usePathname } from "next/navigation";

function ProtectedWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    useTaskNotifications();

    if (loading) return null;
    if (!user) return null;

    // Use a custom standalone layout for the Parent Portal
    if (pathname.startsWith('/parent')) {
        return (
            <div className="min-h-screen bg-[#020617]">
                {children}
            </div>
        );
    }

    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <ProtectedWrapper>{children}</ProtectedWrapper>
        </ProtectedRoute>
    );
}
