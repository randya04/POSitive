import styles from './Dashboard.module.css';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { role, loading } = useAuth();
  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando...</p>
      </div>
    );
  }

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
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p>{message}</p>
    </div>
  );
}
