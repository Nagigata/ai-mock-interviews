export default function ProfileLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="h-48 rounded-[32px] border border-border bg-card" />

      <div className="rounded-[32px] border border-border bg-card p-5 sm:p-7">
        <div className="mb-7 flex flex-col gap-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-8 w-72 rounded bg-muted" />
          <div className="h-4 w-full max-w-xl rounded bg-muted" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="h-48 rounded-[28px] border border-border bg-muted/40" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-[24px] border border-border bg-muted/40"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-border bg-card p-5 sm:p-7">
        <div className="mb-6 h-6 w-56 rounded bg-muted" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-[24px] border border-border bg-muted/40"
            />
          ))}
        </div>
      </div>

      <div className="h-40 rounded-[32px] border border-border bg-card" />
      <div className="h-72 rounded-[32px] border border-border bg-card" />
    </div>
  );
}
