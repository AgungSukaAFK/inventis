export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-xl animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-24 rounded-md bg-muted" />
        <div className="h-4 w-56 rounded-md bg-muted" />
      </div>

      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="h-4 w-52 rounded bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-9 rounded-md bg-muted" />
            <div className="h-9 rounded-md bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-9 rounded-md bg-muted" />
            <div className="h-9 rounded-md bg-muted" />
          </div>
          <div className="flex justify-end">
            <div className="h-8 w-32 rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
