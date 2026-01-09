import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUMIERA | Premium Intimate Wellness",
  description:
    "Premium wellness essentials designed for your pleasure and self-discovery. Intimacy, reimagined.",
  keywords: ["wellness", "intimacy", "self-care", "premium", "luxury"],
  openGraph: {
    title: "LUMIERA | Premium Intimate Wellness",
    description:
      "Premium wellness essentials designed for your pleasure and self-discovery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen font-sans text-charcoal bg-cream">
            <LayoutWrapper>{children}</LayoutWrapper>
          </div>
        </Providers>
      </body>
    </html>
  );
}
