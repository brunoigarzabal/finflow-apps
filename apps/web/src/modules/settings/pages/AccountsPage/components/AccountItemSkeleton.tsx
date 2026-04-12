import { Skeleton } from '@workspace/ui/components/skeleton'

export const AccountItemSkeleton = () => (
  <div className="flex items-center justify-between rounded-xl p-3">
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-4 w-16" />
  </div>
)
