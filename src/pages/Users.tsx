import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/Layout'
import {
  createColumnHelper,
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

interface User {
  id: string
  email: string
  role: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

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
        <Button variant="destructive" onClick={() => handleDelete(row.original.id)}>
          Eliminar
        </Button>
      ),
    },
  ]
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Usuarios</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableCaption>Listado de Usuarios</TableCaption>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  )
}
