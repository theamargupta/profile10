import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { THEME } from "@/lib/theme/colors";
import "./globals.css";
import "lenis/dist/lenis.css";
import SmoothScrollProvider from "@/components/providers/smooth-scroll";
import CustomCursor from "@/components/providers/custom-cursor";
import GrainOverlay from "@/components/providers/grain-overlay";
import Preloader from "@/components/providers/preloader";
import { Navbar } from "@/components/dom/navbar";
import { Footer } from "@/components/dom/footer";
import { ScrollProgress } from "@/components/dom/scroll-progress";
import FloatingCta from "@/components/dom/floating-cta";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Amar Gupta — AI-Powered Full Stack Developer",
    template: "%s | Amar Gupta",
  },
  description:
    "AI-Powered Full Stack Developer & Technical Consultant. MCP Server Development, LLM Integration, Workflow Automation, System Design. 7+ years experience.",
  metadataBase: new URL("https://amargupta.tech"),
  openGraph: {
    title: "Amar Gupta — AI-Powered Full Stack Developer",
    description:
      "Building AI-powered web applications. MCP Servers, LLM Integration, Workflow Automation.",
    url: "https://amargupta.tech",
    siteName: "Amar Gupta",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amar Gupta — AI-Powered Full Stack Developer",
    description:
      "Building AI-powered web applications. MCP Servers, LLM Integration, Workflow Automation.",
    creator: "@theamargupta",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: THEME.meta.themeColor,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://amargupta.tech/#website",
      url: "https://amargupta.tech",
      name: "Amar Gupta",
      description:
        "AI-Powered Full Stack Developer & Technical Consultant. MCP Server Development, LLM Integration, Workflow Automation.",
      inLanguage: "en-US",
      publisher: { "@id": "https://amargupta.tech/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://amargupta.tech/#person",
      name: "Amar Gupta",
      url: "https://amargupta.tech",
      jobTitle: "AI-Powered Full Stack Developer",
      description:
        "Building AI-powered web applications. MCP Servers, LLM Integration, Workflow Automation. 7+ years experience.",
      image: "https://amargupta.tech/og.png",
      sameAs: [
        "https://github.com/theamargupta",
        "https://www.linkedin.com/in/theamargupta",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-surface-0)] text-[var(--color-fg-0)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-skip-link)] focus:rounded-full focus:bg-[var(--color-accent-400)] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[var(--tracking-wider)] focus:text-[var(--color-surface-0)]"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>
          <CustomCursor />
          <GrainOverlay />
          <Preloader />
          <ScrollProgress />
          <Navbar />
          <main id="main">{children}</main>
          <FloatingCta />
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
