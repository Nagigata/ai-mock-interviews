export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4">
        <div className="h-5 w-40 animate-pulse rounded-md bg-muted/60" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted/50" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-4 w-20 animate-pulse rounded-md bg-muted/40" />
        <div className="h-11 w-full animate-pulse rounded-md bg-muted/40" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted/40" />
        <div className="h-[480px] w-full animate-pulse rounded-md bg-muted/30" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-4 w-48 animate-pulse rounded-md bg-muted/40" />
        <div className="h-48 w-full animate-pulse rounded-md bg-muted/30" />
      </div>
    </div>
  );
}
