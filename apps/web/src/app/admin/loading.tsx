export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="h-4 w-32 rounded-md bg-muted" />
        <div className="mt-4 h-12 max-w-3xl rounded-md bg-muted" />
        <div className="mt-4 h-6 max-w-2xl rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-lg border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
