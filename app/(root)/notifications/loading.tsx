export default function NotificationsLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <section className="rounded-[32px] border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-7 w-56 rounded bg-muted" />
              <div className="h-4 w-72 rounded bg-muted" />
            </div>
          </div>
          <div className="h-9 w-28 rounded-2xl bg-muted" />
        </div>

        <div className="mt-6 h-10 w-full max-w-xs rounded-2xl bg-muted/40" />

        <div className="mt-5 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
