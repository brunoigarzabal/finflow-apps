export const defineMutationKey = <T extends Record<string, readonly unknown[]>>(
  keys: T
): T => keys
