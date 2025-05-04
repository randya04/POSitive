import styles from './Dashboard.module.css';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';

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
    <Layout>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <h1 className={styles.title}>{title}</h1>
          <p>{message}</p>
        </>
      )}
    </Layout>
  );
}
