export function ArticleSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow">
      <div className="aspect-video skeleton-shimmer bg-muted" />
      <div className="p-6 space-y-4">
        <div className="h-5 w-20 skeleton-shimmer rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-6 skeleton-shimmer rounded bg-muted" />
          <div className="h-6 w-3/4 skeleton-shimmer rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 skeleton-shimmer rounded bg-muted" />
          <div className="h-4 skeleton-shimmer rounded bg-muted" />
          <div className="h-4 w-2/3 skeleton-shimmer rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-20 skeleton-shimmer rounded bg-muted" />
          <div className="h-4 w-24 skeleton-shimmer rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 flex-1 skeleton-shimmer rounded-md bg-muted" />
          <div className="h-9 w-24 skeleton-shimmer rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleSkeleton key={i} />
      ))}
    </div>
  );
}
