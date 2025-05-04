import './App.css';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import { AuthProvider } from '@/hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/login-form';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Forbidden from '@/components/Forbidden';
import Users from '@/pages/Users'; // Added import statement for Users page
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log("App.tsx useEffect runs");
  }, []);
  console.log("App.tsx body runs");
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["super_admin","restaurant_admin","host"]}>
                <Dashboard />
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
