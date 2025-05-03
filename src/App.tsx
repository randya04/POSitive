import './App.css'
import { LoginForm } from '@/features/auth/LoginForm'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <LoginForm />
    </AuthProvider>
  )
}
