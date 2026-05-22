export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
        <div className="h-7 w-56 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted/40" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/40" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
          >
            <div className="h-5 w-1/2 animate-pulse rounded-md bg-muted/60" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted/40" />
            <div className="mt-2 h-9 w-28 animate-pulse rounded-md bg-muted/50" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5"
          >
            <div className="h-5 w-2/3 animate-pulse rounded-md bg-muted/60" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
