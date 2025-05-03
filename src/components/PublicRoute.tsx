import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading, role } = useAuth();

  // Mientras carga, no renderizar nada
  if (loading) return null;

  // Si ya está logueado, redirigir según rol
  if (user && role) {
    return <Navigate to={`/${role}`} replace />;
  }

  // Sino, mostrar children (ej. LoginForm)
  return <>{children}</>;
}
