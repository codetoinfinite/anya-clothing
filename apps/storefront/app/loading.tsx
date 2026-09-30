export default function Loading() {
  return (
    <div className="container-wide py-16 animate-pulse">
      <div className="h-8 w-48 bg-[var(--color-line)] mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-[var(--color-line)]" />
            <div className="mt-3 h-4 w-3/4 bg-[var(--color-line)]" />
            <div className="mt-2 h-4 w-1/3 bg-[var(--color-line)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
