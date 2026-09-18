import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface SiteSettings {
  siteName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  heroSupport: string;
  introTitle: string;
  introText: string;
  challengeTitle: string;
  challengeText: string;
  signoff: string;
}

const DEFAULTS: SiteSettings = {
  siteName: "Verdoxa",
  logoUrl: null,
  primaryColor: "#0D4B3E",
  secondaryColor: "#F0B93D",
  heroSupport: "Des quiz bibliques vivants, une progression à ton rythme et une communauté qui avance avec toi.",
  introTitle: "La Bible, en mode défi.",
  introText: "Chaque question est une occasion de comprendre, de retenir et d’aller un peu plus loin.",
  challengeTitle: "Prêt à tester ce que tu sais déjà ?",
  challengeText: "Un quiz public ouvert à tous. Pas besoin d’être expert : viens apprendre en jouant.",
  signoff: "Verdoxa — la connaissance qui prend vie.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data } = await supabaseAdmin
      .from("settings")
      .select("site_name, logo_url, primary_color, secondary_color, hero_support, intro_title, intro_text, challenge_title, challenge_text, signoff")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return DEFAULTS;

    return {
      siteName: data.site_name || DEFAULTS.siteName,
      logoUrl: data.logo_url || null,
      primaryColor: data.primary_color || DEFAULTS.primaryColor,
      secondaryColor: data.secondary_color || DEFAULTS.secondaryColor,
      heroSupport: data.hero_support || DEFAULTS.heroSupport,
      introTitle: data.intro_title || DEFAULTS.introTitle,
      introText: data.intro_text || DEFAULTS.introText,
      challengeTitle: data.challenge_title || DEFAULTS.challengeTitle,
      challengeText: data.challenge_text || DEFAULTS.challengeText,
      signoff: data.signoff || DEFAULTS.signoff,
    };
  } catch {
    return DEFAULTS;
  }
}
