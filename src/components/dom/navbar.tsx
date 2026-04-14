"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IoMoon, IoSunnyOutline, IoMenu, IoClose } from "react-icons/io5";
import { useTheme } from "@/components/providers/theme-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <nav className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="text-gradient">AG</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-300",
                  pathname === link.href
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 bg-primary" />
                )}
              </Link>
            ))}
            <Link href="/AmarResume.pdf" target="_blank" className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
              CV
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <IoSunnyOutline size={18} />
              ) : (
                <IoMoon size={18} />
              )}
            </button>

            <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
              <Link href="/#contact">Start a Project</Link>
            </Button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-surface md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="glass-panel mx-4 rounded-2xl p-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-lg font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary"
                    : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/AmarResume.pdf"
              target="_blank"
              onClick={() => setMobileOpen(false)}
              className="text-lg font-medium text-foreground/60"
            >
              CV
            </Link>
            <Button variant="primary" size="md" className="mt-2 w-full" asChild>
              <Link href="/#contact" onClick={() => setMobileOpen(false)}>
                Start a Project
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
