import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  const shortName =
    settings.siteName.length > 14
      ? settings.siteName.slice(0, 14)
      : settings.siteName;

  return {
    name: settings.siteName,
    short_name: shortName,
    description: "Grandir dans la connaissance de la Parole de Dieu grâce à des quiz et des tests bibliques.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: settings.primaryColor,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [{
      name: "Relever le défi",
      url: "/jouer",
      icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    }],
  };
}
