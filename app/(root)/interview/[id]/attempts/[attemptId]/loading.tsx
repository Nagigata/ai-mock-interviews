export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-5 w-48 animate-pulse rounded-md bg-muted/40" />
      <div className="h-44 animate-pulse rounded-[28px] border border-border bg-muted/40" />
      <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-card p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div className="size-9 animate-pulse rounded-full bg-muted/50" />
            <div className="h-20 w-3/5 animate-pulse rounded-2xl bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
