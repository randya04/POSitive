import styles from './Dashboard.module.css';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Dashboard() {
  const { role, loading } = useAuth();

  let title = '';
  let message = '';
  switch (role) {
    case 'host':
      title = 'Host Dashboard';
      message = 'Bienvenido, Host.';
      break;
    case 'restaurant_admin':
      title = 'Restaurant Admin Dashboard';
      message = 'Bienvenido, Restaurant Admin.';
      break;
    case 'super_admin':
      title = 'Super Admin Dashboard';
      message = 'Bienvenido, Super Admin.';
      break;
    default:
      title = 'Dashboard';
      message = 'Bienvenido.';
  }

  return (
    <SidebarProvider>
      <div className={styles.container}>
        <AppSidebar />
        <div className={styles.main}>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <>
              <h1 className={styles.title}>{title}</h1>
              <p>{message}</p>
            </>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
