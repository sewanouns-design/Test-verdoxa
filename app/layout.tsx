import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/siteSettings";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.siteName,
    description: "Grandir dans la connaissance de la Parole de Dieu grâce à des quiz et des tests bibliques.",
    icons: {
      icon: "/icon-192.png",
      apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
      capable: true,
      title: settings.siteName,
      statusBarStyle: "default",
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSiteSettings();
  return {
    themeColor: settings.primaryColor,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable}`}
      style={
        {
          "--navy": settings.primaryColor,
          "--red": settings.secondaryColor,
        } as React.CSSProperties
      }
    >
      <body>
        <SiteHeader siteName={settings.siteName} logoUrl={settings.logoUrl} />
        <main className="site-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
