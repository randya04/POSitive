import React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Maximize2, ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'

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

interface Filters {
  search?: string;
  role?: string;
  status?: string;
  restaurant?: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  filters?: Filters;
  onEdit: (user: User) => void;
  onToggleActive: (id: string, value: boolean) => void;
}

const columnHelper = createColumnHelper<User>()

export const UsersTable: React.FC<UsersTableProps> = ({ users, loading, filters, onEdit, onToggleActive }) => {

  // Estado de ordenamiento
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Filtrado interno
  const filteredUsers = React.useMemo(() => {
    if (!filters) return users;
    return users.filter((user) => {
      // Search
      if (filters.search && filters.search.trim()) {
        const s = filters.search.toLowerCase();
        if (!(
          user.full_name?.toLowerCase().includes(s) ||
          user.email?.toLowerCase().includes(s) ||
          user.role?.toLowerCase().includes(s) ||
          (user.restaurant || '').toLowerCase().includes(s) ||
          (user.phone || '').toLowerCase().includes(s)
        )) {
          return false;
        }
      }
      // Role
      if (filters.role && filters.role !== '' && user.role !== filters.role) {
        return false;
      }
      // Status
      if (filters.status === 'true' && !user.is_active) {
        return false;
      }
      if (filters.status === 'false' && user.is_active) {
        return false;
      }
      // Restaurant
      if (filters.restaurant && filters.restaurant !== '' && user.restaurant !== filters.restaurant) {
        return false;
      }
      return true;
    });
  }, [users, filters]);

  const columns: ColumnDef<User, any>[] = [
    columnHelper.display({
      id: 'details',
      header: () => null,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100"
          onClick={() => onEdit(row.original)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )
    }),
    columnHelper.accessor('full_name', {
      header: ({ column }) => (
        <div
          className="flex items-center w-full h-full cursor-pointer select-none px-1"
          role="button"
          tabIndex={0}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') column.toggleSorting(column.getIsSorted() === 'asc') }}
        >
          <span className="font-semibold">Nombre</span>
          <ArrowDownUp
            className={
              `ml-1 h-4 w-4 transition-opacity ${column.getIsSorted() ? 'text-primary opacity-100' : 'opacity-40'}`
            }
            strokeWidth={2.2}
          />
        </div>
      ),
      cell: info => <span className="block text-left">{info.getValue()}</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', {
      header: ({ column }) => (
        <div
          className="flex items-center w-full h-full cursor-pointer select-none px-1"
          role="button"
          tabIndex={0}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') column.toggleSorting(column.getIsSorted() === 'asc') }}
        >
          <span className="font-semibold">Rol</span>
          <ArrowDownUp
            className={
              `ml-1 h-4 w-4 transition-opacity ${column.getIsSorted() ? 'text-primary opacity-100' : 'opacity-40'}`
            }
            strokeWidth={2.2}
          />
        </div>
      ),
      cell: ({ getValue }) => {
        const val = getValue();
        if (val === 'super_admin') return 'Super Admin';
        if (val === 'restaurant_admin') return 'Admin';
        if (val === 'host') return 'Host';
        return val || '—';
      },
      enableSorting: true,
    }),
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
              onToggleActive(row.original.id, value)
            }
          }}
        />
      ),
    }),
  ]

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
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
            ? Array.from({ length: 5 }).map((_, idx: number) => (
                <TableRow key={idx}>
                  {columns.map((col, cidx: number) => (
                    <TableCell key={cidx} className={col.id === 'details' ? 'pl-2 pr-0' : undefined}>
                      <Skeleton className={col.id === 'details' ? 'h-5 w-8 ml-auto' : 'h-5 w-full'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="group">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cell.column.id === 'details' ? 'pl-2 pr-0' : cell.column.id === 'full_name' ? 'pl-0' : undefined}>
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
      {/* Etiqueta y botones de paginación alineados */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-muted text-xs">
        <span className="font-semibold">
          Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length}
        </span>
        <div className="flex items-center space-x-2">
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
    </>
  )
}
