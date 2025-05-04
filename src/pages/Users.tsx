import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/Layout'
import { PageContainer } from '@/components/PageContainer'
import { Input } from '@/components/ui/input'
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
import { MoreVertical, Eye, Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
  id: string
  email: string
  role: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
    if (error) {
      toast.error(error.message)
    } else {
      setUsers(data)
    }
    setLoading(false)
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

  const columnHelper = createColumnHelper<User>()
  const columns: ColumnDef<User, any>[] = [
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', { header: 'Rol' }),
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
          <Button variant="default">Crear usuario</Button>
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
                {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} seleccionados.
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
