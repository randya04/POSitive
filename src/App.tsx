import './App.css';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import { AuthProvider } from '@/hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/login-form';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import SuperDashboard from '@/pages/super_admin';
import AdminDashboard from '@/pages/restaurant_admin';
import HostDashboard from '@/pages/host';
import Forbidden from '@/components/Forbidden';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/super_admin"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <SuperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant_admin"
            element={
              <ProtectedRoute allowedRoles={["restaurant_admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host"
            element={
              <ProtectedRoute allowedRoles={["host"]}>
                <HostDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
