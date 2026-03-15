import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-muted-foreground text-sm">Verifying access…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Not logged in at all → send to regular login
        return <Navigate to="/login" replace />;
    }

    if (!user.isAdmin) {
        // Logged in but not an admin → send to home
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;
