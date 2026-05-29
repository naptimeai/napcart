export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-[2rem] border border-black/5 bg-white/80 p-8">
        <div className="h-4 w-32 rounded-full bg-slate-200" />
        <div className="mt-4 h-12 max-w-3xl rounded-2xl bg-slate-200" />
        <div className="mt-4 h-6 max-w-2xl rounded-2xl bg-slate-100" />
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-[1.7rem] border border-black/5 bg-white/80"
          />
        ))}
      </div>
    </div>
  );
}
