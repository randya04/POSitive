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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Edit, Trash, ChevronLeft, ChevronRight, ChevronsUpDown, Check } from 'lucide-react'
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
  const [restaurantQuery, setRestaurantQuery] = useState('')
  const [restaurantPopoverOpen, setRestaurantPopoverOpen] = useState(false)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string|null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<string|null>(null)
  const [roleValue, setRoleValue] = useState<'Admin'|'Host'|'Super Admin'>('Host')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [phone, setPhone] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>(true)

  const { data: restaurantOptions = [] } = useRestaurantSearch(supabase, restaurantQuery)
  const filteredRestaurants = restaurantOptions.filter(r =>
    r.name.toLowerCase().includes(restaurantQuery.toLowerCase())
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

  async function handleDelete(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Usuario eliminado')
      fetchUsers()
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
        <Switch checked={row.original.is_active} onCheckedChange={(value: boolean) => handleToggleActive(row.original.id, value)} />
      ),
    }),
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreVertical className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row.original.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
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

  const handleSave = async () => {
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
      toast.success('Usuario creado')
      fetchUsers()
      setOpen(false)
      setName(''); setEmailValue(''); setRestaurantQuery(''); setSelectedRestaurantId(null); setSelectedBranchId(null); setPhone(''); setIsActive(true)
    } catch (err: any) {
      toast.error(err.message || 'Error creando usuario')
    }
  }

  return (
    <Layout>
      <PageContainer>
        {/* Title, search bar and create button */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold tracking-tight">Users</h1>
            <Input
              placeholder="Search email..."
              value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn('email')?.setFilterValue(e.target.value)}
              className="max-w-sm"
            />
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
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
              <SheetFooter>
                <Button variant="default" onClick={handleSave}>Guardar</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
                      className={`${header.column.id === 'actions' ? 'text-right' : ''} text-xs font-normal`}
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
                        <TableCell key={cidx} className={col.id === 'actions' ? 'text-right' : undefined}>
                          <Skeleton className={col.id === 'actions' ? 'h-5 w-8 ml-auto' : 'h-5 w-full'} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'text-right' : undefined}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
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
                Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length}
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
    </Layout>
  )
}
