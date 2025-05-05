import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useDebounce } from '@/hooks/useDebounce'

export interface Restaurant {
  id: string
  name: string
}

export interface PredictiveOptions {
  debounceMs?: number
  limit?: number
  offset?: number
}

/**
 * Generic predictive search hook for any table/column.
 */
export function usePredictiveSearch<T>(
  supabaseClient: SupabaseClient,
  table: string,
  column: string,
  query: string,
  options: PredictiveOptions = {}
): UseQueryResult<T[], Error> {
  const { debounceMs = 300, limit = 10, offset = 0 } = options
  const debouncedQuery = useDebounce(query, debounceMs)

  return useQuery<T[], Error>({
    queryKey: ['predictive', table, column, debouncedQuery, offset, limit],
    queryFn: async (): Promise<T[]> => {
      console.log('usePredictiveSearch query:', { table, column, debouncedQuery, offset, limit })
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')
          .ilike(column, `%${debouncedQuery}%`)
          .range(offset, offset + limit - 1)
        if (error) throw error
        console.log('usePredictiveSearch data:', data)
        return (data ?? []) as T[]
      } catch (err) {
        console.error('usePredictiveSearch error:', err)
        // Friendly offline or fetch failure handling
        const isOffline = typeof window !== 'undefined' && !window.navigator.onLine
        const fetchError = err instanceof Error && err.message.includes('Failed to fetch')
        if (isOffline || fetchError) {
          throw new Error('No tienes conexión a internet')
        }
        throw err
      }
    },
    enabled: Boolean(debouncedQuery),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Restaurant-specific predictive search hook.
 */
export function useRestaurantSearch(
  supabaseClient: SupabaseClient,
  query: string,
  options?: Omit<PredictiveOptions, 'offset'>
): UseQueryResult<Restaurant[], Error> {
  return usePredictiveSearch<Restaurant>(
    supabaseClient,
    'restaurants',
    'name',
    query,
    options
  )
}
