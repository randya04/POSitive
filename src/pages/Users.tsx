import { useState, useCallback } from 'react'
import { Layout } from '@/components/Layout'
import { PageContainer } from '@/components/PageContainer'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { UsersToolbar } from './UsersPage/components/UsersToolbar'
import { CreateUserForm } from './UsersPage/components/CreateUserForm'
import { UsersTable } from './UsersPage/components/UsersTable'
import { EditUserForm } from './UsersPage/components/EditUserForm'
import { User } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';


export default function Users() {
  console.log("=== INICIO RENDER Users ===");
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [toolbarFilters, setToolbarFilters] = useState({ search: '', role: '', status: '', restaurant: '' });

  // Nuevo hook centralizado
  const { users, loading, fetchUsers, handleToggleActive } = useUsers();

  const handleToolbarFilterChange = useCallback((filters: any) => {
    setToolbarFilters(filters);
  }, []);

  console.log("Antes del return de Users");
  return (
    <Layout>
      <PageContainer>
        <div className="flex flex-col w-full max-w-7xl mx-auto mb-2 px-0">
          <h4 className="text-lg font-normal tracking-tight mb-2 text-left w-full">Users</h4>
          <div className="w-full">
            <UsersToolbar onFilterChange={handleToolbarFilterChange} onCreateUser={() => setIsCreateOpen(true)} />
            <CreateUserForm open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fetchUsers={fetchUsers} />
          </div>
        </div>
        <section className="bg-card border border-card rounded-xl overflow-hidden shadow-sm text-card-foreground">
          <UsersTable
            users={users}
            filters={toolbarFilters}
            loading={loading}
            onEdit={(user: User) => {
              // Ensure all required User fields are present
              setSelectedUser({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone ?? '',
                role: user.role,
                restaurant: user.restaurant ?? null,
                restaurant_id: user.restaurant_id ?? null,
                branch_id: user.branch_id ?? null, // opcional
                branch: user.branch ?? null,       // opcional
                branch_ids: user.branch_ids ?? [], // ¡clave para el nuevo modelo!
                is_active: user.is_active,
              });
              setEditOpen(true);
            }}
            onToggleActive={handleToggleActive}
          />
        </section>
      </PageContainer>
      {editOpen && selectedUser ? (
        <Sheet open={editOpen} onOpenChange={(val: boolean) => { if (!val) setSelectedUser(null); setEditOpen(val); }}>
          <SheetContent side="right" className="max-w-lg">
            <EditUserForm user={selectedUser} onClose={() => setEditOpen(false)} fetchUsers={fetchUsers} />
          </SheetContent>
        </Sheet>
      ) : null}
    </Layout>
  )
}
