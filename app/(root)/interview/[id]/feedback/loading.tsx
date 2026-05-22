export default function Loading() {
  return (
    <section className="mx-auto max-w-4xl space-y-8" aria-hidden="true">
      <div className="h-5 w-48 animate-pulse rounded-md bg-muted/40" />
      <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-7 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="h-9 w-72 animate-pulse rounded-md bg-muted/60" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="h-24 w-28 animate-pulse rounded-2xl bg-muted/40" />
      </div>
      <div className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </section>
  );
}
