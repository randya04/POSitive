import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Host Dashboard</h1>
      <p>Bienvenido, Host.</p>
    </div>
  );
}
