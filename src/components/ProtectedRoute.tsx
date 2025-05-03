import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  // Mientras carga la sesión, renderizar children para que muestren su estado de carga
  if (loading) return <>{children}</>;
  // Si no hay usuario, redirige a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Si ya tenemos rol y no está permitido, redirige a forbidden
  if (role !== null && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
