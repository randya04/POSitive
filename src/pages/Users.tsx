import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/Layout'
import { PageContainer } from '@/components/PageContainer'
import { Input } from '@/components/ui/input'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, ChevronsUpDown, Check, Loader2, Maximize2, Funnel } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string
  full_name: string
  email: string
  role: string
  restaurant: string | null
  branch_id?: string | null
  phone: string
  is_active: boolean
}

interface Branch {
  id: string
  name: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [restaurantQuery, setRestaurantQuery] = useState(' ')
  const [restaurantPopoverOpen, setRestaurantPopoverOpen] = useState(false)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string|null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<string|null>(null)
  const [roleValue, setRoleValue] = useState<'Admin'|'Host'|'Super Admin'>('Host')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [phone, setPhone] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleComboboxValue, setRoleComboboxValue] = useState<string>('');
  const [roleComboboxOpen, setRoleComboboxOpen] = useState(false);
  const [roleComboboxQuery, setRoleComboboxQuery] = useState('');
  const [statusComboboxOpen, setStatusComboboxOpen] = useState(false);
  const [statusComboboxQuery, setStatusComboboxQuery] = useState('');
  const [statusComboboxValue, setStatusComboboxValue] = useState('');
  const [restaurantComboboxOpen, setRestaurantComboboxOpen] = useState(false);
  const [restaurantComboboxQuery, setRestaurantComboboxQuery] = useState('');
  const [restaurantComboboxValue, setRestaurantComboboxValue] = useState('');
  const [search, setSearch] = useState('');
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

  const { data: restaurantOptions = [] } = useRestaurantSearch(supabase, restaurantQuery)
  const filteredRestaurants = restaurantOptions.filter(r =>
    restaurantQuery.trim() === '' ? true : r.name.toLowerCase().includes(restaurantQuery.toLowerCase())
  )

  const { data: branchOptions = [], isLoading: isBranchLoading, error: branchError } = useQuery<Branch[], Error>({
    queryKey: ['branches', selectedRestaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('restaurant_id', selectedRestaurantId!)
        .order('name')
      if (error) throw error
      return data ?? []
    },
    enabled: Boolean(selectedRestaurantId),
  })

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
      console.log('Fetched users:', result.data)
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
      // Update local state to avoid full table refresh
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: isActive } : u))
    } catch (toggleError) {
      console.error('Error toggling user active state:', toggleError)
      const message = toggleError instanceof Error ? toggleError.message : String(toggleError)
      toast.error(message)
    }
  }

  const columnHelper = createColumnHelper<User>()
  const columns: ColumnDef<User, any>[] = [
    // Details toggle column using Shadcn icon button
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
      ),
    }),
    columnHelper.accessor('full_name', { header: 'Nombre' }),
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

  // Cuando cambia el valor del combobox de rol en el filtro, aplica el filtro a la tabla
  useEffect(() => {
    if (roleComboboxValue) {
      table.getColumn('role')?.setFilterValue(roleComboboxValue);
    } else {
      table.getColumn('role')?.setFilterValue(undefined);
    }
  }, [roleComboboxValue]);

  useEffect(() => {
    if (statusComboboxValue !== '') {
      table.getColumn('is_active')?.setFilterValue(statusComboboxValue === 'true');
    } else {
      table.getColumn('is_active')?.setFilterValue(undefined);
    }
  }, [statusComboboxValue]);

  useEffect(() => {
    if (restaurantComboboxValue !== '') {
      table.getColumn('restaurant')?.setFilterValue(restaurantComboboxValue);
    } else {
      table.getColumn('restaurant')?.setFilterValue(undefined);
    }
  }, [restaurantComboboxValue]);

  // Limpieza de filtros
  function clearAllFilters() {
    setRoleComboboxValue('');
    setStatusComboboxValue('');
    setRestaurantComboboxValue('');
    setRoleComboboxQuery('');
    setStatusComboboxQuery('');
    setRestaurantComboboxQuery('');
  }

  function clearRoleFilter() {
    setRoleComboboxValue('');
    setRoleComboboxQuery('');
  }
  function clearStatusFilter() {
    setStatusComboboxValue('');
    setStatusComboboxQuery('');
  }
  function clearRestaurantFilter() {
    setRestaurantComboboxValue('');
    setRestaurantComboboxQuery('');
  }

  async function handleSave() {
    const newErrors: Record<string,string> = {}
    if (!name.trim()) newErrors.name = 'Nombre es requerido'
    if (!emailValue.trim()) newErrors.email = 'Email es requerido'
    if (!phone.trim()) newErrors.phone = 'Teléfono es requerido'
    if (!roleValue) newErrors.role = 'Rol es requerido'
    if (roleValue !== 'Super Admin') {
      if (!selectedRestaurantId) newErrors.restaurant = 'Restaurante es requerido'
      if (!selectedBranchId) newErrors.branch = 'Sucursal es requerida'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return
    setIsSaving(true)
    try {
      const roleMap = {
        'Super Admin': 'super_admin',
        'Admin': 'restaurant_admin',
        'Host': 'host',
      };
      const response = await fetch(`${API_URL}/api/inviteUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          email: emailValue,
          role: roleMap[roleValue] || roleValue,
          phone,
          is_active: isActive,
          restaurant_id: selectedRestaurantId,
          branch_id: selectedBranchId
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error creando usuario')
      // Show message based on creation or update
      if (result.data?.updated) {
        toast.success('Usuario actualizado')
      } else {
        toast.success('Usuario creado exitosamente')
      }
      fetchUsers()
      setOpen(false)
      setName(''); setEmailValue(''); setRestaurantQuery(' '); setSelectedRestaurantId(null); setSelectedBranchId(null); setPhone(''); setIsActive(true)
    } catch (err: any) {
      toast.error(err.message || 'Error creando usuario')
    } finally {
      setIsSaving(false)
    }
  }

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
            <div className="flex flex-row items-center w-full justify-between gap-4 overflow-x-auto">
              <div className="flex flex-row flex-wrap items-center gap-2 flex-1 min-w-0">
                <Input
                  placeholder="Buscar usuario, email, rol, restaurante o teléfono..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Funnel className="h-4 w-4" />
                      Filtrar
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" sideOffset={8} className="min-w-[220px] w-64 p-4">
                    <div className="grid gap-2">
                      <Label>Rol</Label>
                      <Popover open={roleComboboxOpen} onOpenChange={setRoleComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => setRoleComboboxOpen(true)}
                          >
                            {roleComboboxValue
                              ? roleOptions.find((r) => r.value === roleComboboxValue)?.label
                              : 'Seleccionar rol...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full p-0 mt-1">
                          <Command className="w-full">
                            <CommandInput
                              value={roleComboboxQuery}
                              onValueChange={setRoleComboboxQuery}
                              placeholder="Buscar rol..."
                            />
                            <CommandList className="text-left">
                              <CommandEmpty>No hay roles.</CommandEmpty>
                              <CommandGroup heading="Roles">
                                {roleOptions
                                  .filter((r) => r.label.toLowerCase().includes(roleComboboxQuery.toLowerCase()))
                                  .map((r) => (
                                    <CommandItem
                                      key={r.value}
                                      value={r.label}
                                      onSelect={() => {
                                        setRoleComboboxValue(r.value)
                                        setRoleComboboxOpen(false)
                                      }}
                                    >
                                      {r.label}
                                      <Check className={cn('ml-auto h-4 w-4', roleComboboxValue === r.value ? 'opacity-100' : 'opacity-0')} />
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Label>Estado</Label>
                      <Popover open={statusComboboxOpen} onOpenChange={setStatusComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => setStatusComboboxOpen(true)}
                          >
                            {statusComboboxValue
                              ? statusOptions.find((s) => s.value === statusComboboxValue)?.label
                              : 'Seleccionar estado...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full p-0 mt-1">
                          <Command className="w-full">
                            <CommandInput
                              value={statusComboboxQuery}
                              onValueChange={setStatusComboboxQuery}
                              placeholder="Buscar estado..."
                            />
                            <CommandList className="text-left">
                              <CommandEmpty>No hay estados.</CommandEmpty>
                              <CommandGroup heading="Estados">
                                {statusOptions
                                  .filter((s) => s.label.toLowerCase().includes(statusComboboxQuery.toLowerCase()))
                                  .map((s) => (
                                    <CommandItem
                                      key={s.value}
                                      value={s.label}
                                      onSelect={() => {
                                        setStatusComboboxValue(s.value)
                                        setStatusComboboxOpen(false)
                                      }}
                                    >
                                      {s.label}
                                      <Check className={cn('ml-auto h-4 w-4', statusComboboxValue === s.value ? 'opacity-100' : 'opacity-0')} />
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Label>Restaurante</Label>
                      <Popover open={restaurantComboboxOpen} onOpenChange={setRestaurantComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => setRestaurantComboboxOpen(true)}
                          >
                            {restaurantComboboxValue
                              ? restaurantOptions.find((r) => r.id === restaurantComboboxValue)?.name
                              : 'Seleccionar restaurante...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full p-0 mt-1">
                          <Command className="w-full">
                            <CommandInput
                              value={restaurantComboboxQuery}
                              onValueChange={setRestaurantComboboxQuery}
                              placeholder="Buscar restaurante..."
                            />
                            <CommandList className="text-left">
                              <CommandEmpty>No hay restaurantes.</CommandEmpty>
                              <CommandGroup heading="Restaurantes">
                                <CommandItem
                                  key=""
                                  value="Todos"
                                  onSelect={() => {
                                    setRestaurantComboboxValue('');
                                    setRestaurantComboboxOpen(false);
                                  }}
                                >
                                  Todos
                                  <Check className={cn('ml-auto h-4 w-4', restaurantComboboxValue === '' ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                                {filteredRestaurants
                                  .filter((r) => r.name.toLowerCase().includes(restaurantComboboxQuery.toLowerCase()))
                                  .map((r) => (
                                    <CommandItem
                                      key={r.id}
                                      value={r.name}
                                      onSelect={() => {
                                        setRestaurantComboboxValue(r.id);
                                        setRestaurantComboboxOpen(false);
                                      }}
                                    >
                                      {r.name}
                                      <Check className={cn('ml-auto h-4 w-4', restaurantComboboxValue === r.id ? 'opacity-100' : 'opacity-0')} />
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {/* Botón limpiar filtros */}
                    <div className="flex justify-end pt-2">
                      <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-2">
                        <span>Limpiar filtros</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {(roleComboboxValue || statusComboboxValue || restaurantComboboxValue) && (
                  <div className="flex flex-row flex-wrap gap-2">
                    {roleComboboxValue && (
                      <span className="inline-flex items-center rounded-full bg-muted/80 px-2 py-0.5 text-xs font-normal text-muted-foreground border border-muted-foreground/10">
                        Rol: {roleOptions.find((r) => r.value === roleComboboxValue)?.label}
                        <button onClick={clearRoleFilter} className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none text-sm">
                          ×
                        </button>
                      </span>
                    )}
                    {statusComboboxValue && (
                      <span className="inline-flex items-center rounded-full bg-muted/80 px-2 py-0.5 text-xs font-normal text-muted-foreground border border-muted-foreground/10">
                        Estado: {statusOptions.find(s => s.value === statusComboboxValue)?.label}
                        <button onClick={clearStatusFilter} className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none text-sm">
                          ×
                        </button>
                      </span>
                    )}
                    {restaurantComboboxValue && (
                      <span className="inline-flex items-center rounded-full bg-muted/80 px-2 py-0.5 text-xs font-normal text-muted-foreground border border-muted-foreground/10">
                        Restaurante: {restaurantOptions.find(r => r.id === restaurantComboboxValue)?.name}
                        <button onClick={clearRestaurantFilter} className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none text-sm">
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="default">Crear usuario</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[350px]">
                  <SheetHeader>
                    <SheetTitle>Crear usuario</SheetTitle>
                    <SheetDescription>Introduce los datos del usuario</SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" />
                      {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)} placeholder="usuario@ejemplo.com" />
                      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" />
                      {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select value={roleValue} onValueChange={value => setRoleValue(value as 'Admin'|'Host'|'Super Admin')}>
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Host">Host</SelectItem>
                          <SelectItem value="Super Admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && <p className="text-red-600 text-sm">{errors.role}</p>}
                    </div>
                    {(roleValue === 'Admin' || roleValue === 'Host') && (
                      <>
                      <div className="grid gap-2">
                        <Label htmlFor="restaurant">Restaurante</Label>
                        <Popover open={restaurantPopoverOpen} onOpenChange={setRestaurantPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={restaurantPopoverOpen}
                              className="w-full justify-between"
                            >
                              {selectedRestaurantId
                                ? restaurantOptions.find(r => r.id === selectedRestaurantId)?.name
                                : 'Seleccionar restaurante...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-full sm:w-[350px] p-0 mt-1"
                          >
                            <Command className="w-full min-w-0">
                              <CommandInput
                                value={restaurantQuery}
                                onValueChange={(value: string) => setRestaurantQuery(value)}
                                placeholder="Buscar restaurante..."
                              />
                              <CommandList className="text-left">
                                <CommandEmpty>No restaurant found.</CommandEmpty>
                                <CommandGroup>
                                  {filteredRestaurants.slice(0, 5).map(r => (
                                    <CommandItem
                                      key={r.id}
                                      value={r.name}
                                      onSelect={(currentValue: string) => {
                                        const sel = restaurantOptions.find(x => x.name === currentValue)
                                        const newId = sel?.id ?? null
                                        setSelectedRestaurantId(newId === selectedRestaurantId ? null : newId)
                                        setRestaurantQuery(sel?.name ?? '')
                                        setRestaurantPopoverOpen(false)
                                      }}
                                    >
                                      {r.name}
                                      <Check
                                        className={cn(
                                          'ml-auto h-4 w-4',
                                          selectedRestaurantId === r.id ? 'opacity-100' : 'opacity-0'
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {errors.restaurant && <p className="text-red-600 text-sm">{errors.restaurant}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="branch">Sucursal</Label>
                        <Select value={selectedBranchId ?? ''} onValueChange={value => setSelectedBranchId(value)} disabled={isBranchLoading || !selectedRestaurantId}>
                          <SelectTrigger id="branch" className="w-full"><SelectValue placeholder={isBranchLoading ? 'Cargando...' : 'Selecciona sucursal'} /></SelectTrigger>
                          <SelectContent>
                            {branchOptions.map((br: Branch) => <SelectItem key={br.id} value={br.id}>{br.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {branchError && <p className="text-red-600 text-sm">{branchError.message}</p>}
                        {errors.branch && <p className="text-red-600 text-sm">{errors.branch}</p>}
                      </div>
                      </>
                    )}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="isActive">Estado</Label>
                      <Switch
                        id="isActive"
                        checked={roleValue === 'Super Admin' ? true : isActive}
                        disabled={roleValue === 'Super Admin'}
                        onCheckedChange={(value: boolean) => {
                          if (roleValue !== 'Super Admin') {
                            setIsActive(value)
                          }
                        }}
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <Button variant="default" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar'
                      )}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        {/* Table section */}
        <section className="bg-card border border-card rounded-xl overflow-hidden shadow-sm text-card-foreground">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`${header.column.id === 'details' ? 'pl-2 pr-0' : ''} text-xs font-normal`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {columns.map((col, cidx) => (
                        <TableCell key={cidx} className={col.id === 'details' ? 'pl-2 pr-0' : undefined}>
                          <Skeleton className={col.id === 'details' ? 'h-5 w-8 ml-auto' : 'h-5 w-full'} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : filteredUsers.length > 0 ? (
                    filteredUsers.map((user, idx) => {
                      // Crea una row virtual para flexRender, usando los helpers de la tabla
                      const row = table.getRowModel().rows.find(r => r.original.id === user.id);
                      if (!row) return null;
                      return (
                        <TableRow key={row.id} className="group">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className={cell.column.id === 'details' ? 'pl-2 pr-0' : cell.column.id === 'full_name' ? 'pl-0' : undefined}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                        No hay resultados.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
          {!loading && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted text-xs">
              <span>
                Mostrando {filteredUsers.length} de {users.length}
              </span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </PageContainer>
      {/* Edit User Sheet */}
      <Sheet open={editOpen} onOpenChange={(val) => { if (!val) setSelectedUser(null); setEditOpen(val); }}>
        <SheetContent side="right" className="w-[350px]">
          <SheetHeader>
            <SheetTitle>Editar usuario</SheetTitle>
            <SheetDescription>Actualiza los datos del usuario</SheetDescription>
          </SheetHeader>
          {selectedUser && (
            <EditUserForm user={selectedUser} onClose={() => setEditOpen(false)} fetchUsers={fetchUsers} />
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  )
}

type EditUserFormProps = { user: User, onClose: () => void, fetchUsers: () => void }
function EditUserForm({ user, onClose, fetchUsers }: EditUserFormProps) {
  type RoleLabel = 'Super Admin' | 'Admin' | 'Host';
  const [name, setName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [role, setRole] = useState<RoleLabel>(user.role === 'super_admin' ? 'Super Admin' : user.role === 'restaurant_admin' ? 'Admin' : 'Host')
  const [isActive, setIsActive] = useState(user.is_active)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})

  const [restaurantQuery, setRestaurantQuery] = useState('')
  const [restaurantPopoverOpen, setRestaurantPopoverOpen] = useState(false)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string|null>(user.restaurant ?? null)
  const [selectedBranchId, setSelectedBranchId] = useState<string|null>(user.branch_id ?? null)
  const [branchOptions, setBranchOptions] = useState<Branch[]>([])
  const [restaurantOptions, setRestaurantOptions] = useState<{id: string, name: string}[]>([])
  const [isBranchLoading, setIsBranchLoading] = useState(false)
  const [branchError, setBranchError] = useState<any>(null)

  useEffect(() => {
    async function fetchRestaurants() {
      const { data, error } = await supabase.from('restaurants').select('id, name').order('name')
      if (!error) setRestaurantOptions(data || [])
    }
    fetchRestaurants()
  }, [])

  useEffect(() => {
    if (!selectedRestaurantId) { setBranchOptions([]); setSelectedBranchId(null); return }
    setIsBranchLoading(true)
    supabase.from('branches').select('id, name').eq('restaurant_id', selectedRestaurantId).order('name')
      .then(({ data, error }) => {
        setBranchOptions(data || [])
        setIsBranchLoading(false)
        setBranchError(error)
      })
  }, [selectedRestaurantId])

  const handleUpdate = async () => {
    const newErrors: Record<string,string> = {}
    if (!name.trim()) newErrors.name = 'Nombre es requerido'
    if (!email.trim()) newErrors.email = 'Email es requerido'
    if (!phone.trim()) newErrors.phone = 'Teléfono es requerido'
    if (!role) newErrors.role = 'Rol es requerido'
    if (role !== 'Super Admin') {
      if (!selectedRestaurantId) newErrors.restaurant = 'Restaurante es requerido'
      if (!selectedBranchId) newErrors.branch = 'Sucursal es requerida'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return
    setLoading(true)
    try {
      const roleMap: Record<RoleLabel, string> = { 'Super Admin': 'super_admin', 'Admin': 'restaurant_admin', 'Host': 'host' };
      const body: any = {
        id: user.id,
        full_name: name,
        email,
        phone,
        role: roleMap[role],
        is_active: isActive,
      }
      if (role !== 'Super Admin') {
        body.restaurant_id = selectedRestaurantId
        body.branch_id = selectedBranchId
      }
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error actualizando usuario')
      toast.success('Usuario actualizado')
      fetchUsers()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Error actualizando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-name">Nombre completo</Label>
        <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@ejemplo.com" />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-phone">Teléfono</Label>
        <Input id="edit-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" />
        {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-role">Rol</Label>
        <Select value={role} onValueChange={value => setRole(value as RoleLabel)}>
          <SelectTrigger id="edit-role" className="w-full">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Host">Host</SelectItem>
            <SelectItem value="Super Admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-red-600 text-sm">{errors.role}</p>}
      </div>
      {(role === 'Admin' || role === 'Host') && (
        <>
        <div className="grid gap-2">
          <Label htmlFor="edit-restaurant">Restaurante</Label>
          <Popover open={restaurantPopoverOpen} onOpenChange={setRestaurantPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={restaurantPopoverOpen}
                className="w-full justify-between"
              >
                {selectedRestaurantId
                  ? restaurantOptions.find(r => r.id === selectedRestaurantId)?.name
                  : 'Seleccionar restaurante...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full sm:w-[350px] p-0 mt-1">
              <Command className="w-full min-w-0">
                <CommandInput
                  value={restaurantQuery}
                  onValueChange={(value: string) => setRestaurantQuery(value)}
                  placeholder="Buscar restaurante..."
                />
                <CommandList className="text-left">
                  <CommandEmpty>No restaurant found.</CommandEmpty>
                  <CommandGroup>
                    {restaurantOptions.filter(r => r.name.toLowerCase().includes(restaurantQuery.toLowerCase())).slice(0, 5).map(r => (
                      <CommandItem
                        key={r.id}
                        value={r.name}
                        onSelect={(currentValue: string) => {
                          const sel = restaurantOptions.find(x => x.name === currentValue)
                          const newId = sel?.id ?? null
                          setSelectedRestaurantId(newId === selectedRestaurantId ? null : newId)
                          setRestaurantQuery(sel?.name ?? '')
                          setRestaurantPopoverOpen(false)
                        }}
                      >
                        {r.name}
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            selectedRestaurantId === r.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.restaurant && <p className="text-red-600 text-sm">{errors.restaurant}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-branch">Sucursal</Label>
          <Select value={selectedBranchId ?? ''} onValueChange={value => setSelectedBranchId(value)} disabled={isBranchLoading || !selectedRestaurantId}>
            <SelectTrigger id="edit-branch" className="w-full"><SelectValue placeholder={isBranchLoading ? 'Cargando...' : 'Selecciona sucursal'} /></SelectTrigger>
            <SelectContent>
              {branchOptions.map((br: Branch) => <SelectItem key={br.id} value={br.id}>{br.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {branchError && <p className="text-red-600 text-sm">{branchError.message}</p>}
          {errors.branch && <p className="text-red-600 text-sm">{errors.branch}</p>}
        </div>
        </>
      )}
      <div className="flex items-center gap-2">
        <Label htmlFor="edit-isActive">Estado</Label>
        <Switch id="edit-isActive" checked={role === 'Super Admin' ? true : isActive} disabled={role === 'Super Admin'} onCheckedChange={value => { if (role !== 'Super Admin') setIsActive(value) }} />
      </div>
      <SheetFooter>
        <Button variant="default" onClick={handleUpdate} disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Button>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
      </SheetFooter>
    </div>
  )
}
