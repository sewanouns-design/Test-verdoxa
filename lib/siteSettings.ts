import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface SiteSettings {
  siteName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}

const DEFAULTS: SiteSettings = {
  siteName: "Eglise - Evaluations",
  logoUrl: null,
  primaryColor: "#1e2a5e",
  secondaryColor: "#c23b3b",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data } = await supabaseAdmin
      .from("settings")
      .select("site_name, logo_url, primary_color, secondary_color")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return DEFAULTS;

    return {
      siteName: data.site_name || DEFAULTS.siteName,
      logoUrl: data.logo_url || null,
      primaryColor: data.primary_color || DEFAULTS.primaryColor,
      secondaryColor: data.secondary_color || DEFAULTS.secondaryColor,
    };
  } catch {
    return DEFAULTS;
  }
}
