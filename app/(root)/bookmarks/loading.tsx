export default function BookmarksLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="rounded-[28px] border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-7 w-40 rounded bg-muted" />
              <div className="h-4 w-72 rounded bg-muted" />
            </div>
          </div>
          <div className="h-8 w-24 rounded-full bg-muted" />
        </div>
      </div>

      <div className="h-10 w-full max-w-md rounded-2xl bg-card" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-56 rounded-[24px] border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
