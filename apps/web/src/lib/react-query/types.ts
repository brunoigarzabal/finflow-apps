import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

export type QueryOptionsOverride<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>

export type MutationOptionsOverride<TData, TVariables, TError = Error> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationKey' | 'mutationFn'
>
