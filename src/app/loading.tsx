export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-0)]">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--color-accent-400)] border-t-transparent animate-spin" />
    </div>
  );
}
