"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { IoMenu, IoClose } from "react-icons/io5";
import ShuffleLink from "@/components/ui/shuffle-link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-[var(--color-surface-3)] bg-[var(--color-surface-0)]/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 items-center justify-between" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-[var(--tracking-tight)] text-[var(--color-fg-0)] transition-opacity hover:opacity-80"
          data-cursor="magnet"
        >
          <span className="text-[var(--color-accent-400)]">A</span>G
        </Link>

        {/* Desktop nav with ShuffleLink */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <div key={link.href} className="relative">
              <ShuffleLink
                href={link.href}
                className={cn(
                  "px-4 py-2 font-mono text-xs uppercase tracking-[var(--tracking-wider)] transition-colors duration-300",
                  pathname === link.href
                    ? "text-[var(--color-accent-400)]"
                    : "text-[var(--color-fg-2)] hover:text-[var(--color-fg-0)]"
                )}
              >
                {link.label}
              </ShuffleLink>
              {pathname === link.href && (
                <span className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-[var(--color-accent-400)]" />
              )}
            </div>
          ))}
          <ShuffleLink
            href="/AmarResume.pdf"
            external
            className="px-4 py-2 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] hover:text-[var(--color-fg-0)] transition-colors"
          >
            CV
          </ShuffleLink>
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="hidden h-11 items-center rounded-full border border-[var(--color-surface-4)] px-5 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-0)] transition-colors duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)] md:inline-flex"
            data-cursor="magnet"
          >
            Start a Project
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2 text-[var(--color-fg-2)] transition-colors hover:bg-[var(--color-surface-2)] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-4 rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/70 p-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "font-mono text-sm uppercase tracking-[var(--tracking-wider)] transition-colors",
                  pathname === link.href
                    ? "text-[var(--color-accent-400)]"
                    : "text-[var(--color-fg-2)]"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/AmarResume.pdf"
              target="_blank"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-sm uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)]"
            >
              CV
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex h-14 w-full items-center justify-center rounded-full bg-[var(--color-accent-400)] font-medium text-[var(--color-surface-0)] transition-colors hover:bg-[var(--color-accent-300)]"
            >
              Start a Project
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
