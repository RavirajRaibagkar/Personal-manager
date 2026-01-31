'use client';

import { useAuth } from "../../context/AuthContext";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { MainLayout } from "../../components/layout/MainLayout";
import { useTaskNotifications } from "../../hooks/useTaskNotifications";

function ProtectedWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    useTaskNotifications();

    if (loading) return null;
    if (!user) return null;

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
