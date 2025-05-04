import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/Layout'

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

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Usuarios</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Rol</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-4 py-2">{u.email}</td>
                  <td className="border px-4 py-2">{u.role}</td>
                  <td className="border px-4 py-2">
                    <Button variant="destructive" onClick={() => handleDelete(u.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
