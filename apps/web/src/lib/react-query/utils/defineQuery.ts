import { useQuery } from '@tanstack/react-query'

import type { QueryOptionsOverride } from '../types'

type QueryDefinition<TData> = {
  queryKey: readonly unknown[]
  queryFn: () => Promise<TData>
}

export const defineQuery =
  <TData>(definition: QueryDefinition<TData>) =>
  (options?: QueryOptionsOverride<TData>) =>
    useQuery({
      ...definition,
      ...options,
    })
