import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeScript } from "@/lib/theme/theme-script";
import { ThemeProvider } from "@/lib/theme/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Workspace — Systems Orchestration",
  description:
    "Production-oriented full-stack Next.js scaffold with AI agent orchestration",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#172632",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
