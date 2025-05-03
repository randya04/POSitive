import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  // Mientras se valida la sesión, no mostrar nada
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
