const skeletonCards = ["Users", "Interviews", "Challenges", "Skills"];
const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(202,197,254,0.14),transparent_34%),linear-gradient(135deg,rgba(24,27,34,0.9),rgba(11,13,18,0.95))] p-6">
        <div className="flex animate-pulse flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-36 rounded-full bg-white/10" />
            <div className="h-8 w-72 max-w-full rounded-xl bg-white/10" />
            <div className="h-4 w-[440px] max-w-full rounded-full bg-white/8" />
            <div className="flex gap-2 pt-1">
              <div className="h-7 w-28 rounded-full bg-primary-200/10" />
              <div className="h-7 w-24 rounded-full bg-primary-200/10" />
            </div>
          </div>
          <div className="h-10 w-36 rounded-xl bg-white/10" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {skeletonCards.map((card) => (
          <div
            key={card}
            className="h-28 animate-pulse rounded-2xl border border-white/5 bg-dark-200/50 p-5"
          >
            <div className="h-3 w-20 rounded-full bg-white/10" />
            <div className="mt-5 h-7 w-24 rounded-xl bg-white/10" />
            <div className="mt-3 h-3 w-32 rounded-full bg-white/8" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-dark-200/50">
        <div className="border-b border-white/5 px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="divide-y divide-white/5">
          {skeletonRows.map((row) => (
            <div
              key={row}
              className="grid animate-pulse grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-5 px-5 py-4"
            >
              <div className="h-4 rounded-full bg-white/10" />
              <div className="h-4 rounded-full bg-white/8" />
              <div className="h-4 rounded-full bg-white/8" />
              <div className="h-4 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
