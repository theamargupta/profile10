import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/smooth-scroll";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/dom/navbar";
import { Footer } from "@/components/dom/footer";
import { ScrollProgress } from "@/components/dom/scroll-progress";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SmoothScrollProvider>
          <ThemeProvider>
            <ScrollProgress />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
