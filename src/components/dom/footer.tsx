import Link from "next/link";
import { getSocials } from "@/lib/queries";
import { FooterSocials } from "./footer-socials";

export async function Footer() {
  const socials = await getSocials();

  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <Link href="/" className="font-display text-lg font-bold">
              <span className="text-gradient">Amar Gupta</span>
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              AI-Powered Full Stack Developer
            </p>
          </div>

          <FooterSocials socials={socials} />

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Amar Gupta
          </p>
        </div>
      </div>
    </footer>
  );
}
