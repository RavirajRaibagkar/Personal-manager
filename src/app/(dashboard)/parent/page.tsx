'use client';
import ParentDashboard from "../../../pages/ParentDashboard";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const { profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && profile && profile.role !== 'parent') {
            router.push('/');
        }
    }, [profile, loading, router]);

    if (loading || (profile && profile.role !== 'parent')) return null;

    return <ParentDashboard />;
}
