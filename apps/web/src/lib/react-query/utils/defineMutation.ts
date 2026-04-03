import { useMutation } from '@tanstack/react-query'

import type { MutationOptionsOverride } from '../types'

type MutationDefinition<TData, TVariables> = {
  mutationKey: readonly unknown[]
  mutationFn: (variables: TVariables) => Promise<TData>
}

export const defineMutation =
  <TData, TVariables>(definition: MutationDefinition<TData, TVariables>) =>
  (options?: MutationOptionsOverride<TData, TVariables>) =>
    useMutation({
      ...definition,
      ...options,
    })
