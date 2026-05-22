export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="h-48 animate-pulse rounded-[34px] border border-border bg-muted/40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
          >
            <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted/60" />
            <div className="h-9 w-1/2 animate-pulse rounded-md bg-muted/50" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-md bg-muted/40" />
          </div>
        ))}
      </div>
      <div className="h-12 w-full animate-pulse rounded-2xl bg-muted/40" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
          >
            <div className="h-5 w-2/3 animate-pulse rounded-md bg-muted/60" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted/40" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted/40" />
            <div className="mt-2 h-9 w-24 animate-pulse rounded-md bg-muted/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
