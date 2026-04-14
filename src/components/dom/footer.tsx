import Link from "next/link";
import { getSocials } from "@/lib/queries";
import { FooterSocials } from "./footer-socials";

export async function Footer() {
  const socials = await getSocials();

  return (
    <footer className="border-t border-[var(--color-surface-3)] py-12">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <Link href="/" className="font-display text-lg font-bold text-[var(--color-fg-0)]">
              <span className="text-[var(--color-accent-400)]">Amar</span> Gupta
            </Link>
            <p className="mt-1 font-mono text-xs text-[var(--color-fg-2)]">
              AI-Powered Full Stack Developer
            </p>
          </div>

          <FooterSocials socials={socials} />

          <p className="font-mono text-xs text-[var(--color-fg-3)]">
            &copy; {new Date().getFullYear()} Amar Gupta
          </p>
        </div>
      </div>
    </footer>
  );
}
