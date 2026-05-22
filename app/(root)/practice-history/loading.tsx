export default function PracticeHistoryLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="rounded-[28px] border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-muted" />
              <div className="h-4 w-80 rounded bg-muted" />
            </div>
          </div>
          <div className="h-8 w-32 rounded-full bg-muted" />
        </div>
      </div>

      <div className="h-10 w-full max-w-md rounded-2xl bg-card" />

      <div className="rounded-[24px] border border-border bg-card p-4">
        <div className="mb-4 h-5 w-48 rounded bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 rounded-xl bg-muted/40" />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[24px] border border-border bg-card px-5 py-4">
        <div className="h-9 w-24 rounded-2xl bg-muted" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="size-10 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-9 w-24 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
