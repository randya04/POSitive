import React from 'react'
import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/toast'
import { Layout } from '@/components/Layout'
import { PageContainer } from '@/components/PageContainer'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { UsersToolbar } from './UsersPage/components/UsersToolbar'
import { CreateUserForm } from './UsersPage/components/CreateUserForm'
import { UsersTable } from './UsersPage/components/UsersTable'
import { EditUserForm } from './UsersPage/components/EditUserForm'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string
  full_name: string 
  email: string
  phone: string
  role: string
  is_active: boolean
  restaurant: string | null
  branch_id?: string | null
}

export default function Users() {
  console.log("=== INICIO RENDER Users ===");
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [toolbarFilters, setToolbarFilters] = useState({ search: '', role: '', status: '', restaurant: '' });

  // Log de depuración, después de los hooks
  // Log de depuración, después de los hooks
  console.log("Users render, users.length:", users.length, "loading:", loading);

  useEffect(() => {
    console.log("useEffect ejecutado");
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/users`)
      let result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error fetching users')
      // Normaliza restaurant para que nunca sea undefined
      let normalized = result;
      if (Array.isArray(result)) {
        normalized = result.map((u: any) => ({
          ...u,
          restaurant: u.restaurant === undefined ? null : u.restaurant
        }));
      }

      console.log("Fetched users:", normalized.data || normalized);
      setUsers(normalized.data || normalized)

    } catch (unknownError) {
      const errorMessage = unknownError instanceof Error ? unknownError.message : String(unknownError)
      console.error('fetchUsers error:', unknownError)
      toast.error(errorMessage)
    } finally {
      console.log("fetchUsers FINISHED");
      setLoading(false)
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: isActive }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error actualizando estado')
      toast.success(`Usuario ${isActive ? 'activado' : 'desactivado'}`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: isActive } : u))
    } catch (toggleError) {
      console.error('Error toggling user active state:', toggleError)
      const message = toggleError instanceof Error ? toggleError.message : String(toggleError)
      toast.error(message)
    }
  }

  const handleToolbarFilterChange = React.useCallback((filters: any) => {
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
            onEdit={(user) => {
              setSelectedUser(user);
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
