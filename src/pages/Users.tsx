import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/Layout'
import { PageContainer } from '@/components/PageContainer'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { UsersToolbar } from './UsersPage/components/UsersToolbar'
import { CreateUserForm } from './UsersPage/components/CreateUserForm'
import { UsersTable } from './UsersPage/components/UsersTable'
import { EditUserForm } from './UsersPage/components/EditUserForm'
import { Switch } from '@/components/ui/switch'
import {
  createColumnHelper,
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import { Maximize2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  is_active: boolean
  restaurant?: string | null
  branch_id?: string | null
}

const roleOptions = [
  { value: '', label: 'Todos' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'restaurant_admin', label: 'Admin' },
  { value: 'host', label: 'Host' },
];

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [open, setOpen] = useState(false)

  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleComboboxValue, setRoleComboboxValue] = useState<string>('');
  const [roleComboboxOpen, setRoleComboboxOpen] = useState(false);
  const [roleComboboxQuery, setRoleComboboxQuery] = useState('');
  const [statusComboboxValue, setStatusComboboxValue] = useState('');
  const [statusComboboxOpen, setStatusComboboxOpen] = useState(false);
  const [statusComboboxQuery, setStatusComboboxQuery] = useState('');
  const [restaurantComboboxValue, setRestaurantComboboxValue] = useState('');
  const [restaurantComboboxOpen, setRestaurantComboboxOpen] = useState(false);
  const [restaurantComboboxQuery, setRestaurantComboboxQuery] = useState('');
  const [restaurantOptions] = useState<{ id: string; name: string }[]>([]);

  // Limpia todos los filtros de la barra de usuarios
  const clearAllFilters = () => {
    setSearch('');
    setRoleComboboxValue('');
    setRoleComboboxOpen(false);
    setRoleComboboxQuery('');
    setStatusComboboxValue('');
    setStatusComboboxOpen(false);
    setStatusComboboxQuery('');
    setRestaurantComboboxValue('');
    setRestaurantComboboxOpen(false);
    setRestaurantComboboxQuery('');
  };
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/users`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error fetching users')
      setUsers(result.data)
    } catch (unknownError) {
      const errorMessage = unknownError instanceof Error ? unknownError.message : String(unknownError)
      console.error('fetchUsers error:', unknownError)
      toast.error(errorMessage)
    } finally {
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

  const columnHelper = createColumnHelper<User>()
  const columns: ColumnDef<User, any>[] = [
    columnHelper.display({
      id: 'details',
      header: () => null,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100"
          onClick={() => { setSelectedUser(row.original); setEditOpen(true); }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )
    }),
    columnHelper.accessor('full_name', {
      header: () => <span className="block text-left font-semibold">Nombre</span>,
      cell: info => <span className="block text-left">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', { header: 'Rol' }),
    columnHelper.accessor('restaurant', {
      header: 'Restaurante',
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('phone', {
      header: 'Teléfono',
      cell: ({ getValue }) => getValue() || '—',
    }),
    columnHelper.display({
      id: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Switch
          checked={row.original.role === 'super_admin' ? true : row.original.is_active}
          disabled={row.original.role === 'super_admin'}
          onCheckedChange={(value: boolean) => {
            if (row.original.role !== 'super_admin') {
              handleToggleActive(row.original.id, value)
            }
          }}
        />
      ),
    }),
  ]

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    if (roleComboboxValue) {
      table.getColumn('role')?.setFilterValue(roleComboboxValue);
    } else {
      table.getColumn('role')?.setFilterValue(undefined);
    }
  }, [roleComboboxValue]);

  const filteredUsers = users.filter((user) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(s) ||
      user.email?.toLowerCase().includes(s) ||
      user.role?.toLowerCase().includes(s) ||
      (user.restaurant || '').toLowerCase().includes(s) ||
      (user.phone || '').toLowerCase().includes(s)
    );
  });

  return (
    <Layout>
      <PageContainer>
        <div className="flex flex-col w-full max-w-7xl mx-auto mb-2 px-0">
          <h4 className="text-lg font-normal tracking-tight mb-2 text-left w-full">Users</h4>
          <div className="w-full">
            <UsersToolbar
  globalFilter={search}
  setGlobalFilter={setSearch}
  roleComboboxValue={roleComboboxValue}
  setRoleComboboxValue={setRoleComboboxValue}
  roleComboboxOpen={roleComboboxOpen}
  setRoleComboboxOpen={setRoleComboboxOpen}
  roleComboboxQuery={roleComboboxQuery}
  setRoleComboboxQuery={setRoleComboboxQuery}
  roleOptions={roleOptions}
  statusComboboxValue={statusComboboxValue}
  setStatusComboboxValue={setStatusComboboxValue}
  statusComboboxOpen={statusComboboxOpen}
  setStatusComboboxOpen={setStatusComboboxOpen}
  statusComboboxQuery={statusComboboxQuery}
  setStatusComboboxQuery={setStatusComboboxQuery}
  statusOptions={statusOptions}
  restaurantComboboxValue={restaurantComboboxValue}
  setRestaurantComboboxValue={setRestaurantComboboxValue}
  restaurantComboboxOpen={restaurantComboboxOpen}
  setRestaurantComboboxOpen={setRestaurantComboboxOpen}
  restaurantComboboxQuery={restaurantComboboxQuery}
  setRestaurantComboboxQuery={setRestaurantComboboxQuery}
  restaurantOptions={restaurantOptions}
  clearAllFilters={clearAllFilters}
/>
            <Button variant="default" onClick={() => setOpen(true)}>
              Crear usuario
            </Button>
            <CreateUserForm open={open} onClose={() => setOpen(false)} fetchUsers={fetchUsers} />
          </div>
        </div>
        <section className="bg-card border border-card rounded-xl overflow-hidden shadow-sm text-card-foreground">
          <UsersTable
            users={filteredUsers.map(u => ({ ...u, restaurant: u.restaurant ?? null }))}
            loading={loading}
            sorting={sorting}
            setSorting={setSorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            onEdit={(user) => {
              setSelectedUser(user);
              setEditOpen(true);
            }}
            onToggleActive={handleToggleActive}
          />
          {!loading && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted text-xs">
              <span>
                Mostrando {filteredUsers.length} de {users.length}
              </span>
              <div className="space-x-2">
              </div>
            </div>
          )}
        </section>
      </PageContainer>
      <Sheet open={editOpen} onOpenChange={(val: boolean) => { if (!val) setSelectedUser(null); setEditOpen(val); }}>
        <SheetContent side="right" className="max-w-lg">
          {selectedUser && (
            <EditUserForm user={selectedUser} onClose={() => setEditOpen(false)} fetchUsers={fetchUsers} />
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  )
}
