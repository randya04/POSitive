import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Super Admin Dashboard</h1>
      <p>Bienvenido, Super Admin.</p>
    </div>
  );
}
