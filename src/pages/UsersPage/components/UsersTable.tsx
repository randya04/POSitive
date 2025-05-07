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
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, createColumnHelper, type ColumnDef, type SortingState, type ColumnFiltersState, type OnChangeFn } from '@tanstack/react-table'

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

interface UsersTableProps {
  users: User[];
  loading: boolean;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  onEdit: (user: User) => void;
  onToggleActive: (id: string, value: boolean) => void;
}

const columnHelper = createColumnHelper<User>()

export const UsersTable: React.FC<UsersTableProps> = ({ users, loading, sorting, setSorting, columnFilters, setColumnFilters, onEdit, onToggleActive }) => {
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
              onToggleActive(row.original.id, value)
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

  return (
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
  )
}
