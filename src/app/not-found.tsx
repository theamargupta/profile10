import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="text-center px-6">
        <p className="mb-4 font-mono text-8xl font-bold text-[var(--color-surface-3)]">404</p>
        <h1
          className="mb-4 font-display font-semibold text-[var(--color-fg-0)]"
          style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
        >
          Page Not Found
        </h1>
        <p className="mb-8 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)" }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          data-cursor="magnet"
          className="inline-flex h-14 items-center rounded-full bg-[var(--color-accent-400)] px-8 font-medium text-[var(--color-surface-0)] transition-all duration-300 hover:bg-[var(--color-accent-300)]"
        >
          Back Home
        </Link>
      </div>
    </section>
  );
}
