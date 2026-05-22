export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="h-5 w-40 animate-pulse rounded-md bg-muted/40" />
      <div className="h-44 animate-pulse rounded-[28px] border border-border bg-muted/40" />
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-6 w-12 animate-pulse rounded-lg bg-muted/60" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted/40" />
              <div className="h-4 w-32 animate-pulse rounded-md bg-muted/40" />
              <div className="h-4 w-20 animate-pulse rounded-md bg-muted/40" />
            </div>
            <div className="h-4 w-full animate-pulse rounded-md bg-muted/40" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
