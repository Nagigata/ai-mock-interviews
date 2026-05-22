export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-3" aria-hidden="true">
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-full animate-pulse rounded-md bg-muted/40" />
        <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted/40" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted/40" />
      </div>
    </div>
  );
}
