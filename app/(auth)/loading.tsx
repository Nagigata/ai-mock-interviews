export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-8"
        aria-hidden="true"
      >
        <div className="h-7 w-2/3 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/40" />
        <div className="mt-2 flex flex-col gap-3">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/50" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/50" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/50" />
        </div>
        <div className="mt-2 h-10 w-full animate-pulse rounded-md bg-muted/60" />
      </div>
    </div>
  );
}
