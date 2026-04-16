import { Skeleton } from '@workspace/ui/components/skeleton'

export const CategoryItemSkeleton = () => (
  <div className="flex items-center justify-between rounded-xl p-3">
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-8 w-24" />
  </div>
)
