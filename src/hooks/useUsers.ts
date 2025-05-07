import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/users'
import type { User } from '@/types/user'

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}