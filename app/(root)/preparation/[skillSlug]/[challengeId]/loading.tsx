export default function Loading() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-card"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="size-8 animate-pulse rounded-md bg-muted/50" />
          <div className="flex flex-col gap-1">
            <div className="h-3 w-32 animate-pulse rounded-md bg-muted/40" />
            <div className="h-4 w-48 animate-pulse rounded-md bg-muted/60" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/40" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted/40" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/50" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-2/5 flex-col gap-3 border-r border-border p-6">
          <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/60" />
          <div className="h-4 w-full animate-pulse rounded-md bg-muted/40" />
          <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted/40" />
          <div className="h-4 w-4/6 animate-pulse rounded-md bg-muted/40" />
          <div className="mt-3 h-32 w-full animate-pulse rounded-lg bg-muted/30" />
          <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/40" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="flex w-3/5 flex-col gap-3 p-6">
          <div className="flex-1 animate-pulse rounded-lg bg-muted/30" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-2">
        <div className="h-3 w-48 animate-pulse rounded-md bg-muted/40" />
        <div className="h-3 w-32 animate-pulse rounded-md bg-muted/40" />
      </div>
    </div>
  );
}
