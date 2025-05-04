import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { PageContainer } from '@/components/PageContainer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
      <PageContainer>
        <Card>
          {loading ? (
            <div className="p-8 text-center">
              <p>Cargando...</p>
            </div>
          ) : (
            <>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{message}</p>
              </CardContent>
            </>
          )}
        </Card>
      </PageContainer>
    </Layout>
  );
}
