
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "Equipora | Equipment Rental Marketplace",
    template: "%s | Equipora",
  },
  description:
    "Rent, discover, and list quality equipment with Equipora. A smarter and more convenient equipment rental marketplace.",
  keywords: [
    "Equipora",
    "Equipment Rental",
    "Equipment Marketplace",
    "Rent Equipment",
    "Equipment Booking",
    "Rental Marketplace",
  ],
  applicationName: "Equipora",
  authors: [{ name: "Equipora" }],
  openGraph: {
    title: "Equipora | Equipment Rental Marketplace",
    description:
      "Discover quality equipment and rent what you need with Equipora.",
    siteName: "Equipora",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#142B3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Navbar />

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
