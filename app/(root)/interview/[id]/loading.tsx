export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-muted/60" />
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/40" />
      </div>
      <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-6">
        <div className="h-6 w-1/3 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted/40" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-44 animate-pulse rounded-2xl bg-muted/40" />
          <div className="h-44 animate-pulse rounded-2xl bg-muted/40" />
        </div>
        <div className="mt-4 h-12 w-40 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    </div>
  );
}
