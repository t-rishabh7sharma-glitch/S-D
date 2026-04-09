/** Pulse placeholder for loading states. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200/90 ${className}`} aria-hidden />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 snd-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-card">
            <Skeleton className="mb-4 h-4 w-24" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-card">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
