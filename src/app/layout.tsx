import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { appUrl } from "@/server/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = { metadataBase: new URL(appUrl()), title: "Restoran", description: "Güncel restoran menüsü ve işletme bilgileri." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr-TR"
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only z-[100] rounded-md bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Ana içeriğe geç</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
