export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="h-48 animate-pulse rounded-[34px] border border-border bg-muted/40" />
      <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-6">
        <div className="h-6 w-2/5 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-3/5 animate-pulse rounded-md bg-muted/40" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
          <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
        </div>
        <div className="mt-4 h-12 w-40 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    </div>
  );
}
