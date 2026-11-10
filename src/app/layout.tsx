import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
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
    <html lang="en" className={`h-full antialiased ${GeistSans.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F4F5F2] text-[#192E32]">
        {children}
      </body>
    </html>
  );
}
