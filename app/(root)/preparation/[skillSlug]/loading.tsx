export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
        <div className="h-4 w-40 animate-pulse rounded-md bg-muted/40" />
        <div className="flex items-center gap-4">
          <div className="size-16 animate-pulse rounded-2xl bg-muted/50" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-7 w-1/2 animate-pulse rounded-md bg-muted/60" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/40" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-10 w-24 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-muted/40" />
        </div>
      </div>
      <div className="h-12 w-full animate-pulse rounded-xl bg-muted/40" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
          >
            <div className="h-5 w-1/3 animate-pulse rounded-md bg-muted/60" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted/40" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
